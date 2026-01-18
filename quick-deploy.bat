@echo off
REM AuraScribe Quick Deploy Script for Windows
REM This script deploys the latest changes from GitHub to your GCP VM

echo ===============================================
echo 🚀 AuraScribe Quick Deployment
echo ===============================================

REM Configuration
set REMOTE_HOST=34.19.193.244
set REMOTE_USER=aurascribe
set PROJECT_PATH=/opt/aurascribe

echo 📡 Deploying to %REMOTE_HOST%...
echo.

REM Check if ssh is available
where ssh >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ SSH not found. Please install OpenSSH or use WSL.
    echo.
    echo 💡 To install OpenSSH on Windows:
    echo    1. Settings ^> Apps ^> Optional Features
    echo    2. Add OpenSSH Client
    echo    3. Or use: winget install Microsoft.OpenSSH.Beta
    echo.
    pause
    exit /b 1
)

echo 📡 Testing SSH connection...
ssh -o ConnectTimeout=10 %REMOTE_USER%@%REMOTE_HOST% "echo SSH connection successful" 2>nul
if %errorlevel% neq 0 (
    echo ❌ SSH connection failed. Please ensure:
    echo    1. SSH key is properly configured
    echo    2. Remote user '%REMOTE_USER%' is correct  
    echo    3. VM is running and accessible
    echo.
    echo 💡 To set up SSH key authentication:
    echo    ssh-copy-id %REMOTE_USER%@%REMOTE_HOST%
    echo.
    pause
    exit /b 1
)

echo ✅ SSH connection successful
echo.

echo 🔄 Deploying latest changes...
ssh %REMOTE_USER%@%REMOTE_HOST% "cd %PROJECT_PATH% && git pull origin main && docker compose down && docker compose up --build -d && sleep 10 && docker compose ps"

if %errorlevel% equ 0 (
    echo.
    echo ==============================================
    echo 🎉 Deployment Complete!
    echo ==============================================
    echo.
    echo 🌐 Application URLs:
    echo    Frontend: https://app.aurascribe.ca
    echo    API: https://api.aurascribe.ca
    echo    Landing: https://www.aurascribe.ca
    echo.
    echo 📊 To check logs:
    echo    ssh %REMOTE_USER%@%REMOTE_HOST% "cd %PROJECT_PATH% && docker compose logs -f"
    echo.
) else (
    echo ❌ Deployment failed. Check the error messages above.
    echo.
)

pause