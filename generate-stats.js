// generate-stats.js
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  username: 'ukr-projects', // Replace with your GitHub username
  organizations: ['uikraft-hub', 'notebook-nexus'], // Replace with your organization names
  includePrivate: true,
  includeForks: false,
  theme: {
    background: '#1a1b27',
    primary: '#70a5fd',
    secondary: '#38bdae',
    accent: '#bf91f3',
    text: '#c9d1d9'
  }
};

class GitHubStatsGenerator {
  constructor() {
    this.stats = {
      personal: {},
      organizations: {},
      combined: {},
      languages: {},
      recentActivity: []
    };
    this.octokit = null;
  }

  async initialize() {
    // Dynamic import for ES modules
    const { Octokit } = await import('@octokit/rest');
    
    this.octokit = new Octokit({
      auth: process.env.PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN,
    });
  }

  async generateAllStats() {
    console.log('🚀 Starting GitHub stats generation...');
    
    try {
      // Initialize Octokit with dynamic import
      await this.initialize();
      
      // Get personal stats
      await this.getPersonalStats();
      
      // Get organization stats
      for (const org of CONFIG.organizations) {
        await this.getOrganizationStats(org);
      }
      
      // Calculate combined stats
      this.calculateCombinedStats();
      
      // Generate SVG cards
      await this.generateSVGCards();
      
      // Generate README section
      this.generateReadmeSection();
      
      console.log('✅ GitHub stats generation completed successfully!');
      
    } catch (error) {
      console.error('❌ Error generating stats:', error);
      process.exit(1);
    }
  }

  async getPersonalStats() {
    console.log(`📊 Fetching personal stats for ${CONFIG.username}...`);
    
    const user = await this.octokit.rest.users.getByUsername({
      username: CONFIG.username
    });

    const repos = await this.getAllRepos(CONFIG.username);
    const languages = await this.getLanguageStats(repos, CONFIG.username);
    const { totalCommits, totalIssues } = await this.getCommitsAndIssues(repos, CONFIG.username);
    
    this.stats.personal = {
      user: user.data,
      totalRepos: repos.length,
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalCommits: totalCommits,
      totalIssues: totalIssues,
      languages: languages,
      repositories: repos
    };
  }

  async getOrganizationStats(orgName) {
    console.log(`🏢 Fetching organization stats for ${orgName}...`);
    
    try {
      const org = await this.octokit.rest.orgs.get({
        org: orgName
      });

      const repos = await this.getAllRepos(orgName, true);
      const languages = await this.getLanguageStats(repos, orgName);
      const { totalCommits, totalIssues } = await this.getCommitsAndIssues(repos, orgName);
      
      this.stats.organizations[orgName] = {
        org: org.data,
        totalRepos: repos.length,
        totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
        totalCommits: totalCommits,
        totalIssues: totalIssues,
        languages: languages,
        repositories: repos
      };
      
    } catch (error) {
      console.warn(`⚠️ Could not fetch organization ${orgName}:`, error.message);
      this.stats.organizations[orgName] = {
        error: error.message,
        totalRepos: 0,
        totalStars: 0,
        totalCommits: 0,
        totalIssues: 0,
        languages: {},
        repositories: []
      };
    }
  }

  async getAllRepos(owner, isOrg = false) {
    const repos = [];
    let page = 1;
    
    while (true) {
      const response = isOrg 
        ? await this.octokit.rest.repos.listForOrg({
            org: owner,
            type: 'all',
            per_page: 100,
            page
          })
        : await this.octokit.rest.repos.listForUser({
            username: owner,
            type: 'all',
            per_page: 100,
            page
          });
      
      if (response.data.length === 0) break;
      
      const filteredRepos = response.data.filter(repo => {
        if (!CONFIG.includeForks && repo.fork) return false;
        return true;
      });
      
      repos.push(...filteredRepos);
      page++;
    }
    
    return repos;
  }

  async getLanguageStats(repos, owner) {
    const languages = {};
    
    for (const repo of repos.slice(0, 50)) { // Limit to avoid rate limits
      try {
        const response = await this.octokit.rest.repos.listLanguages({
          owner: owner,
          repo: repo.name
        });
        
        for (const [lang, bytes] of Object.entries(response.data)) {
          languages[lang] = (languages[lang] || 0) + bytes;
        }
      } catch (error) {
        // Skip repos we can't access
        continue;
      }
    }
    
    return languages;
  }

