import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Organization, Family } from '@/lib/shared-types'

interface AuthState {
  user: User | null
  organization: Organization | null
  family: Family | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (data: {
    user: User
    organization: Organization
    family?: Family | null
    token: string
  }) => void
  updateUser: (user: Partial<User>) => void
  updateFamily: (family: Family | null) => void
  logout: () => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      family: null,
      token: null,
      isAuthenticated: false,

      setAuth: ({ user, organization, family, token }) => {
        // Supabase handles auth cookies automatically
        // We only store user data for UI purposes
        set({
          user,
          organization,
          family,
          token,
          isAuthenticated: true,
        })
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateFamily: (family) => set({ family }),

      logout: () => {
        // Supabase will handle clearing auth cookies
        set({
          user: null,
          organization: null,
          family: null,
          token: null,
          isAuthenticated: false,
        })
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage')
        }
        // Supabase will handle clearing auth cookies
        set({
          user: null,
          organization: null,
          family: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        family: state.family,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)