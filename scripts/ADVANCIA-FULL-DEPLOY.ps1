<<<<<<< HEAD
# ==============================================================
# ADVANCIA PAY LEDGER — FULL BUILD & START WITH NOTIFY
# ==============================================================
# Builds backend + frontend, starts both apps, sends success/failure notification.
# Usage:
#   pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/ADVANCIA-FULL-DEPLOY.ps1

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# --- Logging setup -----------------------------------------------------------
$root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
$logsDir = Join-Path $root 'scripts/logs'
if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Force -Path $logsDir | Out-Null }
$timestamp = [DateTime]::Now.ToString('yyyyMMdd-HHmmss')
$logFile = Join-Path $logsDir ("deploy-$timestamp.txt")
try { Start-Transcript -Path $logFile -Append | Out-Null } catch { }

Write-Host "`n🚀 Starting full Advancia build & deploy... (logging to $logFile)" -ForegroundColor Cyan

function Invoke-Npm {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Label
  )
  Push-Location $Path
  try {
    if (Test-Path 'package-lock.json') { npm ci } else { npm install }
    Write-Host "🧱 Building $Label..." -ForegroundColor Yellow
    npm run -s build
    Write-Host "✅ $Label build succeeded." -ForegroundColor Green
  } finally {
    Pop-Location
  }
}

function Test-Health {
  param(
    [Parameter(Mandatory=$true)][string]$Url,
    [Parameter(Mandatory=$true)][string]$Label
  )
  try {
    Write-Host "🔍 Checking $Label at $Url ..." -ForegroundColor Cyan
    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
    if ($resp.StatusCode -eq 200) {
      Write-Host "✅ $Label healthy" -ForegroundColor Green
      return $true
    } else {
      Write-Host "⚠ $Label responded with status $($resp.StatusCode)" -ForegroundColor Yellow
      return $false
    }
  } catch {
    Write-Host "❌ $Label health check failed: $($_.Exception.Message)" -ForegroundColor Red
    return $false
  }
}

try {
  $backend = Join-Path $root 'backend'
  $frontend = Join-Path $root 'frontend'
  $notifier = Join-Path $root 'notify-status.ps1'

  if (!(Test-Path $backend)) { throw "Backend folder not found at $backend" }
  if (!(Test-Path $frontend)) { throw "Frontend folder not found at $frontend" }
  if (!(Test-Path $notifier)) { Write-Host 'ℹ notify-status.ps1 not found; continuing without notifications.' -ForegroundColor DarkYellow }

  # Backend build (with retry)
  $backendOk = $false
  try { Invoke-Npm -Path $backend -Label 'Backend'; $backendOk = $true } catch { Write-Host "⚠ Backend build failed: $($_.Exception.Message)" -ForegroundColor Yellow }
  if (-not $backendOk) {
    Write-Host '🔁 Retrying backend build once...' -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    Invoke-Npm -Path $backend -Label 'Backend (Retry)'
  }

  # Frontend build
  Invoke-Npm -Path $frontend -Label 'Frontend'

  # Start both apps (production start)
  Write-Host "🚀 Starting backend and frontend servers..." -ForegroundColor Cyan
  Start-Job -ScriptBlock { Set-Location $using:backend; npm start } | Out-Null
  Start-Job -ScriptBlock { Set-Location $using:frontend; npm start } | Out-Null

  # Wait and health-check
  Write-Host "⏳ Waiting 15 seconds for servers to boot..." -ForegroundColor DarkCyan
  Start-Sleep -Seconds 15
  $backendOk = Test-Health -Url "http://localhost:4000/api/system/health" -Label "Backend API"
  $frontendOk = Test-Health -Url "http://localhost:3000" -Label "Frontend UI"

  if ($backendOk -and $frontendOk) {
    if (Test-Path $notifier) { & $notifier 'success' }
    Write-Host '🎉 All systems operational.' -ForegroundColor Green
  } else {
    throw "One or more services failed health check."
  }
}
catch {
  Write-Host "❌ Full deployment failed: $($_.Exception.Message)" -ForegroundColor Red
  $notifier = Join-Path $root 'notify-status.ps1'
  if (Test-Path $notifier) { & $notifier 'failed' }
  exit 1
}
finally {
  try { Stop-Transcript | Out-Null } catch { }
}
=======
Write-Host "🤖 Advancia Full RPA Deploy with Auto-Healing" -ForegroundColor Cyan# ==============================================================

