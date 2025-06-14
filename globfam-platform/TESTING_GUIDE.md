# GlobFam Testing Guide

This guide covers how to test all the features implemented in the GlobFam platform.

## Table of Contents
1. [Setup Testing Environment](#setup-testing-environment)
2. [Feature Testing](#feature-testing)
3. [API Testing](#api-testing)
4. [Integration Testing](#integration-testing)
5. [Performance Testing](#performance-testing)

## Setup Testing Environment

### 1. Start the Platform

```bash
cd globfam-platform
docker-compose up
```

Wait for all services to start (usually takes 1-2 minutes).

### 2. Run Database Migrations

```bash
docker-compose exec backend npm run db:migrate
```

### 3. Seed Test Data (Optional)

```bash
docker-compose exec backend npm run db:seed
```

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Health: http://localhost:3001/health

## Feature Testing

### 1. Authentication System

#### Registration
1. Navigate to http://localhost:3000/register
2. Fill in the form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Password: Test123!@# (must have uppercase, lowercase, number, special char)
3. Click "Create account"
4. You should be redirected to the dashboard

#### Login
1. Navigate to http://localhost:3000/login
2. Enter credentials:
   - Email: test@example.com
   - Password: Test123!@#
3. Click "Sign in"
4. Verify you're on the dashboard

#### Password Reset
1. On login page, click "Forgot password?"
2. Enter your email
3. Check console logs for reset link (email service needs configuration)

### 2. Multi-Currency Dashboard

#### Currency Switching
1. On dashboard, locate currency toggle (USD, AUD, MNT)
2. Click different currencies
3. Verify all amounts update with correct symbols:
   - USD: $
   - AUD: A$
   - MNT: ₮

#### Dashboard Cards
Verify you can see:
- Total Family Wealth
- Monthly Income
- Monthly Expenses
- Savings Rate

### 3. Money Garden (Kids Feature)

#### Access Money Garden
1. Go to Family page: http://localhost:3000/family
2. Click on a child's profile
3. Click "View Money Garden"

#### Test Interactions
1. Click on plants to water them
2. Watch for coin animations
3. Check achievement unlocks
4. Observe weather changes (sunny, rainy, rainbow)

### 4. Transaction Management

#### Create Transaction
```bash
# Using API directly
curl -X POST http://localhost:3001/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "YOUR_ACCOUNT_ID",
    "amount": 50.00,
    "currency": "USD",
    "type": "EXPENSE",
    "description": "Grocery shopping at Woolworths",
    "date": "2024-01-15"
  }'
```

#### Auto-Categorization Test
Create transactions with these descriptions to test auto-categorization:
- "Woolworths" → Should categorize as "Groceries"
- "Uber ride" → Should categorize as "Transport"
- "Salary payment" → Should categorize as "Salary"

#### View Transactions
1. Navigate to Transactions page
2. Test filters:
   - Date range
   - Transaction type (Income/Expense)
   - Search by description

### 5. Budget Management

#### Create Budget
```bash
curl -X POST http://localhost:3001/api/budgets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "familyId": "YOUR_FAMILY_ID",
    "name": "January Budget",
    "period": "MONTHLY",
    "startDate": "2024-01-01",
    "items": [
      {
        "categoryId": "GROCERIES_CATEGORY_ID",
        "amount": 500
      },
      {
        "categoryId": "TRANSPORT_CATEGORY_ID",
        "amount": 200
      }
    ]
  }'
```

#### Budget Alerts
1. Create expenses that exceed 80% of budget
2. Check for budget alert notifications
3. Verify email notifications (if configured)

### 6. Goal Tracking

#### Create Goal
1. Navigate to Goals page
2. Click "Create New Goal"
3. Fill in:
   - Name: "Emergency Fund"
   - Target Amount: $10,000
   - Target Date: 6 months from now
4. Save goal

#### Add Contribution
```bash
curl -X POST http://localhost:3001/api/goals/contribute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "goalId": "YOUR_GOAL_ID",
    "amount": 500,
    "notes": "Monthly contribution"
  }'
```

#### Test Milestones
1. Contribute amounts to reach 25%, 50%, 75%
2. Check for milestone notifications
3. Verify progress animations

### 7. Bank Integration (Plaid)

#### Connect Bank Account
1. Go to Accounts page
2. Click "Connect Bank Account"
3. Use Plaid sandbox credentials:
   - Username: user_good
   - Password: pass_good
4. Select account and confirm

#### Sync Transactions
1. After connecting, click "Sync Transactions"
2. Verify transactions appear in your transaction list
3. Check that account balances update

### 8. Exchange Rates

#### Test Currency Conversion
```bash
# Get exchange rate
curl http://localhost:3001/api/exchange/rate?from=USD&to=AUD \
  -H "Authorization: Bearer YOUR_TOKEN"

# Convert amount
curl http://localhost:3001/api/exchange/convert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "from": "USD",
    "to": "MNT"
  }'
```

### 9. Email Notifications

Test different email triggers:
1. **Welcome Email**: Register new account
2. **Transaction Alert**: Create large transaction
3. **Budget Alert**: Exceed budget limit
4. **Goal Achievement**: Complete a goal
5. **Weekly Summary**: Wait for scheduled job (or trigger manually)

### 10. Family Management

#### Create Family
```bash
curl -X POST http://localhost:3001/api/families \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "The Smith Family",
    "primaryCurrency": "USD"
  }'
```

#### Invite Member
1. Go to Family settings
2. Click "Invite Member"
3. Enter email address
4. Check for invitation email

## API Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Test Coverage
```bash
# Backend coverage
cd backend
npm test -- --coverage

# Frontend coverage
cd frontend
npm test -- --coverage
```

## Integration Testing

### Test User Journey
1. **Registration → Dashboard**
   - Register new user
   - Verify dashboard loads with default data

2. **Add Account → Transaction → Budget**
   - Create bank account
   - Add transactions
   - Create budget
   - Verify budget tracking

3. **Family Flow**
   - Create family
   - Invite members
   - Create shared goal
   - Track progress together

### API Integration Tests
```bash
# Run all integration tests
cd backend
npm run test:integration
```

## Performance Testing

### Load Testing
Use Apache Bench or similar:
```bash
# Test API endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer TOKEN" http://localhost:3001/api/transactions
```

### Monitor Performance
1. Check response times in browser DevTools
2. Monitor Docker stats: `docker stats`
3. Check Redis cache hits: `docker-compose exec redis redis-cli INFO stats`

## Common Issues & Solutions

### Issue: Cannot connect to database
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check logs
docker-compose logs postgres
```

### Issue: Transactions not syncing
```bash
# Check Plaid connection
docker-compose logs backend | grep plaid

# Manually trigger sync
curl -X POST http://localhost:3001/api/accounts/sync \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Issue: Emails not sending
1. Check SMTP configuration in .env
2. Verify email service logs
3. Check spam folder
4. Use console logs for development

### Issue: Exchange rates not updating
```bash
# Force update rates
curl -X POST http://localhost:3001/api/exchange/update \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing Checklist

- [ ] User can register and login
- [ ] Dashboard loads with correct data
- [ ] Currency switching works
- [ ] Transactions can be created and categorized
- [ ] Budgets track spending correctly
- [ ] Goals show progress and milestones
- [ ] Money Garden is interactive for kids
- [ ] Bank accounts can be connected via Plaid
- [ ] Exchange rates update and convert correctly
- [ ] Email notifications are sent
- [ ] Family members can be invited
- [ ] All API endpoints return expected data
- [ ] Frontend handles errors gracefully
- [ ] Performance is acceptable under load

## Automated Testing

### Run CI/CD Pipeline Locally
```bash
# Run GitHub Actions locally with act
act -j test-backend
act -j test-frontend
act -j lint
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks
npm run prepare

# Run hooks manually
npm run pre-commit
```

## Security Testing

### Check for vulnerabilities
```bash
# Backend
cd backend
npm audit

# Frontend
cd frontend
npm audit
```

### Test authentication
1. Try accessing protected routes without token
2. Test with expired token
3. Verify password requirements
4. Check for SQL injection in search fields

---

For production testing, always use a staging environment first!