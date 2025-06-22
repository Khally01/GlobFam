#!/bin/bash

cd /Users/khally/Projects/GlobFam/globfam-saas

# Add the headers fix
git add apps/web/src/lib/api/client.ts

# Commit the fix
git commit -m "Fix TypeScript error in API client headers

- Change defaultHeaders type from HeadersInit to Record<string, string>
- Add type assertion and null check for options.headers
- Fixes 'Property Content-Type does not exist on type HeadersInit' error

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to trigger deployment
git push

echo "Headers fix committed and pushed!"