$ErrorActionPreference = "Stop"# ADVANCIA PAY LEDGER — FULL BUILD & START WITH NOTIFY

# ==============================================================

function Load-Env($envPath) {# Builds backend + frontend, starts both apps, sends success/failure notification.

  if (Test-Path $envPath) {# Usage:

    Write-Host "🔑 Loading environment from $envPath..." -ForegroundColor Gray#   pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/ADVANCIA-FULL-DEPLOY.ps1

    Get-Content $envPath | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {

      $kv = $_.Split('=', 2)$ErrorActionPreference = 'Stop'

      [System.Environment]::SetEnvironmentVariable($kv[0].Trim(), $kv[1].Trim())$ProgressPreference = 'SilentlyContinue'

    }

    Write-Host "✅ Environment loaded" -ForegroundColor Green# --- Logging setup -----------------------------------------------------------

  } else {$root = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }

    Write-Host "⚠️ .env not found at $envPath - using system environment" -ForegroundColor Yellow$logsDir = Join-Path $root 'scripts/logs'

  }if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Force -Path $logsDir | Out-Null }

}$timestamp = [DateTime]::Now.ToString('yyyyMMdd-HHmmss')

$logFile = Join-Path $logsDir ("deploy-$timestamp.txt")

function Run-Build($dir, $name) {try { Start-Transcript -Path $logFile -Append | Out-Null } catch { }

  Write-Host "`n🧱 Building $name..." -ForegroundColor Cyan

  Push-Location $dirWrite-Host "`n🚀 Starting full Advancia build & deploy... (logging to $logFile)" -ForegroundColor Cyan

  try {

    npm run buildfunction Invoke-Npm {

    Write-Host "✅ $name build succeeded" -ForegroundColor Green  param(

    return $true    [Parameter(Mandatory=$true)][string]$Path,

  } catch {    [Parameter(Mandatory=$true)][string]$Label

    Write-Host "❌ $name build failed: $($_.Exception.Message)" -ForegroundColor Red  )

    return $false  Push-Location $Path

  } finally {  try {

    Pop-Location    if (Test-Path 'package-lock.json') { npm ci } else { npm install }

  }    Write-Host "🧱 Building $Label..." -ForegroundColor Yellow

}    npm run -s build

    Write-Host "✅ $Label build succeeded." -ForegroundColor Green

function Test-Health($url, $label) {  } finally {

  Write-Host "🔍 Testing $label..." -NoNewline    Pop-Location

  try {  }

    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10}

    if ($response.StatusCode -eq 200) {

      Write-Host " ✅ Healthy" -ForegroundColor Greenfunction Test-Health {

      return $true  param(

    } else {    [Parameter(Mandatory=$true)][string]$Url,

      Write-Host " ⚠️ Status $($response.StatusCode)" -ForegroundColor Yellow    [Parameter(Mandatory=$true)][string]$Label

      return $false  )

    }  try {

  } catch {    Write-Host "🔍 Checking $Label at $Url ..." -ForegroundColor Cyan

    Write-Host " ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10

    return $false    if ($resp.StatusCode -eq 200) {

  }      Write-Host "✅ $Label healthy" -ForegroundColor Green

}      return $true

    } else {

function Trigger-RenderDeploy {      Write-Host "⚠ $Label responded with status $($resp.StatusCode)" -ForegroundColor Yellow

  if (-not $env:RENDER_SERVICE_ID -or -not $env:RENDER_API_KEY) {      return $false

    Write-Host "⚠️ RENDER_SERVICE_ID or RENDER_API_KEY not set" -ForegroundColor Yellow    }

    return $null  } catch {

  }    Write-Host "❌ $Label health check failed: $($_.Exception.Message)" -ForegroundColor Red

      return $false

  Write-Host "`n🚀 Triggering Render deployment..." -ForegroundColor Cyan  }

  try {}

    $headers = @{

      "Authorization" = "Bearer $env:RENDER_API_KEY"try {

      "Content-Type" = "application/json"  $backend = Join-Path $root 'backend'

    }  $frontend = Join-Path $root 'frontend'

      $notifier = Join-Path $root 'notify-status.ps1'

    $payload = @{

      clearCache = $false  if (!(Test-Path $backend)) { throw "Backend folder not found at $backend" }

    } | ConvertTo-Json  if (!(Test-Path $frontend)) { throw "Frontend folder not found at $frontend" }

      if (!(Test-Path $notifier)) { Write-Host 'ℹ notify-status.ps1 not found; continuing without notifications.' -ForegroundColor DarkYellow }

    $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$env:RENDER_SERVICE_ID/deploys" `

      -Method Post `  # Backend build (with retry)

      -Headers $headers `  $backendOk = $false

      -Body $payload  try { Invoke-Npm -Path $backend -Label 'Backend'; $backendOk = $true } catch { Write-Host "⚠ Backend build failed: $($_.Exception.Message)" -ForegroundColor Yellow }

      if (-not $backendOk) {

    if ($response.id) {    Write-Host '🔁 Retrying backend build once...' -ForegroundColor Yellow

      Write-Host "✅ Deploy triggered - ID: $($response.id)" -ForegroundColor Green    Start-Sleep -Seconds 5

      return $response.id    Invoke-Npm -Path $backend -Label 'Backend (Retry)'

    } else {  }

      throw "No deploy ID returned"

    }  # Frontend build

  } catch {  Invoke-Npm -Path $frontend -Label 'Frontend'

    Write-Host "❌ Render deploy failed: $($_.Exception.Message)" -ForegroundColor Red

    return $null  # Start both apps (production start)

  }  Write-Host "🚀 Starting backend and frontend servers..." -ForegroundColor Cyan

}  Start-Job -ScriptBlock { Set-Location $using:backend; npm start } | Out-Null

  Start-Job -ScriptBlock { Set-Location $using:frontend; npm start } | Out-Null

function Monitor-RenderDeploy($deployId) {

  if (-not $deployId) {  # Wait and health-check

    Write-Host "⚠️ No deploy ID to monitor" -ForegroundColor Yellow  Write-Host "⏳ Waiting 15 seconds for servers to boot..." -ForegroundColor DarkCyan

    return $false  Start-Sleep -Seconds 15

  }  $backendOk = Test-Health -Url "http://localhost:4000/api/system/health" -Label "Backend API"

    $frontendOk = Test-Health -Url "http://localhost:3000" -Label "Frontend UI"

  Write-Host "`n⏳ Monitoring deployment..." -ForegroundColor Cyan

  $maxAttempts = 30  if ($backendOk -and $frontendOk) {

      if (Test-Path $notifier) { & $notifier 'success' }

  for ($i = 1; $i -le $maxAttempts; $i++) {    Write-Host '🎉 All systems operational.' -ForegroundColor Green

    Start-Sleep -Seconds 10  } else {

        throw "One or more services failed health check."

    try {  }

      $headers = @{ "Authorization" = "Bearer $env:RENDER_API_KEY" }}

      $response = Invoke-RestMethod -Uri "https://api.render.com/v1/services/$env:RENDER_SERVICE_ID/deploys/$deployId" `catch {

        -Headers $headers  Write-Host "❌ Full deployment failed: $($_.Exception.Message)" -ForegroundColor Red

        $notifier = Join-Path $root 'notify-status.ps1'

      $status = $response.status  if (Test-Path $notifier) { & $notifier 'failed' }

      Write-Host "   [$i/$maxAttempts] Status: $status" -ForegroundColor Gray  exit 1

      }

      if ($status -eq "live") {finally {

        Write-Host "🎉 Deployment succeeded!" -ForegroundColor Green  try { Stop-Transcript | Out-Null } catch { }

        return $true}

      } elseif ($status -eq "failed") {
        Write-Host "❌ Deployment failed" -ForegroundColor Red
        return $false
      }
    } catch {
      Write-Host "   ⚠️ Error checking status: $($_.Exception.Message)" -ForegroundColor Yellow
    }
  }
  
  Write-Host "⏱️ Monitoring timeout - deploy may still be in progress" -ForegroundColor Yellow
  return $false
}

function Rollback-Commit {
  Write-Host "`n⚠️ Initiating rollback..." -ForegroundColor Yellow
  try {
    git revert HEAD --no-edit
    git push origin main
    Write-Host "✅ Rollback committed and pushed" -ForegroundColor Green
    
    # Notify
    & "$PSScriptRoot\send-notification.ps1" `
      -Subject "Deployment Rollback Applied" `
      -Body "The last commit was reverted due to deployment failure. Previous stable version has been restored." `
      -Type "Warning"
  } catch {
    Write-Host "❌ Rollback failed: $($_.Exception.Message)" -ForegroundColor Red
  }
}

# ============ MAIN WORKFLOW ============

Write-Host @"

╔═══════════════════════════════════════════╗
║   Advancia Pay Ledger - Full Deploy RPA  ║
║   Automated Build → Test → Deploy        ║
╚═══════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$startTime = Get-Date

# Step 1: Load environment
Load-Env "$PSScriptRoot\..\backend\.env"

# Step 2: Run RPA fix agent
Write-Host "`n🤖 Running pre-flight checks..." -ForegroundColor Cyan
& "$PSScriptRoot\rpa-fix-agent.ps1"

# Step 3: Build projects
$backendBuildOK = Run-Build "$PSScriptRoot\..\backend" "Backend"
$frontendBuildOK = Run-Build "$PSScriptRoot\..\frontend" "Frontend"

if (-not $backendBuildOK -or -not $frontendBuildOK) {
  Write-Host "`n❌ Build failed - deployment aborted" -ForegroundColor Red
  & "$PSScriptRoot\send-notification.ps1" `
    -Subject "Build Failed" `
    -Body "Local build check failed. Deployment was not triggered." `
    -Type "Error"
  exit 1
}

# Step 4: Trigger Render deployment
$deployId = Trigger-RenderDeploy

if ($deployId) {
  $deploySuccess = Monitor-RenderDeploy $deployId
  
  if ($deploySuccess) {
    # Step 5: Production health check
    Write-Host "`n🏥 Verifying production health..." -ForegroundColor Cyan
    Start-Sleep -Seconds 30
    
    $prodHealthy = Test-Health "https://api.advanciapayledger.com/api/health" "Production Backend"
    
    if ($prodHealthy) {
      $duration = (Get-Date) - $startTime
      Write-Host "`n🎉 DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
      Write-Host "   Duration: $([math]::Round($duration.TotalMinutes, 1)) minutes" -ForegroundColor Gray
      
      & "$PSScriptRoot\send-notification.ps1" `
        -Subject "Deployment Successful" `
        -Body "Advancia Pay Ledger deployed successfully.`n`nBackend: https://api.advanciapayledger.com`nFrontend: https://advanciapayledger.com`n`nDuration: $([math]::Round($duration.TotalMinutes, 1)) minutes" `
        -Type "Success"
      
      exit 0
    } else {
      Write-Host "`n❌ Production health check failed" -ForegroundColor Red
      if ($env:AUTO_ROLLBACK -eq "true") {
        Rollback-Commit
      }
      exit 1
    }
  } else {
    Write-Host "`n❌ Deployment did not complete successfully" -ForegroundColor Red
    if ($env:AUTO_ROLLBACK -eq "true") {
      Rollback-Commit
    }
    exit 1
  }
} else {
  Write-Host "`n⚠️ Could not trigger Render deployment - check configuration" -ForegroundColor Yellow
  Write-Host "💡 Build succeeded locally. You can deploy manually on Render dashboard." -ForegroundColor Cyan
  exit 0
}
>>>>>>> ci/fix-postgres-init-and-prisma
