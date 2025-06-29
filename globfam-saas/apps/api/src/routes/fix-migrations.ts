import { Router } from 'express';
import { execSync } from 'child_process';

const router = Router();

// TEMPORARY ENDPOINT - REMOVE AFTER FIXING MIGRATIONS
router.get('/fix-migrations-temporary-endpoint-remove-after-use', async (req, res) => {
  try {
    // Check if secret key matches to prevent unauthorized access
    const secretKey = req.query.key;
    if (secretKey !== 'fix-globfam-migrations-2024') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    console.log('Starting migration fix...');
    
    const results = [];
    
    try {
      // Check current status
      const status = execSync('npx prisma migrate status', { encoding: 'utf8' });
      results.push({ step: 'status_before', output: status });
    } catch (e: any) {
      results.push({ step: 'status_before', error: e.message });
    }

    try {
      // Apply first migration
      const fix1 = execSync('npx prisma migrate resolve --applied "20250617223112_init"', { encoding: 'utf8' });
      results.push({ step: 'fix_migration_1', output: fix1 });
    } catch (e: any) {
      results.push({ step: 'fix_migration_1', error: e.message });
    }

    try {
      // Apply second migration
      const fix2 = execSync('npx prisma migrate resolve --applied "20250625000000_add_budget_models"', { encoding: 'utf8' });
      results.push({ step: 'fix_migration_2', output: fix2 });
    } catch (e: any) {
      results.push({ step: 'fix_migration_2', error: e.message });
    }

    try {
      // Check status after
      const statusAfter = execSync('npx prisma migrate status', { encoding: 'utf8' });
      results.push({ step: 'status_after', output: statusAfter });
    } catch (e: any) {
      results.push({ step: 'status_after', error: e.message });
    }

    return res.json({
      success: true,
      message: 'Migration fix attempted',
      results
    });

  } catch (error: any) {
    console.error('Migration fix error:', error);
    return res.status(500).json({
      error: 'Failed to fix migrations',
      details: error.message
    });
  }
});

export default router;