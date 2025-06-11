import { z } from 'zod';

// User types
export const UserRoleEnum = z.enum(['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRoleEnum,
  avatar: z.string().nullable(),
  country: z.string(),
  preferredCurrency: z.string(),
  language: z.string(),
  timezone: z.string(),
  organizationId: z.string(),
  familyId: z.string().nullable(),
  emailVerified: z.date().nullable(),
  twoFactorEnabled: z.boolean(),
  lastLoginAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type User = z.infer<typeof UserSchema>;

// Organization types
export const PricingPlanEnum = z.enum(['STARTER', 'FAMILY', 'PREMIUM', 'ENTERPRISE']);
export type PricingPlan = z.infer<typeof PricingPlanEnum>;

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  plan: PricingPlanEnum,
  stripeCustomerId: z.string().nullable(),
  billingEmail: z.string().nullable(),
  trialEndsAt: z.date().nullable(),
  subscriptionId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Organization = z.infer<typeof OrganizationSchema>;

// Family types
export const FamilySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  inviteCode: z.string(),
  organizationId: z.string(),
  createdById: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Family = z.infer<typeof FamilySchema>;

// Asset types
export const AssetTypeEnum = z.enum([
  'CASH',
  'PROPERTY',
  'VEHICLE',
  'INVESTMENT',
  'CRYPTO',
  'SUPERANNUATION',
  'SOCIAL_INSURANCE',
  'DEBT',
  'OTHER'
]);
export type AssetType = z.infer<typeof AssetTypeEnum>;

export const DataSourceEnum = z.enum(['MANUAL', 'PLAID', 'BASIQ', 'CUSTOM_BANK', 'IMPORT']);
export type DataSource = z.infer<typeof DataSourceEnum>;

export const AssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: AssetTypeEnum,
  subtype: z.string().nullable(),
  country: z.string(),
  currency: z.string(),
  amount: z.string(),
  metadata: z.record(z.any()).nullable(),
  userId: z.string().nullable(),
  familyId: z.string().nullable(),
  organizationId: z.string(),
  lastSyncedAt: z.date().nullable(),
  dataSource: DataSourceEnum,
  externalId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Asset = z.infer<typeof AssetSchema>;

// Transaction types
export const TransactionTypeEnum = z.enum(['INCOME', 'EXPENSE', 'TRANSFER']);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const TransactionSchema = z.object({
  id: z.string(),
  type: TransactionTypeEnum,
  category: z.string(),
  amount: z.string(),
  currency: z.string(),
  description: z.string().nullable(),
  date: z.date(),
  assetId: z.string(),
  userId: z.string(),
  organizationId: z.string(),
  externalId: z.string().nullable(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Auth types
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  organizationName: z.string().min(2),
  country: z.string().default('AU'),
  language: z.string().default('en')
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Currency types
export const SUPPORTED_CURRENCIES = ['USD', 'AUD', 'MNT', 'EUR', 'GBP', 'CNY', 'JPY', 'KRW'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// Transaction categories
export const INCOME_CATEGORIES = [
  'Salary',
  'Business',
  'Investment',
  'Rental',
  'Gift',
  'Other'
] as const;

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Mortgage',
  'Groceries',
  'Utilities',
  'Transport',
  'Healthcare',
  'Education',
  'Childcare',
  'Entertainment',
  'Shopping',
  'Insurance',
  'Taxes',
  'Other'
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];