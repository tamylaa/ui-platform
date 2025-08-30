#!/usr/bin/env node
/**
 * Shell and Command Utilities
 * Centralized shell command execution with error handling
 */

import { execSync } from 'child_process';
import chalk from 'chalk';

export class ShellUtils {
  static execWithOutput(command, options = {}) {
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        stdio: 'pipe',
        ...options
      });
      return { success: true, output: output.trim() };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        output: error.stdout?.toString() || ''
      };
    }
  }

  static execSilent(command, options = {}) {
    try {
      execSync(command, {
        stdio: 'ignore',
        ...options
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static execWithLiveOutput(command, options = {}) {
    try {
      execSync(command, {
        stdio: 'inherit',
        ...options
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async safeGitOperation(command, cwd) {
    console.log(chalk.gray(`   Running: git ${command}`));

    const result = this.execWithOutput(`git ${command}`, { cwd });

    if (!result.success) {
      // Handle common git conflicts
      if (result.error.includes('divergent branches')) {
        console.log(chalk.yellow('   Resolving divergent branches...'));
        const pullResult = this.execWithOutput('git pull --rebase', { cwd });
        if (pullResult.success) {
          return this.execWithOutput(`git ${command}`, { cwd });
        }
      }

      if (result.error.includes('conflict')) {
        console.log(chalk.yellow('   Auto-resolving conflicts...'));
        this.execSilent('git add .', { cwd });
        this.execSilent('git commit -m "Auto-resolve conflicts"', { cwd });
        return this.execWithOutput(`git ${command}`, { cwd });
      }
    }

    return result;
  }

  static checkGitStatus(cwd) {
    const result = this.execWithOutput('git status --porcelain', { cwd });
    return {
      hasChanges: result.success && result.output.length > 0,
      changes: result.output.split('\n').filter(line => line.trim())
    };
  }

  static checkNpmAuth() {
    const result = this.execWithOutput('npm whoami');
    return {
      authenticated: result.success,
      user: result.output
    };
  }

  static checkGitAuth() {
    const result = this.execWithOutput('git config user.name');
    return {
      configured: result.success,
      user: result.output
    };
  }
}
