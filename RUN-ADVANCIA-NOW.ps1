# ===============================================
# ADVANCIA PAY LEDGER — ONE TIME STARTUP SCRIPT
# ===============================================
# Purpose: Install deps, validate env, ensure Prisma client, apply DB migrations,
#          then launch backend and frontend dev servers on Windows (PowerShell).
# Usage:
#   Open PowerShell as Administrator (recommended for first run)
#   Set-ExecutionPolicy Bypass -Scope Process -Force
#   ./RUN-ADVANCIA-NOW.ps1

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Resolve repo root based on script location for portability
$root = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$envFile = Join-Path $backend '.env'

Write-Host "`n🚀 Launching Advancia Pay Ledger (Backend + Frontend)" -ForegroundColor Cyan

function Invoke-Logged {
  param(
    [Parameter(Mandatory=$true)][string]$Title,
    [Parameter(Mandatory=$true)][scriptblock]$Script
  )
  Write-Host "`n== $Title ==" -ForegroundColor DarkCyan
  & $Script
}

# --- ENV SETUP (No SQLite fallback: schema provider is postgresql) ---
Invoke-Logged -Title 'Environment check' -Script {
  if (!(Test-Path $envFile)) {
    Write-Host '⚠ .env not found — creating a template (edit with your real values)' -ForegroundColor Yellow
    @"
# Required: PostgreSQL connection string for Prisma
# Example for local Postgres:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/advancia?schema=public"
DATABASE_URL=

# App config
JWT_SECRET="dev_secret_key_change_me"
PORT=4000
"@ | Out-File -Encoding utf8 $envFile
  }

  $envContent = Get-Content $envFile -Raw
  $dbLine = ($envContent -split "`n") | Where-Object { $_ -match '^DATABASE_URL' }
  if (-not $dbLine -or $dbLine -match '^DATABASE_URL\s*=\s*$') {
    Write-Host '❌ DATABASE_URL is not set. Please edit backend/.env and set a valid PostgreSQL URL.' -ForegroundColor Red
    Write-Host '   Tip: postgresql://USER:PASS@HOST:5432/DBNAME?schema=public' -ForegroundColor DarkYellow
    throw 'DATABASE_URL missing'
  }
}

# --- BACKEND SETUP ---
Invoke-Logged -Title 'Backend: install & generate' -Script {
  if (!(Test-Path (Join-Path $backend 'package.json'))) { throw "Backend package.json missing at $backend" }
  Set-Location $backend
  if (Test-Path 'package-lock.json') { npm ci } else { npm install }
  npx prisma generate
}

# Try DB connectivity (Postgres only)
Invoke-Logged -Title 'Backend: database connectivity test' -Script {
  try {
    # Only run the test if the DATABASE_URL looks like postgres
    $envVars = Get-Content $envFile | Where-Object { $_ -match '^DATABASE_URL' }
    if ($envVars -match 'postgres') {
      Write-Host '🧠 Testing PostgreSQL connection via test-db-connection.js...' -ForegroundColor Cyan
      node test-db-connection.js
    } else {
      Write-Host 'ℹ DATABASE_URL is not PostgreSQL; skipping connectivity test.' -ForegroundColor DarkYellow
    }
  } catch {
    Write-Host "❌ Database connection failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host '   - Ensure your DATABASE_URL is reachable and credentials are correct.' -ForegroundColor DarkYellow
    Write-Host '   - If using local Postgres, verify service is running and DB exists.' -ForegroundColor DarkYellow
    throw
  }
}

# Apply migrations
Invoke-Logged -Title 'Backend: apply migrations (prisma migrate deploy)' -Script {
  npx prisma migrate deploy
}

# Build types (optional but fast; ensures TypeScript OK)
Invoke-Logged -Title 'Backend: type build' -Script {
  npm run -s build
}

# Start backend dev server if port 4000 is free
function Test-PortListening {
  param([int]$Port)
  try {
    return [bool](Test-NetConnection -ComputerName '127.0.0.1' -Port $Port -InformationLevel Quiet)
  } catch { return $false }
}
Invoke-Logged -Title 'Backend: start dev server' -Script {
  if (-not (Test-PortListening -Port 4000)) {
    Start-Process 'powershell' -ArgumentList '-NoExit', "cd '$backend'; npm run dev" | Out-Null
    Write-Host '✅ Backend starting on http://localhost:4000' -ForegroundColor Green
  } else {
    Write-Host 'ℹ Backend already running on port 4000' -ForegroundColor DarkYellow
  }
}

# --- FRONTEND SETUP ---
Invoke-Logged -Title 'Frontend: install' -Script {
  if (!(Test-Path (Join-Path $frontend 'package.json'))) { throw "Frontend package.json missing at $frontend" }
  Set-Location $frontend
  if (Test-Path 'package-lock.json') { npm ci } else { npm install }
}

# Build once to validate
Invoke-Logged -Title 'Frontend: build' -Script {
  npm run -s build
}

# Start frontend dev server if port 3000 is free
Invoke-Logged -Title 'Frontend: start dev server' -Script {
  if (-not (Test-PortListening -Port 3000)) {
    Start-Process 'powershell' -ArgumentList '-NoExit', "cd '$frontend'; npm run dev" | Out-Null
    Write-Host '✅ Frontend starting on http://localhost:3000' -ForegroundColor Green
  } else {
    Write-Host 'ℹ Frontend already running on port 3000' -ForegroundColor DarkYellow
  }
}

# Final messages
Write-Host "`n💾 Both servers launching — check in your browser:" -ForegroundColor Cyan
Write-Host 'Frontend → http://localhost:3000' -ForegroundColor Green
Write-Host 'Backend  → http://localhost:4000' -ForegroundColor Green

# Health checks (non-blocking)
try {
  $health = Invoke-RestMethod -Uri 'http://localhost:4000/api/system/health' -TimeoutSec 8
  Write-Host "Backend Health: $(($health | ConvertTo-Json -Depth 2))" -ForegroundColor Green
} catch { Write-Host 'ℹ Backend health not reachable yet (dev server booting?)' -ForegroundColor DarkYellow }

try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 8 -UseBasicParsing
  if ($resp.StatusCode -eq 200) { Write-Host '✅ Frontend responded' -ForegroundColor Green }
} catch { Write-Host 'ℹ Frontend not reachable yet (dev server booting?)' -ForegroundColor DarkYellow }
