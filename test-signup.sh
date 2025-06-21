#!/bin/bash

# Test script for debugging signup issues
echo "🔍 Testing GlobFam Signup Flow..."

API_URL="https://globfam-v1.up.railway.app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "1. Testing API Health:"
echo "----------------------"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$API_URL/health")
HTTP_STATUS=$(echo "$HEALTH_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$HEALTH_RESPONSE" | grep -v "HTTP_STATUS")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ API is healthy${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}✗ API health check failed (Status: $HTTP_STATUS)${NC}"
    echo "Response: $BODY"
fi

echo ""
echo "2. Testing Register Endpoint:"
echo "-----------------------------"
# Generate unique email for testing
TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@example.com"

REGISTER_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TestPass123!\",\"name\":\"Test User\"}")

HTTP_STATUS=$(echo "$REGISTER_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$REGISTER_RESPONSE" | grep -v "HTTP_STATUS")

echo "Testing with email: $TEST_EMAIL"
echo "HTTP Status: $HTTP_STATUS"
echo "Response Body: $BODY"

if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "201" ]; then
    echo -e "${GREEN}✓ Registration endpoint is working${NC}"
elif [ "$HTTP_STATUS" = "400" ]; then
    echo -e "${YELLOW}⚠ Bad Request - Check validation requirements${NC}"
elif [ "$HTTP_STATUS" = "409" ]; then
    echo -e "${YELLOW}⚠ Conflict - Email might already exist${NC}"
elif [ "$HTTP_STATUS" = "500" ]; then
    echo -e "${RED}✗ Internal Server Error - Check Railway logs${NC}"
elif [ "$HTTP_STATUS" = "000" ]; then
    echo -e "${RED}✗ Could not connect to API${NC}"
else
    echo -e "${RED}✗ Unexpected status code: $HTTP_STATUS${NC}"
fi

echo ""
echo "3. Testing CORS Headers:"
echo "------------------------"
CORS_TEST=$(curl -s -I -X OPTIONS "$API_URL/api/auth/register" \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

echo "$CORS_TEST" | grep -i "access-control"

echo ""
echo "4. Common Issues to Check:"
echo "--------------------------"
echo "[ ] Is PostgreSQL service active in Railway?"
echo "[ ] Is Redis service active in Railway?"
echo "[ ] Are JWT_SECRET and JWT_REFRESH_SECRET set?"
echo "[ ] Is DATABASE_URL properly linked?"
echo "[ ] Have database migrations been run?"
echo "[ ] Is the frontend using the correct API URL?"
echo ""
echo "5. Next Steps:"
echo "--------------"
echo "1. Check Railway deployment logs for detailed errors"
echo "2. Verify environment variables in Railway dashboard"
echo "3. Test with browser DevTools Network tab open"
echo "4. Check if database tables exist (especially 'users' table)"
echo ""
echo "📝 Full test results saved above for debugging"