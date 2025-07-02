#!/bin/bash

# GlobFam Deployment Validation Script
# Run this before deploying to Vercel

echo "🚀 GlobFam Deployment Validation"
echo "================================"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to globfam-saas directory
cd globfam-saas

# Check Node version
echo -e "\n📌 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓ Node.js version is 18 or higher${NC}"
else
    echo -e "${RED}✗ Node.js version must be 18 or higher${NC}"
    exit 1
fi

# Check if package.json exists
echo -e "\n📦 Checking package.json..."
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json found${NC}"
else
    echo -e "${RED}✗ package.json not found${NC}"
    exit 1
fi

# Check if .env.example exists
echo -e "\n🔐 Checking environment variables template..."
if [ -f ".env.example" ]; then
    echo -e "${GREEN}✓ .env.example found${NC}"
    echo -e "${YELLOW}⚠️  Make sure to set all required environment variables in Vercel${NC}"
else
    echo -e "${RED}✗ .env.example not found${NC}"
    exit 1
fi

# Check Next.js configuration
echo -e "\n⚙️  Checking Next.js configuration..."
if [ -f "next.config.js" ]; then
    echo -e "${GREEN}✓ next.config.js found${NC}"
else
    echo -e "${RED}✗ next.config.js not found${NC}"
    exit 1
fi

# Check TypeScript configuration
echo -e "\n📘 Checking TypeScript configuration..."
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓ tsconfig.json found${NC}"
else
    echo -e "${RED}✗ tsconfig.json not found${NC}"
    exit 1
fi

# Check Tailwind configuration
echo -e "\n🎨 Checking Tailwind CSS configuration..."
if [ -f "tailwind.config.js" ] && [ -f "postcss.config.js" ]; then
    echo -e "${GREEN}✓ Tailwind CSS configured${NC}"
else
    echo -e "${RED}✗ Tailwind CSS configuration missing${NC}"
    exit 1
fi

# Check if src directory exists
echo -e "\n📁 Checking source code structure..."
if [ -d "src/app" ]; then
    echo -e "${GREEN}✓ Next.js App Router structure found${NC}"
else
    echo -e "${RED}✗ src/app directory not found${NC}"
    exit 1
fi

# Check Supabase migrations
echo -e "\n🗄️  Checking database migrations..."
if [ -d "supabase/migrations" ]; then
    MIGRATION_COUNT=$(ls supabase/migrations/*.sql 2>/dev/null | wc -l)
    if [ "$MIGRATION_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Found $MIGRATION_COUNT database migration(s)${NC}"
    else
        echo -e "${YELLOW}⚠️  No SQL migrations found${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Supabase migrations directory not found${NC}"
fi

# Check if vercel.json exists
echo -e "\n🔧 Checking Vercel configuration..."
if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✓ vercel.json found${NC}"
else
    echo -e "${YELLOW}⚠️  vercel.json not found (Vercel will use default settings)${NC}"
fi

# List required environment variables
echo -e "\n🔑 Required Environment Variables for Vercel:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo "   - NEXT_PUBLIC_APP_URL (set after deployment)"

echo -e "\n📝 Optional Environment Variables:"
echo "   - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
echo "   - STRIPE_SECRET_KEY"
echo "   - OPENAI_API_KEY"
echo "   - PLAID_CLIENT_ID / BASIQ_API_KEY"

# Summary
echo -e "\n================================"
echo -e "📊 Validation Summary"
echo -e "================================"
echo -e "${GREEN}✓ Project structure is valid${NC}"
echo -e "${GREEN}✓ Configuration files are in place${NC}"
echo -e "${YELLOW}⚠️  Remember to:${NC}"
echo "   1. Set up Supabase project"
echo "   2. Configure environment variables in Vercel"
echo "   3. Run database migrations after deployment"
echo "   4. Update NEXT_PUBLIC_APP_URL after deployment"

echo -e "\n${GREEN}✅ Ready for Vercel deployment!${NC}"
echo -e "\nTo deploy:"
echo "   1. Push to GitHub"
echo "   2. Import to Vercel from GitHub"
echo "   3. Set root directory to 'globfam-saas'"
echo "   4. Configure environment variables"
echo "   5. Deploy!"

cd ..