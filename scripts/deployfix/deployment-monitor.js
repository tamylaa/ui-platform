#!/usr/bin/env node

/**
 * Deployment Monitor Script
 * Monitors GitHub Actions deployment status across UI platform repositories
 *
 * Usage: node deployment-monitor.js [--detailed] [--history=N]
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const REPOS = [
  {
    name: 'UI Components',
    owner: 'tamylaa',
    repo: 'tamyla-ui-components',
    branch: 'master',
    workflow: 'deploy.yml'
  },
  {
    name: 'UI Components React',
    owner: 'tamylaa',
    repo: 'tamyla-ui-components-react',
    branch: 'main',
    workflow: 'deploy.yml'
  },
  {
    name: 'UI Platform',
    owner: 'tamylaa',
    repo: 'trading-portal',
    branch: 'main',
    workflow: 'deploy.yml'
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
  'success': '\x1b[32m',      // Green
  'failure': '\x1b[31m',      // Red
  'in_progress': '\x1b[33m',  // Yellow
  'pending': '\x1b[36m',      // Cyan
  'cancelled': '\x1b[35m',    // Magenta
  'skipped': '\x1b[90m',      // Gray
  'neutral': '\x1b[37m'       // White
};

const RESET_COLOR = '\x1b[0m';

class DeploymentMonitor {
  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.detailed = process.argv.includes('--detailed');
    this.historyCount = this.getHistoryCount();

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
          'User-Agent': 'deployment-monitor/1.0',
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

  async analyzeRepository(repo) {
    console.log(`\n📦 ${this.colorize('neutral', `=== ${repo.name} ===`)}`);
    console.log(`Repository: ${repo.owner}/${repo.repo}`);
    console.log(`Branch: ${repo.branch} | Workflow: ${repo.workflow}`);

    const runs = await this.getWorkflowRuns(repo);

    if (runs.length === 0) {
      console.log('❌ No workflow runs found');
      return { latest: null, successRate: 0, totalRuns: 0 };
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

    if (latest.html_url) {
      console.log(`   URL: ${latest.html_url}`);
    }

    // Success rate
    console.log(`\n📊 Success Rate: ${successRate}% (${successCount}/${runs.length} recent runs)`);

    // Detailed job analysis for latest run
    if (this.detailed && latest.id) {
      console.log('\n🔍 Latest Run Job Details:');
      const jobs = await this.getWorkflowJobs(repo, latest.id);

      if (jobs.length > 0) {
        jobs.forEach(job => {
          const jobIcon = STATUS_ICONS[job.conclusion || job.status] || '❓';
          const jobStatus = job.conclusion || job.status;
          console.log(`   ${jobIcon} ${job.name}: ${this.colorize(jobStatus, jobStatus.toUpperCase())} (${this.formatDuration(job.started_at, job.completed_at)})`);

          if (job.conclusion === 'failure' && job.html_url) {
            console.log(`     Logs: ${job.html_url}`);
          }
        });
      } else {
        console.log('   No job details available');
      }
    }

    // Historical analysis
    if (runs.length > 1) {
      console.log('\n📈 Recent History:');
      runs.slice(0, Math.min(5, runs.length)).forEach((run, index) => {
        const icon = STATUS_ICONS[run.conclusion || run.status] || '❓';
        const status = run.conclusion || run.status;
        const timeAgo = this.formatRelativeTime(run.created_at);
        console.log(`   ${index + 1}. ${icon} ${this.colorize(status, status.toUpperCase())} - ${run.head_sha.substring(0, 7)} (${timeAgo})`);
      });
    }

    return {
      latest,
      successRate,
      totalRuns: runs.length,
      recentFailures: runs.filter(run => run.conclusion === 'failure').length
    };
  }

  async generateSummaryReport(results) {
    console.log(`\n\n${this.colorize('neutral', '='.repeat(60))}`);
    console.log(`${this.colorize('neutral', '📋 DEPLOYMENT SUMMARY REPORT')}`);
    console.log(`${this.colorize('neutral', '='.repeat(60))}`);

    const timestamp = new Date().toISOString();
    console.log(`Generated: ${timestamp}`);

    let overallHealthy = true;
    let totalFailures = 0;

    results.forEach(({ repo, data }) => {
      if (!data.latest) {
        console.log(`\n❌ ${repo.name}: No deployment data`);
        overallHealthy = false;
        return;
      }

      const latestStatus = data.latest.conclusion || data.latest.status;
      const isHealthy = latestStatus === 'success' && data.successRate >= 80;

      if (!isHealthy) overallHealthy = false;
      totalFailures += data.recentFailures;

      const healthIcon = isHealthy ? '✅' : '⚠️';
      console.log(`\n${healthIcon} ${repo.name}:`);
      console.log(`   Latest: ${this.colorize(latestStatus, latestStatus.toUpperCase())}`);
      console.log(`   Success Rate: ${data.successRate}%`);
      console.log(`   Recent Failures: ${data.recentFailures}`);
    });

    console.log(`\n🎯 Overall Status: ${overallHealthy ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}`);
    console.log(`📊 Total Recent Failures: ${totalFailures}`);

    // Recommendations
    if (!overallHealthy) {
      console.log('\n💡 Recommendations:');
      results.forEach(({ repo, data }) => {
        if (data.latest && data.successRate < 80) {
          console.log(`   • ${repo.name}: Success rate below 80% - check recent failure patterns`);
        }
        if (data.latest && (data.latest.conclusion || data.latest.status) !== 'success') {
          console.log(`   • ${repo.name}: Latest deployment failed - investigate immediately`);
        }
      });
    }
  }

  async saveReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `deployment-report-${timestamp.split('T')[0]}.json`;

    const report = {
      timestamp: new Date().toISOString(),
      repositories: results.map(({ repo, data }) => ({
        name: repo.name,
        repository: `${repo.owner}/${repo.repo}`,
        branch: repo.branch,
        latest_status: data.latest ? (data.latest.conclusion || data.latest.status) : null,
        success_rate: data.successRate,
        total_runs: data.totalRuns,
        recent_failures: data.recentFailures,
        latest_commit: data.latest ? data.latest.head_sha : null,
        latest_run_url: data.latest ? data.latest.html_url : null
      }))
    };

    try {
      fs.writeFileSync(filename, JSON.stringify(report, null, 2));
      console.log(`\n💾 Report saved: ${filename}`);
    } catch (error) {
      console.error(`❌ Failed to save report: ${error.message}`);
    }
  }

  async run() {
    console.log(`🚀 ${this.colorize('neutral', 'UI Platform Deployment Monitor')}`);
    console.log(`📅 ${new Date().toLocaleString()}`);
    console.log(`🔍 Checking last ${this.historyCount} runs per repository`);

    if (this.detailed) {
      console.log('📋 Detailed mode enabled');
    }

    const results = [];

    for (const repo of REPOS) {
      try {
        const data = await this.analyzeRepository(repo);
        results.push({ repo, data });
      } catch (error) {
        console.error(`❌ Failed to analyze ${repo.name}: ${error.message}`);
        results.push({ repo, data: { latest: null, successRate: 0, totalRuns: 0, recentFailures: 0 } });
      }
    }

    await this.generateSummaryReport(results);
    await this.saveReport(results);

    console.log('\n✨ Monitoring complete!');
  }
}

// Run the monitor
const scriptPath = fileURLToPath(import.meta.url);
const mainPath = process.argv[1];

if (scriptPath === mainPath || scriptPath === mainPath + '.js') {
  const monitor = new DeploymentMonitor();
  monitor.run().catch(error => {
    console.error(`💥 Monitor failed: ${error.message}`);
    process.exit(1);
  });
}

export default DeploymentMonitor;
