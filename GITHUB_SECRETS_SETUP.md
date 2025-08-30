# GitHub Secrets Setup Guide

## Required Secrets for Deployment

### 1. NPM_GITHUB_ACTION_AUTO
**Purpose**: Authenticate with npm registry for package publishing

**Setup Steps**:
1. Go to https://www.npmjs.com/settings/tokens
2. Click "Generate New Token"
3. Select "Automation" (for CI/CD use)
4. Copy the generated token
5. Go to your GitHub repository
6. Navigate to Settings > Secrets and variables > Actions
7. Click "New repository secret"
8. Name: `NPM_GITHUB_ACTION_AUTO`
9. Value: Paste your npm token

### 2. GITHUB_TOKEN (automatic)
**Purpose**: GitHub operations and semantic-release
**Setup**: Automatically provided by GitHub Actions
**Permissions needed**: 
- Go to repo Settings > Actions > General
- Set "Workflow permissions" to "Read and write permissions"
- Enable "Allow GitHub Actions to create and approve pull requests"

## Verification

After setting up secrets, check:
1. Repository Settings > Secrets shows NPM_GITHUB_ACTION_AUTO
2. Workflow permissions are set correctly
3. Re-run failed deployments to test

## Troubleshooting

### Common Issues:
- **401 Unauthorized**: NPM_GITHUB_ACTION_AUTO missing or invalid
- **403 Forbidden**: Insufficient GitHub permissions
- **Package already exists**: Version not incremented

### Solutions:
- Regenerate NPM token if expired
- Check token has publish permissions
- Ensure semantic-release is working for version bumps
