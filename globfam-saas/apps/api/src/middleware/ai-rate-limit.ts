import { rateLimit } from 'express-rate-limit';
import { SecurityConfig } from '../config/security.config';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { prisma } from '../lib/prisma';

// Rate limiters for different AI endpoints
export const aiCategorizationLimiter = rateLimit({
  windowMs: SecurityConfig.getAIRateLimits().categorization.windowMs,
  max: SecurityConfig.getAIRateLimits().categorization.maxRequests,
  message: SecurityConfig.getAIRateLimits().categorization.message,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return (req as AuthRequest).user?.id || req.ip;
  }
});

export const aiInsightsLimiter = rateLimit({
  windowMs: SecurityConfig.getAIRateLimits().insights.windowMs,
  max: SecurityConfig.getAIRateLimits().insights.maxRequests,
  message: SecurityConfig.getAIRateLimits().insights.message,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return (req as AuthRequest).user?.id || req.ip;
  }
});

// Middleware to check AI usage quota based on subscription
export async function checkAIQuota(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hasQuota = await SecurityConfig.checkAIQuota(
      req.user.id,
      req.user.organizationId,
      prisma
    );

    if (!hasQuota) {
      return res.status(429).json({
        error: 'AI categorization quota exceeded',
        message: 'You have reached your monthly AI categorization limit. Please upgrade your plan for more.',
        upgradeUrl: '/dashboard/settings/billing'
      });
    }

    next();
  } catch (error) {
    console.error('Error checking AI quota:', error);
    next(); // Allow request to proceed if quota check fails
  }
}