#!/bin/bash

# Navigate to project root
cd /Users/khally/Projects/GlobFam/globfam-saas

# Add all UI components
git add apps/web/src/components/ui/input.tsx
git add apps/web/src/components/ui/label.tsx
git add apps/web/src/components/ui/card.tsx
git add apps/web/src/components/ui/badge.tsx

# Add package files
git add apps/web/package.json
git add apps/web/package-lock.json

# Add API fixes
git add apps/api/src/services/import/import.service.ts
git add apps/api/src/middleware/auth.ts
git add apps/api/src/types/express.d.ts
git add apps/api/src/routes/ai.routes.ts
git add apps/api/src/routes/analytics.routes.ts
git add apps/api/src/routes/banking.routes.ts
git add apps/api/src/routes/forecasting.routes.ts
git add apps/api/src/routes/goals.routes.ts
git add apps/api/src/routes/import.routes.ts

# Show what will be committed
git status

# Commit
git commit -m "Add missing UI components and fix build errors

- Add input, label, card, badge UI components
- Add @radix-ui/react-progress dependency
- Fix TypeScript errors in API services and routes
- Update package-lock.json

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push

echo "Done! Check Railway for deployment status."