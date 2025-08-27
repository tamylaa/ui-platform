#!/usr/bin/env node

/**
 * GitHub Repository Management Script
 * Automates repository creation, configuration, and publishing workflows
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GitHubRepoManager {
    constructor() {
        this.workspaceRoot = path.dirname(process.cwd()); // Go up one level from ui-platform
        this.uiPlatformRoot = process.cwd();
        this.tempDir = path.join(this.uiPlatformRoot, 'temp');
        this.defaultOwner = 'tamylaa';
    }

    showHelp() {
        console.log(`
🔧 GitHub Repository Management Tool

USAGE:
  node scripts/github-repo-manager.js <command> [options]

COMMANDS:
  help              Show this help message
  status            Show current repository status and configuration
  create <package>  Create new GitHub repository for package
  prepare <package> Prepare package for independent repository
  publish <package> Complete publish workflow (prepare + create + push)
  validate <name>   Validate repository exists and is properly configured
  sync <package>    Sync local package changes to remote repository
  list              List all available packages and their repository status

EXAMPLES:
  # Show current status
  node scripts/github-repo-manager.js status

  # Create repository for ui-platform
  node scripts/github-repo-manager.js create ui-platform

  # Complete publish workflow
  node scripts/github-repo-manager.js publish ui-platform

  # Validate existing repository
  node scripts/github-repo-manager.js validate ui-platform

OPTIONS:
  --owner <name>    Specify GitHub owner (default: tamylaa)
  --private         Create private repository
  --dry-run         Show what would be done without executing
  --force           Force overwrite existing files/repositories
  --template <url>  Use specific repository template

PREREQUISITES:
  - GitHub CLI (gh) installed and authenticated
  - Git configured with user credentials
  - NPM authenticated for publishing
  - Proper workspace structure

For detailed documentation, see: GITHUB_REPOSITORY_MANAGEMENT_GUIDE.md
        `);
    }

    async showStatus() {
        console.log('🔍 Repository Status Analysis\n');
        
        try {
            // Check GitHub CLI authentication
            execSync('gh auth status --hostname github.com', { stdio: 'pipe' });
            console.log('✅ GitHub CLI authenticated');
        } catch (error) {
            console.log('❌ GitHub CLI not authenticated. Run: gh auth login');
            return;
        }

        // Check available packages in workspace
        const packages = this.getAvailablePackages();
        console.log(`\n📦 Available Packages (${packages.length}):`);
        
        for (const pkg of packages) {
            const repoExists = await this.checkRepositoryExists(pkg);
            const status = repoExists ? '✅ Repository exists' : '⚠️  No repository';
            console.log(`  ${pkg.padEnd(20)} ${status}`);
        }

        // Check temp directories in ui-platform
        console.log('\n📁 UI Platform Temporary Directories:');
        if (fs.existsSync(this.tempDir)) {
            const tempContents = fs.readdirSync(this.tempDir);
            const publishDirs = tempContents.filter(dir => dir.endsWith('-publish'));
            
            if (publishDirs.length > 0) {
                publishDirs.forEach(dir => {
                    console.log(`  ✅ ${dir} (ready for publishing)`);
                });
            } else {
                console.log('  📂 No prepared packages found');
            }
        } else {
            console.log('  📂 No temp directory found');
        }

        // Check main workspace temp
        const mainTempDir = path.join(this.workspaceRoot, 'temp');
        console.log('\n📁 Main Workspace Temporary Directories:');
        if (fs.existsSync(mainTempDir)) {
            const tempContents = fs.readdirSync(mainTempDir);
            const publishDirs = tempContents.filter(dir => dir.endsWith('-publish'));
            
            if (publishDirs.length > 0) {
                publishDirs.forEach(dir => {
                    console.log(`  ✅ ${dir} (ready for publishing)`);
                });
            } else {
                console.log('  📂 No prepared packages found');
            }
        } else {
            console.log('  📂 No temp directory found');
        }

        console.log('\n🔧 Git Configuration:');
        try {
            const gitUser = execSync('git config user.name', { encoding: 'utf8' }).trim();
            const gitEmail = execSync('git config user.email', { encoding: 'utf8' }).trim();
            console.log(`  User: ${gitUser} <${gitEmail}>`);
        } catch (error) {
            console.log('  ❌ Git not configured');
        }
    }

    getAvailablePackages() {
        const packages = [];
        
        // Check main workspace packages
        const entries = fs.readdirSync(this.workspaceRoot, { withFileTypes: true });
        
        for (const entry of entries) {
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                const packageJsonPath = path.join(this.workspaceRoot, entry.name, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    try {
                        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                        if (packageJson.name && packageJson.name.startsWith('@tamyla/')) {
                            packages.push(entry.name);
                        }
                    } catch (error) {
                        // Skip invalid package.json files
                    }
                }
            }
        }
        
        return packages.sort();
    }

    async checkRepositoryExists(packageName) {
        try {
            const owner = this.getOwner();
            execSync(`gh repo view ${owner}/${packageName} --json name`, { 
                stdio: 'pipe',
                encoding: 'utf8'
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    async createRepository(packageName, options = {}) {
        const owner = options.owner || this.defaultOwner;
        const isPrivate = options.private || false;
        const dryRun = options.dryRun || false;
        
        console.log(`🏗️  Creating GitHub repository: ${owner}/${packageName}`);

        // Check if repository already exists
        const exists = await this.checkRepositoryExists(packageName);
        if (exists && !options.force) {
            console.log(`❌ Repository ${owner}/${packageName} already exists. Use --force to overwrite.`);
            return false;
        }

        // Check for prepared package
        let preparedDir = path.join(this.tempDir, `${packageName}-publish`);
        if (!fs.existsSync(preparedDir)) {
            // Check main workspace temp
            preparedDir = path.join(this.workspaceRoot, 'temp', `${packageName}-publish`);
            if (!fs.existsSync(preparedDir)) {
                console.log(`📦 Preparing package ${packageName}...`);
                await this.preparePackage(packageName, { dryRun });
            }
        }

        if (dryRun) {
            console.log('🔍 DRY RUN - Repository creation commands:');
            console.log(`  gh repo create ${owner}/${packageName} ${isPrivate ? '--private' : '--public'}`);
            console.log(`  cd ${preparedDir}`);
            console.log(`  git init`);
            console.log(`  git remote add origin https://github.com/${owner}/${packageName}.git`);
            console.log(`  git add .`);
            console.log(`  git commit -m "Initial commit"`);
            console.log(`  git branch -M main`);
            console.log(`  git push -u origin main`);
            return true;
        }

        try {
            // Create GitHub repository
            const visibility = isPrivate ? '--private' : '--public';
            const description = `${packageName} - Professional UI library component`;
            execSync(`gh repo create ${owner}/${packageName} ${visibility} --description "${description}"`, { 
                stdio: 'inherit' 
            });

            // Initialize git repository in prepared directory
            const originalDir = process.cwd();
            process.chdir(preparedDir);
            
            // Clean up problematic directories before git init
            this.cleanupForGit(preparedDir);
            
            // Create .gitignore to exclude problematic files
            this.createGitignore(preparedDir);
            
            execSync('git init', { stdio: 'inherit' });
            execSync(`git remote add origin https://github.com/${owner}/${packageName}.git`, { stdio: 'inherit' });
            
            // Add files more selectively to avoid issues
            console.log('📝 Adding files to git...');
            try {
                execSync('git add .gitignore package.json README.md LICENSE', { stdio: 'inherit' });
                execSync('git add src/ dist/ scripts/ *.md *.json *.js *.ts', { stdio: 'inherit' });
            } catch (addError) {
                // Fallback to adding everything except node_modules
                console.log('⚠️  Selective add failed, trying alternative approach...');
                execSync('git add .', { stdio: 'pipe' }); // Use pipe to suppress warnings
            }
            
            execSync('git commit -m "Initial commit: Professional UI library"', { stdio: 'inherit' });
            execSync('git branch -M main', { stdio: 'inherit' });
            execSync('git push -u origin main', { stdio: 'inherit' });

            // Return to original directory
            process.chdir(originalDir);

            console.log(`✅ Repository ${owner}/${packageName} created successfully!`);
            console.log(`🔗 URL: https://github.com/${owner}/${packageName}`);
            
            return true;
        } catch (error) {
            console.error(`❌ Failed to create repository: ${error.message}`);
            process.chdir(this.uiPlatformRoot);
            return false;
        }
    }

    async preparePackage(packageName, options = {}) {
        const dryRun = options.dryRun || false;
        
        // First check if we have a prepared package in main workspace
        let preparedDir = path.join(this.workspaceRoot, 'temp', `${packageName}-publish`);
        
        if (fs.existsSync(preparedDir)) {
            console.log(`📦 Found existing prepared package: ${preparedDir}`);
            return true;
        }

        // Check if we need to run the platform publishing script
        if (packageName === 'ui-platform') {
            console.log('📦 Running ui-platform publishing preparation...');
            
            if (dryRun) {
                console.log('🔍 DRY RUN - Would run: node scripts/setup-platform-publishing.js');
                return true;
            }

            try {
                execSync('node scripts/setup-platform-publishing.js', { 
                    stdio: 'inherit',
                    cwd: this.uiPlatformRoot
                });
                
                // Check if the package was prepared in ui-platform temp
                const localPreparedDir = path.join(this.tempDir, `${packageName}-publish`);
                if (fs.existsSync(localPreparedDir)) {
                    console.log(`✅ Package ${packageName} prepared successfully in ${localPreparedDir}`);
                    return true;
                }
            } catch (error) {
                console.error(`❌ Failed to prepare package: ${error.message}`);
<<<<<<< HEAD
                // Ensure we're in the correct directory after error
                process.chdir(this.uiPlatformRoot);
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
                return false;
            }
        }

        console.log(`❌ No preparation method found for package: ${packageName}`);
        return false;
    }

    async publishWorkflow(packageName, options = {}) {
        console.log(`🚀 Starting complete publish workflow for: ${packageName}\n`);

        // Step 1: Prepare package
        console.log('Step 1: Preparing package...');
        const prepared = await this.preparePackage(packageName, options);
        if (!prepared) {
            console.log('❌ Package preparation failed');
            return false;
        }

        // Step 2: Create repository
        console.log('\nStep 2: Creating GitHub repository...');
        const created = await this.createRepository(packageName, options);
        if (!created) {
            console.log('❌ Repository creation failed');
            return false;
        }

        // Step 3: Publish to NPM (optional)
        if (!options.skipNpm) {
            console.log('\nStep 3: Publishing to NPM...');
            const published = await this.publishToNPM(packageName, options);
            if (!published) {
                console.log('⚠️  NPM publishing failed, but repository was created');
            }
        }

        console.log(`\n🎉 Complete publish workflow completed successfully for ${packageName}!`);
        console.log(`🔗 GitHub: https://github.com/${this.getOwner()}/${packageName}`);
        if (!options.skipNpm) {
            console.log(`📦 NPM: https://www.npmjs.com/package/@tamyla/${packageName}`);
        }
        
        return true;
    }

    async publishToNPM(packageName, options = {}) {
        const dryRun = options.dryRun || false;
        
        // Find prepared directory
        let preparedDir = path.join(this.tempDir, `${packageName}-publish`);
        if (!fs.existsSync(preparedDir)) {
            preparedDir = path.join(this.workspaceRoot, 'temp', `${packageName}-publish`);
        }

        if (!fs.existsSync(preparedDir)) {
            console.log(`❌ Prepared package not found for: ${packageName}`);
            return false;
        }

        if (dryRun) {
            console.log('🔍 DRY RUN - NPM publish commands:');
            console.log(`  cd ${preparedDir}`);
            console.log(`  npm publish --dry-run`);
            return true;
        }

        try {
            const originalDir = process.cwd();
            process.chdir(preparedDir);
            
            // Test publish first
            console.log('🧪 Testing NPM publish...');
            execSync('npm publish --dry-run', { stdio: 'inherit' });
            
            // Actual publish
            console.log('📦 Publishing to NPM...');
            execSync('npm publish', { stdio: 'inherit' });
            
<<<<<<< HEAD
            // Always return to original directory
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            process.chdir(originalDir);
            
            console.log(`✅ Package ${packageName} published to NPM successfully!`);
            return true;
        } catch (error) {
            console.error(`❌ NPM publish failed: ${error.message}`);
<<<<<<< HEAD
            // Ensure we return to original directory even on error
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            process.chdir(this.uiPlatformRoot);
            return false;
        }
    }

    async validateRepository(packageName) {
        const owner = this.getOwner();
        console.log(`🔍 Validating repository: ${owner}/${packageName}`);

        try {
            // Check repository exists
            const repoInfo = execSync(`gh repo view ${owner}/${packageName} --json name,description,isPrivate,url`, { 
                encoding: 'utf8' 
            });
            const repo = JSON.parse(repoInfo);
            
            console.log('✅ Repository exists');
            console.log(`   Name: ${repo.name}`);
            console.log(`   URL: ${repo.url}`);
            console.log(`   Private: ${repo.isPrivate}`);
            console.log(`   Description: ${repo.description || 'No description'}`);
            
            // Check if package exists on NPM
            try {
                const npmInfo = execSync(`npm view @tamyla/${packageName} version`, { 
                    encoding: 'utf8',
                    stdio: 'pipe'
                });
                console.log(`✅ NPM package exists (v${npmInfo.trim()})`);
            } catch (error) {
                console.log('⚠️  NPM package not found');
            }
            
            return true;
        } catch (error) {
            console.log(`❌ Repository validation failed: ${error.message}`);
            return false;
        }
    }

    async syncPackage(packageName, options = {}) {
        const dryRun = options.dryRun || false;
        const owner = this.getOwner();
        
        console.log(`🔄 Syncing package ${packageName} to repository...`);

        // Prepare latest version
        await this.preparePackage(packageName, options);
        
        // Find prepared directory
        let preparedDir = path.join(this.tempDir, `${packageName}-publish`);
        if (!fs.existsSync(preparedDir)) {
            preparedDir = path.join(this.workspaceRoot, 'temp', `${packageName}-publish`);
        }
        
        if (dryRun) {
            console.log('🔍 DRY RUN - Sync commands:');
            console.log(`  cd ${preparedDir}`);
            console.log(`  git add .`);
            console.log(`  git commit -m "Update package"`);
            console.log(`  git push origin main`);
            return true;
        }

        try {
            const originalDir = process.cwd();
            process.chdir(preparedDir);
            
            // Check if git repository is initialized
            if (!fs.existsSync(path.join(preparedDir, '.git'))) {
                execSync('git init', { stdio: 'inherit' });
                execSync(`git remote add origin https://github.com/${owner}/${packageName}.git`, { stdio: 'inherit' });
                this.createGitignore(preparedDir);
            }
            
            // Add files selectively
            console.log('📝 Adding files to git...');
            try {
                execSync('git add .gitignore package.json README.md LICENSE', { stdio: 'inherit' });
                execSync('git add src/ dist/ scripts/ *.md *.json *.js *.ts', { stdio: 'inherit' });
            } catch (addError) {
                console.log('⚠️  Selective add failed, using git add . with suppressed output...');
                execSync('git add .', { stdio: 'pipe' });
            }
            
            try {
                execSync('git commit -m "Update package contents"', { stdio: 'inherit' });
                execSync('git push origin main', { stdio: 'inherit' });
                console.log(`✅ Package ${packageName} synced successfully!`);
            } catch (commitError) {
                console.log('ℹ️  No changes to commit');
            }
            
<<<<<<< HEAD
            // Always return to original directory
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            process.chdir(originalDir);
            return true;
        } catch (error) {
            console.error(`❌ Sync failed: ${error.message}`);
<<<<<<< HEAD
            // Ensure we return to original directory even on error
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            process.chdir(this.uiPlatformRoot);
            return false;
        }
    }

    getOwner() {
        return this.defaultOwner;
    }

<<<<<<< HEAD
    ensureCorrectDirectory() {
        // Always ensure we're in the ui-platform root directory
        if (process.cwd() !== this.uiPlatformRoot) {
            process.chdir(this.uiPlatformRoot);
            console.log(`📁 Navigated back to: ${this.uiPlatformRoot}`);
        }
    }

=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
    createGitignore(packageDir) {
        const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.rollup.cache/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/
`;

        const gitignorePath = path.join(packageDir, '.gitignore');
        fs.writeFileSync(gitignorePath, gitignoreContent);
        console.log('📝 Created .gitignore file');
    }

    cleanupForGit(packageDir) {
        console.log('🧹 Cleaning up problematic directories...');
        
        const dirsToRemove = [
            'node_modules',
            '.rollup.cache',
            'dist',
            'build',
            '.cache',
            'coverage',
            '.vscode',
            '.idea'
        ];

        for (const dir of dirsToRemove) {
            const dirPath = path.join(packageDir, dir);
            if (fs.existsSync(dirPath)) {
                try {
                    fs.rmSync(dirPath, { recursive: true, force: true });
                    console.log(`  ✅ Removed ${dir}`);
                } catch (error) {
                    console.log(`  ⚠️  Could not remove ${dir}: ${error.message}`);
                }
            }
        }
    }

    async listPackages() {
        console.log('📦 Package Repository Status\n');
        
        const packages = this.getAvailablePackages();
        
        for (const pkg of packages) {
            console.log(`\n📦 ${pkg}`);
            
            // Check repository status
            const repoExists = await this.checkRepositoryExists(pkg);
            console.log(`   Repository: ${repoExists ? '✅ Exists' : '❌ Missing'}`);
            
            // Check NPM status
            try {
                const npmVersion = execSync(`npm view @tamyla/${pkg} version`, { 
                    encoding: 'utf8',
                    stdio: 'pipe'
                }).trim();
                console.log(`   NPM: ✅ Published (v${npmVersion})`);
            } catch (error) {
                console.log('   NPM: ❌ Not published');
            }
            
            // Check if prepared (both locations)
            const localPreparedDir = path.join(this.tempDir, `${pkg}-publish`);
            const mainPreparedDir = path.join(this.workspaceRoot, 'temp', `${pkg}-publish`);
            const isPrepared = fs.existsSync(localPreparedDir) || fs.existsSync(mainPreparedDir);
            console.log(`   Prepared: ${isPrepared ? '✅ Ready' : '⚠️  Not prepared'}`);
        }
    }
}

// Command line interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const manager = new GitHubRepoManager();

    // Parse options
    const options = {};
    let packageName = args[1];
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--owner' && args[i + 1]) {
            options.owner = args[i + 1];
            i++;
        } else if (arg === '--private') {
            options.private = true;
        } else if (arg === '--dry-run') {
            options.dryRun = true;
        } else if (arg === '--force') {
            options.force = true;
        } else if (arg === '--skip-npm') {
            options.skipNpm = true;
        }
    }

    switch (command) {
        case 'help':
        case '--help':
        case '-h':
        case undefined:
            manager.showHelp();
            break;

        case 'status':
            await manager.showStatus();
<<<<<<< HEAD
            manager.ensureCorrectDirectory();
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            break;

        case 'create':
            if (!packageName) {
                console.log('❌ Package name required. Usage: create <package>');
                process.exit(1);
            }
            await manager.createRepository(packageName, options);
<<<<<<< HEAD
            manager.ensureCorrectDirectory();
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            break;

        case 'prepare':
            if (!packageName) {
                console.log('❌ Package name required. Usage: prepare <package>');
                process.exit(1);
            }
            await manager.preparePackage(packageName, options);
<<<<<<< HEAD
            manager.ensureCorrectDirectory();
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            break;

        case 'publish':
            if (!packageName) {
                console.log('❌ Package name required. Usage: publish <package>');
                process.exit(1);
            }
            await manager.publishWorkflow(packageName, options);
<<<<<<< HEAD
            manager.ensureCorrectDirectory();
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            break;

        case 'validate':
            if (!packageName) {
                console.log('❌ Package name required. Usage: validate <package>');
                process.exit(1);
            }
            await manager.validateRepository(packageName);
<<<<<<< HEAD
            manager.ensureCorrectDirectory();
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            break;

        case 'sync':
            if (!packageName) {
                console.log('❌ Package name required. Usage: sync <package>');
                process.exit(1);
            }
            await manager.syncPackage(packageName, options);
<<<<<<< HEAD
            manager.ensureCorrectDirectory();
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            break;

        case 'list':
            await manager.listPackages();
<<<<<<< HEAD
            manager.ensureCorrectDirectory();
=======
>>>>>>> bebf383b81452914f92d944caf7aca470c3a1217
            break;

        default:
            console.log(`❌ Unknown command: ${command}`);
            console.log('Use "help" for usage information.');
            process.exit(1);
    }
}

// Check if this is the main module (ESM equivalent of require.main === module)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch(error => {
        console.error('❌ Script failed:', error.message);
        process.exit(1);
    });
}

export default GitHubRepoManager;
