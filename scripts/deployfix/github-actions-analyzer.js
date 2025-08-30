#!/usr/bin/env node

/**
 * GitHub Actions Log Analyzer
 * Fetches and analyzes actual error logs from failed deployments
 */

import https from 'https';

const FAILING_RUNS = [
  {
    name: 'UI Components - Latest',
    url: 'https://github.com/tamylaa/tamyla-ui-components/actions/runs/17289486804'
  },
  {
    name: 'UI Components React - Latest',
    url: 'https://github.com/tamylaa/tamyla-ui-components-react/actions/runs/17288332897'
  }
];

async function fetchPageContent(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      timeout: 10000
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    }).on('timeout', () => {
      reject(new Error('Request timeout'));
    });
  });
}

function extractErrorPatterns(htmlContent) {
  const errors = [];

  // Common error patterns in GitHub Actions logs
  const patterns = [
    // NPM/Authentication errors
    /npm ERR!.*401.*Unauthorized/gi,
    /npm ERR!.*403.*Forbidden/gi,
    /npm ERR!.*E401.*Unable to authenticate/gi,
    /npm ERR!.*ENEEDAUTH/gi,

    // Build errors
    /Error:.*failed/gi,
    /TypeError:.*not a function/gi,
    /SyntaxError:/gi,
    /ModuleNotFoundError:/gi,
    /Cannot find module/gi,

    // Jest/Test errors
    /Jest.*failed/gi,
    /Test suite failed to run/gi,
    /Validation Error:/gi,
    /Unknown option/gi,

    // Workflow errors
    /Error:.*workflow/gi,
    /Invalid workflow file/gi,
    /yaml.*error/gi,

    // Node/Package errors
    /node_modules.*not found/gi,
    /package.*not found/gi,
    /ENOENT.*no such file/gi
  ];

  patterns.forEach(pattern => {
    const matches = htmlContent.match(pattern);
    if (matches) {
      matches.forEach(match => {
        if (!errors.includes(match)) {
          errors.push(match);
        }
      });
    }
  });

  return errors;
}

function extractJobStatus(htmlContent) {
  const status = {
    jobs: [],
    steps: [],
    errors: []
  };

  // Look for job status indicators
  const jobFailurePattern = /job.*failed/gi;
  const stepFailurePattern = /step.*failed/gi;

  const jobMatches = htmlContent.match(jobFailurePattern);
  if (jobMatches) {
    status.jobs = jobMatches;
  }

  const stepMatches = htmlContent.match(stepFailurePattern);
  if (stepMatches) {
    status.steps = stepMatches;
  }

  return status;
}

async function analyzeFailures() {
  console.log('🔍 GitHub Actions Failure Analysis');
  console.log('==================================\n');

  for (const run of FAILING_RUNS) {
    console.log(`📋 Analyzing: ${run.name}`);
    console.log(`🔗 URL: ${run.url}\n`);

    try {
      console.log('📥 Fetching workflow data...');
      const response = await fetchPageContent(run.url);

      if (response.statusCode !== 200) {
        console.log(`❌ Failed to fetch data (Status: ${response.statusCode})`);
        continue;
      }

      console.log('🔍 Analyzing error patterns...');
      const errors = extractErrorPatterns(response.data);
      const status = extractJobStatus(response.data);

      if (errors.length > 0) {
        console.log('🚨 Error Patterns Found:');
        errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      } else {
        console.log('ℹ️ No specific error patterns detected in HTML content');

        // Look for general indicators
        if (response.data.includes('401') || response.data.includes('Unauthorized')) {
          console.log('🔐 Possible authentication issue detected');
        }
        if (response.data.includes('npm ERR!')) {
          console.log('📦 NPM error detected');
        }
        if (response.data.includes('failed')) {
          console.log('❌ General failure detected');
        }
      }

      // Provide specific recommendations
      console.log('\n💡 Recommendations:');

      if (errors.some(e => e.includes('401') || e.includes('Unauthorized'))) {
        console.log('   • Check NPM_GITHUB_ACTION_AUTO secret is correctly set');
        console.log('   • Verify token has publish permissions');
        console.log('   • Regenerate token if necessary');
      }

      if (errors.some(e => e.includes('403') || e.includes('Forbidden'))) {
        console.log('   • Check GitHub workflow permissions');
        console.log('   • Ensure "Read and write permissions" are enabled');
      }

      if (errors.some(e => e.includes('Jest') || e.includes('test'))) {
        console.log('   • Test configuration issues detected');
        console.log('   • Run tests locally to verify they pass');
      }

      if (errors.some(e => e.includes('module') || e.includes('ENOENT'))) {
        console.log('   • Dependency installation issues');
        console.log('   • Check package.json and node_modules');
      }

      if (errors.length === 0) {
        console.log('   • Visit the workflow URL directly to see detailed logs');
        console.log('   • Check the specific job and step that failed');
        console.log('   • Look for NPM_GITHUB_ACTION_AUTO authentication issues');
      }

    } catch (error) {
      console.log(`❌ Error analyzing ${run.name}: ${error.message}`);
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  console.log('📋 Quick Debugging Steps:');
  console.log('========================');
  console.log('1. Visit the workflow URLs above');
  console.log('2. Click on the failed job');
  console.log('3. Expand the failed step');
  console.log('4. Look for specific error messages');
  console.log('5. Check if NPM_GITHUB_ACTION_AUTO is available in the environment\n');

  console.log('🔧 Common Solutions:');
  console.log('==================');
  console.log('• NPM Auth: Verify NPM_GITHUB_ACTION_AUTO secret exists and is valid');
  console.log('• Permissions: Enable "Read and write permissions" in repo settings');
  console.log('• Dependencies: Ensure all packages can be installed');
  console.log('• Tests: Verify tests pass locally before deployment');
  console.log('• Syntax: Check workflow YAML syntax is correct');
}

// Run the analysis
analyzeFailures().catch(console.error);
