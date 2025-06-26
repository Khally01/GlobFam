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

## Brand Identity Guide

### Brand Overview
GlobFam is a global family finance platform built specifically for international student families. Our brand embodies trust, sophistication, and cultural awareness while making complex financial management accessible.

### Brand Positioning
- **Mission**: To empower international student families with sophisticated financial tools that simplify cross-border money management while ensuring visa compliance and academic success.
- **Value Proposition**: The first and only financial platform designed specifically for international student families—combining multi-currency management, visa compliance, and family coordination in one trusted solution.
- **Brand Promise**: "Turn financial complexity into clarity, stress into confidence, and separate accounts into unified family success."

### Visual Identity

#### Logo
- **Primary**: "GlobFam" in clean, modern typography
- **Font Weight**: 600 (semi-bold)
- **Letter Spacing**: -0.02em
- **Variations**: Primary gradient, dark backgrounds, monochrome

#### Color System
```css
/* Primary Colors */
--globfam-purple: #635bff;      /* Primary brand color, CTAs */
--deep-blue: #0a2540;           /* Headers, primary text */
--slate: #425466;               /* Body text, secondary info */
--steel: #6b7c93;               /* Subtle text, placeholders */

/* Functional Colors */
--success-green: #00d924;       /* Positive actions, growth */
--alert-orange: #ff5722;        /* Warnings, visa alerts */
--cloud: #f6f9fc;               /* Backgrounds, subtle containers */
--border-gray: #e6ebf1;         /* Borders, dividers */

/* Gradients */
--primary-gradient: linear-gradient(135deg, #635bff 0%, #7c3aed 30%, #0ea5e9 100%);
--brand-gradient: linear-gradient(135deg, #635bff, #7c3aed);
```

#### Typography
```css
/* Font Stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;

/* Type Scale */
--h1: 3.5em;    /* Page titles */
--h2: 2.5em;    /* Section headers */
--h3: 1.75em;   /* Card titles */
--h4: 1.25em;   /* Subsections */
--body: 1.1em;  /* Body text */
--caption: 0.9em; /* Small text */

/* Font Weights */
--regular: 400;
--medium: 500;
--semibold: 600;

/* Letter Spacing */
--tight: -0.02em;  /* Headlines */
--normal: -0.01em; /* Subheadings */
```

### Design Principles

1. **Global by Design**: Multi-currency native support with cultural awareness
2. **Family-First**: Features designed for family coordination and shared goals
3. **Education-Centered**: Purpose-built for international student families
4. **Trust & Security**: Bank-grade security with transparency

### UI Component Styling

#### Cards
```css
.brand-card {
    background: white;
    padding: 48px;
    border-radius: 12px;
    border: 1px solid #e6ebf1;
    transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.brand-card:hover {
    border-color: #635bff;
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(99, 91, 255, 0.1);
}
```

#### Buttons
```css
/* Primary Button */
.btn-primary {
    background: #635bff;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    transition: all 0.2s ease;
}

.btn-primary:hover {
    background: #5851db;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 91, 255, 0.2);
}
```

### Brand Voice & Messaging

#### Voice Characteristics
- **Intelligent**: We understand complex financial regulations
- **Empathetic**: We've lived the international student experience
- **Global**: Culturally aware and inclusive
- **Empowering**: Helping families take control
- **Trustworthy**: Transparent and reliable

#### Key Messages
- "Built by international families, for international families"
- "Financial clarity for your global journey"
- "Stay compliant, stay focused on your education"
- "One platform, multiple currencies, unified family"

### Implementation Guidelines

#### Spacing System
```css
--space-xs: 8px;
--space-sm: 16px;
--space-md: 24px;
--space-lg: 32px;
--space-xl: 48px;
--space-2xl: 64px;
--space-3xl: 96px;
```

#### Border Radius
```css
--radius-sm: 4px;   /* Small elements */
--radius-md: 8px;   /* Buttons, inputs */
--radius-lg: 12px;  /* Cards */
--radius-xl: 16px;  /* Modals */
--radius-full: 50%; /* Avatars */
```

#### Shadows
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
--shadow-purple: 0 12px 24px rgba(99, 91, 255, 0.1);
```

### Accessibility
- Maintain WCAG AA compliance
- Minimum contrast ratio: 4.5:1 for normal text
- Focus states: 2px #635bff outline with 2px offset
- Support for reduced motion preferences