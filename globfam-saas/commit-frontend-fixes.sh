#!/bin/bash

cd /Users/khally/Projects/GlobFam/globfam-saas

# Add all the fixed files
git add apps/web/src/app/\(dashboard\)/dashboard/analytics/page.tsx
git add apps/web/src/app/\(dashboard\)/dashboard/budget/page.tsx
git add apps/web/src/components/ai/categorize-modal.tsx

# Commit the fixes
git commit -m "Fix TypeScript errors in frontend API responses

- Fix analytics page Bar chart to use Cell component for dynamic colors
- Add type assertions for API responses to handle backend response structure
- Fix budget page API response access
- Fix AI categorization modal response access

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to trigger deployment
git push

echo "Frontend fixes committed and pushed!"