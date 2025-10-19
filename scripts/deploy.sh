#!/bin/bash
# ==================================
# Automated Docker Compose Deploy Script
# ==================================
# Deploys the application with Docker Compose, runs Prisma migrations, and starts services.

set -e  # Exit on error

# Configuration
DB_SERVICE="${DB_SERVICE:-postgres}"
REDIS_SERVICE="${REDIS_SERVICE:-redis}"
APP_SERVICE="${APP_SERVICE:-app}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-saasdb}"
MODE="${MODE:-prod}"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Source .env if present
if [ -f .env ]; then
    log_info "Loading environment variables from .env"
    set -a
    source .env
    set +a
fi

# Detect docker compose command
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    log_error "Docker Compose not found. Please install Docker Compose."
    exit 1
fi

log_info "Using Docker Compose command: $DOCKER_COMPOSE"

# Start database and redis services
log_info "Starting database and Redis services..."
$DOCKER_COMPOSE up -d postgres redis

# Wait for PostgreSQL to be ready
log_info "Waiting for PostgreSQL to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

until $DOCKER_COMPOSE exec -T postgres pg_isready -U "$POSTGRES_USER" &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        log_error "PostgreSQL did not become ready in time."
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo ""
log_info "PostgreSQL is ready!"

# Build the application
log_info "Building application..."
$DOCKER_COMPOSE build "$APP_SERVICE" || {
    log_warn "Build failed or no app service defined, continuing..."
}

# Run Prisma migrations
log_info "Running Prisma migrations..."
if [ "$MODE" = "dev" ]; then
    log_info "Running Prisma migrate dev (development mode)..."
    $DOCKER_COMPOSE run --rm "$APP_SERVICE" npx prisma migrate dev --name init || {
        log_warn "Prisma migrate dev failed, trying db push instead..."
        $DOCKER_COMPOSE run --rm "$APP_SERVICE" npx prisma db push --accept-data-loss
    }
else
    log_info "Running Prisma migrate deploy (production mode)..."
    $DOCKER_COMPOSE run --rm "$APP_SERVICE" npx prisma migrate deploy || {
        log_warn "Prisma migrate deploy failed, trying db push instead..."
        $DOCKER_COMPOSE run --rm "$APP_SERVICE" npx prisma db push --accept-data-loss
    }
fi

# Generate Prisma client
log_info "Generating Prisma client..."
$DOCKER_COMPOSE run --rm "$APP_SERVICE" npx prisma generate || {
    log_warn "Prisma generate failed, continuing..."
}

# Start all services
log_info "Starting all services..."
$DOCKER_COMPOSE up -d

# Show logs
log_info "Deployment complete! Showing logs (Ctrl+C to exit)..."
log_info "Services status:"
$DOCKER_COMPOSE ps

echo ""
log_info "To view logs, run: $DOCKER_COMPOSE logs -f"
log_info "To stop services, run: $DOCKER_COMPOSE down"
