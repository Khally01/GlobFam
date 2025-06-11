import { PrismaClient, PricingPlan, UserRole, AssetType } from '@prisma/client';
import { hashPassword } from '../src/utils/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo organization and user
  const demoOrg = await prisma.organization.create({
    data: {
      name: 'Demo Organization',
      slug: 'demo-org',
      plan: PricingPlan.FAMILY,
      billingEmail: 'demo@globfam.app',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  console.log('✅ Created demo organization');

  // Create demo user
  const passwordHash = await hashPassword('demo123456');
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@globfam.app',
      name: 'Khally Dashdorj',
      passwordHash,
      role: UserRole.OWNER,
      country: 'AU',
      preferredCurrency: 'AUD',
      language: 'en',
      organizationId: demoOrg.id,
      emailVerified: new Date()
    }
  });

  console.log('✅ Created demo user');

  // Create demo family
  const demoFamily = await prisma.family.create({
    data: {
      name: 'Dashdorj Family',
      description: 'International student family from Mongolia',
      inviteCode: 'DEMO2025',
      organizationId: demoOrg.id,
      createdById: demoUser.id,
      members: {
        connect: { id: demoUser.id }
      }
    }
  });

  console.log('✅ Created demo family');

  // Create demo assets
  const assets = await Promise.all([
    // Australian assets
    prisma.asset.create({
      data: {
        name: 'ANZ Savings Account',
        type: AssetType.CASH,
        subtype: 'Savings',
        country: 'AU',
        currency: 'AUD',
        amount: '25000',
        userId: demoUser.id,
        organizationId: demoOrg.id,
        dataSource: 'MANUAL'
      }
    }),
    prisma.asset.create({
      data: {
        name: 'Australian Super',
        type: AssetType.SUPERANNUATION,
        country: 'AU',
        currency: 'AUD',
        amount: '45000',
        userId: demoUser.id,
        organizationId: demoOrg.id,
        dataSource: 'MANUAL'
      }
    }),
    // Mongolian assets
    prisma.asset.create({
      data: {
        name: 'Khan Bank Account',
        type: AssetType.CASH,
        subtype: 'Checking',
        country: 'MN',
        currency: 'MNT',
        amount: '15000000',
        familyId: demoFamily.id,
        organizationId: demoOrg.id,
        dataSource: 'MANUAL'
      }
    }),
    prisma.asset.create({
      data: {
        name: 'Ulaanbaatar Apartment',
        type: AssetType.PROPERTY,
        subtype: 'Residential',
        country: 'MN',
        currency: 'MNT',
        amount: '250000000',
        metadata: {
          address: 'Sukhbaatar District, UB',
          size: '75m2',
          bedrooms: 2
        },
        familyId: demoFamily.id,
        organizationId: demoOrg.id,
        dataSource: 'MANUAL'
      }
    })
  ]);

  console.log('✅ Created demo assets');

  // Create demo transactions
  const transactions = await Promise.all([
    prisma.transaction.create({
      data: {
        type: 'INCOME',
        category: 'Salary',
        amount: '5500',
        currency: 'AUD',
        description: 'Monthly salary',
        date: new Date('2025-06-01'),
        assetId: assets[0].id,
        userId: demoUser.id,
        organizationId: demoOrg.id
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        category: 'Rent',
        amount: '2200',
        currency: 'AUD',
        description: 'Monthly rent payment',
        date: new Date('2025-06-05'),
        assetId: assets[0].id,
        userId: demoUser.id,
        organizationId: demoOrg.id
      }
    }),
    prisma.transaction.create({
      data: {
        type: 'EXPENSE',
        category: 'Childcare',
        amount: '1500',
        currency: 'AUD',
        description: 'Childcare fees',
        date: new Date('2025-06-10'),
        assetId: assets[0].id,
        userId: demoUser.id,
        organizationId: demoOrg.id
      }
    })
  ]);

  console.log('✅ Created demo transactions');

  // Create valuations for property
  await prisma.valuation.create({
    data: {
      assetId: assets[3].id, // Ulaanbaatar apartment
      value: '250000000',
      currency: 'MNT',
      source: 'manual',
      date: new Date()
    }
  });

  console.log('✅ Created demo valuations');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📧 Demo login credentials:');
  console.log('Email: demo@globfam.app');
  console.log('Password: demo123456');
  console.log('Family invite code: DEMO2025');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });