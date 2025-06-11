#!/bin/bash

# GlobFam Sales Pitch Deployment Script
set -e

echo "🚀 Deploying GlobFam Sales Pitch..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if sales-pitch.html exists
if [ ! -f "sales-pitch.html" ]; then
    echo "❌ sales-pitch.html not found. Please run this script from the project root."
    exit 1
fi

echo "Choose deployment option:"
echo "1. GitHub Pages (Free)"
echo "2. Netlify (Free, Custom Domain)"
echo "3. Vercel (Free, Professional)"
echo "4. Local Server (For testing)"

read -p "Enter option (1-4): " option

case $option in
    1)
        log_info "Deploying to GitHub Pages..."
        
        # Check if git repo exists
        if [ ! -d ".git" ]; then
            log_warning "Not a git repository. Initializing..."
            git init
            git add .
            git commit -m "Initial commit with GlobFam sales pitch"
        else
            git add sales-pitch.html FAMILY_PRESENTATION.md SALES_PITCH_DEPLOY.md
            git commit -m "Add GlobFam sales pitch and presentation materials"
        fi
        
        # Check if remote exists
        if ! git remote get-url origin > /dev/null 2>&1; then
            echo "Please set up your GitHub repository first:"
            echo "1. Create a new repository on GitHub"
            echo "2. Run: git remote add origin https://github.com/yourusername/globfam-saas.git"
            echo "3. Run this script again"
            exit 1
        fi
        
        git push origin main
        
        log_success "Deployed to GitHub Pages!"
        echo "Enable GitHub Pages in your repository settings:"
        echo "Settings → Pages → Source: Deploy from a branch → main"
        echo ""
        echo "Your sales pitch will be available at:"
        echo "https://yourusername.github.io/globfam-saas/sales-pitch.html"
        ;;
        
    2)
        log_info "Deploying to Netlify..."
        
        # Check if Netlify CLI is installed
        if ! command -v netlify &> /dev/null; then
            log_info "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        # Login to Netlify (if not already logged in)
        netlify status > /dev/null 2>&1 || netlify login
        
        # Deploy
        netlify deploy --prod --dir . --site-name globfam-pitch
        
        log_success "Deployed to Netlify!"
        echo "Your sales pitch is available at:"
        echo "https://globfam-pitch.netlify.app/sales-pitch.html"
        ;;
        
    3)
        log_info "Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            log_info "Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Deploy
        vercel --prod
        
        log_success "Deployed to Vercel!"
        echo "Your sales pitch URL will be shown above."
        echo "Add /sales-pitch.html to access the presentation."
        ;;
        
    4)
        log_info "Starting local server..."
        
        echo "Starting local server on port 8000..."
        echo "Your sales pitch will be available at:"
        echo "http://localhost:8000/sales-pitch.html"
        echo ""
        echo "Press Ctrl+C to stop the server"
        
        # Check if Python is available
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8000
        elif command -v python &> /dev/null; then
            python -m http.server 8000
        else
            log_warning "Python not found. Trying Node.js..."
            if command -v npx &> /dev/null; then
                npx serve . -p 8000
            else
                echo "❌ Neither Python nor Node.js found. Please install one of them."
                exit 1
            fi
        fi
        ;;
        
    *)
        echo "❌ Invalid option. Please choose 1-4."
        exit 1
        ;;
esac

log_success "Deployment completed! 🎉"
echo ""
echo "📧 Share with your family:"
echo "Subject: GlobFam - Our Family Finance Solution"
echo ""
echo "Demo credentials:"
echo "Email: demo@globfam.app"
echo "Password: demo123456"
echo "Family Code: DEMO2025"
echo ""
echo "💡 Tips:"
echo "- Toggle to Mongolian using the 🇲🇳 button"
echo "- Use FAMILY_PRESENTATION.md for talking points"
echo "- Try the live demo with demo credentials"