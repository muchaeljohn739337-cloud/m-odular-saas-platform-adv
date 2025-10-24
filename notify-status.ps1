param(
  [ValidateSet('success','failed')]
  [string]$status = 'success'
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Load backend/.env to get SMTP and optional admin email
$root = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$envPath = Join-Path $root 'backend/.env'
$envMap = @{}
if (Test-Path $envPath) {
  (Get-Content $envPath | Where-Object { $_ -match '=' -and $_ -notmatch '^\s*#' }) | ForEach-Object {
    $kv = $_.Split('=',2)
    $k = $kv[0].Trim()
    $v = $kv[1].Trim().Trim('"')
    $envMap[$k] = $v
  }
}

# Resolve SMTP settings (support both SMTP_* and EMAIL_* naming)
$smtpServer = $envMap['SMTP_SERVER']
if (-not $smtpServer) { $smtpServer = $env:SMTP_SERVER }
if (-not $smtpServer) { $smtpServer = $envMap['EMAIL_HOST'] }
if (-not $smtpServer) { $smtpServer = $env:EMAIL_HOST }
if (-not $smtpServer) { $smtpServer = 'smtp.gmail.com' }

$smtpPort = $envMap['SMTP_PORT']
if (-not $smtpPort) { $smtpPort = $env:SMTP_PORT }
if (-not $smtpPort) { $smtpPort = $envMap['EMAIL_PORT'] }
if (-not $smtpPort) { $smtpPort = $env:EMAIL_PORT }
if (-not $smtpPort) { $smtpPort = 587 }

$smtpUser = $envMap['SMTP_USER']
if (-not $smtpUser) { $smtpUser = $env:SMTP_USER }
if (-not $smtpUser) { $smtpUser = $envMap['EMAIL_USER'] }
if (-not $smtpUser) { $smtpUser = $env:EMAIL_USER }

$smtpPass = $envMap['SMTP_PASS']
if (-not $smtpPass) { $smtpPass = $env:SMTP_PASS }
if (-not $smtpPass) { $smtpPass = $envMap['EMAIL_PASSWORD'] }
if (-not $smtpPass) { $smtpPass = $env:EMAIL_PASSWORD }

$adminEmail = $envMap['ADMIN_EMAIL']
if (-not $adminEmail) { $adminEmail = $env:ADMIN_EMAIL }
if (-not $adminEmail -and $smtpUser) { $adminEmail = $smtpUser }

$project = 'Advancia Pay Ledger'
$timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

if ($status -eq 'success') {
  $subject = "✅ $project Deployment Successful"
  $body    = "All systems verified at $timestamp.`nYour Advancia stack is online."
} else {
  $subject = "❌ $project Deployment Failed"
  $logFile = Join-Path $env:USERPROFILE '.vscode/extensions/advancia_build_log.txt'
  $tail = ''
  if (Test-Path $logFile) {
    try { $lines = Get-Content $logFile -Tail 20 -ErrorAction SilentlyContinue; $tail = "`n--- Last 20 Log Lines ---`n" + ($lines -join "`n") } catch {}
  }
  $body    = "Deployment failed at $timestamp.`nCheck logs for details.$tail"
}

# Webhook notification removed (not needed)

# Email notification if SMTP creds available
if ($smtpUser -and $smtpPass -and $adminEmail) {
  try {
    $securePass = ConvertTo-SecureString $smtpPass -AsPlainText -Force
    $cred = New-Object System.Management.Automation.PSCredential($smtpUser, $securePass)
    Send-MailMessage -From $smtpUser -To $adminEmail -Subject $subject -Body $body -SmtpServer $smtpServer -Port $smtpPort -UseSsl -Credential $cred
    Write-Host "📧 Email notification sent to $adminEmail"
  } catch {
    Write-Host "⚠ Email send failed: $($_.Exception.Message)"
  }
} else {
  Write-Host 'ℹ SMTP not fully configured (SMTP_USER/SMTP_PASS/ADMIN_EMAIL); skipping email.'
}
