import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { prisma } from '../config/database';
import { User } from '@prisma/client';

interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ 
        status: 'error', 
        message: 'No token provided' 
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = await AuthService.validateToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      res.status(401).json({ 
        status: 'error', 
        message: 'User not found' 
      });
      return;
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({ 
      status: 'error', 
      message: 'Invalid token' 
    });
  }
}

export function authorize(...allowedRoles: string[]) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ 
        status: 'error', 
        message: 'Authentication required' 
      });
      return;
    }

    // Check if user has required role in any family
    if (allowedRoles.length > 0) {
      const userFamilies = await prisma.familyMember.findMany({
        where: { 
          userId: req.user.id,
          role: { in: allowedRoles as any },
        },
      });

      if (userFamilies.length === 0) {
        res.status(403).json({ 
          status: 'error', 
          message: 'Insufficient permissions' 
        });
        return;
      }
    }

    next();
  };
}