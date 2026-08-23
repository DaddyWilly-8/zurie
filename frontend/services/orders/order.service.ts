// services/orders/order.service.ts
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
    productId: number;
    productName: string;
    quantity: number;
    unitSellingPrice: number;
    lineTotal: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type OrderListItem = {
  id: number;
  orderNumber: string;
  status: string;
  customerName: string;
  totalAmount: number;
  createdAt: string;
  customer_phone: string;
  whatsapp_number: string;
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
    return apiClient.post<OrderActionResponse>(
      API_ENDPOINTS.orders.list,
      payload,
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
};
