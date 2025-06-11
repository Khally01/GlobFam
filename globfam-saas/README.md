# GlobFam SaaS Platform

Multi-currency family finance platform for international students and global families.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/globfam.git
cd globfam
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy example env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/mobile/.env.example apps/mobile/.env

# Edit the .env files with your credentials
```

4. **Set up the database**
```bash
# Create PostgreSQL database
createdb globfam

# Run migrations
cd apps/api
npx prisma migrate dev

# Seed demo data
npm run db:seed
```

5. **Start development servers**
```bash
# From root directory
npm run dev
```

This will start:
- API server at http://localhost:3001
- Web app at http://localhost:3000
- Mobile app with Expo

## 🏗️ Architecture

### Monorepo Structure
```
globfam/
├── apps/
│   ├── api/         # Express.js API
│   ├── web/         # Next.js web app
│   └── mobile/      # React Native app
├── packages/
│   ├── ui/          # Shared UI components
│   ├── types/       # TypeScript types
│   └── utils/       # Shared utilities
└── turbo.json       # Turborepo config
```

### Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- Redis for caching/sessions
- JWT authentication
- Stripe for payments

**Frontend:**
- Next.js 14 (App Router)
- React Native + Expo
- TailwindCSS
- Redux Toolkit
- React Query

**Infrastructure:**
- Docker containers
- GitHub Actions CI/CD
- Vercel (web hosting)
- Railway/Render (API hosting)

## 🔑 Key Features

- **Multi-currency Support**: Track assets in USD, AUD, MNT, and more
- **Family Sharing**: Share financial data with family members
- **Visa Compliance**: Track work hours and financial requirements
- **Bank Integrations**: Connect to banks via Plaid/Basiq
- **Real-time Updates**: Live currency conversion and notifications
- **Multi-language**: English and Mongolian support

## 📱 Demo Credentials

```
Email: demo@globfam.app
Password: demo123456
Family Code: DEMO2025
```

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific app tests
npm run test --workspace=@globfam/api
npm run test --workspace=@globfam/web

# E2E tests
npm run test:e2e
```

## 🚢 Deployment

### API Deployment

1. Build the API:
```bash
cd apps/api
npm run build
```

2. Deploy to your platform:
- Railway: `railway up`
- Heroku: `git push heroku main`
- Docker: `docker build -t globfam-api .`

### Web Deployment

1. Build the web app:
```bash
cd apps/web
npm run build
```

2. Deploy to Vercel:
```bash
vercel --prod
```

### Mobile Deployment

1. Build for production:
```bash
cd apps/mobile
expo build:ios
expo build:android
```

2. Submit to app stores via EAS

## 🔐 Security

- All API endpoints use JWT authentication
- Passwords hashed with bcrypt
- Rate limiting on all endpoints
- CORS configured for production domains
- Environment variables for secrets
- SQL injection protection via Prisma

## 📊 Database Schema

Key models:
- **User**: Authentication and profile
- **Organization**: Multi-tenant support
- **Family**: Family groups
- **Asset**: Financial assets
- **Transaction**: Income/expenses
- **Subscription**: Billing info

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

- Documentation: [docs.globfam.app](https://docs.globfam.app)
- Email: support@globfam.app
- Discord: [Join our community](https://discord.gg/globfam)