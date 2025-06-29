#!/bin/bash

# Script to generate secure secrets for production deployment

echo "🔐 Generating secure secrets for GlobFam production deployment..."
echo ""

# Generate JWT Secret
JWT_SECRET=$(openssl rand -base64 32)
echo "JWT_SECRET=\"$JWT_SECRET\""
echo ""

# Generate JWT Refresh Secret
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
echo "JWT_REFRESH_SECRET=\"$JWT_REFRESH_SECRET\""
echo ""

# Generate Encryption Key
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "ENCRYPTION_KEY=\"$ENCRYPTION_KEY\""
echo ""

echo "✅ Secrets generated successfully!"
echo ""
echo "⚠️  IMPORTANT: Save these secrets securely and add them to your production environment."
echo "⚠️  Never commit these values to your repository!"
echo ""
echo "For Railway deployment, add these as environment variables in your Railway dashboard."
echo "For local development, add them to your .env file."