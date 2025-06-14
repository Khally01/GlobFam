#!/bin/bash

# GlobFam Deployment Script
# Usage: ./deploy.sh [environment] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
VERSION=${2:-latest}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"docker.io"}
DOCKER_USERNAME=${DOCKER_USERNAME:-"globfam"}

echo -e "${GREEN}🚀 Deploying GlobFam Platform${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo -e "Version: ${YELLOW}$VERSION${NC}"

# Load environment variables
if [ -f ".env.$ENVIRONMENT" ]; then
    echo -e "${GREEN}✓ Loading environment variables${NC}"
    export $(cat .env.$ENVIRONMENT | grep -v '^#' | xargs)
else
    echo -e "${RED}✗ Environment file .env.$ENVIRONMENT not found${NC}"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}✗ Docker not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}✗ Docker Compose not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All prerequisites met${NC}"

# Pull latest images
echo -e "\n${YELLOW}Pulling latest images...${NC}"
docker pull $DOCKER_REGISTRY/$DOCKER_USERNAME/globfam-backend:$VERSION
docker pull $DOCKER_REGISTRY/$DOCKER_USERNAME/globfam-frontend:$VERSION

# Backup database (optional)
if [ "$BACKUP_BEFORE_DEPLOY" = "true" ]; then
    echo -e "\n${YELLOW}Backing up database...${NC}"
    docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup_$(date +%Y%m%d_%H%M%S).sql
    echo -e "${GREEN}✓ Database backed up${NC}"
fi

# Run database migrations
echo -e "\n${YELLOW}Running database migrations...${NC}"
docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
echo -e "${GREEN}✓ Migrations completed${NC}"

# Deploy with zero downtime
echo -e "\n${YELLOW}Deploying services...${NC}"

# Scale up new containers
docker-compose -f docker-compose.prod.yml up -d --scale backend=2 --no-recreate

# Wait for health checks
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 30

# Remove old containers
docker-compose -f docker-compose.prod.yml up -d --scale backend=1 --no-recreate

# Clean up
echo -e "\n${YELLOW}Cleaning up...${NC}"
docker system prune -f
echo -e "${GREEN}✓ Cleanup completed${NC}"

# Verify deployment
echo -e "\n${YELLOW}Verifying deployment...${NC}"

# Check backend health
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi

# Check frontend
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/health)
if [ "$FRONTEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}✓ Frontend is healthy${NC}"
else
    echo -e "${RED}✗ Frontend health check failed${NC}"
    exit 1
fi

echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "Version ${YELLOW}$VERSION${NC} is now live in ${YELLOW}$ENVIRONMENT${NC}"

# Send notification (optional)
if [ "$SEND_NOTIFICATIONS" = "true" ]; then
    curl -X POST $SLACK_WEBHOOK_URL \
        -H 'Content-Type: application/json' \
        -d "{\"text\":\"GlobFam $VERSION deployed to $ENVIRONMENT successfully! 🚀\"}"
fi