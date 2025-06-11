# GlobFam Backend Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Applications                       │
├─────────────────┬──────────────────┬──────────────────┬────────┤
│   Web App (React)│  iOS App (RN)   │ Android App (RN) │  API   │
└─────────────────┴──────────────────┴──────────────────┴────────┘
                                |
                    ┌───────────┴───────────┐
                    │   API Gateway (AWS)    │
                    │   - Auth middleware    │
                    │   - Rate limiting      │
                    │   - Request routing    │
                    └───────────┬───────────┘
                                |
┌───────────────────────────────┴───────────────────────────────┐
│                     Microservices Layer                        │
├─────────────┬──────────────┬──────────────┬──────────────────┤
│Asset Service│Family Service│Budget Service│Analytics Service │
│  (Node.js)  │   (Node.js)  │  (Python)    │   (Python)       │
└─────────────┴──────────────┴──────────────┴──────────────────┘
                                |
┌───────────────────────────────┴───────────────────────────────┐
│                      Data Layer                                │
├──────────────┬────────────────┬──────────────┬───────────────┤
│  PostgreSQL  │    MongoDB     │   Redis      │  TimescaleDB  │
│  (Core Data) │  (Documents)   │  (Cache)     │ (Time Series) │
└──────────────┴────────────────┴──────────────┴───────────────┘
                                |
┌───────────────────────────────┴───────────────────────────────┐
│                   External Integrations                        │
├────────────┬────────────┬────────────┬────────────┬──────────┤
│Bank APIs   │Crypto APIs │Property APIs│Stock APIs  │Super APIs│
└────────────┴────────────┴────────────┴────────────┴──────────┘
```

## 🎯 Core Backend Services

### 1. **Asset Management Service** (Node.js + TypeScript)
```typescript
// /services/asset-service/src/models/Asset.ts
interface Asset {
  id: string;
  userId: string;
  familyId: string;
  type: AssetType;
  country: Country;
  name: string;
  value: Money;
  metadata: AssetMetadata;
  lastUpdated: Date;
  dataSource: DataSource;
}

interface Money {
  amount: number;
  currency: Currency;
  convertedAmounts?: {
    [currency: string]: number;
  }
}

enum AssetType {
  CASH = 'cash',
  PROPERTY = 'property',
  VEHICLE = 'vehicle',
  INVESTMENT = 'investment',
  CRYPTO = 'crypto',
  SUPERANNUATION = 'superannuation',
  DEBT = 'debt'
}

// API Endpoints
POST   /api/v1/assets
GET    /api/v1/assets?country={country}&type={type}
PUT    /api/v1/assets/{id}
DELETE /api/v1/assets/{id}
GET    /api/v1/assets/summary
GET    /api/v1/assets/net-worth
```

### 2. **Real-time Data Sync Service** (Node.js + Socket.io)
```javascript
// /services/realtime-service/src/sync.js
class AssetSyncService {
  constructor() {
    this.connections = new Map();
    this.syncQueue = new Queue('asset-sync');
  }

  async syncBankAccounts(userId, credentials) {
    // Connect to bank APIs (Plaid for AU, custom for MN)
    const plaidClient = new PlaidClient({
      clientId: process.env.PLAID_CLIENT_ID,
      secret: process.env.PLAID_SECRET
    });

    // Fetch latest transactions
    const accounts = await plaidClient.getAccounts(credentials.accessToken);
    
    // Update balances in real-time
    this.broadcast(userId, 'balance-update', accounts);
    
    // Store in database
    await this.updateAssetBalances(userId, accounts);
  }

  async syncCryptoPortfolio(userId, wallets) {
    // Connect to multiple crypto APIs
    const binanceData = await this.binanceAPI.getPortfolio(wallets.binance);
    const coinbaseData = await this.coinbaseAPI.getPortfolio(wallets.coinbase);
    
    // Aggregate and broadcast
    const portfolio = this.aggregateCrypto([binanceData, coinbaseData]);
    this.broadcast(userId, 'crypto-update', portfolio);
  }

  async syncPropertyValues(userId, properties) {
    // Connect to property valuation APIs
    const realestate = await this.realestateAPI.getValuations(properties);
    
    // AI-powered valuation predictions
    const predictions = await this.mlService.predictPropertyGrowth(properties);
    
    this.broadcast(userId, 'property-update', { realestate, predictions });
  }
}
```

### 3. **Analytics & ML Service** (Python + FastAPI)
```python
# /services/analytics-service/src/models/predictions.py
from fastapi import FastAPI
from sklearn.ensemble import RandomForestRegressor
import pandas as pd
import numpy as np

