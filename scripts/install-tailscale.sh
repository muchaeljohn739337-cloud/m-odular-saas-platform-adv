#!/bin/bash

# ============================================
# Tailscale VPN Installation Script
# For Advancia Pay Ledger - Ubuntu/WSL
# ============================================

set -e

echo "============================================"
echo "Tailscale VPN Installation for Advancia"
echo "============================================"
echo ""

# Check if running on Ubuntu/Debian
if [ ! -f /etc/os-release ]; then
    echo "❌ Error: Cannot detect OS. This script is for Ubuntu/Debian."
    exit 1
fi

source /etc/os-release
if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
    echo "❌ Error: This script is for Ubuntu/Debian only."
    echo "   Detected OS: $ID"
    exit 1
fi

echo "✅ Detected OS: $PRETTY_NAME"
echo ""

# Check if Tailscale is already installed
if command -v tailscale &> /dev/null; then
    echo "ℹ️  Tailscale is already installed"
    tailscale version
    echo ""
    read -p "Do you want to reinstall? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Installation cancelled."
        exit 0
    fi
fi

echo "📦 Installing Tailscale..."
echo ""

# Install Tailscale
curl -fsSL https://tailscale.com/install.sh | sh

echo ""
echo "✅ Tailscale installed successfully!"
echo ""

# Check if already authenticated
if sudo tailscale status &> /dev/null; then
    echo "ℹ️  Tailscale is already authenticated"
    sudo tailscale status
else
    echo "🔑 Starting Tailscale and authentication..."
    echo ""
    echo "A browser window will open for authentication."
    echo "Sign in with your Tailscale account."
    echo ""
    sudo tailscale up
fi

echo ""
echo "============================================"
echo "Tailscale Installation Complete!"
echo "============================================"
echo ""

# Get Tailscale IP
TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "Not available")
echo "📍 Your Tailscale IP: $TAILSCALE_IP"
echo ""

# Show status
echo "📊 Tailscale Status:"
sudo tailscale status | head -5
echo ""

echo "============================================"
echo "Next Steps:"
echo "============================================"
echo ""
echo "1. Add your Tailscale IP to backend/.env:"
echo "   TAILSCALE_ENABLED=true"
echo "   TAILSCALE_ADMIN_IPS=$TAILSCALE_IP"
echo ""
echo "2. Restart your backend server:"
echo "   cd backend && npm run dev"
echo ""
echo "3. Test Dad Console access:"
echo "   curl http://localhost:4000/api/dad/health"
echo ""
echo "4. View documentation:"
echo "   cat TAILSCALE_SETUP.md"
echo ""
echo "============================================"
echo "Useful Tailscale Commands:"
echo "============================================"
echo ""
echo "  tailscale status        - View connected devices"
echo "  tailscale ip            - Show your Tailscale IPs"
echo "  tailscale ping <device> - Test connectivity"
echo "  tailscale down          - Temporarily disconnect"
echo "  tailscale up            - Reconnect"
echo "  tailscale logout        - Remove from network"
echo ""
echo "Admin console: https://login.tailscale.com/admin"
echo ""
echo "✅ Installation complete! Enjoy secure VPN access."
