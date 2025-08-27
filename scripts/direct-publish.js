#!/usr/bin/env node
/**
 * Direct Publishing Guide for UI Components React
 * Step-by-step publishing process
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

class DirectPublisher {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.reactPackagePath = path.join(this.workspaceRoot, 'packages/ui-components-react');
  }

  async publishGuide() {
    console.log(chalk.blue.bold('\n🚀 UI Components React - Direct Publishing Guide'));
    console.log(chalk.gray('=' .repeat(60)));

    // Step 1: Verify package is ready
    await this.verifyPackage();
    
    // Step 2: Update package.json for NPM
    await this.updateForNpm();
    
    // Step 3: Build the package
    await this.buildPackage();
    
    // Step 4: Test publishing (dry run)
    await this.testPublish();
    
    console.log(chalk.green.bold('\n✅ Ready for publishing!'));
    console.log(chalk.yellow('\n🔥 Final step: Run the actual publish command'));
    console.log(chalk.cyan('   npm publish'));
  }

  async verifyPackage() {
    console.log(chalk.yellow('\n📋 Step 1: Verifying package...'));
    
    const packageJsonPath = path.join(this.reactPackagePath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    console.log(chalk.gray(`   ✓ Package: ${packageJson.name}@${packageJson.version}`));
    console.log(chalk.gray(`   ✓ Description: ${packageJson.description}`));
    
    // Check if dist exists
    const distPath = path.join(this.reactPackagePath, 'dist');
    const distExists = await fs.pathExists(distPath);
    console.log(chalk.gray(`   ✓ Dist folder: ${distExists ? '✅ Exists' : '❌ Missing'}`));
    
    if (!distExists) {
      throw new Error('Dist folder missing - need to build first');
    }
  }

  async updateForNpm() {
    console.log(chalk.yellow('\n📝 Step 2: Updating dependencies for NPM...'));
    
    const packageJsonPath = path.join(this.reactPackagePath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    // Update file: dependency to npm version
    if (packageJson.dependencies && packageJson.dependencies['@tamyla/ui-components']) {
      if (packageJson.dependencies['@tamyla/ui-components'].startsWith('file:')) {
        packageJson.dependencies['@tamyla/ui-components'] = '^2.0.0';
        await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
        console.log(chalk.gray('   ✓ Updated @tamyla/ui-components to ^2.0.0'));
      } else {
        console.log(chalk.gray('   ✓ Dependencies already NPM-ready'));
      }
    }
  }

  async buildPackage() {
    console.log(chalk.yellow('\n🔨 Step 3: Building package...'));
    
    const originalCwd = process.cwd();
    
    try {
      process.chdir(this.reactPackagePath);
      
      // Clean build
      try {
        execSync('npm run clean', { stdio: 'inherit' });
        console.log(chalk.gray('   ✓ Cleaned previous build'));
      } catch {
        console.log(chalk.gray('   ℹ️ No clean script or already clean'));
      }
      
      // Build
      execSync('npm run build', { stdio: 'inherit' });
      console.log(chalk.gray('   ✓ Build completed'));
      
      // Build types
      try {
        execSync('npm run build:types', { stdio: 'inherit' });
        console.log(chalk.gray('   ✓ TypeScript declarations built'));
      } catch {
        console.log(chalk.gray('   ℹ️ Types already built or not needed'));
      }
      
    } finally {
      process.chdir(originalCwd);
    }
  }

  async testPublish() {
    console.log(chalk.yellow('\n🧪 Step 4: Testing publish (dry run)...'));
    
    const originalCwd = process.cwd();
    
    try {
      process.chdir(this.reactPackagePath);
      
      // Dry run
      execSync('npm publish --dry-run', { stdio: 'inherit' });
      console.log(chalk.green('   ✅ Dry run successful - package is ready!'));
      
    } catch (error) {
      console.log(chalk.red('   ❌ Dry run failed:'), error.message);
      throw error;
    } finally {
      process.chdir(originalCwd);
    }
  }
}

// Run the publishing guide
const publisher = new DirectPublisher();
publisher.publishGuide().catch(console.error);
