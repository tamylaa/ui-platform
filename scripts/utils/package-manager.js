#!/usr/bin/env node
/**
 * Package Management Utilities
 * Centralized package operations for NPM and Git
 */

import path from 'path';
import { ShellUtils } from './shell-utils.js';
import { FileUtils } from './file-utils.js';
import { Logger } from './logger.js';

export class PackageManager {
  constructor(packagePath) {
    this.packagePath = packagePath;
    this.packageJsonPath = path.join(packagePath, 'package.json');
  }

  async getPackageInfo() {
    const packageJson = await FileUtils.safeReadJson(this.packageJsonPath);
    return packageJson;
  }

  async updatePackageVersion(version) {
    const packageJson = await this.getPackageInfo();
    if (!packageJson) return false;

    packageJson.version = version;
    return await FileUtils.safeWriteJson(this.packageJsonPath, packageJson);
  }

  async buildPackage() {
    Logger.info('Building package...', 'BUILD');

    // Try different build commands
    const buildCommands = [
      'npm run build',
      'npm run compile',
      'npm run dist'
    ];

    for (const command of buildCommands) {
      const result = ShellUtils.execWithOutput(command, { cwd: this.packagePath });
      if (result.success) {
        Logger.success('Package built successfully', 'BUILD');
        return true;
      }
    }

    Logger.warning('No successful build command found', 'BUILD');
    return false;
  }

  async validatePackage() {
    Logger.info('Validating package...', 'VALIDATE');

    const validation = await FileUtils.validatePackageStructure(this.packagePath);

    if (!validation.valid) {
      Logger.error(`Package validation failed: ${validation.issues.join(', ')}`, 'VALIDATE');
      return false;
    }

    const packageJson = await this.getPackageInfo();
    if (!packageJson) {
      Logger.error('Could not read package.json', 'VALIDATE');
      return false;
    }

    // Check required fields
    const requiredFields = ['name', 'version', 'description'];
    const missingFields = requiredFields.filter(field => !packageJson[field]);

    if (missingFields.length > 0) {
      Logger.error(`Missing required fields: ${missingFields.join(', ')}`, 'VALIDATE');
      return false;
    }

    Logger.success('Package validation passed', 'VALIDATE');
    return true;
  }

  async testPublish() {
    Logger.info('Testing package publish (dry run)...', 'TEST');

    const result = ShellUtils.execWithOutput('npm publish --dry-run', {
      cwd: this.packagePath
    });

    if (result.success) {
      Logger.success('Dry run successful', 'TEST');
      return true;
    } else {
      Logger.error(`Dry run failed: ${result.error}`, 'TEST');
      return false;
    }
  }

  async publishPackage(options = {}) {
    const { tag = 'latest', access = 'public' } = options;

    Logger.info('Publishing package to NPM...', 'PUBLISH');

    const command = `npm publish --access ${access} --tag ${tag}`;
    const result = ShellUtils.execWithLiveOutput(command, { cwd: this.packagePath });

    if (result.success) {
      Logger.success('Package published successfully', 'PUBLISH');
      return true;
    } else {
      Logger.error(`Publishing failed: ${result.error}`, 'PUBLISH');
      return false;
    }
  }

  async prepareForPublish(targetPath) {
    Logger.info('Preparing package for publishing...', 'PREPARE');

    // Copy package to target directory
    const success = await FileUtils.safeCopy(this.packagePath, targetPath, {
      filter: (src) => {
        // Exclude common development files
        const excludePatterns = [
          'node_modules',
          '.git',
          '.env',
          '*.log',
          'coverage',
          '.nyc_output',
          'test',
          'tests',
          '__tests__',
          '*.test.js',
          '*.spec.js'
        ];

        return !excludePatterns.some(pattern =>
          src.includes(pattern) || src.endsWith(pattern.replace('*', ''))
        );
      }
    });

    if (success) {
      Logger.success('Package prepared for publishing', 'PREPARE');
      return targetPath;
    } else {
      Logger.error('Failed to prepare package', 'PREPARE');
      return null;
    }
  }

  static async listWorkspacePackages(workspaceRoot) {
    const commonPackagePaths = [
      'packages',
      'npm',
      'libs',
      'apps'
    ];

    const packages = [];

    for (const packagesDir of commonPackagePaths) {
      const packagesPath = path.join(workspaceRoot, packagesDir);

      if (await FileUtils.pathExists(packagesPath)) {
        const packageDirs = await FileUtils.getDirectoryContents(packagesPath);

        for (const packageDir of packageDirs) {
          const packagePath = path.join(packagesPath, packageDir);
          const packageJsonPath = path.join(packagePath, 'package.json');

          if (await FileUtils.pathExists(packageJsonPath)) {
            const packageJson = await FileUtils.safeReadJson(packageJsonPath);
            if (packageJson) {
              packages.push({
                name: packageJson.name,
                path: packagePath,
                version: packageJson.version,
                directory: `${packagesDir}/${packageDir}`
              });
            }
          }
        }
      }
    }

    return packages;
  }
}
