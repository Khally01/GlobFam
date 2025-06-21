#!/bin/bash

# Test script for GlobFam API
# Usage: ./test-api.sh [API_URL]

API_URL=${1:-"http://localhost:3001"}

echo "Testing GlobFam API at: $API_URL"
echo "=================================="

# Test health endpoint
echo -e "\n1. Testing health endpoint..."
curl -s "$API_URL/health" | jq . || echo "Failed to connect to API"

# Test register endpoint
echo -e "\n2. Testing register endpoint..."
TIMESTAMP=$(date +%s)
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test${TIMESTAMP}@example.com\",
    \"password\": \"testpass123\",
    \"name\": \"Test User\",
    \"organizationName\": \"Test Org ${TIMESTAMP}\"
  }")

echo "$RESPONSE" | jq . || echo "$RESPONSE"

# Check if registration was successful
if echo "$RESPONSE" | grep -q "token"; then
  echo -e "\n✅ Registration successful!"
  TOKEN=$(echo "$RESPONSE" | jq -r '.data.token')
  
  # Test authenticated endpoint
  echo -e "\n3. Testing authenticated endpoint (me)..."
  curl -s "$API_URL/api/auth/me" \
    -H "Authorization: Bearer $TOKEN" | jq .
else
  echo -e "\n❌ Registration failed. Check the error above."
fi

echo -e "\n=================================="
echo "Test complete!"