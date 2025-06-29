import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      email: 'test@globfam.app',
      organizationId: 'test-org-id',
      role: 'OWNER'
    };
    next();
  }
}));

describe('Transaction Tests', () => {
  let app: express.Application;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Prisma
    mockPrisma = {
      transaction: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      asset: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

    // Create Express app with transaction routes
    app = express();
    app.use(express.json());
    
    // Import and use transaction routes
    const transactionRouter = require('../routes/transactions').default;
    app.use('/api/transactions', transactionRouter);
  });

  describe('GET /api/transactions', () => {
    it('should return all transactions for the organization', async () => {
      const mockTransactions = [
        {
          id: '1',
          description: 'Grocery Shopping',
          amount: 150.50,
          currency: 'USD',
          type: 'EXPENSE',
          category: 'FOOD',
          date: new Date('2025-01-01'),
          organizationId: 'test-org-id',
          userId: 'test-user-id'
        },
        {
          id: '2',
          description: 'Salary',
          amount: 5000,
          currency: 'USD',
          type: 'INCOME',
          category: 'SALARY',
          date: new Date('2025-01-15'),
          organizationId: 'test-org-id',
          userId: 'test-user-id'
        }
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrisma.transaction.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/transactions')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(2);
      expect(mockPrisma.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'test-org-id' }
        })
      );
    });

    it('should filter transactions by type', async () => {
      const expenseTransactions = [
        {
          id: '1',
          description: 'Grocery Shopping',
          amount: 150.50,
          currency: 'USD',
          type: 'EXPENSE',
          category: 'FOOD',
          date: new Date('2025-01-01'),
          organizationId: 'test-org-id',
          userId: 'test-user-id'
        }
      ];

      mockPrisma.transaction.findMany.mockResolvedValue(expenseTransactions);
      mockPrisma.transaction.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/transactions?type=EXPENSE')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.transactions).toHaveLength(1);
      expect(response.body.data.transactions[0].type).toBe('EXPENSE');
    });
  });

  describe('POST /api/transactions', () => {
    it('should create a new transaction successfully', async () => {
      const newTransaction = {
        description: 'New Purchase',
        amount: 99.99,
        currency: 'USD',
        type: 'EXPENSE',
        category: 'SHOPPING',
        date: '2025-01-20',
        assetId: 'asset-1'
      };

      const mockAsset = {
        id: 'asset-1',
        organizationId: 'test-org-id',
        balance: 1000
      };

      const createdTransaction = {
        id: 'new-transaction-id',
        ...newTransaction,
        date: new Date(newTransaction.date),
        organizationId: 'test-org-id',
        userId: 'test-user-id'
      };

      mockPrisma.asset.findFirst.mockResolvedValue(mockAsset);
      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const result = await callback(mockPrisma);
        return result;
      });
      mockPrisma.transaction.create.mockResolvedValue(createdTransaction);
      mockPrisma.asset.update.mockResolvedValue({
        ...mockAsset,
        balance: mockAsset.balance - newTransaction.amount
      });

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', 'Bearer test-token')
        .send(newTransaction);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(newTransaction.description);
      expect(response.body.data.amount).toBe(newTransaction.amount);
    });

    it('should fail with invalid amount', async () => {
      const invalidTransaction = {
        description: 'Invalid Transaction',
        amount: -50, // Negative amount
        currency: 'USD',
        type: 'EXPENSE',
        category: 'SHOPPING',
        date: '2025-01-20'
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', 'Bearer test-token')
        .send(invalidTransaction);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail without required fields', async () => {
      const incompleteTransaction = {
        description: 'Incomplete Transaction',
        // Missing amount, currency, type
      };

      const response = await request(app)
        .post('/api/transactions')
        .set('Authorization', 'Bearer test-token')
        .send(incompleteTransaction);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('should update a transaction successfully', async () => {
      const transactionId = 'transaction-1';
      const updateData = {
        description: 'Updated Description',
        amount: 200
      };

      const existingTransaction = {
        id: transactionId,
        description: 'Original Description',
        amount: 100,
        currency: 'USD',
        type: 'EXPENSE',
        organizationId: 'test-org-id',
        userId: 'test-user-id'
      };

      const updatedTransaction = {
        ...existingTransaction,
        ...updateData
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(existingTransaction);
      mockPrisma.transaction.update.mockResolvedValue(updatedTransaction);

      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.amount).toBe(updateData.amount);
    });

    it('should fail to update non-existent transaction', async () => {
      const transactionId = 'non-existent';
      const updateData = {
        description: 'Updated Description'
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', 'Bearer test-token')
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('should delete a transaction successfully', async () => {
      const transactionId = 'transaction-1';
      const existingTransaction = {
        id: transactionId,
        description: 'To be deleted',
        amount: 100,
        organizationId: 'test-org-id',
        userId: 'test-user-id'
      };

      mockPrisma.transaction.findUnique.mockResolvedValue(existingTransaction);
      mockPrisma.transaction.delete.mockResolvedValue(existingTransaction);

      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.transaction.delete).toHaveBeenCalledWith({
        where: { id: transactionId }
      });
    });

    it('should fail to delete non-existent transaction', async () => {
      const transactionId = 'non-existent';

      mockPrisma.transaction.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});