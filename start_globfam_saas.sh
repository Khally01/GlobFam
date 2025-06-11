#!/bin/bash

# 🚀 GlobFam SaaS - Quick Start Script
# This script sets up your production-ready SaaS infrastructure

echo "🌍 Starting GlobFam SaaS Setup..."
echo "================================"

# Create project structure
echo "📁 Creating project structure..."
mkdir -p globfam-saas/{apps,packages,infrastructure,docs}
cd globfam-saas

# Initialize monorepo
echo "📦 Setting up monorepo..."
npm init -y
npm install -D lerna typescript @types/node
npx lerna init

# Create lerna.json
cat > lerna.json << 'EOF'
{
  "version": "0.0.1",
  "npmClient": "npm",
  "workspaces": ["apps/*", "packages/*"],
  "command": {
    "publish": {
      "conventionalCommits": true
    }
  }
}
EOF

# Create main package.json
cat > package.json << 'EOF'
{
  "name": "globfam",
  "version": "0.0.1",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "lerna run dev --parallel",
    "build": "lerna run build",
    "test": "lerna run test",
    "deploy": "lerna run deploy",
    "start:web": "cd apps/web && npm run dev",
    "start:mobile": "cd apps/mobile && npm run start",
    "start:api": "cd apps/api && npm run dev"
  },
  "devDependencies": {
    "lerna": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

# Create web app
echo "🌐 Creating Next.js web app..."
cd apps
npx create-next-app@latest web --typescript --tailwind --app --src-dir --import-alias "@/*"

# Create API service
echo "🔧 Creating API service..."
mkdir -p api/src
cd api
npm init -y
npm install express typescript @types/express @types/node ts-node nodemon cors helmet
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Create basic API server
cat > src/index.ts << 'EOF'
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'globfam-api', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GlobFam API running on port ${PORT}`);
});
EOF

cd ../..

# Create shared packages
echo "📚 Creating shared packages..."
mkdir -p packages/{types,utils,ui}

# Types package
cd packages/types
npm init -y
cat > index.ts << 'EOF'
export interface User {
  id: string;
  email: string;
  name: string;
  familyId?: string;
  country: string;
  currencies: string[];
}

export interface Asset {
  id: string;
  userId: string;
  type: 'cash' | 'property' | 'investment' | 'debt';
  name: string;
  value: number;
  currency: string;
  country: string;
}

export interface Family {
  id: string;
  name: string;
  members: User[];
  totalNetWorth: number;
}
EOF

cd ../..

# Create infrastructure
echo "🏗️ Creating infrastructure templates..."
cd infrastructure

# Docker compose for local development
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: globfam
      POSTGRES_USER: globfam
      POSTGRES_PASSWORD: development
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ../apps/api
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://globfam:development@postgres:5432/globfam
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
EOF

# Kubernetes deployment template
cat > k8s-deployment.yaml << 'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: globfam-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: globfam-api
  template:
    metadata:
      labels:
        app: globfam-api
    spec:
      containers:
      - name: api
        image: globfam/api:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
EOF

cd ..

# Create environment files
echo "🔐 Creating environment templates..."
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/globfam
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Stripe
STRIPE_PUBLIC_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# AWS
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-west-2

# Firebase (for mobile)
FIREBASE_API_KEY=xxx
FIREBASE_AUTH_DOMAIN=xxx
FIREBASE_PROJECT_ID=xxx

# Feature Flags
ENABLE_BANK_SYNC=false
ENABLE_AI_INSIGHTS=false
ENABLE_CRYPTO=false
EOF

# Create GitHub Actions workflow
echo "🚀 Creating CI/CD pipeline..."
mkdir -p .github/workflows
cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: |
          npm i -g vercel
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
EOF

# Create README
cat > README.md << 'EOF'
# 🌍 GlobFam - Global Family Wealth Management

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development:
   ```bash
   npm run dev
   ```

3. Access services:
   - Web: http://localhost:3000
   - API: http://localhost:3001
   - Mobile: Expo Go app

## Architecture

- **Web**: Next.js 14 with App Router
- **Mobile**: React Native with Expo
- **API**: Express + TypeScript
- **Database**: PostgreSQL + Redis
- **Infrastructure**: Kubernetes + AWS

## Deployment

```bash
npm run deploy
```

## License

Copyright 2025 GlobFam Inc. All rights reserved.
EOF

# Initialize git
echo "📝 Initializing Git repository..."
git init
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.DS_Store
dist/
build/
*.log
.vercel
.next/
coverage/
EOF

git add .
git commit -m "🚀 Initial commit: GlobFam SaaS foundation"

# Final message
echo ""
echo "✅ GlobFam SaaS setup complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. cd globfam-saas"
echo "2. npm install"
echo "3. Set up your .env file"
echo "4. npm run dev"
echo ""
echo "📱 Don't forget to:"
echo "- Register your company at stripe.com/atlas"
echo "- Apply for startup credits (AWS, Google Cloud, etc.)"
echo "- Start talking to potential users!"
echo ""
echo "🚀 Let's build the future of global family finance!"