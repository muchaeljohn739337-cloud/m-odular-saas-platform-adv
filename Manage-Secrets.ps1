# Manage-Secrets.ps1
# Handles encryption and decryption of environment files for Advancia Pay Ledger

Write-Host "🔐 Advancia Pay Ledger Environment Secret Manager"
Write-Host "Choose mode: "
Write-Host "1️⃣ Encrypt (.env → encrypted file)"
Write-Host "2️⃣ Decrypt (encrypted file → .env)"
Write-Host "3️⃣ Upload secrets to GitHub repository"
$choice = Read-Host "Enter 1, 2, or 3"

if ($choice -eq "1") {
    # Encrypt
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $envFile = ".\backend\.env"
    $encryptedFile = ".\encrypted_secrets_$timestamp.env"

    if (-Not (Test-Path $envFile)) {
        Write-Host "❌ No .env file found. Please create one first."
        exit
    }

    (Get-Content $envFile | ForEach-Object {
        if ($_ -match "=") {
            $parts = $_ -split "=", 2
            $name = $parts[0].Trim()
            $value = $parts[1].Trim()
            $encoded = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($value))
            "$name=$encoded"
        }
    }) | Out-File $encryptedFile -Encoding utf8

    Write-Host "✅ Encrypted secrets saved as $encryptedFile"
    Write-Host "🗝 Store it safely (password manager, encrypted drive, etc)."
    
    # OPTIONAL: Upload to GitHub
    $uploadChoice = Read-Host "`n🚀 Upload secrets to your GitHub repository? (y/n)"
    if ($uploadChoice -eq "y" -or $uploadChoice -eq "Y") {
        # Check if gh is installed
        try {
            $null = gh --version
        } catch {
            Write-Host "❌ GitHub CLI (gh) is not installed or not in PATH."
            Write-Host "💡 Install with: winget install GitHub.cli"
            Write-Host "   Then restart your terminal and try again."
            exit
        }
        
        # Check if authenticated
        $authStatus = gh auth status 2>&1
        if ($authStatus -match "not logged") {
            Write-Host "❌ Not logged into GitHub. Please authenticate first:"
            Write-Host "   Run: gh auth login"
            exit
        }
        
        $repo = Read-Host "Enter your GitHub repo (e.g., username/repo)"
        $envVars = Get-Content $envFile | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" }

        foreach ($line in $envVars) {
            $parts = $line -split "=", 2
            $name = $parts[0].Trim()
            $value = $parts[1].Trim()
            Write-Host "🛠 Adding secret: $name ..."
            
            try {
                gh secret set $name -b"$value" -R $repo
            } catch {
                Write-Host "⚠️  Warning: Could not set secret $name"
            }
        }

        Write-Host "✅ All secrets uploaded securely to GitHub repository $repo"
    }
}
elseif ($choice -eq "2") {
    # Decrypt
    $encryptedFile = Read-Host "Enter encrypted file name"
    if (-Not (Test-Path $encryptedFile)) {
        Write-Host "❌ File not found!"
        exit
    }

    (Get-Content $encryptedFile | ForEach-Object {
        if ($_ -match "=") {
            $parts = $_ -split "=", 2
            $name = $parts[0].Trim()
            $encoded = $parts[1].Trim()
            try {
                $value = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($encoded))
                "$name=$value"
            } catch {
                # Skip lines that can't be decoded (like comments)
            }
        }
    }) | Out-File ".\backend\.env" -Encoding utf8

    Write-Host "✅ Secrets successfully restored to .\backend\.env"
}
elseif ($choice -eq "3") {
    # Upload to GitHub directly (without encryption)
    $envFile = ".\backend\.env"
    
    if (-Not (Test-Path $envFile)) {
        Write-Host "❌ No .env file found at $envFile"
        exit
    }
    
    # Check if gh is installed
    try {
        $ghVersion = gh --version 2>&1
        Write-Host "📦 Found GitHub CLI: $($ghVersion[0])"
    } catch {
        Write-Host "❌ GitHub CLI (gh) is not installed or not in PATH."
        Write-Host "💡 Install with: winget install GitHub.cli"
        Write-Host "   Then restart your terminal and try again."
        exit
    }
    
    # Check authentication
    Write-Host "`n🔍 Checking GitHub authentication..."
    $authStatus = gh auth status 2>&1 | Out-String
    
    if ($authStatus -match "not logged|not authenticated") {
        Write-Host "❌ Not logged into GitHub."
        Write-Host "`n🔑 Please authenticate with GitHub:"
        Write-Host "   Run this command: gh auth login"
        Write-Host "   Then run this script again."
        
        $loginNow = Read-Host "`nWould you like to login now? (y/n)"
        if ($loginNow -eq "y" -or $loginNow -eq "Y") {
            gh auth login
            Write-Host "`n✅ Please run this script again to upload secrets."
        }
        exit
    }
    
    Write-Host "✅ Authenticated with GitHub"
    
    # Get repo name
    Write-Host "`n💡 Your repository was created as: pdtribe181-prog/modular-saas-platform" -ForegroundColor Cyan
    $repo = Read-Host "`nEnter your GitHub repo (default: pdtribe181-prog/modular-saas-platform)"
    if ([string]::IsNullOrWhiteSpace($repo)) {
        $repo = "pdtribe181-prog/modular-saas-platform"
    }
    
    Write-Host "`n🚀 Uploading secrets to $repo..."
    $envVars = Get-Content $envFile | Where-Object { $_ -match "^\s*[^#]" -and $_ -match "=" }
    
    $successCount = 0
    $failCount = 0
    
    foreach ($line in $envVars) {
        $parts = $line -split "=", 2
        $name = $parts[0].Trim()
        $value = $parts[1].Trim()
        Write-Host "🛠  Setting secret: $name ..."
        
        try {
            $result = gh secret set $name -b"$value" -R $repo 2>&1
            if ($LASTEXITCODE -eq 0) {
                $successCount++
            } else {
                Write-Host "   ⚠️  Warning: $result"
                $failCount++
            }
        } catch {
            Write-Host "   ⚠️  Warning: Could not set secret $name"
            $failCount++
        }
    }
    
    Write-Host "`n✅ Upload complete!"
    Write-Host "   Successfully uploaded: $successCount secret(s)"
    if ($failCount -gt 0) {
        Write-Host "   Failed: $failCount secret(s)"
    }
    Write-Host "`n💡 These secrets are now available in:"
    Write-Host "   • GitHub Actions workflows"
    Write-Host "   • GitHub Codespaces"
}
else {
    Write-Host "⚠ Invalid option. Please enter 1, 2, or 3."
}
