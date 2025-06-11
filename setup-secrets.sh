#!/bin/bash

# Setup script for local development
# This script creates .env files from GitHub Secrets

echo "🔐 GlobFam Secret Setup"
echo "======================="
echo ""
echo "This script helps you set up your local environment with secrets."
echo ""

# Check if .env already exists
if [ -f "globfam-mobile/.env" ]; then
    echo "⚠️  .env file already exists. Do you want to overwrite it? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "Exiting without changes."
        exit 0
    fi
fi

# Create .env file
echo "Creating .env file for mobile app..."
cat > globfam-mobile/.env << 'EOF'
# Firebase Configuration
# Replace these with your actual Firebase credentials
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EOF

echo ""
echo "✅ .env file created!"
echo ""
echo "📝 Next steps:"
echo "1. Get your Firebase config from https://console.firebase.google.com"
echo "2. Edit globfam-mobile/.env with your actual credentials"
echo "3. Never commit the .env file to Git!"
echo ""
echo "🔒 For production/CI:"
echo "Add these secrets to GitHub Secrets:"
echo "  - FIREBASE_API_KEY"
echo "  - FIREBASE_AUTH_DOMAIN"
echo "  - FIREBASE_PROJECT_ID"
echo "  - FIREBASE_STORAGE_BUCKET"
echo "  - FIREBASE_MESSAGING_SENDER_ID"
echo "  - FIREBASE_APP_ID"