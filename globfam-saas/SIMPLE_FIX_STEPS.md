# Simple Steps to Fix Database - Railway Dashboard Method

## Step 1: Open Railway Dashboard
1. Go to: https://railway.app
2. Log in if needed
3. Click on your "GlobFam" project

## Step 2: Access the Railway Shell
1. Click on your API service (should show as "globfam-v1")
2. Look for one of these options:
   - A "Terminal" icon (looks like >_)
   - A "Shell" button
   - A "Console" tab

If you don't see any shell option:
1. Go to the "Settings" tab
2. Scroll down to "Deploy" section
3. Look for "Enable Shell" or "Command" option

## Step 3: Run the Fix Commands

Once in the shell, copy and paste these commands ONE AT A TIME:

```bash
# Command 1: Check where you are
pwd
```

```bash
# Command 2: Check migration status
npx prisma migrate status
```

```bash
# Command 3: Fix first migration
npx prisma migrate resolve --applied "20250617223112_init"
```

```bash
# Command 4: Fix second migration
npx prisma migrate resolve --applied "20250625000000_add_budget_models"
```

```bash
# Command 5: Verify it worked
npx prisma migrate status
```

## Step 4: Test Registration

After running the commands, test with this (run from your local terminal):

```bash
curl -X POST https://globfam-v1.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@globfam.app",
    "password": "Test123456!",
    "firstName": "Test",
    "lastName": "User",
    "organizationName": "Test Family"
  }'
```

## Expected Success Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "email": "testuser@globfam.app",
      "firstName": "Test",
      "lastName": "User"
    }
  }
}
```

## Alternative: If No Shell Access

If you can't access the shell, we'll need to:
1. Create a temporary endpoint to run the migrations
2. Or temporarily modify the startup script

Let me know if you can't find the shell option!