import { Router } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
    firstName: z.string().min(1).max(50),
    lastName: z.string().min(1).max(50),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    password: z.string().min(8).regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  }),
});

// Routes
router.post('/register', validateRequest(registerSchema), async (req, res, next) => {
  try {
    const { user, tokens } = await AuthService.register(req.body);
    
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await AuthService.login(email, password);
    
    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
        },
        tokens,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticate as any, async (req: any, res, next) => {
  try {
    await AuthService.logout(req.user.id, req.token);
    
    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', validateRequest(refreshSchema), async (req, res, next) => {
  try {
    const tokens = await AuthService.refreshTokens(req.body.refreshToken);
    
    res.json({
      status: 'success',
      data: { tokens },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/verify-email/:token', async (req, res, next) => {
  try {
    await AuthService.verifyEmail(req.params.token);
    
    res.json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/forgot-password', validateRequest(forgotPasswordSchema), async (req, res, next) => {
  try {
    await AuthService.forgotPassword(req.body.email);
    
    res.json({
      status: 'success',
      message: 'If an account exists with this email, a password reset link has been sent',
    });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', validateRequest(resetPasswordSchema), async (req, res, next) => {
  try {
    const { token, password } = req.body;
    await AuthService.resetPassword(token, password);
    
    res.json({
      status: 'success',
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRouter };