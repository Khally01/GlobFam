# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GlobFam is a multi-currency family finance platform designed for global families managing wealth across borders. It serves families living internationally, with a core focus on international students (6+ million families) and includes financial education features for children. Built by an international student, it addresses the complex financial challenges of coordinating family wealth across countries, currencies, and generations.

**Repository Structure:**
- **Root** (`/`) - Simple static landing page for sales pitch
- **globfam-saas** - Production-ready monorepo (PRIMARY - use this for development)
- **globfam-platform** - Alternative full-stack implementation
- **globfam-mobile** - React Native mobile app
- **globfam-api-standalone** - Standalone API implementation

## Essential Commands

### Primary Development (globfam-saas)
```bash
# Install dependencies
cd globfam-saas
npm install

# Start development servers
npm run dev:api    # API on :3001
npm run dev:web    # Web on :3000

# Database operations
cd apps/api
npm run db:migrate      # Run migrations
npm run db:push        # Push schema changes (dev only)
npm run db:seed        # Seed demo data
npx prisma studio      # Open Prisma Studio GUI

# Testing
npm test              # Run all tests
npm test -- --watch   # Watch mode

# Linting and Type Checking
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

### Deployment Validation
```bash
# ALWAYS run before deploying
chmod +x validate-deployment.sh
./validate-deployment.sh
```

## Architecture Overview

### Tech Stack
- **Backend**: Express.js, TypeScript, PostgreSQL (Prisma ORM), Redis, JWT auth, Stripe
- **Frontend**: Next.js 14 (App Router), React Query, Zustand, TailwindCSS, Shadcn UI
- **Mobile**: React Native with Expo
- **Infrastructure**: Docker, Vercel, Supabase, GitHub Actions

### Key Architectural Patterns

1. **Multi-Tenant Architecture**
   - All data isolated by `organizationId`
   - Every database query MUST include organization filtering
   - Users belong to organizations (families)

2. **Authentication Flow**
   - JWT tokens stored in httpOnly cookies (NOT localStorage)
   - Redis for session management: `session:${userId}:${sessionId}`
   - Auth middleware attaches user to `req.user`

3. **API Response Pattern**
   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     error?: { message: string; code?: string };
   }
   ```

4. **Service Architecture**
   ```
   /apps/api/src/
     /routes/      # API endpoints by feature
     /services/    # Business logic (AI, banking, analytics)
     /middleware/  # Auth, error handling, rate limiting
   ```

## Critical Development Rules

### 1. Multi-Tenant Data Access
```typescript
// ✅ CORRECT - Always filter by organizationId
const assets = await prisma.asset.findMany({
  where: { 
    organizationId: req.user.organizationId,
    userId: req.user.id 
  }
});

// ❌ WRONG - Missing organization isolation
const assets = await prisma.asset.findMany({
  where: { userId: req.user.id }
});
```

### 2. Error Handling
```typescript
// Use AppError for consistent error handling
throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
```

### 3. File Organization
- One configuration file per purpose (no *.backup, *.optimized files)
- Follow existing patterns in the codebase
- Use git for version control, not file duplication

### 4. Import Paths
- Within monorepo: Use direct imports, NOT `@globfam/*` packages
- Check existing import patterns before adding new ones

## Environment Variables

### API (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="<32-char-secret>"
JWT_REFRESH_SECRET="<32-char-secret>"
REDIS_URL="redis://localhost:6379"
STRIPE_SECRET_KEY="sk_test_..."
OPENAI_API_KEY="sk-..."
PLAID_CLIENT_ID="..."
BASIQ_API_KEY="..."
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="GlobFam"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

## Common Development Tasks

### Adding a New Feature
1. Update database schema in `prisma/schema.prisma`
2. Run migration: `npm run db:migrate`
3. Create API route in `/apps/api/src/routes/`
4. Add service logic in `/apps/api/src/services/`
5. Create frontend components in `/apps/web/src/components/`
6. Update API client if needed

### Running a Single Test
```bash
cd apps/api
npm test -- path/to/test.spec.ts
```

### Debugging Database Issues
```bash
cd apps/api
npx prisma studio  # Visual database browser
```

## Deployment

### Pre-Deployment Checklist
1. Run `./validate-deployment.sh` - ALL checks must pass
2. Ensure all environment variables are set
3. Test database migrations locally
4. Verify TypeScript compilation

### Vercel Deployment
- Monorepo root: `/globfam-saas`
- Automatic builds from main branch
- Environment variables configured in Vercel dashboard

### Key Services
- **Currency Service**: Real-time exchange rates, portfolio optimization
- **Banking Service**: Plaid (US/EU) and Basiq (Australia) integrations
- **Family Sync**: Real-time WebSocket updates for family members
- **Compliance Service**: Visa work hour tracking, income monitoring (critical for international students)
- **AI Insights**: OpenAI-powered financial recommendations
- **Family Legacy**: Financial education platform for children to learn money management
- **Multi-Generation Support**: Tools for parents, students, and children to coordinate finances

## Testing & Quality

### Running Tests
```bash
# All tests
npm test

# Specific test file
npm test -- src/services/currency.test.ts

# Watch mode
npm test -- --watch
```

### Code Quality Checks
```bash
npm run lint         # ESLint
npm run type-check   # TypeScript
```

## Demo Access
- Email: `demo@globfam.app`
- Password: `demo123456`
- Family Code: `DEMO2025`

## Important Notes

1. **Security**: Never commit secrets or API keys. Use environment variables.
2. **Database**: Always include organizationId in queries for multi-tenant isolation.
3. **Authentication**: JWT tokens in cookies, not localStorage.
4. **Deployment**: Always validate with `./validate-deployment.sh` before deploying.
5. **Performance**: Use Redis for caching frequently accessed data.
6. **Errors**: Use AppError class for consistent error handling across the API.