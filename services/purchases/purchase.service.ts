import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { withIdempotency } from "@/services/api/idempotency";

export type PurchaseItem = {
  productId: number;
  quantity: number;
  costPrice: number;
  lineTotal: number;
};

export type Purchase = {
  id: number;
  purchaseNumber: string;
  supplierId: number;
  totalAmount: number;
  amountPaid: number;
  currencyId: number | null;
  exchangeRate: number | null;
  notes: string | null;
  items: PurchaseItem[];
  createdAt: string;
};

export type CreatePurchasePayload = {
  supplierId: number;
  items: Array<{ productId: number; quantity: number; costPrice: number }>;
  amountPaid?: number;
  notes?: string;
  costCenterId?: number | null;
  currencyId?: number;
};

export type PurchaseListResponse = {
  success: boolean;
  data: Purchase[];
  meta: { count: number; page: number; pageSize: number };
};

export const purchaseService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<PurchaseListResponse>(API_ENDPOINTS.purchases.list, {
      query: params,
    });
  },

  create(payload: CreatePurchasePayload) {
    return withIdempotency("purchase-create", payload, (headers) =>
      apiClient.post<{ data: Purchase }>(
        API_ENDPOINTS.purchases.list,
        payload,
        {
          headers,
        },
      ),
    );
  },

  get(purchaseNumber: string) {
    return apiClient
      .get<{ data: Purchase }>(API_ENDPOINTS.purchases.byNumber(purchaseNumber))
      .then((response) => response.data);
  },
};
