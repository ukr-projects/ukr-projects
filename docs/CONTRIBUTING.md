# Contributing to ukr-projects

Thank you for your interest in contributing to ukr-projects! We welcome contributions from everyone and appreciate your help in making this custom GitHub stats generator better for the development community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](docs/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [ujjwalkrai@gmail.com](mailto:ujjwalkrai@gmail.com).

## Getting Started

### Prerequisites

Before you begin, ensure you have the following:
- A GitHub account
- Git installed on your local machine
- Node.js (version 14 or higher) and npm
- Basic knowledge of JavaScript and GitHub API
- Understanding of SVG generation and data visualization

### First Time Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/ukr-projects.git
   cd ukr-projects
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/ukr-projects/ukr-projects.git
   ```
4. Install dependencies:
   ```bash
   cd src
   npm install
   ```
5. Review the project structure:
   ```
   ukr-projects/
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
   │   ├── SECURITY.md
   │   ├── STATUS.md
   │   └── USAGE.md
   ├── src/
   │   ├── assets/
   │   │   ├── github-stats-section.md
   │   │   ├── github-stats.svg
   │   │   ├── languages.svg
   │   │   └── organizations.svg
   │   ├── generate-stats.js
   │   ├── package.json
   │   └── node_modules/
   ├── LICENSE
   └── README.md
   ```

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

- **Feature Development**: Add new stats cards, themes, or visualization features
- **Bug Fixes**: Help us identify and fix issues in the stats generation
- **Performance Improvements**: Optimize API calls, caching, or rendering performance
- **Documentation**: Improve or add to our documentation and usage guides
- **Testing**: Add or improve test coverage for existing features
- **Templates**: Enhance GitHub issue/PR templates and workflows
- **Design**: Contribute to visual design, themes, or SVG optimization
- **API Integration**: Improve GitHub API usage and error handling

### Before You Start

1. Check existing [issues](https://github.com/ukr-projects/ukr-projects/issues) and [pull requests](https://github.com/ukr-projects/ukr-projects/pulls) to avoid duplicates
2. For major features or changes, please open an issue first to discuss your proposed changes
3. Make sure your contribution aligns with the project's goal of creating unique and professional GitHub stats cards

## Development Setup

### Local Development Environment

1. Create a new branch for your feature or improvement:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   # or
   git checkout -b docs/documentation-update
   ```

2. Set up environment variables (if needed):
   ```bash
   # Create a .env file in the src directory
   cp .env.example .env
   # Add your GitHub token for testing (optional)
   GITHUB_TOKEN=your_github_token_here
   ```

3. Run the stats generator locally:
   ```bash
   cd src
   node generate-stats.js
   ```

4. Test your changes:
   - Verify SVG output renders correctly
   - Check API rate limiting and error handling
   - Test with different GitHub profiles and repositories
   - Ensure generated assets are properly formatted

### Understanding the Codebase

#### Core Components

- **`generate-stats.js`**: Main script that orchestrates stats generation
- **`assets/`**: Contains generated SVG files and templates
- **GitHub Workflow**: `.github/workflows/github-stats.yml` automates stats generation
- **Octokit Integration**: Uses GitHub API via @octokit packages for data fetching

#### Key Dependencies

- **@octokit/rest**: GitHub API client
- **@octokit/auth-token**: Authentication handling
- **@octokit/plugin-paginate-rest**: Pagination support
- **@octokit/plugin-request-log**: Request logging
- **fast-content-type-parse**: Content type parsing
- **universal-user-agent**: User agent management

## Coding Standards

### General Guidelines

- Write clean, readable, and well-documented JavaScript code
- Follow existing code patterns and architectural decisions
- Add proper error handling and logging
- Optimize for performance and API rate limits
- Ensure cross-platform compatibility

### JavaScript Standards

#### Code Style
- Use ES6+ features where appropriate
- Follow consistent naming conventions (camelCase for variables/functions)
- Add JSDoc comments for functions and complex logic
- Use async/await for asynchronous operations
- Implement proper error handling with try-catch blocks

#### Performance Guidelines
- Minimize GitHub API calls through efficient data fetching
- Implement caching mechanisms where possible
- Optimize SVG generation for file size and rendering speed
- Use pagination appropriately for large datasets

### SVG and Asset Standards

- Generate clean, accessible SVG markup
- Optimize SVG file sizes while maintaining quality
- Use consistent styling and theming approaches
- Ensure proper text rendering and font handling
- Test SVG compatibility across different platforms

### Documentation Standards

- Update README.md for new features or changes
- Include code examples in documentation
- Document API usage patterns and rate limiting
- Provide clear setup and usage instructions
- Update CHANGELOG.md for all changes

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature or stats card
- `fix`: A bug fix in stats generation or display
- `perf`: Performance improvements
- `docs`: Documentation only changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code restructuring without changing functionality
- `test`: Adding or modifying tests
- `chore`: Maintenance tasks and dependency updates
- `ci`: Changes to CI/CD workflows

### Examples

```
feat(stats): add new repository language distribution card

fix(api): handle GitHub API rate limiting more gracefully

perf(svg): optimize SVG generation for faster rendering

docs(usage): update README with new theme options

test(generate): add unit tests for stats generation functions

ci(workflow): update GitHub Actions to use Node.js 18
```

## Pull Request Process

### Before Submitting

1. Ensure your branch is up to date with the main branch:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Run tests and verify functionality:
   ```bash
   cd src
   node generate-stats.js
   # Verify generated SVGs are correct
   ```

3. Update documentation if necessary
4. Check that all generated assets are properly formatted

### Submitting Your Pull Request

1. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Create a pull request from your fork to the main repository

3. Fill out the pull request template completely

4. Include screenshots or examples of generated stats cards (if applicable)

5. Link any related issues using keywords (e.g., "Closes #123")

### Pull Request Template

When creating a pull request, please include:

- **Description**: Clear description of what changes you made
- **Motivation**: Why are these changes needed?
- **Type of Change**: New feature, bug fix, performance improvement, etc.
- **Testing**: How did you test your changes?
- **Generated Assets**: Include examples of new or modified stats cards
- **Performance Impact**: Note any performance improvements or considerations
- **Breaking Changes**: List any breaking changes
- **Checklist**: Complete the provided checklist

### Review Process

1. All pull requests require at least one review from a maintainer
2. Automated tests and workflows must pass
3. Generated stats must be verified for correctness
4. Address any feedback or requested changes promptly
5. Once approved, a maintainer will merge your pull request

## Issue Guidelines

### Before Creating an Issue

1. Search existing issues to avoid duplicates
2. Check if the issue might be related to GitHub API changes
3. Gather relevant information (error messages, examples, etc.)
4. Test with different GitHub profiles if applicable

### Bug Reports

When reporting a bug, please include:

- **Bug Description**: Clear and concise description
- **Steps to Reproduce**: How to reproduce the issue
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: Node.js version, operating system
- **Generated Output**: Examples of incorrect stats or error messages
- **GitHub Profile**: Username or repository that shows the issue (if not sensitive)
- **Error Logs**: Any relevant error messages or logs

### Feature Requests

When requesting a feature, please include:

- **Feature Description**: Clear description of the proposed feature
- **Use Case**: Why is this feature needed?
- **Proposed Implementation**: Your ideas for how it could work
- **Examples**: Examples from other GitHub stats tools if applicable
- **Visual Mockups**: Sketches or examples of desired output
- **API Requirements**: Any GitHub API endpoints that would be needed

### Performance Issues

When reporting performance issues:

- **Performance Description**: What operation is slow?
- **Timing Information**: How long does it take vs. expected time?
- **Profile Size**: Size of GitHub profile or repository causing issues
- **System Information**: Hardware and software environment
- **Profiling Data**: Any performance profiling information you've gathered

## Testing Guidelines

### Manual Testing

Before submitting changes:

1. Test with various GitHub profiles (small and large)
2. Verify SVG output renders correctly in browsers
3. Check for proper error handling with invalid inputs
4. Test rate limiting scenarios
5. Verify accessibility of generated graphics

### Automated Testing

We encourage adding tests for:

- Stats calculation functions
- SVG generation logic
- API error handling
- Data parsing and formatting
- Performance benchmarks

## Community

### Getting Help

If you need help or have questions:
- Open an issue with the "question" label
- Email us at [ujjwalkrai@gmail.com](mailto:ujjwalkrai@gmail.com)
- Check existing documentation in the `docs/` folder
- Review the codebase and existing implementations

### Recognition

We appreciate all contributions and maintain a contributors list to recognize everyone who has helped improve this project. All contributors will be acknowledged in our documentation and release notes.

### Development Philosophy

This project aims to:
- Create unique and professional GitHub stats visualizations
- Maintain high performance and reliability
- Provide easy-to-use and customizable solutions
- Support the open source community with quality tools
- Follow best practices for API usage and resource management

### License

By contributing to this project, you agree that your contributions will be licensed under the MIT License, the same license as the project. See [LICENSE](LICENSE) for details.

---

## Quick Reference

### Common Commands

```bash
# Setup
git clone https://github.com/your-username/ukr-projects.git
cd ukr-projects/src
npm install

# Development
git checkout -b feature/new-stats-card
# Make your changes
node generate-stats.js  # Test locally
git add .
git commit -m "feat(stats): add new contribution streak card"
git push origin feature/new-stats-card
```

### Key Files to Know

- `src/generate-stats.js`: Main stats generation logic
- `.github/workflows/github-stats.yml`: Automated stats generation
- `src/assets/`: Generated SVG output files
- `docs/USAGE.md`: Detailed usage instructions
- `docs/STATUS.md`: Project status and roadmap

### 📞 Support

- **📧 Email**: [ujjwalkrai@gmail.com](mailto:ujjwalkrai@gmail.com)
- **🐛 Issues**: [Repository Issues](https://github.com/ukr-projects/ukr-projects/issues)
- **🔓 Security**: [Repository Security](https://github.com/ukr-projects/ukr-projects/security)
- **⛏ Pull Requests**: [Repository Pull Requests](https://github.com/ukr-projects/ukr-projects/pulls)
- **📖 Documentation**: [Repository Documentation](https://github.com/ukr-projects/ukr-projects/tree/main/docs)

### Need Help Getting Started?

If you're new to contributing or need assistance:
- Review the existing `generate-stats.js` file to understand the architecture
- Check out the generated SVG examples in the `assets/` folder
- Look at the GitHub workflow to see how automation works
- Start with small improvements like adding new themes or fixing bugs
- Don't hesitate to ask questions in issues or via email

Thank you for contributing to ukr-projects! Together, we're creating better tools for developers to showcase their GitHub activity and achievements. 🎉

---

## Additional Resources

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Octokit.js Documentation](https://octokit.github.io/rest.js/)
- [SVG Specifications](https://www.w3.org/TR/SVG2/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)