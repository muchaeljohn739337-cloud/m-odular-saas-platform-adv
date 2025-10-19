# Check-Deployment-Status.ps1
# Quick script to check GitHub Actions deployment status

Write-Host @"
╔══════════════════════════════════════════╗
║   GITHUB ACTIONS DEPLOYMENT STATUS      ║
╚══════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host ""

# Check if gh CLI is available
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ GitHub CLI (gh) not found. Install from: https://cli.github.com" -ForegroundColor Red
    exit 1
}

# Get recent workflow runs
Write-Host "📊 Recent Deployment Runs:" -ForegroundColor Yellow
Write-Host ""

gh run list --limit 10 --json status,conclusion,displayTitle,workflowName,startedAt,url | ConvertFrom-Json | ForEach-Object {
    $emoji = switch ($_.status) {
        "completed" {
            switch ($_.conclusion) {
                "success" { "✅" }
                "failure" { "❌" }
                "cancelled" { "🚫" }
                default { "⚠️" }
            }
        }
        "in_progress" { "⏳" }
        "queued" { "📋" }
        default { "❓" }
    }
    
    $color = switch ($_.conclusion) {
        "success" { "Green" }
        "failure" { "Red" }
        "cancelled" { "Yellow" }
        default { "Gray" }
    }
    
    $timeAgo = (Get-Date) - [DateTime]$_.startedAt
    $ago = if ($timeAgo.TotalMinutes -lt 1) {
        "$([int]$timeAgo.TotalSeconds) seconds ago"
    } elseif ($timeAgo.TotalHours -lt 1) {
        "$([int]$timeAgo.TotalMinutes) minutes ago"
    } elseif ($timeAgo.TotalDays -lt 1) {
        "$([int]$timeAgo.TotalHours) hours ago"
    } else {
        "$([int]$timeAgo.TotalDays) days ago"
    }
    
    Write-Host "$emoji " -NoNewline -ForegroundColor $color
    Write-Host "$($_.workflowName)" -NoNewline -ForegroundColor White
    Write-Host " - $ago" -ForegroundColor Gray
    Write-Host "   $($_.displayTitle)" -ForegroundColor DarkGray
    Write-Host ""
}

Write-Host ""
Write-Host "🔗 View all workflows: " -NoNewline -ForegroundColor Cyan
Write-Host "https://github.com/pdtribe181-prog/-modular-saas-platform/actions" -ForegroundColor Blue

Write-Host ""
Write-Host "💡 Commands:" -ForegroundColor Yellow
Write-Host "   gh run list              - List recent runs" -ForegroundColor Gray
Write-Host "   gh run view <ID>         - View specific run" -ForegroundColor Gray
Write-Host "   gh run watch             - Watch current runs" -ForegroundColor Gray
Write-Host "   gh workflow list         - List all workflows" -ForegroundColor Gray

Write-Host ""

# Check for any failed runs
$failedRuns = gh run list --limit 5 --json status,conclusion,workflowName | ConvertFrom-Json | Where-Object { $_.conclusion -eq "failure" }

if ($failedRuns) {
    Write-Host "⚠️ Recent Failures Found:" -ForegroundColor Red
    $failedRuns | ForEach-Object {
        Write-Host "   • $($_.workflowName)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "📝 To view failure details:" -ForegroundColor Yellow
    Write-Host "   gh run view --log" -ForegroundColor Gray
    Write-Host ""
}

# Check secrets are configured
Write-Host "🔑 Checking GitHub Secrets..." -ForegroundColor Yellow
$secrets = gh secret list --json name | ConvertFrom-Json

$requiredSecrets = @(
    "RENDER_DEPLOY_HOOK_BACKEND",
    "RENDER_DEPLOY_HOOK_FRONTEND"
)

$allPresent = $true
foreach ($required in $requiredSecrets) {
    $found = $secrets | Where-Object { $_.name -eq $required }
    if ($found) {
        Write-Host "   ✅ $required" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $required (MISSING)" -ForegroundColor Red
        $allPresent = $false
    }
}

Write-Host ""

if ($allPresent) {
    Write-Host "✅ All required secrets are configured!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some secrets are missing. Add them at:" -ForegroundColor Yellow
    Write-Host "   https://github.com/pdtribe181-prog/-modular-saas-platform/settings/secrets/actions" -ForegroundColor Blue
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
