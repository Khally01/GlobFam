#!/bin/bash

cd /Users/khally/Projects/GlobFam/globfam-saas

# Add the dialog fix
git add apps/web/src/components/ui/dialog.tsx

# Commit the fix
git commit -m "Fix DialogPortal TypeScript error

- Remove className prop from DialogPortal as Radix UI Portal doesn't support it
- Simplify DialogPortal to directly use DialogPrimitive.Portal

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to trigger deployment
git push

echo "Dialog fix committed and pushed!"