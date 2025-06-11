#!/bin/bash

# GlobFam.io Setup Script
set -e

echo "🚀 Setting up globfam.io domain..."

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

# Update files to use globfam.io
log_info "Updating files to use globfam.io domain..."

# Update sales-pitch.html if it exists
if [ -f "sales-pitch.html" ]; then
    sed -i.bak 's/globfam\.app/globfam.io/g' sales-pitch.html
    log_success "Updated sales-pitch.html"
fi

# Already updated index.html - confirm it's correct
if [ -f "index.html" ]; then
    if grep -q "globfam.io" index.html; then
        log_success "index.html already updated with globfam.io"
    else
        sed -i.bak 's/globfam\.app/globfam.io/g' index.html
        log_success "Updated index.html"
    fi
fi

# Update README if it exists
if [ -f "README.md" ]; then
    sed -i.bak 's/globfam\.app/globfam.io/g' README.md
    log_success "Updated README.md"
fi

# Create robots.txt for SEO
cat > robots.txt << 'EOF'
User-agent: *
Allow: /

Sitemap: https://globfam.io/sitemap.xml
EOF

log_success "Created robots.txt"

# Create .htaccess for redirects (if needed)
cat > .htaccess << 'EOF'
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirect www to non-www
RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]
EOF

log_success "Created .htaccess for redirects"

# Commit changes
log_info "Committing changes to git..."

git add .
git commit -m "Update domain to globfam.io and add SEO optimizations"

log_success "Changes committed!"

echo ""
echo "🌟 Next Steps:"
echo ""
echo "1. 🏗️  Add Custom Domain in Railway:"
echo "   • Go to Railway Dashboard → Your Project"
echo "   • Settings → Domains → Add Custom Domain"
echo "   • Enter: globfam.io"
echo ""
echo "2. 🌐 Configure DNS at your domain registrar:"
echo "   • Type: CNAME, Name: www, Value: [your-railway-app].up.railway.app"
echo "   • Type: A, Name: @, Value: [Railway IP from dashboard]"
echo ""
echo "3. 📧 Set up professional email:"
echo "   • Google Workspace: \$6/month"
echo "   • Cloudflare Email: Free forwarding"
echo "   • Get: hello@globfam.io"
echo ""
echo "4. 🚀 Deploy to Railway:"
echo "   git push origin main"
echo ""
echo "5. 📱 Share your professional URL:"
echo "   https://globfam.io"
echo ""

# Push to git
read -p "Push changes to GitHub now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin main
    log_success "Pushed to GitHub! Railway will auto-deploy."
    echo ""
    echo "🎉 Your professional presentation will be live at:"
    echo "https://globfam.io (after DNS configuration)"
    echo ""
    echo "Current Railway URL (works now):"
    echo "https://[your-project-name].up.railway.app"
else
    log_info "Run 'git push origin main' when ready to deploy"
fi

echo ""
echo "✨ globfam.io setup complete! Professional tech startup domain ready! 🚀"