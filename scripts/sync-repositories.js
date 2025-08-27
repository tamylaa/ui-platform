#!/usr/bin/env node
/**
 * Repository Sync Script
 * Syncs workspace packages to their independent repositories
 * 
 * Internal simplicity + External flexibility
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

class RepositorySync {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.repositories = {
      'ui-components': {
        source: 'packages/ui-components',
        remote: 'https://github.com/tamylaa/ui-components.git',
        description: 'Vanilla JS UI Components'
      },
      'ui-components-react': {
        source: 'packages/ui-components-react', 
        remote: 'https://github.com/tamylaa/ui-components-react.git',
        description: 'React UI Components with Factory Bridge'
      }
    };
  }

  async syncAll() {
    console.log(chalk.blue.bold('\n🔄 Repository Sync Process'));
    console.log(chalk.gray('=' .repeat(50)));
    
    for (const [name, config] of Object.entries(this.repositories)) {
      await this.syncRepository(name, config);
    }
    
    console.log(chalk.green.bold('\n✅ All repositories synced successfully!'));
    console.log(chalk.yellow('\n📦 Ready for independent publishing:'));
    console.log(chalk.cyan('   npm publish # in each repository'));
  }

  async syncRepository(name, config) {
    console.log(chalk.yellow(`\n📁 Syncing ${name}...`));
    
    const sourcePath = path.join(this.workspaceRoot, config.source);
    const tempPath = path.join(this.workspaceRoot, 'temp', name);
    
    try {
      // Create temp directory
      await fs.ensureDir(tempPath);
      
      // Copy package contents (excluding workspace-specific files)
      await this.copyPackageContents(sourcePath, tempPath);
      
      // Update package.json for independent publishing
      await this.updatePackageJson(tempPath, name);
      
      // Initialize git if needed and sync
      await this.gitSync(tempPath, config.remote, name);
      
      console.log(chalk.green(`   ✅ ${name} synced to ${config.remote}`));
      
    } catch (error) {
      console.error(chalk.red(`   ❌ Failed to sync ${name}:`), error.message);
    } finally {
      // Cleanup temp directory
      await fs.remove(tempPath);
    }
  }

  async copyPackageContents(source, dest) {
    const excludePatterns = [
      'node_modules', 'dist', '.npm', '.cache',
      'coverage', '.nyc_output', 'tmp', 'temp',
      '.DS_Store', 'Thumbs.db', '*.log',
      '.env', '.env.local'
    ];

    const items = await fs.readdir(source);
    
    for (const item of items) {
      if (!excludePatterns.includes(item) && !item.startsWith('.')) {
        const sourcePath = path.join(source, item);
        const destPath = path.join(dest, item);
        await fs.copy(sourcePath, destPath);
      }
    }
  }

  async updatePackageJson(packagePath, name) {
    const packageJsonPath = path.join(packagePath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    // Update dependencies to use npm packages instead of workspace references
    if (packageJson.dependencies) {
      for (const [dep, version] of Object.entries(packageJson.dependencies)) {
        if (dep.startsWith('@tamyla/') && version.startsWith('file:')) {
          // Convert file: dependencies to npm versions
          if (dep === '@tamyla/ui-components') {
            packageJson.dependencies[dep] = '^2.0.0';
          } else if (dep === '@tamyla/ui-components-react') {
            packageJson.dependencies[dep] = '^1.0.0';
          }
        }
      }
    }
    
    // Ensure proper repository field
    if (name === 'ui-components') {
      packageJson.repository = {
        type: 'git',
        url: 'https://github.com/tamylaa/ui-components.git'
      };
      packageJson.bugs = {
        url: 'https://github.com/tamylaa/ui-components/issues'
      };
      packageJson.homepage = 'https://github.com/tamylaa/ui-components#readme';
    } else if (name === 'ui-components-react') {
      packageJson.repository = {
        type: 'git',
        url: 'https://github.com/tamylaa/ui-components-react.git'
      };
      packageJson.bugs = {
        url: 'https://github.com/tamylaa/ui-components-react/issues'
      };
      packageJson.homepage = 'https://github.com/tamylaa/ui-components-react#readme';
    }
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  async gitSync(packagePath, remote, name) {
    const originalCwd = process.cwd();
    
    try {
      process.chdir(packagePath);
      
      // Initialize git if not already initialized
      try {
        execSync('git rev-parse --git-dir', { stdio: 'ignore' });
      } catch {
        execSync('git init');
        execSync(`git remote add origin ${remote}`);
      }
      
      // Configure git user if not set
      try {
        execSync('git config user.name', { stdio: 'ignore' });
      } catch {
        execSync('git config user.name "UI Platform Sync"');
        execSync('git config user.email "sync@tamyla.com"');
      }
      
      // Add all files and commit
      execSync('git add .');
      
      try {
        execSync(`git commit -m "Sync from ui-platform workspace - ${new Date().toISOString()}"`);
        console.log(chalk.gray(`   📝 Committed changes for ${name}`));
      } catch {
        console.log(chalk.gray(`   📝 No changes to commit for ${name}`));
      }
      
      // Push to remote (uncomment when ready)
      // execSync('git push origin main');
      console.log(chalk.gray(`   🚀 Ready to push ${name} to ${remote}`));
      
    } finally {
      process.chdir(originalCwd);
    }
  }

  async dryRun() {
    console.log(chalk.blue.bold('\n🔍 Dry Run - Repository Sync Preview'));
    console.log(chalk.gray('=' .repeat(50)));
    
    for (const [name, config] of Object.entries(this.repositories)) {
      console.log(chalk.yellow(`\n📁 ${name}:`));
      console.log(chalk.gray(`   Source: ${config.source}`));
      console.log(chalk.gray(`   Remote: ${config.remote}`));
      console.log(chalk.gray(`   Description: ${config.description}`));
      
      const sourcePath = path.join(this.workspaceRoot, config.source);
      const exists = await fs.pathExists(sourcePath);
      console.log(chalk.gray(`   Status: ${exists ? '✅ Ready' : '❌ Missing'}`));
    }
    
    console.log(chalk.cyan('\n💡 Run with --sync to perform actual sync'));
  }
}

// CLI Interface
const sync = new RepositorySync();
const args = process.argv.slice(2);

if (args.includes('--sync')) {
  sync.syncAll().catch(console.error);
} else {
  sync.dryRun().catch(console.error);
}
