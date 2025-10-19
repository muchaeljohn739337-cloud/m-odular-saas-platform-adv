#!/bin/bash

#############################################################################
# WSL DEVELOPMENT ENVIRONMENT SETUP SCRIPT
# 
# This script automates the setup of the -modular-saas-platform project
# in WSL2 Ubuntu environment.
#
# Usage: bash setup-wsl.sh
#
# What it does:
# 1. Updates system packages
# 2. Installs Node.js 18 LTS
# 3. Installs build tools
# 4. Creates projects directory
# 5. Clones the project from GitHub
# 6. Installs all dependencies
# 7. Builds both backend and frontend
# 8. Sets up convenient aliases
# 9. Verifies everything works
#
#############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions for output
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${YELLOW}→${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

# Start setup
print_header "WSL Development Environment Setup"

# Step 1: Update packages
print_step "Updating system packages..."
sudo apt update -y >/dev/null 2>&1
sudo apt upgrade -y >/dev/null 2>&1
print_success "Packages updated"

# Step 2: Install Node.js
print_step "Installing Node.js 18 LTS..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - >/dev/null 2>&1
    sudo apt install -y nodejs >/dev/null 2>&1
    print_success "Node.js installed: $(node --version)"
else
    print_success "Node.js already installed: $(node --version)"
fi

# Step 3: Install build tools
print_step "Installing build tools..."
sudo apt install -y build-essential git curl wget >/dev/null 2>&1
print_success "Build tools installed"

# Step 4: Create projects directory
print_step "Creating projects directory..."
mkdir -p ~/projects
print_success "Projects directory created at ~/projects"

# Step 5: Clone or update project
print_step "Setting up -modular-saas-platform project..."
if [ -d ~/projects/-modular-saas-platform ]; then
    print_success "Project directory already exists"
    cd ~/projects/-modular-saas-platform
    print_step "Fetching latest changes from GitHub..."
    git fetch origin >/dev/null 2>&1
    git pull origin main >/dev/null 2>&1
    print_success "Project updated"
else
    print_step "Cloning project from GitHub..."
    cd ~/projects
    git clone git@github.com:pdtribe181-prog/-modular-saas-platform.git >/dev/null 2>&1
    cd -modular-saas-platform
    print_success "Project cloned"
fi

# Step 6: Install backend dependencies
print_step "Installing backend dependencies..."
cd ~/projects/-modular-saas-platform/backend
npm ci >/dev/null 2>&1
print_success "Backend dependencies installed"

# Step 7: Install frontend dependencies
print_step "Installing frontend dependencies..."
cd ~/projects/-modular-saas-platform/frontend
npm ci >/dev/null 2>&1
print_success "Frontend dependencies installed"

# Step 8: Build backend
print_step "Building backend..."
cd ~/projects/-modular-saas-platform/backend
npm run build >/dev/null 2>&1
print_success "Backend built successfully"

# Step 9: Build frontend
print_step "Building frontend..."
cd ~/projects/-modular-saas-platform/frontend
npm run build >/dev/null 2>&1
print_success "Frontend built successfully"

# Step 10: Create WSL environment file
print_step "Setting up environment aliases..."
cat > ~/.wsl_env << 'EOF'
# -modular-saas-platform WSL Environment

# Project paths
export PROJECT_ROOT=$HOME/projects/-modular-saas-platform
export BACKEND_ROOT=$PROJECT_ROOT/backend
export FRONTEND_ROOT=$PROJECT_ROOT/frontend

# Navigation aliases
alias project='cd $PROJECT_ROOT && echo "📁 Project: $PROJECT_ROOT"'
alias backend='cd $BACKEND_ROOT && echo "📁 Backend: $BACKEND_ROOT"'
alias frontend='cd $FRONTEND_ROOT && echo "📁 Frontend: $FRONTEND_ROOT"'

# Development aliases
alias install-all='echo "📚 Installing dependencies..." && cd $BACKEND_ROOT && npm ci && cd $FRONTEND_ROOT && npm ci && cd $PROJECT_ROOT && echo "✅ Done"'
alias build-all='echo "🔨 Building project..." && cd $BACKEND_ROOT && npm run build && cd $FRONTEND_ROOT && npm run build && cd $PROJECT_ROOT && echo "✅ Done"'
alias dev='cd $PROJECT_ROOT && echo "🚀 Starting development..." && npm run dev 2>/dev/null || echo "dev script not found in root"'
alias backend-dev='cd $BACKEND_ROOT && npm run dev'
alias frontend-dev='cd $FRONTEND_ROOT && npm run dev'

# Git aliases
alias gitlog='git log --oneline -10'
alias gitstatus='git status'
alias gitpull='git pull origin main'
alias gitpush='git push origin main'
alias gitcommit='git add . && git commit -m'

# Utility aliases
alias npmupdate='cd $PROJECT_ROOT && npm update'
alias clean='cd $BACKEND_ROOT && rm -rf node_modules dist && cd $FRONTEND_ROOT && rm -rf node_modules .next && echo "✅ Cleaned"'
alias reinstall='clean && install-all'

# System info
alias sysinfo='echo "System Information:" && echo "Node: $(node --version)" && echo "npm: $(npm --version)" && echo "Git: $(git --version)"'

# Startup message
print_wsl_banner() {
    echo ""
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║  -modular-saas-platform WSL Environment Loaded         ║"
    echo "║  📁 Project Root: $PROJECT_ROOT"
    echo "║  🎯 Use 'project' to navigate to project               ║"
    echo "║  💡 Use 'sysinfo' to check versions                    ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo ""
}

print_wsl_banner

EOF

# Add to bashrc if not already there
if ! grep -q "source ~/.wsl_env" ~/.bashrc; then
    echo "source ~/.wsl_env" >> ~/.bashrc
    print_success "Environment aliases configured"
else
    print_success "Environment aliases already configured"
fi

# Step 11: Verify installation
print_step "Verifying installation..."
cd ~/projects/-modular-saas-platform

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
GIT_VERSION=$(git --version | awk '{print $3}')
PROJECT_STATUS=$(git status --short | wc -l)

print_success "Node.js: $NODE_VERSION"
print_success "npm: $NPM_VERSION"
print_success "Git: $GIT_VERSION"
print_success "Project files: $(git ls-files | wc -l) tracked files"

# Final summary
print_header "Setup Complete! 🎉"
echo ""
echo -e "Your project is ready to develop!"
echo ""
echo -e "${BLUE}Quick Start Commands:${NC}"
echo -e "  ${YELLOW}project${NC}        → Navigate to project root"
echo -e "  ${YELLOW}backend${NC}        → Navigate to backend"
echo -e "  ${YELLOW}frontend${NC}       → Navigate to frontend"
echo -e "  ${YELLOW}install-all${NC}    → Install all dependencies"
echo -e "  ${YELLOW}build-all${NC}      → Build frontend & backend"
echo -e "  ${YELLOW}backend-dev${NC}    → Start backend development"
echo -e "  ${YELLOW}frontend-dev${NC}   → Start frontend development"
echo -e "  ${YELLOW}gitlog${NC}         → View commit history"
echo -e "  ${YELLOW}sysinfo${NC}        → Show system information"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo -e "  1. Run: ${YELLOW}source ~/.bashrc${NC}"
echo -e "  2. Run: ${YELLOW}project${NC}"
echo -e "  3. Run: ${YELLOW}git status${NC}"
echo -e "  4. Begin development or deployment!"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"
echo ""
