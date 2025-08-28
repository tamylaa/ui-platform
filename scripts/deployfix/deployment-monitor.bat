@echo off
REM Deployment Monitor - Windows Batch Script
REM Quick wrapper for running the deployment monitor

echo.
echo ========================================
echo   UI Platform Deployment Monitor
echo ========================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js to run this script.
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if the monitor script exists
if not exist "%~dp0deployment-monitor.js" (
    echo ERROR: deployment-monitor.js not found in the same directory.
    pause
    exit /b 1
)

REM Set default options
set MONITOR_OPTIONS=

REM Parse command line arguments
:parse_args
if "%1"=="" goto run_monitor
if "%1"=="--detailed" set MONITOR_OPTIONS=%MONITOR_OPTIONS% --detailed
if "%1"=="--help" goto show_help
if "%1"=="-h" goto show_help
if "%1" NEQ "" set MONITOR_OPTIONS=%MONITOR_OPTIONS% %1
shift
goto parse_args

:show_help
echo Usage: deployment-monitor.bat [options]
echo.
echo Options:
echo   --detailed      Show detailed job information for each run
echo   --history=N     Show last N runs (default: 5)
echo   --help, -h      Show this help message
echo.
echo Environment Variables:
echo   GITHUB_TOKEN    GitHub personal access token (recommended)
echo.
echo Examples:
echo   deployment-monitor.bat
echo   deployment-monitor.bat --detailed
echo   deployment-monitor.bat --history=10
echo   deployment-monitor.bat --detailed --history=10
echo.
pause
exit /b 0

:run_monitor
echo Running deployment monitor...
echo Options: %MONITOR_OPTIONS%
echo.

REM Run the monitor
node "%~dp0deployment-monitor.js" %MONITOR_OPTIONS%

if errorlevel 1 (
    echo.
    echo ERROR: Deployment monitor failed. Check the output above for details.
    pause
    exit /b 1
)

echo.
echo Monitor completed successfully!
pause
