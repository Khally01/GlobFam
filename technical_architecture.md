# GlobFam Technical Architecture

## Tech Stack Recommendation

### iOS App (Phase 1)
- **React Native** with Expo for rapid MVP development
- Can reuse React components from web version
- Single codebase for iOS/Android later
- Native feel with React Native Paper or NativeBase UI

### Backend Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   iOS App       │────▶│  API Gateway     │────▶│  Microservices  │
│  (React Native) │     │  (AWS/Firebase)  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                          │
                                ▼                          ▼
                        ┌──────────────┐          ┌───────────────┐
                        │ Auth Service │          │ Database      │
                        │ (Firebase)   │          │ (PostgreSQL)  │
                        └──────────────┘          └───────────────┘
```

### Database Design (PostgreSQL + Redis)

```sql
-- Core Tables
users (
  id, email, country, preferred_currency, family_id
)

families (
  id, name, primary_country, created_by
)

accounts (
  id, user_id, account_type, currency, balance, 
  country, institution, last_sync
)

transactions (
  id, account_id, amount, currency, category,
  description, date, tags[]
)

children_profiles (
  id, family_id, name, age, avatar, 
  savings_goal, achievement_points
)

-- Multi-currency support
exchange_rates (
  from_currency, to_currency, rate, timestamp
)

-- Compliance tracking
visa_compliance (
  user_id, country, work_hours_used, 
  period_start, period_end
)
```

### Key Services Architecture

1. **Currency Service**
   - Real-time exchange rates (Fixer.io/XE API)
   - Historical data for trends
   - Caching with Redis

2. **Banking Integration Service**
   - Plaid for US/EU banks
   - Basiq for Australian banks
   - Manual entry API for other regions

3. **Family Sync Service**
   - Real-time updates via WebSocket
   - Permission management
   - Shared budget calculations

4. **Compliance Service**
   - Visa requirement tracking
   - Work hour monitoring
   - Alert system

### iOS App Structure

```
/src
  /screens
    - DashboardScreen.tsx
    - FamilyHubScreen.tsx
    - ChildProfileScreen.tsx
    - ComplianceScreen.tsx
  /components
    - MultiCurrencyPieChart.tsx
    - AssetCard.tsx
    - CurrencyToggle.tsx
  /services
    - authService.ts
    - currencyService.ts
    - familyService.ts
  /store
    - Redux or Zustand for state
```

## Development Phases

### Phase 1: iOS MVP (2-3 months)
- User authentication
- Multi-currency dashboard
- Manual account entry
- Basic family sharing

### Phase 2: Integration (2 months)
- Australian bank connections
- Real-time exchange rates
- Push notifications
- Basic compliance tracking

### Phase 3: Family Legacy (3 months)
- Child profiles
- Money Garden interface
- Achievement system
- Educational content

## Scalability Considerations

1. **Multi-region deployment** (AWS/Google Cloud)
2. **Microservices architecture** for independent scaling
3. **Redis caching** for currency rates and frequent queries
4. **CDN** for educational content and images
5. **Message queue** (RabbitMQ/Kafka) for async operations

## Security & Compliance

- End-to-end encryption for financial data
- OAuth2 + JWT for authentication
- PCI DSS compliance for payment handling
- GDPR/Privacy Act compliance
- Regular security audits

## Cost Estimation

**Initial Development (6 months)**
- 2 Full-stack developers: $120,000
- 1 iOS developer: $60,000
- UI/UX designer: $30,000
- Infrastructure: $3,000/month

**Monthly Running Costs at Scale (10,000 users)**
- AWS/Cloud: $5,000
- Third-party APIs: $2,000
- Support/Maintenance: $3,000

## Next Steps

1. Set up React Native development environment
2. Create Firebase project for auth/database
3. Design core database schema
4. Build authentication flow
5. Implement multi-currency dashboard MVP