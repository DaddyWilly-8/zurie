// services/orders/order.service.ts
import { withIdempotency } from "@/services/api/idempotency";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type OrderItem = {
  productId: number | string;
  quantity: number;
};

export type CreateOrderPayload = {
  customerName: string;
  customerPhone?: string;
  whatsappNumber?: string;
  customerEmail?: string | null;
  items: OrderItem[];
  couponCode?: string;
};

export type OrderResponse = {
  id: number;
  orderNumber: string;
  status:
    | "new"
    | "confirmed"
    | "processing"
    | "ready_for_delivery"
    | "delivered"
    | "cancelled";
  customerName: string;
  customerPhone: string;
  whatsappNumber: string;
  customerEmail: string | null;
  totalAmount: number;
  notes: string | null;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitSellingPrice: number;
    lineTotal: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type OrderReceiptLink = {
  receiptId: number;
  receiptNumber: string;
  amountApplied: number;
  transactionDate: string;
};

export type OrderDelivery = {
  id: number;
  deliveryNumber: string;
  dateDispatched: string;
  notes: string | null;
  lines: Array<{
    orderItemId: number;
    productName: string;
    quantityDispatched: number;
  }>;
};

export type UndispatchedOrderItem = {
  orderItemId: number;
  productName: string;
  quantity: number;
  dispatchedQuantity: number;
  remainingQuantity: number;
};

export type OrderListItem = {
  id: number;
  orderNumber: string;
  status: string;
  customerName: string;
  totalAmount: number;
  createdAt: string;
  // camelCase per doc §4 / "Changes from v2.17" — these briefly shipped as
  // snake_case and were fixed; don't reintroduce customer_phone/whatsapp_number.
  customerPhone: string;
  whatsappNumber: string;
};

export type OrderListResponse = {
  success: boolean;
  data: OrderListItem[];
  meta: {
    count: number;
    page: number;
    pageSize: number;
  };
};

export type OrderDetailResponse = {
  success: boolean;
  data: OrderResponse;
};

export type OrderActionResponse = {
  success: boolean;
  data: OrderResponse;
};

export const orderService = {
  /**
   * Create a new order (public checkout)
   * POST /orders
   */
  createOrder(payload: CreateOrderPayload): Promise<OrderActionResponse> {
    return withIdempotency("checkout", payload, (headers) =>
      apiClient.post<OrderActionResponse>(API_ENDPOINTS.orders.list, payload, {
        headers,
      }),
    );
  },

  /**
   * List orders (admin only)
   * GET /admin/orders?page=&pageSize=&search=&status=
   */
  listOrders(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
  }): Promise<OrderListResponse> {
    return apiClient.get<OrderListResponse>(API_ENDPOINTS.orders.adminList, {
      query: params,
    });
  },

  /**
   * Get order by order number (admin only)
   * GET /admin/orders/{orderNumber}
   */
  getOrder(orderNumber: string): Promise<OrderDetailResponse> {
    return apiClient.get<OrderDetailResponse>(
      API_ENDPOINTS.orders.adminByOrderNumber(orderNumber),
    );
  },

  /**
   * Update order status (admin only)
   * PATCH /admin/orders/{orderNumber}
   * Valid statuses: new, confirmed, processing, ready_for_delivery, delivered
   * NOT cancelled - use cancelOrder() instead
   */
  updateOrderStatus(
    orderNumber: string,
    status: string,
    notes?: string,
  ): Promise<OrderActionResponse> {
    return apiClient.patch<OrderActionResponse>(
      API_ENDPOINTS.orders.adminByOrderNumber(orderNumber),
      { status, notes },
    );
  },

  /**
   * Cancel order (admin only)
   * POST /admin/orders/{orderNumber}/cancel
   * Only callable from: new, confirmed, processing, ready_for_delivery
   */
  cancelOrder(orderNumber: string): Promise<OrderActionResponse> {
    return apiClient.post<OrderActionResponse>(
      API_ENDPOINTS.orders.adminCancel(orderNumber),
    );
  },

  /** GET /admin/orders/{orderNumber}/receipts — the Receipts tab. */
  getReceipts(orderNumber: string) {
    return apiClient
      .get<{ data: OrderReceiptLink[] }>(
        API_ENDPOINTS.orders.adminReceipts(orderNumber),
      )
      .then((response) => response.data);
  },

  /** GET /admin/orders/{orderNumber}/deliveries — the Delivery tab's dispatch history. */
  getDeliveries(orderNumber: string) {
    return apiClient
      .get<{ data: OrderDelivery[] }>(
        API_ENDPOINTS.orders.adminDeliveries(orderNumber),
      )
      .then((response) => response.data);
  },

  /** GET /admin/orders/{orderNumber}/undispatched-items — the dispatch form's remaining-quantity picker. */
  getUndispatchedItems(orderNumber: string) {
    return apiClient
      .get<{ data: UndispatchedOrderItem[] }>(
        API_ENDPOINTS.orders.adminUndispatchedItems(orderNumber),
      )
      .then((response) => response.data);
  },

  /** POST /admin/orders/{orderNumber}/deliveries — record a dispatch. */
  createDelivery(
    orderNumber: string,
    payload: {
      dateDispatched?: string;
      notes?: string;
      lines: Array<{ orderItemId: number; quantityDispatched: number }>;
    },
  ) {
    return withIdempotency(
      `delivery-create:${orderNumber}`,
      payload,
      (headers) =>
        apiClient.post<{ data: OrderDelivery }>(
          API_ENDPOINTS.orders.adminDeliveries(orderNumber),
          payload,
          { headers },
        ),
    );
  },
};
