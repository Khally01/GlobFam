import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types';
import { registerUser, loginUser, logoutUser, getUserData } from '../../services/firebase';
import { DEMO_USERS } from '../../services/mockDataService';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isDemo: false,
};

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    const firebaseUser = await registerUser(email, password, displayName);
    const userData = await getUserData(firebaseUser.uid);
    return userData as User;
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const firebaseUser = await loginUser(email, password);
    const userData = await getUserData(firebaseUser.uid);
    return userData as User;
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutUser();
});

export const loginDemo = createAsyncThunk('auth/loginDemo', async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const demoUser = DEMO_USERS[0];
  return {
    uid: demoUser.uid,
    email: demoUser.email,
    displayName: demoUser.displayName,
    photoURL: demoUser.photoURL,
    familyId: 'demo-family-1',
    createdAt: new Date().toISOString(),
  } as User;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isDemo = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Logout failed';
      });

    // Demo Login
    builder
      .addCase(loginDemo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginDemo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isDemo = true;
      })
      .addCase(loginDemo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Demo login failed';
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;