# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-07-20

### Added
- Initial release of ukr-projects custom GitHub stats generator
- **Core Features:**
  - Custom GitHub statistics generator with unique and professional card designs
  - Automated stats generation using GitHub Actions workflow
  - SVG-based statistical visualizations for GitHub profiles
  - Support for multiple stat types: general stats, languages, and organizations
- **Automation & CI/CD:**
  - GitHub Actions workflow for automated daily stats generation (`github-stats.yml`)
  - Scheduled execution every day at 00:00 UTC with manual trigger support
  - Automatic commit and push of updated statistics
- **Project Structure:**
  - Well-organized directory structure with separate `src/`, `docs/`, and `assets/` folders
  - Node.js-based stats generation script (`generate-stats.js`)
  - Comprehensive documentation setup
- **Documentation:**
  - Complete project documentation including README.md
  - Contributing guidelines (CONTRIBUTING.md)
  - Code of conduct (CODE_OF_CONDUCT.md)
  - Usage instructions (USAGE.md)
  - Status tracking (STATUS.md)
  - Security policy (SECURITY.md)
- **GitHub Integration:**
  - Issue templates for bug reports and feature requests
  - Pull request template for structured contributions
  - Release template for consistent versioning
- **Dependencies:**
  - Octokit REST API integration for GitHub data fetching
  - Support for both public and private repository statistics
  - Professional SVG generation for statistical cards
- **Assets:**
  - Generated SVG files for different stat categories
  - Markdown section template for easy integration
  - Professional card designs with clean aesthetics

### Security
- Implemented secure token handling for GitHub API access
- Added SECURITY.md with vulnerability reporting guidelines
- Proper environment variable management for sensitive data

### Documentation
- Comprehensive setup and installation guide
- Clear usage instructions for different stat types
- Contributing guidelines for community involvement
- Security policy for responsible disclosure

---

## Guidelines for Contributors

When adding entries to this changelog:

1. **Group changes** by type using the categories above
2. **Write for humans** - use clear, descriptive language
3. **Include issue/PR numbers** when relevant: `Fixed login bug (#123)`
4. **Date format** should be YYYY-MM-DD
5. **Version format** should follow [Semantic Versioning](https://semver.org/)
6. **Keep entries concise** but informative

### Version Number Guidelines
- **Major** (X.y.z) - Breaking changes
- **Minor** (x.Y.z) - New features, backwards compatible
- **Patch** (x.y.Z) - Bug fixes, backwards compatible

### Example Entry Format
```markdown
## [1.2.3] - 2024-01-15

### Added
- New feature description (#PR-number)

### Fixed
- Bug fix description (fixes #issue-number)
```