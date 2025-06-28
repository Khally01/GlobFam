# Railway Monorepo Configuration

## Important: Railway Service Configuration

For this monorepo to work with Railway, you need to configure each service properly in the Railway dashboard.

### Setting Up Services in Railway

#### 1. API Service Configuration
In Railway dashboard for your API service:
1. Go to Settings → General
2. Set **Root Directory**: `/apps/api`
3. Save changes

This tells Railway to use `/apps/api` as the build context, so `Dockerfile` refers to `/apps/api/Dockerfile`.

#### 2. Web Service Configuration  
In Railway dashboard for your Web service:
1. Go to Settings → General
2. Set **Root Directory**: `/apps/web`
3. Save changes

This tells Railway to use `/apps/web` as the build context, so `Dockerfile` refers to `/apps/web/Dockerfile`.

## Alternative: Using Nixpacks

If Docker continues to have issues, you can revert to Nixpacks:

### API Service (apps/api/railway.toml)
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

### Web Service (apps/web/railway.json)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

## Verification Steps

1. Ensure each service in Railway has the correct root directory set
2. Verify the Dockerfile exists in each app directory:
   - `/apps/api/Dockerfile`
   - `/apps/web/Dockerfile`
3. Check that railway.toml/railway.json are in the same directories as the Dockerfiles

## Common Issues

### "Dockerfile does not exist" Error
This usually means:
1. Root directory is not set in Railway service settings
2. Dockerfile path in railway config is incorrect
3. Dockerfile is missing from the app directory

### Memory Issues
If you still get OOM errors, consider:
1. Increasing the service plan in Railway
2. Further optimizing the Dockerfiles
3. Using Nixpacks with the optimized configurations

## Support Links

- [Railway Monorepo Docs](https://docs.railway.app/deploy/monorepo)
- [Railway Docker Support](https://docs.railway.app/deploy/dockerfiles)
- [Railway Root Directory Setting](https://docs.railway.app/deploy/builds#root-directory)