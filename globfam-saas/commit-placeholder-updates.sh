#!/bin/bash

cd /Users/khally/Projects/GlobFam/globfam-saas

# Add the updated files
git add apps/web/src/app/\(auth\)/register/page.tsx
git add apps/web/src/app/\(auth\)/login/page.tsx

# Commit the changes
git commit -m "Update form placeholders to use generic examples

- Change registration form placeholders to generic names (John Smith, Smith Family)
- Update login email placeholder to you@example.com
- Remove personal information from example text

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to trigger deployment
git push

echo "Placeholder updates committed and pushed!"