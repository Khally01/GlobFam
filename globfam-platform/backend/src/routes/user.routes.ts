import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate as any);

// Get current user profile
router.get('/profile', async (req: any, res) => {
  res.json({
    status: 'success',
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        preferredCurrency: req.user.preferredCurrency,
        timezone: req.user.timezone,
        language: req.user.language,
      },
    },
  });
});

// Update user profile
router.patch('/profile', async (req: any, res) => {
  // TODO: Implement profile update
  res.json({ status: 'success', message: 'Profile update endpoint' });
});

// Get user settings
router.get('/settings', async (req: any, res) => {
  // TODO: Implement settings retrieval
  res.json({ status: 'success', message: 'Settings endpoint' });
});

// Update user settings
router.patch('/settings', async (req: any, res) => {
  // TODO: Implement settings update
  res.json({ status: 'success', message: 'Settings update endpoint' });
});

export { router as userRouter };