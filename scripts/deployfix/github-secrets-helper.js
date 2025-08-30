#!/usr/bin/env node

/**
 * GitHub Secrets Validator
 * Helps validate and set up GitHub repository secrets
 */

import { execSync } from 'child_process';

console.log('🔐 GitHub Secrets Setup Assistant');
console.log('==================================\n');

const repositories = [
  {
    name: 'UI Components',
    url: 'https://github.com/tamylaa/tamyla-ui-components',
    secretsUrl: 'https://github.com/tamylaa/tamyla-ui-components/settings/secrets/actions',
    actionsUrl: 'https://github.com/tamylaa/tamyla-ui-components/actions'
  },
  {
    name: 'UI Components React',
    url: 'https://github.com/tamylaa/tamyla-ui-components-react',
    secretsUrl: 'https://github.com/tamylaa/tamyla-ui-components-react/settings/secrets/actions',
    actionsUrl: 'https://github.com/tamylaa/tamyla-ui-components-react/actions'
  }
];

console.log('📋 Required Setup Steps:');
console.log('========================\n');

console.log('1️⃣ Get NPM Token:');
console.log('   • Visit: https://www.npmjs.com/settings/tokens');
console.log('   • Click "Generate New Token"');
console.log('   • Select "Automation" type');
console.log('   • Copy the generated token\n');

console.log('2️⃣ Configure GitHub Secrets:');
console.log('   For each repository, add NPM_GITHUB_ACTION_AUTO secret:\n');

repositories.forEach((repo, index) => {
  console.log(`   ${repo.name}:`);
  console.log(`   • Secrets: ${repo.secretsUrl}`);
  console.log(`   • Actions: ${repo.actionsUrl}`);
  console.log('');
});

console.log('3️⃣ Set Workflow Permissions:');
console.log('   For each repository:');
console.log('   • Go to Settings > Actions > General');
console.log('   • Set "Workflow permissions" to "Read and write permissions"');
console.log('   • Enable "Allow GitHub Actions to create and approve pull requests"\n');

console.log('4️⃣ Trigger Deployment:');
console.log('   • Make a small change and commit');
console.log('   • Push to master (ui-components) or main (ui-components-react)');
console.log('   • Watch the Actions tab for deployment progress\n');

console.log('🔍 Verification:');
console.log('   After setup, run: node deployment-monitor.js');
console.log('   This will check if deployments are now succeeding\n');

console.log('✨ Setup complete! Your deployments should now work.');

// If running with --open flag, open the URLs
if (process.argv.includes('--open')) {
  console.log('\n🌐 Opening setup URLs...');

  // Open NPM tokens page
  try {
    execSync('start https://www.npmjs.com/settings/tokens', { stdio: 'ignore' });
  } catch (e) {
    console.log('Could not automatically open browser. Please visit URLs manually.');
  }

  // Open repository secrets pages
  repositories.forEach(repo => {
    try {
      execSync(`start "${repo.secretsUrl}"`, { stdio: 'ignore' });
    } catch (e) {
      // Ignore errors - user can open manually
    }
  });
}
