import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Family, FamilyMember, FamilyState } from '../../types';
import { createFamily, joinFamily, getFamilyData } from '../../services/firebase';
import { DEMO_FAMILY, DEMO_USERS } from '../../services/mockDataService';
import { loginDemo } from './authSlice';

const initialState: FamilyState = {
  family: null,
  members: [],
  isLoading: false,
  error: null,
};

export const createNewFamily = createAsyncThunk(
  'family/create',
  async ({ name, userId, userDisplayName, userEmail }: { 
    name: string; 
    userId: string; 
    userDisplayName: string; 
    userEmail: string;
  }) => {
    const family = await createFamily(name, userId, userDisplayName, userEmail);
    return family as Family;
  }
);

export const joinExistingFamily = createAsyncThunk(
  'family/join',
  async ({ inviteCode, userId, userDisplayName, userEmail }: { 
    inviteCode: string; 
    userId: string; 
    userDisplayName: string; 
    userEmail: string;
  }) => {
    const family = await joinFamily(inviteCode, userId, userDisplayName, userEmail);
    return family as Family;
  }
);

export const fetchFamily = createAsyncThunk(
  'family/fetch',
  async (familyId: string) => {
    const family = await getFamilyData(familyId);
    return family as Family;
  }
);

const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    setFamily: (state, action: PayloadAction<Family | null>) => {
      state.family = action.payload;
      state.members = action.payload?.members || [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create family
    builder
      .addCase(createNewFamily.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.family = action.payload;
        state.members = action.payload.members;
      })
      .addCase(createNewFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create family';
      });

    // Join family
    builder
      .addCase(joinExistingFamily.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinExistingFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.family = action.payload;
        state.members = action.payload.members;
      })
      .addCase(joinExistingFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to join family';
      });

    // Fetch family
    builder
      .addCase(fetchFamily.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFamily.fulfilled, (state, action) => {
        state.isLoading = false;
        state.family = action.payload;
        state.members = action.payload.members;
      })
      .addCase(fetchFamily.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch family';
      });

    // Handle demo login
    builder
      .addCase(loginDemo.fulfilled, (state) => {
        // Set demo family data
        const demoMembers: FamilyMember[] = DEMO_USERS.map(user => ({
          userId: user.uid,
          role: user.uid === 'demo-user-1' ? 'admin' : 'member',
          joinedAt: new Date(),
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        }));

        state.family = {
          ...DEMO_FAMILY,
          createdAt: new Date(),
          updatedAt: new Date(),
          members: demoMembers,
        } as Family;
        state.members = demoMembers;
      });
  },
});

export const { setFamily, clearError } = familySlice.actions;
export default familySlice.reducer;