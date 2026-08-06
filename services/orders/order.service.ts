import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export const orderService = {
  listOrders(params: { page: number; pageSize: number; search?: string; status?: string }) {
    return apiClient.get<{
      data?: unknown[];
      count?: number;
      page?: number;
      pageSize?: number;
      meta?: { count?: number; page?: number; pageSize?: number };
    }>(API_ENDPOINTS.orders.list, { query: params }).then((response) => ({
      data: response.data ?? [],
      count: response.meta?.count ?? response.count ?? 0,
      page: response.meta?.page ?? response.page ?? params.page,
      pageSize: response.meta?.pageSize ?? response.pageSize ?? params.pageSize,
    }));
  },

  updateOrderStatus(id: string, status: string, notes?: string) {
    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.orders.byId(id), { status, notes });
  },

  createOrderFromCheckout(payload: {
    customerName: string;
    customerPhone?: string;
    whatsappNumber: string;
    customerEmail?: string | null;
    items: Array<{ productId: string; quantity: number }>;
  }) {
    return apiClient.post<{ success: boolean; id: string }>(API_ENDPOINTS.orders.list, payload);
  },
};
