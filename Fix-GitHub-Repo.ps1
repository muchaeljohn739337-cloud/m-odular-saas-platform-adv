# Fix-GitHub-Repo.ps1
# Diagnose and fix GitHub repository issues

Write-Host "🔍 GitHub Repository Diagnostics" -ForegroundColor Cyan
Write-Host "================================`n"

# Check if we can access gh
try {
    $ghVersion = gh --version 2>&1
    Write-Host "✅ GitHub CLI is accessible" -ForegroundColor Green
    Write-Host "   Version: $($ghVersion[0])`n"
} catch {
    Write-Host "❌ GitHub CLI not found in this terminal" -ForegroundColor Red
    Write-Host "   Please use the terminal where you ran 'gh auth login'`n"
    exit 1
}

# Check authentication
Write-Host "Checking authentication..." -ForegroundColor Yellow
try {
    $authStatus = gh auth status 2>&1 | Out-String
    if ($authStatus -match "Logged in") {
        Write-Host "✅ Authenticated with GitHub" -ForegroundColor Green
        Write-Host "$authStatus`n"
    } else {
        Write-Host "❌ Not authenticated" -ForegroundColor Red
        Write-Host "   Run: gh auth login`n"
        exit 1
    }
} catch {
    Write-Host "❌ Authentication check failed" -ForegroundColor Red
    exit 1
}

# List user's repositories
Write-Host "📂 Your GitHub Repositories:" -ForegroundColor Cyan
Write-Host "----------------------------"
try {
    $repos = gh repo list --limit 20 --json name,nameWithOwner,isPrivate | ConvertFrom-Json
    
    if ($repos.Count -eq 0) {
        Write-Host "   No repositories found" -ForegroundColor Yellow
        Write-Host "`n💡 You need to create the repository first!`n"
    } else {
        foreach ($repo in $repos) {
            $visibility = if ($repo.isPrivate) { "🔒 Private" } else { "🌐 Public" }
            Write-Host "   • $($repo.nameWithOwner) - $visibility"
        }
    }
} catch {
    Write-Host "   ⚠️  Could not list repositories" -ForegroundColor Yellow
}

Write-Host "`n================================"
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host ""

# Check if specific repo exists
$targetRepo = "pdtribe181/modular-saas-platform"
Write-Host "Checking if $targetRepo exists..." -ForegroundColor Yellow

try {
    $repoInfo = gh repo view $targetRepo --json name 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Repository exists!" -ForegroundColor Green
        Write-Host ""
        Write-Host "The issue might be that GitHub Actions is not enabled."
        Write-Host "To enable it:"
        Write-Host "1. Go to: https://github.com/$targetRepo/settings/actions"
        Write-Host "2. Enable 'Allow all actions and reusable workflows'"
        Write-Host "3. Try uploading secrets again"
    }
} catch {
    Write-Host "❌ Repository '$targetRepo' not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Create the repository on GitHub" -ForegroundColor Cyan
    Write-Host "   Run: gh repo create modular-saas-platform --private --source=. --remote=origin"
    Write-Host ""
    Write-Host "Option 2: Use a different existing repository" -ForegroundColor Cyan
    Write-Host "   Check your repositories above and use one of those names"
    Write-Host ""
    Write-Host "Option 3: Check if the repository has a different name" -ForegroundColor Cyan
    Write-Host "   Run: gh repo list"
}

Write-Host ""
