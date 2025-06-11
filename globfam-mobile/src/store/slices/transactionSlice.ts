import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Transaction, TransactionState } from '../../types';
import { addTransaction, getUserTransactions } from '../../services/firebase';
import { DEMO_TRANSACTIONS } from '../../services/mockDataService';
import { loginDemo } from './authSlice';

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transaction/fetchAll',
  async (userId: string) => {
    const transactions = await getUserTransactions(userId);
    return transactions as Transaction[];
  }
);

export const createTransaction = createAsyncThunk(
  'transaction/create',
  async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction = await addTransaction(transaction);
    return newTransaction as Transaction;
  }
);

const transactionSlice = createSlice({
  name: 'transaction',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      });

    // Create transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create transaction';
      });

    // Handle demo login
    builder
      .addCase(loginDemo.fulfilled, (state) => {
        // Load demo transactions
        state.transactions = DEMO_TRANSACTIONS.map(transaction => ({
          ...transaction,
          date: new Date(transaction.date),
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
      });
  },
});

export const { clearError } = transactionSlice.actions;
export default transactionSlice.reducer;