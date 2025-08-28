#!/usr/bin/env node

/**
 * Quick Deployment Debugger
 * Provides specific debugging steps for current failures
 */

console.log('🐞 Quick Deployment Debugger');
console.log('============================\n');

console.log('📋 Based on the current failures, here are the most likely issues:\n');

console.log('1️⃣ NPM_GITHUB_ACTION_AUTO Secret Issues:');
console.log('   🔍 Check if the secret is properly configured:');
console.log('   • UI Components: https://github.com/tamylaa/tamyla-ui-components/settings/secrets/actions');
console.log('   • UI Components React: https://github.com/tamylaa/tamyla-ui-components-react/settings/secrets/actions');
console.log('   ✅ Secret should be named exactly: NPM_GITHUB_ACTION_AUTO');
console.log('   ✅ Value should be your NPM_GITHUB_ACTION_AUTO token\n');

console.log('2️⃣ Workflow Permissions:');
console.log('   🔍 Check repository permissions:');
console.log('   • UI Components: https://github.com/tamylaa/tamyla-ui-components/settings/actions');
console.log('   • UI Components React: https://github.com/tamylaa/tamyla-ui-components-react/settings/actions');
console.log('   ✅ Set "Workflow permissions" to "Read and write permissions"');
console.log('   ✅ Enable "Allow GitHub Actions to create and approve pull requests"\n');

console.log('3️⃣ Recent Changes Not Synced:');
console.log('   🔍 The ui-components-react repository may need the latest fixes:');
console.log('   • Check if the workflow syntax fix was applied to the React repo');
console.log('   • The React repo might still have the malformed YAML\n');

console.log('4️⃣ Direct Links to Failed Workflows:');
console.log('   📊 Latest Failures:');
console.log('   • UI Components: https://github.com/tamylaa/tamyla-ui-components/actions/runs/17289486804');
console.log('   • UI Components React: https://github.com/tamylaa/tamyla-ui-components-react/actions/runs/17288332897\n');

console.log('🔧 Debugging Steps:');
console.log('==================');

console.log('\n📝 Step 1: Verify NPM Token');
console.log('  1. Go to https://www.npmjs.com/settings/tokens');
console.log('  2. Find your NPM_GITHUB_ACTION_AUTO token');
console.log('  3. Copy the token value');
console.log('  4. Add it as NPM_GITHUB_ACTION_AUTO secret in both repositories');

console.log('\n📝 Step 2: Check Workflow Syntax');
console.log('  1. Visit the failed workflow links above');
console.log('  2. Look for YAML syntax errors');
console.log('  3. Check if the workflow file exists and is valid');

console.log('\n📝 Step 3: Test NPM Authentication Locally');
console.log('  1. Set environment variable: set NPM_GITHUB_ACTION_AUTO=your_token_value');
console.log('  2. Try: npm whoami --registry=https://registry.npmjs.org/');
console.log('  3. Should show your npm username');

console.log('\n📝 Step 4: Manual Test Deployment');
console.log('  1. cd packages/ui-components');
console.log('  2. npm run build');
console.log('  3. npm pack --dry-run  (test package creation)');
console.log('  4. Check if any errors occur');

console.log('\n📝 Step 5: Sync Repository Changes');
console.log('  1. cd packages/ui-components-react');
console.log('  2. git add .');
console.log('  3. git commit -m "fix: update workflow configuration"');
console.log('  4. git push origin main');

console.log('\n🎯 Most Likely Fix:');
console.log('==================');
console.log('The UI Components React repository probably needs the workflow syntax fix.');
console.log('The React repo workflow might still have the malformed YAML that was fixed locally.');
console.log('Push the latest changes to that repository to fix the syntax issue.');

console.log('\n🔍 Quick Test:');
console.log('=============');
console.log('Run this to test if NPM auth is working:');
console.log('  echo $env:NPM_GITHUB_ACTION_AUTO  (should show your token)');
console.log('  npm whoami --registry=https://registry.npmjs.org/');

console.log('\n✨ Next Steps:');
console.log('1. Verify NPM_GITHUB_ACTION_AUTO secrets are set in both repositories');
console.log('2. Check workflow permissions are enabled');
console.log('3. Push latest workflow fixes to ui-components-react repository');
console.log('4. Trigger new deployments and monitor results');
