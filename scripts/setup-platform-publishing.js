#!/usr/bin/env node
/**
 * UI Platform Publishing Setup
 * Creates repository and publishing process for ui-platform
 */

import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';

class UIPlatformPublisher {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.platformPath = this.workspaceRoot; // ui-platform is the root
    this.tempPath = path.join(this.workspaceRoot, 'temp/ui-platform-publish');
  }

  async setupPlatformPublishing() {
    console.log(chalk.blue.bold('\n🏗️ UI Platform Publishing Setup'));
    console.log(chalk.gray('=' .repeat(60)));

    try {
      // Step 1: Analyze current platform
      await this.analyzePlatform();
      
      // Step 2: Prepare publishing package
      await this.preparePlatformPackage();
      
      // Step 3: Create repository setup guide
      await this.createRepositoryGuide();
      
      // Step 4: Test publishing
      await this.testPlatformPublish();
      
      console.log(chalk.green.bold('\n✅ UI Platform ready for publishing!'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Setup failed:'), error.message);
      throw error;
    }
  }

  async analyzePlatform() {
    console.log(chalk.yellow('\n📋 Step 1: Analyzing UI Platform...'));
    
    const packageJsonPath = path.join(this.platformPath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    console.log(chalk.gray(`   ✓ Package: ${packageJson.name}@${packageJson.version}`));
    console.log(chalk.gray(`   ✓ Description: ${packageJson.description}`));
    
    // Check platform structure
    const srcExists = await fs.pathExists(path.join(this.platformPath, 'src'));
    const distExists = await fs.pathExists(path.join(this.platformPath, 'dist'));
    
    console.log(chalk.gray(`   ✓ Source code: ${srcExists ? '✅ src/' : '❌ Missing src/'}`));
    console.log(chalk.gray(`   ✓ Built dist: ${distExists ? '✅ dist/' : '❌ Missing dist/'}`));
    
    // Check exports
    const exports = packageJson.exports || {};
    const exportCount = Object.keys(exports).length;
    console.log(chalk.gray(`   ✓ Package exports: ${exportCount} entry points`));
    
    return { packageJson, srcExists, distExists, exportCount };
  }

  async preparePlatformPackage() {
    console.log(chalk.yellow('\n📦 Step 2: Preparing platform package...'));
    
    // Clean and create temp directory
    await fs.remove(this.tempPath);
    await fs.ensureDir(this.tempPath);
    
    // Copy platform contents (excluding workspace packages)
    await this.copyPlatformContents();
    
    // Update package.json for publishing
    await this.updatePlatformPackageJson();
    
    console.log(chalk.gray('   ✓ Platform package prepared'));
  }

  async copyPlatformContents() {
    const excludePatterns = [
      'packages', // Exclude workspace packages
      'node_modules', 'temp', '.npm', '.cache',
      'coverage', '.nyc_output', 'tmp',
      '.DS_Store', 'Thumbs.db', '*.log',
      '.env', '.env.local', '.git'
    ];

    const items = await fs.readdir(this.platformPath);
    
    for (const item of items) {
      if (!excludePatterns.includes(item) && !item.startsWith('.')) {
        const sourcePath = path.join(this.platformPath, item);
        const destPath = path.join(this.tempPath, item);
        await fs.copy(sourcePath, destPath);
        console.log(chalk.gray(`     ✓ ${item}`));
      }
    }
  }

  async updatePlatformPackageJson() {
    console.log(chalk.gray('   📝 Updating package.json for publishing...'));
    
    const packageJsonPath = path.join(this.tempPath, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    
    // Update dependencies from file: to npm versions
    if (packageJson.dependencies) {
      if (packageJson.dependencies['@tamyla/ui-components']) {
        packageJson.dependencies['@tamyla/ui-components'] = '^2.0.0';
      }
      if (packageJson.dependencies['@tamyla/ui-components-react']) {
        packageJson.dependencies['@tamyla/ui-components-react'] = '^1.0.0';
      }
    }
    
    // Remove workspace configuration for publishing
    delete packageJson.workspaces;
    
    // Update repository info
    packageJson.repository = {
      type: 'git',
      url: 'https://github.com/tamylaa/ui-platform.git'
    };
    packageJson.bugs = {
      url: 'https://github.com/tamylaa/ui-platform/issues'
    };
    packageJson.homepage = 'https://github.com/tamylaa/ui-platform#readme';
    
    // Add keywords
    packageJson.keywords = [
      'ui-platform',
      'ui-components',
      'react',
      'vanilla-js',
      'typescript',
      'design-system',
      'factory-pattern',
      'orchestration',
      'tamyla'
    ];
    
    // Ensure proper files field
    packageJson.files = [
      'dist/**/*',
      'README.md',
      'LICENSE',
      'CHANGELOG.md'
    ];
    
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    console.log(chalk.gray('     ✓ Dependencies updated for NPM'));
    console.log(chalk.gray('     ✓ Workspace configuration removed'));
    console.log(chalk.gray('     ✓ Repository information added'));
  }

  async createRepositoryGuide() {
    console.log(chalk.yellow('\n📋 Step 3: Creating repository setup guide...'));
    
    const guide = `# UI Platform Repository Setup Guide

## 🎯 Repository Creation

Since you already have repositories for ui-components and ui-components-react, 
you need to create a third repository for ui-platform:

### Create Repository
\`\`\`bash
# On GitHub, create: https://github.com/tamylaa/ui-platform
\`\`\`

### Initialize Repository
\`\`\`bash
# Clone the new repository
git clone https://github.com/tamylaa/ui-platform.git
cd ui-platform

# Copy platform contents
cp -r ${this.tempPath}/* .

# Initial commit
git add .
git commit -m "Initial ui-platform release"
git push origin main
\`\`\`

## 📦 Publishing Process

### 1. Repository Structure
The ui-platform package contains:
- **Orchestration Layer**: Platform class with framework adapters
- **Core Utilities**: Token and theme management
- **Build System**: Rollup with TypeScript
- **Dependencies**: Links to published ui-components packages

### 2. Dependencies
- \`@tamyla/ui-components: ^2.0.0\` (published ✅)
- \`@tamyla/ui-components-react: ^1.0.0\` (published ✅)

### 3. Package Features
- **Framework Agnostic**: Auto-detects vanilla JS or React
- **Unified API**: Single entry point for all UI components
- **Design Tokens**: Centralized theming system
- **TypeScript**: Full type definitions
- **Tree Shaking**: Optimized bundles

### 4. Publishing Commands
\`\`\`bash
# In the ui-platform repository
npm install
npm run build
npm run test
npm publish --dry-run  # Test first
npm publish           # Actual publish
\`\`\`

## 🔄 Complete Publishing Strategy

With all three packages, you'll have:

1. **@tamyla/ui-components** (Vanilla JS foundation)
2. **@tamyla/ui-components-react** (React bridge layer)
3. **@tamyla/ui-platform** (Orchestration layer)

Consumers can choose what they need:
- Vanilla only: Install ui-components
- React only: Install ui-components-react (includes ui-components)
- Full platform: Install ui-platform (includes both)

## 🎉 Benefits
- **Architectural Independence**: Each package has its own lifecycle
- **Consumer Choice**: Install only what's needed
- **Clean Separation**: Factory bridge pattern preserved
- **Professional Distribution**: Standard NPM packages
`;

    await fs.writeFile(path.join(this.tempPath, 'REPOSITORY_SETUP.md'), guide);
    console.log(chalk.gray('   ✓ Repository setup guide created'));
  }

  async testPlatformPublish() {
    console.log(chalk.yellow('\n🧪 Step 4: Testing platform publish...'));
    
    const originalCwd = process.cwd();
    
    try {
      process.chdir(this.tempPath);
      
      // Install dependencies
      console.log(chalk.gray('   📦 Installing dependencies...'));
      execSync('npm install --legacy-peer-deps', { stdio: 'pipe' });
      
      // Build platform
      console.log(chalk.gray('   🔨 Building platform...'));
      execSync('npm run build', { stdio: 'pipe' });
      
      // Test publish
      console.log(chalk.gray('   🧪 Testing publish (dry run)...'));
      execSync('npm publish --dry-run', { stdio: 'pipe' });
      
      console.log(chalk.green('   ✅ Platform ready for publishing!'));
      
    } catch (error) {
      console.log(chalk.red('   ❌ Platform test failed:'), error.message);
      throw error;
    } finally {
      process.chdir(originalCwd);
    }
  }
}

// Run setup
const publisher = new UIPlatformPublisher();
publisher.setupPlatformPublishing().catch(console.error);
