#!/usr/bin/env node

/**
 * GitHub Secrets Checker
 * Verifies if required secrets are available in repositories
 */

const { Octokit } = eval('require')('@octokit/rest');

const requiredSecrets = ['NPM_GITHUB_ACTION_AUTO'];

const repositories = [
  { owner: 'tamylaa', repo: 'tamyla-ui-components' },
  { owner: 'tamylaa', repo: 'tamyla-ui-components-react' }
];

async function checkSecrets() {
  console.log('🔐 GitHub Secrets Checker');
  console.log('=========================\n');

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  for (const { owner, repo } of repositories) {
    console.log(`📦 Checking ${owner}/${repo}:`);

    try {
      // Get repository secrets
      const { data: secrets } = await octokit.rest.actions.listRepoSecrets({
        owner,
        repo
      });

      console.log(`   Found ${secrets.total_count} secrets:`);

      for (const secret of secrets.secrets) {
        const isRequired = requiredSecrets.includes(secret.name);
        const status = isRequired ? '✅' : '💡';
        console.log(`   ${status} ${secret.name} (updated: ${secret.updated_at})`);
      }

      // Check for missing required secrets
      const existingSecretNames = secrets.secrets.map(s => s.name);
      const missingSecrets = requiredSecrets.filter(name => !existingSecretNames.includes(name));

      if (missingSecrets.length > 0) {
        console.log(`   ❌ Missing required secrets: ${missingSecrets.join(', ')}`);
      } else {
        console.log('   ✅ All required secrets are present');
      }

    } catch (error) {
      console.log(`   ❌ Error checking secrets: ${error.message}`);
    }

    console.log('');
  }
}

// Check if GITHUB_TOKEN is available
if (!process.env.GITHUB_TOKEN) {
  console.log('❌ GITHUB_TOKEN environment variable not set');
  console.log('Please set GITHUB_TOKEN to check repository secrets');
  process.exit(1);
}

checkSecrets().catch(console.error);
