# Fix Database Migration - Step by Step Guide

## Step 1: Access Railway PostgreSQL Console

### Option A: Using Railway CLI (Recommended)
1. First, install Railway CLI if you haven't:
   ```bash
   brew install railway
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Link to your project:
   ```bash
   cd /Users/khally/Projects/GlobFam/globfam-saas/apps/api
   railway link
   ```

4. Connect to your service:
   ```bash
   railway run npx prisma migrate status
   ```

### Option B: Using Railway Dashboard
1. Go to https://railway.app
2. Click on your project
3. Click on your API service
4. Go to "Settings" tab
5. Scroll to "Deploy" section
6. Click "Connect" button next to "Railway CLI"

## Step 2: Check Current Migration Status

Run this command to see what's happening:
```bash
railway run npx prisma migrate status
```

This will show you which migrations Prisma thinks are applied.

## Step 3: Baseline the Database

### Option 1: If the database has the correct schema already
Run these commands one by one:

```bash
# First migration
railway run npx prisma migrate resolve --applied "20250617223112_init"

# Second migration  
railway run npx prisma migrate resolve --applied "20250625000000_add_budget_models"
```

### Option 2: If you want to start fresh (WARNING: Deletes all data!)
```bash
railway run npx prisma migrate reset --force
```

## Step 4: Verify Migrations Are Fixed

Check status again:
```bash
railway run npx prisma migrate status
```

You should see both migrations marked as "applied".

## Step 5: Test User Registration

Use this curl command (replace YOUR_API_URL with your Railway URL):

```bash
curl -X POST https://YOUR_API_URL.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@globfam.app",
    "password": "Test123456!",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Family"
  }'
```

Expected successful response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "test@globfam.app",
      "firstName": "Test",
      "lastName": "User"
    },
    "token": "..."
  }
}
```

## Troubleshooting

### If Railway CLI doesn't work:
1. Go to Railway dashboard
2. Click your PostgreSQL database
3. Go to "Connect" tab
4. Copy the DATABASE_URL
5. Run locally with that URL:
   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate resolve --applied "20250617223112_init"
   ```

### If migrations still fail:
1. Check if tables exist:
   ```bash
   railway run npx prisma db pull
   ```
   This will show you the current database schema

2. If schema matches but migrations won't apply:
   ```bash
   # Force create migration history table
   railway run npx prisma migrate deploy --create-only
   ```

## Next Steps After Fixing

1. Restart your API service in Railway
2. Check logs to ensure no migration errors
3. Test creating a user
4. Test logging in with the created user