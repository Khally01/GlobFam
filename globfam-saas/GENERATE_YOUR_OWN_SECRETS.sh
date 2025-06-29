#!/bin/bash

echo "🔐 Generating YOUR OWN secure secrets for GlobFam"
echo "================================================="
echo ""
echo "These are generated locally on YOUR machine only!"
echo "No one else can see these values."
echo ""

echo "JWT_SECRET:"
openssl rand -base64 32
echo ""

echo "JWT_REFRESH_SECRET:"
openssl rand -base64 32
echo ""

echo "ENCRYPTION_KEY:"
openssl rand -base64 32
echo ""

echo "================================================="
echo "✅ Copy these values to Railway immediately!"
echo "⚠️  Save them in a password manager!"
echo "🚫 Never share these with anyone!"
echo "================================================="