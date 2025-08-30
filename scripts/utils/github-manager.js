#!/usr/bin/env node
/**
 * GitHub Repository Management
 * Centralized GitHub operations and repository management
 */

import path from 'path';
import { ShellUtils } from './shell-utils.js';
import { FileUtils } from './file-utils.js';
import { Logger } from './logger.js';

export class GitHubManager {
  constructor(repoPath) {
    this.repoPath = repoPath;
  }

  async createRepository(repoName, options = {}) {
    const {
      description = '',
      private: isPrivate = false,
      homepage = ''
    } = options;

    Logger.info(`Creating GitHub repository: ${repoName}`, 'GITHUB');

    const visibility = isPrivate ? '--private' : '--public';
    let command = `gh repo create ${repoName} ${visibility}`;

    if (description) {
      command += ` --description "${description}"`;
    }

    if (homepage) {
      command += ` --homepage "${homepage}"`;
    }

    const result = ShellUtils.execWithOutput(command);

    if (result.success) {
      Logger.success(`Repository ${repoName} created successfully`, 'GITHUB');
      return true;
    } else {
      Logger.error(`Failed to create repository: ${result.error}`, 'GITHUB');
      return false;
    }
  }

  async initializeRepository() {
    Logger.info('Initializing Git repository...', 'GIT');

    const commands = [
      'git init',
      'git add .',
      'git commit -m "Initial commit"'
    ];

    for (const command of commands) {
      const result = ShellUtils.safeGitOperation(command.replace('git ', ''), this.repoPath);
      if (!result.success) {
        Logger.error(`Git initialization failed at: ${command}`, 'GIT');
        return false;
      }
    }

    Logger.success('Repository initialized successfully', 'GIT');
    return true;
  }

  async addRemoteOrigin(repoUrl) {
    Logger.info('Adding remote origin...', 'GIT');

    const result = ShellUtils.safeGitOperation(`remote add origin ${repoUrl}`, this.repoPath);

    if (result.success) {
      Logger.success('Remote origin added successfully', 'GIT');
      return true;
    } else {
      Logger.error(`Failed to add remote origin: ${result.error}`, 'GIT');
      return false;
    }
  }

  async pushToRemote(branch = 'main') {
    Logger.info(`Pushing to remote branch: ${branch}`, 'GIT');

    const result = ShellUtils.safeGitOperation(`push -u origin ${branch}`, this.repoPath);

    if (result.success) {
      Logger.success('Pushed to remote successfully', 'GIT');
      return true;
    } else {
      Logger.error(`Failed to push to remote: ${result.error}`, 'GIT');
      return false;
    }
  }

  async commitChanges(message) {
    Logger.info('Committing changes...', 'GIT');

    const status = ShellUtils.checkGitStatus(this.repoPath);

    if (!status.hasChanges) {
      Logger.info('No changes to commit', 'GIT');
      return true;
    }

    const commands = [
      'add .',
      `commit -m "${message}"`
    ];

    for (const command of commands) {
      const result = ShellUtils.safeGitOperation(command, this.repoPath);
      if (!result.success) {
        Logger.error(`Git commit failed at: ${command}`, 'GIT');
        return false;
      }
    }

    Logger.success('Changes committed successfully', 'GIT');
    return true;
  }

  async syncWithRemote() {
    Logger.info('Syncing with remote repository...', 'GIT');

    const commands = [
      'fetch origin',
      'pull origin main --rebase'
    ];

    for (const command of commands) {
      const result = ShellUtils.safeGitOperation(command, this.repoPath);
      if (!result.success) {
        Logger.warning(`Sync command failed: ${command}`, 'GIT');
        // Continue with other commands
      }
    }

    Logger.success('Sync completed', 'GIT');
    return true;
  }

  async checkRepositoryExists(repoName) {
    const result = ShellUtils.execWithOutput(`gh repo view ${repoName}`);
    return result.success;
  }

  async cloneRepository(repoUrl, targetPath) {
    Logger.info(`Cloning repository: ${repoUrl}`, 'GITHUB');

    const result = ShellUtils.execWithOutput(`git clone ${repoUrl} ${targetPath}`);

    if (result.success) {
      Logger.success('Repository cloned successfully', 'GITHUB');
      return true;
    } else {
      Logger.error(`Failed to clone repository: ${result.error}`, 'GITHUB');
      return false;
    }
  }

  async setupRepositoryFromPackage(packagePath, repoName, options = {}) {
    Logger.header(`Setting up GitHub repository for ${repoName}`);

    // 1. Create GitHub repository
    const created = await this.createRepository(repoName, options);
    if (!created) return false;

    // 2. Initialize Git repository
    const initialized = await this.initializeRepository();
    if (!initialized) return false;

    // 3. Add remote origin
    const repoUrl = `https://github.com/${options.owner || 'tamylaa'}/${repoName}.git`;
    const remoteAdded = await this.addRemoteOrigin(repoUrl);
    if (!remoteAdded) return false;

    // 4. Push to remote
    const pushed = await this.pushToRemote();
    if (!pushed) return false;

    Logger.success(`Repository ${repoName} setup completed successfully`, 'GITHUB');
    return true;
  }

  static async checkGitHubAuth() {
    const result = ShellUtils.execWithOutput('gh auth status');
    return {
      authenticated: result.success,
      status: result.output || result.error
    };
  }
}
