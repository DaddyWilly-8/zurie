import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type PurchaseOrderItem = {
  id: number;
  productId: number;
  measurementUnitId: number;
  conversionFactor: number;
  quantity: number;
  rate: number;
  vatPercentage: number;
  lineTotal: number;
  receivedQuantity: number;
  remainingQuantity: number;
};

export type PurchaseOrderStatus =
  "pending" | "partially_received" | "fully_received" | "closed" | "canceled";

export type PurchaseOrder = {
  id: number;
  poNumber: string;
  orderDate: string;
  dateRequired: string;
  stakeholderId: number | null;
  currencyId: number;
  exchangeRate: number;
  status: PurchaseOrderStatus;
  totalAmount: number;
  vatAmount: number;
  notes: string | null;
  items: PurchaseOrderItem[];
  createdAt: string;
};

export type PurchaseOrderListResponse = {
  success: boolean;
  data: PurchaseOrder[];
  meta: { count: number; page: number; pageSize: number };
};

export type PurchaseOrderPayload = {
  stakeholderId?: number | null;
  currencyId?: number;
  dateRequired?: string;
  notes?: string;
  /** Immediately posts a GRN receiving every line in full, in the same request — the "instant receive" toggle. */
  instantReceive?: boolean;
  items: Array<{
    productId: number;
    measurementUnitId: number;
    conversionFactor?: number;
    quantity: number;
    rate: number;
    vatPercentage?: number;
  }>;
};

export const purchaseOrderService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<PurchaseOrderListResponse>(
      API_ENDPOINTS.purchaseOrders.list,
      { query: params },
    );
  },

  create(payload: PurchaseOrderPayload) {
    return apiClient.post<{ data: PurchaseOrder }>(
      API_ENDPOINTS.purchaseOrders.list,
      payload,
    );
  },

  get(id: number) {
    return apiClient
      .get<{ data: PurchaseOrder }>(API_ENDPOINTS.purchaseOrders.byId(id))
      .then((response) => response.data);
  },

  update(id: number, payload: PurchaseOrderPayload) {
    return apiClient.patch<{ data: PurchaseOrder }>(
      API_ENDPOINTS.purchaseOrders.byId(id),
      payload,
    );
  },

  remove(id: number) {
    return apiClient.delete<{ message: string }>(
      API_ENDPOINTS.purchaseOrders.byId(id),
    );
  },

  close(id: number) {
    return apiClient.post<{ data: PurchaseOrder }>(
      API_ENDPOINTS.purchaseOrders.close(id),
    );
  },

  reopen(id: number) {
    return apiClient.post<{ data: PurchaseOrder }>(
      API_ENDPOINTS.purchaseOrders.reopen(id),
    );
  },

  cancel(id: number) {
    return apiClient.post<{ data: PurchaseOrder }>(
      API_ENDPOINTS.purchaseOrders.cancel(id),
    );
  },
};
