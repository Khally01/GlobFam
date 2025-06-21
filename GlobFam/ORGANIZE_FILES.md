# File Organization Plan

## Files to Move to GlobFam Folder

### 📂 01-Documentation/deployment/
Move these files:
- `/Users/khally/Projects/RAILWAY_SETUP_GUIDE.md`
- `/Users/khally/Projects/DEPLOYMENT_STEPS.md`
- `/Users/khally/Projects/deploy-web-to-railway.md`
- `/Users/khally/Projects/deploy-web-to-vercel.md`
- `/Users/khally/Projects/RAILWAY_CHECKLIST.md`
- `/Users/khally/Projects/SIMPLE_DEPLOY.md`

### 📂 01-Documentation/troubleshooting/
Move these files:
- `/Users/khally/Projects/SIGNUP_TROUBLESHOOTING.md`
- `/Users/khally/Projects/SIGNUP_FIX_CHECKLIST.md`

### 📂 01-Documentation/setup/
Move these files:
- `/Users/khally/Projects/GITHUB_SETTINGS_CHECK.md`
- `/Users/khally/Projects/api-dependencies-update.txt`

### 📂 02-Scripts/deployment/
Move these scripts:
- `/Users/khally/Projects/deploy-api-separately.sh`
- `/Users/khally/Projects/prepare-for-deployment.sh`

### 📂 02-Scripts/fixes/
Move these scripts:
- `/Users/khally/Projects/fix-deployment.sh`
- `/Users/khally/Projects/fix-nixpacks.sh`
- `/Users/khally/Projects/fix-web-deps.sh`

### 📂 02-Scripts/setup/
Move these scripts:
- `/Users/khally/Projects/create-github-repo.sh`
- `/Users/khally/Projects/start-globfam.sh`
- `/Users/khally/Projects/start-globfam-fixed.sh`

### 📂 02-Scripts/testing/
Move these scripts:
- `/Users/khally/Projects/test-api.sh`
- `/Users/khally/Projects/test-signup.sh`

### 📂 04-Archive/
Move the old standalone API:
- `/Users/khally/Projects/globfam-api-standalone/` (entire folder)

## Commands to Organize

```bash
# Create all directories
mkdir -p /Users/khally/Projects/GlobFam/{01-Documentation/{deployment,troubleshooting,setup},02-Scripts/{deployment,fixes,setup,testing},03-Source-Code,04-Archive}

# Move documentation files
mv /Users/khally/Projects/RAILWAY_*.md /Users/khally/Projects/GlobFam/01-Documentation/deployment/
mv /Users/khally/Projects/DEPLOYMENT_*.md /Users/khally/Projects/GlobFam/01-Documentation/deployment/
mv /Users/khally/Projects/deploy-*.md /Users/khally/Projects/GlobFam/01-Documentation/deployment/
mv /Users/khally/Projects/SIMPLE_DEPLOY.md /Users/khally/Projects/GlobFam/01-Documentation/deployment/

mv /Users/khally/Projects/SIGNUP_*.md /Users/khally/Projects/GlobFam/01-Documentation/troubleshooting/

mv /Users/khally/Projects/GITHUB_*.md /Users/khally/Projects/GlobFam/01-Documentation/setup/
mv /Users/khally/Projects/api-dependencies-update.txt /Users/khally/Projects/GlobFam/01-Documentation/setup/

# Move scripts
mv /Users/khally/Projects/deploy-api-separately.sh /Users/khally/Projects/GlobFam/02-Scripts/deployment/
mv /Users/khally/Projects/prepare-for-deployment.sh /Users/khally/Projects/GlobFam/02-Scripts/deployment/

mv /Users/khally/Projects/fix-*.sh /Users/khally/Projects/GlobFam/02-Scripts/fixes/

mv /Users/khally/Projects/create-github-repo.sh /Users/khally/Projects/GlobFam/02-Scripts/setup/
mv /Users/khally/Projects/start-globfam*.sh /Users/khally/Projects/GlobFam/02-Scripts/setup/

mv /Users/khally/Projects/test-*.sh /Users/khally/Projects/GlobFam/02-Scripts/testing/

# Move old code to archive
mv /Users/khally/Projects/globfam-api-standalone /Users/khally/Projects/GlobFam/04-Archive/
```