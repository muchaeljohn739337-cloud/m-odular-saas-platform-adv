# ======================================
# ADVANCIA PAY LEDGER: FULL BUILD & RUN
# ======================================
# Usage (PowerShell):
#   Set-ExecutionPolicy Bypass -Scope Process -Force
#   ./RUN-FULL-BUILD.ps1

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Resolve repo root based on script location for portability
$root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
# If the script is at root, $PSScriptRoot is the root already
if ((Test-Path (Join-Path $root 'backend')) -and (Test-Path (Join-Path $root 'frontend'))) {
    # ok
} else {
    # If invoked from inside the root, PSScriptRoot may be root itself
    $root = (Get-Location).Path
}

$timestamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$logDir = Join-Path $root 'build_logs'
$logFile = Join-Path $logDir "build_$timestamp.log"

Write-Host "`n🚀 Starting Full Build Process for Advancia Pay Ledger..." -ForegroundColor Cyan
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }

function Invoke-Logged {
    param(
        [Parameter(Mandatory=$true)][scriptblock]$Script,
        [string]$Section
    )
    if ($Section) { Write-Host "`n== $Section ==" -ForegroundColor DarkCyan }
    & $Script 2>&1 | Tee-Object -FilePath $logFile -Append
}

function Is-Port-Listening {
    param(
        [int]$Port
    )
    try {
        $res = Test-NetConnection -ComputerName '127.0.0.1' -Port $Port -InformationLevel Quiet
        return [bool]$res
    } catch {
        # Fallback: check netstat
        $lines = netstat -ano | Select-String -Pattern ":$Port\s"
        return ($lines -ne $null)
    }
}

try {
    # ======================
    # BACKEND BUILD
    # ======================
    Write-Host "`n🧱 Building Backend..." -ForegroundColor Yellow
    $backendDir = Join-Path $root 'backend'
    if (!(Test-Path (Join-Path $backendDir 'package.json'))) { throw "Backend package.json not found at $backendDir" }

    Set-Location $backendDir
    if (Test-Path 'package-lock.json') {
        Invoke-Logged -Section 'Backend: npm ci' -Script { npm ci }
    } else {
        Invoke-Logged -Section 'Backend: npm install' -Script { npm install }
    }
    Invoke-Logged -Section 'Backend: npm run build' -Script { npm run -s build }
    Write-Host "✅ Backend built successfully!" -ForegroundColor Green

    # ======================
    # FRONTEND BUILD
    # ======================
    Write-Host "`n🎨 Building Frontend..." -ForegroundColor Yellow
    $frontendDir = Join-Path $root 'frontend'
    if (!(Test-Path (Join-Path $frontendDir 'package.json'))) { throw "Frontend package.json not found at $frontendDir" }

    Set-Location $frontendDir
    if (Test-Path 'package-lock.json') {
        Invoke-Logged -Section 'Frontend: npm ci' -Script { npm ci }
    } else {
        Invoke-Logged -Section 'Frontend: npm install' -Script { npm install }
    }
    Invoke-Logged -Section 'Frontend: npm run build' -Script { npm run -s build }
    Write-Host "✅ Frontend built successfully!" -ForegroundColor Green

    # ======================
    # HEALTH CHECK (optional)
    # ======================
    Write-Host "`n🩺 Checking Services (if running)..." -ForegroundColor Cyan
    try {
        $backendHealth = Invoke-RestMethod -Uri "http://localhost:4000/api/system/health" -TimeoutSec 8
        Write-Host "Backend Health:" -ForegroundColor Green
        $backendHealth | ConvertTo-Json -Depth 3 | Write-Host
    } catch { Write-Host "ℹ Backend not reachable on http://localhost:4000/api/system/health (expected if server not started)" -ForegroundColor DarkYellow }

    try {
        $frontendResp = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 6 -UseBasicParsing
        if ($frontendResp.StatusCode -eq 200) { Write-Host "✅ Frontend responding on http://localhost:3000" -ForegroundColor Green }
    } catch { Write-Host "ℹ Frontend not reachable on http://localhost:3000 (expected if server not started)" -ForegroundColor DarkYellow }

    # ======================
    # AUTO-START BOTH SERVERS (optional for local dev)
    # ======================
    Write-Host "`n▶ Starting Backend & Frontend dev servers (if not already running)..." -ForegroundColor Cyan

    if (-not (Is-Port-Listening -Port 4000)) {
        Start-Process "powershell" -ArgumentList "-NoExit", "cd '$backendDir'; npm run dev" | Out-Null
        Write-Host "   Backend → http://localhost:4000 (starting)" -ForegroundColor Green
    } else {
        Write-Host "   Backend already running on port 4000" -ForegroundColor DarkYellow
    }

    if (-not (Is-Port-Listening -Port 3000)) {
        Start-Process "powershell" -ArgumentList "-NoExit", "cd '$frontendDir'; npm run dev" | Out-Null
        Write-Host "   Frontend → http://localhost:3000 (starting)" -ForegroundColor Green
    } else {
        Write-Host "   Frontend already running on port 3000" -ForegroundColor DarkYellow
    }

} catch {
    Write-Host "❌ Build process failed: $($_.Exception.Message)" -ForegroundColor Red
    throw
} finally {
    Set-Location $root
    Write-Host "`n🧾 Logs saved to: $logFile" -ForegroundColor Magenta
    Write-Host "🎉 Completed at $timestamp" -ForegroundColor Cyan
}