app = FastAPI()

class WealthPredictionModel:
    def __init__(self):
        self.model = RandomForestRegressor()
        self.load_trained_model()
    
    def predict_net_worth_growth(self, user_data):
        """Predict net worth growth for next 1-5 years"""
        features = self.extract_features(user_data)
        predictions = self.model.predict(features)
        
        return {
            "1_year": predictions[0],
            "3_years": predictions[1],
            "5_years": predictions[2],
            "retirement": self.calculate_retirement_projection(user_data)
        }
    
    def analyze_spending_patterns(self, transactions):
        """AI-powered spending analysis"""
        df = pd.DataFrame(transactions)
        
        # Categorize spending
        categories = self.categorize_transactions(df)
        
        # Find anomalies
        anomalies = self.detect_anomalies(df)
        
        # Generate insights
        insights = self.generate_insights(categories, anomalies)
        
        return {
            "categories": categories,
            "anomalies": anomalies,
            "insights": insights,
            "recommendations": self.get_recommendations(df)
        }

@app.post("/api/v1/analytics/predict")
async def predict_wealth(user_data: dict):
    model = WealthPredictionModel()
    return model.predict_net_worth_growth(user_data)

@app.post("/api/v1/analytics/optimize-portfolio")
async def optimize_portfolio(portfolio: dict):
    # Modern Portfolio Theory optimization
    optimizer = PortfolioOptimizer()
    return optimizer.optimize(portfolio)
```

### 4. **Budget Intelligence Service** (Python + Celery)
```python
# /services/budget-service/src/intelligence.py
from celery import Celery
from datetime import datetime, timedelta
import asyncio

celery_app = Celery('budget', broker='redis://localhost:6379')

class BudgetIntelligence:
    def __init__(self):
        self.ml_model = load_model('budget_predictor.pkl')
    
    @celery_app.task
    def analyze_visa_compliance(self, user_id):
        """Automated visa compliance checking"""
        user = get_user(user_id)
        
        # Check work hours
        work_hours = self.calculate_fortnight_hours(user_id)
        if work_hours > 48:
            send_alert(user_id, "VISA_WORK_HOURS_EXCEEDED", work_hours)
        
        # Check financial requirements
        requirements = self.check_financial_requirements(user)
        if not requirements['meets_criteria']:
            send_alert(user_id, "VISA_FINANCIAL_REQUIREMENT", requirements)
        
        # Predict visa renewal readiness
        prediction = self.predict_visa_readiness(user)
        return prediction
    
    @celery_app.task
    def smart_payment_reminders(self, user_id):
        """AI-powered payment reminder optimization"""
        # Learn user's payment patterns
        patterns = self.analyze_payment_patterns(user_id)
        
        # Optimize reminder timing
        optimal_times = self.calculate_optimal_reminder_times(patterns)
        
        # Schedule personalized reminders
        for payment in get_upcoming_payments(user_id):
            schedule_reminder(
                user_id,
                payment,
                optimal_times[payment.type]
            )
    
    def predict_cash_flow(self, user_id, months=6):
        """Predict future cash flow using ML"""
        historical_data = get_transaction_history(user_id)
        features = self.extract_features(historical_data)
        
        predictions = []
        for month in range(months):
            prediction = self.ml_model.predict(features)
            predictions.append({
                'month': month + 1,
                'predicted_income': prediction['income'],
                'predicted_expenses': prediction['expenses'],
                'predicted_savings': prediction['savings'],
                'confidence': prediction['confidence']
            })
        
        return predictions
```

### 5. **Document Processing Service** (Python + OCR)
```python
# /services/document-service/src/processor.py
import cv2
import pytesseract
from pdf2image import convert_from_path
import boto3

