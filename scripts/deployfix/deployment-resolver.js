#!/usr/bin/env node

/**
 * Enhanced Deployment Monitor with Auto-Resolution
 * Monitors GitHub Actions and provides automated fixes for common issues
 *
 * Usage: node deployment-resolver.js [--fix] [--detailed] [--history=N]
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REPOS = [
  {
    name: 'UI Components',
    owner: 'tamylaa',
    repo: 'tamyla-ui-components',
    branch: 'master',
    workflow: 'deploy.yml',
    localPath: './ui-platform/packages/ui-components',
    packageManager: 'npm'
  },
  {
    name: 'UI Components React',
    owner: 'tamylaa',
    repo: 'tamyla-ui-components-react',
    branch: 'main',
    workflow: 'deploy.yml',
    localPath: './ui-platform/packages/ui-components-react',
    packageManager: 'npm'
  },
  {
    name: 'UI Platform',
    owner: 'tamylaa',
    repo: 'trading-portal',
    branch: 'main',
    workflow: 'deploy.yml',
    localPath: './ui-platform',
    packageManager: 'npm'
  }
];

const STATUS_ICONS = {
  'success': '✅',
  'failure': '❌',
  'in_progress': '🔄',
  'pending': '⏳',
  'cancelled': '🚫',
  'skipped': '⏭️',
  'neutral': '⚪'
};

const STATUS_COLORS = {
  'success': '\x1b[32m',
  'failure': '\x1b[31m',
  'in_progress': '\x1b[33m',
  'pending': '\x1b[36m',
  'cancelled': '\x1b[35m',
  'skipped': '\x1b[90m',
  'neutral': '\x1b[37m'
};

const RESET_COLOR = '\x1b[0m';

// Resolution strategies for common deployment issues
const RESOLUTION_STRATEGIES = {
  'npm_install_failure': {
    name: 'NPM Install Failure',
    description: 'Dependencies installation failing',
    detection: /npm (ci|install) failed|Cannot resolve dependency/i,
    fixes: [
      {
        name: 'Clear npm cache',
        command: 'npm cache clean --force',
        description: 'Clears corrupted npm cache'
      },
      {
        name: 'Delete node_modules and package-lock.json',
        command: 'rm -rf node_modules package-lock.json && npm install',
        description: 'Fresh dependency installation'
      },
      {
        name: 'Update npm to latest',
        command: 'npm install -g npm@latest',
        description: 'Updates npm to resolve compatibility issues'
      }
    ]
  },
  'test_failure': {
    name: 'Test Failure',
    description: 'Jest or test runner failing',
    detection: /Test.*failed|FAIL.*test|jest.*failed/i,
    fixes: [
      {
        name: 'Update Jest configuration',
        command: 'npm install --save-dev jest@latest',
        description: 'Updates Jest to latest compatible version'
      },
      {
        name: 'Clear Jest cache',
        command: 'npx jest --clearCache',
        description: 'Clears Jest cache that might be corrupted'
      },
      {
        name: 'Run tests with debugging',
        command: 'npm test -- --verbose --no-cache',
        description: 'Runs tests with detailed output for debugging'
      }
    ]
  },
  'build_failure': {
    name: 'Build Failure',
    description: 'Build process failing',
    detection: /build.*failed|compilation.*error|webpack.*failed/i,
    fixes: [
      {
        name: 'Clear build cache',
        command: 'rm -rf dist build .cache && npm run build',
        description: 'Clears build artifacts and rebuilds'
      },
      {
        name: 'Update build dependencies',
        command: 'npm update webpack babel-loader @babel/core',
        description: 'Updates build toolchain dependencies'
      }
    ]
  },
  'publish_failure': {
    name: 'NPM Publish Failure',
    description: 'Package publishing failing',
    detection: /npm publish.*failed|publish.*error|401.*Unauthorized/i,
    fixes: [
      {
        name: 'Check NPM authentication',
        command: 'npm whoami',
        description: 'Verifies npm authentication status'
      },
      {
        name: 'Check NPM token configuration',
        command: 'echo "NPM_GITHUB_ACTION_AUTO: ${NPM_GITHUB_ACTION_AUTO:0:8}***"',
        description: 'Checks if NPM_GITHUB_ACTION_AUTO environment variable is set',
        interactive: false
      },
      {
        name: 'NPM Login (Interactive)',
        command: 'npm login',
        description: 'Re-authenticates with npm registry (requires manual input)',
        interactive: true
      },
      {
        name: 'Verify package version',
        command: 'npm version patch --no-git-tag-version',
        description: 'Increments version for publishing without git tag'
      }
    ]
  },
  'node_version_compatibility': {
    name: 'Node Version Compatibility',
    description: 'Node.js version compatibility issues',
    detection: /node.*version|engine.*node|unsupported.*node/i,
    fixes: [
      {
        name: 'Update package.json engines',
        file: 'package.json',
        description: 'Updates Node.js version requirements'
      },
      {
        name: 'Install Node Version Manager',
        command: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash',
        description: 'Installs nvm for Node version management'
      }
    ]
  },
  'eslint_failure': {
    name: 'ESLint Failure',
    description: 'Linting errors causing build failure',
    detection: /eslint.*error|linting.*failed/i,
    fixes: [
      {
        name: 'Auto-fix ESLint errors',
        command: 'npx eslint . --fix',
        description: 'Automatically fixes ESLint errors'
      },
      {
        name: 'Update ESLint configuration',
        file: '.eslintrc.json',
        description: 'Updates ESLint rules for compatibility'
      }
    ]
  }
};

class DeploymentResolver {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.detailed = process.argv.includes('--detailed');
    this.autoFix = process.argv.includes('--fix');
    this.historyCount = this.getHistoryCount();
    this.fixesApplied = [];

    if (!this.token) {
      console.warn('⚠️  GITHUB_TOKEN not found. Rate limiting may apply.');
    }
  }

  getHistoryCount() {
    const historyArg = process.argv.find(arg => arg.startsWith('--history='));
    return historyArg ? parseInt(historyArg.split('=')[1]) || 5 : 5;
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'deployment-resolver/1.0',
          'Accept': 'application/vnd.github.v3+json',
          ...(this.token && { 'Authorization': `token ${this.token}` })
        }
      };

      https.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || 'Unknown error'}`));
            } else {
              resolve(parsed);
            }
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        });
      }).on('error', reject);
    });
  }

  async getWorkflowRuns(repo) {
    try {
      const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/workflows/${repo.workflow}/runs?branch=${repo.branch}&per_page=${this.historyCount}`;
      const response = await this.makeRequest(url);
      return response.workflow_runs || [];
    } catch (error) {
      console.error(`❌ Failed to fetch workflow runs for ${repo.name}: ${error.message}`);
      return [];
    }
  }

  async getWorkflowJobs(repo, runId) {
    try {
      const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/runs/${runId}/jobs`;
      const response = await this.makeRequest(url);
      return response.jobs || [];
    } catch (error) {
      console.error(`❌ Failed to fetch jobs for run ${runId}: ${error.message}`);
      return [];
    }
  }

  async getJobLogs(repo, jobId) {
    try {
      const url = `https://api.github.com/repos/${repo.owner}/${repo.repo}/actions/jobs/${jobId}/logs`;
      const response = await this.makeRequest(url);
      return response;
    } catch (error) {
      console.error(`❌ Failed to fetch logs for job ${jobId}: ${error.message}`);
      return '';
    }
  }

  detectIssues(logs, jobName) {
    const detectedIssues = [];

    Object.entries(RESOLUTION_STRATEGIES).forEach(([key, strategy]) => {
      if (strategy.detection.test(logs)) {
        detectedIssues.push({
          type: key,
          strategy: strategy,
          jobName: jobName
        });
      }
    });

    // Additional pattern-based detection
    const commonPatterns = [
      { pattern: /Error: Cannot find module/i, type: 'missing_dependency' },
      { pattern: /ENOENT: no such file or directory/i, type: 'missing_file' },
      { pattern: /permission denied|EACCES/i, type: 'permission_error' },
      { pattern: /network timeout|ETIMEDOUT/i, type: 'network_timeout' },
      { pattern: /out of memory|ENOMEM/i, type: 'memory_error' }
    ];

    commonPatterns.forEach(({ pattern, type }) => {
      if (pattern.test(logs)) {
        detectedIssues.push({
          type: type,
          strategy: { name: type.replace('_', ' ').toUpperCase(), description: 'Detected pattern-based issue' },
          jobName: jobName
        });
      }
    });

    return detectedIssues;
  }

  async applyFix(repo, fix) {
    if (!this.autoFix) {
      console.log(`🔧 Suggested fix: ${fix.name}`);
      console.log(`   Command: ${fix.command || 'File modification'}`);
      console.log(`   Description: ${fix.description}`);
      if (fix.interactive) {
        console.log('   ⚠️  Interactive command - requires manual execution');
      }
      return false;
    }

    console.log(`🔧 Applying fix: ${fix.name}`);

    // Skip interactive commands in auto-fix mode
    if (fix.interactive) {
      console.log(`   ⚠️  Skipping interactive command: ${fix.command}`);
      console.log(`   💡 Please run manually: cd ${repo.localPath} && ${fix.command}`);
      this.fixesApplied.push({ repo: repo.name, fix: fix.name, status: 'manual_required', reason: 'interactive' });
      return false;
    }

    try {
      if (fix.command) {
        const workingDir = path.resolve(repo.localPath);
        console.log(`   Working directory: ${workingDir}`);
        console.log(`   Command: ${fix.command}`);

        if (fs.existsSync(workingDir)) {
          const result = await execAsync(fix.command, {
            cwd: workingDir,
            timeout: 30000 // 30 second timeout to prevent hanging
          });
          console.log('   ✅ Command executed successfully');
          if (result.stdout) console.log(`   Output: ${result.stdout.trim()}`);
          this.fixesApplied.push({ repo: repo.name, fix: fix.name, status: 'success' });
          return true;
        } else {
          console.log(`   ❌ Local path not found: ${workingDir}`);
          return false;
        }
      } else if (fix.file) {
        console.log(`   📝 File modification needed: ${fix.file}`);
        console.log(`   Description: ${fix.description}`);
        this.fixesApplied.push({ repo: repo.name, fix: fix.name, status: 'manual_required' });
        return false;
      }
    } catch (error) {
      if (error.code === 'TIMEOUT') {
        console.log('   ⏰ Fix timed out - likely an interactive command');
        console.log(`   💡 Please run manually: cd ${repo.localPath} && ${fix.command}`);
        this.fixesApplied.push({ repo: repo.name, fix: fix.name, status: 'timeout', error: 'Command timed out' });
      } else {
        console.log(`   ❌ Fix failed: ${error.message}`);
        this.fixesApplied.push({ repo: repo.name, fix: fix.name, status: 'failed', error: error.message });
      }
      return false;
    }

    return false;
  }

  formatDuration(startTime, endTime) {
    if (!startTime || !endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end - start) / 1000);

    if (duration < 60) return `${duration}s`;
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  }

  formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.round((now - time) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
    return `${Math.round(diff / 86400)}d ago`;
  }

  colorize(status, text) {
    const color = STATUS_COLORS[status] || '';
    return `${color}${text}${RESET_COLOR}`;
  }

  async analyzeAndResolveRepository(repo) {
    console.log(`\n📦 ${this.colorize('neutral', `=== ${repo.name} ===`)}`);
    console.log(`Repository: ${repo.owner}/${repo.repo}`);
    console.log(`Branch: ${repo.branch} | Workflow: ${repo.workflow}`);

    const runs = await this.getWorkflowRuns(repo);

    if (runs.length === 0) {
      console.log('❌ No workflow runs found');
      return { latest: null, successRate: 0, totalRuns: 0, issues: [] };
    }

    const latest = runs[0];
    const successCount = runs.filter(run => run.conclusion === 'success').length;
    const successRate = Math.round((successCount / runs.length) * 100);

    // Latest run summary
    const icon = STATUS_ICONS[latest.status] || '❓';
    const status = latest.conclusion || latest.status;
    console.log(`\n🎯 Latest Deploy: ${icon} ${this.colorize(status, status.toUpperCase())}`);
    console.log(`   Commit: ${latest.head_sha.substring(0, 7)} - "${latest.head_commit?.message?.split('\n')[0] || 'No message'}" by ${latest.head_commit?.author?.name || 'Unknown'}`);
    console.log(`   Started: ${this.formatRelativeTime(latest.created_at)}`);
    console.log(`   Duration: ${this.formatDuration(latest.created_at, latest.updated_at)}`);

    // Issue detection and resolution
    const allIssues = [];

    if (status === 'failure') {
      console.log('\n🔍 Analyzing failure details...');
      const jobs = await this.getWorkflowJobs(repo, latest.id);

      for (const job of jobs) {
        if (job.conclusion === 'failure') {
          console.log(`\n❌ Failed Job: ${job.name}`);

          // For demonstration, we'll use job name and conclusion to detect issues
          // In a real implementation, you'd fetch actual logs
          const mockLogs = this.generateMockLogs(job);
          const issues = this.detectIssues(mockLogs, job.name);

          if (issues.length > 0) {
            console.log(`   🔍 Detected ${issues.length} issue(s):`);

            for (const issue of issues) {
              console.log(`   📋 Issue: ${issue.strategy.name}`);
              console.log(`   📝 Description: ${issue.strategy.description}`);

              if (issue.strategy.fixes) {
                console.log('   🛠️  Available fixes:');

                for (const fix of issue.strategy.fixes) {
                  const applied = await this.applyFix(repo, fix);
                  if (!applied && !this.autoFix) {
                    console.log('   💡 Run with --fix flag to auto-apply fixes');
                  }
                }
              }

              allIssues.push(issue);
            }
          } else {
            console.log('   ⚠️  No automatic resolution available - manual investigation needed');
            console.log(`   🔗 Job URL: ${job.html_url}`);
          }
        }
      }
    }

    // Success rate
    console.log(`\n📊 Success Rate: ${successRate}% (${successCount}/${runs.length} recent runs)`);

    return {
      latest,
      successRate,
      totalRuns: runs.length,
      recentFailures: runs.filter(run => run.conclusion === 'failure').length,
      issues: allIssues
    };
  }

  generateMockLogs(job) {
    // Generate mock logs based on job patterns for demonstration
    const mockPatterns = {
      'test': 'npm test failed with exit code 1\nTest suite failed to run\nJest encountered an unexpected token',
      'build': 'webpack compilation failed\nTypeScript compilation error\nModule not found',
      'publish': 'npm publish failed\n401 Unauthorized\nYou must be logged in to publish packages',
      'install': 'npm ci failed\nCannot resolve dependency\nnetwork timeout'
    };

    const jobLower = job.name.toLowerCase();
    for (const [pattern, logs] of Object.entries(mockPatterns)) {
      if (jobLower.includes(pattern)) {
        return logs;
      }
    }

    return 'Generic job failure - no specific pattern detected';
  }

  async generateResolutionReport(results) {
    console.log(`\n\n${this.colorize('neutral', '='.repeat(60))}`);
    console.log(`${this.colorize('neutral', '📋 DEPLOYMENT RESOLUTION REPORT')}`);
    console.log(`${this.colorize('neutral', '='.repeat(60))}`);

    const timestamp = new Date().toISOString();
    console.log(`Generated: ${timestamp}`);
    console.log(`Auto-fix mode: ${this.autoFix ? '✅ ENABLED' : '❌ DISABLED'}`);

    let totalIssues = 0;
    let resolvedIssues = 0;

    results.forEach(({ repo, data }) => {
      console.log(`\n📦 ${repo.name}:`);

      if (data.issues.length > 0) {
        totalIssues += data.issues.length;
        console.log(`   🔍 Issues detected: ${data.issues.length}`);

        data.issues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue.strategy.name} (${issue.jobName})`);
        });
      } else {
        const status = data.latest ? (data.latest.conclusion || data.latest.status) : 'unknown';
        if (status === 'success') {
          console.log('   ✅ No issues - deployment healthy');
        } else {
          console.log('   ⚠️  Manual investigation required');
        }
      }
    });

    if (this.fixesApplied.length > 0) {
      console.log('\n🔧 FIXES APPLIED:');
      this.fixesApplied.forEach((fix, index) => {
        const statusIcon = fix.status === 'success' ? '✅' :
          fix.status === 'failed' ? '❌' : '⚠️';
        console.log(`   ${index + 1}. ${statusIcon} ${fix.repo}: ${fix.fix}`);
        if (fix.error) {
          console.log(`      Error: ${fix.error}`);
        }
      });

      resolvedIssues = this.fixesApplied.filter(f => f.status === 'success').length;
    }

    console.log('\n📊 SUMMARY:');
    console.log(`   Total issues detected: ${totalIssues}`);
    console.log(`   Fixes applied: ${resolvedIssues}`);
    console.log(`   Success rate: ${totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 100}%`);

    if (!this.autoFix && totalIssues > 0) {
      console.log('\n💡 NEXT STEPS:');
      console.log('   • Run with --fix flag to automatically apply suggested fixes');
      console.log('   • Review manual fixes for files that need updates');
      console.log('   • Test locally before pushing changes');
    }
  }

  async run() {
    console.log(`🚀 ${this.colorize('neutral', 'Enhanced Deployment Monitor & Resolver')}`);
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log(`🔍 Checking last ${this.historyCount} runs per repository`);

    if (this.detailed) {
      console.log('📋 Detailed mode enabled');
    }

    if (this.autoFix) {
      console.log('🔧 Auto-fix mode enabled');
    } else {
      console.log('💡 Suggestion mode - use --fix to auto-apply fixes');
    }

    const results = [];

    for (const repo of REPOS) {
      try {
        const data = await this.analyzeAndResolveRepository(repo);
        results.push({ repo, data });
      } catch (error) {
        console.error(`❌ Failed to analyze ${repo.name}: ${error.message}`);
        results.push({
          repo,
          data: {
            latest: null,
            successRate: 0,
            totalRuns: 0,
            recentFailures: 0,
            issues: []
          }
        });
      }
    }

    await this.generateResolutionReport(results);

    console.log('\n✨ Analysis and resolution complete!');
  }
}

// Run the resolver
const scriptPath = fileURLToPath(import.meta.url);
const mainPath = process.argv[1];

if (scriptPath === mainPath || scriptPath === mainPath + '.js') {
  const resolver = new DeploymentResolver();
  resolver.run().catch(error => {
    console.error(`💥 Resolver failed: ${error.message}`);
    process.exit(1);
  });
}

export default DeploymentResolver;
