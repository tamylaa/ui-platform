# UI Platform Deployment Monitor

Comprehensive deployment monitoring tool for tracking GitHub Actions across the UI Platform repositories.

## 🎯 Purpose

This monitoring system helps you track deployment success/failure patterns across:
- **UI Components** (`tamyla-ui-components`)
- **UI Components React** (`tamyla-ui-components-react`) 
- **UI Platform** (`trading-portal`)

## 🚀 Quick Start

### Windows (PowerShell)
```powershell
.\deployment-monitor.ps1
```

### Windows (Batch)
```cmd
deployment-monitor.bat
```

### Cross-platform (Node.js)
```bash
node deployment-monitor.js
```

## 📋 Features

### ✅ Basic Monitoring
- **Latest deployment status** for each repository
- **Success rate** calculation over recent runs
- **Commit information** and author details
- **Deployment duration** and timing
- **Direct links** to failed workflow runs

### 🔍 Detailed Analysis (`--detailed`)
- **Individual job status** within each workflow
- **Job execution times** and failure points
- **Direct links to failed job logs**
- **Step-by-step breakdown** of deployment pipeline

### 📊 Historical Tracking (`--history=N`)
- **Configurable history depth** (default: 5 runs)
- **Pattern recognition** for recurring failures
- **Trend analysis** over time
- **Success rate calculations**

### 🔄 Continuous Monitoring (`--watch`)
- **Real-time monitoring** with configurable intervals
- **Automatic refresh** every 5 minutes (default)
- **Persistent tracking** until manually stopped
- **Iteration tracking** with timestamps

### 💾 Report Generation
- **JSON reports** saved automatically
- **Timestamped files** for historical analysis
- **Structured data** for further processing
- **API-ready format** for integrations

## 🛠️ Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **GitHub Token** (recommended for higher rate limits)

### GitHub Token Setup
1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Create a new token with `repo` and `actions:read` permissions
3. Set environment variable:

**Windows PowerShell:**
```powershell
$env:GITHUB_TOKEN = "your_token_here"
```

**Windows Command Prompt:**
```cmd
set GITHUB_TOKEN=your_token_here
```

**Linux/macOS:**
```bash
export GITHUB_TOKEN=your_token_here
```

## 📖 Usage Examples

### Basic Monitoring
```bash
# Quick status check
node deployment-monitor.js

# PowerShell version
.\deployment-monitor.ps1
```

### Detailed Analysis
```bash
# Full job breakdown
node deployment-monitor.js --detailed

# PowerShell with detailed output
.\deployment-monitor.ps1 -Detailed
```

### Historical Analysis
```bash
# Check last 10 deployments
node deployment-monitor.js --history=10

# PowerShell version
.\deployment-monitor.ps1 -History 10
```

### Continuous Monitoring
```bash
# Watch mode (PowerShell only)
.\deployment-monitor.ps1 -Watch

# Custom interval (10 minutes)
.\deployment-monitor.ps1 -Watch -WatchInterval 600
```

### Combined Options
```bash
# Detailed monitoring with extended history
node deployment-monitor.js --detailed --history=15

# PowerShell equivalent
.\deployment-monitor.ps1 -Detailed -History 15
```

## 📄 Sample Output

```
🚀 UI Platform Deployment Monitor
📅 8/28/2025, 2:30:45 PM
🔍 Checking last 5 runs per repository

📦 === UI Components ===
Repository: tamylaa/tamyla-ui-components
Branch: master | Workflow: deploy.yml

🎯 Latest Deploy: ✅ SUCCESS
   Commit: 7275df5 - "Fix workflow branch references and NPM_GITHUB_ACTION_AUTO handling" by Admin
   Started: 2h ago
   Duration: 3m 45s
   URL: https://github.com/tamylaa/tamyla-ui-components/actions/runs/123456

📊 Success Rate: 80% (4/5 recent runs)

📈 Recent History:
   1. ✅ SUCCESS - 7275df5 (2h ago)
   2. ❌ FAILURE - a1b2c3d (1d ago)
   3. ✅ SUCCESS - e4f5g6h (2d ago)
   4. ✅ SUCCESS - i7j8k9l (3d ago)
   5. ✅ SUCCESS - m0n1o2p (4d ago)

============================================================
📋 DEPLOYMENT SUMMARY REPORT
============================================================
Generated: 2025-08-28T19:30:45.123Z

✅ UI Components:
   Latest: SUCCESS
   Success Rate: 80%
   Recent Failures: 1

✅ UI Components React:
   Latest: SUCCESS
   Success Rate: 100%
   Recent Failures: 0

⚠️ UI Platform:
   Latest: FAILURE
   Success Rate: 60%
   Recent Failures: 2

🎯 Overall Status: ⚠️ NEEDS ATTENTION
📊 Total Recent Failures: 3

💡 Recommendations:
   • UI Platform: Success rate below 80% - check recent failure patterns
   • UI Platform: Latest deployment failed - investigate immediately

💾 Report saved: deployment-report-2025-08-28.json
✨ Monitoring complete!
```

## 🔧 Configuration

### Repository Configuration
Edit the `REPOS` array in `deployment-monitor.js` to modify:
- Repository names and owners
- Branch names
- Workflow file names

### Status Icons and Colors
Customize status indicators in the script:
- ✅ Success (Green)
- ❌ Failure (Red)
- 🔄 In Progress (Yellow)
- ⏳ Pending (Cyan)
- 🚫 Cancelled (Magenta)

## 📊 Report Format

Generated JSON reports include:
```json
{
  "timestamp": "2025-08-28T19:30:45.123Z",
  "repositories": [
    {
      "name": "UI Components",
      "repository": "tamylaa/tamyla-ui-components",
      "branch": "master",
      "latest_status": "success",
      "success_rate": 80,
      "total_runs": 5,
      "recent_failures": 1,
      "latest_commit": "7275df5a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
      "latest_run_url": "https://github.com/tamylaa/tamyla-ui-components/actions/runs/123456"
    }
  ]
}
```

## 🚨 Troubleshooting

### Rate Limiting
- **Issue**: API rate limit exceeded
- **Solution**: Set `GITHUB_TOKEN` environment variable

### Network Errors
- **Issue**: HTTPS request failures
- **Solution**: Check internet connection and GitHub status

### Missing Workflows
- **Issue**: No workflow runs found
- **Solution**: Verify repository names and workflow file existence

### Permission Errors
- **Issue**: 403 Forbidden responses
- **Solution**: Ensure GitHub token has appropriate permissions

## 🔄 Integration Ideas

### CI/CD Integration
```bash
# Add to your CI pipeline
node deployment-monitor.js --detailed --history=10 > deployment-status.txt
```

### Slack Notifications
```bash
# Combine with Slack webhook
node deployment-monitor.js | slack-notify
```

### Dashboard Integration
```bash
# Generate data for dashboards
node deployment-monitor.js --history=20 > dashboard-data.json
```

## 📝 License

This tool is part of the UI Platform project and follows the same licensing terms.
