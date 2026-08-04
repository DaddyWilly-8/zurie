import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { isMockMode } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";
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
    const payload = isMockMode()
      ? await mockBackend.auth.login(email, password)
      : await apiClient.post<LoginResponse>(API_ENDPOINTS.auth.login, { email, password });

    saveSession(payload);
    return payload.user;
  },

  async logout() {
    if (!isMockMode()) {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    }

    clearSession();
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    if (isMockMode()) {
      return readSession()?.user ?? null;
    }

    try {
      const response = await apiClient.get<{ data: AuthUser }>(API_ENDPOINTS.auth.currentUser);
      return response.data;
    } catch {
      return null;
    }
  },

  async forgotPassword(email: string) {
    if (isMockMode()) {
      return { success: true };
    }

    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.auth.forgotPassword, { email });
  },

  async resetPassword(password: string) {
    if (isMockMode()) {
      return { success: true };
    }

    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.auth.resetPassword, {
      password,
    });
  },
};
