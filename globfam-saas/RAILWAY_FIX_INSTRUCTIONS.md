# Railway Database Fix Instructions

Since we can't access the internal database URL from your local machine, we need to run the commands directly on Railway.

## Option 1: Using Railway Web Console (Easiest)

1. **Open Railway Dashboard**
   - Go to https://railway.app
   - Click on your GlobFam project

2. **Open Railway Shell**
   - Click on your API service (not the database)
   - Look for the "Shell" or "Console" button (usually in the top right)
   - If you don't see it, go to Settings → Deploy → Enable Shell

3. **Run These Commands One by One**
   ```bash
   # First, check what directory you're in
   pwd
   
   # If not in /app, navigate there
   cd /app
   
   # Check migration status
   npx prisma migrate status
   
   # Apply first migration
   npx prisma migrate resolve --applied "20250617223112_init"
   
   # Apply second migration
   npx prisma migrate resolve --applied "20250625000000_add_budget_models"
   
   # Verify it worked
   npx prisma migrate status
   ```

## Option 2: Create a One-Time Fix Service

1. **Temporarily modify your start script**
   - In Railway, go to your API service
   - Go to Variables
   - Add a new variable: `FIX_MIGRATIONS=true`

2. **Create a temporary start script**
   ```bash
   # In your local files
   cd /Users/khally/Projects/GlobFam/globfam-saas/apps/api
   ```

3. **Edit start-production.sh** to add at the beginning:
   ```bash
   if [ "$FIX_MIGRATIONS" = "true" ]; then
     echo "Running migration fix..."
     ./fix-migrations.sh
     exit 0
   fi
   ```

4. **Deploy and Remove**
   - Commit and push the changes
   - Let it deploy and run
   - Remove the FIX_MIGRATIONS variable
   - The next deploy will run normally

## Option 3: Using Railway Run Command

Try this command from your local machine:
```bash
railway run --service api -- npx prisma migrate resolve --applied "20250617223112_init"
railway run --service api -- npx prisma migrate resolve --applied "20250625000000_add_budget_models"
```

## Testing After Fix

Once migrations are fixed, test with:

```bash
# Replace globfam-v1-production.up.railway.app with your actual URL
curl -X POST https://globfam-v1-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@globfam.app",
    "password": "Test123456!",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Family"
  }'
```

## What Should Happen

After running the migration fix:
1. The error "P3005 - The database schema is not empty" should disappear
2. Both migrations should show as "Applied" in status
3. User registration should work
4. No more migration errors in logs