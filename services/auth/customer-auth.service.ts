import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { AuthUser } from "@/types/domain";

/**
 * Shape of `data` on the customer guard's login/register/user endpoints —
 * mirrors AuthSessionData (staff) but `user` also carries `hasProfile`
 * (whether a Customer/stakeholder record is linked yet), and roles/
 * permissions are always empty arrays (customers never go through RBAC).
 */
type CustomerSessionData = {
  user: {
    id: string | number;
    name: string;
    email: string;
    hasProfile: boolean;
  };
  roles: string[];
  permissions: string[];
};

const toAuthUser = (data: CustomerSessionData): AuthUser => ({
  id: String(data.user.id),
  name: data.user.name,
  email: data.user.email,
  roles: [],
  permissions: [],
});

/**
 * Customer-only ('customer' guard) — a completely independent login from
 * services/auth/auth.service.ts's `authService` (staff), despite sharing
 * the same session cookie. See the backend's CustomerAccount model
 * docblock for why the two guards never interfere with each other.
 */
export const customerAuthService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const response = await apiClient.post<{ data: CustomerSessionData }>(
      API_ENDPOINTS.customerAuth.login,
      { email, password },
    );

    return toAuthUser(response.data);
  },

  /**
   * POST /customer/auth/register — logs the new customer in immediately
   * (same session-cookie flow as login), so the caller can treat this
   * exactly like login() once it resolves. `phone` is required
   * server-side; a phone already claimed by another *registered*
   * customer account comes back as a 422 on that field specifically.
   */
  async register(payload: {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
    phone: string;
    whatsappNumber?: string;
  }): Promise<AuthUser> {
    const response = await apiClient.post<{ data: CustomerSessionData }>(
      API_ENDPOINTS.customerAuth.register,
      {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation,
        phone: payload.phone,
        whatsappNumber: payload.whatsappNumber || undefined,
      },
    );

    return toAuthUser(response.data);
  },

  async logout() {
    await apiClient.post(API_ENDPOINTS.customerAuth.logout);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const response = await apiClient.get<{ data: CustomerSessionData }>(
        API_ENDPOINTS.customerAuth.currentUser,
      );
      return toAuthUser(response.data);
    } catch {
      return null;
    }
  },

  async forgotPassword(email: string) {
    return apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.customerAuth.forgotPassword,
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
      API_ENDPOINTS.customerAuth.resetPassword,
      {
        token: payload.token,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.passwordConfirmation,
      },
    );
  },
};
