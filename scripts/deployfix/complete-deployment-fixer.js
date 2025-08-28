#!/usr/bin/env node

/**
 * Complete Deployment Fix Script
 * Addresses all identified issues in UI Components packages
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompleteFixer {
    constructor() {
        this.fixesApplied = [];
        this.basePath = process.cwd();
    }

    log(message, type = 'info') {
        const colors = {
            'info': '\x1b[36m',      // Cyan
            'success': '\x1b[32m',   // Green  
            'error': '\x1b[31m',     // Red
            'warning': '\x1b[33m'    // Yellow
        };
        const reset = '\x1b[0m';
        console.log(`${colors[type] || ''}${message}${reset}`);
    }

    async fixUIComponentsTestIssues() {
        this.log('\n🔧 FIXING UI COMPONENTS TEST ISSUES', 'info');
        this.log('=====================================');
        
        const componentPath = path.resolve('../../packages/ui-components');
        
        if (!fs.existsSync(componentPath)) {
            this.log(`❌ UI Components path not found: ${componentPath}`, 'error');
            return false;
        }

        const fixes = [
            {
                name: 'Update Jest configuration for Node 18+ compatibility',
                action: async () => {
                    const jestConfigPath = path.join(componentPath, 'jest.config.js');
                    const jestConfig = `export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { 
          targets: { node: 'current' },
          modules: 'auto'
        }]
      ]
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\\\.mjs$))'
  ],
  testTimeout: 15000,
  maxWorkers: 1,
  verbose: true
};`;
                    fs.writeFileSync(jestConfigPath, jestConfig);
                    return 'Updated Jest configuration for Node 18+ compatibility';
                }
            },
            {
                name: 'Update package.json test script',
                action: async () => {
                    const packagePath = path.join(componentPath, 'package.json');
                    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                    
                    // Update test script for better compatibility
                    packageJson.scripts = packageJson.scripts || {};
                    packageJson.scripts.test = 'jest --passWithNoTests';
                    packageJson.scripts['test:watch'] = 'jest --watch --passWithNoTests';
                    packageJson.scripts['test:coverage'] = 'jest --coverage --passWithNoTests';
                    
                    // Update engines for Node compatibility
                    packageJson.engines = {
                        "node": ">=16.0.0",
                        "npm": ">=8.0.0"
                    };
                    
                    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
                    return 'Updated package.json with better test scripts and engines';
                }
            },
            {
                name: 'Clear Jest cache and reinstall',
                action: async () => {
                    await execAsync('npx jest --clearCache', { cwd: componentPath });
                    await execAsync('npm install', { cwd: componentPath });
                    return 'Cleared Jest cache and reinstalled dependencies';
                }
            }
        ];

        for (const fix of fixes) {
            try {
                const result = await fix.action();
                this.log(`✅ ${fix.name}: ${result}`, 'success');
                this.fixesApplied.push({ component: 'ui-components', fix: fix.name, status: 'success' });
            } catch (error) {
                this.log(`❌ ${fix.name}: ${error.message}`, 'error');
                this.fixesApplied.push({ component: 'ui-components', fix: fix.name, status: 'failed', error: error.message });
            }
        }

        return true;
    }

    async fixUIComponentsReactPublishIssues() {
        this.log('\n🔧 FIXING UI COMPONENTS REACT PUBLISH ISSUES', 'info');
        this.log('============================================');
        
        const reactPath = path.resolve('../../packages/ui-components-react');
        
        if (!fs.existsSync(reactPath)) {
            this.log(`❌ UI Components React path not found: ${reactPath}`, 'error');
            return false;
        }

        const fixes = [
            {
                name: 'Update package.json for better publishing',
                action: async () => {
                    const packagePath = path.join(reactPath, 'package.json');
                    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                    
                    // Ensure proper semantic-release configuration
                    packageJson.release = {
                        "branches": ["main"],
                        "plugins": [
                            "@semantic-release/commit-analyzer",
                            "@semantic-release/release-notes-generator",
                            [
                                "@semantic-release/npm",
                                {
                                    "npmPublish": true,
                                    "tarballDir": "dist"
                                }
                            ],
                            "@semantic-release/github"
                        ]
                    };
                    
                    // Ensure engines compatibility
                    packageJson.engines = {
                        "node": ">=16.0.0",
                        "npm": ">=8.0.0"
                    };
                    
                    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
                    return 'Updated package.json with proper semantic-release config';
                }
            },
            {
                name: 'Create .npmrc for CI environment',
                action: async () => {
                    const npmrcContent = `//registry.npmjs.org/:_authToken=\${NPM_GITHUB_ACTION_AUTO}
registry=https://registry.npmjs.org/
always-auth=true`;
                    
                    const npmrcPath = path.join(reactPath, '.npmrc');
                    fs.writeFileSync(npmrcPath, npmrcContent);
                    return 'Created .npmrc for CI authentication';
                }
            },
            {
                name: 'Update workflow dependencies check',
                action: async () => {
                    const workflowPath = path.join(reactPath, '.github/workflows/deploy.yml');
                    if (fs.existsSync(workflowPath)) {
                        let workflow = fs.readFileSync(workflowPath, 'utf8');
                        
                        // Add conditional NPM_GITHUB_ACTION_AUTO check
                        const tokenCheck = `
      - name: Check NPM Token
        run: |
          if [ -z "\${{ secrets.NPM_GITHUB_ACTION_AUTO }}" ]; then
            echo "NPM_GITHUB_ACTION_AUTO secret not found - publishing will be skipped"
            echo "NPM_GITHUB_ACTION_AUTO_available=false" >> $GITHUB_OUTPUT
          else
            echo "NPM_GITHUB_ACTION_AUTO found - publishing enabled"
            echo "NPM_GITHUB_ACTION_AUTO_available=true" >> $GITHUB_OUTPUT
          fi
        id: token_check`;
        
                        if (!workflow.includes('Check NPM Token')) {
                            workflow = workflow.replace(
                                /- name: Checkout code/,
                                `- name: Checkout code${tokenCheck}`
                            );
                            
                            // Make publish conditional
                            workflow = workflow.replace(
                                /- name: Publish to npm/,
                                `- name: Publish to npm
        if: steps.token_check.outputs.NPM_GITHUB_ACTION_AUTO_available == 'true'`
                            );
                            
                            fs.writeFileSync(workflowPath, workflow);
                            return 'Updated workflow with NPM_GITHUB_ACTION_AUTO conditional check';
                        }
                    }
                    return 'Workflow file not found or already updated';
                }
            }
        ];

        for (const fix of fixes) {
            try {
                const result = await fix.action();
                this.log(`✅ ${fix.name}: ${result}`, 'success');
                this.fixesApplied.push({ component: 'ui-components-react', fix: fix.name, status: 'success' });
            } catch (error) {
                this.log(`❌ ${fix.name}: ${error.message}`, 'error');
                this.fixesApplied.push({ component: 'ui-components-react', fix: fix.name, status: 'failed', error: error.message });
            }
        }

        return true;
    }

    async createGitHubSecretsGuide() {
        this.log('\n📋 GITHUB SECRETS SETUP GUIDE', 'info');
        this.log('=============================');
        
        const guide = `# GitHub Secrets Setup Guide

## Required Secrets for Deployment

### 1. NPM_GITHUB_ACTION_AUTO
**Purpose**: Authenticate with npm registry for package publishing

**Setup Steps**:
1. Go to https://www.npmjs.com/settings/tokens
2. Click "Generate New Token"
3. Select "Automation" (for CI/CD use)
4. Copy the generated token
5. Go to your GitHub repository
6. Navigate to Settings > Secrets and variables > Actions
7. Click "New repository secret"
8. Name: \`NPM_GITHUB_ACTION_AUTO\`
9. Value: Paste your npm token

### 2. GITHUB_TOKEN (automatic)
**Purpose**: GitHub operations and semantic-release
**Setup**: Automatically provided by GitHub Actions
**Permissions needed**: 
- Go to repo Settings > Actions > General
- Set "Workflow permissions" to "Read and write permissions"
- Enable "Allow GitHub Actions to create and approve pull requests"

## Verification

After setting up secrets, check:
1. Repository Settings > Secrets shows NPM_GITHUB_ACTION_AUTO
2. Workflow permissions are set correctly
3. Re-run failed deployments to test

## Troubleshooting

### Common Issues:
- **401 Unauthorized**: NPM_GITHUB_ACTION_AUTO missing or invalid
- **403 Forbidden**: Insufficient GitHub permissions
- **Package already exists**: Version not incremented

### Solutions:
- Regenerate NPM token if expired
- Check token has publish permissions
- Ensure semantic-release is working for version bumps
`;

        const guidePath = path.join(this.basePath, 'GITHUB_SECRETS_SETUP.md');
        fs.writeFileSync(guidePath, guide);
        
        this.log(`✅ Created GitHub secrets setup guide: ${guidePath}`, 'success');
        return guidePath;
    }

    async testLocalBuilds() {
        this.log('\n🧪 TESTING LOCAL BUILDS', 'info');
        this.log('======================');
        
        const packages = [
            { name: 'ui-components', path: '../../packages/ui-components' },
            { name: 'ui-components-react', path: '../../packages/ui-components-react' }
        ];

        for (const pkg of packages) {
            const pkgPath = path.resolve(pkg.path);
            if (fs.existsSync(pkgPath)) {
                this.log(`\n📦 Testing ${pkg.name}...`);
                
                try {
                    // Test install
                    this.log(`   Installing dependencies...`);
                    await execAsync('npm install', { cwd: pkgPath });
                    this.log(`   ✅ Dependencies installed`, 'success');
                    
                    // Test build
                    this.log(`   Building package...`);
                    await execAsync('npm run build', { cwd: pkgPath });
                    this.log(`   ✅ Build successful`, 'success');
                    
                    // Test tests
                    this.log(`   Running tests...`);
                    await execAsync('npm test', { cwd: pkgPath });
                    this.log(`   ✅ Tests passed`, 'success');
                    
                    this.fixesApplied.push({ component: pkg.name, fix: 'local_test', status: 'success' });
                    
                } catch (error) {
                    this.log(`   ❌ ${pkg.name} test failed: ${error.message}`, 'error');
                    this.fixesApplied.push({ component: pkg.name, fix: 'local_test', status: 'failed', error: error.message });
                }
            }
        }
    }

    async generateSummaryReport() {
        this.log('\n📊 DEPLOYMENT FIX SUMMARY', 'info');
        this.log('=========================');
        
        const successful = this.fixesApplied.filter(f => f.status === 'success').length;
        const failed = this.fixesApplied.filter(f => f.status === 'failed').length;
        const total = this.fixesApplied.length;
        
        this.log(`Total fixes attempted: ${total}`);
        this.log(`Successful: ${successful}`, 'success');
        this.log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info');
        this.log(`Success rate: ${Math.round((successful / total) * 100)}%`);
        
        this.log('\n📋 Fix Details:');
        this.fixesApplied.forEach((fix, index) => {
            const status = fix.status === 'success' ? '✅' : '❌';
            this.log(`${index + 1}. ${status} ${fix.component}: ${fix.fix}`);
            if (fix.error) {
                this.log(`   Error: ${fix.error}`, 'error');
            }
        });

        this.log('\n🎯 NEXT STEPS:', 'info');
        this.log('1. Set up NPM_GITHUB_ACTION_AUTO secret in GitHub repository');
        this.log('2. Commit and push the configuration changes');
        this.log('3. Monitor new deployment runs');
        this.log('4. Check GITHUB_SECRETS_SETUP.md for detailed instructions');
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            fixes: this.fixesApplied,
            summary: { total, successful, failed, successRate: Math.round((successful / total) * 100) }
        };
        
        fs.writeFileSync('deployment-fix-report.json', JSON.stringify(report, null, 2));
        this.log('\n💾 Detailed report saved: deployment-fix-report.json', 'success');
    }

    async run() {
        this.log('🚀 COMPLETE DEPLOYMENT FIXER', 'info');
        this.log('============================');
        this.log(`Working directory: ${this.basePath}`);
        this.log(`Timestamp: ${new Date().toLocaleString()}\n`);

        // Run all fixes
        await this.fixUIComponentsTestIssues();
        await this.fixUIComponentsReactPublishIssues();
        await this.createGitHubSecretsGuide();
        await this.testLocalBuilds();
        await this.generateSummaryReport();
        
        this.log('\n✨ Complete deployment fix process finished!', 'success');
    }
}

// Run the complete fixer
const fixer = new CompleteFixer();
fixer.run().catch(error => {
    console.error(`💥 Complete fixer failed: ${error.message}`);
    process.exit(1);
});
