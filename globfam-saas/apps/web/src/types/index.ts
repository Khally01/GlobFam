// Temporary types to fix build
export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  familyId?: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  plan: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  name: string;
  code: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  currency: string;
  amount: number;
  userId: string;
  familyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  currency: string;
  description?: string;
  date: Date;
  userId: string;
  assetId?: string;
  familyId?: string;
  createdAt: Date;
  updatedAt: Date;
}