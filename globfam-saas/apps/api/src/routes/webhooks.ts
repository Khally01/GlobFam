import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Stripe webhook
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        logger.info(`Unhandled webhook event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error(`Webhook handler error: ${error.message}`);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organizationId;
  const plan = session.metadata?.plan;

  if (!organizationId || !plan) {
    logger.error('Missing metadata in checkout session');
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

  await prisma.$transaction([
    prisma.organization.update({
      where: { id: organizationId },
      data: {
        plan: plan as any,
        subscriptionId: subscription.id,
        billingEmail: session.customer_email || undefined
      }
    }),
    prisma.subscription.create({
      data: {
        organizationId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000)
      }
    })
  ]);

  logger.info(`Checkout completed for org ${organizationId}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata?.organizationId;
  if (!organizationId) return;

  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (dbSubscription) {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  }

  // Update organization plan if changed
  const priceId = subscription.items.data[0].price.id;
  let plan: string | undefined;

  for (const [key, value] of Object.entries(PRICE_TO_PLAN)) {
    if (value === priceId) {
      plan = key;
      break;
    }
  }

  if (plan) {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { plan: plan as any }
    });
  }

  logger.info(`Subscription updated for org ${organizationId}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const dbSubscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id }
  });

  if (!dbSubscription) return;

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: { status: 'canceled' }
    }),
    prisma.organization.update({
      where: { id: dbSubscription.organizationId },
      data: { 
        plan: 'STARTER',
        subscriptionId: null
      }
    })
  ]);

  logger.info(`Subscription deleted for org ${dbSubscription.organizationId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  logger.info(`Payment succeeded for invoice ${invoice.id}`);
  // Could send payment receipt email here
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const organizationId = subscription.metadata?.organizationId;

  if (organizationId) {
    // Could send payment failure notification here
    logger.warn(`Payment failed for org ${organizationId}`);
  }
}

// Helper to map price IDs to plans
const PRICE_TO_PLAN: Record<string, string> = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID!,
  FAMILY: process.env.STRIPE_FAMILY_PRICE_ID!,
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID!
};

export default router;