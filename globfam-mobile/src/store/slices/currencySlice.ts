import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Currency, CurrencyBalance, CurrencyState } from '../../types';
import { updateCurrencyBalance, getUserBalances } from '../../services/firebase';
import currencyService from '../../services/currencyService';
import { DEMO_BALANCES } from '../../services/mockDataService';
import { loginDemo } from './authSlice';

const initialState: CurrencyState = {
  currencies: currencyService.getAllCurrencies(),
  balances: [],
  selectedCurrency: 'USD',
  isLoading: false,
  error: null,
};

export const fetchUserBalances = createAsyncThunk(
  'currency/fetchBalances',
  async (userId: string) => {
    const balances = await getUserBalances(userId);
    return balances as CurrencyBalance[];
  }
);

export const updateBalance = createAsyncThunk(
  'currency/updateBalance',
  async ({ userId, currency, amount }: { userId: string; currency: string; amount: number }) => {
    await updateCurrencyBalance(userId, currency, amount);
    return { userId, currency, amount, lastUpdated: new Date() };
  }
);

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setSelectedCurrency: (state, action: PayloadAction<string>) => {
      state.selectedCurrency = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch balances
    builder
      .addCase(fetchUserBalances.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBalances.fulfilled, (state, action) => {
        state.isLoading = false;
        state.balances = action.payload;
      })
      .addCase(fetchUserBalances.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch balances';
      });

    // Update balance
    builder
      .addCase(updateBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBalance.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.balances.findIndex(
          b => b.userId === action.payload.userId && b.currency === action.payload.currency
        );
        if (index !== -1) {
          state.balances[index] = action.payload;
        } else {
          state.balances.push(action.payload);
        }
      })
      .addCase(updateBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update balance';
      });

    // Handle demo login
    builder
      .addCase(loginDemo.fulfilled, (state, action) => {
        // Load demo balances for the logged-in user
        state.balances = DEMO_BALANCES
          .filter(balance => balance.userId === action.payload.uid)
          .map(balance => ({
            ...balance,
            lastUpdated: new Date(balance.lastUpdated),
          }));
      });
  },
});

export const { setSelectedCurrency, clearError } = currencySlice.actions;
export default currencySlice.reducer;