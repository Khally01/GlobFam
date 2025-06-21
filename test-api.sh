#!/bin/bash

echo "🧪 Testing GlobFam API..."

API_URL="https://globfam-v1.up.railway.app"

echo ""
echo "1. Testing health endpoint:"
curl -s "$API_URL/health" | jq '.' || curl -s "$API_URL/health"

echo ""
echo "2. Testing root endpoint:"
curl -s "$API_URL/" 

echo ""
echo "3. Testing API info:"
curl -s "$API_URL/api" 

echo ""
echo "✅ Your API is working! It's just an API (no UI)."
echo ""
echo "📋 Available endpoints:"
echo "- $API_URL/health - Health check"
echo "- $API_URL/api/auth/register - Register new user"
echo "- $API_URL/api/auth/login - Login"
echo "- $API_URL/api/users - User endpoints"
echo "- $API_URL/api/assets - Asset management"
echo "- $API_URL/api/transactions - Transactions"
echo "- $API_URL/api/families - Family management"