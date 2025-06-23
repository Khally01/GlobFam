import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import assetRoutes from './routes/assets';
import transactionRoutes from './routes/transactions';
import familyRoutes from './routes/families';
import subscriptionRoutes from './routes/subscriptions';
import webhookRoutes from './routes/webhooks';
import importRoutes from './routes/import.routes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analytics.routes';
import goalsRoutes from './routes/goals.routes';
import forecastingRoutes from './routes/forecasting.routes';
import bankingRoutes from './routes/banking.routes';
import setupRoutes from './routes/setup';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration - temporarily allow all origins for debugging
app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stripe webhook needs raw body
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'globfam-api',
    version: process.env.npm_package_version || '0.0.1',
    timestamp: new Date().toISOString(),
  });
});

// Database health check
app.get('/api/db-health', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if tables exist
    const userCount = await prisma.user.count().catch(() => 'TABLE_NOT_FOUND');
    const orgCount = await prisma.organization.count().catch(() => 'TABLE_NOT_FOUND');
    
    await prisma.$disconnect();
    
    res.json({
      database: 'connected',
      tables: {
        users: userCount,
        organizations: orgCount
      },
      migrationStatus: userCount === 'TABLE_NOT_FOUND' ? 'MIGRATIONS_NEEDED' : 'OK'
    });
  } catch (error: any) {
    res.status(500).json({
      database: 'error',
      error: error.message,
      hint: 'Database tables may not exist. Migrations may need to run.'
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api', importRoutes);
app.use('/api', aiRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', goalsRoutes);
app.use('/api', forecastingRoutes);
app.use('/api', bankingRoutes);

// Temporary setup route - REMOVE IN PRODUCTION
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_SETUP === 'true') {
  app.use('/api', setupRoutes);
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 GlobFam API running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export default app;