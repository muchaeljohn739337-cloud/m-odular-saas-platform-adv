param(
  [string]$In = "backend/.env.enc.json",
  [string]$Out = "backend/.env"
)

Write-Host "🔓 Decrypting $In -> $Out"
if (-not $env:SECRETS_PASSPHRASE) {
  $env:SECRETS_PASSPHRASE = Read-Host -AsSecureString "Enter passphrase" | ForEach-Object { [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($_)) }
}

npx tsx backend/scripts/secrets/decrypt-env.ts --in $In --out $Out

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Decrypted .env restored to: $Out"
} else {
  Write-Error "Decryption failed with exit code $LASTEXITCODE"
  exit $LASTEXITCODE
}
