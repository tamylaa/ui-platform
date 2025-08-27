# GitHub Repository Management Guide

This guide covers the automated GitHub repository management system for publishing packages independently to GitHub repositories and NPM.

## Overview

The GitHub Repository Management system provides automated workflows for:
- Creating GitHub repositories for packages
- Preparing packages for standalone publishing
- Managing repository configurations
- Publishing to both GitHub and NPM
- Synchronizing changes between workspace and repositories

## Prerequisites

### Required Tools
```powershell
# Install GitHub CLI
winget install GitHub.cli

# Authenticate with GitHub
gh auth login

# Verify authentication
gh auth status
```

### Required Configurations
```powershell
# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Configure NPM (if publishing to NPM)
npm login
```

## Quick Start

### 1. Check Current Status
```bash
# Using npm script
npm run repo:status

# Direct command
node scripts/github-repo-manager.js status
```

### 2. List All Packages
```bash
npm run repo:list
```

### 3. Create Repository for ui-platform
```bash
# Complete workflow (prepare + create + publish)
npm run repo:publish ui-platform

# Or step by step:
npm run repo:prepare ui-platform
npm run repo:create ui-platform
```

## Commands Reference

### Status Commands
```bash
# Show overall status
node scripts/github-repo-manager.js status

# List all packages with detailed status
node scripts/github-repo-manager.js list

# Validate specific repository
node scripts/github-repo-manager.js validate ui-platform
```

### Repository Management
```bash
# Create new repository
node scripts/github-repo-manager.js create ui-platform

# Create private repository
node scripts/github-repo-manager.js create ui-platform --private

# Force overwrite existing repository
node scripts/github-repo-manager.js create ui-platform --force
```

### Package Preparation
```bash
# Prepare package for standalone publishing
node scripts/github-repo-manager.js prepare ui-platform

# Dry run (show what would be done)
node scripts/github-repo-manager.js prepare ui-platform --dry-run
```

### Complete Publishing Workflow
```bash
# Complete workflow: prepare + create repository + publish
node scripts/github-repo-manager.js publish ui-platform

# Skip NPM publishing
node scripts/github-repo-manager.js publish ui-platform --skip-npm

# Dry run complete workflow
node scripts/github-repo-manager.js publish ui-platform --dry-run
```

### Synchronization
```bash
# Sync local changes to remote repository
node scripts/github-repo-manager.js sync ui-platform
```

## NPM Scripts

For convenience, repository management commands are available as npm scripts:

```json
{
  "scripts": {
    "repo:status": "node scripts/github-repo-manager.js status",
    "repo:list": "node scripts/github-repo-manager.js list",
    "repo:create": "node scripts/github-repo-manager.js create",
    "repo:prepare": "node scripts/github-repo-manager.js prepare",
    "repo:publish": "node scripts/github-repo-manager.js publish",
    "repo:validate": "node scripts/github-repo-manager.js validate",
    "repo:sync": "node scripts/github-repo-manager.js sync"
  }
}
```

### Usage Examples
```bash
# Check status
npm run repo:status

# Create ui-platform repository
npm run repo:create ui-platform

# Complete publish workflow
npm run repo:publish ui-platform

# Validate repository
npm run repo:validate ui-platform
```

## Workflow Examples

### Publishing ui-platform to GitHub

1. **Check current status:**
   ```bash
   npm run repo:status
   ```

2. **Complete publish workflow:**
   ```bash
   npm run repo:publish ui-platform
   ```

3. **Validate the created repository:**
   ```bash
   npm run repo:validate ui-platform
   ```

### Creating Repository Only (No NPM)

```bash
# Skip NPM publishing
npm run repo:publish ui-platform --skip-npm
```

### Updating Existing Repository

```bash
# Sync local changes to repository
npm run repo:sync ui-platform
```

## Advanced Options

### Custom Owner
```bash
node scripts/github-repo-manager.js create ui-platform --owner myorganization
```

### Private Repository
```bash
node scripts/github-repo-manager.js create ui-platform --private
```

### Dry Run Mode
```bash
node scripts/github-repo-manager.js publish ui-platform --dry-run
```

### Force Overwrite
```bash
node scripts/github-repo-manager.js create ui-platform --force
```

## Package Preparation Process

The preparation process automatically:

1. **Copies package contents** to temporary directory
2. **Updates package.json** for standalone publishing:
   - Sets repository URLs
   - Converts workspace dependencies to NPM versions
   - Adds publishing scripts
   - Removes workspace-specific configurations
3. **Tests build process** to ensure package integrity
4. **Validates dependencies** are properly resolved

### For ui-platform specifically:
- Runs `scripts/setup-platform-publishing.js`
- Updates dependencies to published NPM versions:
  - `@tamyla/ui-components ^2.0.0`
  - `@tamyla/ui-components-react ^1.0.0`
- Removes workspace build commands
- Tests standalone build process

## Repository Structure

After creation, repositories contain:

```
repository-name/
├── src/                 # Source code
├── dist/               # Built assets
├── package.json        # Standalone package configuration
├── README.md           # Package documentation
├── LICENSE             # License file
├── tsconfig.json       # TypeScript configuration
├── rollup.config.js    # Build configuration
└── .github/            # GitHub workflows (if applicable)
```

## Troubleshooting

### Common Issues

#### GitHub CLI Not Authenticated
```bash
Error: GitHub CLI not authenticated
Solution: gh auth login
```

#### Repository Already Exists
```bash
Error: Repository already exists
Solution: Use --force flag or different name
```

#### Build Failures
```bash
Error: npm run build failed
Solution: Check dependencies and build configuration
```

#### Permission Errors
```bash
Error: Permission denied
Solution: Ensure GitHub authentication and repository permissions
```

### Debugging Commands

```bash
# Check GitHub CLI status
gh auth status

# Test repository access
gh repo view tamylaa/ui-platform

# Check NPM authentication
npm whoami

# Validate package.json
npm run build --dry-run
```

## Integration with Existing Workflow

The GitHub repository manager integrates with existing publishing scripts:

1. **setup-platform-publishing.js** - Prepares ui-platform for publishing
2. **universal-publisher.js** - Provides replication guides
3. **sync-repositories.js** - Manages repository synchronization

### Workflow Integration
```bash
# Complete publishing pipeline
npm run publish:prepare    # Prepare package
npm run repo:create ui-platform  # Create repository
npm run publish:platform   # Publish to NPM
npm run repo:sync ui-platform     # Sync to repository
```

## Security Considerations

### Authentication
- GitHub CLI uses secure token authentication
- NPM authentication required for publishing
- Repository permissions managed through GitHub

### Private Repositories
```bash
# Create private repository
node scripts/github-repo-manager.js create ui-platform --private
```

### Access Control
- Repository visibility controlled by GitHub settings
- NPM package access controlled by publishConfig
- Workspace isolation maintained through preparation process

## Monitoring and Validation

### Status Monitoring
```bash
# Regular status check
npm run repo:status

# Detailed package status
npm run repo:list

# Validate specific repository
npm run repo:validate ui-platform
```

### Health Checks
- GitHub repository accessibility
- NPM package availability
- Build process integrity
- Dependency resolution

## Support and Documentation

- **Script Location:** `scripts/github-repo-manager.js`
- **Configuration:** Uses package.json and GitHub CLI settings
- **Logs:** Console output with colored status indicators
- **Help:** `node scripts/github-repo-manager.js help`

For additional support:
1. Check script help: `npm run repo:status`
2. Review preparation logs
3. Validate GitHub CLI authentication
4. Test package build process independently
