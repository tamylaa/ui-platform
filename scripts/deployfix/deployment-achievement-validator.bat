@echo off
echo 🎯 Running Deployment Achievement Validation...
echo =============================================

node deployment-achievement-validator.js

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Achievement validation completed successfully!
    echo 📊 Check deployment-achievement-report.json for detailed results
) else (
    echo.
    echo ❌ Achievement validation failed!
    exit /b 1
)

pause
