#!/bin/bash

cd /Users/khally/Projects/GlobFam/globfam-saas

# Add the import modal fix
git add apps/web/src/components/import/import-modal.tsx

# Add previously fixed files if not committed
git add apps/web/src/app/\(dashboard\)/dashboard/analytics/page.tsx
git add apps/web/src/app/\(dashboard\)/dashboard/budget/page.tsx
git add apps/web/src/components/ai/categorize-modal.tsx

# Commit all TypeScript fixes
git commit -m "Fix TypeScript type errors in frontend

- Fix FilePreview interface to match ImportPreview with optional suggestedMapping
- Fix analytics page Bar chart color handling with Cell component
- Add type assertions for API response handling
- Fix budget page API response access patterns

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to trigger deployment
git push

echo "TypeScript fixes committed and pushed!"