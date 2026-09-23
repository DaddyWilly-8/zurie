import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { withIdempotency } from "@/services/api/idempotency";

export type GrnLine = {
  purchaseOrderItemId: number;
  productId: number;
  quantityReceived: number;
};

export type Grn = {
  id: number;
  grnNumber: string;
  dateReceived: string;
  costFactor: number;
  purchaseOrderId: number;
  notes: string | null;
  lines: GrnLine[];
  createdAt: string;
};

export type GrnListResponse = {
  success: boolean;
  data: Grn[];
  meta: { count: number; page: number; pageSize: number };
};

export type CreateGrnPayload = {
  purchaseOrderId: number;
  dateReceived?: string;
  costFactor?: number;
  notes?: string;
  lines: Array<{ purchaseOrderItemId: number; quantityReceived: number }>;
};

export const grnService = {
  list(params: { page: number; pageSize: number; purchaseOrderId?: number }) {
    return apiClient.get<GrnListResponse>(API_ENDPOINTS.grns.list, {
      query: params,
    });
  },

  create(payload: CreateGrnPayload) {
    return withIdempotency("grn-create", payload, (headers) =>
      apiClient.post<{ data: Grn }>(API_ENDPOINTS.grns.list, payload, {
        headers,
      }),
    );
  },

  get(id: number) {
    return apiClient
      .get<{ data: Grn }>(API_ENDPOINTS.grns.byId(id))
      .then((response) => response.data);
  },

  /** "Un-receive" — reverses the GRN's stock and ledger effect; rejected if the received stock has already moved on (e.g. sold). */
  remove(id: number) {
    return apiClient.delete<{ message: string }>(API_ENDPOINTS.grns.byId(id));
  },
};
