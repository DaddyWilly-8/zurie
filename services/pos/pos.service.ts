import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { withIdempotency } from "@/services/api/idempotency";
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
  currencyId?: number;
};

export const posService = {
  /** POST /admin/pos/sale — delegates entirely to OrderService::posSale() on the backend. */
  sell(payload: PosSalePayload) {
    return withIdempotency("pos-sale", payload, (headers) =>
      apiClient.post<{ data: OrderResponse }>(API_ENDPOINTS.pos.sale, payload, {
        headers,
      }),
    );
  },
};
