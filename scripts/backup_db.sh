#!/bin/sh
# backup_db.sh - Backup PostgreSQL database to a SQL dump file
# Usage: ./scripts/backup_db.sh [backup_name]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    printf "${GREEN}[INFO]${NC} %s\n" "$1"
}

log_error() {
    printf "${RED}[ERROR]${NC} %s\n" "$1"
}

# Check if docker is available
if ! command -v docker >/dev/null 2>&1; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

# Determine docker compose command
if docker compose version >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    DOCKER_COMPOSE="docker-compose"
else
    log_error "Docker Compose is not installed"
    exit 1
fi

# Find the database service
DB_SERVICE="postgres"
DB_CONTAINER=$(${DOCKER_COMPOSE} ps -q ${DB_SERVICE} 2>/dev/null || echo "")

if [ -z "$DB_CONTAINER" ]; then
    log_error "Database container '${DB_SERVICE}' is not running"
    exit 1
fi

# Load environment variables
if [ -f ".env" ]; then
    export $(grep -E '^POSTGRES_(USER|DB)=' .env | xargs) 2>/dev/null || true
fi

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-saasdb}"

# Create backup directory
mkdir -p backups

# Generate backup filename
BACKUP_NAME="${1:-backup}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backups/${BACKUP_NAME}_${TIMESTAMP}.sql"

log_info "Creating backup: $BACKUP_FILE"

# Create the backup
docker exec "$DB_CONTAINER" pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    log_info "Backup created successfully: $BACKUP_FILE"
else
    log_error "Backup failed"
    exit 1
fi
