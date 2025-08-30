#!/usr/bin/env node
/**
 * Package Publisher
 * Modular package publishing with comprehensive validation
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { PackageManager } from './utils/package-manager.js';
import { GitHubManager } from './utils/github-manager.js';
import { FileUtils } from './utils/file-utils.js';
import { Logger } from './utils/logger.js';
import { ShellUtils } from './utils/shell-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PublishManager {
  constructor() {
    this.workspaceRoot = path.resolve(__dirname, '..');
    this.npmDir = path.join(this.workspaceRoot, 'npm');
  }

  async publishPackage(packageName, options = {}) {
    const {
      validate = true,
      build = true,
      test = true,
      createRepo = false,
      force = false
    } = options;

    Logger.header(`Publishing Package: ${packageName}`);

    // 1. Find package in workspace
    const packages = await PackageManager.listWorkspacePackages(this.workspaceRoot);
    const sourcePackage = packages.find(pkg =>
      pkg.name === packageName ||
      pkg.directory.includes(packageName)
    );

    if (!sourcePackage) {
      Logger.error(`Package ${packageName} not found in workspace`);
      return false;
    }

    Logger.info(`Found package: ${sourcePackage.name} at ${sourcePackage.directory}`);

    // 2. Prepare package for publishing
    const publishPath = path.join(this.npmDir, `${packageName}-publish`);
    const packageManager = new PackageManager(sourcePackage.path);

    if (build) {
      Logger.step(1, 'Building package');
      const buildSuccess = await packageManager.buildPackage();
      if (!buildSuccess && !force) {
        Logger.error('Build failed. Use --force to continue anyway.');
        return false;
      }
    }

    if (validate) {
      Logger.step(2, 'Validating package');
      const validationSuccess = await packageManager.validatePackage();
      if (!validationSuccess && !force) {
        Logger.error('Validation failed. Use --force to continue anyway.');
        return false;
      }
    }

    Logger.step(3, 'Preparing publish directory');
    const preparedPath = await packageManager.prepareForPublish(publishPath);
    if (!preparedPath) {
      Logger.error('Failed to prepare package for publishing');
      return false;
    }

    // 3. Create package manager for publish directory
    const publishPackageManager = new PackageManager(publishPath);

    if (test) {
      Logger.step(4, 'Testing publish (dry run)');
      const testSuccess = await publishPackageManager.testPublish();
      if (!testSuccess && !force) {
        Logger.error('Test publish failed. Use --force to continue anyway.');
        return false;
      }
    }

    // 4. Create GitHub repository if requested
    if (createRepo) {
      Logger.step(5, 'Creating GitHub repository');
      const gitHubManager = new GitHubManager(publishPath);
      const packageInfo = await publishPackageManager.getPackageInfo();

      const repoOptions = {
        description: packageInfo.description || `${packageName} package`,
        homepage: packageInfo.homepage || '',
        owner: 'tamylaa'
      };

      const repoSetupSuccess = await gitHubManager.setupRepositoryFromPackage(
        publishPath,
        packageName,
        repoOptions
      );

      if (!repoSetupSuccess && !force) {
        Logger.error('GitHub repository setup failed. Use --force to continue anyway.');
        return false;
      }
    }

    // 5. Publish to NPM
    Logger.step(6, 'Publishing to NPM');
    const publishSuccess = await publishPackageManager.publishPackage();

    if (publishSuccess) {
      Logger.success(`Package ${packageName} published successfully!`);
      return true;
    } else {
      Logger.error(`Failed to publish package ${packageName}`);
      return false;
    }
  }

  async listPackages() {
    Logger.header('Workspace Packages');

    const packages = await PackageManager.listWorkspacePackages(this.workspaceRoot);

    if (packages.length === 0) {
      Logger.warning('No packages found in workspace');
      return;
    }

    Logger.table(packages, 'Available Packages');
  }

  async validateEnvironment() {
    Logger.header('Environment Validation');

    // Check NPM authentication
    const npmAuth = ShellUtils.checkNpmAuth();
    if (npmAuth.authenticated) {
      Logger.success(`NPM authenticated as: ${npmAuth.user}`);
    } else {
      Logger.error('NPM not authenticated. Run: npm login');
      return false;
    }

    // Check GitHub authentication
    const githubAuth = await GitHubManager.checkGitHubAuth();
    if (githubAuth.authenticated) {
      Logger.success('GitHub CLI authenticated');
    } else {
      Logger.error('GitHub CLI not authenticated. Run: gh auth login');
      return false;
    }

    // Check Git configuration
    const gitAuth = ShellUtils.checkGitAuth();
    if (gitAuth.configured) {
      Logger.success(`Git configured as: ${gitAuth.user}`);
    } else {
      Logger.error('Git not configured. Run: git config --global user.name "Your Name"');
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

  const publisher = new PublishManager();

  // Parse options
  const options = {
    validate: !args.includes('--no-validate'),
    build: !args.includes('--no-build'),
    test: !args.includes('--no-test'),
    createRepo: args.includes('--create-repo'),
    force: args.includes('--force')
  };

  try {
    switch (command) {
    case 'validate':
      await publisher.validateEnvironment();
      break;

    case 'list':
      await publisher.listPackages();
      break;

    case 'publish':
      if (!packageName) {
        Logger.error('Package name required. Usage: node publish.js publish <package-name>');
        process.exit(1);
      }

      const envValid = await publisher.validateEnvironment();
      if (!envValid && !options.force) {
        Logger.error('Environment validation failed. Use --force to continue anyway.');
        process.exit(1);
      }

      const success = await publisher.publishPackage(packageName, options);
      process.exit(success ? 0 : 1);
      break;

    default:
      Logger.info('Usage:');
      Logger.info('  node publish.js validate                 - Validate environment');
      Logger.info('  node publish.js list                     - List available packages');
      Logger.info('  node publish.js publish <package-name>   - Publish package');
      Logger.info('');
      Logger.info('Options:');
      Logger.info('  --no-validate    Skip package validation');
      Logger.info('  --no-build       Skip build step');
      Logger.info('  --no-test        Skip test publish');
      Logger.info('  --create-repo    Create GitHub repository');
      Logger.info('  --force          Continue on errors');
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

export default PublishManager;
