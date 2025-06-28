# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GlobFam is a multi-currency family finance platform for international families. It's a production-ready monorepo using Express.js API and Next.js 14 web app.

**Tech Stack:**
- **API**: Express.js, TypeScript, PostgreSQL/Prisma, Redis, JWT auth, Stripe
- **Web**: Next.js 14 (App Router), React Query, Zustand, TailwindCSS, Shadcn UI
- **Architecture**: Multi-tenant with organization-based data isolation

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Start development servers
npm run dev:api    # API on :3001
npm run dev:web    # Web on :3000

# Or use Docker Compose
docker-compose up
```

### Database
```bash
cd apps/api
npm run db:migrate      # Run migrations
npm run db:push        # Push schema changes (dev only)
npm run db:seed        # Seed demo data
npx prisma studio      # Open Prisma Studio GUI
```

### Deployment
```bash
# Deploy to Railway (see DEPLOYMENT.md for full guide)
cd apps/api && railway up
cd apps/web && railway up
```

## Project Structure

```
/apps/api/         # Express.js backend
  /src/
    /middleware/   # Auth, error handling, rate limiting
    /routes/       # API endpoints organized by feature
    /services/     # Business logic (AI, banking, analytics)
  /prisma/         # Database schema and migrations

/apps/web/         # Next.js 14 frontend
  /src/
    /app/          # App Router pages
    /components/   # React components
    /lib/          # API client, utilities
    /store/        # Zustand state management
```

## Key Development Guidelines

### 1. Multi-Tenant Data Isolation
All database queries MUST include organizationId:
```typescript
// ✅ Correct
const assets = await prisma.asset.findMany({
  where: { 
    organizationId: req.user.organizationId,
    userId: req.user.id 
  }
});

// ❌ Wrong - missing organization isolation
const assets = await prisma.asset.findMany({
  where: { userId: req.user.id }
});
```

### 2. Authentication
- JWT tokens in httpOnly cookies (not localStorage)
- Redis sessions: `session:${userId}:${sessionId}`
- Auth middleware attaches user to `req.user`

### 3. API Response Pattern
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
}
```

### 4. File Organization
- Keep configuration files clean - only one version per file
- No backup files (*.backup, *.optimized, etc) - use git for version control
- Follow existing patterns in the codebase

## Environment Variables

### API (.env)
```
DATABASE_URL="postgresql://..."
JWT_SECRET="<32-char-secret>"
JWT_REFRESH_SECRET="<32-char-secret>"
REDIS_URL="redis://localhost:6379"
STRIPE_SECRET_KEY="sk_test_..."
OPENAI_API_KEY="sk-..."
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_NAME="GlobFam"
```

## Common Tasks

### Adding a New Feature
1. Create database schema in `prisma/schema.prisma`
2. Run migration: `npm run db:migrate`
3. Add API route in `/routes`
4. Add service logic in `/services`
5. Create frontend components and pages
6. Update API client if needed

### Error Handling
```typescript
// Use AppError for consistent error handling
throw new AppError('Asset not found', 404, 'ASSET_NOT_FOUND');
```

### Testing
```bash
cd apps/api
npm run test              # Run all tests
npm run test -- --watch   # Watch mode
```

## Deployment

See `DEPLOYMENT.md` for comprehensive deployment instructions.

Quick checklist:
1. Set root directories in Railway (`/apps/api` and `/apps/web`)
2. Configure all environment variables
3. Deploy with `railway up`

## Important Notes

- **Workspace packages**: Use direct imports, not `@globfam/*`
- **Railway**: Uses Nixpacks builder with optimized commands
- **Memory**: Set NODE_OPTIONS=--max-old-space-size=512 for production
- **Security**: Always validate inputs and check organization access

## Need Help?

- Check `DEPLOYMENT.md` for deployment issues
- Review existing code patterns before implementing new features
- Use git history to understand previous decisions