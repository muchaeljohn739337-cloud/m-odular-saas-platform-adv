# Quick-Upload-Secrets.ps1
# Quickly upload all secrets to your GitHub repository

Write-Host "🚀 Quick Secret Upload to GitHub" -ForegroundColor Cyan
Write-Host "================================`n"

$repo = "pdtribe181-prog/-modular-saas-platform"
$envFile = ".\backend\.env"

# Check if .env exists
if (-Not (Test-Path $envFile)) {
    Write-Host "❌ No .env file found at $envFile" -ForegroundColor Red
    exit 1
}

# Check if gh is available
try {
    $null = gh --version
} catch {
    Write-Host "❌ GitHub CLI not found. Please run this in the terminal where you authenticated." -ForegroundColor Red
    exit 1
}

# Check authentication
$authStatus = gh auth status 2>&1 | Out-String
if ($authStatus -notmatch "Logged in") {
    Write-Host "❌ Not authenticated. Run: gh auth login" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Authenticated with GitHub" -ForegroundColor Green
Write-Host "📦 Repository: $repo" -ForegroundColor Cyan
Write-Host ""

# Read and upload secrets
$envVars = Get-Content $envFile | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" }

$successCount = 0
$failCount = 0

foreach ($line in $envVars) {
    if ($line -match '^\s*([^=]+)=(.*)$') {
        $name = $Matches[1].Trim()
        $value = $Matches[2].Trim() -replace '^"(.*)"$', '$1'  # Remove quotes
        
        Write-Host "🛠  Setting secret: $name ..." -ForegroundColor Yellow
        
        try {
            $result = gh secret set $name -b"$value" -R $repo 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Success" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "   ❌ Failed: $result" -ForegroundColor Red
                $failCount++
            }
        } catch {
            Write-Host "   ❌ Failed: $_" -ForegroundColor Red
            $failCount++
        }
    }
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Upload Complete!" -ForegroundColor Green
Write-Host "   Successfully uploaded: $successCount secret(s)" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "   Failed: $failCount secret(s)" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 View your secrets at:" -ForegroundColor Cyan
Write-Host "   https://github.com/$repo/settings/secrets/actions"
Write-Host ""
