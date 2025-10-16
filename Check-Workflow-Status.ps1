# Check-Workflow-Status.ps1
# Check the status and details of recent workflow runs

Write-Host "🔍 Checking Workflow Status" -ForegroundColor Cyan
Write-Host "============================`n"

# Get the most recent runs
Write-Host "📋 Recent Workflow Runs:" -ForegroundColor Yellow
gh run list -R pdtribe181-prog/-modular-saas-platform --limit 5

Write-Host "`n🔎 Viewing Latest CI Workflow Details..." -ForegroundColor Yellow
Write-Host "========================================`n"

# View the latest CI run
gh run view 18530554718 -R pdtribe181-prog/-modular-saas-platform

Write-Host "`n`n🔎 Viewing Latest Deploy Workflow Details..." -ForegroundColor Yellow
Write-Host "============================================`n"

# View the latest Deploy run
gh run view 18530554697 -R pdtribe181-prog/-modular-saas-platform

Write-Host "`n💡 Tips:" -ForegroundColor Cyan
Write-Host "- Check the error messages above"
Write-Host "- Visit: https://github.com/pdtribe181-prog/-modular-saas-platform/actions"
Write-Host "- Workflows might fail due to missing dependencies or tests"
Write-Host ""
