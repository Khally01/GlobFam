# GlobFam Platform Setup Guide

## Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- PostgreSQL 15+ (if running without Docker)
- Redis 7+ (if running without Docker)

## Quick Start (Docker)

1. **Clone and navigate to the platform directory:**
```bash
cd globfam-platform
```

2. **Copy environment files:**
```bash
cp backend/.env.example backend/.env
```

3. **Start all services with Docker:**
```bash
docker-compose up
```

This will start:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- Backend API on http://localhost:3001
- Frontend app on http://localhost:3000

4. **Run database migrations (in a new terminal):**
```bash
docker-compose exec backend npm run db:migrate
```

## Manual Setup (Without Docker)

### Backend Setup

1. **Install backend dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Run database migrations:**
```bash
npm run db:migrate
npm run db:generate
```

4. **Start the backend server:**
```bash
npm run dev
```

### Frontend Setup

1. **Install frontend dependencies:**
```bash
cd frontend
npm install
```

2. **Start the frontend development server:**
```bash
npm run dev
```

## Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/globfam"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT (generate secure random strings)
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Testing the Platform

1. **Register a new account:**
   - Navigate to http://localhost:3000/register
   - Fill in your details
   - Password must contain uppercase, lowercase, number, and special character

2. **Login:**
   - Use your email and password at http://localhost:3000/login

3. **Explore features:**
   - Dashboard with multi-currency support (USD, AUD, MNT)
   - Family member overview
   - Recent transactions
   - Goal tracking
   - Account management (coming soon)

## Development Commands

### Root directory:
```bash
# Install all dependencies
npm run install:all

# Start Docker services
npm run dev

# Run tests
npm run test

# Run linting
npm run lint
```

### Backend:
```bash
cd backend

# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed database
npm run db:seed

# Run tests
npm test
```

### Frontend:
```bash
cd frontend

# Type checking
npm run type-check

# Build for production
npm run build

# Run tests
npm test
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/verify-email/:token` - Verify email

### Protected Endpoints (require authentication)
- `GET /api/users/profile` - Get user profile
- `GET /api/accounts` - List user accounts
- `GET /api/transactions` - List transactions
- `GET /api/families` - List user families
- `GET /api/goals` - List financial goals

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9
```

### Database connection issues
1. Ensure PostgreSQL is running
2. Check DATABASE_URL in .env
3. Run migrations: `npm run db:migrate`

### Redis connection issues
1. Ensure Redis is running
2. Check REDIS_URL in .env

## Next Steps

1. **Set up production environment**
2. **Configure real payment providers (Stripe)**
3. **Integrate bank connections (Plaid)**
4. **Add email service (SendGrid)**
5. **Set up monitoring (Sentry)**
6. **Deploy to cloud (AWS/GCP/Azure)**

## Support

For issues or questions:
- Check logs in `backend/logs/`
- Review error messages in browser console
- Ensure all environment variables are set correctly