# Railway Deployment Error Fixes

## Errors Fixed

### 1. Backend API - json2csv Version Error
**Error**: `No matching version found for json2csv@^6.0.0`
**Fix**: Changed to `json2csv@^5.0.7` in package.json

### 2. Frontend - Missing dropdown-menu Component
**Error**: `Module not found: Can't resolve '@/components/ui/dropdown-menu'`
**Fix**: Created the missing dropdown-menu.tsx component

### 3. npm ci vs npm install
**Issue**: `npm ci` requires exact lock file match
**Fix**: Changed all build commands to use `npm install --legacy-peer-deps`

## Files Modified

### Backend API
- `apps/api/package.json` - Updated json2csv version
- `apps/api/nixpacks.toml` - Changed npm ci to npm install
- `apps/api/railway.toml` - Changed npm ci to npm install

### Frontend Web
- `apps/web/src/components/ui/dropdown-menu.tsx` - Created new component
- `apps/web/railway.json` - Added --legacy-peer-deps flag

## Next Steps

1. **Regenerate lock files locally**:
   ```bash
   cd apps/api && rm package-lock.json && npm install
   cd ../web && rm package-lock.json && npm install
   ```

2. **Test builds locally**:
   ```bash
   cd apps/api && npm run build
   cd ../web && npm run build
   ```

3. **Commit and push**:
   ```bash
   git add -A
   git commit -m "Fix deployment errors: json2csv version and missing dropdown-menu"
   git push
   ```

4. **Railway will automatically redeploy**

## Additional Notes

- Using `npm install` instead of `npm ci` is more forgiving with dependency resolution
- The `--legacy-peer-deps` flag helps with React 18 peer dependency conflicts
- The dropdown-menu component follows the same pattern as other UI components

## Verification

After deployment, verify:
1. API health check: `https://api-url/health`
2. Web app loads without errors
3. Dropdown menus work in budget categories and export features