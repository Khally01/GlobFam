# 🔍 GitHub Settings Checklist

## 1. Repository Settings (github.com/Khally01/GlobFam)

### General Settings
- **Default Branch**: Should be `main` (not master)
- **Visibility**: Private or Public (your choice)

### Branches
- Go to Settings → Branches
- **Default branch**: Ensure it's `main`
- **Branch protection**: Not required for deployment

## 2. Required Files in Repository

### ✅ Must Have:
```
/apps/api/
  ├── package.json ✓
  ├── package-lock.json ✓ (CRITICAL for Railway)
  ├── tsconfig.json ✓
  ├── prisma/
  │   └── schema.prisma ✓
  └── src/
      └── index.ts ✓
```

### ❌ Should NOT Have (we removed these):
- `/railway.json` at root (conflicts)
- `/Dockerfile` at root (conflicts)
- `/nixpacks.toml` at root

## 3. GitHub Actions (Not Required)
- Railway deploys automatically on push
- No GitHub Actions needed

## 4. Secrets (Not Required)
- All secrets go in Railway, not GitHub
- Don't commit `.env` files

## 5. Files to Check Before Pushing

### The `.gitignore` should include:
```
node_modules/
.env
.env.local
dist/
*.log
```

### Make sure these are NOT in Git:
- `.env` files
- `node_modules/` folders
- `dist/` folders

## 🚨 Common GitHub Issues:

### 1. Package-lock.json Missing
Railway NEEDS package-lock.json. If missing:
```bash
cd apps/api
npm install
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### 2. Wrong Branch
Railway might be watching wrong branch:
```bash
git branch  # Check current branch
git checkout main  # Switch to main if needed
```

### 3. Files Not Pushed
Check what's committed:
```bash
git status
git log --oneline -5  # See recent commits
```

## 🔧 Quick Fixes:

### Ensure package-lock.json exists:
```bash
ls apps/api/package-lock.json
```

### Check .gitignore:
```bash
cat .gitignore
```

### Verify branch:
```bash
git branch --show-current
```

## 📋 Before Deploying to Railway:
1. ✅ Is package-lock.json committed?
2. ✅ Are you on `main` branch?
3. ✅ Is `.env` NOT in repository?
4. ✅ Did you push latest changes?

## 🚀 Push Latest Changes:
```bash
git push origin main
```