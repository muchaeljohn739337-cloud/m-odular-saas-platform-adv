# Encrypt-Secrets.ps1
# ---------------------
# Encrypts your environment variables and saves them to a secure file for GitHub or Codespaces.

Write-Host "🔐 Encrypting secrets for Advancia Pay Ledger project..."

# Check if .env file exists to read from
$envFile = ".\backend\.env"
if (Test-Path $envFile) {
    $useExisting = Read-Host "Found existing .env file. Use it? (y/n)"
    if ($useExisting -eq 'y' -or $useExisting -eq 'Y') {
        Write-Host "📖 Reading from $envFile..."
        $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
        $encryptedFile = ".\encrypted_secrets_$timestamp.env"
        
        $encryptedContent = @"
# 🔐 Encrypted Secrets for Advancia Pay Ledger
# Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@
        
        (Get-Content $envFile | ForEach-Object {
            if ($_ -match "^\s*([^#][^=]+)=(.+)$") {
                $name = $Matches[1].Trim()
                $value = $Matches[2].Trim()
                $encodedValue = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($value))
                $encryptedContent += "$name=$encodedValue`n"
            }
        })
        
        $encryptedContent | Out-File $encryptedFile -Encoding utf8
        Write-Host "✅ Encrypted secrets saved to $encryptedFile"
        Write-Host "⚠️  Store this file safely and DO NOT commit it to GitHub."
        exit 0
    }
}

# Ask user for secrets interactively
Write-Host "`n📝 Enter your secrets manually:"
$databaseUrl = Read-Host "Enter your DATABASE_URL"
$jwtSecret = Read-Host "Enter your JWT_SECRET"
$redisUrl = Read-Host "Enter your REDIS_URL"

# Convert to Base64 (simple encryption)
$encodedDb = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($databaseUrl))
$encodedJwt = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($jwtSecret))
$encodedRedis = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($redisUrl))

# Combine and save
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$outputFile = ".\encrypted_secrets_$timestamp.env"

@"
# 🔐 Encrypted Secrets for Advancia Pay Ledger
# Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
DATABASE_URL=$encodedDb
JWT_SECRET=$encodedJwt
REDIS_URL=$encodedRedis
"@ | Out-File -Encoding utf8 $outputFile

Write-Host "✅ Encrypted secrets saved to $outputFile"
Write-Host "⚠️  Store this file safely and DO NOT commit it to GitHub."
