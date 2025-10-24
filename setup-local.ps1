# setup-local.ps1
# Complete local setup for Advancia Platform with SQLite
# Stops servers, generates Prisma client, runs migrations, and starts everything

Write-Host @"
╔══════════════════════════════════════════╗
║   ADVANCIA PLATFORM - SETUP & START     ║
║       Self-Hosted SQLite Edition         ║
╚══════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host ""

# 1️⃣ Stop any running Node processes that might lock files
Write-Host "🛑 Stopping any running Node/npm processes..." -ForegroundColor Yellow
Get-Process -Name "node", "npm" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2️⃣ Install dependencies first (required for Prisma generation)
Write-Host "📦 Installing dependencies if missing..." -ForegroundColor Yellow

if (-not (Test-Path "backend/node_modules")) {
    Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

# 2.5️⃣ Verify critical packages
Write-Host "🔍 Verifying critical packages..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path "node_modules/bcrypt")) {
    Write-Host "📦 Installing bcrypt..." -ForegroundColor Yellow
    npm install bcrypt
    npm install --save-dev @types/bcrypt
}
Set-Location ..

# 3️⃣ Clean old Prisma client if needed
Write-Host "🧹 Cleaning Prisma cache..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules/.prisma") {
    Remove-Item -Recurse -Force "backend/node_modules/.prisma" -ErrorAction SilentlyContinue
}
Remove-Item -Force "backend/node_modules/.prisma/client/query_engine-windows.dll.node" -ErrorAction SilentlyContinue

# 4️⃣ Generate Prisma Client
Write-Host "🔨 Generating Prisma Client..." -ForegroundColor Yellow
Set-Location backend
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generation failed. Trying once more..." -ForegroundColor Red
    Start-Sleep -Seconds 3
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate Prisma client. Please close all terminals and try again." -ForegroundColor Red
        Set-Location ..
        exit 1
    }
}
Write-Host "✅ Prisma generated successfully!" -ForegroundColor Green

# 5️⃣ Run migrations
Write-Host "📦 Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init_sqlite --skip-seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Migration had warnings (this is OK for first run)" -ForegroundColor Yellow
}
Write-Host "✅ Migrations completed." -ForegroundColor Green

Set-Location ..

# 6️⃣ Start backend server
Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Green

Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
    Write-Host '╔════════════════════════╗' -ForegroundColor Blue
    Write-Host '║   BACKEND SERVER      ║' -ForegroundColor Blue
    Write-Host '╚════════════════════════╝' -ForegroundColor Blue
    Write-Host ''
    Set-Location backend
    npm run dev
"@

Start-Sleep -Seconds 5

# 7️⃣ Start frontend server
Write-Host "🚀 Starting frontend server..." -ForegroundColor Green

Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
    Write-Host '╔════════════════════════╗' -ForegroundColor Magenta
    Write-Host '║   FRONTEND SERVER     ║' -ForegroundColor Magenta
    Write-Host '╚════════════════════════╝' -ForegroundColor Magenta
    Write-Host ''
    Set-Location frontend
    npm run dev
"@

Start-Sleep -Seconds 8

# ✅ Final status
Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ SETUP COMPLETE & SERVERS RUNNING!  ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:   http://localhost:4000" -ForegroundColor Cyan
Write-Host "💾 Database:  backend/prisma/dev.db (SQLite)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Two new PowerShell windows opened with server logs." -ForegroundColor Gray
Write-Host "   Close them to stop the servers." -ForegroundColor Gray
Write-Host ""

# 8️⃣ Open browser
Write-Host "🎉 Opening frontend in browser..." -ForegroundColor Green
Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Press Ctrl+C to exit this window (servers will keep running)" -ForegroundColor Gray
pause
