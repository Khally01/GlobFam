# GlobFam Production Setup Instructions

## 🚀 Immediate Next Steps

### 1. Database Setup (5 minutes)
```bash
# Install PostgreSQL if not already installed
brew install postgresql@14  # macOS
# or
sudo apt-get install postgresql-14  # Ubuntu

# Start PostgreSQL
brew services start postgresql@14  # macOS
# or
sudo systemctl start postgresql  # Ubuntu

# Create database
createdb globfam

# Navigate to API directory
cd globfam-saas/apps/api

# Create .env file
cp .env.example .env

# Update DATABASE_URL in .env
# Example: DATABASE_URL="postgresql://yourusername:yourpassword@localhost:5432/globfam?schema=public"

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate dev --name init

# Seed demo data
npm run db:seed
```

### 2. Redis Setup (3 minutes)
```bash
# Install Redis
brew install redis  # macOS
# or
sudo apt-get install redis  # Ubuntu

# Start Redis
brew services start redis  # macOS
# or
sudo systemctl start redis  # Ubuntu

# Test Redis connection
redis-cli ping  # Should return PONG
```

### 3. Environment Configuration (5 minutes)

Create these essential environment variables in `apps/api/.env`:

```env
# Database
DATABASE_URL="postgresql://localhost:5432/globfam?schema=public"

# JWT Secrets (generate secure random strings)
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Redis
REDIS_URL="redis://localhost:6379"

# App URLs
APP_URL="http://localhost:3000"
API_URL="http://localhost:3001"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:19000"

# Environment
NODE_ENV="development"
PORT="3001"
```

### 4. Install Dependencies (2 minutes)
```bash
# From root directory
cd /Users/khallydashdorj/Projects/globfam/globfam-saas
npm install

# Install turbo globally for better performance
npm install -g turbo
```

### 5. Start Development Server (1 minute)
```bash
# From root directory
npm run dev

# Or start API only
cd apps/api
npm run dev
```

## ✅ Verification Checklist

After setup, verify everything works:

1. **API Health Check**
   - Visit: http://localhost:3001/health
   - Should return: `{"status":"ok","service":"globfam-api",...}`

2. **Database Connection**
   ```bash
   cd apps/api
   npx prisma studio  # Opens database GUI
   ```

3. **Test Authentication**
   ```bash
   # Register new user
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "name": "Test User",
       "organizationName": "Test Org"
     }'
   ```

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Check connection string
psql "postgresql://localhost:5432/globfam"

# Reset database if needed
npx prisma migrate reset
```

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## 🎯 What You Can Do Now

With the API running, you can:

1. **Test API Endpoints** with Postman/Insomnia
2. **View Database** with Prisma Studio
3. **Create Users** and test authentication
4. **Add Assets** and transactions
5. **Test Family Features** with invite codes

## 📦 Next Development Steps

1. **Set up Stripe** (when ready for payments):
   - Create Stripe account
   - Add products and prices
   - Update environment variables

2. **Deploy to Production**:
   - Set up PostgreSQL on Railway/Supabase
   - Deploy API to Railway/Render
   - Configure production environment

3. **Build Frontend**:
   - Next.js web app (coming next)
   - React Native mobile app

## 💡 Quick Commands Reference

```bash
# Start development
npm run dev

# Run database migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Open Prisma Studio
npx prisma studio

# Run tests
npm test

# Build for production
npm run build
```

## 🚨 Important Security Notes

Before going to production:

1. **Generate secure secrets**:
   ```bash
   openssl rand -base64 32  # For JWT_SECRET
   openssl rand -base64 32  # For JWT_REFRESH_SECRET
   ```

2. **Never commit .env files**
3. **Use environment variables in production**
4. **Enable HTTPS in production**
5. **Set up rate limiting**
6. **Configure CORS properly**

Ready to build! The API is now running with full authentication, multi-tenant support, and all core features. 🎉