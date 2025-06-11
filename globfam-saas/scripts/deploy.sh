#!/bin/bash

# GlobFam Deployment Script
set -e

echo "🚀 Starting GlobFam deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is provided
if [ -z "$1" ]; then
    log_error "Environment not specified. Usage: ./deploy.sh [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

log_info "Deploying to $ENVIRONMENT environment"

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    log_error "Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

# Check if required tools are installed
command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { log_error "npm is required but not installed. Aborting."; exit 1; }

# Check if environment file exists
ENV_FILE=".env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
    log_error "Environment file $ENV_FILE not found"
    exit 1
fi

# Load environment variables
log_info "Loading environment variables from $ENV_FILE"
export $(cat $ENV_FILE | grep -v '#' | xargs)

# Build and test
log_info "Installing dependencies..."
npm ci

log_info "Running type check..."
npm run type-check

log_info "Running linting..."
npm run lint

log_info "Running tests..."
npm run test

# Database migrations
log_info "Running database migrations..."
cd apps/api
npx prisma migrate deploy
cd ../..

# Build Docker images
log_info "Building Docker images..."
docker-compose -f docker-compose.${ENVIRONMENT}.yml build

# Deploy based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
    log_info "Deploying to staging..."
    docker-compose -f docker-compose.staging.yml up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Health checks
    log_info "Running health checks..."
    curl -f http://localhost:3001/health || { log_error "API health check failed"; exit 1; }
    curl -f http://localhost:3000 || { log_error "Web health check failed"; exit 1; }
    
    log_success "Staging deployment completed successfully!"
    log_info "API: http://localhost:3001"
    log_info "Web: http://localhost:3000"

elif [ "$ENVIRONMENT" = "production" ]; then
    log_info "Deploying to production..."
    
    # Confirm production deployment
    read -p "Are you sure you want to deploy to PRODUCTION? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Production deployment cancelled"
        exit 0
    fi
    
    # Tag and push images
    log_info "Tagging and pushing images..."
    docker tag globfam-api:latest $REGISTRY_URL/globfam-api:latest
    docker tag globfam-web:latest $REGISTRY_URL/globfam-web:latest
    
    docker push $REGISTRY_URL/globfam-api:latest
    docker push $REGISTRY_URL/globfam-web:latest
    
    # Deploy via Railway/Vercel webhooks
    log_info "Triggering production deployment..."
    if [ ! -z "$RAILWAY_WEBHOOK_URL" ]; then
        curl -X POST $RAILWAY_WEBHOOK_URL
    fi
    
    if [ ! -z "$VERCEL_WEBHOOK_URL" ]; then
        curl -X POST $VERCEL_WEBHOOK_URL
    fi
    
    log_success "Production deployment triggered successfully!"
    log_info "Check Railway/Vercel dashboards for deployment status"
fi

# Cleanup
log_info "Cleaning up..."
docker system prune -f

log_success "Deployment completed! 🎉"

# Send notification (if webhook URL is provided)
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"✅ GlobFam deployed to $ENVIRONMENT successfully!\"}" \
        $SLACK_WEBHOOK_URL
fi