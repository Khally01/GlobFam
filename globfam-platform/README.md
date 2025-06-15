# GlobFam Platform

The complete financial management platform for international families.

> Last deployment update: June 15, 2025 - Railway configuration optimized

## Architecture Overview

```
globfam-platform/
├── backend/          # Node.js API server
├── frontend/         # React TypeScript app
├── shared/           # Shared types and utilities
├── infrastructure/   # Docker, deployment configs
├── docs/            # API documentation
└── scripts/         # Build and deployment scripts
```

## Tech Stack

### Backend
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport.js
- **Real-time**: Socket.io
- **Cache**: Redis
- **Queue**: Bull (Redis-based)

### Frontend
- **Framework**: React 18 + TypeScript
- **State**: Zustand + React Query
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Build**: Vite
- **Testing**: Vitest + React Testing Library

### Infrastructure
- **Container**: Docker
- **Orchestration**: Docker Compose (dev), Kubernetes (prod)
- **CI/CD**: GitHub Actions
- **Monitoring**: Sentry
- **Analytics**: PostHog

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose

### Installation

1. Clone the repository
```bash
cd globfam-platform
```

2. Install dependencies
```bash
npm run install:all
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development servers
```bash
npm run dev
```

## Development

- Backend: http://localhost:3001
- Frontend: http://localhost:3000
- Database: postgresql://localhost:5432/globfam
- Redis: redis://localhost:6379

## Features

### Phase 1: Core Platform
- [x] User authentication & authorization
- [x] Multi-currency dashboard
- [x] Family member management
- [x] Basic transaction tracking
- [ ] Goal setting

### Phase 2: Financial Integration
- [ ] Bank account connections (Plaid)
- [ ] Real-time currency conversion
- [ ] Investment portfolio tracking
- [ ] Budget management

### Phase 3: Family Features
- [ ] Money Garden for kids
- [ ] Family financial education
- [ ] Shared goals & milestones
- [ ] Multi-generational planning

## License

Proprietary - GlobFam © 2024