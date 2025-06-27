#!/bin/bash

echo "🚀 GlobFam Railway Deployment Script"
echo "===================================="

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    exit 1
fi

# Function to deploy a service
deploy_service() {
    local service_name=$1
    local service_path=$2
    
    echo ""
    echo "📦 Deploying $service_name..."
    echo "------------------------------"
    
    cd "$service_path" || exit 1
    
    # Check if linked to Railway
    if ! railway status &> /dev/null; then
        echo "❌ Not linked to Railway. Run 'railway link' in $service_path"
        return 1
    fi
    
    # Deploy
    echo "🚂 Starting deployment..."
    railway up
    
    if [ $? -eq 0 ]; then
        echo "✅ $service_name deployed successfully!"
    else
        echo "❌ $service_name deployment failed!"
        return 1
    fi
}

# Main deployment flow
echo ""
echo "1️⃣ Pre-deployment checks..."

# Check for required files
if [ ! -f "apps/api/railway.toml" ]; then
    echo "❌ Missing apps/api/railway.toml"
    exit 1
fi

if [ ! -f "apps/web/railway.json" ]; then
    echo "❌ Missing apps/web/railway.json"
    exit 1
fi

echo "✅ Configuration files found"

# Deploy API first
echo ""
echo "2️⃣ Deploying API service..."
deploy_service "API" "apps/api"

if [ $? -ne 0 ]; then
    echo "❌ API deployment failed. Aborting."
    exit 1
fi

# Wait a bit for API to be ready
echo ""
echo "⏳ Waiting for API to be ready..."
sleep 10

# Deploy Web
echo ""
echo "3️⃣ Deploying Web service..."
deploy_service "Web" "apps/web"

if [ $? -ne 0 ]; then
    echo "❌ Web deployment failed."
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Post-deployment checklist:"
echo "   1. Check API health: railway logs -s api"
echo "   2. Check Web logs: railway logs -s web"
echo "   3. Visit your app URL"
echo "   4. Test login functionality"
echo ""
echo "💡 Tip: Use 'railway open' to open your app in the browser"