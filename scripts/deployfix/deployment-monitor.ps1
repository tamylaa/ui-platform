#!/bin/bash

# Deployment Monitor - PowerShell Script
# Cross-platform deployment monitoring for UI Platform

param(
    [switch]$Detailed,
    [int]$History = 5,
    [switch]$Help,
    [switch]$Watch,
    [int]$WatchInterval = 300
)

if ($Help) {
    Write-Host ""
    Write-Host "UI Platform Deployment Monitor" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\deployment-monitor.ps1 [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Detailed          Show detailed job information" -ForegroundColor White
    Write-Host "  -History <N>       Show last N runs (default: 5)" -ForegroundColor White
    Write-Host "  -Watch             Continuous monitoring mode" -ForegroundColor White
    Write-Host "  -WatchInterval <S> Watch interval in seconds (default: 300)" -ForegroundColor White
    Write-Host "  -Help              Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Environment Variables:" -ForegroundColor Yellow
    Write-Host "  GITHUB_TOKEN       GitHub personal access token (recommended)" -ForegroundColor White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\deployment-monitor.ps1" -ForegroundColor White
    Write-Host "  .\deployment-monitor.ps1 -Detailed" -ForegroundColor White
    Write-Host "  .\deployment-monitor.ps1 -History 10" -ForegroundColor White
    Write-Host "  .\deployment-monitor.ps1 -Watch -WatchInterval 600" -ForegroundColor White
    Write-Host ""
    exit 0
}

function Test-NodeJS {
    try {
        $nodeVersion = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
            return $true
        }
    }
    catch {
        # Node not found
    }
    
    Write-Host "❌ Node.js not found. Please install Node.js to run this script." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    return $false
}

function Test-MonitorScript {
    $scriptPath = Join-Path $PSScriptRoot "deployment-monitor.js"
    if (Test-Path $scriptPath) {
        Write-Host "✅ Monitor script found: $scriptPath" -ForegroundColor Green
        return $scriptPath
    }
    
    Write-Host "❌ deployment-monitor.js not found in the same directory." -ForegroundColor Red
    return $null
}

function Invoke-DeploymentMonitor {
    param($ScriptPath, $Options)
    
    Write-Host ""
    Write-Host "🚀 Running deployment monitor..." -ForegroundColor Cyan
    Write-Host "Options: $Options" -ForegroundColor Gray
    Write-Host ""
    
    try {
        if ($Options) {
            & node $ScriptPath $Options.Split(' ')
        } else {
            & node $ScriptPath
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Monitor completed successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host ""
            Write-Host "❌ Deployment monitor failed. Exit code: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host ""
        Write-Host "❌ Error running monitor: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Start-ContinuousMonitoring {
    param($ScriptPath, $Options, $Interval)
    
    Write-Host ""
    Write-Host "🔄 Starting continuous monitoring..." -ForegroundColor Cyan
    Write-Host "Interval: $Interval seconds" -ForegroundColor Gray
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    $iteration = 1
    
    try {
        while ($true) {
            Write-Host ""
            Write-Host "==================== Iteration $iteration ====================" -ForegroundColor Magenta
            Write-Host "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
            
            $success = Invoke-DeploymentMonitor -ScriptPath $ScriptPath -Options $Options
            
            if (-not $success) {
                Write-Host "⚠️  Monitor failed, but continuing..." -ForegroundColor Yellow
            }
            
            Write-Host ""
            Write-Host "⏰ Waiting $Interval seconds before next check..." -ForegroundColor Cyan
            Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
            
            Start-Sleep -Seconds $Interval
            $iteration++
        }
    }
    catch [System.Management.Automation.PipelineStoppedException] {
        Write-Host ""
        Write-Host "🛑 Monitoring stopped by user." -ForegroundColor Yellow
    }
    catch {
        Write-Host ""
        Write-Host "❌ Monitoring error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   UI Platform Deployment Monitor" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
if (-not (Test-NodeJS)) {
    exit 1
}

$scriptPath = Test-MonitorScript
if (-not $scriptPath) {
    exit 1
}

# Build options string
$options = @()
if ($Detailed) { $options += "--detailed" }
if ($History -ne 5) { $options += "--history=$History" }

$optionsString = $options -join " "

# Check for GitHub token
if ($env:GITHUB_TOKEN) {
    Write-Host "✅ GitHub token found (rate limits will be higher)" -ForegroundColor Green
} else {
    Write-Host "⚠️  No GitHub token found. Consider setting GITHUB_TOKEN environment variable" -ForegroundColor Yellow
    Write-Host "   to avoid rate limiting. Create token at: https://github.com/settings/tokens" -ForegroundColor Gray
}

# Run monitor
if ($Watch) {
    Start-ContinuousMonitoring -ScriptPath $scriptPath -Options $optionsString -Interval $WatchInterval
} else {
    $success = Invoke-DeploymentMonitor -ScriptPath $scriptPath -Options $optionsString
    if (-not $success) {
        exit 1
    }
}

Write-Host ""
Write-Host "✨ All done!" -ForegroundColor Green
