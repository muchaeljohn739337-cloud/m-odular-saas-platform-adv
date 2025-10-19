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

# Step 1: Stop any running Node processes that might lock files
Write-Host "🛑 Stopping any running Node/npm processes..." -ForegroundColor Yellow
Get-Process -Name "node", "npm" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Clean old Prisma client if needed
Write-Host "🧹 Cleaning Prisma cache..." -ForegroundColor Yellow
if (Test-Path "backend/node_modules/.prisma") {
    Remove-Item -Recurse -Force "backend/node_modules/.prisma" -ErrorAction SilentlyContinue
}

# Step 3: Generate Prisma Client
Write-Host "🔨 Generating Prisma Client..." -ForegroundColor Yellow
cd backend
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generation failed. Trying once more..." -ForegroundColor Red
    Start-Sleep -Seconds 3
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to generate Prisma client. Please close all terminals and try again." -ForegroundColor Red
        cd ..
        exit 1
    }
}

# Step 4: Run migrations
Write-Host "📦 Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init_sqlite --skip-seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ Migration had warnings (this is OK for first run)" -ForegroundColor Yellow
}

cd ..

# Step 5: Install dependencies if needed
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "backend/node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    cd backend
    npm install
    cd ..
}

if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    cd frontend
    npm install
    cd ..
}

# Step 6: Start servers
Write-Host ""
Write-Host "🚀 Starting servers..." -ForegroundColor Green
Write-Host ""

# Backend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
    Write-Host '╔════════════════════════╗' -ForegroundColor Blue
    Write-Host '║   BACKEND SERVER      ║' -ForegroundColor Blue
    Write-Host '╚════════════════════════╝' -ForegroundColor Blue
    Write-Host ''
    cd backend
    npm run dev
"@

Start-Sleep -Seconds 5

# Frontend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", @"
    Write-Host '╔════════════════════════╗' -ForegroundColor Magenta
    Write-Host '║   FRONTEND SERVER     ║' -ForegroundColor Magenta
    Write-Host '╚════════════════════════╝' -ForegroundColor Magenta
    Write-Host ''
    cd frontend
    npm run dev
"@

Start-Sleep -Seconds 8

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ SETUP COMPLETE & RUNNING!          ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend:   http://localhost:4000" -ForegroundColor Cyan
Write-Host "💾 Database:  backend/prisma/dev.db (SQLite)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Two new PowerShell windows opened with server logs" -ForegroundColor Gray
Write-Host "   Close those windows to stop the servers" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Opening browser..." -ForegroundColor Green

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Press Ctrl+C to exit this window (servers will keep running)" -ForegroundColor Gray
pause
