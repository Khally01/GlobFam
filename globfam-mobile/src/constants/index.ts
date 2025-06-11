export const APP_NAME = 'GlobFam';
export const APP_VERSION = '1.0.0';

export const COLORS = {
  primary: '#2196F3',
  secondary: '#4CAF50',
  tertiary: '#FF9800',
  error: '#F44336',
  warning: '#FFC107',
  info: '#00BCD4',
  success: '#4CAF50',
};

export const TRANSACTION_CATEGORIES = {
  income: [
    { value: 'salary', label: 'Salary', icon: 'cash' },
    { value: 'investment', label: 'Investment', icon: 'trending-up' },
    { value: 'business', label: 'Business', icon: 'briefcase' },
    { value: 'gift', label: 'Gift', icon: 'gift' },
    { value: 'refund', label: 'Refund', icon: 'cash-refund' },
    { value: 'other', label: 'Other', icon: 'dots-horizontal' },
  ],
  expense: [
    { value: 'food', label: 'Food & Dining', icon: 'food' },
    { value: 'shopping', label: 'Shopping', icon: 'cart' },
    { value: 'transport', label: 'Transportation', icon: 'car' },
    { value: 'entertainment', label: 'Entertainment', icon: 'movie' },
    { value: 'bills', label: 'Bills & Utilities', icon: 'receipt' },
    { value: 'healthcare', label: 'Healthcare', icon: 'hospital' },
    { value: 'education', label: 'Education', icon: 'school' },
    { value: 'travel', label: 'Travel', icon: 'airplane' },
    { value: 'other', label: 'Other', icon: 'dots-horizontal' },
  ],
};

export const CURRENCY_DISPLAY_LIMIT = 5;
export const TRANSACTION_PAGE_SIZE = 20;
export const FAMILY_MEMBER_LIMIT = 20;

export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  auth: {
    invalidCredentials: 'Invalid email or password.',
    userNotFound: 'User not found.',
    emailInUse: 'Email is already in use.',
    weakPassword: 'Password is too weak.',
    requiresRecentLogin: 'This operation requires recent authentication.',
  },
  family: {
    invalidCode: 'Invalid invite code.',
    alreadyMember: 'You are already a member of this family.',
    limitReached: 'Family member limit reached.',
  },
  transaction: {
    invalidAmount: 'Please enter a valid amount.',
    missingFields: 'Please fill in all required fields.',
  },
};

export const SUCCESS_MESSAGES = {
  auth: {
    register: 'Account created successfully!',
    login: 'Welcome back!',
    logout: 'Logged out successfully.',
    passwordReset: 'Password reset email sent.',
  },
  family: {
    created: 'Family created successfully!',
    joined: 'Successfully joined the family!',
    memberAdded: 'Member added successfully.',
  },
  transaction: {
    added: 'Transaction added successfully!',
    updated: 'Transaction updated successfully.',
    deleted: 'Transaction deleted successfully.',
  },
  profile: {
    updated: 'Profile updated successfully!',
  },
};

export const ASYNC_STORAGE_KEYS = {
  userPreferences: '@user_preferences',
  selectedCurrency: '@selected_currency',
  theme: '@theme',
  lastSync: '@last_sync',
};