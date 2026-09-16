import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { OrderResponse } from "@/services/orders/order.service";

/**
 * Mirrors backend CustomerResource — the authenticated user's own linked
 * Customer record. `profile()` returns null data (not a 404) when the user
 * has never linked one (e.g. an admin account that never registered as a
 * storefront customer), so callers must handle a null result as a normal
 * "no profile yet" state, not an error.
 */
export type CustomerProfile = {
  id: number;
  name: string;
  phone: string;
  whatsappNumber: string | null;
  email: string | null;
  isRegistered: boolean;
  createdAt: string;
};

export type AccountOrdersResponse = {
  success: boolean;
  data: OrderResponse[];
  meta: { count: number; page: number; pageSize: number };
};

export const accountService = {
  /** GET /account/profile — always scoped server-side to the current session. */
  async getProfile(): Promise<CustomerProfile | null> {
    const response = await apiClient.get<{ data: CustomerProfile | null }>(
      API_ENDPOINTS.account.profile,
    );
    return response.data;
  },

  /** GET /account/orders?page=&pageSize= — empty list if no linked customer yet. */
  getOrders(params: { page: number; pageSize: number }) {
    return apiClient.get<AccountOrdersResponse>(API_ENDPOINTS.account.orders, {
      query: params,
    });
  },
};
