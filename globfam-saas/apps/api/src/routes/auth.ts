import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateToken } from '../utils/crypto';
import { generateAccessToken } from '../utils/jwt';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  organizationName: z.string().min(2),
  country: z.string().default('AU'),
  language: z.string().default('en')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Register new user and organization
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'Registration failed',
        message: 'Email already registered'
      });
    }

    // Create organization and user
    const passwordHash = await hashPassword(data.password);
    const slug = data.organizationName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.organizationName,
          slug,
          plan: 'STARTER',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days trial
        }
      });

      // Create user
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
          role: 'OWNER',
          country: data.country,
          language: data.language,
          organizationId: organization.id
        }
      });

      // Create session
      const sessionToken = generateToken();
      const session = await tx.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
          userAgent: req.get('user-agent'),
          ipAddress: req.ip
        }
      });

      return { user, organization, session };
    });

    const accessToken = generateAccessToken({
      userId: result.user.id,
      email: result.user.email,
      organizationId: result.organization.id,
      sessionId: result.session.id
    });

    logger.info(`New user registered: ${data.email}`);

    res.status(201).json({
      message: 'Registration successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
          plan: result.organization.plan,
          trialEndsAt: result.organization.trialEndsAt
        },
        token: accessToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { organization: true }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const validPassword = await comparePassword(data.password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Create session
    const sessionToken = generateToken();
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        userAgent: req.get('user-agent'),
        ipAddress: req.ip
      }
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      sessionId: session.id
    });

    logger.info(`User logged in: ${data.email}`);

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          language: user.language,
          country: user.country
        },
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          slug: user.organization.slug,
          plan: user.organization.plan
        },
        token: accessToken
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { 
        organization: true,
        family: true
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          language: user.language,
          country: user.country,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled
        },
        organization: {
          id: user.organization.id,
          name: user.organization.name,
          slug: user.organization.slug,
          plan: user.organization.plan,
          trialEndsAt: user.organization.trialEndsAt
        },
        family: user.family ? {
          id: user.family.id,
          name: user.family.name,
          inviteCode: user.family.inviteCode
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    await prisma.session.delete({
      where: { token: token! }
    });

    logger.info(`User logged out: ${req.user!.email}`);

    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Refresh token required'
      });
    }

    // In production, implement refresh token logic
    res.status(501).json({
      error: 'Not implemented',
      message: 'Refresh token endpoint not yet implemented'
    });
  } catch (error) {
    next(error);
  }
});

export default router;