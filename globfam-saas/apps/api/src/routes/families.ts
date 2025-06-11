import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateInviteCode } from '../utils/crypto';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

// Family validation schemas
const createFamilySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional()
});

const joinFamilySchema = z.object({
  inviteCode: z.string()
});

// Get current user's family
router.get('/current', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        family: {
          include: {
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true
              }
            },
            _count: {
              select: {
                sharedAssets: true,
                members: true
              }
            }
          }
        }
      }
    });

    if (!user?.family) {
      return res.json({
        data: { family: null }
      });
    }

    res.json({
      data: { family: user.family }
    });
  } catch (error) {
    next(error);
  }
});

// Create family
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createFamilySchema.parse(req.body);

    // Check if user already has a family
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (user?.familyId) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You are already part of a family'
      });
    }

    // Create family and add user as member
    const family = await prisma.family.create({
      data: {
        name: data.name,
        description: data.description,
        inviteCode: generateInviteCode(),
        organizationId: req.user!.organizationId,
        createdById: req.user!.id,
        members: {
          connect: { id: req.user!.id }
        }
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    logger.info(`Family created: ${family.id} by user ${req.user!.id}`);

    res.status(201).json({
      message: 'Family created successfully',
      data: { family }
    });
  } catch (error) {
    next(error);
  }
});

// Join family
router.post('/join', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = joinFamilySchema.parse(req.body);

    // Check if user already has a family
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (user?.familyId) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'You are already part of a family'
      });
    }

    // Find family by invite code
    const family = await prisma.family.findFirst({
      where: {
        inviteCode: data.inviteCode.toUpperCase(),
        organizationId: req.user!.organizationId
      }
    });

    if (!family) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Invalid invite code'
      });
    }

    // Add user to family
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { familyId: family.id }
    });

    const updatedFamily = await prisma.family.findUnique({
      where: { id: family.id },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    logger.info(`User ${req.user!.id} joined family ${family.id}`);

    res.json({
      message: 'Successfully joined family',
      data: { family: updatedFamily }
    });
  } catch (error) {
    next(error);
  }
});

// Leave family
router.post('/leave', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user?.familyId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'You are not part of any family'
      });
    }

    // Check if user is the last member
    const memberCount = await prisma.user.count({
      where: { familyId: user.familyId }
    });

    if (memberCount === 1) {
      // Delete family if last member
      await prisma.family.delete({
        where: { id: user.familyId }
      });
    } else {
      // Just remove user from family
      await prisma.user.update({
        where: { id: req.user!.id },
        data: { familyId: null }
      });
    }

    logger.info(`User ${req.user!.id} left family ${user.familyId}`);

    res.json({
      message: 'Successfully left family'
    });
  } catch (error) {
    next(error);
  }
});

// Update family
router.put('/current', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createFamilySchema.partial().parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user?.familyId) {
      return res.status(404).json({
        error: 'Not found',
        message: 'You are not part of any family'
      });
    }

    const family = await prisma.family.update({
      where: { id: user.familyId },
      data,
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.json({
      message: 'Family updated successfully',
      data: { family }
    });
  } catch (error) {
    next(error);
  }
});

// Generate new invite code
router.post('/current/regenerate-invite', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user?.familyId) {
      return res.status(404).json({
        error: 'Not found',
        message: 'You are not part of any family'
      });
    }

    const family = await prisma.family.update({
      where: { id: user.familyId },
      data: { inviteCode: generateInviteCode() }
    });

    res.json({
      message: 'Invite code regenerated',
      data: { inviteCode: family.inviteCode }
    });
  } catch (error) {
    next(error);
  }
});

// Get family assets
router.get('/current/assets', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user?.familyId) {
      return res.status(404).json({
        error: 'Not found',
        message: 'You are not part of any family'
      });
    }

    const assets = await prisma.asset.findMany({
      where: {
        familyId: user.familyId,
        organizationId: req.user!.organizationId
      },
      include: {
        valuations: {
          orderBy: { date: 'desc' },
          take: 1
        },
        _count: {
          select: { transactions: true }
        }
      }
    });

    res.json({
      data: { assets }
    });
  } catch (error) {
    next(error);
  }
});

// Remove member (only creator can remove)
router.delete('/current/members/:memberId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { memberId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { family: true }
    });

    if (!user?.family) {
      return res.status(404).json({
        error: 'Not found',
        message: 'You are not part of any family'
      });
    }

    // Only creator can remove members
    if (user.family.createdById !== req.user!.id) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only family creator can remove members'
      });
    }

    // Cannot remove yourself
    if (memberId === req.user!.id) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Cannot remove yourself. Use leave family instead.'
      });
    }

    // Remove member
    await prisma.user.update({
      where: { id: memberId },
      data: { familyId: null }
    });

    res.json({
      message: 'Member removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;