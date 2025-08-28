#!/usr/bin/env node

/**
 * NPM Publishing Diagnostic Tool
 * Helps diagnose NPM publishing issues
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 NPM Publishing Diagnostic Tool');
console.log('==================================\n');

try {
  // Check if we're authenticated to NPM
  console.log('1. Checking NPM authentication...');
  try {
    const whoami = execSync('npm whoami', { encoding: 'utf8' }).trim();
    console.log(`   ✅ Authenticated as: ${whoami}`);
  } catch (error) {
    console.log('   ❌ Not authenticated to NPM');
    console.log('   💡 Run: npm login');
    process.exit(1);
  }

  // Check NPM registry
  console.log('\n2. Checking NPM registry...');
  const registry = execSync('npm config get registry', { encoding: 'utf8' }).trim();
  console.log(`   Registry: ${registry}`);

  // Check if package name is available
  console.log('\n3. Checking package availability...');
  try {
    const packageInfo = execSync('npm view @tamyla/ui-components', { encoding: 'utf8' });
    console.log('   ✅ Package exists on NPM:');
    console.log('   ' + packageInfo.split('\n')[0]); // First line usually has basic info
  } catch (error) {
    console.log('   ❌ Package not found on NPM registry');
  }

  // Check current package.json
  console.log('\n4. Checking local package.json...');
  const packageJsonPath = join(__dirname, '../../packages/ui-components/package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
  console.log(`   Name: ${packageJson.name}`);
  console.log(`   Version: ${packageJson.version}`);
  console.log(`   Private: ${packageJson.private || false}`);

  // Check NPM access for scoped packages
  console.log('\n5. Checking NPM scope access...');
  try {
    const scopeAccess = execSync('npm access list packages @tamyla', { encoding: 'utf8' });
    console.log('   ✅ Scope access confirmed');
    console.log(`   Packages: ${scopeAccess}`);
  } catch (error) {
    console.log('   ❌ No access to @tamyla scope');
    console.log('   💡 You may need to be added to the @tamyla organization on NPM');
  }

  // Test publish dry run
  console.log('\n6. Testing publish (dry run)...');
  try {
    process.chdir(join(__dirname, '../../packages/ui-components'));
    const dryRun = execSync('npm publish --dry-run', { encoding: 'utf8' });
    console.log('   ✅ Dry run successful');
    console.log('   Package would be published');
  } catch (error) {
    console.log('   ❌ Dry run failed');
    console.log(`   Error: ${error.message}`);
  }

} catch (error) {
  console.error('❌ Diagnostic failed:', error.message);
}

console.log('\n🔧 Diagnostic complete!');
