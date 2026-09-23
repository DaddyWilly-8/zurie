import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { AuthUser } from "@/types/domain";

/**
 * Shape of `data` on both POST /auth/login and GET /auth/user (doc §2) —
 * `user` only carries id/name/email; roles and permissions are siblings,
 * not nested under `user`.
 */
type AuthSessionData = {
  user: {
    id: string | number;
    name: string;
    email: string;
    twoFactorEnabled?: boolean;
  };
  roles: string[];
  permissions: string[];
};

/**
 * POST /auth/login's response shape when the account has 2FA confirmed —
 * password was correct but no session was established yet. See
 * TwoFactorChallengeResult below for how the caller completes it.
 */
type TwoFactorRequiredData = { twoFactorRequired: true };

export type LoginResult =
  | { status: "authenticated"; user: AuthUser }
  | { status: "two_factor_required" };

const toAuthUser = (data: AuthSessionData): AuthUser => ({
  id: String(data.user.id),
  name: data.user.name,
  email: data.user.email,
  roles: data.roles ?? [],
  permissions: data.permissions ?? [],
});

const isTwoFactorRequired = (
  data: AuthSessionData | TwoFactorRequiredData,
): data is TwoFactorRequiredData => "twoFactorRequired" in data;

/**
 * Staff-only ('web' guard) since the customer/staff split — no register,
 * no Google login here. See services/auth/customer-auth.service.ts for
 * the storefront's fully independent counterpart.
 */
export const authService = {
  async login(email: string, password: string): Promise<LoginResult> {
    const response = await apiClient.post<{
      data: AuthSessionData | TwoFactorRequiredData;
    }>(API_ENDPOINTS.auth.login, { email, password });

    if (isTwoFactorRequired(response.data)) {
      return { status: "two_factor_required" };
    }

    return { status: "authenticated", user: toAuthUser(response.data) };
  },

  /** POST /auth/two-factor/challenge — completes a login login() left pending. */
  async completeTwoFactorChallenge(code: string): Promise<AuthUser> {
    const response = await apiClient.post<{ data: AuthSessionData }>(
      API_ENDPOINTS.auth.twoFactorChallenge,
      { code },
    );

    return toAuthUser(response.data);
  },

  async twoFactorStatus(): Promise<{ enabled: boolean }> {
    return apiClient
      .get<{ data: { enabled: boolean } }>(API_ENDPOINTS.auth.twoFactorStatus)
      .then((response) => response.data);
  },

  async enableTwoFactor(): Promise<{ secret: string; qrCodeUrl: string }> {
    return apiClient
      .post<{ data: { secret: string; qrCodeUrl: string } }>(
        API_ENDPOINTS.auth.twoFactorEnable,
      )
      .then((response) => response.data);
  },

  async confirmTwoFactor(code: string): Promise<{ recoveryCodes: string[] }> {
    return apiClient
      .post<{ data: { recoveryCodes: string[] } }>(
        API_ENDPOINTS.auth.twoFactorConfirm,
        { code },
      )
      .then((response) => response.data);
  },

  async disableTwoFactor(password: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.twoFactorDisable, { password });
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
