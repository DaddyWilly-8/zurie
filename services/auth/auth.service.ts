import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { AuthUser } from "@/types/domain";

const AUTH_STORAGE_KEY = "zurie_admin_session";

type LoginResponse = {
  token?: string;
  user: AuthUser;
};

const saveSession = (session: LoginResponse) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const clearSession = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const readSession = (): LoginResponse | null => {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!value) return null;

  try {
    return JSON.parse(value) as LoginResponse;
  } catch {
    clearSession();
    return null;
  }
};

export const authService = {
  async login(email: string, password: string) {
    const payload = await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, { email, password });

    saveSession(payload);
    return payload.user;
  },

  async logout() {
    await apiClient.post(API_ENDPOINTS.auth.logout);

    clearSession();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<{ data: AuthUser }>(API_ENDPOINTS.auth.currentUser);
      return response.data;
    } catch {
      return null;
    }
  },

  async forgotPassword(email: string) {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.auth.forgotPassword, { email });
  },

  async resetPassword(payload: {
    token: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  }) {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.auth.resetPassword, {
      token: payload.token,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    });
  },
};
