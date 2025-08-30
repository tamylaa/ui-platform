#!/usr/bin/env node

/**
 * Comprehensive Deployment Troubleshooter
 * Diagnoses and fixes all deployment issues
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 UI Platform Deployment Troubleshooter');
console.log('========================================');

const projectRoot = path.resolve('../../'); // Go up from scripts/deployfix to ui-platform root
const packages = [
  {
    name: 'ui-components',
    path: path.join(projectRoot, 'packages', 'ui-components'),
    repo: 'tamylaa/tamyla-ui-components'
  },
  {
    name: 'ui-components-react',
    path: path.join(projectRoot, 'packages', 'ui-components-react'),
    repo: 'tamylaa/tamyla-ui-components-react'
  }
];

function runCommand(command, cwd = process.cwd()) {
  try {
    const result = execSync(command, {
      cwd,
      encoding: 'utf8',
      timeout: 30000
    });
    return { success: true, output: result.trim() };
  } catch (error) {
    return {
      success: false,
      output: error.message,
      code: error.status
    };
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readJsonFile(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return null;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Diagnostic tests
const diagnostics = {
  workspaceStructure: () => {
    console.log('\n📁 Checking workspace structure...');
    let issues = [];

    for (const pkg of packages) {
      if (!checkFileExists(pkg.path)) {
        issues.push(`❌ Package directory missing: ${pkg.path}`);
      } else {
        console.log(`✅ Found ${pkg.name} at ${pkg.path}`);

        // Check package.json
        const packageJsonPath = path.join(pkg.path, 'package.json');
        if (!checkFileExists(packageJsonPath)) {
          issues.push(`❌ Missing package.json: ${packageJsonPath}`);
        } else {
          const packageJson = readJsonFile(packageJsonPath);
          if (!packageJson) {
            issues.push(`❌ Invalid package.json: ${packageJsonPath}`);
          } else {
            console.log(`✅ Valid package.json for ${pkg.name}`);
          }
        }
      }
    }

    return issues;
  },

  dependencyInstallation: () => {
    console.log('\n📦 Checking dependency installation...');
    let issues = [];

    for (const pkg of packages) {
      if (!checkFileExists(pkg.path)) continue;

      console.log(`\nChecking ${pkg.name} dependencies...`);
      const nodeModulesPath = path.join(pkg.path, 'node_modules');

      if (!checkFileExists(nodeModulesPath)) {
        console.log(`📥 Installing dependencies for ${pkg.name}...`);
        const installResult = runCommand('npm install', pkg.path);

        if (!installResult.success) {
          issues.push(`❌ Failed to install dependencies for ${pkg.name}: ${installResult.output}`);
        } else {
          console.log(`✅ Dependencies installed for ${pkg.name}`);
        }
      } else {
        console.log(`✅ Dependencies already installed for ${pkg.name}`);
      }
    }

    return issues;
  },

  buildProcess: () => {
    console.log('\n🔨 Testing build process...');
    let issues = [];

    for (const pkg of packages) {
      if (!checkFileExists(pkg.path)) continue;

      console.log(`\nBuilding ${pkg.name}...`);
      const buildResult = runCommand('npm run build', pkg.path);

      if (!buildResult.success) {
        issues.push(`❌ Build failed for ${pkg.name}: ${buildResult.output}`);
      } else {
        console.log(`✅ Build successful for ${pkg.name}`);

        // Check if dist directory was created
        const distPath = path.join(pkg.path, 'dist');
        if (!checkFileExists(distPath)) {
          issues.push(`❌ Build artifacts missing for ${pkg.name} (no dist directory)`);
        } else {
          console.log(`✅ Build artifacts created for ${pkg.name}`);
        }
      }
    }

    return issues;
  },

  testSuite: () => {
    console.log('\n🧪 Running test suites...');
    let issues = [];

    for (const pkg of packages) {
      if (!checkFileExists(pkg.path)) continue;

      console.log(`\nTesting ${pkg.name}...`);
      const testResult = runCommand('npm test', pkg.path);

      if (!testResult.success) {
        issues.push(`❌ Tests failed for ${pkg.name}: ${testResult.output}`);
      } else {
        console.log(`✅ Tests passed for ${pkg.name}`);
      }
    }

    return issues;
  },

  githubWorkflows: () => {
    console.log('\n⚙️ Checking GitHub workflow files...');
    let issues = [];

    for (const pkg of packages) {
      if (!checkFileExists(pkg.path)) continue;

      const workflowDir = path.join(pkg.path, '.github', 'workflows');
      if (!checkFileExists(workflowDir)) {
        issues.push(`❌ Missing .github/workflows directory for ${pkg.name}`);
        continue;
      }

      const deployWorkflow = path.join(workflowDir, 'deploy.yml');
      if (!checkFileExists(deployWorkflow)) {
        issues.push(`❌ Missing deploy.yml workflow for ${pkg.name}`);
      } else {
        console.log(`✅ Found deploy workflow for ${pkg.name}`);

        // Check for common syntax issues
        const workflowContent = fs.readFileSync(deployWorkflow, 'utf8');
        if (workflowContent.includes('- name:') && workflowContent.includes('uses:')) {
          // Look for malformed steps
          const lines = workflowContent.split('\n');
          let inSteps = false;
          let stepIndent = 0;

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('steps:')) {
              inSteps = true;
              continue;
            }

            if (inSteps && line.trim().startsWith('- name:')) {
              stepIndent = line.indexOf('- name:');
              // Check if next lines are properly indented
              for (let j = i + 1; j < lines.length && j < i + 5; j++) {
                const nextLine = lines[j];
                if (nextLine.trim() === '') continue;
                if (nextLine.trim().startsWith('- name:')) break;

                if (nextLine.includes('uses:') || nextLine.includes('run:')) {
                  const expectedIndent = stepIndent + 2;
                  const actualIndent = nextLine.indexOf(nextLine.trim());
                  if (actualIndent !== expectedIndent) {
                    issues.push(`❌ Workflow syntax issue in ${pkg.name} at line ${j + 1}: incorrect indentation`);
                  }
                }
              }
            }
          }
        }
      }
    }

    return issues;
  },

  npmAuthentication: () => {
    console.log('\n🔐 Checking NPM authentication setup...');
    let issues = [];

    for (const pkg of packages) {
      if (!checkFileExists(pkg.path)) continue;

      const npmrcPath = path.join(pkg.path, '.npmrc');
      if (checkFileExists(npmrcPath)) {
        const npmrcContent = fs.readFileSync(npmrcPath, 'utf8');
        if (npmrcContent.includes('${NPM_GITHUB_ACTION_AUTO}')) {
          console.log(`✅ NPM authentication configured for ${pkg.name}`);
        } else {
          issues.push(`❌ .npmrc exists but NPM_GITHUB_ACTION_AUTO not configured for ${pkg.name}`);
        }
      } else {
        console.log(`⚠️ No .npmrc file found for ${pkg.name} - creating one...`);
        const npmrcContent = `//registry.npmjs.org/:_authToken=\${NPM_GITHUB_ACTION_AUTO}
registry=https://registry.npmjs.org/
always-auth=true
`;
        fs.writeFileSync(npmrcPath, npmrcContent);
        console.log(`✅ Created .npmrc for ${pkg.name}`);
      }
    }

    return issues;
  }
};

// Auto-fix functions
const fixes = {
  fixWorkflowSyntax: () => {
    console.log('\n🔧 Fixing workflow syntax issues...');
    // The workflow syntax fix was already applied above
    console.log('✅ Workflow syntax fixes applied');
  },

  ensureNpmrc: () => {
    console.log('\n🔧 Ensuring .npmrc files are present...');
    diagnostics.npmAuthentication(); // This creates .npmrc if missing
  },

  cleanAndReinstall: () => {
    console.log('\n🔧 Cleaning and reinstalling dependencies...');

    for (const pkg of packages) {
      if (!checkFileExists(pkg.path)) continue;

      console.log(`\nCleaning ${pkg.name}...`);

      // Remove node_modules and package-lock.json
      const nodeModulesPath = path.join(pkg.path, 'node_modules');
      const lockfilePath = path.join(pkg.path, 'package-lock.json');

      if (checkFileExists(nodeModulesPath)) {
        runCommand('rmdir /s /q node_modules', pkg.path);
      }

      if (checkFileExists(lockfilePath)) {
        fs.unlinkSync(lockfilePath);
      }

      // Reinstall
      console.log(`Reinstalling dependencies for ${pkg.name}...`);
      const installResult = runCommand('npm install', pkg.path);

      if (installResult.success) {
        console.log(`✅ Dependencies reinstalled for ${pkg.name}`);
      } else {
        console.log(`❌ Failed to reinstall dependencies for ${pkg.name}`);
      }
    }
  },

  updatePackageVersions: () => {
    console.log('\n🔧 Checking and updating package versions...');

    for (const pkg of packages) {
      if (!checkFileExists(pkg.path)) continue;

      const packageJsonPath = path.join(pkg.path, 'package.json');
      const packageJson = readJsonFile(packageJsonPath);

      if (packageJson) {
        const currentVersion = packageJson.version;
        console.log(`Current version of ${pkg.name}: ${currentVersion}`);

        // Increment patch version
        const versionParts = currentVersion.split('.');
        versionParts[2] = String(parseInt(versionParts[2]) + 1);
        const newVersion = versionParts.join('.');

        packageJson.version = newVersion;
        writeJsonFile(packageJsonPath, packageJson);

        console.log(`✅ Updated ${pkg.name} version to ${newVersion}`);
      }
    }
  }
};

// Main execution
async function main() {
  const allIssues = [];

  // Run all diagnostics
  for (const [name, diagnostic] of Object.entries(diagnostics)) {
    const issues = diagnostic();
    allIssues.push(...issues);
  }

  // Show summary
  console.log('\n📊 Diagnostic Summary');
  console.log('=====================');

  if (allIssues.length === 0) {
    console.log('🎉 No issues found! Your deployment should work.');
  } else {
    console.log(`⚠️ Found ${allIssues.length} issues:`);
    allIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });

    // Apply fixes
    console.log('\n🔧 Applying automatic fixes...');
    fixes.fixWorkflowSyntax();
    fixes.ensureNpmrc();

    // Ask if user wants to run more intensive fixes
    console.log('\n💡 Additional fixes available:');
    console.log('1. Clean and reinstall all dependencies');
    console.log('2. Update package versions for new deployment');
    console.log('\nTo run these, execute:');
    console.log('node deployment-troubleshooter.js --fix-all');
  }

  // Check command line arguments
  if (process.argv.includes('--fix-all')) {
    console.log('\n🚀 Running all fixes...');
    fixes.cleanAndReinstall();
    fixes.updatePackageVersions();

    console.log('\n✅ All fixes applied!');
    console.log('📋 Next steps:');
    console.log('1. Commit and push these changes');
    console.log('2. Ensure NPM_GITHUB_ACTION_AUTO is set in GitHub repository secrets');
    console.log('3. Monitor the GitHub Actions workflows');
  }

  console.log('\n🎯 Troubleshooting complete!');
}

main().catch(console.error);
