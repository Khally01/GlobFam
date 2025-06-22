# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GlobFam is a multi-currency family finance platform for international families. It's a production-ready monorepo using Turborepo with Express.js API and Next.js 14 web app.

**Tech Stack:**
- **API**: Express.js, TypeScript, PostgreSQL/Prisma, Redis, JWT auth, Stripe
- **Web**: Next.js 14 (App Router), React Query, Zustand, TailwindCSS, Shadcn UI
- **Architecture**: Multi-tenant with organization-based data isolation

## Essential Commands

### Development
```bash
# Install all dependencies (use this after cloning)
npm run install:all

# Start services with Docker (recommended)
docker-compose up

# Or start individually
npm run dev:api    # API on :3001
npm run dev:web    # Web on :3000
```

### Database Operations
```bash
cd apps/api
npm run db:migrate      # Run migrations
npm run db:push        # Push schema changes (dev only)
npm run db:seed        # Seed demo data
npm run db:migrate:deploy  # Production migrations
npx prisma studio      # Open Prisma Studio GUI
```

### Building & Testing
```bash
# Build all apps
npm run build

# Type checking
cd apps/web && npm run type-check

# Linting (run in each app directory)
npm run lint

# Run tests (API only currently)
cd apps/api && npm run test
```

### Deployment
```bash
# API deployment (Railway)
cd apps/api && railway up

# Web deployment (Railway/Vercel)
cd apps/web && railway up    # or vercel --prod
```

## Feature Implementation Status

**✅ Implemented:**
- Multi-tenant architecture with organizations
- JWT authentication with Redis sessions
- Multi-currency support (8 currencies)
- Asset & transaction management
- AI transaction categorization
- Bank statement import (CSV, Excel)
- Analytics, forecasting & goals
- Stripe subscriptions

**🚧 In Progress (Phase 2):**
- Banking API integration (Basiq, Plaid)
- Advanced AI insights
- Cross-border remittance
- Visa compliance tracking

## High-Level Architecture

### Monorepo Structure
```
/apps/api/         # Express.js backend
  /src/
    /middleware/   # Auth, error handling, rate limiting
    /routes/       # API endpoints organized by feature
    /services/     # Business logic (AI, banking, analytics)
    /types/        # TypeScript definitions
  /prisma/         # Database schema and migrations

/apps/web/         # Next.js 14 frontend
  /src/
    /app/          # App Router pages
    /components/   # React components
    /lib/          # API client, utilities
    /store/        # Zustand state management
```

### Multi-Tenant Data Isolation
All database queries MUST include organizationId:
```typescript
// ✅ Correct - includes organization isolation
const assets = await prisma.asset.findMany({
  where: { 
    organizationId: req.user.organizationId,
    userId: req.user.id 
  }
});

// ❌ Never query without organizationId
const assets = await prisma.asset.findMany({
  where: { userId: req.user.id }
});
```

### Authentication Flow
1. JWT tokens in httpOnly cookies (not localStorage)
2. Redis sessions: `session:${userId}:${sessionId}`
3. Auth middleware attaches user to `req.user`
4. Organization context from `req.user.organizationId`

### API Response Pattern
All API responses use standardized format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
}
```

## Critical Workarounds

### Workspace Package Issues
The project has unresolved workspace dependency issues. **DO NOT** use `@globfam/*` imports.

**Instead use:**
- Types: `import { ... } from '@/lib/shared-types'`
- UI: `import { ... } from '@/components/shared-ui'`

### Deployment Fixes
- Remove any `nixpacks.toml` or `railway.toml` files
- Ensure no `prebuild` script in package.json
- Web app uses custom build scripts to handle dependencies

## Environment Variables

### API (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="<32-char-secret>"
JWT_REFRESH_SECRET="<32-char-secret>"
REDIS_URL="redis://localhost:6379"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
OPENAI_API_KEY="sk-..."  # For AI features
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="GlobFam"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Key Services & Integration Points

### AI Service (`/src/services/ai.service.ts`)
- Transaction categorization using OpenAI
- Financial insights generation
- Anomaly detection for unusual spending

### Banking Service (`/src/services/banking.service.ts`)
- CSV/Excel import parsing
- Transaction normalization
- Future: Basiq (AU) and Plaid (US) integration

### Analytics Service (`/src/services/analytics.service.ts`)
- Net worth calculations across currencies
- Spending trends and forecasting
- Goal tracking and progress

### Error Handling Pattern
```typescript
// Use AppError for consistent error handling
throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');

// Error structure:
class AppError extends Error {
  statusCode: number;
  code?: string;
  isOperational: boolean = true;
}
```

## Frontend Patterns

### API Client Usage
```typescript
// Always use the api client from lib/api.ts
import { api } from '@/lib/api';

// Example usage
const assets = await api.get<Asset[]>('/assets');
const newAsset = await api.post<Asset>('/assets', data);
```

### State Management
- **Zustand**: Auth state, user preferences
- **React Query**: All server data (assets, transactions)
- **Local state**: Form inputs, UI state

### Form Validation
```typescript
// Use Zod schemas with React Hook Form
const schema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['USD', 'AUD', ...])
});
```

## Testing Approach

### API Testing
```bash
cd apps/api
npm run test              # Run all tests
npm run test -- --watch   # Watch mode
npm run test -- auth      # Test specific file/pattern
```

### Frontend Testing
Currently no tests implemented. When adding:
- Unit tests for utilities and hooks
- Integration tests for API interactions
- E2E tests for critical user flows

## Security Best Practices

1. **Authentication**: All routes except auth endpoints require JWT
2. **Data Access**: Always filter by organizationId
3. **Input Validation**: Zod schemas on all inputs
4. **Rate Limiting**: 100 req/15min per IP
5. **Secrets**: Never log sensitive data
6. **CORS**: Restricted to known domains in production