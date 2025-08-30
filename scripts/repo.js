#!/usr/bin/env node
/**
 * Repository Manager
 * Modular GitHub repository creation and management
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { PackageManager } from './utils/package-manager.js';
import { GitHubManager } from './utils/github-manager.js';
import { FileUtils } from './utils/file-utils.js';
import { Logger } from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class RepositoryManager {
  constructor() {
    this.workspaceRoot = path.resolve(__dirname, '..');
    this.npmDir = path.join(this.workspaceRoot, 'npm');
  }

  async createRepository(packageName, options = {}) {
    const {
      description = '',
      private: isPrivate = false,
      homepage = '',
      fromNpm = true
    } = options;

    Logger.header(`Creating Repository: ${packageName}`);

    // 1. Determine source directory
    let sourcePath;
    if (fromNpm) {
      sourcePath = path.join(this.npmDir, `${packageName}-publish`);
    } else {
      const packages = await PackageManager.listWorkspacePackages(this.workspaceRoot);
      const sourcePackage = packages.find(pkg =>
        pkg.name === packageName ||
        pkg.directory.includes(packageName)
      );

      if (!sourcePackage) {
        Logger.error(`Package ${packageName} not found in workspace`);
        return false;
      }

      sourcePath = sourcePackage.path;
    }

    // 2. Validate source exists
    if (!await FileUtils.pathExists(sourcePath)) {
      Logger.error(`Source directory not found: ${sourcePath}`);
      return false;
    }

    // 3. Get package information
    const packageManager = new PackageManager(sourcePath);
    const packageInfo = await packageManager.getPackageInfo();

    if (!packageInfo) {
      Logger.error('Could not read package.json');
      return false;
    }

    // 4. Setup repository options
    const repoOptions = {
      description: description || packageInfo.description || `${packageName} package`,
      private: isPrivate,
      homepage: homepage || packageInfo.homepage || '',
      owner: 'tamylaa'
    };

    Logger.info(`Package: ${packageInfo.name}@${packageInfo.version}`);
    Logger.info(`Description: ${repoOptions.description}`);

    // 5. Create and setup GitHub repository
    const gitHubManager = new GitHubManager(sourcePath);
    const success = await gitHubManager.setupRepositoryFromPackage(
      sourcePath,
      packageName,
      repoOptions
    );

    if (success) {
      Logger.success(`Repository ${packageName} created and configured successfully!`);
      Logger.info(`Repository URL: https://github.com/${repoOptions.owner}/${packageName}`);
      return true;
    } else {
      Logger.error(`Failed to create repository ${packageName}`);
      return false;
    }
  }

  async syncRepository(packageName, options = {}) {
    const { fromNpm = true } = options;

    Logger.header(`Syncing Repository: ${packageName}`);

    // 1. Determine source directory
    let sourcePath;
    if (fromNpm) {
      sourcePath = path.join(this.npmDir, `${packageName}-publish`);
    } else {
      const packages = await PackageManager.listWorkspacePackages(this.workspaceRoot);
      const sourcePackage = packages.find(pkg =>
        pkg.name === packageName ||
        pkg.directory.includes(packageName)
      );

      if (!sourcePackage) {
        Logger.error(`Package ${packageName} not found in workspace`);
        return false;
      }

      sourcePath = sourcePackage.path;
    }

    // 2. Validate source exists
    if (!await FileUtils.pathExists(sourcePath)) {
      Logger.error(`Source directory not found: ${sourcePath}`);
      return false;
    }

    // 3. Sync with remote repository
    const gitHubManager = new GitHubManager(sourcePath);
    await gitHubManager.syncWithRemote();

    const commitSuccess = await gitHubManager.commitChanges('Update package');
    if (commitSuccess) {
      const pushSuccess = await gitHubManager.pushToRemote();
      if (pushSuccess) {
        Logger.success(`Repository ${packageName} synced successfully!`);
        return true;
      }
    }

    Logger.error(`Failed to sync repository ${packageName}`);
    return false;
  }

  async listRepositories() {
    Logger.header('Available Packages for Repository Creation');

    // List packages from workspace
    const packages = await PackageManager.listWorkspacePackages(this.workspaceRoot);

    if (packages.length === 0) {
      Logger.warning('No packages found in workspace');
      return;
    }

    Logger.table(packages, 'Workspace Packages');

    // List published packages (npm directory)
    if (await FileUtils.pathExists(this.npmDir)) {
      const npmContents = await FileUtils.getDirectoryContents(this.npmDir);
      const publishedPackages = [];

      for (const dir of npmContents) {
        const packagePath = path.join(this.npmDir, dir);
        const packageJsonPath = path.join(packagePath, 'package.json');

        if (await FileUtils.pathExists(packageJsonPath)) {
          const packageJson = await FileUtils.safeReadJson(packageJsonPath);
          if (packageJson) {
            publishedPackages.push({
              name: packageJson.name,
              version: packageJson.version,
              directory: `npm/${dir}`
            });
          }
        }
      }

      if (publishedPackages.length > 0) {
        Logger.table(publishedPackages, 'Published Packages (NPM Directory)');
      }
    }
  }

  async validateEnvironment() {
    Logger.header('Environment Validation for Repository Management');

    // Check GitHub authentication
    const githubAuth = await GitHubManager.checkGitHubAuth();
    if (githubAuth.authenticated) {
      Logger.success('GitHub CLI authenticated');
    } else {
      Logger.error('GitHub CLI not authenticated. Run: gh auth login');
      return false;
    }

    Logger.success('Environment validation passed');
    return true;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const packageName = args[1];

  const repoManager = new RepositoryManager();

  // Parse options
  const options = {
    description: args.find(arg => arg.startsWith('--description='))?.split('=')[1] || '',
    private: args.includes('--private'),
    homepage: args.find(arg => arg.startsWith('--homepage='))?.split('=')[1] || '',
    fromNpm: !args.includes('--from-source')
  };

  try {
    switch (command) {
    case 'validate':
      await repoManager.validateEnvironment();
      break;

    case 'list':
      await repoManager.listRepositories();
      break;

    case 'create':
      if (!packageName) {
        Logger.error('Package name required. Usage: node repo.js create <package-name>');
        process.exit(1);
      }

      const envValid = await repoManager.validateEnvironment();
      if (!envValid) {
        Logger.error('Environment validation failed.');
        process.exit(1);
      }

      const createSuccess = await repoManager.createRepository(packageName, options);
      process.exit(createSuccess ? 0 : 1);
      break;

    case 'sync':
      if (!packageName) {
        Logger.error('Package name required. Usage: node repo.js sync <package-name>');
        process.exit(1);
      }

      const syncSuccess = await repoManager.syncRepository(packageName, options);
      process.exit(syncSuccess ? 0 : 1);
      break;

    default:
      Logger.info('Usage:');
      Logger.info('  node repo.js validate                  - Validate environment');
      Logger.info('  node repo.js list                      - List available packages');
      Logger.info('  node repo.js create <package-name>     - Create GitHub repository');
      Logger.info('  node repo.js sync <package-name>       - Sync with remote repository');
      Logger.info('');
      Logger.info('Options:');
      Logger.info('  --description="..."  Repository description');
      Logger.info('  --private            Create private repository');
      Logger.info('  --homepage="..."     Repository homepage URL');
      Logger.info('  --from-source        Use source directory (default: npm directory)');
      break;
    }
  } catch (error) {
    Logger.error(`Operation failed: ${error.message}`);
    process.exit(1);
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` ||
    import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default RepositoryManager;
