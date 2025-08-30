#!/usr/bin/env node
/**
 * File System Utilities
 * Centralized file operations with error handling
 */

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';

export class FileUtils {
  static async safeReadJson(filePath) {
    try {
      return await fs.readJson(filePath);
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not read ${filePath} - ${error.message}`));
      return null;
    }
  }

  static async safeWriteJson(filePath, data, options = { spaces: 2 }) {
    try {
      await fs.ensureDir(path.dirname(filePath));
      await fs.writeJson(filePath, data, options);
      return true;
    } catch (error) {
      console.error(chalk.red(`Error writing ${filePath} - ${error.message}`));
      return false;
    }
  }

  static async safeCopy(src, dest, options = {}) {
    try {
      await fs.ensureDir(path.dirname(dest));
      await fs.copy(src, dest, options);
      return true;
    } catch (error) {
      console.error(chalk.red(`Error copying ${src} to ${dest} - ${error.message}`));
      return false;
    }
  }

  static async safeRemove(targetPath) {
    try {
      await fs.remove(targetPath);
      return true;
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not remove ${targetPath} - ${error.message}`));
      return false;
    }
  }

  static async ensureDirectory(dirPath) {
    try {
      await fs.ensureDir(dirPath);
      return true;
    } catch (error) {
      console.error(chalk.red(`Error creating directory ${dirPath} - ${error.message}`));
      return false;
    }
  }

  static async pathExists(targetPath) {
    try {
      return await fs.pathExists(targetPath);
    } catch (error) {
      return false;
    }
  }

  static async getDirectoryContents(dirPath) {
    try {
      return await fs.readdir(dirPath);
    } catch (error) {
      console.warn(chalk.yellow(`Warning: Could not read directory ${dirPath} - ${error.message}`));
      return [];
    }
  }

  static async getFileStats(filePath) {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      return null;
    }
  }

  static async findPackageRoot(startPath = process.cwd()) {
    let currentPath = startPath;

    while (currentPath !== path.dirname(currentPath)) {
      const packageJsonPath = path.join(currentPath, 'package.json');
      if (await this.pathExists(packageJsonPath)) {
        return currentPath;
      }
      currentPath = path.dirname(currentPath);
    }

    return null;
  }

  static async validatePackageStructure(packagePath) {
    const requiredFiles = ['package.json'];
    const commonDirs = ['src', 'dist', 'lib', 'build'];

    const validation = {
      valid: true,
      issues: [],
      hasPackageJson: false,
      hasBuildOutput: false
    };

    // Check package.json
    const packageJsonPath = path.join(packagePath, 'package.json');
    validation.hasPackageJson = await this.pathExists(packageJsonPath);

    if (!validation.hasPackageJson) {
      validation.valid = false;
      validation.issues.push('Missing package.json');
    }

    // Check for build output
    for (const dir of commonDirs) {
      const dirPath = path.join(packagePath, dir);
      if (await this.pathExists(dirPath)) {
        validation.hasBuildOutput = true;
        break;
      }
    }

    return validation;
  }
}
