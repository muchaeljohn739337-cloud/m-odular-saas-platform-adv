#!/bin/sh
# deploy.sh - Deploy the application using Docker Compose
# Usage: ./scripts/deploy.sh [dev|prod]

set -e

MODE="${1:-dev}"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    printf "${GREEN}[INFO]${NC} %s\n" "$1"
}

log_warn() {
    printf "${YELLOW}[WARN]${NC} %s\n" "$1"
}

# Determine docker compose command
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    echo "Docker Compose is not installed"
    exit 1
fi

log_info "Deploying in $MODE mode..."

if [ "$MODE" = "dev" ]; then
    log_info "Starting services (db, redis, app)..."
    ${DOCKER_COMPOSE} up -d postgres redis
    
    # Wait for services to be healthy
    log_info "Waiting for services to be ready..."
    sleep 10
    
    log_info "Services started successfully"
elif [ "$MODE" = "prod" ]; then
    log_info "Starting production services..."
    ${DOCKER_COMPOSE} up -d
else
    log_warn "Unknown mode: $MODE. Use 'dev' or 'prod'"
    exit 1
fi

log_info "Deployment complete!"
