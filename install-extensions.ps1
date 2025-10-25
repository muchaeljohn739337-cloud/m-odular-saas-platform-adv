#!/usr/bin/env pwsh
# VS Code Extensions Installer for -modular-saas-platform
# Run this script to install all recommended extensions

Write-Host "🎨 Installing VS Code Extensions..." -ForegroundColor Green
Write-Host ""

# Essential Extensions
$essentialExtensions = @(
    "prisma.prisma",
    "Vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "humao.rest-client",
    "rangav.vscode-thunder-client",
    "ckolkman.vscode-postgres",
    "GitHub.copilot",
    "mhutchie.git-graph",
    "bradlc.vscode-tailwindcss"
)

# Recommended Extensions
$recommendedExtensions = @(
    "formulahendry.auto-rename-tag",
    "aaron-bond.better-comments",
    "oderwat.indent-rainbow",
    "christian-kohler.path-intellisense",
    "wayou.vscode-todo-highlight",
    "eamodio.gitlens"
)

# Install Essential Extensions
Write-Host "📥 Installing Essential Extensions..." -ForegroundColor Cyan
Write-Host ""

foreach ($ext in $essentialExtensions) {
    Write-Host "  Installing: $ext" -ForegroundColor Yellow
    code --install-extension $ext 2>&1 | Out-Null
}

Write-Host ""
Write-Host "✅ Essential extensions installed!" -ForegroundColor Green
Write-Host ""

# Ask about recommended extensions
Write-Host "Would you like to install Recommended extensions? (Y/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "📥 Installing Recommended Extensions..." -ForegroundColor Cyan
    Write-Host ""
    
    foreach ($ext in $recommendedExtensions) {
        Write-Host "  Installing: $ext" -ForegroundColor Yellow
        code --install-extension $ext 2>&1 | Out-Null
    }
    
    Write-Host ""
    Write-Host "✅ Recommended extensions installed!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Restart VS Code"
Write-Host "  2. Open your project"
Write-Host "  3. Extensions will be ready to use"
Write-Host ""
Write-Host "To verify installation:" -ForegroundColor Cyan
Write-Host "  • Press Ctrl+Shift+X to open Extensions"
Write-Host "  • Or run: code --list-extensions"
Write-Host ""

Read-Host "Press Enter to continue"
