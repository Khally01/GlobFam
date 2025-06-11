import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { hashPassword } from '../utils/crypto';

const router = Router();
const prisma = new PrismaClient();

// Update user profile
const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
  country: z.string().optional(),
  preferredCurrency: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional()
});

router.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        country: true,
        preferredCurrency: true,
        language: true,
        timezone: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Change password
const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8)
});

router.put('/password', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || !user.passwordHash) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot change password'
      });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const validPassword = await bcrypt.compare(data.currentPassword, user.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    const newPasswordHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash }
    });

    // Invalidate all sessions except current
    const currentToken = req.headers.authorization?.replace('Bearer ', '');
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        NOT: { token: currentToken }
      }
    });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get organization users (admin only)
router.get('/organization', authenticate, authorize(['OWNER', 'ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
        lastLoginAt: true,
        family: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      data: { users }
    });
  } catch (error) {
    next(error);
  }
});

// Update user role (owner only)
const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'])
});

router.put('/:userId/role', authenticate, authorize(['OWNER']), async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    const data = updateRoleSchema.parse(req.body);

    // Verify user belongs to same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: req.user!.organizationId
      }
    });

    if (!targetUser) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Cannot change owner's role
    if (targetUser.role === 'OWNER') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot change owner role'
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: data.role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    res.json({
      message: 'User role updated',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
});

// Delete user (admin only)
router.delete('/:userId', authenticate, authorize(['OWNER', 'ADMIN']), async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;

    // Cannot delete yourself
    if (userId === req.user!.id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot delete your own account'
      });
    }

    // Verify user belongs to same organization
    const targetUser = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: req.user!.organizationId
      }
    });

    if (!targetUser) {
      return res.status(404).json({
        error: 'Not found',
        message: 'User not found'
      });
    }

    // Cannot delete owner
    if (targetUser.role === 'OWNER') {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot delete organization owner'
      });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;