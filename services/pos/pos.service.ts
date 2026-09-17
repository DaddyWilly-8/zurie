import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { OrderResponse } from "@/services/orders/order.service";

export type PosSalePayload = {
  outletId: number;
  items: Array<{ productId: number; quantity: number }>;
  customerId?: number;
  customerName?: string;
  customerPhone?: string;
  whatsappNumber?: string;
  customerEmail?: string;
  couponCode?: string;
};

export const posService = {
  /** POST /admin/pos/sale — delegates entirely to OrderService::posSale() on the backend. */
  sell(payload: PosSalePayload) {
    return apiClient.post<{ data: OrderResponse }>(
      API_ENDPOINTS.pos.sale,
      payload,
    );
  },
};
