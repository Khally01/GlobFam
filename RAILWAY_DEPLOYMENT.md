# Railway Deployment Guide for GlobFam Platform

## Overview

This guide explains how to deploy the GlobFam platform (not the pitch presentation) to Railway.

## Project Structure

The repository has the following structure:
```
globfam/
├── index.html              # Pitch presentation (we don't want this)
├── sales-pitch.html        # Sales pitch (we don't want this)
├── globfam-platform/       # The actual platform (THIS is what we deploy)
│   ├── backend/           # Express.js API server
│   ├── frontend/          # React application
│   └── package.json       # Platform scripts
└── railway.json           # Railway configuration
```

## Railway Configuration

The `railway.json` file in the root directory is configured to:

1. Build both backend and frontend from the `globfam-platform` directory
2. Run database migrations
3. Start both services using `concurrently`

## Deployment Steps

1. **Connect to Railway**
   ```bash
   railway link
   ```

2. **Set Environment Variables**
   Required environment variables:
   ```
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   JWT_SECRET=your-secret-key
   PLAID_CLIENT_ID=your-plaid-id
   PLAID_SECRET=your-plaid-secret
   SENDGRID_API_KEY=your-sendgrid-key
   PORT=3000
   ```

3. **Deploy**
   ```bash
   railway up
   ```

## What Happens During Deployment

1. **Build Phase**:
   - Installs dependencies for root, backend, and frontend
   - Builds TypeScript backend
   - Generates Prisma client
   - Builds React frontend

2. **Start Phase**:
   - Runs database migrations
   - Starts backend on port 3001
   - Starts frontend on PORT (default 3000)
   - Uses `concurrently` to manage both processes

## Accessing Your Application

- Frontend: `https://your-app.railway.app/`
- Backend API: `https://your-app.railway.app/api/`

## Troubleshooting

### If Railway deploys the pitch instead of the platform:

1. Check that `railway.json` has the correct build commands
2. Ensure the buildCommand includes `cd globfam-platform`
3. Verify the startCommand also changes to the platform directory

### If services fail to start:

1. Check Railway logs: `railway logs`
2. Ensure all environment variables are set
3. Verify database connection is working

### Port Configuration:

- Backend runs on port 3001 internally
- Frontend proxies API requests to backend
- Railway exposes the frontend on the PORT environment variable

## Local Testing

Test the Railway deployment locally:
```bash
cd globfam-platform
npm run install:all
npm run build
npm run start:railway
```

This will simulate what happens on Railway.