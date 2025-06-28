# Railway Deployment Fixes for GlobFam SaaS

## Overview

This document contains comprehensive fixes for the Railway deployment issues affecting both the API and Web applications.

## Issues Addressed

1. **API Memory Issues (Exit Code 137)**
   - OOM (Out of Memory) errors during npm install
   - Large dependency footprint
   - Inefficient build process

2. **Frontend SWC Compatibility**
   - Alpine Linux (musl) vs glibc incompatibility
   - Next.js SWC binary issues

3. **Package Optimization**
   - Reduced dependency count
   - Separated optional dependencies
   - Optimized build commands

## Solution Files Created

### API Application

1. **`apps/api/package.json.optimized`**
   - Moved non-essential dependencies to `optionalDependencies`
   - Kept only core dependencies for basic functionality
   - Reduced initial memory footprint

2. **`apps/api/Dockerfile.optimized`**
   - Multi-stage build process
   - Separate stages for deps, builder, and runner
   - Memory limits set via NODE_OPTIONS
   - Non-root user for security
   - Health check included

3. **`apps/api/railway-build.sh`**
   - Custom build script with memory optimization
   - Progressive installation process
   - Cleanup of dev dependencies post-build

4. **`apps/api/railway.json`**
   - Optimized Railway configuration
   - Memory limits enforced
   - Health check configuration
   - Restart policy settings

5. **`apps/api/nixpacks.toml.optimized`**
   - Minimal system packages
   - Cached node_modules directory
   - Memory-optimized build commands

### Web Application

1. **`apps/web/package.json.optimized`**
   - Moved UI enhancement libraries to optional
   - Kept core Next.js dependencies
   - Reduced bundle size

2. **`apps/web/Dockerfile.optimized`**
   - Uses node:18-slim (glibc-based) instead of Alpine
   - Standalone Next.js output
   - Multi-stage build with optimizations
   - Non-root user for security

3. **`apps/web/next.config.js.optimized`**
   - Enabled standalone output mode
   - Bundle size optimizations
   - Build-time optimizations

4. **`apps/web/railway-build.sh`**
   - Memory-optimized build process
   - Build verification steps
   - Cleanup procedures

5. **`apps/web/railway.json.optimized`**
   - Optimized deployment configuration
   - Memory limits for runtime
   - Health check settings

6. **`apps/web/nixpacks.toml`**
   - Proper system packages for Next.js
   - Build cache optimization

## Implementation Steps

### Step 1: Update Package Files

```bash
# API
cd apps/api
cp package.json package.json.backup
cp package.json.optimized package.json
rm -rf node_modules package-lock.json

# Web
cd ../web
cp package.json package.json.backup
cp package.json.optimized package.json
cp next.config.js next.config.js.backup
cp next.config.js.optimized next.config.js
rm -rf node_modules package-lock.json .next
```

### Step 2: Update Dockerfiles

```bash
# API
cd apps/api
cp Dockerfile Dockerfile.backup
cp Dockerfile.optimized Dockerfile

# Web
cd ../web
cp Dockerfile Dockerfile.backup
cp Dockerfile.optimized Dockerfile
```

### Step 3: Update Railway Configurations

```bash
# API
cd apps/api
cp railway.json.optimized railway.json
cp nixpacks.toml.optimized nixpacks.toml
chmod +x railway-build.sh

# Web
cd ../web
cp railway.json.optimized railway.json
chmod +x railway-build.sh
```

### Step 4: Environment Variables

Ensure these environment variables are set in Railway:

**API Service:**
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
PORT=3001
DATABASE_URL=<your-database-url>
JWT_SECRET=<your-jwt-secret>
```

**Web Service:**
```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=512
NEXT_TELEMETRY_DISABLED=1
PORT=3000
NEXT_PUBLIC_API_URL=<your-api-url>
```

## Key Optimizations

### Memory Management
- Set explicit memory limits via NODE_OPTIONS
- Use `npm ci` instead of `npm install`
- Clean up cache and temp files during build
- Prune dev dependencies after build

### Build Process
- Multi-stage Docker builds
- Cached dependencies layer
- Standalone Next.js output
- Progressive dependency installation

### Runtime Optimization
- Non-root user for security
- Health checks for reliability
- Restart policies for resilience
- Production-only dependencies

## Testing

Before deploying to Railway:

1. **Test API locally:**
```bash
cd apps/api
docker build -f Dockerfile.optimized -t globfam-api .
docker run -p 3001:3001 globfam-api
```

2. **Test Web locally:**
```bash
cd apps/web
docker build -f Dockerfile.optimized -t globfam-web .
docker run -p 3000:3000 globfam-web
```

## Monitoring

After deployment, monitor:

1. Memory usage in Railway dashboard
2. Build logs for any warnings
3. Application logs for runtime errors
4. Health check status

## Troubleshooting

If issues persist:

1. **Memory Issues:**
   - Increase NODE_OPTIONS memory limit
   - Review and remove more optional dependencies
   - Enable swap on Railway (if available)

2. **SWC Issues:**
   - Ensure using node:18-slim (not Alpine)
   - Check Next.js version compatibility
   - Consider disabling SWC if necessary

3. **Build Failures:**
   - Check Railway build logs
   - Verify all environment variables
   - Test Docker build locally first

## Support

For additional help:
- Railway Documentation: https://docs.railway.app
- Next.js Deployment: https://nextjs.org/docs/deployment
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices