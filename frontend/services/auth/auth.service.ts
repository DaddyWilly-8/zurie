import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { AuthUser } from "@/types/domain";

type LoginResponse = {
  token?: string;
  user: AuthUser;
};

export const authService = {
  async login(email: string, password: string) {
    const payload = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.auth.login,
      { email, password },
    );

    return payload.user;
  },

  async logout() {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<{ data: AuthUser }>(
        API_ENDPOINTS.auth.currentUser,
      );
      return response.data;
    } catch {
      return null;
    }
  },

  async forgotPassword(email: string) {
    return apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.auth.forgotPassword,
      { email },
    );
  },

  async resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) {
    return apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.auth.resetPassword,
      {
        token: payload.token,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation,
      },
    );
  },
};
