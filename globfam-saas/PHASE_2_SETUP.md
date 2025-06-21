# Phase 2 Setup Instructions

## 1. Install Dependencies

### API Dependencies
Run these commands in the `apps/api` directory:

```bash
cd apps/api
npm install csv-parse xlsx multer @types/multer openai
```

### Web Dependencies
Run these commands in the `apps/web` directory:

```bash
cd apps/web
npm install react-dropzone papaparse recharts date-fns
```

## 2. Environment Variables

Add these to your `apps/api/.env` file:

```env
# AI Services
OPENAI_API_KEY="sk-..." # Get from https://platform.openai.com/api-keys

# Banking APIs
BASIQ_API_KEY="..." # Get from https://dashboard.basiq.io/

# Currency API
EXCHANGE_RATE_API_KEY="..." # Get from https://exchangerate-api.com/
```

## 3. Database Migration

After dependencies are installed, run:

```bash
cd apps/api
npm run db:migrate
```

This will create the new tables for import history and bank connections.

## 4. Start Development

```bash
# From root directory
npm run dev:api  # In one terminal
npm run dev:web  # In another terminal
```

## 5. External Service Setup

### OpenAI
1. Go to https://platform.openai.com/
2. Create an account or sign in
3. Generate an API key
4. Set usage limits to control costs

### Basiq (Australian Banking)
1. Go to https://basiq.io/
2. Sign up for a developer account
3. Create an application
4. Get your API key
5. Configure OAuth redirect URL: `http://localhost:3000/dashboard/banking/callback`

### ExchangeRate-API
1. Go to https://exchangerate-api.com/
2. Sign up for free tier
3. Get your API key

## Notes
- The free tiers of these services should be sufficient for development
- For production, you'll need to upgrade based on usage
- Keep API keys secure and never commit them to git