#!/usr/bin/env node

/**
 * Quick Deployment Diagnostics
 * Rapid investigation of current deployment failures
 */

import https from 'https';

const FAILING_JOBS = [
  {
    name: 'UI Components - Node 18.x Test Failure',
    url: 'https://github.com/tamylaa/tamyla-ui-components/actions/runs/17287718349/job/49067996012'
  },
  {
    name: 'UI Components React - Publish Failure',
    url: 'https://github.com/tamylaa/tamyla-ui-components-react/actions/runs/17287739114/job/49068114125'
  }
];

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'deployment-diagnostics/1.0',
        'Accept': 'text/html,application/xhtml+xml',
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function analyzeFailures() {
  console.log('🔍 RAPID DEPLOYMENT FAILURE ANALYSIS');
  console.log('=====================================\n');

  for (const job of FAILING_JOBS) {
    console.log(`📋 Analyzing: ${job.name}`);
    console.log(`🔗 URL: ${job.url}`);

    try {
      const htmlContent = await makeRequest(job.url);

      // Extract key error patterns
      const errorPatterns = [
        /Error: (.+)/g,
        /FAIL (.+)/g,
        /npm ERR! (.+)/g,
        /✖ (.+)/g,
        /AssertionError: (.+)/g,
        /SyntaxError: (.+)/g,
        /TypeError: (.+)/g
      ];

      let foundErrors = [];

      errorPatterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(htmlContent)) !== null && foundErrors.length < 3) {
          const error = match[1].replace(/<[^>]*>/g, '').trim();
          if (error.length > 10 && error.length < 200) {
            foundErrors.push(error);
          }
        }
      });

      if (foundErrors.length > 0) {
        console.log('❌ Key Errors Found:');
        foundErrors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      } else {
        console.log('⚠️  No specific errors extracted - manual investigation needed');
      }

    } catch (error) {
      console.log(`❌ Failed to analyze: ${error.message}`);
    }

    console.log(''); // Empty line for spacing
  }

  console.log('💡 IMMEDIATE RECOMMENDATIONS:');
  console.log('=============================');
  console.log('1. Check UI Components Node 18.x test compatibility');
  console.log('2. Verify NPM_GITHUB_ACTION_AUTO is properly configured for publishing');
  console.log('3. Review package.json dependencies for version conflicts');
  console.log('4. Test local builds on Node 18.x environment');
  console.log('5. Validate semantic-release configuration');
  console.log('\n✨ Analysis complete! Review failures and apply fixes.');
}

analyzeFailures().catch(error => {
  console.error(`💥 Diagnostics failed: ${error.message}`);
  process.exit(1);
});
