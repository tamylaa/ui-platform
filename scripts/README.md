# UI Platform Scripts

This directory contains modular automation scripts for managing the UI Platform packages and repositories.

## Core Scripts

### `eslint-platform-compatibility-check.js` - ESLint Compatibility Testing
**Comprehensive ESLint configuration compatibility test for entire UI Platform:**

- 🧪 **Multi-Package Testing**: Tests all packages (root, ui-components, ui-components-react)
- 📦 **ESM Module Resolution**: Validates ESLint 9 flat config loading across packages
- 🔍 **Dependency Validation**: Checks ESLint 9.x and TypeScript ESLint compatibility
- 🎯 **Lint Execution**: Tests actual linting and reports error/warning counts per package
- 🏗️ **Build Integration**: Validates build process compatibility for each package
- 🔧 **Package-Specific Config**: Verifies Jest, DOM globals, React, TypeScript configurations
- 📊 **Platform Assessment**: Provides comprehensive readiness report for GitHub deployment

```bash
# Test ESLint configuration across entire platform
node scripts/eslint-platform-compatibility-check.js
```

**Output Example:**
- Package structure validation
- ESLint 9.x dependency verification
- ESM module loading tests
- Error/warning counts per package
- Build process validation
- Configuration analysis
- Final platform deployment recommendation

### `publish.js` - Package Publishing
Handles the complete package publishing workflow with validation, building, and NPM publishing.

```bash
# Validate environment (NPM/GitHub auth)
npm run publish:validate

# List available packages
npm run publish:list

# Publish a specific package
npm run publish:package <package-name>

# Publish with options
node scripts/publish.js publish <package-name> --create-repo --force
```

**Options:**
- `--no-validate` - Skip package validation
- `--no-build` - Skip build step
- `--no-test` - Skip test publish (dry run)
- `--create-repo` - Create GitHub repository
- `--force` - Continue on errors

### `repo.js` - Repository Management
Manages GitHub repository creation and synchronization.

```bash
# Validate GitHub authentication
npm run repo:validate

# List available packages
npm run repo:list

# Create GitHub repository for a package
npm run repo:create <package-name>

# Sync with remote repository
npm run repo:sync <package-name>

# Create with options
node scripts/repo.js create <package-name> --description="Custom description" --private
```

**Options:**
- `--description="..."` - Repository description
- `--private` - Create private repository
- `--homepage="..."` - Repository homepage URL
- `--from-source` - Use source directory (default: npm directory)

## Utility Modules

### `utils/` Directory
Contains reusable utility modules that provide common functionality:

- **`shell-utils.js`** - Shell command execution with error handling
- **`file-utils.js`** - File system operations with safety checks
- **`logger.js`** - Consistent logging and formatting
- **`package-manager.js`** - Package operations (build, validate, publish)
- **`github-manager.js`** - GitHub repository operations

## Legacy Scripts

### Still Active
- **`bridge-analysis.js`** - Analyzes exports and bridges between packages
- **`migrate-packages.js`** - Package migration utilities
- **`setup.js`** - Platform setup and initialization
- **`sync-repositories.js`** - Repository synchronization

### Archived/Replaced
- **`github-repo-manager.old.js`** - Legacy monolithic repo manager (replaced by `repo.js`)

## Usage Examples

### Complete Package Publishing Workflow
```bash
# 1. Validate environment
npm run publish:validate

# 2. List available packages
npm run publish:list

# 3. Publish package with repository creation
node scripts/publish.js publish ui-components-react --create-repo
```

### Repository Management
```bash
# Create repository for existing package
npm run repo:create ui-platform

# Sync changes to remote
npm run repo:sync ui-platform
```

### Custom Publishing
```bash
# Publish without validation (force mode)
node scripts/publish.js publish my-package --no-validate --force

# Publish and create private repository
node scripts/publish.js publish my-package --create-repo
node scripts/repo.js create my-package --private --description="Private package"
```

## Environment Requirements

Before using these scripts, ensure you have:

1. **NPM Authentication**: `npm login`
2. **GitHub CLI**: `gh auth login`
3. **Git Configuration**: 
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

## Architecture Benefits

The new modular architecture provides:

1. **Separation of Concerns** - Each script has a single responsibility
2. **Reusable Utilities** - Common operations are centralized
3. **Consistent Error Handling** - Standardized error reporting
4. **Better Maintainability** - Easier to debug and extend
5. **Clear API** - Well-defined command-line interface
6. **Environment Validation** - Upfront checks for required tools

## Migration from Legacy Scripts

Old commands are automatically mapped to new scripts via package.json:

```json
{
  "scripts": {
    "repo:create": "node scripts/repo.js create",
    "publish:package": "node scripts/publish.js publish"
  }
}
```

For direct usage, replace:
- `node scripts/github-repo-manager.js create` → `node scripts/repo.js create`
- `node scripts/universal-publisher.js` → `node scripts/publish.js publish`
- `node scripts/direct-publish.js` → `node scripts/publish.js publish`
