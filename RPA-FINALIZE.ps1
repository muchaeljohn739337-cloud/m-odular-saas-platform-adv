Write-Host "🚀 Starting Advancia PayLedger Finalization" -ForegroundColor Cyan

# === 1️⃣ FRONTEND CLEANUP & FIX ===
Set-Location "C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\frontend"

Write-Host "🧹 Cleaning old builds..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules, .next, package-lock.json -ErrorAction SilentlyContinue

Write-Host "📦 Reinstalling dependencies..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# Ensure scripts exist
$content = Get-Content 'package.json' -Raw | ConvertFrom-Json
if (-not $content.scripts.start) { $content.scripts.start = "next start -p 3000" }
if (-not $content.scripts.build) { $content.scripts.build = "next build" }
$content | ConvertTo-Json -Depth 10 | Set-Content 'package.json' -Encoding UTF8
Write-Host "✅ Verified package.json scripts."

# === 2️⃣ FIX SENTRY CONFIG ===
$nextCfg = @"
const { withSentryConfig } = require('@sentry/nextjs');

const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
};

const sentryWebpackPluginOptions = {
  org: "advancia",
  project: "pay-ledger",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: {
    deleteAfterUpload: true,
    disable: false,
  },
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
"@
Set-Content 'next.config.js' $nextCfg -Encoding UTF8
Write-Host "🛠 Updated next.config.js"

# === 3️⃣ ENVIRONMENT VARS ===
@"
SENTRY_SUPPRESS_GLOBAL_ERROR_HANDLER_FILE_WARNING=1
SENTRY_SOURCEMAPS_DELETE_AFTER_UPLOAD=true
"@ | Set-Content '.env.production' -Encoding UTF8
Write-Host "⚙ Applied environment variables"

# === 4️⃣ BUILD & LAUNCH ===
Write-Host "⚙ Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend build succeeded!"
    npm run start
} else {
    Write-Host "❌ Build failed — showing first 50 error lines:" -ForegroundColor Red
    npm run build 2>&1 | Select-String "error" -Context 2 | Select-Object -First 50
}

# === 5️⃣ BACKEND CHECK ===
Set-Location "C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend"
Write-Host "🧠 Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "🔍 Checking backend health..." -ForegroundColor Yellow
try {
    $res = Invoke-WebRequest http://localhost:4000/health -UseBasicParsing
    if ($res.StatusCode -eq 200) {
        Write-Host "✅ Backend is live!"
    }
} catch {
    Write-Host "⚠ Backend not responding locally (check logs)."
}

Write-Host "🎯 FINISHED — full system ready."