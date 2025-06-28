# GlobFam Deployment Strategy

## Core Principles

1. **Always Test Locally First** - Never deploy without local validation
2. **Type Safety** - Ensure TypeScript compiles without errors
3. **Dependency Management** - Separate dev and production dependencies properly
4. **Memory Optimization** - Configure NODE_OPTIONS appropriately
5. **Error Recovery** - Have rollback plans ready

## Pre-Deployment Checklist

### Before Adding Any Feature

1. **Will it deploy?**
   - Check if new dependencies are production or dev
   - Ensure TypeScript types are properly defined
   - Test the build process locally

2. **Dependencies Check**
   ```bash
   # API
   cd apps/api
   npm run build
   
   # Web
   cd apps/web
   npm run build
   ```

3. **Type Safety**
   ```bash
   # Run type checking
   cd apps/web
   npm run type-check
   ```

## Deployment Architecture

### API Service

**Key Issues Solved:**
- Prisma CLI only needed during build, not runtime
- Separate build and runtime dependencies
- Memory constraints during build

**Dockerfile Strategy:**
1. **deps stage**: Production dependencies only (no postinstall)
2. **builder stage**: All dependencies for building
3. **runner stage**: Minimal runtime with pre-built artifacts

### Web Service

**Key Issues Solved:**
- SWC compatibility (using node:18-slim)
- TypeScript strict type checking
- Next.js build optimization

**Dockerfile Strategy:**
1. Use Debian-based images (not Alpine) for glibc
2. Explicit type annotations where inference fails
3. Proper memory allocation for builds

## Environment-Specific Configurations

### Development
```bash
# Use local environment variables
cp .env.example .env
npm run dev
```

### Staging
```bash
# Test with production-like settings
NODE_ENV=production npm run build
NODE_ENV=production npm start
```

### Production
- Use Railway/Vercel environment variables
- Enable all optimizations
- Set proper memory limits

## Common Deployment Issues & Solutions

### 1. Package Lock Sync Issues
**Problem**: `npm ci` fails due to lock file mismatch
**Solution**: 
- Use `npm install` with `--legacy-peer-deps`
- Or remove package-lock.json during build
- Keep dependencies minimal

### 2. TypeScript Compilation Errors
**Problem**: Type inference failures
**Solution**:
- Add explicit type annotations
- Use type assertions where needed
- Never use `any` without justification

### 3. Memory Issues (Exit Code 137)
**Problem**: OOM during build
**Solution**:
- Set NODE_OPTIONS=--max-old-space-size=768
- Use multi-stage Docker builds
- Optimize dependency installation

### 4. Missing Dependencies
**Problem**: Runtime errors due to missing packages
**Solution**:
- Clearly separate dev and prod dependencies
- Copy necessary build artifacts (like Prisma client)
- Test production builds locally

## Testing Strategy

### Local Production Build Test
```bash
# API
cd apps/api
docker build -t globfam-api .
docker run -p 3001:3001 globfam-api

# Web
cd apps/web
docker build -t globfam-web .
docker run -p 3000:3000 globfam-web
```

### Pre-Deployment Tests
1. **Build Test**: Ensure code compiles
2. **Type Test**: No TypeScript errors
3. **Dependency Test**: All required packages available
4. **Integration Test**: API and Web communicate properly

## Deployment Commands

### Railway Deployment
```bash
# Ensure in correct directory
cd apps/api
railway up

cd apps/web
railway up
```

### Docker Deployment
```bash
# Build and push images
docker build -t globfam-api:latest ./apps/api
docker build -t globfam-web:latest ./apps/web
```

## Rollback Strategy

1. **Keep Previous Working Version Tagged**
   ```bash
   git tag -a v1.0.0-stable -m "Last stable version"
   ```

2. **Quick Rollback**
   ```bash
   git checkout v1.0.0-stable
   railway up
   ```

3. **Database Rollback**
   ```bash
   npx prisma migrate revert
   ```

## Best Practices

1. **Always Version Control**
   - Tag stable releases
   - Document breaking changes
   - Keep deployment logs

2. **Monitor After Deploy**
   - Check health endpoints
   - Monitor memory usage
   - Review error logs

3. **Incremental Updates**
   - Deploy one service at a time
   - Test after each deployment
   - Have rollback ready

## Long-Term Improvements

1. **CI/CD Pipeline**
   - Automated testing before deploy
   - Staging environment validation
   - Automated rollback on failure

2. **Infrastructure as Code**
   - Terraform for resource management
   - Consistent environment setup
   - Version controlled infrastructure

3. **Monitoring & Alerting**
   - APM integration (New Relic/DataDog)
   - Custom metrics dashboard
   - Automated incident response

## Questions to Ask Before Any Change

1. Will this change affect deployment?
2. Are all dependencies properly categorized?
3. Have I tested the production build locally?
4. Is there a rollback plan if this fails?
5. Are types properly defined for TypeScript?

Remember: **A feature that can't deploy is worse than no feature at all.**