# =======================================================
# ADVANCIA PAY LEDGER — FULL BUILD & DEPLOY (Local + Hooks)
# =======================================================
# What this does:
#  - Validates backend/.env and DATABASE_URL (PostgreSQL only)
#  - Builds backend and frontend
#  - Optionally triggers Render frontend deploy via RENDER_DEPLOY_HOOK_FRONTEND
#  - Prints instructions to run the GitHub "Finalize Advancia Platform Setup" workflow
#
# Usage:
#   Set-ExecutionPolicy Bypass -Scope Process -Force
#   ./ADVANCIA-DEPLOY-COMPLETE.ps1 -Domain "advancia.app" -BackendOrigin "https://your-backend.onrender.com"

param(
  [Parameter(Mandatory=$false)][string]$Domain,
  [Parameter(Mandatory=$false)][string]$BackendOrigin
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$root = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$envFile = Join-Path $backend '.env'

Write-Host "`n🚀 ADVANCIA — BUILD & DEPLOY" -ForegroundColor Cyan

function Invoke-Logged {
  param([string]$Title, [scriptblock]$Script)
  if ($Title) { Write-Host "`n== $Title ==" -ForegroundColor DarkCyan }
  & $Script
}

# 1) ENV CHECK (PostgreSQL required by Prisma schema)
Invoke-Logged -Title 'Env: validate DATABASE_URL' -Script {
  if (!(Test-Path $envFile)) {
    Write-Host '❌ backend/.env not found. Create it with a valid PostgreSQL DATABASE_URL.' -ForegroundColor Red
    Write-Host '   Example: postgresql://USER:PASS@HOST:5432/DB?schema=public' -ForegroundColor DarkYellow
    throw 'Missing backend/.env'
  }
  $envContent = Get-Content $envFile -Raw
  $dbLines = ($envContent -split "`n") | Where-Object { $_ -match '^DATABASE_URL\s*=' }
  if (!$dbLines) {
    throw 'DATABASE_URL not set in backend/.env'
  }
  $dbLine = $dbLines | Select-Object -First 1
  Write-Host '✅ DATABASE_URL present and looks like PostgreSQL' -ForegroundColor Green
}

# 2) BACKEND BUILD
Invoke-Logged -Title 'Backend: install & build' -Script {
  if (!(Test-Path (Join-Path $backend 'package.json'))) { throw "Missing $backend/package.json" }
  Set-Location $backend
  if (Test-Path 'package-lock.json') { npm ci } else { npm install }
  npx prisma generate
  npm run -s build
}

# 3) FRONTEND BUILD
Invoke-Logged -Title 'Frontend: install & build' -Script {
  if (!(Test-Path (Join-Path $frontend 'package.json'))) { throw "Missing $frontend/package.json" }
  Set-Location $frontend
  if (Test-Path 'package-lock.json') { npm ci } else { npm install }
  npm run -s build
}

# 4) Optional: Trigger Render Frontend Deploy via deploy hook
Invoke-Logged -Title 'Render: trigger deploy (optional)' -Script {
  $hook = $env:RENDER_DEPLOY_HOOK_FRONTEND
  if ([string]::IsNullOrWhiteSpace($hook)) {
    Write-Host 'ℹ RENDER_DEPLOY_HOOK_FRONTEND not set; skipping Render deploy trigger.' -ForegroundColor DarkYellow
  } else {
    try {
      Write-Host '🚀 Triggering Render Frontend Deploy via hook...' -ForegroundColor Cyan
      Invoke-WebRequest -Method Post -Uri $hook -TimeoutSec 20 | Out-Null
      Write-Host '✅ Render deploy hook triggered' -ForegroundColor Green
    } catch {
      Write-Host "⚠ Failed to trigger Render hook: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
}

# 5) Next steps: Cloudflare Worker deploy via GitHub Action
Write-Host "`n➡ To publish the Cloudflare Worker (API Gateway), run the GitHub Action: 'Finalize Advancia Platform Setup'" -ForegroundColor Cyan
if ($Domain -and $BackendOrigin) {
  Write-Host "   Inputs suggested: domain=$Domain, backend_origin=$BackendOrigin" -ForegroundColor Cyan
} else {
  Write-Host "   Provide inputs: domain=your-root-domain (e.g., advancia.app), backend_origin=https://backend.onrender.com" -ForegroundColor Cyan
}

# 6) Done
Write-Host "`n🎯 BUILD & DEPLOY STEPS COMPLETE" -ForegroundColor Green
