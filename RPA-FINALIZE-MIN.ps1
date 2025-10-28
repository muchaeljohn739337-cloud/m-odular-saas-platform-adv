Write-Host "🚀 Starting Advancia PayLedger Finalization (Minimal)" -ForegroundColor Cyan

# === FRONTEND ===
Set-Location "C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\frontend"
Write-Host "🧹 Cleaning old installs..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules, .next, package-lock.json -ErrorAction SilentlyContinue

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Ensure build/start scripts exist
$content = Get-Content 'package.json' -Raw | ConvertFrom-Json
if (-not $content.scripts.build) { $content.scripts.build = "next build" }
if (-not $content.scripts.start) { $content.scripts.start = "next start -p 3000" }
$content | ConvertTo-Json -Depth 10 | Set-Content 'package.json' -Encoding UTF8
Write-Host "✅ Verified frontend scripts."

Write-Host "⚙ Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build succeeded — launching on port 3000"
    Start-Job { npm run start } | Out-Null
} else {
    Write-Host "❌ Build failed — showing first 50 error lines:" -ForegroundColor Red
    npm run build 2>&1 | Select-String "error" -Context 2 | Select-Object -First 50
}

# === BACKEND ===
Set-Location "C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend"
Write-Host "🧠 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "⚙ Building backend..." -ForegroundColor Yellow
npm install
npx tsc --noEmit

try {
    $res = Invoke-WebRequest http://localhost:4000/health -UseBasicParsing
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Backend is live!" -ForegroundColor Green
    } else {
        Write-Host "⚠ Backend health check failed." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Backend server not detected (you may need to run npm start manually)." -ForegroundColor Yellow
}

# === AUTO PUSH & DEPLOY ===
Set-Location "C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform"
Write-Host "🌐 Committing and pushing updates to GitHub..." -ForegroundColor Yellow
git add .
git commit -m "auto: finalize frontend & backend"
git push origin main

Write-Host "🎯 Render or GitHub Actions will now automatically deploy your updated system." -ForegroundColor Green
Write-Host "✅ Finished all necessary setup."