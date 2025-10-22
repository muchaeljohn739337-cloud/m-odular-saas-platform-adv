# Monitor Cloudflare Workers Logs
# Run this to see real-time logs from your deployed Worker

Write-Host "`n📊 Cloudflare Workers Log Monitor" -ForegroundColor Cyan
Write-Host "=================================`n" -ForegroundColor Cyan

$frontendPath = "c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\frontend"

Write-Host "Starting real-time log tail for: advanciafrontend" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop`n" -ForegroundColor Gray

Set-Location $frontendPath

# Tail logs in real-time
npx wrangler tail

# If the above fails, try:
# npx wrangler tail advanciafrontend
