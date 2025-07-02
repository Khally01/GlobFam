# GlobFam - Multi-Currency Family Finance Platform

GlobFam helps international families manage finances across borders with multi-currency support, family sharing, and financial education features.

## Project Structure

```
GlobFam/
├── globfam-saas/       # Main web application (Next.js + Supabase)
├── globfam-mobile/     # React Native mobile app (optional)
└── marketing/          # Marketing materials
```

## Quick Start

### Web Application

```bash
cd globfam-saas
npm install
npm run dev
```

### Deployment

The main application is deployed on Vercel with Supabase:
- Frontend: Vercel
- Database & Auth: Supabase

See `globfam-saas/DEPLOYMENT.md` for detailed deployment instructions.

## Tech Stack

- **Frontend**: Next.js 14, React, TailwindCSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Auth**: Supabase Auth
- **Mobile**: React Native (optional)

## Documentation

- [Deployment Guide](globfam-saas/DEPLOYMENT.md)
- [Development Guide](globfam-saas/README.md)
- [Claude AI Assistant Guide](CLAUDE.md)

## License

Proprietary - All rights reserved