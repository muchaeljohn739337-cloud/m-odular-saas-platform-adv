param(
  [string]$In = "backend/.env",
  [string]$Out = "backend/.env.enc.json"
)

Write-Host "🔒 Encrypting $In -> $Out (AES-256-GCM)"
if (-not $env:SECRETS_PASSPHRASE) {
  $env:SECRETS_PASSPHRASE = Read-Host -AsSecureString "Enter passphrase" | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
}

npx tsx backend/scripts/secrets/encrypt-env.ts --in $In --out $Out

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Encrypted bundle: $Out"
} else {
  Write-Error "Encryption failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}
