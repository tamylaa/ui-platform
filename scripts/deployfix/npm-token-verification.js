#!/usr/bin/env node

/**
 * NPM Token Verification Tool
 * Tests NPM token authentication for GitHub Actions
 */

console.log('🔑 NPM Token Verification for GitHub Actions');
console.log('===========================================\n');

console.log('📋 Common NPM 404 Publishing Issues:');
console.log('');
console.log('1. 🔐 Token Permissions:');
console.log('   - NPM token must be "Automation" type for CI/CD');
console.log('   - Token must have "Read and write" permissions');
console.log('   - For scoped packages (@tamyla/), token must have organization access');
console.log('');
console.log('2. 👥 Organization Access:');
console.log('   - User "tamyla" must be a member of @tamyla scope');
console.log('   - Organization @tamyla must exist on NPM');
console.log('   - Package @tamyla/ui-components must not conflict with existing packages');
console.log('');
console.log('3. 🔧 GitHub Secrets Setup:');
console.log('   - Secret name: NPM_GITHUB_ACTION_AUTO');
console.log('   - Secret value: Your NPM automation token');
console.log('   - Repository: tamylaa/tamyla-ui-components');
console.log('');
console.log('📝 How to Create Proper NPM Token:');
console.log('');
console.log('1. Go to https://www.npmjs.com/settings/tokens');
console.log('2. Click "Generate New Token" → "Classic Token"');
console.log('3. Select "Automation" type');
console.log('4. Set permissions to "Read and write"');
console.log('5. For scoped packages, ensure you have org access');
console.log('6. Copy token and add to GitHub repository secrets');
console.log('');
console.log('🔍 To Verify Token Locally:');
console.log('');
console.log('   npm login --scope=@tamyla --registry=https://registry.npmjs.org');
console.log('   npm whoami --registry=https://registry.npmjs.org');
console.log('   npm access list packages @tamyla');
console.log('   npm publish --dry-run');
console.log('');
console.log('🚀 Expected Output After Fix:');
console.log('   npm notice Publishing to https://registry.npmjs.org/ with tag latest and public access');
console.log('   + @tamyla/ui-components@2.0.1');
console.log('');

// Check environment variables in GitHub Actions context
if (process.env.GITHUB_ACTIONS) {
  console.log('🔄 GitHub Actions Environment Detected');
  console.log('');
  console.log('Environment Variables:');
  console.log(`   NODE_AUTH_TOKEN: ${process.env.NODE_AUTH_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`   NPM_CONFIG_REGISTRY: ${process.env.NPM_CONFIG_REGISTRY || 'Default'}`);
  console.log(`   NPM_CONFIG_ALWAYS_AUTH: ${process.env.NPM_CONFIG_ALWAYS_AUTH || 'Default'}`);
}

console.log('🎯 Next Steps:');
console.log('1. Verify NPM token has organization access');
console.log('2. Check if @tamyla scope exists and you have access');
console.log('3. Ensure token is "Automation" type with "Read and write" permissions');
console.log('4. Re-create GitHub secret if needed');
