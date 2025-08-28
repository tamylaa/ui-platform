#!/usr/bin/env node

/**
 * NPM Token Verification Helper
 * Helps verify NPM authentication is working
 */

console.log('🔐 NPM Token Verification');
console.log('=========================\n');

console.log('✅ You have created NPM token: NPM_GITHUB_ACTION_AUTO\n');

console.log('🎯 NOW YOU NEED TO:');
console.log('1. Copy the VALUE of your NPM_GITHUB_ACTION_AUTO token');
console.log('2. Add it as GitHub repository secrets named NPM_GITHUB_ACTION_AUTO\n');

console.log('📋 Add NPM_GITHUB_ACTION_AUTO secret to these repositories:');
console.log('===============================================');

const repos = [
    {
        name: 'UI Components',
        url: 'https://github.com/tamylaa/tamyla-ui-components/settings/secrets/actions'
    },
    {
        name: 'UI Components React',
        url: 'https://github.com/tamylaa/tamyla-ui-components-react/settings/secrets/actions'
    }
];

repos.forEach((repo, index) => {
    console.log(`\n${index + 1}. ${repo.name}:`);
    console.log(`   🔗 Go to: ${repo.url}`);
    console.log('   ➕ Click "New repository secret"');
    console.log('   📝 Name: NPM_GITHUB_ACTION_AUTO');
    console.log('   📋 Value: [paste your NPM_GITHUB_ACTION_AUTO token value]');
    console.log('   💾 Click "Add secret"');
});

console.log('\n🧪 Test NPM Authentication Locally:');
console.log('===================================');
console.log('1. Set your token as environment variable:');
console.log('   $env:NPM_GITHUB_ACTION_AUTO="your_NPM_GITHUB_ACTION_AUTO_token_value"');
console.log('2. Test authentication:');
console.log('   npm whoami --registry=https://registry.npmjs.org/');
console.log('   (Should show your npm username)');

console.log('\n⚡ After Adding Secrets:');
console.log('======================');
console.log('1. Go back to the failed workflow runs');
console.log('2. Click "Re-run all jobs" to test with the new token');
console.log('3. Or make a small commit to trigger new deployments');

console.log('\n🎯 The deployments will succeed once NPM_GITHUB_ACTION_AUTO secrets are added!');

// If --open flag is provided, open the secret URLs
if (process.argv.includes('--open')) {
    import('child_process').then(({ execSync }) => {
        console.log('\n🌐 Opening GitHub secrets pages...');
        repos.forEach(repo => {
            try {
                execSync(`start "${repo.url}"`, { stdio: 'ignore' });
            } catch (e) {
                // Ignore errors - user can open manually
            }
        });
    });
}
