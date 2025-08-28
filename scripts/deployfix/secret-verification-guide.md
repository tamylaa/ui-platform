# GitHub Secrets Verification Guide

## Required Actions to Fix Deployment

### 1. Check Repository Secrets

You need to verify that the following secret exists in BOTH repositories:

**Repositories:**
- `tamylaa/tamyla-ui-components`
- `tamylaa/tamyla-ui-components-react`

**Required Secret:**
- Name: `NPM_GITHUB_ACTION_AUTO`
- Value: Your NPM automation token

### 2. How to Check/Add Secrets

1. Go to GitHub repository → Settings → Secrets and variables → Actions
2. Look for `NPM_GITHUB_ACTION_AUTO` in the "Repository secrets" section
3. If missing, click "New repository secret"
4. Name: `NPM_GITHUB_ACTION_AUTO`
5. Value: Your NPM token (should start with `npm_`)

### 3. NPM Token Requirements

The token must be:
- **Automation token** (not classic token)
- Have **publish** permissions
- Be associated with your NPM account
- Not expired

### 4. Alternative Secret Names

If you already have an NPM token with a different name, we can update the workflows to use it instead. Common names are:
- `NPM_TOKEN`
- `NPM_AUTH_TOKEN`
- `NODE_AUTH_TOKEN`

### 5. Quick Fix Option

If you want to use a different secret name, tell me the exact name and I'll update both workflows to use it.

## Most Likely Issue

The deployment is failing because:
1. The secret `NPM_GITHUB_ACTION_AUTO` doesn't exist in the repository settings
2. OR the token has expired
3. OR the token doesn't have publish permissions

## Next Steps

1. Check if the secret exists in both repositories
2. If missing, add it with your NPM automation token
3. If you have a different secret name, let me know and I'll update the workflows
