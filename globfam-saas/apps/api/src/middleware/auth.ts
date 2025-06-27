import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AuthRequest = Request;

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Verify session exists and is valid using sessionId from JWT
    const session = await prisma.session.findUnique({
      where: { id: decoded.sessionId },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      });
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      organizationId: session.user.organizationId,
      sessionId: session.id,
      role: session.user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid token'
    });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Authorization failed',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};