class DocumentProcessor:
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.textract = boto3.client('textract')
    
    async def process_property_deed(self, document_url):
        """Extract property information from deeds"""
        # Download document
        document = await self.download_document(document_url)
        
        # Use AWS Textract for OCR
        response = self.textract.analyze_document(
            Document={'Bytes': document},
            FeatureTypes=['TABLES', 'FORMS']
        )
        
        # Extract key information
        property_info = {
            'address': self.extract_address(response),
            'owner': self.extract_owner(response),
            'purchase_price': self.extract_price(response),
            'date': self.extract_date(response),
            'land_size': self.extract_land_size(response)
        }
        
        # Validate with government databases
        validated = await self.validate_with_gov_api(property_info)
        
        return validated
    
    async def process_bank_statement(self, pdf_url):
        """Extract transactions from bank statements"""
        # Convert PDF to images
        images = convert_from_path(pdf_url)
        
        transactions = []
        for image in images:
            # OCR processing
            text = pytesseract.image_to_string(image)
            
            # Extract transactions using regex patterns
            extracted = self.extract_transactions(text)
            transactions.extend(extracted)
        
        # Categorize transactions
        categorized = self.categorize_transactions(transactions)
        
        return categorized
```

## 🔐 Security & Authentication

### Multi-Factor Authentication Flow
```typescript
// /services/auth-service/src/mfa.ts
class MFAService {
  async initiateLogin(email: string, password: string) {
    const user = await this.validateCredentials(email, password);
    
    if (user.mfaEnabled) {
      // Send OTP via SMS/Email
      const otp = this.generateOTP();
      await this.sendOTP(user.phone, otp);
      
      // Store OTP in Redis with 5min expiry
      await redis.setex(`otp:${user.id}`, 300, otp);
      
      return { requiresMFA: true, sessionToken: this.generateSessionToken(user) };
    }
    
    return this.generateTokens(user);
  }
  
  async verifyMFA(sessionToken: string, otp: string) {
    const userId = this.validateSessionToken(sessionToken);
    const storedOTP = await redis.get(`otp:${userId}`);
    
    if (storedOTP === otp) {
      const user = await this.getUser(userId);
      return this.generateTokens(user);
    }
    
    throw new UnauthorizedError('Invalid OTP');
  }
  
  private generateTokens(user: User) {
    const accessToken = jwt.sign(
      { userId: user.id, familyId: user.familyId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
    
    return { accessToken, refreshToken };
  }
}
```

## 🔄 Data Integration APIs

### 1. **Australian Bank Integration**
```typescript
// Using Basiq API for Australian banks
class AustralianBankIntegration {
  private basiq: BasiqAPI;
  
  async connectBank(userId: string, bankId: string) {
    // Create consent
    const consent = await this.basiq.createConsent({
      userId,
      institutionId: bankId,
      permissions: ['ACCOUNTS', 'TRANSACTIONS']
    });
    
    // User authorizes via bank's OAuth
    const authUrl = consent.links.authorization;
    
    return { authUrl, consentId: consent.id };
  }
  
  async syncAccounts(userId: string, consentId: string) {
    const accounts = await this.basiq.getAccounts(consentId);
    
    // Transform to our schema
    const transformedAccounts = accounts.map(acc => ({
      id: acc.id,
      name: acc.accountName,
      type: this.mapAccountType(acc.accountType),
      balance: {
        amount: acc.balance,
        currency: 'AUD'
      },
      institution: acc.institution.name
    }));
    
    // Store in database
    await this.assetService.updateBankAccounts(userId, transformedAccounts);
    
    // Schedule regular sync
    await this.scheduler.schedule('sync-bank-accounts', {
      userId,
      consentId,
      frequency: 'daily'
    });
  }
}
```

### 2. **Mongolian Bank Integration**
```typescript
// Custom integration for Mongolian banks
class MongolianBankIntegration {
  async connectKhanBank(userId: string, credentials: BankCredentials) {
    // Use bank's API (if available) or screen scraping
    const session = await this.khanBankAPI.authenticate(credentials);
    
    // Fetch accounts
    const accounts = await this.khanBankAPI.getAccounts(session);
    
    // Store encrypted credentials for future syncs
    await this.secureStore.saveCredentials(userId, 'khan-bank', credentials);
    
    return this.transformAccounts(accounts);
  }
  
  async syncGolomtBank(userId: string) {
    // Similar implementation for Golomt Bank
  }
}
```

### 3. **Cryptocurrency Integration**
```typescript
class CryptoIntegration {
  async syncPortfolio(userId: string, exchanges: ExchangeCredentials[]) {
    const portfolios = await Promise.all(
      exchanges.map(async (exchange) => {
        switch (exchange.name) {
          case 'binance':
            return this.syncBinance(exchange.apiKey, exchange.secret);
          case 'coinbase':
            return this.syncCoinbase(exchange.apiKey, exchange.secret);
          default:
            return null;
        }
      })
    );
    
    // Aggregate all holdings
    const aggregated = this.aggregatePortfolios(portfolios);
    
    // Get current prices
    const prices = await this.getPrices(aggregated.coins);
    
    // Calculate total value
    const totalValue = this.calculateTotalValue(aggregated, prices);
    
    // Store in database
    await this.assetService.updateCryptoPortfolio(userId, {
      holdings: aggregated,
      totalValue,
      lastUpdated: new Date()
    });
  }
}
```

## 📊 Real-time Analytics Pipeline

```typescript
// /services/analytics/src/pipeline.ts
class AnalyticsPipeline {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'globfam-analytics',
      brokers: ['kafka1:9092', 'kafka2:9092']
    });
    
