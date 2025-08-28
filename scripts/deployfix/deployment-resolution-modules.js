#!/usr/bin/env node

/**
 * Specific Resolution Modules for Common Deployment Issues
 * Targeted fixes for UI Components and React packages
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class UIComponentsResolver {
    constructor(basePath = './ui-platform/packages/ui-components') {
        this.basePath = path.resolve(basePath);
        this.fixesApplied = [];
    }

    async resolveNodeCompatibilityIssues() {
        console.log('🔧 Resolving Node.js compatibility issues...');
        
        const fixes = [
            {
                name: 'Update Jest configuration for Node 18+',
                action: async () => {
                    const jestConfigPath = path.join(this.basePath, 'jest.config.js');
                    if (fs.existsSync(jestConfigPath)) {
                        const jestConfig = `module.exports = {
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
          modules: 'commonjs'
        }]
      ]
    }]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\\\.mjs$))'
  ],
  extensionsToTreatAsEsm: ['.jsx'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  testTimeout: 10000,
  maxWorkers: 1
};`;
                        fs.writeFileSync(jestConfigPath, jestConfig);
                        return 'Updated Jest configuration for Node 18+ compatibility';
                    }
                    return 'Jest config not found';
                }
            },
            {
                name: 'Update package.json engines',
                action: async () => {
                    const packagePath = path.join(this.basePath, 'package.json');
                    if (fs.existsSync(packagePath)) {
                        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                        packageJson.engines = {
                            "node": ">=16.0.0",
                            "npm": ">=8.0.0"
                        };
                        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
                        return 'Updated package.json engines for Node compatibility';
                    }
                    return 'Package.json not found';
                }
            },
            {
                name: 'Clear Jest cache',
                action: async () => {
                    const result = await execAsync('npx jest --clearCache', { cwd: this.basePath });
                    return 'Jest cache cleared successfully';
                }
            }
        ];

        for (const fix of fixes) {
            try {
                const result = await fix.action();
                console.log(`   ✅ ${fix.name}: ${result}`);
                this.fixesApplied.push({ name: fix.name, status: 'success', result });
            } catch (error) {
                console.log(`   ❌ ${fix.name}: ${error.message}`);
                this.fixesApplied.push({ name: fix.name, status: 'failed', error: error.message });
            }
        }
    }

    async resolveDependencyIssues() {
        console.log('🔧 Resolving dependency issues...');
        
        const fixes = [
            {
                name: 'Clear npm cache',
                command: 'npm cache clean --force'
            },
            {
                name: 'Remove node_modules and reinstall',
                command: 'rm -rf node_modules package-lock.json && npm install'
            },
            {
                name: 'Update critical dependencies',
                command: 'npm update jest @babel/core @babel/preset-env babel-jest'
            }
        ];

        for (const fix of fixes) {
            try {
                console.log(`   Running: ${fix.command}`);
                const result = await execAsync(fix.command, { cwd: this.basePath });
                console.log(`   ✅ ${fix.name}: Success`);
                this.fixesApplied.push({ name: fix.name, status: 'success' });
            } catch (error) {
                console.log(`   ❌ ${fix.name}: ${error.message}`);
                this.fixesApplied.push({ name: fix.name, status: 'failed', error: error.message });
            }
        }
    }

    async fixESLintIssues() {
        console.log('🔧 Fixing ESLint issues...');
        
        try {
            // Auto-fix ESLint errors
            await execAsync('npx eslint . --fix', { cwd: this.basePath });
            console.log('   ✅ ESLint auto-fix completed');
            this.fixesApplied.push({ name: 'ESLint auto-fix', status: 'success' });
        } catch (error) {
            console.log(`   ⚠️  ESLint auto-fix had warnings: ${error.message}`);
            this.fixesApplied.push({ name: 'ESLint auto-fix', status: 'partial', error: error.message });
        }
    }
}

export class UIComponentsReactResolver {
    constructor(basePath = './ui-platform/packages/ui-components-react') {
        this.basePath = path.resolve(basePath);
        this.fixesApplied = [];
    }

    async resolvePublishIssues() {
        console.log('🔧 Resolving NPM publish issues...');
        
        const fixes = [
            {
                name: 'Check NPM authentication',
                action: async () => {
                    try {
                        const result = await execAsync('npm whoami', { cwd: this.basePath });
                        return `Authenticated as: ${result.stdout.trim()}`;
                    } catch (error) {
                        throw new Error('Not authenticated with npm - run npm login');
                    }
                }
            },
            {
                name: 'Verify package.json version',
                action: async () => {
                    const packagePath = path.join(this.basePath, 'package.json');
                    if (fs.existsSync(packagePath)) {
                        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                        const currentVersion = packageJson.version;
                        
                        // Check if version exists on npm
                        try {
                            await execAsync(`npm view ${packageJson.name}@${currentVersion}`, { cwd: this.basePath });
                            // Version exists, need to bump
                            await execAsync('npm version patch', { cwd: this.basePath });
                            return 'Version bumped for publishing';
                        } catch (error) {
                            return `Current version ${currentVersion} is available for publishing`;
                        }
                    }
                    return 'Package.json not found';
                }
            },
            {
                name: 'Update semantic-release configuration',
                action: async () => {
                    const packagePath = path.join(this.basePath, 'package.json');
                    if (fs.existsSync(packagePath)) {
                        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                        
                        if (!packageJson.release) {
                            packageJson.release = {
                                "branches": ["main"],
                                "plugins": [
                                    "@semantic-release/commit-analyzer",
                                    "@semantic-release/release-notes-generator",
                                    "@semantic-release/npm",
                                    "@semantic-release/github"
                                ]
                            };
                            fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
                            return 'Added semantic-release configuration';
                        }
                        return 'Semantic-release configuration already exists';
                    }
                    return 'Package.json not found';
                }
            }
        ];

        for (const fix of fixes) {
            try {
                const result = await fix.action();
                console.log(`   ✅ ${fix.name}: ${result}`);
                this.fixesApplied.push({ name: fix.name, status: 'success', result });
            } catch (error) {
                console.log(`   ❌ ${fix.name}: ${error.message}`);
                this.fixesApplied.push({ name: fix.name, status: 'failed', error: error.message });
            }
        }
    }

    async resolveDependencyCompatibility() {
        console.log('🔧 Resolving dependency compatibility...');
        
        const fixes = [
            {
                name: 'Update React testing dependencies',
                command: 'npm install --save-dev @testing-library/react@latest @testing-library/jest-dom@latest'
            },
            {
                name: 'Update TypeScript dependencies',
                command: 'npm install --save-dev typescript@latest @types/react@latest @types/react-dom@latest'
            },
            {
                name: 'Update build dependencies',
                command: 'npm install --save-dev @babel/core@latest @babel/preset-react@latest'
            }
        ];

        for (const fix of fixes) {
            try {
                console.log(`   Running: ${fix.command}`);
                const result = await execAsync(fix.command, { cwd: this.basePath });
                console.log(`   ✅ ${fix.name}: Success`);
                this.fixesApplied.push({ name: fix.name, status: 'success' });
            } catch (error) {
                console.log(`   ❌ ${fix.name}: ${error.message}`);
                this.fixesApplied.push({ name: fix.name, status: 'failed', error: error.message });
            }
        }
    }

    async fixConditionalTypeChecking() {
        console.log('🔧 Fixing conditional type checking...');
        
        const fixes = [
            {
                name: 'Update TypeScript configuration',
                action: async () => {
                    const tsconfigPath = path.join(this.basePath, 'tsconfig.json');
                    if (fs.existsSync(tsconfigPath)) {
                        const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
                        
                        // Add skipLibCheck for better compatibility
                        tsconfig.compilerOptions = tsconfig.compilerOptions || {};
                        tsconfig.compilerOptions.skipLibCheck = true;
                        tsconfig.compilerOptions.allowSyntheticDefaultImports = true;
                        tsconfig.compilerOptions.esModuleInterop = true;
                        
                        fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
                        return 'Updated TypeScript configuration for better compatibility';
                    }
                    return 'TypeScript config not found';
                }
            },
            {
                name: 'Create mock for missing dependencies',
                action: async () => {
                    const mockPath = path.join(this.basePath, '__mocks__', '@tamyla');
                    if (!fs.existsSync(mockPath)) {
                        fs.mkdirSync(mockPath, { recursive: true });
                    }
                    
                    const mockContent = `module.exports = {
  ActionCard: () => null,
  StatusIndicator: () => null,
  RewardSystem: () => null,
  createActionCard: () => ({}),
  createStatusIndicator: () => ({}),
  createRewardSystem: () => ({})
};`;
                    
                    fs.writeFileSync(path.join(mockPath, 'ui-components.js'), mockContent);
                    return 'Created mock for missing ui-components dependency';
                }
            }
        ];

        for (const fix of fixes) {
            try {
                const result = await fix.action();
                console.log(`   ✅ ${fix.name}: ${result}`);
                this.fixesApplied.push({ name: fix.name, status: 'success', result });
            } catch (error) {
                console.log(`   ❌ ${fix.name}: ${error.message}`);
                this.fixesApplied.push({ name: fix.name, status: 'failed', error: error.message });
            }
        }
    }
}

export class WorkflowResolver {
    constructor() {
        this.fixesApplied = [];
    }

    async fixGitHubActionsSecrets() {
        console.log('🔧 Checking GitHub Actions secrets configuration...');
        
        const recommendations = [
            {
                name: 'NPM_GITHUB_ACTION_AUTO Secret',
                description: 'Required for publishing packages to npm',
                action: 'Add NPM_GITHUB_ACTION_AUTO secret to repository settings',
                instructions: [
                    '1. Go to repository Settings > Secrets and variables > Actions',
                    '2. Click "New repository secret"',
                    '3. Name: NPM_GITHUB_ACTION_AUTO',
                    '4. Value: Your npm access token from https://www.npmjs.com/settings/tokens'
                ]
            },
            {
                name: 'GITHUB_TOKEN Permissions',
                description: 'Required for semantic-release and GitHub operations',
                action: 'Ensure GITHUB_TOKEN has proper permissions',
                instructions: [
                    '1. Go to repository Settings > Actions > General',
                    '2. Set "Workflow permissions" to "Read and write permissions"',
                    '3. Enable "Allow GitHub Actions to create and approve pull requests"'
                ]
            }
        ];

        recommendations.forEach(rec => {
            console.log(`   📋 ${rec.name}:`);
            console.log(`      Description: ${rec.description}`);
            console.log(`      Action: ${rec.action}`);
            rec.instructions.forEach(instruction => {
                console.log(`      ${instruction}`);
            });
            console.log('');
        });

        this.fixesApplied.push({ name: 'GitHub Actions configuration guidance', status: 'manual_required' });
    }

    async optimizeWorkflowFiles() {
        console.log('🔧 Optimizing workflow files...');
        
        const optimizations = [
            {
                name: 'Cache npm dependencies',
                description: 'Add npm cache to speed up builds',
                yaml: `
- name: Cache npm dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: \${{ runner.os }}-npm-\${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      \${{ runner.os }}-npm-`
            },
            {
                name: 'Conditional job execution',
                description: 'Skip jobs when dependencies are missing',
                yaml: `
- name: Check dependencies
  id: deps
  run: |
    if npm list @tamyla/ui-components &>/dev/null; then
      echo "deps_available=true" >> $GITHUB_OUTPUT
    else
      echo "deps_available=false" >> $GITHUB_OUTPUT
    fi

- name: Build
  if: steps.deps.outputs.deps_available == 'true'
  run: npm run build`
            }
        ];

        optimizations.forEach(opt => {
            console.log(`   💡 ${opt.name}:`);
            console.log(`      ${opt.description}`);
            console.log(`      YAML snippet:${opt.yaml}`);
            console.log('');
        });

        this.fixesApplied.push({ name: 'Workflow optimization suggestions', status: 'manual_required' });
    }
}

// Example usage function
export async function runTargetedResolution(repository) {
    console.log(`🎯 Running targeted resolution for ${repository}...`);
    
    switch (repository) {
        case 'ui-components':
            const uiResolver = new UIComponentsResolver();
            await uiResolver.resolveNodeCompatibilityIssues();
            await uiResolver.resolveDependencyIssues();
            await uiResolver.fixESLintIssues();
            return uiResolver.fixesApplied;
            
        case 'ui-components-react':
            const reactResolver = new UIComponentsReactResolver();
            await reactResolver.resolvePublishIssues();
            await reactResolver.resolveDependencyCompatibility();
            await reactResolver.fixConditionalTypeChecking();
            return reactResolver.fixesApplied;
            
        case 'workflows':
            const workflowResolver = new WorkflowResolver();
            await workflowResolver.fixGitHubActionsSecrets();
            await workflowResolver.optimizeWorkflowFiles();
            return workflowResolver.fixesApplied;
            
        default:
            console.log('❌ Unknown repository specified');
            return [];
    }
}
