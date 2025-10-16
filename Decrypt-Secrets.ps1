# Decrypt-Secrets.ps1
# ---------------------
# Restores original .env values from your Base64-encoded secret file

Write-Host "🔓 Decrypting secrets for Advancia Pay Ledger project..."

# List available encrypted files
$encryptedFiles = Get-ChildItem -Path ".\encrypted_secrets_*.env" -ErrorAction SilentlyContinue

if ($encryptedFiles.Count -eq 0) {
    Write-Host "❌ No encrypted files found. Please run Encrypt-Secrets.ps1 first."
    exit 1
}

# If multiple files exist, let user choose
if ($encryptedFiles.Count -gt 1) {
    Write-Host "`n📁 Multiple encrypted files found:"
    for ($i = 0; $i -lt $encryptedFiles.Count; $i++) {
        Write-Host "  [$i] $($encryptedFiles[$i].Name) - $(Get-Date $encryptedFiles[$i].LastWriteTime -Format 'yyyy-MM-dd HH:mm:ss')"
    }
    $selection = Read-Host "`nSelect file number to decrypt"
    $selectedFile = $encryptedFiles[$selection]
} else {
    $selectedFile = $encryptedFiles[0]
    Write-Host "📁 Using file: $($selectedFile.Name)"
}

# Read and decrypt the file
Write-Host "`n🔍 Reading encrypted file..."
$content = Get-Content -Path $selectedFile.FullName

# Parse and decode each secret
$secrets = @{}
foreach ($line in $content) {
    if ($line -match '^\s*([A-Z_]+)=(.+)$') {
        $key = $Matches[1]
        $encodedValue = $Matches[2]
        
        try {
            $decodedBytes = [Convert]::FromBase64String($encodedValue)
            $decodedValue = [System.Text.Encoding]::UTF8.GetString($decodedBytes)
            $secrets[$key] = $decodedValue
        } catch {
            Write-Host "⚠️  Warning: Could not decode $key"
        }
    }
}

# Display decrypted secrets
Write-Host "`n✅ Decrypted Secrets:"
Write-Host "====================="
foreach ($key in $secrets.Keys | Sort-Object) {
    Write-Host "$key=$($secrets[$key])"
}

# Option to save to .env file
Write-Host "`n"
$saveToEnv = Read-Host "Would you like to save these to a .env file? (y/n)"
if ($saveToEnv -eq 'y' -or $saveToEnv -eq 'Y') {
    $envPath = Read-Host "Enter path for .env file (default: .\backend\.env)"
    if ([string]::IsNullOrWhiteSpace($envPath)) {
        $envPath = ".\backend\.env"
    }
    
    # Create directory if it doesn't exist
    $envDir = Split-Path -Path $envPath -Parent
    if (![string]::IsNullOrWhiteSpace($envDir) -and !(Test-Path $envDir)) {
        New-Item -ItemType Directory -Path $envDir -Force | Out-Null
    }
    
    # Backup existing .env if it exists
    if (Test-Path $envPath) {
        $backupPath = "$envPath.backup"
        Copy-Item $envPath $backupPath -Force
        Write-Host "📦 Backed up existing .env to $backupPath"
    }
    
    # Write to .env file
    $envContent = @"
# Environment Variables - Generated from encrypted secrets
# Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@
    foreach ($key in $secrets.Keys | Sort-Object) {
        $envContent += "$key=$($secrets[$key])`n"
    }
    
    $envContent | Out-File -Encoding utf8 -FilePath $envPath
    Write-Host "✅ Secrets saved to $envPath"
    Write-Host "⚠️  Remember: .env files are in .gitignore and won't be committed"
} else {
    Write-Host "ℹ️  Secrets not saved. You can copy them manually from above."
}

Write-Host "`n🎉 Done!"
