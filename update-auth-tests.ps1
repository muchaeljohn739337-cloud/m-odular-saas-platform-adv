# PowerShell script to update auth.test.ts for approval workflow
$filePath = "c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend\tests\auth.test.ts"

# Read the original file
$content = Get-Content $filePath -Raw

# Simple string replacements
$content = $content -replace '"User registered successfully"', '"Registration submitted. Awaiting admin approval."'

# Add status check after token check in register test
$content = $content -replace '(\s+expect\(response\.body\)\.toHaveProperty\("token"\);)', 'expect(response.body).toHaveProperty("status", "pending_approval");$1'

# Update test description
$content = $content -replace 'it\("successfully registers a new user"', 'it("successfully registers a new user (pending approval)"'

# Write back
Set-Content $filePath $content -Encoding UTF8
Write-Host "✅ Fixed auth.test.ts" -ForegroundColor Green
