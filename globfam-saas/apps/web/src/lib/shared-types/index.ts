// Shared types for the web app
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  avatar?: string | null;
  country: string;
  preferredCurrency: string;
  language: string;
  timezone: string;
  organizationId: string;
  familyId?: string | null;
  emailVerified?: Date | null;
  twoFactorEnabled?: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  plan: 'STARTER' | 'FAMILY' | 'PREMIUM' | 'ENTERPRISE';
  stripeCustomerId?: string | null;
  billingEmail?: string | null;
  trialEndsAt?: Date | null;
  subscriptionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  description?: string | null;
  inviteCode: string;
  organizationId: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AssetType = 'CASH' | 'PROPERTY' | 'VEHICLE' | 'INVESTMENT' | 'CRYPTO' | 'SUPERANNUATION' | 'SOCIAL_INSURANCE' | 'DEBT' | 'OTHER';

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  subtype?: string;
  currency: string;
  amount: string;
  userId: string;
  familyId?: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: string;
  currency: string;
  description?: string;
  date: Date;
  assetId: string;
  userId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  organizationName: string;
  country?: string;
  language?: string;
}

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