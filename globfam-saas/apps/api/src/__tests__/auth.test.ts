import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock dependencies
jest.mock('@prisma/client');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    setex: jest.fn(),
    on: jest.fn(),
  }));
});

describe('Authentication Tests', () => {
  let app: express.Application;
  let mockPrisma: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Set up test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
    process.env.NODE_ENV = 'test';

    // Mock Prisma
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      organization: {
        create: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    (PrismaClient as jest.Mock).mockImplementation(() => mockPrisma);

    // Create Express app with auth routes
    app = express();
    app.use(express.json());
    
    // Import and use auth routes
    const authRouter = require('../routes/auth').default;
    app.use('/api/auth', authRouter);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        email: 'test@globfam.app',
        password: 'Test123456!',
        firstName: 'Test',
        lastName: 'User',
        organizationName: 'Test Family'
      };

      const hashedPassword = 'hashed-password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const createdUser = {
        id: '1',
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        organizationId: 'org-1',
        role: 'OWNER'
      };

      mockPrisma.$transaction.mockImplementation(async (callback: any) => {
        const context = {
          organization: {
            create: jest.fn().mockResolvedValue({ id: 'org-1', name: newUser.organizationName })
          },
          user: {
            create: jest.fn().mockResolvedValue(createdUser)
          }
        };
        return callback(context);
      });

      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(newUser.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(newUser.password, 10);
    });

    it('should fail with invalid email', async () => {
      const invalidUser = {
        email: 'invalid-email',
        password: 'Test123456!',
        firstName: 'Test',
        lastName: 'User',
        organizationName: 'Test Family'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const weakPasswordUser = {
        email: 'test@globfam.app',
        password: '123456',
        firstName: 'Test',
        lastName: 'User',
        organizationName: 'Test Family'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@globfam.app',
        password: 'Test123456!'
      };

      const existingUser = {
        id: '1',
        email: loginData.email,
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        organizationId: 'org-1',
        role: 'OWNER'
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should fail with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@globfam.app',
        password: 'Test123456!'
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should fail with wrong password', async () => {
      const loginData = {
        email: 'test@globfam.app',
        password: 'WrongPassword!'
      };

      const existingUser = {
        id: '1',
        email: loginData.email,
        password: 'hashed-password',
        firstName: 'Test',
        lastName: 'User',
        organizationId: 'org-1',
        role: 'OWNER'
      };

      mockPrisma.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', 'token=test-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.headers['set-cookie']).toBeDefined();
      // Check that cookies are cleared
      const cookies = response.headers['set-cookie'] as string[];
      expect(cookies.some((cookie: string) => cookie.includes('token=;'))).toBe(true);
    });
  });
});