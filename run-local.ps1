# run-local.ps1
# Starts backend and frontend in separate PowerShell windows for local development
# Usage: .\run-local.ps1

param(
    [string]$BackendCmd = "npm run dev",
    [string]$FrontendCmd = "npm run dev"
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "Starting backend and frontend..." -ForegroundColor Cyan

# Start backend
$backendDir = Join-Path $root "backend"
if (Test-Path $backendDir) {
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; Write-Host '--- Backend log ---'; $env:NODE_ENV='development'; $BackendCmd" -WindowStyle Normal
    Write-Host "Backend started in new window (cwd: $backendDir)" -ForegroundColor Green
} else {
    Write-Host "Backend folder not found at $backendDir" -ForegroundColor Red
}

# Start frontend
$frontendDir = Join-Path $root "frontend"
if (Test-Path $frontendDir) {
    Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; Write-Host '--- Frontend log ---'; $env:NEXT_PUBLIC_API_URL='http://localhost:4000'; $FrontendCmd" -WindowStyle Normal
    Write-Host "Frontend started in new window (cwd: $frontendDir)" -ForegroundColor Green
} else {
    Write-Host "Frontend folder not found at $frontendDir" -ForegroundColor Red
}

Write-Host "If either process failed to start, open the respective folder and run the command manually." -ForegroundColor Yellow
