import axios from 'axios'
import type { ApiResponse } from '@/lib/shared-types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse>('/api/auth/login', data),
  
  register: (data: {
    email: string
    password: string
    name: string
    organizationName: string
    country?: string
    language?: string
  }) => api.post<ApiResponse>('/api/auth/register', data),
  
  logout: () => api.post<ApiResponse>('/api/auth/logout'),
  
  getMe: () => api.get<ApiResponse>('/api/auth/me'),
}

// Assets API
export const assetsApi = {
  getAll: (params?: { type?: string; country?: string; familyId?: string }) =>
    api.get<ApiResponse>('/api/assets', { params }),
  
  getById: (id: string) => api.get<ApiResponse>(`/api/assets/${id}`),
  
  create: (data: any) => api.post<ApiResponse>('/api/assets', data),
  
  update: (id: string, data: any) => api.put<ApiResponse>(`/api/assets/${id}`, data),
  
  delete: (id: string) => api.delete<ApiResponse>(`/api/assets/${id}`),
  
  addValuation: (id: string, data: any) =>
    api.post<ApiResponse>(`/api/assets/${id}/valuations`, data),
}

// Transactions API
export const transactionsApi = {
  getAll: (params?: {
    assetId?: string
    type?: string
    category?: string
    startDate?: string
    endDate?: string
    limit?: number
    offset?: number
  }) => api.get<ApiResponse>('/api/transactions', { params }),
  
  getById: (id: string) => api.get<ApiResponse>(`/api/transactions/${id}`),
  
  create: (data: any) => api.post<ApiResponse>('/api/transactions', data),
  
  update: (id: string, data: any) =>
    api.put<ApiResponse>(`/api/transactions/${id}`, data),
  
  delete: (id: string) => api.delete<ApiResponse>(`/api/transactions/${id}`),
  
  getAnalytics: (params?: { startDate?: string; endDate?: string; assetId?: string }) =>
    api.get<ApiResponse>('/api/transactions/analytics/summary', { params }),
}

// Families API
export const familiesApi = {
  getCurrent: () => api.get<ApiResponse>('/api/families/current'),
  
  create: (data: { name: string; description?: string }) =>
    api.post<ApiResponse>('/api/families', data),
  
  join: (inviteCode: string) =>
    api.post<ApiResponse>('/api/families/join', { inviteCode }),
  
  leave: () => api.post<ApiResponse>('/api/families/leave'),
  
  update: (data: { name?: string; description?: string }) =>
    api.put<ApiResponse>('/api/families/current', data),
  
  regenerateInvite: () =>
    api.post<ApiResponse>('/api/families/current/regenerate-invite'),
  
  getAssets: () => api.get<ApiResponse>('/api/families/current/assets'),
  
  removeMember: (memberId: string) =>
    api.delete<ApiResponse>(`/api/families/current/members/${memberId}`),
}

// Users API
export const usersApi = {
  updateProfile: (data: any) => api.put<ApiResponse>('/api/users/profile', data),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse>('/api/users/password', data),
  
  getOrganizationUsers: () => api.get<ApiResponse>('/api/users/organization'),
  
  updateUserRole: (userId: string, role: string) =>
    api.put<ApiResponse>(`/api/users/${userId}/role`, { role }),
  
  deleteUser: (userId: string) => api.delete<ApiResponse>(`/api/users/${userId}`),
}

// Subscriptions API
export const subscriptionsApi = {
  getCurrent: () => api.get<ApiResponse>('/api/subscriptions/current'),
  
  createCheckout: (data: {
    plan: 'STARTER' | 'FAMILY' | 'PREMIUM'
    successUrl: string
    cancelUrl: string
  }) => api.post<ApiResponse>('/api/subscriptions/checkout', data),
  
  createPortal: (returnUrl: string) =>
    api.post<ApiResponse>('/api/subscriptions/portal', { returnUrl }),
  
  cancel: () => api.post<ApiResponse>('/api/subscriptions/cancel'),
  
  reactivate: () => api.post<ApiResponse>('/api/subscriptions/reactivate'),
  
  getPlans: () => api.get<ApiResponse>('/api/subscriptions/plans'),
}