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

## Critical Architecture Decisions

### Current Monorepo Structure
- **apps/api**: Express.js backend with PostgreSQL/Prisma, Redis, JWT auth, Stripe payments
- **apps/web**: Next.js 14 frontend with App Router, Zustand state management, React Query
- **packages**: Currently empty but reserved for shared code extraction

### Multi-tenant Architecture
Organizations are the primary tenant model. All data is scoped to organizations with proper isolation. Users belong to organizations and can optionally join families within the organization.

### Future Architecture (Per Specification)
The project specification suggests migrating to:
- **Frontend**: Next.js 14 with Supabase integration
- **Backend**: Supabase (Auth, Database, Storage)
- **AI Services**: OpenAI GPT-4 for insights
- **Banking**: Basiq (AU), Plaid (US)
- **Remittance**: Wise API, Remitly API

### Deployment Issues & Solutions
The web app has dependency issues with workspace packages (@globfam/types, @globfam/ui). Current solution:
- Removed prebuild script that was overwriting type definitions
- Created local copies of shared types in `apps/web/src/lib/shared-types/`
- Created local UI components in `apps/web/src/components/shared-ui/`
- Imports changed from `@globfam/*` to local paths

## Essential Commands

### Development
```bash
# Start everything with Docker
docker-compose up

# Or start individually
npm run dev:api    # API on :3001
npm run dev:web    # Web on :3000

# From specific app directories
cd apps/api && npm run dev
cd apps/web && npm run dev
```

### Database Operations
```bash
cd apps/api
npm run db:migrate      # Run migrations
npm run db:push        # Push schema changes (dev only)
npm run db:seed        # Seed demo data
npx prisma studio      # Open Prisma Studio
```

### Building & Testing
```bash
# Build everything
npm run build

# Type checking
cd apps/web && npm run type-check

# Linting
npm run lint
```

### Deployment
```bash
# API deployment (Railway)
cd apps/api
railway up

# Web deployment (Railway/Vercel)
cd apps/web
railway up    # or vercel --prod
```

## Environment Variables

### API (.env)
```
DATABASE_URL="postgresql://user:pass@localhost:5432/globfam?schema=public"
JWT_SECRET="<32-char-secret>"
JWT_REFRESH_SECRET="<32-char-secret>"
REDIS_URL="redis://localhost:6379"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="GlobFam"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## API Architecture

### Authentication Flow
1. JWT tokens stored in httpOnly cookies
2. Sessions tracked in Redis with `session:${userId}:${sessionId}` keys
3. Middleware validates tokens and attaches user to request
4. Organization context derived from user's organizationId

### Data Access Patterns
All queries must include organizationId for tenant isolation:
```typescript
const assets = await prisma.asset.findMany({
  where: { 
    organizationId: req.user.organizationId,
    userId: req.user.id 
  }
});
```

### Error Handling
Centralized error handler expects errors with:
- `statusCode`: HTTP status
- `message`: User-friendly message
- `code`: Internal error code (optional)

## Frontend Architecture

### State Management
- **Zustand** for global state (auth, user preferences)
- **React Query** for server state (automatic caching, refetching)
- **React Hook Form + Zod** for form management

### API Integration
All API calls go through `/lib/api.ts` which handles:
- Base URL configuration
- Authentication headers
- Error transformation
- Response typing

### Component Structure
- `/components/ui/`: Shadcn/Radix UI components
- `/components/shared-ui/`: Local copies of shared components
- `/components/`: Feature-specific components
- `/app/`: Next.js 14 app router pages

## Implementation Roadmap (From Specification)

### Phase 1: MVP (Weeks 1-4) - CURRENT PHASE
- ✅ User authentication and family setup
- ✅ Manual asset entry (cash, bank, property)
- ✅ Transaction management with manual entry
- ✅ Basic dashboard with net worth
- ✅ Multi-currency support

### Phase 2: Intelligence Layer (Weeks 5-8)
- Bank statement import (CSV, Excel)
- AI transaction categorization
- Australian bank integration (Basiq)
- Basic insights and recommendations
- Expense analytics

### Phase 3: Global Features (Weeks 9-12)
- Remittance integration (Wise sandbox)
- Visa compliance tracking
- Document management
- Multi-language support
- Livestock/special assets

### Phase 4: Family Features (Weeks 13-16)
- Kids dashboard and games
- Family member roles
- Advanced AI insights
- Mobile responsive design
- Complete notification system

## Future MCP Compatibility

The codebase is structured for easy MCP server implementation:
1. Clear service boundaries (auth, assets, transactions, remittance, compliance)
2. Standardized API responses with `ApiResponse<T>` type
3. Comprehensive error codes and logging
4. Microservice-ready architecture

To implement MCP:
- Extract services into separate MCP servers (auth-mcp, banking-mcp, ai-insights-mcp)
- Use existing auth middleware for MCP authentication
- Leverage Redis for inter-service communication
- Maintain backward compatibility with REST API
- Add MCP-specific endpoints for tool discovery and invocation

## Known Issues & Workarounds

1. **Workspace Dependencies**: Don't use `@globfam/*` imports. Use local paths instead.
2. **Railway Deployment**: Remove any nixpacks.toml or railway.toml files. Let Railway auto-detect.
3. **Build Errors**: Ensure prebuild script is removed from package.json
4. **Type Errors**: Check `src/lib/shared-types/index.ts` has all required type exports

## Monetization & Business Model

### Pricing Tiers (From Specification)
1. **Free Tier**: 1 family, 3 members, manual transactions only
2. **Family Plan ($9.99/month)**: Unlimited members, 2 bank connections, AI insights, 5GB storage
3. **Premium Plan ($19.99/month)**: Unlimited bank connections, advanced AI, API access, 50GB storage
4. **Enterprise (Custom)**: Multi-family accounts, custom integrations, SLA

### Revenue Streams
- Subscription fees (primary)
- Remittance commission (0.5% cap)
- Premium insights reports
- White-label licensing
- API access for developers

## Security Considerations

- All endpoints require authentication except `/api/auth/login` and `/api/auth/register`
- Organization-based data isolation is enforced at the Prisma query level
- Rate limiting configured: 100 requests per 15 minutes per IP
- CORS restricted to production domains
- Passwords hashed with bcrypt (10 rounds)
- SQL injection prevented via Prisma parameterized queries
- Future: AES-256 encryption at rest for sensitive documents
- Future: PCI-DSS compliance for payment processing

## Success Metrics & KPIs

### Target Metrics (Year 1)
- **Monthly Active Users (MAU)**: 10,000 users
- **Monthly Recurring Revenue (MRR)**: $50,000
- **User Retention**: 80% monthly retention
- **Feature Adoption**: 60% using AI insights
- **Net Promoter Score (NPS)**: > 50

### Key Features Priority
Based on user value and technical complexity:
1. **High Priority**: Bank statement import, AI categorization, Basiq integration
2. **Medium Priority**: Remittance integration, visa compliance, document vault
3. **Future Priority**: Kids platform, advanced AI robo-advisor, estate planning