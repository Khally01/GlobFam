// User types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  familyId?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt?: string;
}

// Family types
export interface Family {
  id: string;
  name: string;
  createdBy: string;
  members: FamilyMember[];
  inviteCode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FamilyMember {
  userId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  displayName: string;
  email: string;
  photoURL?: string;
}

// Currency types
export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number; // Rate relative to USD
}

export interface CurrencyBalance {
  userId: string;
  currency: string;
  amount: number;
  lastUpdated: Date;
}

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Register: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  FamilyHub: undefined;
  Transactions: undefined;
  VisaCompliance: undefined;
  Settings: undefined;
};

// Redux state types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isDemo?: boolean;
}

export interface FamilyState {
  family: Family | null;
  members: FamilyMember[];
  isLoading: boolean;
  error: string | null;
}

export interface CurrencyState {
  currencies: Currency[];
  balances: CurrencyBalance[];
  selectedCurrency: string;
  isLoading: boolean;
  error: string | null;
}

export interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  family: FamilyState;
  currency: CurrencyState;
  transaction: TransactionState;
}