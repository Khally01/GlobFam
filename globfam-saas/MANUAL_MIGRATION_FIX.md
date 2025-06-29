# Manual Migration Fix Instructions

I've created a temporary endpoint to fix your database migrations. Here's what to do:

## Step 1: Push the Code

Since git push isn't working from here, you need to:

1. Open a new terminal
2. Navigate to your project:
   ```bash
   cd /Users/khally/Projects/GlobFam
   ```
3. Push the changes:
   ```bash
   git push origin main
   ```

If that doesn't work, try:
```bash
git push
```

## Step 2: Wait for Railway to Deploy

1. Go to https://railway.app
2. Watch your GlobFam project
3. Wait for the new deployment to finish (usually 2-3 minutes)
4. Look for the green checkmark

## Step 3: Run the Migration Fix

Once deployed, open this URL in your browser:

```
https://globfam-v1.up.railway.app/api/temp/fix-migrations-temporary-endpoint-remove-after-use?key=fix-globfam-migrations-2024
```

This will:
- Check current migration status
- Apply both migrations
- Show you the results

## Step 4: Test Registration

After the fix, test registration:

```bash
curl -X POST https://globfam-v1.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456!",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Family"
  }'
```

## Step 5: Remove the Temporary Code

After confirming it works:

1. Delete these files:
   - `/apps/api/src/routes/fix-migrations.ts`
   - Remove the import and route from `/apps/api/src/index.ts`

2. Commit and push:
   ```bash
   git add -A
   git commit -m "Remove temporary migration fix"
   git push
   ```

## What the Endpoint Does

The temporary endpoint runs these commands on your Railway server:
1. `prisma migrate status` - Check current status
2. `prisma migrate resolve --applied "20250617223112_init"` - Mark first migration as applied
3. `prisma migrate resolve --applied "20250625000000_add_budget_models"` - Mark second migration as applied
4. `prisma migrate status` - Verify the fix worked

## If It Doesn't Work

Check the Railway logs for any errors. The endpoint will return detailed information about what happened.

## Alternative Manual Method

If the endpoint doesn't work, you can try the Railway CLI locally with your database URL:

1. Get your database URL from Railway dashboard
2. Run locally:
   ```bash
   DATABASE_URL="your-database-url" npx prisma migrate resolve --applied "20250617223112_init"
   DATABASE_URL="your-database-url" npx prisma migrate resolve --applied "20250625000000_add_budget_models"
   ```