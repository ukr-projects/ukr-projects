# GitHub Stats Generator - Usage Guide

A comprehensive guide on how to use the GitHub Stats Generator to create professional, custom SVG statistics cards for your GitHub profile and repositories.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Step-by-Step Setup](#step-by-step-setup)
- [Personal Access Token Setup](#personal-access-token-setup)
- [Configuration Guide](#configuration-guide)
- [Repository Structure](#repository-structure)
- [Understanding the Generated Cards](#understanding-the-generated-cards)
- [Customization Options](#customization-options)
- [Automation with GitHub Actions](#automation-with-github-actions)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The GitHub Stats Generator is a powerful Node.js script that creates beautiful, customizable SVG cards displaying comprehensive GitHub statistics. It provides:

- **Comprehensive Statistics**: Personal repos, organizations, commits, issues, lines of code
- **Beautiful SVG Cards**: Professional-looking cards with customizable themes
- **Organization Support**: Combines stats from multiple organizations
- **Automated Updates**: GitHub Actions workflow for daily updates
- **Smart Deduplication**: Avoids counting repositories twice across personal and organization accounts
- **Language Analysis**: Detailed breakdown of programming languages used

## Quick Start

### Method 1: Use as Template Repository

1. **Navigate to the repository**: Go to [ukr-projects/ukr-projects](https://github.com/ukr-projects/ukr-projects)
2. **Click "Use this template"**: Look for the green button at the top of the repository
3. **Create new repository**: Name it as your GitHub username (e.g., `yourusername/yourusername`)
4. **Choose public visibility**: Required for GitHub profile README
5. **Create repository**: Click "Create repository from template"

### Method 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/ukr-projects/ukr-projects.git yourusername
cd yourusername

# Remove original git history
rm -rf .git

# Initialize new repository
git init
git remote add origin https://github.com/yourusername/yourusername.git
```

## Step-by-Step Setup

### 1. Repository Creation

For the GitHub profile README to work, your repository must be named exactly as your GitHub username:

```bash
# Example: If your username is "johndoe"
Repository name: johndoe/johndoe
```

### 2. Download and Setup Files

Your repository structure should match the provided template:

```
yourusername/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── RELEASE_TEMPLATE.md
│   └── workflows/
│       └── github-stats.yml
├── docs/
│   ├── CHANGELOG.md
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   ├── README.md
│   ├── SECURITY.md
│   ├── STATUS.md
│   └── USAGE.md
├── LICENSE
├── src/
│   ├── assets/                    # Generated files location
│   │   ├── github-stats.svg       # Overview statistics card
│   │   ├── languages.svg          # Programming languages card
│   │   ├── organizations.svg      # Organizations breakdown card
│   │   └── github-stats-section.md # Markdown section for README
│   ├── generate-stats.js          # Main generator script
│   ├── node_modules/              # NPM dependencies
│   ├── package.json               # Node.js configuration
│   └── package-lock.json          # Dependency lock file
└── README.md                      # Your profile README
```

### 3. Configure the Generator

Edit `src/generate-stats.js` and update the configuration:

```javascript
const CONFIG = {
  username: 'yourusername',           // Replace with YOUR GitHub username
  organizations: ['org1', 'org2'],    // Replace with YOUR organization names
  includePrivate: true,               // Include private repos (requires token)
  includeForks: false,                // Exclude forked repositories
  theme: {
    background: '#1a1b27',            // Customize colors
    primary: '#70a5fd',
    secondary: '#38bdae',
    accent: '#bf91f3',
    text: '#c9d1d9'
  }
};
```

### 4. Install Dependencies

```bash
cd src
npm init -y
npm install @octokit/rest
```

## Personal Access Token Setup

### Why You Need a Token

The GitHub API has rate limits for unauthenticated requests. A Personal Access Token (PAT) provides:
- Higher rate limits (5,000 requests/hour vs 60)
- Access to private repositories
- Access to organization data
- Detailed statistics collection

### Creating a Personal Access Token

#### Step 1: Access GitHub Settings
1. Go to GitHub.com and sign in
2. Click your profile picture (top right)
3. Select **"Settings"**
4. Scroll down to **"Developer settings"** (left sidebar)
5. Click **"Personal access tokens"**
6. Select **"Tokens (classic)"**

#### Step 2: Generate New Token
1. Click **"Generate new token"** → **"Generate new token (classic)"**
2. Add a descriptive note: `GitHub Stats Generator`
3. Set expiration (recommend: 90 days or longer)

#### Step 3: Select Permissions
Select the following scopes:

**Essential Permissions:**
- ✅ `repo` - Full control of private repositories
  - Enables access to private repos and detailed statistics
- ✅ `read:org` - Read organization membership
  - Required for organization statistics
- ✅ `read:user` - Read user profile data
  - For comprehensive user information

**Optional (for enhanced features):**
- ✅ `read:project` - Read projects
- ✅ `read:packages` - Read packages

#### Step 4: Generate and Save Token
1. Click **"Generate token"**
2. **⚠️ IMPORTANT**: Copy the token immediately (it won't be shown again)
3. Store it securely - you'll need it for the next step

### Adding Token to Repository

#### Method 1: GitHub Repository Secrets (Recommended)
1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Select **"Secrets and variables"** → **"Actions"**
4. Click **"New repository secret"**
5. Name: `PERSONAL_ACCESS_TOKEN`
6. Value: Paste your token
7. Click **"Add secret"**

#### Method 2: Environment Variable (Local Testing)
```bash
# For local testing only - DO NOT commit to repository
export PERSONAL_ACCESS_TOKEN=your_token_here
```

### Token Security Best Practices

**✅ DO:**
- Use repository secrets for production
- Set appropriate expiration dates
- Use minimal required permissions
- Regularly rotate tokens
- Monitor token usage in GitHub settings

**❌ DON'T:**
- Commit tokens to code
- Share tokens in public channels
- Use tokens with excessive permissions
- Leave tokens without expiration

## Configuration Guide

### Basic Configuration

Update the `CONFIG` object in `src/generate-stats.js`:

```javascript
const CONFIG = {
  // Your GitHub username (must match exactly)
  username: 'yourusername',
  
  // Organizations you're part of (leave empty array if none)
  organizations: ['company-org', 'open-source-org'],
  
  // Repository filtering
  includePrivate: true,    // Include private repositories
  includeForks: false,     // Exclude forked repositories
  
  // Visual customization
  theme: {
    background: '#1a1b27',  // Card background color
    primary: '#70a5fd',     // Primary accent color
    secondary: '#38bdae',   // Secondary accent color
    accent: '#bf91f3',      // Highlight color
    text: '#c9d1d9'         // Text color
  }
};
```

### Advanced Configuration Options

#### Custom Color Themes

**Dark Theme (Default):**
```javascript
theme: {
  background: '#1a1b27',
  primary: '#70a5fd',
  secondary: '#38bdae',
  accent: '#bf91f3',
  text: '#c9d1d9'
}
```

**Light Theme:**
```javascript
theme: {
  background: '#ffffff',
  primary: '#0366d6',
  secondary: '#28a745',
  accent: '#6f42c1',
  text: '#24292e'
}
```

**Custom GitHub-like Theme:**
```javascript
theme: {
  background: '#0d1117',
  primary: '#58a6ff',
  secondary: '#3fb950',
  accent: '#f85149',
  text: '#f0f6fc'
}
```

#### Organization Configuration

```javascript
// Example with multiple organizations
organizations: [
  'your-company',           // Company organization
  'open-source-project',    // Open source projects
  'side-project-org'        // Personal projects organization
]

// No organizations
organizations: []
```

## Repository Structure

After setup and first run, your repository will have this structure based on the ukr-projects template:

```
yourusername/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md              # Bug report template
│   │   └── feature_request.md         # Feature request template
│   ├── PULL_REQUEST_TEMPLATE.md       # PR template
│   ├── RELEASE_TEMPLATE.md            # Release template
│   └── workflows/
│       └── github-stats.yml           # GitHub Actions workflow
├── docs/
│   ├── CHANGELOG.md                   # Change log
│   ├── CODE_OF_CONDUCT.md            # Code of conduct
│   ├── CONTRIBUTING.md               # Contributing guidelines
│   ├── README.md                     # Documentation
│   ├── SECURITY.md                   # Security policy
│   ├── STATUS.md                     # Project status
│   └── USAGE.md                      # This usage guide
├── LICENSE                           # Repository license
├── src/
│   ├── assets/                       # Generated assets directory
│   │   ├── github-stats.svg          # Overview statistics card
│   │   ├── languages.svg             # Programming languages card
│   │   ├── organizations.svg         # Organizations breakdown card
│   │   └── github-stats-section.md   # Markdown section for README
│   ├── generate-stats.js             # Main generator script
│   ├── node_modules/                 # NPM dependencies
│   │   └── @octokit/                 # Octokit GitHub API client
│   ├── package.json                  # Node.js configuration
│   └── package-lock.json             # Dependency lock file
└── README.md                         # Your profile README
```

## Understanding the Generated Cards

### 1. Overview Card (`src/assets/github-stats.svg`)

**Displays:**
- 📊 Total Repositories (personal + unique organization repos)
- ⭐ Total Stars across all repositories
- 💻 Total Commits (estimated from sampled repositories)
- 🐛 Total Issues created/participated in
- 📏 Total Lines of Code (analyzed from source files)
- 🏠 Personal statistics breakdown
- 🏢 Organization count and summary

**Usage in README:**
```markdown
![GitHub Stats](./src/assets/github-stats.svg)
```

### 2. Languages Card (`src/assets/languages.svg`)

**Displays:**
- Top 8 programming languages by bytes of code
- Percentage breakdown of language usage
- Combined statistics from personal and organization repositories
- Visual progress bars for each language

**Usage in README:**
```markdown
![Languages](./src/assets/languages.svg)
```

### 3. Organizations Card (`src/assets/organizations.svg`)

**Displays:**
- Personal account statistics
- Individual organization breakdowns
- Repository counts, stars, commits per organization
- Lines of code per organization
- Error handling for inaccessible organizations

**Usage in README:**
```markdown
![Organizations](./src/assets/organizations.svg)
```

### 4. Markdown Section (`src/assets/github-stats-section.md`)

**Contains:**
- Formatted table with comprehensive statistics
- Personal vs. Organization breakdown
- Combined totals with deduplication
- Ready-to-copy markdown for your README

## Customization Options

### Visual Customization

#### SVG Dimensions
Modify card dimensions in the generator functions:

```javascript
// In createOverviewCard()
<svg width="495" height="215" xmlns="http://www.w3.org/2000/svg">

// Custom size
<svg width="600" height="250" xmlns="http://www.w3.org/2000/svg">
```

#### Font Customization
```javascript
// Change font family
font-family="'Segoe UI', Ubuntu, sans-serif"

// Use custom fonts
font-family="'JetBrains Mono', monospace"
```

#### Color Gradients
```javascript
// Add custom gradients
<defs>
  <linearGradient id="customGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:0.8" />
    <stop offset="100%" style="stop-color:#4ecdc4;stop-opacity:0.8" />
  </linearGradient>
</defs>
```

### Data Customization

#### Filtering Options
```javascript
// In getAllRepos method, add custom filtering
const filteredRepos = response.data.filter(repo => {
  if (!CONFIG.includeForks && repo.fork) return false;
  if (repo.archived) return false;        // Exclude archived repos
  if (repo.size === 0) return false;      // Exclude empty repos
  return true;
});
```

#### Metrics Selection
```javascript
// Customize which metrics to calculate
const metrics = {
  calculateCommits: true,
  calculateIssues: true,
  calculateLinesOfCode: true,
  calculateLanguages: true
};
```

## Automation with GitHub Actions

### Workflow Configuration

The included `github-stats.yml` workflow provides:

- **Scheduled Updates**: Runs daily at midnight UTC
- **Manual Triggers**: Can be run manually via GitHub Actions tab
- **Push Triggers**: Updates on pushes to main branch
- **Automatic Commits**: Commits generated files back to repository

### Workflow Schedule Options

```yaml
# Daily at midnight UTC
- cron: '0 0 * * *'

# Every 6 hours
- cron: '0 */6 * * *'

# Weekly on Sundays
- cron: '0 0 * * 0'

# Monthly on the 1st
- cron: '0 0 1 * *'
```

### Manual Workflow Triggers

1. Go to your repository on GitHub
2. Click **"Actions"** tab
3. Select **"Generate GitHub Stats"** workflow
4. Click **"Run workflow"** button
5. Confirm by clicking **"Run workflow"**

### Monitoring Workflow Runs

1. **Actions Tab**: View all workflow runs and their status
2. **Workflow Logs**: Click on any run to see detailed logs
3. **Error Notifications**: GitHub will email you if workflows fail
4. **Status Badges**: Add workflow status badges to your README

```markdown
![GitHub Stats Workflow](https://github.com/yourusername/yourusername/actions/workflows/github-stats.yml/badge.svg)
```

## Best Practices

### Performance Optimization

1. **Rate Limit Management**:
   ```javascript
   // Add delays between API calls
   await new Promise(resolve => setTimeout(resolve, 200));
   ```

2. **Repository Sampling**:
   ```javascript
   // Limit repositories processed to avoid timeouts
   for (const repo of repos.slice(0, 50)) {
   ```

3. **Caching Strategy**:
   - Use GitHub Actions cache for dependencies
   - Store intermediate results when possible

### Security Best Practices

1. **Token Security**:
   - Always use repository secrets
   - Never commit tokens to code
   - Regularly rotate tokens
   - Use minimum required permissions

2. **Repository Settings**:
   - Keep the stats repository public for profile README
   - Use private repositories for sensitive configurations

### README Integration

#### Full Integration Example:

```markdown
# Hi there! 👋 I'm [Your Name]

<!-- GitHub Stats Cards -->
<div align="center">

## 📊 GitHub Statistics

![GitHub Stats](./src/assets/github-stats.svg)

![Programming Languages](./src/assets/languages.svg)

![Organizations](./src/assets/organizations.svg)

</div>

<!-- Auto-generated stats table -->
<!-- GitHub Stats - Auto Generated -->
<div align="center">

# 🚀 Complete GitHub Analytics

![GitHub Stats](./src/assets/github-stats.svg)
![Languages](./src/assets/languages.svg)
![Organizations](./src/assets/organizations.svg)

## 📊 Quick Overview

| Metric | Personal | Organizations (Unique) | **Total** |
|--------|----------|------------------------|-----------|
| 📚 Repositories | 45 | 23 | **68** |
| ⭐ Stars | 234 | 456 | **690** |
| 💻 Commits | 1,234 | 2,345 | **3,579** |
| 🐛 Issues | 89 | 156 | **245** |
| 📏 Lines of Code | 123,456 | 234,567 | **358,023** |

*Note: Organization stats exclude repositories already counted in personal stats to avoid double counting.*

*Last updated: 2024-07-26*

</div>
<!-- End GitHub Stats -->
```

## Troubleshooting

### Common Issues and Solutions

#### 1. "API rate limit exceeded" Error

**Problem**: Too many API requests without authentication
**Solution**: 
```bash
# Ensure your token is properly set
echo $PERSONAL_ACCESS_TOKEN  # Should show your token

# Check token permissions in GitHub Settings > Developer settings
```

#### 2. "Repository not found" or "403 Forbidden"

**Problem**: Insufficient permissions or incorrect organization names
**Solution**:
```javascript
// Verify organization names in CONFIG
organizations: ['correct-org-name']  # Check exact spelling

// Ensure token has 'read:org' permission
```

#### 3. SVG Files Not Updating

**Problem**: Workflow runs but files don't change
**Solution**:
```yaml
# Check workflow permissions in github-stats.yml
permissions:
  contents: write  # Required for committing files

# Verify token is set in repository secrets
```

#### 4. "Lines of code" showing as 0

**Problem**: Repository contents not accessible or empty repositories
**Solutions**:
```javascript
// Check if repositories have actual code files
// Verify token has 'repo' scope for private repositories
// Check that repositories aren't empty
```

#### 5. Workflow fails with "Error: Process completed with exit code 1"

**Problem**: Script error or configuration issue
**Solution**:
```bash
# Test locally first
cd src
node generate-stats.js

# Check workflow logs for specific error messages
# Verify all dependencies are properly installed
```

#### 6. Cards show "NaN" or undefined values

**Problem**: API data parsing issues
**Solution**:
```javascript
// Add error handling and default values
const safeValue = value || 0;
const safeString = string || 'Unknown';
```

#### 7. Assets not found in README

**Problem**: Incorrect file paths to generated assets
**Solution**:
```markdown
# Correct paths based on new structure
![GitHub Stats](./src/assets/github-stats.svg)
![Languages](./src/assets/languages.svg)
![Organizations](./src/assets/organizations.svg)

# Or use absolute GitHub URLs for better compatibility
![GitHub Stats](https://raw.githubusercontent.com/yourusername/yourusername/main/src/assets/github-stats.svg)
```

### Debug Mode

Enable debug logging for troubleshooting:

```javascript
// Add at the top of generate-stats.js
const DEBUG = process.env.DEBUG === 'true';

// Use throughout code
if (DEBUG) {
  console.log('Debug info:', data);
}
```

Run with debug mode:
```bash
DEBUG=true node generate-stats.js
```

### Getting Help


### 📞 Support
- **📧 Email**: [ujjwalkrai@gmail.com](mailto:ujjwalkrai@gmail.com)
- **🐛 Issues**: [Repository Issues](https://github.com/ukr-projects/ukr-projects/issues)
- **🔓 Security**: [Repository Security](https://github.com/ukr-projects/ukr-projects/security)
- **⛏ Pull Requests**: [Repository Pull Requests](https://github.com/ukr-projects/ukr-projects/pulls)
- **📖 Documentation**: [Repository Documentation](https://github.com/ukr-projects/ukr-projectst/docs)

#### Useful Resources
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Octokit.js Documentation](https://octokit.github.io/rest.js/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SVG Specification](https://developer.mozilla.org/en-US/docs/Web/SVG)

#### Community Support
- Check existing issues for similar problems
- Join GitHub discussions for community help
- Share your customizations and improvements

### Contributing Back

If you improve the generator or fix issues:

1. Fork the original repository
2. Create a feature branch
3. Make your improvements with tests
4. Submit a pull request with clear description
5. Follow the existing code style and conventions

---

**Made with ❤️ for the developer community**

*This GitHub Stats Generator helps create beautiful, professional statistics cards that showcase your coding journey and contributions across personal and organization repositories.*

## Quick Reference

### Essential Commands
```bash
# Setup
cd src
npm install @octokit/rest

# Local testing
export PERSONAL_ACCESS_TOKEN=your_token
node generate-stats.js

# Manual workflow trigger
gh workflow run github-stats.yml
```

### Key Files to Customize
- `src/generate-stats.js` - Main configuration and logic
- `.github/workflows/github-stats.yml` - Automation schedule
- `README.md` - Display your generated cards

### Generated Outputs
- `src/assets/github-stats.svg` - Overview statistics
- `src/assets/languages.svg` - Programming languages
- `src/assets/organizations.svg` - Organizations breakdown
- `src/assets/github-stats-section.md` - Markdown table

### File Path References
When referencing the generated assets in your README, use:
```markdown
# Relative paths from repository root
![GitHub Stats](./src/assets/github-stats.svg)
![Languages](./src/assets/languages.svg)
![Organizations](./src/assets/organizations.svg)

# Or absolute GitHub URLs for better compatibility
![GitHub Stats](https://raw.githubusercontent.com/yourusername/yourusername/main/src/assets/github-stats.svg)
```