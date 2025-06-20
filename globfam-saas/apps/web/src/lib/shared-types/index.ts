// Shared types for the web app
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  organizationId: string;
  familyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  plan: 'STARTER' | 'FAMILY' | 'PREMIUM' | 'ENTERPRISE';
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  inviteCode: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  currency: string;
  amount: string;
  userId: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category: string;
  amount: string;
  currency: string;
  description?: string;
  date: Date;
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
}

export const SUPPORTED_CURRENCIES = ['USD', 'AUD', 'MNT', 'EUR', 'GBP', 'CNY', 'JPY', 'KRW'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];