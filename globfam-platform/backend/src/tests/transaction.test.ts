import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TransactionService } from '../services/transaction.service';
import { prisma } from '../config/database';
import { TransactionType } from '@prisma/client';

describe('Transaction Service Tests', () => {
  let testUserId: string;
  let testAccountId: string;
  let testCategoryId: string;

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'transaction.test@globfam.com',
        passwordHash: 'hash',
        firstName: 'Transaction',
        lastName: 'Test',
      },
    });
    testUserId = user.id;

    // Create test account
    const account = await prisma.account.create({
      data: {
        userId: testUserId,
        name: 'Test Account',
        type: 'CHECKING',
        currency: 'USD',
        balance: 1000,
      },
    });
    testAccountId = account.id;

    // Create test category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category',
        type: 'EXPENSE',
      },
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    // Clean up
    await prisma.transaction.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.account.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.user.delete({
      where: { id: testUserId },
    });
    await prisma.category.delete({
      where: { id: testCategoryId },
    });
  });

  describe('createTransaction', () => {
    it('should create an expense transaction', async () => {
      const transaction = await TransactionService.createTransaction(testUserId, {
        accountId: testAccountId,
        amount: 50,
        currency: 'USD',
        type: 'EXPENSE' as TransactionType,
        description: 'Test expense',
        categoryId: testCategoryId,
        date: new Date(),
      });

      expect(transaction).toBeDefined();
      expect(transaction.amount).toBe(50);
      expect(transaction.type).toBe('EXPENSE');
      expect(transaction.description).toBe('Test expense');

      // Check account balance was updated
      const account = await prisma.account.findUnique({
        where: { id: testAccountId },
      });
      expect(Number(account?.balance)).toBe(950);
    });

    it('should create an income transaction', async () => {
      const transaction = await TransactionService.createTransaction(testUserId, {
        accountId: testAccountId,
        amount: 100,
        currency: 'USD',
        type: 'INCOME' as TransactionType,
        description: 'Test income',
        date: new Date(),
      });

      expect(transaction).toBeDefined();
      expect(transaction.type).toBe('INCOME');

      // Check account balance was updated
      const account = await prisma.account.findUnique({
        where: { id: testAccountId },
      });
      expect(Number(account?.balance)).toBe(1050);
    });

    it('should auto-categorize transactions', async () => {
      // Create grocery category
      const groceryCategory = await prisma.category.create({
        data: {
          name: 'Groceries',
          type: 'EXPENSE',
        },
      });

      const transaction = await TransactionService.createTransaction(testUserId, {
        accountId: testAccountId,
        amount: 75,
        currency: 'USD',
        type: 'EXPENSE' as TransactionType,
        description: 'Woolworths Grocery Shopping',
        date: new Date(),
      });

      expect(transaction.categoryId).toBe(groceryCategory.id);

      // Clean up
      await prisma.category.delete({
        where: { id: groceryCategory.id },
      });
    });
  });

  describe('getTransactions', () => {
    it('should filter transactions by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await TransactionService.getTransactions({
        userId: testUserId,
        startDate,
        endDate,
      });

      expect(result.transactions).toBeDefined();
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it('should filter transactions by type', async () => {
      const result = await TransactionService.getTransactions({
        userId: testUserId,
        type: 'EXPENSE' as TransactionType,
      });

      expect(result.transactions.every(t => t.type === 'EXPENSE')).toBe(true);
    });

    it('should search transactions by description', async () => {
      const result = await TransactionService.getTransactions({
        userId: testUserId,
        search: 'Test',
      });

      expect(result.transactions.every(t => 
        t.description.toLowerCase().includes('test')
      )).toBe(true);
    });
  });

  describe('getSpendingByCategory', () => {
    it('should calculate spending by category for the month', async () => {
      const spending = await TransactionService.getSpendingByCategory(
        testUserId,
        'month'
      );

      expect(spending).toBeDefined();
      expect(Array.isArray(spending)).toBe(true);
      
      spending.forEach(item => {
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('total');
        expect(item.total).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getCashFlow', () => {
    it('should calculate monthly cash flow', async () => {
      const cashFlow = await TransactionService.getCashFlow(testUserId, 3);

      expect(cashFlow).toBeDefined();
      expect(Array.isArray(cashFlow)).toBe(true);
      
      cashFlow.forEach(month => {
        expect(month).toHaveProperty('month');
        expect(month).toHaveProperty('income');
        expect(month).toHaveProperty('expenses');
        expect(month).toHaveProperty('net');
        expect(month.net).toBe(month.income - month.expenses);
      });
    });
  });
});