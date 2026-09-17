import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type Supplier = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
};

export type CreateSupplierPayload = {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type SupplierListResponse = {
  success: boolean;
  data: Supplier[];
  meta: { count: number; page: number; pageSize: number };
};

export const supplierService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<SupplierListResponse>(API_ENDPOINTS.suppliers.list, {
      query: params,
    });
  },

  create(payload: CreateSupplierPayload) {
    return apiClient.post<{ data: Supplier }>(
      API_ENDPOINTS.suppliers.list,
      payload,
    );
  },

  get(id: number) {
    return apiClient
      .get<{ data: Supplier }>(API_ENDPOINTS.suppliers.byId(id))
      .then((response) => response.data);
  },

  update(id: number, payload: Partial<CreateSupplierPayload>) {
    return apiClient.patch<{ data: Supplier }>(
      API_ENDPOINTS.suppliers.byId(id),
      payload,
    );
  },

  setActive(id: number, isActive: boolean) {
    return apiClient.patch<{ data: Supplier }>(
      API_ENDPOINTS.suppliers.byId(id),
      { isActive },
    );
  },
};
