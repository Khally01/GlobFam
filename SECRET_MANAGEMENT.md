# Secret Management Guide for GlobFam

## Overview
This project uses GitHub Secrets for managing sensitive credentials. Never commit API keys, passwords, or other secrets directly to the repository.

## GitHub Secrets Setup

### 1. Required Secrets
Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

| Secret Name | Description | Example |
|------------|-------------|---------|
| `FIREBASE_API_KEY` | Firebase Web API Key | AIzaSy... |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | your-app.firebaseapp.com |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | your-app-id |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | your-app.appspot.com |
| `FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID | 123456789 |
| `FIREBASE_APP_ID` | Firebase App ID | 1:123:web:abc |
| `FIREBASE_MEASUREMENT_ID` | Firebase Analytics ID | G-XXXXXXXXXX |

### 2. Local Development Setup

#### Option 1: Using the setup script
```bash
./setup-secrets.sh
# Then edit globfam-mobile/.env with your actual values
```

#### Option 2: Manual setup
1. Copy `.env.example` to `.env`
2. Fill in your actual credentials
3. Never commit the `.env` file

### 3. CI/CD Integration
The GitHub Actions workflow automatically creates .env files from secrets during builds:
- `.github/workflows/setup-env.yml` handles environment setup
- Secrets are injected securely without exposure
- Artifacts are available for download if needed

## Security Best Practices

### DO:
✅ Use GitHub Secrets for all sensitive data
✅ Use `.env` files for local development only
✅ Keep `.env` in `.gitignore`
✅ Rotate secrets regularly
✅ Use different credentials for dev/staging/prod
✅ Restrict API keys in Google Cloud Console

### DON'T:
❌ Commit `.env` files
❌ Share secrets in issues/PRs
❌ Use production secrets in development
❌ Log secret values
❌ Include secrets in error messages

## Adding New Secrets

1. Add to GitHub Secrets
2. Update `.env.example` with placeholder
3. Update `setup-env.yml` workflow
4. Document in this file

## Emergency: Exposed Secrets

If secrets are accidentally exposed:
1. Immediately revoke/regenerate the exposed credentials
2. Update GitHub Secrets with new values
3. Check git history for exposure
4. Run `git filter-branch` or BFG to clean history
5. Force push cleaned history
6. Notify team members

## Environment-Specific Configs

- **Development**: Use `.env` with test credentials
- **Staging**: Use GitHub Secrets with staging credentials
- **Production**: Use GitHub Secrets with production credentials

## Useful Commands

```bash
# Check for exposed secrets in git history
git grep -E "(api[_-]?key|password|secret|token)" $(git rev-list --all)

# List all environment variables (without values)
grep -E "^[A-Z_]+=" .env.example

# Verify .env is ignored
git check-ignore globfam-mobile/.env
```

## Resources
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase Security Best Practices](https://firebase.google.com/docs/projects/api-keys)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)