# GlobFam Deployment Guide

This guide covers deploying the GlobFam platform to Vercel with Supabase.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **GitHub Repository**: Push your code to GitHub
4. **Node.js**: Version 18.x or higher

## Step 1: Set up Supabase

1. Create a new Supabase project
2. Go to Settings > Database and copy your connection string
3. Run the migrations:
   ```bash
   cd globfam-saas
   npx supabase login
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local` for local development
2. Set up the following environment variables in Vercel:

### Required Variables:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URLs (update after deployment)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_URL=https://your-app.vercel.app
```

### Optional Variables:
```
# Stripe (for payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Features
OPENAI_API_KEY=sk-...

# Banking Integrations
PLAID_CLIENT_ID=...
PLAID_SECRET=...
BASIQ_API_KEY=...

# Email
RESEND_API_KEY=...
EMAIL_FROM=noreply@globfam.app
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Set the root directory to `globfam-saas`
4. Configure environment variables
5. Click "Deploy"

### Option B: Deploy via CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd globfam-saas
   vercel
   ```

3. Follow the prompts and select:
   - Link to existing project or create new
   - Set root directory to `./`
   - Accept default build settings

## Step 4: Post-Deployment Configuration

1. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
   - Add your custom domain if applicable

2. **Configure Supabase**:
   - Add your Vercel URL to Supabase Authentication > URL Configuration
   - Set up Row Level Security (RLS) policies if not already done

3. **Set up Webhooks** (if using Stripe):
   - Add your webhook endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Configure events: `checkout.session.completed`, `customer.subscription.*`

## Step 5: Verify Deployment

1. Visit your deployed URL
2. Test the following:
   - User registration and login
   - Creating a family organization
   - Basic dashboard functionality
   - Transaction creation

## Monitoring & Debugging

### Vercel Functions Logs
```bash
vercel logs --follow
```

### Build Issues
- Check build logs in Vercel dashboard
- Common issues:
  - Missing environment variables
  - TypeScript errors
  - Package version conflicts

### Database Issues
- Check Supabase logs
- Verify RLS policies
- Test queries in Supabase SQL editor

## Production Checklist

- [ ] All environment variables set
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error monitoring set up (optional)
- [ ] Analytics configured (optional)
- [ ] Backup strategy in place

## Rollback Process

If issues occur:
1. Vercel automatically keeps previous deployments
2. Click "Instant Rollback" in Vercel dashboard
3. Or use CLI: `vercel rollback`

## Support

For deployment issues:
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Supabase: [supabase.com/docs](https://supabase.com/docs)
- Project issues: Create an issue in the GitHub repository