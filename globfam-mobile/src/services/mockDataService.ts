import { User } from 'firebase/auth';

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface MockTransaction {
  id: string;
  userId: string;
  familyId: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  type: 'income' | 'expense';
}

export interface MockFamily {
  id: string;
  name: string;
  members: string[];
  inviteCode: string;
  createdBy: string;
  createdAt: string;
}

export interface MockBalance {
  userId: string;
  currency: string;
  amount: number;
  lastUpdated: string;
}

// Demo user accounts
export const DEMO_USERS: MockUser[] = [
  {
    uid: 'demo-user-1',
    email: 'demo@globfam.app',
    displayName: 'Khally Dashdorj',
    photoURL: 'https://ui-avatars.com/api/?name=Khally+Dashdorj&background=4CAF50&color=fff'
  },
  {
    uid: 'demo-user-2',
    email: 'partner@globfam.app',
    displayName: 'Partner Name',
    photoURL: 'https://ui-avatars.com/api/?name=Partner+Name&background=2196F3&color=fff'
  }
];

// Demo family
export const DEMO_FAMILY: MockFamily = {
  id: 'demo-family-1',
  name: 'Dashdorj Family',
  members: ['demo-user-1', 'demo-user-2'],
  inviteCode: 'DEMO2024',
  createdBy: 'demo-user-1',
  createdAt: new Date().toISOString()
};

// Demo balances
export const DEMO_BALANCES: MockBalance[] = [
  // Khally's balances
  { userId: 'demo-user-1', currency: 'USD', amount: 45000, lastUpdated: new Date().toISOString() },
  { userId: 'demo-user-1', currency: 'AUD', amount: 35000, lastUpdated: new Date().toISOString() },
  { userId: 'demo-user-1', currency: 'MNT', amount: 25000000, lastUpdated: new Date().toISOString() },
  // Partner's balances
  { userId: 'demo-user-2', currency: 'USD', amount: 30000, lastUpdated: new Date().toISOString() },
  { userId: 'demo-user-2', currency: 'AUD', amount: 25000, lastUpdated: new Date().toISOString() },
];

// Demo transactions
export const DEMO_TRANSACTIONS: MockTransaction[] = [
  // Recent transactions
  {
    id: 'trans-1',
    userId: 'demo-user-1',
    familyId: 'demo-family-1',
    amount: 1500,
    currency: 'AUD',
    category: 'Education',
    description: 'University tuition payment',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'expense'
  },
  {
    id: 'trans-2',
    userId: 'demo-user-1',
    familyId: 'demo-family-1',
    amount: 450,
    currency: 'AUD',
    category: 'Groceries',
    description: 'Weekly shopping at Woolworths',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'expense'
  },
  {
    id: 'trans-3',
    userId: 'demo-user-2',
    familyId: 'demo-family-1',
    amount: 3200,
    currency: 'AUD',
    category: 'Income',
    description: 'Part-time work salary',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'income'
  },
  {
    id: 'trans-4',
    userId: 'demo-user-1',
    familyId: 'demo-family-1',
    amount: 2500000,
    currency: 'MNT',
    category: 'Transfer',
    description: 'Money from parents',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'income'
  },
  {
    id: 'trans-5',
    userId: 'demo-user-1',
    familyId: 'demo-family-1',
    amount: 180,
    currency: 'AUD',
    category: 'Transportation',
    description: 'Monthly Opal card top-up',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'expense'
  },
  {
    id: 'trans-6',
    userId: 'demo-user-2',
    familyId: 'demo-family-1',
    amount: 95,
    currency: 'AUD',
    category: 'Utilities',
    description: 'Internet bill',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'expense'
  },
  {
    id: 'trans-7',
    userId: 'demo-user-1',
    familyId: 'demo-family-1',
    amount: 320,
    currency: 'USD',
    category: 'Investment',
    description: 'Monthly crypto investment',
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'expense'
  },
  {
    id: 'trans-8',
    userId: 'demo-user-1',
    familyId: 'demo-family-1',
    amount: 890,
    currency: 'AUD',
    category: 'Rent',
    description: 'Weekly rent payment',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'expense'
  }
];

// Exchange rates for demo
export const DEMO_EXCHANGE_RATES = {
  USD: 1,
  AUD: 1.52,
  MNT: 3450
};

// Helper functions
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  const fromRate = DEMO_EXCHANGE_RATES[fromCurrency as keyof typeof DEMO_EXCHANGE_RATES] || 1;
  const toRate = DEMO_EXCHANGE_RATES[toCurrency as keyof typeof DEMO_EXCHANGE_RATES] || 1;
  return (amount / fromRate) * toRate;
};

export const getTotalBalanceInCurrency = (userId: string, targetCurrency: string): number => {
  const userBalances = DEMO_BALANCES.filter(b => b.userId === userId);
  return userBalances.reduce((total, balance) => {
    const converted = convertCurrency(balance.amount, balance.currency, targetCurrency);
    return total + converted;
  }, 0);
};

export const getRecentTransactions = (userId: string, limit: number = 10): MockTransaction[] => {
  return DEMO_TRANSACTIONS
    .filter(t => t.userId === userId || DEMO_FAMILY.members.includes(userId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getCategoryBreakdown = (userId: string) => {
  const transactions = DEMO_TRANSACTIONS.filter(
    t => t.userId === userId && t.type === 'expense'
  );
  
  const breakdown: { [key: string]: number } = {};
  
  transactions.forEach(t => {
    const amountInUSD = convertCurrency(t.amount, t.currency, 'USD');
    breakdown[t.category] = (breakdown[t.category] || 0) + amountInUSD;
  });
  
  return Object.entries(breakdown).map(([category, amount]) => ({
    category,
    amount,
    percentage: 0 // Will be calculated based on total
  }));
};