    this.clickhouse = new ClickHouse({
      url: process.env.CLICKHOUSE_URL
    });
  }
  
  async processTransactionStream() {
    const consumer = this.kafka.consumer({ groupId: 'analytics-group' });
    await consumer.subscribe({ topic: 'transactions', fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ message }) => {
        const transaction = JSON.parse(message.value.toString());
        
        // Real-time categorization
        const category = await this.mlService.categorizeTransaction(transaction);
        
        // Anomaly detection
        const isAnomaly = await this.detectAnomaly(transaction);
        
        // Store in time-series database
        await this.clickhouse.insert('transactions', {
          ...transaction,
          category,
          is_anomaly: isAnomaly,
          processed_at: new Date()
        });
        
        // Update real-time dashboards
        await this.updateDashboards(transaction.userId);
        
        // Trigger alerts if needed
        if (isAnomaly) {
          await this.alertService.sendAnomalyAlert(transaction);
        }
      }
    });
  }
}
```

## 🚀 Deployment Architecture

### Kubernetes Configuration
```yaml
# /k8s/asset-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: asset-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: asset-service
  template:
    metadata:
      labels:
        app: asset-service
    spec:
      containers:
      - name: asset-service
        image: globfam/asset-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: REDIS_URL
          value: redis://redis-service:6379
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: asset-service
spec:
  selector:
    app: asset-service
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

### Auto-scaling Configuration
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: asset-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: asset-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 🔍 Monitoring & Observability

### Prometheus Metrics
```typescript
// /services/shared/src/metrics.ts
import { register, Counter, Histogram, Gauge } from 'prom-client';

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

export const assetSyncCounter = new Counter({
  name: 'asset_sync_total',
  help: 'Total number of asset syncs',
  labelNames: ['source', 'status']
});

export const netWorthGauge = new Gauge({
  name: 'user_net_worth',
  help: 'Current net worth of users',
  labelNames: ['user_id', 'currency']
});

// Middleware to track metrics
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
};
```

## 🌐 Global CDN & Edge Computing

### Cloudflare Workers for Edge Processing
```javascript
// /edge/asset-cache.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Cache asset data at edge
  if (url.pathname.startsWith('/api/v1/assets/summary')) {
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    
    // Check cache
    let response = await cache.match(cacheKey);
    
    if (!response) {
      // Fetch from origin
      response = await fetch(request);
      
      // Cache for 5 minutes
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'max-age=300');
      
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
      
      event.waitUntil(cache.put(cacheKey, response.clone()));
    }
    
    return response;
  }
  
  // Pass through to origin
  return fetch(request);
}
```

## 🔧 Development Workflow

### CI/CD Pipeline (GitHub Actions)
```yaml
# /.github/workflows/deploy.yml
name: Deploy Services

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Run Tests
      run: |
        docker-compose up -d postgres redis
        npm run test:integration
        npm run test:e2e
    
    - name: Run Security Scan
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Kubernetes
      run: |
        kubectl apply -f k8s/
        kubectl rollout status deployment/asset-service
        kubectl rollout status deployment/analytics-service
```

This architecture provides:
- **Scalability**: Microservices + Kubernetes auto-scaling
- **Real-time Updates**: WebSocket + Kafka streaming
- **AI/ML Intelligence**: Predictive analytics & automation
- **Security**: Multi-layer authentication & encryption
- **Global Performance**: CDN edge caching
- **Reliability**: Multi-region deployment & failover