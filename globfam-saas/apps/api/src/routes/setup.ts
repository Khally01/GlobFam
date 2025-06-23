import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const router = Router();
const prisma = new PrismaClient();

// Temporary setup endpoint - REMOVE IN PRODUCTION
router.get('/setup/database', async (req, res) => {
  try {
    // Check if setup key matches
    const setupKey = req.query.key;
    if (setupKey !== 'temporary-setup-key-2024') {
      return res.status(401).json({ error: 'Invalid setup key' });
    }

    // Try to run Prisma push
    try {
      execSync('npx prisma db push --accept-data-loss', {
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      // Test the connection
      await prisma.user.count();
      
      return res.json({
        success: true,
        message: 'Database setup completed successfully!'
      });
    } catch (error: any) {
      return res.status(500).json({
        error: 'Failed to setup database',
        details: error.message
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: 'Setup failed',
      message: error.message
    });
  }
});

// Health check for database
router.get('/setup/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    const orgCount = await prisma.organization.count();
    
    res.json({
      database: 'connected',
      tables: {
        users: userCount,
        organizations: orgCount
      }
    });
  } catch (error: any) {
    res.status(500).json({
      database: 'error',
      error: error.message
    });
  }
});

export default router;