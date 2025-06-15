# Fresh Railway Deployment Guide

## Option 1: Deploy Backend Only First (Recommended)

This is the simplest approach - get the backend working first, then add frontend.

### Step 1: Create a new Railway project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository

### Step 2: Configure Railway

In Railway dashboard:

1. **Set Root Directory**: `globfam-platform/backend`
2. **Add PostgreSQL**: Click "New" → "Database" → "PostgreSQL"
3. **Add Redis**: Click "New" → "Database" → "Redis"

### Step 3: Set Environment Variables

Click on your service → Variables → Add these:

```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-secret-key-here-32-chars
JWT_REFRESH_SECRET=another-secret-key-here-32-chars
```

The DATABASE_URL and REDIS_URL will be automatically added by Railway.

### Step 4: Deploy

Railway will automatically deploy. The backend should work!

---

## Option 2: Use Separate Services (Better Architecture)

### Backend Service:
1. Create new Railway project
2. Set root directory: `globfam-platform/backend`
3. Railway will auto-detect Node.js and deploy

### Frontend Service:
1. Use Vercel for frontend (easier)
2. Connect GitHub repo
3. Set root directory: `globfam-platform/frontend`
4. Set environment variable: `VITE_API_URL=https://your-backend.railway.app`

---

## Option 3: Simple All-in-One (Quick Test)

Create this simple `railway.json` in your repo root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "nixpacksConfigPath": "railway.toml"
  },
  "deploy": {
    "startCommand": "cd globfam-platform/backend && npm start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

And this `railway.toml`:

```toml
[phases.setup]
nixPkgs = ["nodejs-20_x", "postgresql"]

[phases.install]
cmds = ["cd globfam-platform/backend && npm install --force"]

[phases.build]
cmds = ["cd globfam-platform/backend && npm run build"]

[start]
cmd = "cd globfam-platform/backend && npx prisma migrate deploy && npm start"
```

---

## Why Fresh Start is Better:

1. **Clean slate** - No cached build issues
2. **Simpler setup** - Backend only first
3. **Easier debugging** - One service at a time
4. **Better architecture** - Separate frontend/backend

## Recommended Approach:

1. **Delete current Railway project**
2. **Create new project** 
3. **Deploy backend only** (Option 1)
4. **Use Vercel for frontend**

This separates concerns and is much easier to manage!