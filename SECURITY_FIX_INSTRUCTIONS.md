# Security Fix Instructions - Exposed API Keys

## 🚨 IMMEDIATE ACTIONS REQUIRED

### 1. **Revoke Firebase API Keys** (DO THIS NOW!)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your "globfam-d471a" project
3. Go to Project Settings → General
4. Scroll to "Your apps" → Web app
5. Click "Config" and regenerate new API keys
6. Update your local .env file with new keys

### 2. **Remove Sensitive Data from Git History**

Since the keys are already in your git history, you need to remove them:

```bash
# Option 1: If you haven't pushed many commits after the exposure
# Create a new branch without the bad commit
git checkout -b clean-main a7c4156  # Last commit before firebase.ts was added
git cherry-pick ed9f1df..HEAD  # Apply all commits after the bad one

# Option 2: Use BFG Repo Cleaner (recommended for thorough cleaning)
# First, install BFG
brew install bfg

# Clean the repository
bfg --delete-files firebase.ts
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push to remote (WARNING: This rewrites history)
git push --force-with-lease origin main
```

### 3. **Current State Fixed**
✅ Created .env file with your Firebase config
✅ Updated firebase.ts to use environment variables
✅ .env is already in .gitignore
✅ Updated .env.example for documentation

### 4. **Best Practices Going Forward**

1. **Never commit API keys directly in code**
2. **Always use environment variables**
3. **Add .env to .gitignore BEFORE adding secrets**
4. **Use .env.example files for documentation**
5. **Enable GitHub secret scanning alerts**

### 5. **For Your Demo on Monday**
- The app will still work with the current keys until you revoke them
- After revoking, update your .env file with new keys
- The demo mode doesn't use Firebase, so it's unaffected

### 6. **GitHub Security Best Practices**
1. Enable GitHub secret scanning in your repo settings
2. Set up branch protection rules
3. Use GitHub Secrets for CI/CD (not local .env files)

### 7. **Additional Security Measures**
1. **Restrict Firebase API keys** in Google Cloud Console:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - APIs & Services → Credentials
   - Click on your API key
   - Add application restrictions (HTTP referrers for web)
   - Add API restrictions (only Firebase services)

2. **Set up Firebase Security Rules**:
   ```javascript
   // Firestore rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

### 8. **Verify Everything is Secure**
```bash
# Check that no secrets are in your current code
git grep "AIza"  # Should return nothing
git grep "apiKey.*="  # Should only show environment variable usage

# Verify .env is ignored
git status  # .env should not appear
```

## ⚠️ IMPORTANT NOTES
- Your current API key `AIzaSyCdPhRXv34mjugsptYs0XBseaatk7iLfbo` is compromised
- Anyone can use it to access your Firebase project
- Revoke it IMMEDIATELY and generate new keys
- The exposed key is in commit 8b17c4f