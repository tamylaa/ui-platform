#!/bin/bash

# Enhanced Deployment Resolver - PowerShell Script
# Monitors deployments and provides automated resolution capabilities

param(
    [switch]$Detailed,
    [switch]$Fix,
    [int]$History = 5,
    [switch]$Help,
    [switch]$DryRun,
    [string]$Repository = "all"
)

if ($Help) {
    Write-Host ""
    Write-Host "Enhanced Deployment Monitor & Resolver" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deployment-resolver.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Detailed          Show detailed job information and diagnostics" -ForegroundColor White
    Write-Host "  -Fix               Automatically apply suggested fixes" -ForegroundColor White
    Write-Host "  -DryRun            Show what fixes would be applied without executing" -ForegroundColor White
    Write-Host "  -History <N>       Show last N runs (default: 5)" -ForegroundColor White
    Write-Host "  -Repository <name> Focus on specific repository (ui-components, ui-components-react, ui-platform, or all)" -ForegroundColor White
    Write-Host "  -Help              Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Environment Variables:" -ForegroundColor Yellow
    Write-Host "  GITHUB_TOKEN       GitHub personal access token (recommended)" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\deployment-resolver.ps1                           # Basic monitoring" -ForegroundColor White
    Write-Host "  .\deployment-resolver.ps1 -Detailed                 # Detailed analysis" -ForegroundColor White
    Write-Host "  .\deployment-resolver.ps1 -Fix                      # Auto-fix issues" -ForegroundColor White
    Write-Host "  .\deployment-resolver.ps1 -Fix -DryRun              # Preview fixes" -ForegroundColor White
    Write-Host "  .\deployment-resolver.ps1 -Repository ui-components # Focus on specific repo" -ForegroundColor White
    Write-Host ""
    Write-Host "Common Resolution Types:" -ForegroundColor Yellow
    Write-Host "  • NPM dependency issues          → Cache clearing, reinstall" -ForegroundColor White
    Write-Host "  • Test failures                  → Jest configuration, cache clearing" -ForegroundColor White
    Write-Host "  • Build failures                 → Build cache clearing, dependency updates" -ForegroundColor White
    Write-Host "  • Publish failures               → NPM authentication, version bumping" -ForegroundColor White
    Write-Host "  • Node version compatibility     → Engine requirements update" -ForegroundColor White
    Write-Host "  • ESLint failures                → Auto-fix linting errors" -ForegroundColor White
    Write-Host ""
    exit 0
}

function Test-Prerequisites {
    Write-Host "🔍 Checking prerequisites..." -ForegroundColor Cyan
    
    # Check Node.js
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
        } else {
            throw "Node.js not found"
        }
    }
    catch {
        Write-Host "❌ Node.js not found. Please install Node.js." -ForegroundColor Red
        Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
    
    # Check npm
    try {
        $npmVersion = npm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ npm: v$npmVersion" -ForegroundColor Green
        } else {
            throw "npm not found"
        }
    }
    catch {
        Write-Host "❌ npm not found." -ForegroundColor Red
        return $false
    }
    
    # Check resolver script
    $scriptPath = Join-Path $PSScriptRoot "deployment-resolver.js"
    if (Test-Path $scriptPath) {
        Write-Host "✅ Resolver script: $scriptPath" -ForegroundColor Green
    } else {
        Write-Host "❌ deployment-resolver.js not found." -ForegroundColor Red
        return $false
    }
    
    # Check GitHub token
    if ($env:GITHUB_TOKEN) {
        Write-Host "✅ GitHub token: Configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  GitHub token: Not found (rate limits may apply)" -ForegroundColor Yellow
        Write-Host "   Set GITHUB_TOKEN environment variable for better performance" -ForegroundColor Gray
    }
    
    return $true
}

function Invoke-DeploymentResolver {
    param($ScriptPath, $Options)
    
    Write-Host ""
    Write-Host "🚀 Running enhanced deployment resolver..." -ForegroundColor Cyan
    
    if ($DryRun -and $Fix) {
        Write-Host "🔍 DRY RUN MODE: Will show fixes without applying them" -ForegroundColor Yellow
        $Options = $Options.Replace("--fix", "")
    }
    
    Write-Host "Options: $Options" -ForegroundColor Gray
    Write-Host ""
    
    try {
        if ($Options.Trim()) {
            & node $ScriptPath $Options.Split(' ')
        } else {
            & node $ScriptPath
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Resolver completed successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host ""
            Write-Host "❌ Resolver failed. Exit code: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host ""
        Write-Host "❌ Error running resolver: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Show-PostResolutionActions {
    Write-Host ""
    Write-Host "📋 POST-RESOLUTION ACTIONS" -ForegroundColor Cyan
    Write-Host "==========================" -ForegroundColor Cyan
    
    if ($Fix) {
        Write-Host ""
        Write-Host "✅ Fixes have been applied! Next steps:" -ForegroundColor Green
        Write-Host "1. Review the changes made to your repositories" -ForegroundColor White
        Write-Host "2. Test the fixes locally:" -ForegroundColor White
        Write-Host "   cd ui-platform/packages/ui-components" -ForegroundColor Gray
        Write-Host "   npm test" -ForegroundColor Gray
        Write-Host "   npm run build" -ForegroundColor Gray
        Write-Host "3. Commit and push changes if tests pass" -ForegroundColor White
        Write-Host "4. Monitor new deployment runs" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "💡 To apply suggested fixes automatically:" -ForegroundColor Yellow
        Write-Host "   .\deployment-resolver.ps1 -Fix" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 To preview fixes without applying:" -ForegroundColor Yellow
        Write-Host "   .\deployment-resolver.ps1 -Fix -DryRun" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "🔄 To monitor ongoing deployments:" -ForegroundColor Cyan
    Write-Host "   .\deployment-monitor.ps1 -Watch" -ForegroundColor White
    
    Write-Host ""
    Write-Host "📊 To generate detailed reports:" -ForegroundColor Cyan
    Write-Host "   .\deployment-resolver.ps1 -Detailed -History 10" -ForegroundColor White
}

# Main execution
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Enhanced Deployment Resolver" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
if (-not (Test-Prerequisites)) {
    exit 1
}

# Build options string
$options = @()
if ($Detailed) { $options += "--detailed" }
if ($Fix -and -not $DryRun) { $options += "--fix" }
if ($History -ne 5) { $options += "--history=$History" }

$optionsString = $options -join " "

# Show configuration
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Target Repository: $Repository" -ForegroundColor White
Write-Host "  Detailed Analysis: $($Detailed.IsPresent)" -ForegroundColor White
Write-Host "  Auto-Fix Mode: $($Fix.IsPresent)" -ForegroundColor White
Write-Host "  Dry Run: $($DryRun.IsPresent)" -ForegroundColor White
Write-Host "  History Depth: $History runs" -ForegroundColor White

# Validate repository parameter
$validRepos = @("all", "ui-components", "ui-components-react", "ui-platform")
if ($Repository -notin $validRepos) {
    Write-Host ""
    Write-Host "❌ Invalid repository: $Repository" -ForegroundColor Red
    Write-Host "Valid options: $($validRepos -join ', ')" -ForegroundColor Yellow
    exit 1
}

# Run resolver
$scriptPath = Join-Path $PSScriptRoot "deployment-resolver.js"
$success = Invoke-DeploymentResolver -ScriptPath $scriptPath -Options $optionsString

# Show post-resolution actions
Show-PostResolutionActions

if (-not $success) {
    Write-Host ""
    Write-Host "❌ Resolution process encountered errors. Check the output above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✨ Enhanced deployment resolution complete!" -ForegroundColor Green
