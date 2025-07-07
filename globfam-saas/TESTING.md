# Testing & Deployment Guide for GlobFam

## 🚀 Quick Start Commands

```bash
# Before any commit
npm run precommit

# Test production build locally
npm run preview

# Validate environment variables
npm run validate-env

# Quick local test
npm run test:local
```

## 📋 Pre-Deployment Checklist

### 1. Local Testing
- [ ] Run `npm run precommit` - all checks must pass
- [ ] Test login/logout flow
- [ ] Add a test transaction
- [ ] Check responsive design
- [ ] Open browser console - no errors

### 2. Environment Validation
```bash
npm run validate-env
```
This will show you which environment variables are missing.

### 3. Preview Testing
```bash
npm run preview
```
Then open http://localhost:3000 to test the production build.

## 🐛 Debug Tools

### Development Debug Page
Visit `/debug` in development to see:
- Environment variable status
- API health checks
- Supabase connection status
- Browser information

### API Testing
- `/api/health` - Basic health check
- `/api/test` - Detailed test endpoint

### Console Commands
```javascript
// Clear all data
localStorage.clear()

// Check auth state
console.log(document.cookie)

// Test API
fetch('/api/health').then(r => r.json()).then(console.log)
```

## 🔄 Deployment Process

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and test
npm run dev

# Before committing
npm run precommit

# Commit if all passes
git add .
git commit -m "feat: your feature"
git push origin feature/your-feature
```

### 2. Pull Request
- Creates automatic preview deployment
- GitHub Actions run all checks
- Preview URL posted as comment
- Test in preview before merging

### 3. Production Deploy
- Merge PR to main
- Automatic deployment to Vercel
- Monitor deployment logs

## 🔍 Common Issues & Solutions

### Build Failures
1. **TypeScript errors**
   ```bash
   npm run type-check
   ```
   Fix any type errors before committing.

2. **Lint errors**
   ```bash
   npm run lint
   ```
   Fix formatting issues.

3. **Missing environment variables**
   - Check Vercel dashboard
   - Ensure all required vars are set
   - Use `npm run validate-env`

### Runtime Errors
1. **Blank page**
   - Check browser console
   - Visit `/api/health`
   - Check Supabase connection

2. **Login not working**
   - Verify Supabase credentials
   - Check network tab for 404s
   - Test `/api/test` endpoint

3. **Features missing**
   - Check environment variables
   - Verify API routes are accessible
   - Check error boundaries

## 📊 Monitoring

### Error Tracking
The app includes error boundaries that catch React errors. In development, you'll see detailed error information.

### Performance
- Check Vercel Analytics
- Monitor build times
- Track API response times

### Debugging Production
1. Check Vercel Function logs
2. Use browser DevTools
3. Check Network tab for failed requests
4. Monitor console for errors

## 🎯 Best Practices

1. **Always run `npm run precommit` before pushing**
2. **Test in preview URL before merging**
3. **Keep PRs small and focused**
4. **Write descriptive commit messages**
5. **Test on mobile devices**
6. **Check for console errors**
7. **Validate forms work correctly**
8. **Test error states**

## 🛠 Useful Scripts

### Reset Local Environment
```bash
# Clear all local data
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

### Test Supabase Connection
```bash
# In browser console
fetch('/api/test').then(r => r.json()).then(console.log)
```

### Check Build Size
```bash
npm run build
# Check the output for bundle sizes
```

## 📱 Mobile Testing

1. Use Chrome DevTools device mode
2. Test on real devices when possible
3. Check touch interactions
4. Verify responsive layouts
5. Test offline behavior

## 🔐 Security Checks

Before deploying:
1. No hardcoded secrets
2. Environment variables properly set
3. API routes protected
4. Input validation working
5. Error messages don't leak sensitive info

---

Remember: **When in doubt, test in preview first!**