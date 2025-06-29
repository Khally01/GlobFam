import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// TEMPORARY DEBUG ENDPOINT - REMOVE AFTER TESTING
router.get('/debug-check', async (req, res) => {
  try {
    const results = {
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasJwtRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
        hasEncryptionKey: !!process.env.ENCRYPTION_KEY,
        hasDatabase: !!process.env.DATABASE_URL,
        hasRedis: !!process.env.REDIS_URL,
      },
      database: {
        connected: false,
        tables: []
      }
    };

    // Try to connect to database
    try {
      const userCount = await prisma.user.count();
      const orgCount = await prisma.organization.count();
      results.database.connected = true;
      results.database.tables = ['users', 'organizations'];
      results.database.counts = {
        users: userCount,
        organizations: orgCount
      };
    } catch (dbError: any) {
      results.database.error = dbError.message;
    }

    return res.json(results);
  } catch (error: any) {
    return res.status(500).json({
      error: 'Debug check failed',
      message: error.message
    });
  }
});

export default router;