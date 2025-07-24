// generate-stats.js
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  username: 'ukr-projects', // Replace with your GitHub username
  organizations: ['uikraft-hub', 'notebook-nexus', 'nova-cortex'], // Replace with your organization names
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
      
      // Calculate combined stats (avoiding double counting)
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
    const totalLinesOfCode = await this.getTotalLinesOfCode(repos, CONFIG.username);
    
    this.stats.personal = {
      user: user.data,
      totalRepos: repos.length,
      totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      totalCommits: totalCommits,
      totalIssues: totalIssues,
      totalLinesOfCode: totalLinesOfCode,
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
      const totalLinesOfCode = await this.getTotalLinesOfCode(repos, orgName);
      
      this.stats.organizations[orgName] = {
        org: org.data,
        totalRepos: repos.length,
        totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
        totalCommits: totalCommits,
        totalIssues: totalIssues,
        totalLinesOfCode: totalLinesOfCode,
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
        totalLinesOfCode: 0,
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

  async getTotalLinesOfCode(repos, owner) {
    console.log(`📏 Calculating lines of code for ${owner}...`);
    let totalLines = 0;
    
    // File extensions to consider as code
    const codeExtensions = new Set([
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h', '.hpp',
      '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.sh',
      '.html', '.css', '.scss', '.sass', '.less', '.vue', '.svelte', '.dart',
      '.r', '.m', '.mm', '.pl', '.lua', '.clj', '.hs', '.elm', '.ex', '.exs',
      '.jl', '.nim', '.zig', '.crystal', '.d', '.f90', '.f95', '.pas', '.vb',
      '.sql', '.graphql', '.yaml', '.yml', '.json', '.xml', '.toml', '.ini'
    ]);

    // Filter out empty repositories and forks if configured
    const validRepos = repos.filter(repo => !repo.empty && repo.size > 0);
    
    for (const repo of validRepos.slice(0, 20)) { // Limit to avoid rate limits
      try {
        console.log(`  📂 Processing ${repo.full_name}...`);
        
        // Get repository contents
        const contents = await this.getRepositoryContents(owner, repo.name, '', codeExtensions);
        totalLines += contents;
        
        console.log(`    ✅ Found ${contents} lines in ${repo.full_name}`);
        
        // Add a small delay to avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.warn(`    ❌ Could not fetch contents for ${owner}/${repo.name}:`, error.message);
        continue;
      }
    }
    
    console.log(`📏 Total lines of code for ${owner}: ${totalLines}`);
    return totalLines;
  }

  async getRepositoryContents(owner, repo, path = '', codeExtensions, depth = 0) {
    // Limit recursion depth to avoid infinite loops and excessive API calls
    if (depth > 2) return 0; // Reduced depth for better performance
    
    let totalLines = 0;
    
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: owner,
        repo: repo,
        path: path
      });
      
      const contents = Array.isArray(response.data) ? response.data : [response.data];
      
      for (const item of contents.slice(0, 30)) { // Reduced limit for better performance
        try {
          if (item.type === 'file') {
            // Check if it's a code file
            const ext = this.getFileExtension(item.name).toLowerCase();
            
            if (codeExtensions.has(ext) && item.size && item.size < 500000) { // Reduced max file size
              console.log(`      📄 Analyzing ${item.path} (${item.size} bytes)`);
              
              try {
                // Get file content
                const fileResponse = await this.octokit.rest.repos.getContent({
                  owner: owner,
                  repo: repo,
                  path: item.path
                });
                
                if (fileResponse.data.content && fileResponse.data.encoding === 'base64') {
                  const content = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
                  const lines = content.split(/\r?\n/).filter(line => {
                    const trimmed = line.trim();
                    // Filter out empty lines and common comment-only lines
                    return trimmed.length > 0 && 
                           !trimmed.match(/^\/\/\s*$/) && 
                           !trimmed.match(/^\/\*\s*\*?\/$/) && 
                           !trimmed.match(/^\*\s*$/) &&
                           !trimmed.match(/^#\s*$/) &&
                           !trimmed.match(/^<!--\s*-->$/);
                  });
                  
                  const lineCount = lines.length;
                  totalLines += lineCount;
                  
                  if (lineCount > 0) {
                    console.log(`        ✅ ${lineCount} lines in ${item.name}`);
                  }
                }
              } catch (fileError) {
                console.warn(`        ⚠️ Could not read file ${item.path}:`, fileError.message);
                continue;
              }
            }
          } else if (item.type === 'dir' && depth < 2) {
            // Skip common directories that don't contain source code
            const skipDirs = ['node_modules', '.git', '.github', 'vendor', 'build', 'dist', 'out', 'target', '__pycache__', '.vscode', '.idea'];
            if (!skipDirs.some(skipDir => item.name.toLowerCase().includes(skipDir.toLowerCase()))) {
              // Recursively get contents of subdirectories
              const subdirLines = await this.getRepositoryContents(owner, repo, item.path, codeExtensions, depth + 1);
              totalLines += subdirLines;
            }
          }
        } catch (itemError) {
          console.warn(`        ⚠️ Error processing item ${item.name}:`, itemError.message);
          continue;
        }
      }
      
    } catch (error) {
      console.warn(`      ❌ Could not access repository path ${path}:`, error.message);
      return 0;
    }
    
    return totalLines;
  }

  // Helper method to get file extension
  getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex);
  }

  // Alternative method using GitHub's statistics API (more efficient but less detailed)
  async getTotalLinesOfCodeAlternative(repos, owner) {
    console.log(`📏 Calculating lines of code using GitHub API for ${owner}...`);
    let totalLines = 0;
    
    for (const repo of repos.slice(0, 30)) {
      try {
        // Get repository languages (which includes byte counts)
        const languagesResponse = await this.octokit.rest.repos.listLanguages({
          owner: owner,
          repo: repo.name
        });
        
        // Approximate lines of code based on language bytes
        // This is a rough estimation: average ~50 characters per line
        const repoBytes = Object.values(languagesResponse.data).reduce((sum, bytes) => sum + bytes, 0);
        const estimatedLines = Math.round(repoBytes / 50);
        
        totalLines += estimatedLines;
        
        if (estimatedLines > 0) {
          console.log(`  📂 ${repo.full_name}: ~${estimatedLines} lines (${repoBytes} bytes)`);
        }
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.warn(`Could not fetch languages for ${owner}/${repo.name}:`, error.message);
        continue;
      }
    }
    
    console.log(`📏 Estimated total lines of code for ${owner}: ${totalLines}`);
    return totalLines;
  }
}

  calculateCombinedStats() {
    console.log('🔄 Calculating combined statistics...');
    
    // Start with personal stats as the base
    const combined = {
      totalRepos: this.stats.personal.totalRepos,
      totalStars: this.stats.personal.totalStars,
      totalCommits: this.stats.personal.totalCommits,
      totalIssues: this.stats.personal.totalIssues,
      totalLinesOfCode: this.stats.personal.totalLinesOfCode,
      languages: { ...this.stats.personal.languages }
    };

    // Create a set of personal repository full names for deduplication
    const personalRepoNames = new Set(
      this.stats.personal.repositories.map(repo => repo.full_name.toLowerCase())
    );

    // Add organization stats, avoiding double counting
    for (const orgStats of Object.values(this.stats.organizations)) {
      if (orgStats.error) continue;
      
      // Filter out repositories that are already counted in personal stats
      const uniqueOrgRepos = orgStats.repositories.filter(repo => 
        !personalRepoNames.has(repo.full_name.toLowerCase())
      );
      
      // Calculate stats only for unique org repositories
      const uniqueOrgStars = uniqueOrgRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      
      // Add only unique organization repositories to combined stats
      combined.totalRepos += uniqueOrgRepos.length;
      combined.totalStars += uniqueOrgStars;
      
      // For commits, issues, and lines of code, we need to be more careful since we only sampled some repos
      // We'll calculate the ratio and apply it
      if (orgStats.repositories.length > 0) {
        const sampledRepos = Math.min(30, orgStats.repositories.length);
        const uniqueSampledRepos = orgStats.repositories.slice(0, sampledRepos).filter(repo => 
          !personalRepoNames.has(repo.full_name.toLowerCase())
        );
        
        if (uniqueSampledRepos.length > 0) {
          const ratio = uniqueOrgRepos.length / orgStats.repositories.length;
          combined.totalCommits += Math.round(orgStats.totalCommits * ratio);
          combined.totalIssues += Math.round(orgStats.totalIssues * ratio);
          combined.totalLinesOfCode += Math.round(orgStats.totalLinesOfCode * ratio);
        }
      }
      
      // Merge languages (only from unique repos)
      // Note: This is an approximation since we can't easily separate language stats per repo
      const orgLanguageRatio = uniqueOrgRepos.length / (orgStats.repositories.length || 1);
      for (const [lang, bytes] of Object.entries(orgStats.languages)) {
        const adjustedBytes = Math.round(bytes * orgLanguageRatio);
        combined.languages[lang] = (combined.languages[lang] || 0) + adjustedBytes;
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
    
    return `<svg width="495" height="215" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${theme.primary};stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:${theme.accent};stop-opacity:0.1" />
        </linearGradient>
      </defs>
      
      <rect width="495" height="215" rx="4.5" fill="${theme.background}" stroke="${theme.primary}" stroke-width="1"/>
      <rect x="0" y="0" width="495" height="215" rx="4.5" fill="url(#gradient)"/>
      
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
      <text x="25" y="145" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        📏 Total Lines of Code: ${stats.totalLinesOfCode.toLocaleString()}
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
      <text x="270" y="145" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        📏 Personal LoC: ${this.stats.personal.totalLinesOfCode.toLocaleString()}
      </text>
      
      <text x="25" y="185" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="12" fill="${theme.secondary}">
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
    
    let svg = `<svg width="495" height="${140 + (Object.keys(this.stats.organizations).length * 100)}" xmlns="http://www.w3.org/2000/svg">
      <rect width="495" height="${140 + (Object.keys(this.stats.organizations).length * 100)}" rx="4.5" fill="${theme.background}" stroke="${theme.primary}" stroke-width="1"/>
      
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
      </text>
      <text x="25" y="${yOffset + 60}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
        📏 ${this.stats.personal.totalLinesOfCode.toLocaleString()} lines of code
      </text>`;
    
    yOffset += 90;
    
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
          </text>
          <text x="25" y="${yOffset + 60}" font-family="'Segoe UI', Ubuntu, sans-serif" font-size="14" fill="${theme.text}">
            📏 ${orgStats.totalLinesOfCode.toLocaleString()} lines of code
          </text>`;
      }
      yOffset += 100;
    }
    
    svg += `</svg>`;
    return svg;
  }

  generateReadmeSection() {
    console.log('📝 Generating README section...');
    
    // Calculate unique organization stats (excluding duplicates from personal)
    const personalRepoNames = new Set(
      this.stats.personal.repositories.map(repo => repo.full_name.toLowerCase())
    );
    
    let uniqueOrgRepos = 0;
    let uniqueOrgStars = 0;
    let uniqueOrgCommits = 0;
    let uniqueOrgIssues = 0;
    let uniqueOrgLinesOfCode = 0;
    
    for (const orgStats of Object.values(this.stats.organizations)) {
      if (orgStats.error) continue;
      
      const uniqueRepos = orgStats.repositories.filter(repo => 
        !personalRepoNames.has(repo.full_name.toLowerCase())
      );
      
      uniqueOrgRepos += uniqueRepos.length;
      uniqueOrgStars += uniqueRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      
      // Estimate commits, issues, and lines of code for unique repos
      if (orgStats.repositories.length > 0) {
        const ratio = uniqueRepos.length / orgStats.repositories.length;
        uniqueOrgCommits += Math.round(orgStats.totalCommits * ratio);
        uniqueOrgIssues += Math.round(orgStats.totalIssues * ratio);
        uniqueOrgLinesOfCode += Math.round(orgStats.totalLinesOfCode * ratio);
      }
    }
    
    const readmeContent = `<!-- GitHub Stats - Auto Generated -->
<div align="center">

# 🚀 Complete GitHub Analytics

![GitHub Stats](./assets/github-stats.svg)
![Languages](./assets/languages.svg)
![Organizations](./assets/organizations.svg)

## 📊 Quick Overview

| Metric | Personal | Organizations (Unique) | **Total** |
|--------|----------|------------------------|-----------|
| 📚 Repositories | ${this.stats.personal.totalRepos} | ${uniqueOrgRepos} | **${this.stats.combined.totalRepos}** |
| ⭐ Stars | ${this.stats.personal.totalStars} | ${uniqueOrgStars} | **${this.stats.combined.totalStars}** |
| 💻 Commits | ${this.stats.personal.totalCommits} | ${uniqueOrgCommits} | **${this.stats.combined.totalCommits}** |
| 🐛 Issues | ${this.stats.personal.totalIssues} | ${uniqueOrgIssues} | **${this.stats.combined.totalIssues}** |
| 📏 Lines of Code | ${this.stats.personal.totalLinesOfCode.toLocaleString()} | ${uniqueOrgLinesOfCode.toLocaleString()} | **${this.stats.combined.totalLinesOfCode.toLocaleString()}** |

*Note: Organization stats exclude repositories already counted in personal stats to avoid double counting.*

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
