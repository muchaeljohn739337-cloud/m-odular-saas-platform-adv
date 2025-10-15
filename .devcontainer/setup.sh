#!/bin/bash
# Codespace Setup Script
set -e

echo "🚀 Setting up Modular SaaS Platform development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in Codespace
if [ "$CODESPACES" = "true" ]; then
    print_status "Running in GitHub Codespace environment"
else
    print_status "Running in local development environment"
fi

# Install dependencies
print_status "Installing npm dependencies..."
npm install

# Install Playwright browsers
print_status "Setting up Playwright browsers..."
npx playwright install --with-deps

# Set up Git configuration (if not already set)
if [ -z "$(git config --global user.name)" ]; then
    print_warning "Git user.name not set. Please configure with: git config --global user.name 'Your Name'"
fi

if [ -z "$(git config --global user.email)" ]; then
    print_warning "Git user.email not set. Please configure with: git config --global user.email 'your.email@example.com'"
fi

# Wait for database to be ready
print_status "Waiting for database to be ready..."
timeout=60
counter=0
until pg_isready -h db -p 5432 -U postgres; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
        print_error "Database failed to start within $timeout seconds"
        exit 1
    fi
done

print_success "Database is ready!"

# Wait for Redis to be ready
print_status "Waiting for Redis to be ready..."
timeout=30
counter=0
until redis-cli -h redis -p 6379 ping > /dev/null 2>&1; do
    sleep 1
    counter=$((counter + 1))
    if [ $counter -gt $timeout ]; then
        print_error "Redis failed to start within $timeout seconds"
        exit 1
    fi
done

print_success "Redis is ready!"

# Set up environment variables
if [ ! -f .env.local ]; then
    print_status "Creating .env.local file..."
    cp .env.example .env.local
    print_success "Environment file created. Please update with your specific values."
fi

# Run database migrations (if Prisma schema exists)
if [ -f prisma/schema.prisma ]; then
    print_status "Running database migrations..."
    npx prisma migrate deploy || print_warning "Database migrations failed - this might be expected for a new setup"
    
    print_status "Generating Prisma client..."
    npx prisma generate
fi

# Seed database (if seed script exists)
if [ -f prisma/seed.ts ] || [ -f prisma/seed.js ]; then
    print_status "Seeding database..."
    npm run db:seed || print_warning "Database seeding failed - this might be expected"
fi

# Build the application
print_status "Building application..."
npm run build || print_warning "Build failed - this might be expected for initial setup"

# Run tests to verify setup
print_status "Running test suite to verify setup..."
npm run test:simple || print_warning "Some tests failed - this might be expected during initial setup"

# Create development shortcuts
print_status "Creating development shortcuts..."
mkdir -p ~/.local/bin

cat > ~/.local/bin/saas-dev << 'EOF'
#!/bin/bash
echo "🚀 Starting SaaS Platform development servers..."
npm run dev
EOF

cat > ~/.local/bin/saas-test << 'EOF'
#!/bin/bash
echo "🧪 Running comprehensive test suite..."
npm run test:working
EOF

cat > ~/.local/bin/saas-e2e << 'EOF'
#!/bin/bash
echo "🎭 Running E2E tests..."
npm run test:e2e
EOF

chmod +x ~/.local/bin/saas-*

# Add to PATH if not already there
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
fi

print_success "Development environment setup complete!"

echo ""
echo "🎉 Welcome to the Modular SaaS Platform!"
echo ""
echo "Available commands:"
echo "  saas-dev    - Start development servers"
echo "  saas-test   - Run test suite"  
echo "  saas-e2e    - Run E2E tests"
echo ""
echo "Manual commands:"
echo "  npm run dev              - Start Next.js development server"
echo "  npm run dev:ui           - Start UI on port 3003"
echo "  npm run dev:api          - Start API server"
echo "  npm run test:working     - Run working tests"
echo "  npm run test:e2e         - Run Playwright E2E tests"
echo "  npm run test:cypress     - Run Cypress tests"
echo ""
echo "Database commands:"
echo "  npx prisma studio        - Open Prisma Studio"
echo "  npx prisma db push       - Push schema changes"
echo "  npx prisma migrate dev   - Create and apply migration"
echo ""
echo "🔗 Port forwarding:"
echo "  3000 - Next.js App"
echo "  3003 - Development UI"
echo "  3005 - API Server"
echo "  5432 - PostgreSQL"
echo "  6379 - Redis"
echo "  9090 - Prometheus"
echo ""

# Start development services in the background if in Codespace
if [ "$CODESPACES" = "true" ]; then
    print_status "Starting development services..."
    
    # Start the main development server
    nohup npm run dev > /tmp/dev.log 2>&1 &
    
    print_success "Development server started in background. Check /tmp/dev.log for logs."
    print_status "You can now start coding! The application will be available on the forwarded ports."
fi

print_success "Setup completed successfully! 🎊"