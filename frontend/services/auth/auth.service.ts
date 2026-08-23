import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { AuthUser } from "@/types/domain";

/**
 * Shape of `data` on both POST /auth/login and GET /auth/user (doc §2) —
 * `user` only carries id/name/email; roles and permissions are siblings,
 * not nested under `user`.
 */
type AuthSessionData = {
  user: { id: string | number; name: string; email: string };
  roles: string[];
  permissions: string[];
};

const toAuthUser = (data: AuthSessionData): AuthUser => ({
  id: String(data.user.id),
  name: data.user.name,
  email: data.user.email,
  roles: data.roles ?? [],
  permissions: data.permissions ?? [],
});

export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const response = await apiClient.post<{ data: AuthSessionData }>(
      API_ENDPOINTS.auth.login,
      { email, password },
    );

    return toAuthUser(response.data);
  },

  async logout() {
    await apiClient.post(API_ENDPOINTS.auth.logout);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<{ data: AuthSessionData }>(
        API_ENDPOINTS.auth.currentUser,
      );
      return toAuthUser(response.data);
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
