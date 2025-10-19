#!/bin/bash
# VS Code Extensions Installer for -modular-saas-platform (WSL/Linux)
# Run: bash install-extensions.sh

echo "🎨 Installing VS Code Extensions..."
echo ""

# Essential Extensions
essential_extensions=(
    "prisma.prisma"
    "Vue.volar"
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "humao.rest-client"
    "rangav.vscode-thunder-client"
    "ckolkman.vscode-postgres"
    "GitHub.copilot"
    "mhutchie.git-graph"
    "bradlc.vscode-tailwindcss"
)

# Recommended Extensions
recommended_extensions=(
    "formulahendry.auto-rename-tag"
    "aaron-bond.better-comments"
    "oderwat.indent-rainbow"
    "christian-kohler.path-intellisense"
    "wayou.vscode-todo-highlight"
    "eamodio.gitlens"
)

# Install Essential Extensions
echo "📥 Installing Essential Extensions..."
echo ""

for ext in "${essential_extensions[@]}"; do
    echo "  Installing: $ext"
    code --install-extension "$ext" 2>/dev/null
done

echo ""
echo "✅ Essential extensions installed!"
echo ""

# Ask about recommended extensions
echo "Would you like to install Recommended extensions? (y/n)"
read -r response

if [[ "$response" == "y" || "$response" == "Y" ]]; then
    echo ""
    echo "📥 Installing Recommended Extensions..."
    echo ""
    
    for ext in "${recommended_extensions[@]}"; do
        echo "  Installing: $ext"
        code --install-extension "$ext" 2>/dev/null
    done
    
    echo ""
    echo "✅ Recommended extensions installed!"
fi

echo ""
echo "🎉 Installation Complete!"
echo ""
echo "Next Steps:"
echo "  1. Restart VS Code"
echo "  2. Open your project"
echo "  3. Extensions will be ready to use"
echo ""
echo "To verify installation:"
echo "  • Press Ctrl+Shift+X to open Extensions"
echo "  • Or run: code --list-extensions"
echo ""
