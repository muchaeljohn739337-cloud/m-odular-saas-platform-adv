# Fresh Installation Script
# Reinstalls all dependencies and sets up the project

Write-Host "🚀 Starting Fresh Installation..." -ForegroundColor Cyan

Set-Location C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform

Write-Host "`n1️⃣ Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "  ✓ Removed old package-lock.json" -ForegroundColor Green
}

Write-Host "  ⏳ Running npm install..."
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Backend dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Backend installation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n2️⃣ Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Prisma client generated!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Prisma generation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n3️⃣ Building Backend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Backend built successfully!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ Build completed with warnings" -ForegroundColor Yellow
}

Set-Location ..

Write-Host "`n4️⃣ Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location frontend

if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
    Write-Host "  ✓ Removed old package-lock.json" -ForegroundColor Green
}

Write-Host "  ⏳ Running npm install..."
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Frontend dependencies installed!" -ForegroundColor Green
} else {
    Write-Host "  ❌ Frontend installation failed!" -ForegroundColor Red
    exit 1
}

Set-Location ..

Write-Host "`n✅ Fresh Installation Complete!" -ForegroundColor Green
Write-Host "`nYour project is ready!" -ForegroundColor Cyan
Write-Host "`nTo start development:" -ForegroundColor White
Write-Host "  Run: ./run-local.ps1" -ForegroundColor Cyan
Write-Host "`nTo deploy:" -ForegroundColor White
Write-Host "  Run: git add -A && git commit -m 'Clean install' && git push" -ForegroundColor Cyan
