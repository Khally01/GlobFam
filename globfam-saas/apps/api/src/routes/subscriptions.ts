import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Price IDs from Stripe
const PRICE_IDS = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID!,
  FAMILY: process.env.STRIPE_FAMILY_PRICE_ID!,
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID!
};

// Get current subscription
router.get('/current', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!organization) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Organization not found'
      });
    }

    const subscription = organization.subscriptions[0];

    res.json({
      data: {
        plan: organization.plan,
        subscription: subscription || null,
        trialEndsAt: organization.trialEndsAt,
        isTrialing: organization.trialEndsAt && organization.trialEndsAt > new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create checkout session
const createCheckoutSchema = z.object({
  plan: z.enum(['STARTER', 'FAMILY', 'PREMIUM']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url()
});

router.post('/checkout', authenticate, authorize(['OWNER']), async (req: AuthRequest, res, next) => {
  try {
    const data = createCheckoutSchema.parse(req.body);

    const organization = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId }
    });

    if (!organization) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Organization not found'
      });
    }

    // Create or get Stripe customer
    let customerId = organization.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.user!.email,
        metadata: {
          organizationId: organization.id,
          userId: req.user!.id
        }
      });
      customerId = customer.id;

      await prisma.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: PRICE_IDS[data.plan],
        quantity: 1
      }],
      mode: 'subscription',
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      metadata: {
        organizationId: organization.id,
        plan: data.plan
      },
      subscription_data: {
        trial_period_days: organization.trialEndsAt && organization.trialEndsAt > new Date() ? 0 : 14,
        metadata: {
          organizationId: organization.id
        }
      }
    });

    logger.info(`Checkout session created for org ${organization.id}`);

    res.json({
      data: {
        checkoutUrl: session.url,
        sessionId: session.id
      }
    });
  } catch (error) {
    next(error);
  }
});

// Create customer portal session
router.post('/portal', authenticate, authorize(['OWNER']), async (req: AuthRequest, res, next) => {
  try {
    const { returnUrl } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id: req.user!.organizationId }
    });

    if (!organization?.stripeCustomerId) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'No active subscription'
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: returnUrl || process.env.APP_URL
    });

    res.json({
      data: {
        portalUrl: session.url
      }
    });
  } catch (error) {
    next(error);
  }
});

// Cancel subscription
router.post('/cancel', authenticate, authorize(['OWNER']), async (req: AuthRequest, res, next) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: req.user!.organizationId,
        status: 'active'
      }
    });

    if (!subscription) {
      return res.status(404).json({
        error: 'Not found',
        message: 'No active subscription'
      });
    }

    // Cancel at period end
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        status: stripeSubscription.status
      }
    });

    logger.info(`Subscription cancelled for org ${req.user!.organizationId}`);

    res.json({
      message: 'Subscription will be cancelled at period end',
      data: {
        cancelAt: stripeSubscription.current_period_end
      }
    });
  } catch (error) {
    next(error);
  }
});

// Reactivate subscription
router.post('/reactivate', authenticate, authorize(['OWNER']), async (req: AuthRequest, res, next) => {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        organizationId: req.user!.organizationId,
        cancelAtPeriodEnd: true
      }
    });

    if (!subscription) {
      return res.status(404).json({
        error: 'Not found',
        message: 'No cancelled subscription found'
      });
    }

    // Reactivate
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: false,
        status: stripeSubscription.status
      }
    });

    logger.info(`Subscription reactivated for org ${req.user!.organizationId}`);

    res.json({
      message: 'Subscription reactivated',
      data: { subscription }
    });
  } catch (error) {
    next(error);
  }
});

// Get available plans
router.get('/plans', async (req, res, next) => {
  try {
    const plans = [
      {
        id: 'STARTER',
        name: 'Starter',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Track assets across 2 countries',
          'Basic budgeting tools',
          'Email support',
          'Mobile app access'
        ]
      },
      {
        id: 'FAMILY',
        name: 'Family',
        price: 19.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Everything in Starter',
          'Unlimited countries',
          'Family sharing (up to 5 members)',
          'Advanced analytics',
          'Priority support'
        ]
      },
      {
        id: 'PREMIUM',
        name: 'Premium',
        price: 39.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'Everything in Family',
          'Unlimited family members',
          'Bank connections',
          'Tax optimization tools',
          'Dedicated support',
          'Custom reports'
        ]
      }
    ];

    res.json({
      data: { plans }
    });
  } catch (error) {
    next(error);
  }
});

export default router;