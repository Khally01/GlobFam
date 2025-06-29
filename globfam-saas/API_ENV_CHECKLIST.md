# API Environment Variables Checklist

Make sure ALL of these are set in Railway for the API service:

## Required Variables

- [ ] `DATABASE_URL` - PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database?sslmode=require`
  - Example: `postgresql://postgres:password@postgres.railway.internal:5432/railway`

- [ ] `JWT_SECRET` - Secret for JWT tokens (32+ characters)
  - Generate: `openssl rand -base64 32`

- [ ] `JWT_REFRESH_SECRET` - Secret for refresh tokens (32+ characters)
  - Generate: `openssl rand -base64 32`

- [ ] `REDIS_URL` - Redis connection string
  - Format: `redis://default:password@host:port`
  - Example: `redis://default:password@redis.railway.internal:6379`

- [ ] `PORT` - Port number (Railway usually sets this automatically)
  - Default: `3001`

## Optional but Recommended

- [ ] `OPENAI_API_KEY` - For AI categorization features
- [ ] `NODE_ENV` - Should be `production`
- [ ] `NODE_OPTIONS` - Set to `--max-old-space-size=512`

## Stripe (Required for subscriptions)

- [ ] `STRIPE_SECRET_KEY` - Your Stripe secret key
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook endpoint secret
- [ ] `STRIPE_PRICE_ID_MONTHLY` - Monthly plan price ID
- [ ] `STRIPE_PRICE_ID_YEARLY` - Yearly plan price ID

## How to Check/Add in Railway

1. Go to your API service in Railway
2. Click on the "Variables" tab
3. Add each missing variable
4. Click "Deploy" to apply changes

## Common Issues

1. **Database Connection**: Make sure PostgreSQL is provisioned and the URL is correct
2. **Redis Connection**: Make sure Redis is provisioned and the URL is correct
3. **Port Binding**: Railway sets PORT automatically, don't hardcode it