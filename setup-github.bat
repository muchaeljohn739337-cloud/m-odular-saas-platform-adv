@echo off
REM Quick Setup for GitHub CLI Authentication

echo.
echo ================================
echo   GitHub CLI Quick Setup
echo ================================
echo.

REM Check if gh is installed
where gh >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [X] GitHub CLI not found!
    echo.
    echo Installing GitHub CLI...
    winget install --id GitHub.cli --silent --accept-source-agreements --accept-package-agreements
    echo.
    echo [!] Please RESTART this terminal and run this script again.
    pause
    exit /b
)

echo [OK] GitHub CLI is installed
gh --version
echo.

REM Check authentication
echo Checking authentication status...
gh auth status >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Not authenticated with GitHub
    echo.
    echo Starting authentication process...
    echo.
    gh auth login
    echo.
    echo ================================
    echo   Setup Complete!
    echo ================================
    echo.
    echo You can now run: .\Manage-Secrets.ps1
    echo Choose option 3 to upload secrets
    echo.
) else (
    echo.
    echo [OK] Already authenticated!
    gh auth status
    echo.
    echo ================================
    echo   Ready to Upload Secrets!
    echo ================================
    echo.
    echo Run: .\Manage-Secrets.ps1
    echo Choose option 3 to upload secrets
    echo.
)

pause
