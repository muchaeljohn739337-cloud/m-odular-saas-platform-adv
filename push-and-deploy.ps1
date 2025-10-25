# Push and Deploy to Cloudflare
# Run this after adding GitHub secrets

Write-Host "`n🚀 Pushing to GitHub and Triggering Cloudflare Deployment" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# Ensure we're in the right directory
$rootPath = "c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform"
if ((Get-Location).Path -ne $rootPath) {
    Set-Location $rootPath
}

# Check if GitHub secrets are added
Write-Host "⚠️  IMPORTANT: Before pushing, ensure you've added these GitHub secrets:" -ForegroundColor Yellow
Write-Host "   Go to: https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions`n" -ForegroundColor Gray
Write-Host "   1. CLOUDFLARE_API_TOKEN = [your Workers Builds token]" -ForegroundColor Gray
Write-Host "   2. CLOUDFLARE_ACCOUNT_ID = 74ecde4d46d4b399c7295cf599d2886b" -ForegroundColor Gray
Write-Host "   3. CLOUDFLARE_ZONE_ID = 0bff66558872c58ed5b8b7942acc34d9`n" -ForegroundColor Gray

Write-Host "Have you added all 3 GitHub secrets? (Y/N): " -ForegroundColor Yellow -NoNewline
$secretsAdded = Read-Host

if ($secretsAdded -ne "Y" -and $secretsAdded -ne "y") {
    Write-Host "`n❌ Please add the secrets first, then run this script again." -ForegroundColor Red
    Write-Host "`nInstructions: See CLOUDFLARE_API_TOKEN_SETUP.md" -ForegroundColor Yellow
    exit 0
}

# Check current branch and status
Write-Host "`n[1/4] Checking git status..." -ForegroundColor Yellow
$branch = git rev-parse --abbrev-ref HEAD
$status = git status --porcelain

Write-Host "✅ Current branch: $branch" -ForegroundColor Green

if ($status) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    git status --short
    Write-Host "`nCommit these changes? (Y/N): " -ForegroundColor Yellow -NoNewline
    $commit = Read-Host
    
    if ($commit -eq "Y" -or $commit -eq "y") {
        git add .
        git commit -m "Update Cloudflare deployment configuration"
        Write-Host "✅ Changes committed" -ForegroundColor Green
    }
}

# Show what will be pushed
Write-Host "`n[2/4] Commits to push:" -ForegroundColor Yellow
git log origin/$branch..$branch --oneline

# Confirm push
Write-Host "`n[3/4] Ready to push to GitHub?" -ForegroundColor Yellow
Write-Host "This will trigger the Cloudflare Workers deployment workflow." -ForegroundColor Gray
Write-Host "`nPush now? (Y/N): " -ForegroundColor Yellow -NoNewline
$push = Read-Host

if ($push -ne "Y" -and $push -ne "y") {
    Write-Host "`n❌ Push cancelled. To push later, run:" -ForegroundColor Yellow
    Write-Host "   git push origin main" -ForegroundColor Gray
    exit 0
}

# Push to GitHub
Write-Host "`n[4/4] Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
    
    Write-Host "`n📊 Deployment Status:" -ForegroundColor Cyan
    Write-Host "   GitHub Actions: https://github.com/pdtribe181-prog/-modular-saas-platform/actions" -ForegroundColor White
    Write-Host "   Cloudflare Dashboard: https://dash.cloudflare.com/74ecde4d46d4b399c7295cf599d2886b/workers/overview" -ForegroundColor White
    
    Write-Host "`n⏱️  Expected deployment time: 2-5 minutes" -ForegroundColor Yellow
    
    Write-Host "`n🌐 After deployment completes, your site will be live at:" -ForegroundColor Cyan
    Write-Host "   https://advanciafrontend.pdtribe181.workers.dev" -ForegroundColor White
    
    Write-Host "`n🧪 To test the deployment:" -ForegroundColor Yellow
    Write-Host "   1. Wait for GitHub Actions to complete (check link above)" -ForegroundColor Gray
    Write-Host "   2. Visit: https://advanciafrontend.pdtribe181.workers.dev" -ForegroundColor Gray
    Write-Host "   3. Check Cloudflare dashboard for metrics" -ForegroundColor Gray
    
    Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Monitor GitHub Actions for deployment status" -ForegroundColor Gray
    Write-Host "   2. Wait for DNS propagation (for custom domain)" -ForegroundColor Gray
    Write-Host "   3. Add custom domain: npx wrangler domains add advanciapayledger.com" -ForegroundColor Gray
    
} else {
    Write-Host "`n❌ Push failed. Check the error above." -ForegroundColor Red
    Write-Host "`nCommon issues:" -ForegroundColor Yellow
    Write-Host "   1. Network connection problem" -ForegroundColor Gray
    Write-Host "   2. Authentication issue (check git credentials)" -ForegroundColor Gray
    Write-Host "   3. Branch protection rules" -ForegroundColor Gray
    
    Write-Host "`nTo retry:" -ForegroundColor Yellow
    Write-Host "   git push origin main" -ForegroundColor Gray
}

Write-Host "`n"
