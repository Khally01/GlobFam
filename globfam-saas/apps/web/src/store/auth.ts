import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Organization, Family } from '@globfam/types'

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
        localStorage.setItem('token', token)
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
        localStorage.removeItem('token')
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
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)