import { apiClient } from './api.client';

interface LoginResponse {
  status: string;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      emailVerified: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export const authService = {
  async login(email: string, password: string) {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return {
      user: response.data.data.user,
      tokens: response.data.data.tokens,
    };
  },

  async register(data: RegisterData) {
    const response = await apiClient.post<LoginResponse>('/auth/register', data);
    return {
      user: response.data.data.user,
      tokens: response.data.data.tokens,
    };
  },

  async logout(token: string) {
    await apiClient.post('/auth/logout', {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  async refreshTokens(refreshToken: string) {
    const response = await apiClient.post<{
      status: string;
      data: {
        tokens: {
          accessToken: string;
          refreshToken: string;
        };
      };
    }>('/auth/refresh', { refreshToken });
    return response.data.data;
  },

  async verifyEmail(token: string) {
    await apiClient.get(`/auth/verify-email/${token}`);
  },

  async forgotPassword(email: string) {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string) {
    await apiClient.post('/auth/reset-password', { token, password });
  },
};