  async getCommitsAndIssues(repos, owner) {
    let totalCommits = 0;
    let totalIssues = 0;
    
    for (const repo of repos.slice(0, 30)) { // Limit to avoid rate limits
      try {
        // Get commits count
        try {
          const commitsResponse = await this.octokit.rest.repos.listCommits({
            owner: owner,
            repo: repo.name,
            per_page: 1
          });
          
          // Get total count from the last page link in headers
          const linkHeader = commitsResponse.headers.link;
          if (linkHeader) {
            const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (lastPageMatch) {
              totalCommits += parseInt(lastPageMatch[1]);
            } else {
              totalCommits += commitsResponse.data.length;
            }
          } else {
            totalCommits += commitsResponse.data.length;
          }
        } catch (commitError) {
          // If we can't get commits, skip this repo
          console.warn(`Could not fetch commits for ${owner}/${repo.name}`);
        }
        
        // Get issues count (includes pull requests)
        try {
          const issuesResponse = await this.octokit.rest.issues.listForRepo({
            owner: owner,
            repo: repo.name,
            state: 'all',
            per_page: 1
          });
          
          // Get total count from the last page link in headers
          const linkHeader = issuesResponse.headers.link;
          if (linkHeader) {
            const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
            if (lastPageMatch) {
              totalIssues += parseInt(lastPageMatch[1]);
            } else {
              totalIssues += issuesResponse.data.length;
            }
          } else {
            totalIssues += issuesResponse.data.length;
          }
        } catch (issuesError) {
          // If we can't get issues, skip this repo
          console.warn(`Could not fetch issues for ${owner}/${repo.name}`);
        }
        
      } catch (error) {
        // Skip repos we can't access
        continue;
      }
    }
    
    return { totalCommits, totalIssues };
  }

  calculateCombinedStats() {
    console.log('🔄 Calculating combined statistics...');
    
    const combined = {
      totalRepos: this.stats.personal.totalRepos,
      totalStars: this.stats.personal.totalStars,
      totalCommits: this.stats.personal.totalCommits,
      totalIssues: this.stats.personal.totalIssues,
      languages: { ...this.stats.personal.languages }
    };

    // Add organization stats
    for (const orgStats of Object.values(this.stats.organizations)) {
      if (orgStats.error) continue;
      
      combined.totalRepos += orgStats.totalRepos;
      combined.totalStars += orgStats.totalStars;
      combined.totalCommits += orgStats.totalCommits;
      combined.totalIssues += orgStats.totalIssues;
      
      // Merge languages
      for (const [lang, bytes] of Object.entries(orgStats.languages)) {
        combined.languages[lang] = (combined.languages[lang] || 0) + bytes;
      }
    }

    this.stats.combined = combined;
  }

  async generateSVGCards() {
    console.log('🎨 Generating SVG cards...');
    
    // Create assets directory
    if (!fs.existsSync('assets')) {
      fs.mkdirSync('assets');
    }

    // Generate overview card
    const overviewSVG = this.createOverviewCard();
    fs.writeFileSync('assets/github-stats.svg', overviewSVG);

    // Generate languages card
    const languagesSVG = this.createLanguagesCard();
    fs.writeFileSync('assets/languages.svg', languagesSVG);

    // Generate organizations breakdown
    const orgsSVG = this.createOrganizationsCard();
    fs.writeFileSync('assets/organizations.svg', orgsSVG);
  }

  createOverviewCard() {
    const stats = this.stats.combined;
    const theme = CONFIG.theme;
    
    return `<svg width="495" height="195" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.primary};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${theme.accent};stop-opacity:0.1" />
        </linearGradient>
      </defs>
      
      <rect width="495" height="195" rx="4.5" fill="${theme.background}" stroke="${theme.primary}" stroke-width="1"/>
      <rect x="0" y="0" width="495" height="195" rx="4.5" fill="url(#gradient)"/>
      
      <text x="25" y="35" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="18" font-weight="600" fill="${theme.primary}">
        🚀 Complete GitHub Statistics
      </text>
      
      <text x="25" y="65" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        📊 Total Repositories: ${stats.totalRepos}
      </text>
      <text x="25" y="85" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        ⭐ Total Stars: ${stats.totalStars}
      </text>
      <text x="25" y="105" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        💻 Total Commits: ${stats.totalCommits}
      </text>
      <text x="25" y="125" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        🐛 Total Issues: ${stats.totalIssues}
      </text>
      
      <text x="270" y="65" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        🏠 Personal: ${this.stats.personal.totalRepos} repos, ${this.stats.personal.totalStars} stars
      </text>
      <text x="270" y="85" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        🏢 Organizations: ${Object.keys(this.stats.organizations).length} orgs
      </text>
      <text x="270" y="105" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        💻 Personal Commits: ${this.stats.personal.totalCommits}
      </text>
      <text x="270" y="125" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        🐛 Personal Issues: ${this.stats.personal.totalIssues}
      </text>
      
      <text x="25" y="165" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="12" fill="${theme.secondary}">
        🔄 Last updated: ${new Date().toISOString().split('T')[0]}
      </text>
    </svg>`;
  }

  createLanguagesCard() {
    const languages = this.stats.combined.languages;
    const sortedLangs = Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);
    
    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    const theme = CONFIG.theme;
    
    let svg = `<svg width="495" height="285" xmlns="http://www.w3.org/2000/svg">
      <rect width="495" height="285" rx="4.5" fill="${theme.background}" stroke="${theme.primary}" stroke-width="1"/>
      
      <text x="25" y="35" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="18" font-weight="600" fill="${theme.primary}">
        💻 Most Used Languages (Combined)
      </text>`;
    
