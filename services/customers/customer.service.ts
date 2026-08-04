import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { isMockMode } from "@/services/api/runtime";

export type CustomerListItem = {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export type CustomerDetail = CustomerListItem & {
  [key: string]: unknown;
};

export const customerService = {
  async listCustomers() {
    if (isMockMode()) {
      return [] as CustomerListItem[];
    }

    const payload = await apiClient.get<{ data?: CustomerListItem[] }>(API_ENDPOINTS.customers.list);
    return payload.data ?? [];
  },

  async getCustomerById(id: string) {
    if (isMockMode()) {
      return null as CustomerDetail | null;
    }

    const payload = await apiClient.get<{ data?: CustomerDetail }>(API_ENDPOINTS.customers.byId(id));
    return payload.data ?? null;
  },
};
