# GlobFam Deployment Guide

This guide covers deploying GlobFam to Vercel (application) and Supabase (database & auth).

## Prerequisites

- Node.js 18+
- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account
- Supabase account

## 1. Supabase Setup

### Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Save your project URL and keys:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## 2. Vercel Setup

### Connect Repository

1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Select the `globfam-saas` directory as the root

### Configure Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `globfam-saas`
- **Build Command**: `npm run build`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `npm install`

### Environment Variables

Add these environment variables in Vercel dashboard:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# App Configuration
NEXT_PUBLIC_APP_NAME=GlobFam
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Stripe (if using payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# External APIs
OPENAI_API_KEY=sk-...
EXCHANGE_RATE_API_KEY=your_api_key
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
BASIQ_API_KEY=your_basiq_api_key
```

## 3. Deploy

### Initial Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd globfam-saas
vercel

# Follow the prompts to link your project
```

### Automatic Deployments

- **Production**: Pushes to `main` branch auto-deploy to production
- **Preview**: Pull requests create preview deployments

## 4. Post-Deployment

### Configure Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `globfam.app`)
3. Update DNS records:
   - A Record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`

### Set up Cron Jobs

Vercel automatically detects cron jobs from `vercel.json`:
- Exchange rate sync: Every 6 hours
- Session cleanup: Daily at midnight

### Monitor Performance

1. Check Vercel Analytics for performance metrics
2. Monitor Supabase dashboard for database usage
3. Set up alerts for errors or performance issues

## 5. Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify Node.js version compatibility

### Database Connection Issues

1. Verify Supabase project is active
2. Check environment variables are correct
3. Ensure RLS policies are properly configured

### Authentication Issues

1. Verify Supabase Auth settings
2. Check redirect URLs in Supabase dashboard
3. Ensure cookies are properly configured

## 6. Scaling Considerations

### Vercel Limits

- **Free**: 100GB bandwidth, 100 hours build time
- **Pro**: 1TB bandwidth, 400 hours build time
- Consider upgrading for production use

### Supabase Limits

- **Free**: 500MB database, 2GB bandwidth
- **Pro**: 8GB database, 50GB bandwidth
- Monitor usage and upgrade as needed

### Performance Optimization

1. Enable Vercel Edge Functions for better performance
2. Use Supabase connection pooling
3. Implement caching strategies
4. Optimize images with Next.js Image component

## Support

- Vercel Documentation: [https://vercel.com/docs](https://vercel.com/docs)
- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- GlobFam Issues: [GitHub Issues](https://github.com/your-repo/issues)