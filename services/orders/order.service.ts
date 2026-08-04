import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { shouldUseMockForFeature } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export const orderService = {
  listOrders(params: { page: number; pageSize: number; search?: string; status?: string }) {
    if (shouldUseMockForFeature("orders")) {
      return mockBackend.orders.list(params);
    }

    return apiClient.get<{
      data: unknown[];
      count: number;
      page: number;
      pageSize: number;
    }>(API_ENDPOINTS.orders.list, { query: params });
  },

  updateOrderStatus(id: string, status: string, notes?: string) {
    if (shouldUseMockForFeature("orders")) {
      return mockBackend.orders.updateStatus(id, status as never);
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.orders.byId(id), { status, notes });
  },

  createOrderFromCheckout(payload: {
    customerName: string;
    customerPhone?: string;
    whatsappNumber: string;
    total: number;
    items: Array<{ quantity: number; product: { name: string; price: number } }>;
  }) {
    if (shouldUseMockForFeature("orders")) {
      return mockBackend.orders.createFromWhatsApp(payload);
    }

    return apiClient.post<{ success: boolean; id: string }>(API_ENDPOINTS.orders.list, payload);
  },
};
