import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

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
    const payload = await apiClient.get<{ data?: CustomerListItem[] }>(API_ENDPOINTS.customers.list);
    return payload.data ?? [];
  },

  async getCustomerById(id: string) {
    const payload = await apiClient.get<{ data?: CustomerDetail }>(API_ENDPOINTS.customers.byId(id));
    return payload.data ?? null;
  },
};
