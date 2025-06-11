import { Transaction } from '../types';

export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  return formatDate(then);
};

export const calculateMonthlyTotal = (
  transactions: Transaction[],
  type: 'income' | 'expense',
  currency?: string
): number => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return transactions
    .filter(t => 
      t.type === type && 
      new Date(t.date) >= startOfMonth &&
      (!currency || t.currency === currency)
    )
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getTransactionIcon = (category: string): string => {
  const iconMap: { [key: string]: string } = {
    'Food & Dining': 'food',
    'Shopping': 'cart',
    'Transportation': 'car',
    'Entertainment': 'movie',
    'Bills & Utilities': 'receipt',
    'Healthcare': 'hospital',
    'Education': 'school',
    'Travel': 'airplane',
    'Salary': 'cash',
    'Investment': 'trending-up',
    'Gift': 'gift',
    'Other': 'dots-horizontal',
  };
  
  return iconMap[category] || 'dots-horizontal';
};

export const getTransactionCategories = (type: 'income' | 'expense'): string[] => {
  if (type === 'income') {
    return [
      'Salary',
      'Investment',
      'Business',
      'Gift',
      'Refund',
      'Other',
    ];
  }
  
  return [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other',
  ];
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Add more password validation rules as needed
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};