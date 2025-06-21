# Quick Fix for TypeScript Errors

## The Issues:
1. Missing type declarations for Express Request.user
2. Prisma schema missing BANK_ACCOUNT and BANK_SYNC enums
3. Import path issues
4. Type casting needed for JSON fields

## I've Already Fixed:
- ✅ Added `src/types/express.d.ts` for Request.user types
- ✅ Added `src/lib/prisma.ts` for Prisma client
- ✅ Updated schema with missing enums (BANK_ACCOUNT, BANK_SYNC)
- ✅ Fixed import paths in routes
- ✅ Fixed Map type declaration in banking service

## Run These Commands:

```bash
cd /Users/khally/Projects/GlobFam/globfam-saas/apps/api

# 1. Generate Prisma client with updated schema
npx prisma generate

# 2. Try building to see remaining errors
npm run build

# 3. If successful, commit and push
cd ../..
git add -A
git commit -m "Fix TypeScript build errors and update Prisma schema"
git push
```

## Manual Fixes Still Needed:

If you still get errors, edit these files:

1. **src/routes/import.routes.ts** - Line 91 & 150
   Change: `error`
   To: `error as Error`

2. **src/services/analytics/analytics.service.ts** - Line 417
   Change: `assets._sum.amount`
   To: `assets._sum?.amount || 0`

3. **src/services/forecasting/forecasting.service.ts** - Line 325
   Change: `liquidAssets._sum.amount`
   To: `liquidAssets._sum?.amount || 0`

Then commit and push again!