    sortedLangs.forEach(([lang, bytes], index) => {
      const percentage = ((bytes / total) * 100).toFixed(1);
      const y = 70 + (index * 25);
      const barWidth = (percentage / 100) * 350;
      
      svg += `
        <text x="25" y="${y}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
          ${lang}
        </text>
        <text x="450" y="${y}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="12" fill="${theme.secondary}" text-anchor="end">
          ${percentage}%
        </text>
        <rect x="25" y="${y + 5}" width="${barWidth}" height="8" rx="4" fill="${theme.primary}" opacity="0.8"/>
      `;
    });
    
    svg += `</svg>`;
    return svg;
  }

  createOrganizationsCard() {
    const theme = CONFIG.theme;
    
    let svg = `<svg width="495" height="${120 + (Object.keys(this.stats.organizations).length * 80)}" xmlns="http://www.w3.org/2000/svg">
      <rect width="495" height="${120 + (Object.keys(this.stats.organizations).length * 80)}" rx="4.5" fill="${theme.background}" stroke="${theme.primary}" stroke-width="1"/>
      
      <text x="25" y="35" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="18" font-weight="600" fill="${theme.primary}">
        🏢 Organizations Breakdown
      </text>`;
    
    let yOffset = 70;
    
    // Personal stats
    svg += `
      <text x="25" y="${yOffset}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="16" font-weight="600" fill="${theme.secondary}">
        👤 Personal (${CONFIG.username})
      </text>
      <text x="25" y="${yOffset + 20}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        📊 ${this.stats.personal.totalRepos} repos • ⭐ ${this.stats.personal.totalStars} stars
      </text>
      <text x="25" y="${yOffset + 40}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        💻 ${this.stats.personal.totalCommits} commits • 🐛 ${this.stats.personal.totalIssues} issues
      </text>`;
    
    yOffset += 70;
    
    // Organization stats
    for (const [orgName, orgStats] of Object.entries(this.stats.organizations)) {
      if (orgStats.error) {
        svg += `
          <text x="25" y="${yOffset}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="16" font-weight="600" fill="${theme.accent}">
            🏢 ${orgName}
          </text>
          <text x="25" y="${yOffset + 20}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
            ❌ Access limited or private organization
          </text>`;
      } else {
        svg += `
          <text x="25" y="${yOffset}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="16" font-weight="600" fill="${theme.accent}">
            🏢 ${orgName}
          </text>
          <text x="25" y="${yOffset + 20}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
            📊 ${orgStats.totalRepos} repos • ⭐ ${orgStats.totalStars} stars
          </text>
          <text x="25" y="${yOffset + 40}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
            💻 ${orgStats.totalCommits} commits • 🐛 ${orgStats.totalIssues} issues
          </text>`;
      }
      yOffset += 80;
    }
    
    svg += `</svg>`;
    return svg;
  }

  generateReadmeSection() {
    console.log('📝 Generating README section...');
    
    const orgRepos = Object.values(this.stats.organizations)
      .filter(org => !org.error)
      .reduce((sum, org) => sum + org.totalRepos, 0);
    const orgStars = Object.values(this.stats.organizations)
      .filter(org => !org.error)
      .reduce((sum, org) => sum + org.totalStars, 0);
    const orgCommits = Object.values(this.stats.organizations)
      .filter(org => !org.error)
      .reduce((sum, org) => sum + org.totalCommits, 0);
    const orgIssues = Object.values(this.stats.organizations)
      .filter(org => !org.error)
      .reduce((sum, org) => sum + org.totalIssues, 0);
    
    const readmeContent = `<!-- GitHub Stats - Auto Generated -->
<div align="center">

# 🚀 Complete GitHub Analytics

![GitHub Stats](./assets/github-stats.svg)
![Languages](./assets/languages.svg)
![Organizations](./assets/organizations.svg)

## 📊 Quick Overview

| Metric | Personal | Organizations | **Total** |
|--------|----------|---------------|-----------|
| 📚 Repositories | ${this.stats.personal.totalRepos} | ${orgRepos} | **${this.stats.combined.totalRepos}** |
| ⭐ Stars | ${this.stats.personal.totalStars} | ${orgStars} | **${this.stats.combined.totalStars}** |
| 💻 Commits | ${this.stats.personal.totalCommits} | ${orgCommits} | **${this.stats.combined.totalCommits}** |
| 🐛 Issues | ${this.stats.personal.totalIssues} | ${orgIssues} | **${this.stats.combined.totalIssues}** |

*Last updated: ${new Date().toISOString().split('T')[0]}*

</div>
<!-- End GitHub Stats -->
`;

    fs.writeFileSync('README-stats.md', readmeContent);
  }
}

// Run the generator
async function main() {
  const generator = new GitHubStatsGenerator();
  await generator.generateAllStats();
}

main().catch(console.error);
