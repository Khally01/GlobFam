#!/bin/bash

cd /Users/khally/Projects/GlobFam/globfam-saas

# Add all the TypeScript fixes
git add apps/web/src/lib/api/client.ts
git add apps/web/src/store/auth.ts
git add apps/web/src/app/\(dashboard\)/layout.tsx
git add apps/web/src/components/import/import-modal.tsx

# Commit all TypeScript fixes
git commit -m "Fix remaining TypeScript issues in frontend

- Add browser environment checks for localStorage access
- Fix headers type in API client with proper type assertion
- Fix auth store to check window before localStorage
- Fix dashboard layout localStorage access
- Add type assertion for dynamic row property access in import modal
- Prevent SSR errors with localStorage

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to trigger deployment
git push

echo "All TypeScript fixes committed and pushed!"