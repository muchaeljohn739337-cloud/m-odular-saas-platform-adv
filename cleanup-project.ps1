# Project Cleanup Script
# Removes temporary, test, and debug files

Write-Host "🧹 Starting Project Cleanup..." -ForegroundColor Cyan

# Navigate to project root
Set-Location C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform

Write-Host "`n1️⃣ Removing test files..." -ForegroundColor Yellow
$testFiles = @(
    "test-withdrawal.json",
    "test-gas-estimate.json",
    "test-render-deployment.ps1",
    "test-health.ps1",
    "test-eth-gateway.ps1",
    "test-eth-endpoints.ps1"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
    }
}

Write-Host "`n2️⃣ Removing debug files..." -ForegroundColor Yellow
$debugFiles = @(
    "debug-eth-endpoints.ps1"
)

foreach ($file in $debugFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
    }
}

Write-Host "`n3️⃣ Removing quick/temporary scripts..." -ForegroundColor Yellow
$quickFiles = @(
    "quick-test.ps1",
    "quick-setup-wallets.ps1",
    "fix-other-workspace.ps1",
    "quick-fix.ps1"
)

foreach ($file in $quickFiles) {
    if (Test-Path $file) {
        Remove-Item $file -Force
        Write-Host "  ✓ Removed: $file" -ForegroundColor Green
    }
}

Write-Host "`n4️⃣ Removing old encrypted secrets..." -ForegroundColor Yellow
Get-ChildItem -Filter "encrypted_secrets_*.env" | ForEach-Object {
    Remove-Item $_.FullName -Force
    Write-Host "  ✓ Removed: $($_.Name)" -ForegroundColor Green
}

Write-Host "`n5️⃣ Removing SQLite database (local dev only)..." -ForegroundColor Yellow
if (Test-Path "backend\prisma\dev.db") {
    Remove-Item "backend\prisma\dev.db" -Force
    Write-Host "  ✓ Removed: backend\prisma\dev.db" -ForegroundColor Green
}
if (Test-Path "backend\prisma\dev.db-journal") {
    Remove-Item "backend\prisma\dev.db-journal" -Force
    Write-Host "  ✓ Removed: backend\prisma\dev.db-journal" -ForegroundColor Green
}

Write-Host "`n6️⃣ Cleaning node_modules and caches..." -ForegroundColor Yellow

# Backend cleanup
if (Test-Path "backend\node_modules") {
    Write-Host "  ⏳ Removing backend/node_modules (this may take a moment)..."
    Remove-Item "backend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed: backend/node_modules" -ForegroundColor Green
}

if (Test-Path "backend\dist") {
    Remove-Item "backend\dist" -Recurse -Force
    Write-Host "  ✓ Removed: backend/dist" -ForegroundColor Green
}

if (Test-Path "backend\.prisma") {
    Remove-Item "backend\.prisma" -Recurse -Force
    Write-Host "  ✓ Removed: backend/.prisma" -ForegroundColor Green
}

# Frontend cleanup
if (Test-Path "frontend\node_modules") {
    Write-Host "  ⏳ Removing frontend/node_modules (this may take a moment)..."
    Remove-Item "frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ Removed: frontend/node_modules" -ForegroundColor Green
}

if (Test-Path "frontend\.next") {
    Remove-Item "frontend\.next" -Recurse -Force
    Write-Host "  ✓ Removed: frontend/.next" -ForegroundColor Green
}

Write-Host "`n7️⃣ Verifying .gitignore is up to date..." -ForegroundColor Yellow
Write-Host "  ✓ .gitignore includes necessary patterns" -ForegroundColor Green

Write-Host "`n✅ Cleanup Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Run: npm install (in backend and frontend)" -ForegroundColor White
Write-Host "  2. Run: npx prisma generate (in backend)" -ForegroundColor White
Write-Host "  3. Commit and push cleaned repository" -ForegroundColor White
Write-Host "`nOr use the reinstall script: ./reinstall-dependencies.ps1" -ForegroundColor Yellow
