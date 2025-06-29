# Step-by-Step Railway Environment Variables Setup

## Step 1: Generate Your Secret Keys

Open your terminal and run these commands to generate secure secrets:

```bash
# Generate JWT_SECRET
openssl rand -base64 32
```
Example output: `sDvxF3F3vN8ma3wBj3TggcwP/cWu1gF6h45/sNSYPE8=`

```bash
# Generate JWT_REFRESH_SECRET  
openssl rand -base64 32
```
Example output: `9MOveMzJBSnHrFiOtl8iuY3hazeJvhRSJnTd4339fSk=`

```bash
# Generate ENCRYPTION_KEY
openssl rand -base64 32
```
Example output: `H68yG0gjRPcIVnTJ89rSJHOlEuwIUWOqofVqUS44x+U=`

**SAVE THESE VALUES!** You'll need them in the next steps.

## Step 2: Open Railway Dashboard

1. Go to https://railway.app
2. Click on your "GlobFam" project
3. Click on your API service (should show as "globfam-v1" or similar)

## Step 3: Add Environment Variables

1. In your API service, click on the **"Variables"** tab
2. You'll see existing variables like DATABASE_URL
3. Click **"New Variable"** or **"+ Add"** button

### Add Each Variable:

#### Variable 1: ENCRYPTION_KEY
- **Key**: `ENCRYPTION_KEY`
- **Value**: (paste your generated encryption key)
- Click ✓ or Save

#### Variable 2: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: (paste your generated JWT secret)
- Click ✓ or Save

#### Variable 3: JWT_REFRESH_SECRET
- **Key**: `JWT_REFRESH_SECRET`
- **Value**: (paste your generated JWT refresh secret)
- Click ✓ or Save

## Step 4: Add Redis Service (for REDIS_URL)

### Option A: If you already have Redis
Skip to Step 5

### Option B: Add Redis to your project

1. In your Railway project dashboard, click **"+ New"** or **"Add Service"**
2. Select **"Database"** → **"Redis"**
3. Railway will create a Redis instance
4. Click on the new Redis service
5. Go to **"Connect"** tab
6. Copy the `REDIS_URL` value

### Add REDIS_URL to your API:

1. Go back to your API service
2. Click **"Variables"** tab
3. Add new variable:
   - **Key**: `REDIS_URL`
   - **Value**: (paste the Redis URL from above)
   - Click ✓ or Save

## Step 5: Verify All Variables

Your API service should now have these variables:

```
DATABASE_URL=postgresql://... (already exists)
ENCRYPTION_KEY=<your-generated-key>
JWT_SECRET=<your-generated-secret>
JWT_REFRESH_SECRET=<your-generated-refresh-secret>
REDIS_URL=redis://... (from Redis service)
```

## Step 6: Railway Will Auto-Deploy

After adding variables:
1. Railway will automatically trigger a new deployment
2. Watch the deployment logs
3. Wait for the green checkmark (2-3 minutes)

## Step 7: Test Registration

Once deployed, test with:

```bash
curl -X POST https://globfam-v1.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "success@globfam.app",
    "password": "Test123456!",
    "firstName": "Working",
    "lastName": "User",
    "organizationName": "Railway Success"
  }'
```

Expected success response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "success@globfam.app",
      "firstName": "Working",
      "lastName": "User"
    },
    "token": "..."
  }
}
```

## Troubleshooting

If it still doesn't work, check the debug endpoint:
```
https://globfam-v1.up.railway.app/api/temp/debug-check
```

This will show you which variables are missing.

## Visual Guide

Railway Variables Tab looks like:
```
┌─────────────────────────────────────┐
│ Variables                           │
├─────────────────────────────────────┤
│ DATABASE_URL    postgresql://...    │
│ ENCRYPTION_KEY  H68yG0gjRPc...      │
│ JWT_SECRET      sDvxF3F3vN8...      │
│ JWT_REFRESH_... 9MOveMzJBSn...      │
│ REDIS_URL       redis://default...   │
│                                     │
│ [+ New Variable]                    │
└─────────────────────────────────────┘
```

## Important Notes

1. **Don't use quotes** around the values in Railway
2. **Save these secrets** in a password manager
3. **Never share** these values publicly
4. Railway will **auto-restart** your app after adding variables