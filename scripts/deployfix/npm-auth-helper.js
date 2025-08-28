#!/usr/bin/env node

/**
 * NPM Authentication Helper
 * Handles NPM authentication issues for deployment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class NPMAuthHelper {
    constructor(workingDir = process.cwd()) {
        this.workingDir = workingDir;
    }

    async checkAuthStatus() {
        console.log('🔍 Checking NPM authentication status...');
        
        try {
            const result = await execAsync('npm whoami', { cwd: this.workingDir });
            const username = result.stdout.trim();
            console.log(`✅ Authenticated as: ${username}`);
            return { authenticated: true, username };
        } catch (error) {
            console.log(`❌ Not authenticated: ${error.message}`);
            return { authenticated: false, error: error.message };
        }
    }

    async checkTokenEnvironment() {
        console.log('🔍 Checking NPM_GITHUB_ACTION_AUTO environment variable...');
        
        const npmToken = process.env.NPM_GITHUB_ACTION_AUTO;
        if (npmToken) {
            const maskedToken = npmToken.substring(0, 8) + '***';
            console.log(`✅ NPM_GITHUB_ACTION_AUTO found: ${maskedToken}`);
            return { hasToken: true, masked: maskedToken };
        } else {
            console.log(`❌ NPM_GITHUB_ACTION_AUTO not found in environment`);
            return { hasToken: false };
        }
    }

    async checkNpmrc() {
        console.log('🔍 Checking .npmrc configuration...');
        
        const npmrcPaths = [
            path.join(this.workingDir, '.npmrc'),
            path.join(process.env.HOME || process.env.USERPROFILE || '', '.npmrc')
        ];

        for (const npmrcPath of npmrcPaths) {
            if (fs.existsSync(npmrcPath)) {
                try {
                    const content = fs.readFileSync(npmrcPath, 'utf8');
                    const hasAuthToken = content.includes('//registry.npmjs.org/:_authToken=');
                    const hasRegistry = content.includes('registry=');
                    
                    console.log(`✅ Found .npmrc: ${npmrcPath}`);
                    console.log(`   Has auth token: ${hasAuthToken ? '✅' : '❌'}`);
                    console.log(`   Has registry config: ${hasRegistry ? '✅' : '❌'}`);
                    
                    return { 
                        found: true, 
                        path: npmrcPath, 
                        hasAuthToken, 
                        hasRegistry,
                        content: content.replace(/(_authToken=)[^\\n]+/g, '$1***')
                    };
                } catch (error) {
                    console.log(`⚠️  Could not read .npmrc: ${error.message}`);
                }
            }
        }
        
        console.log(`❌ No .npmrc files found`);
        return { found: false };
    }

    async validatePackageAccess(packageName) {
        console.log(`🔍 Checking publish access for ${packageName}...`);
        
        try {
            const result = await execAsync(`npm access list packages`, { cwd: this.workingDir });
            const packages = JSON.parse(result.stdout);
            
            if (packages[packageName]) {
                console.log(`✅ Have access to ${packageName}: ${packages[packageName]}`);
                return { hasAccess: true, level: packages[packageName] };
            } else {
                console.log(`❌ No access to ${packageName}`);
                return { hasAccess: false };
            }
        } catch (error) {
            console.log(`⚠️  Could not check package access: ${error.message}`);
            return { hasAccess: null, error: error.message };
        }
    }

    async setupNpmrcForCI() {
        console.log('🔧 Setting up .npmrc for CI environment...');
        
        const npmrcContent = `//registry.npmjs.org/:_authToken=\${NPM_GITHUB_ACTION_AUTO}
registry=https://registry.npmjs.org/
always-auth=true`;

        const npmrcPath = path.join(this.workingDir, '.npmrc');
        
        try {
            fs.writeFileSync(npmrcPath, npmrcContent);
            console.log(`✅ Created .npmrc for CI: ${npmrcPath}`);
            return { success: true, path: npmrcPath };
        } catch (error) {
            console.log(`❌ Failed to create .npmrc: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async generateAuthInstructions() {
        console.log('\n📋 NPM AUTHENTICATION SETUP INSTRUCTIONS');
        console.log('=========================================');
        
        const authStatus = await this.checkAuthStatus();
        const tokenStatus = await this.checkTokenEnvironment();
        const npmrcStatus = await this.checkNpmrc();

        if (!authStatus.authenticated && !tokenStatus.hasToken) {
            console.log('\n🔧 MANUAL SETUP REQUIRED:');
            console.log('1. Create NPM Access Token:');
            console.log('   → Go to https://www.npmjs.com/settings/tokens');
            console.log('   → Click "Generate New Token"');
            console.log('   → Select "Automation" for CI/CD use');
            console.log('   → Copy the generated token');
            console.log('');
            console.log('2. Set up local authentication:');
            console.log('   → Run: npm login');
            console.log('   → Enter your credentials');
            console.log('');
            console.log('3. Set up CI/CD authentication:');
            console.log('   → Add NPM_GITHUB_ACTION_AUTO secret to GitHub repository');
            console.log('   → Go to repo Settings > Secrets > Actions');
            console.log('   → Add secret: NPM_GITHUB_ACTION_AUTO = <your_token>');
        } else if (authStatus.authenticated && !tokenStatus.hasToken) {
            console.log('\n✅ Local authentication OK');
            console.log('⚠️  CI/CD setup needed:');
            console.log('   → Add NPM_GITHUB_ACTION_AUTO secret to GitHub repository');
            console.log('   → Token value: Get from npm profile settings');
        } else if (!authStatus.authenticated && tokenStatus.hasToken) {
            console.log('\n✅ CI/CD token configured');
            console.log('⚠️  Local authentication needed:');
            console.log('   → Run: npm login');
        } else {
            console.log('\n✅ Authentication appears properly configured');
        }

        return {
            authStatus,
            tokenStatus,
            npmrcStatus
        };
    }
}

// Quick diagnostic function
export async function diagnosePullishIssues(workingDir) {
    const helper = new NPMAuthHelper(workingDir);
    
    console.log(`🎯 DIAGNOSING NPM PUBLISH ISSUES`);
    console.log(`Working Directory: ${workingDir}`);
    console.log('================================\n');
    
    const results = await helper.generateAuthInstructions();
    
    // Check package.json
    const packagePath = path.join(workingDir, 'package.json');
    if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        console.log(`\n📦 Package: ${packageJson.name}@${packageJson.version}`);
        
        if (packageJson.publishConfig) {
            console.log(`✅ Publish config found: ${JSON.stringify(packageJson.publishConfig)}`);
        } else {
            console.log(`⚠️  No publishConfig in package.json`);
        }
        
        // Check if package exists on npm
        try {
            await execAsync(`npm view ${packageJson.name} version`);
            console.log(`✅ Package exists on npm registry`);
        } catch (error) {
            console.log(`⚠️  Package not found on npm registry (first publish?)`);
        }
    }
    
    return results;
}

// Run diagnostics if called directly
const scriptPath = fileURLToPath(import.meta.url);
const mainPath = process.argv[1];

if (scriptPath === mainPath || scriptPath === mainPath + '.js') {
    const workingDir = process.argv[2] || process.cwd();
    diagnosePullishIssues(workingDir).catch(console.error);
}
