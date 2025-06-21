import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { BankingService } from '../services/banking/banking.service';
import { prisma } from '../lib/prisma';

const router = Router();
const bankingService = new BankingService(prisma);

// Get supported banks
router.get('/banking/supported-banks', authenticate, async (req, res) => {
  try {
    const banks = [
      {
        id: 'commonwealth',
        name: 'Commonwealth Bank',
        logo: '/bank-logos/cba.png',
        country: 'AU',
        authType: 'credentials',
        status: 'available'
      },
      {
        id: 'khanbank',
        name: 'Khan Bank',
        logo: '/bank-logos/khan.png',
        country: 'MN',
        authType: 'credentials',
        status: 'available'
      },
      {
        id: 'anz',
        name: 'ANZ',
        logo: '/bank-logos/anz.png',
        country: 'AU',
        authType: 'basiq',
        status: 'coming_soon'
      },
      {
        id: 'nab',
        name: 'National Australia Bank',
        logo: '/bank-logos/nab.png',
        country: 'AU',
        authType: 'basiq',
        status: 'coming_soon'
      },
      {
        id: 'westpac',
        name: 'Westpac',
        logo: '/bank-logos/westpac.png',
        country: 'AU',
        authType: 'basiq',
        status: 'coming_soon'
      }
    ];

    res.json({ banks });
  } catch (error) {
    console.error('Get supported banks error:', error);
    res.status(500).json({ error: 'Failed to fetch supported banks' });
  }
});

// Get user's bank connections
router.get('/banking/connections', authenticate, async (req, res) => {
  try {
    const connections = await bankingService.getBankConnections(
      req.user.id,
      req.user.organizationId
    );

    res.json({ connections });
  } catch (error) {
    console.error('Get bank connections error:', error);
    res.status(500).json({ error: 'Failed to fetch bank connections' });
  }
});

// Connect a bank account
router.post('/banking/connect', authenticate, async (req, res) => {
  try {
    const schema = z.object({
      provider: z.enum(['commonwealth', 'khanbank', 'basiq']),
      credentials: z.object({
        username: z.string().optional(),
        password: z.string().optional(),
        institutionId: z.string().optional(),
        loginId: z.string().optional()
      })
    });

    const { provider, credentials } = schema.parse(req.body);
    
    const connection = await bankingService.connectBank(
      req.user.id,
      req.user.organizationId,
      provider,
      credentials
    );

    res.status(201).json({ 
      connection: {
        id: connection.id,
        provider: connection.provider,
        institutionName: connection.institutionName,
        status: connection.status,
        lastSyncAt: connection.lastSyncAt,
        accounts: (connection.metadata as any).accounts
      }
    });
  } catch (error: any) {
    console.error('Connect bank error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    if (error.message.includes('Unsupported bank provider')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to connect bank account' });
  }
});

// Sync bank transactions
router.post('/banking/sync/:connectionId', authenticate, async (req, res) => {
  try {
    const result = await bankingService.syncBankTransactions(
      req.params.connectionId,
      req.user.id,
      req.user.organizationId
    );

    res.json({ 
      message: 'Bank sync completed',
      imported: result.imported,
      errors: result.errors
    });
  } catch (error: any) {
    console.error('Sync bank error:', error);
    if (error.message === 'Bank connection not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to sync bank transactions' });
  }
});

// Disconnect bank account
router.delete('/banking/connections/:connectionId', authenticate, async (req, res) => {
  try {
    await bankingService.disconnectBank(
      req.params.connectionId,
      req.user.id,
      req.user.organizationId
    );

    res.json({ message: 'Bank connection removed successfully' });
  } catch (error: any) {
    console.error('Disconnect bank error:', error);
    if (error.message === 'Bank connection not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to disconnect bank account' });
  }
});

// Get Basiq institutions (for Australian banks)
router.get('/banking/basiq/institutions', authenticate, async (req, res) => {
  try {
    // In production, this would fetch from Basiq API
    const institutions = [
      {
        id: 'AU00000',
        name: 'ANZ',
        shortName: 'ANZ',
        institutionType: 'Bank',
        country: 'AU',
        logo: {
          links: {
            square: 'https://logos.basiq.io/anz-square.png',
            full: 'https://logos.basiq.io/anz-full.png'
          }
        }
      },
      {
        id: 'AU00001',
        name: 'Commonwealth Bank',
        shortName: 'CBA',
        institutionType: 'Bank',
        country: 'AU',
        logo: {
          links: {
            square: 'https://logos.basiq.io/cba-square.png',
            full: 'https://logos.basiq.io/cba-full.png'
          }
        }
      },
      {
        id: 'AU00002',
        name: 'National Australia Bank',
        shortName: 'NAB',
        institutionType: 'Bank',
        country: 'AU',
        logo: {
          links: {
            square: 'https://logos.basiq.io/nab-square.png',
            full: 'https://logos.basiq.io/nab-full.png'
          }
        }
      },
      {
        id: 'AU00003',
        name: 'Westpac',
        shortName: 'Westpac',
        institutionType: 'Bank',
        country: 'AU',
        logo: {
          links: {
            square: 'https://logos.basiq.io/westpac-square.png',
            full: 'https://logos.basiq.io/westpac-full.png'
          }
        }
      }
    ];

    res.json({ institutions });
  } catch (error) {
    console.error('Get Basiq institutions error:', error);
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
});

export default router;