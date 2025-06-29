#!/bin/bash

# GlobFam Deployment Validation Script
# Run this before every deployment to ensure everything will build correctly

echo "🔍 GlobFam Deployment Validation"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Function to check command success
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# 1. Check Node version
echo -e "\n${YELLOW}1. Checking Node.js version...${NC}"
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓ Node.js version is 18 or higher${NC}"
else
    echo -e "${RED}✗ Node.js version must be 18 or higher${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Validate Prisma Schema
echo -e "\n${YELLOW}2. Validating Prisma schema...${NC}"
cd apps/api
npx prisma validate 2>/dev/null
check_status "Prisma schema is valid"

# 3. Generate Prisma Client
echo -e "\n${YELLOW}3. Generating Prisma client...${NC}"
npx prisma generate 2>/dev/null
check_status "Prisma client generated"

# 4. Build API
echo -e "\n${YELLOW}4. Building API...${NC}"
npm run build 2>/dev/null
check_status "API builds successfully"

# 5. Type check Web
echo -e "\n${YELLOW}5. Type checking Web app...${NC}"
cd ../web
npm run type-check 2>/dev/null
check_status "Web app type checks pass"

# 6. Build Web
echo -e "\n${YELLOW}6. Building Web app...${NC}"
npm run build 2>/dev/null
check_status "Web app builds successfully"

# 7. Check for missing dependencies
echo -e "\n${YELLOW}7. Checking for missing type definitions...${NC}"
cd ../..
MISSING_TYPES=$(grep -r "Could not find a declaration file" apps/*/dist 2>/dev/null | wc -l)
if [ "$MISSING_TYPES" -eq 0 ]; then
    echo -e "${GREEN}✓ No missing type definitions${NC}"
else
    echo -e "${RED}✗ Found missing type definitions${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 8. Test Docker builds (optional)
if command -v docker &> /dev/null; then
    echo -e "\n${YELLOW}8. Testing Docker builds (this may take a few minutes)...${NC}"
    
    # Test API Docker build
    echo "Building API Docker image..."
    cd apps/api
    docker build -t globfam-api-test . > /dev/null 2>&1
    check_status "API Docker build"
    
    # Test Web Docker build
    echo "Building Web Docker image..."
    cd ../web
    docker build -t globfam-web-test . > /dev/null 2>&1
    check_status "Web Docker build"
    
    # Clean up test images
    docker rmi globfam-api-test globfam-web-test > /dev/null 2>&1
    cd ../..
else
    echo -e "\n${YELLOW}8. Skipping Docker build test (Docker not installed)${NC}"
fi

# Summary
echo -e "\n================================"
if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}✅ All validation checks passed!${NC}"
    echo -e "${GREEN}Your code is ready to deploy.${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS errors!${NC}"
    echo -e "${RED}Please fix the issues before deploying.${NC}"
    exit 1
fi