#!/usr/bin/env node

/**
 * GitHub Actions Token Diagnostic
 * Checks if the NPM token is properly configured in the workflow
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 GitHub Actions NPM Token Configuration Check');
console.log('===============================================\n');

try {
  // Read the workflow file
  const workflowPath = join(__dirname, '../../packages/ui-components/.github/workflows/deploy.yml');
  const workflowContent = readFileSync(workflowPath, 'utf8');

  console.log('📋 Checking workflow configuration...\n');

  // Check 1: Secret reference
  const secretReferences = workflowContent.match(/\$\{\{\s*secrets\.NPM_GITHUB_ACTION_AUTO\s*\}\}/g);
  console.log(`1. Secret References Found: ${secretReferences ? secretReferences.length : 0}`);
  if (secretReferences) {
    console.log('   ✅ Workflow is referencing secrets.NPM_GITHUB_ACTION_AUTO');
  } else {
    console.log('   ❌ No secret references found!');
  }

  // Check 2: Environment variable mapping
  const nodeAuthTokenPattern = /NODE_AUTH_TOKEN:\s*\$\{\{\s*secrets\.NPM_GITHUB_ACTION_AUTO\s*\}\}/;
  const hasNodeAuthToken = nodeAuthTokenPattern.test(workflowContent);
  console.log(`\n2. NODE_AUTH_TOKEN Mapping: ${hasNodeAuthToken ? '✅ Correct' : '❌ Missing'}`);
  
  // Check 3: NPM registry setup
  const hasRegistryUrl = workflowContent.includes('registry-url:');
  const hasScope = workflowContent.includes('scope:');
  console.log(`\n3. NPM Registry Setup:`);
  console.log(`   Registry URL: ${hasRegistryUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Scope: ${hasScope ? '✅ Set' : '❌ Missing'}`);

  // Check 4: Token validation in script
  const hasTokenCheck = workflowContent.includes('if [ -z "$NODE_AUTH_TOKEN" ]');
  console.log(`\n4. Token Validation: ${hasTokenCheck ? '✅ Present' : '❌ Missing'}`);

  // Check 5: Analyze the publish command
  const publishCommands = workflowContent.match(/npm publish[^\n]*/g);
  console.log(`\n5. Publish Commands Found: ${publishCommands ? publishCommands.length : 0}`);
  if (publishCommands) {
    publishCommands.forEach((cmd, i) => {
      console.log(`   ${i + 1}. ${cmd}`);
    });
  }

  console.log('\n🔧 CONFIGURATION ANALYSIS:');
  console.log('========================');

  if (secretReferences && hasNodeAuthToken && hasRegistryUrl) {
    console.log('✅ Workflow configuration looks correct!');
    console.log('');
    console.log('🎯 If deployments are still failing with 404:');
    console.log('   1. Verify the GitHub secret "NPM_GITHUB_ACTION_AUTO" exists');
    console.log('   2. Ensure it contains a valid Classic Automation NPM token');
    console.log('   3. Check that the token has @tamyla scope permissions');
    console.log('   4. Trigger a new deployment to test');
  } else {
    console.log('❌ Configuration issues detected:');
    if (!secretReferences) console.log('   - Missing secret references');
    if (!hasNodeAuthToken) console.log('   - Missing NODE_AUTH_TOKEN mapping');
    if (!hasRegistryUrl) console.log('   - Missing NPM registry URL');
  }

  console.log('\n📊 EXPECTED WORKFLOW BEHAVIOR:');
  console.log('1. GitHub Actions reads secrets.NPM_GITHUB_ACTION_AUTO');
  console.log('2. Maps it to NODE_AUTH_TOKEN environment variable');
  console.log('3. npm uses NODE_AUTH_TOKEN for authentication');
  console.log('4. Should succeed if token has @tamyla scope access');

} catch (error) {
  console.error('❌ Error reading workflow file:', error.message);
}

console.log('\n🔍 Diagnostic complete!');
