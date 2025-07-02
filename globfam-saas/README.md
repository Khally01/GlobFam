# GlobFam SaaS Platform

Multi-currency family finance platform built with Next.js 14 and Supabase.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TailwindCSS
- **UI Components**: Radix UI, Shadcn/ui
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **State Management**: Zustand, React Query
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Payments**: Stripe

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account
- Stripe account (optional, for payments)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/globfam.git
   cd globfam/globfam-saas
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                  # Next.js 14 App Router
│   ├── (auth)/          # Authentication routes
│   ├── (dashboard)/     # Protected dashboard routes
│   ├── api/             # API routes
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── ui/             # Base UI components
│   └── shared-ui/      # Shared components
├── lib/                # Utilities and configurations
│   ├── api/           # API client functions
│   ├── supabase/      # Supabase client setup
│   └── utils.ts       # Utility functions
├── hooks/             # Custom React hooks
├── store/             # Zustand stores
└── types/             # TypeScript type definitions
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
```

## Features

- 🌍 Multi-currency support with real-time exchange rates
- 👨‍👩‍👧‍👦 Family sharing and collaboration
- 📊 Financial analytics and insights
- 🏦 Bank account integration (Plaid/Basiq)
- 📱 Responsive design
- 🔒 Secure authentication with Supabase
- 💳 Subscription management with Stripe
- 🤖 AI-powered transaction categorization

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:
- `organizations` - Family organizations
- `users` - User profiles
- `assets` - Bank accounts, investments, etc.
- `transactions` - Financial transactions
- `budgets` - Budget categories and limits
- `goals` - Financial goals

See `supabase/migrations/` for the complete schema.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/globfam&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=globfam&root-directory=globfam-saas)

## Environment Variables

See `.env.example` for all required and optional environment variables.

### Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Optional:
- Stripe keys for payments
- OpenAI API key for AI features
- Banking API keys (Plaid/Basiq)
- Analytics and monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Proprietary - All rights reserved

## Support

For issues and questions, please create an issue in the GitHub repository.