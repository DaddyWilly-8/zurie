import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type InventoryTransferType =
  "internal" | "external" | "cost_center_change";

export type InventoryTransferItem = {
  productId: number;
  quantity: number;
};

export type InventoryTransfer = {
  id: number;
  transferNumber: string;
  type: InventoryTransferType;
  sourceOutletId: number;
  destinationOutletId: number | null;
  sourceCostCenterId: number | null;
  destinationCostCenterId: number | null;
  transferDate: string | null;
  notes: string | null;
  items: InventoryTransferItem[];
  createdAt: string;
};

export type InventoryTransferListResponse = {
  success: boolean;
  data: InventoryTransfer[];
  meta: { count: number; page: number; pageSize: number };
};

export type InventoryTransferPayload = {
  type: InventoryTransferType;
  sourceOutletId: number;
  destinationOutletId?: number | null;
  sourceCostCenterId?: number | null;
  destinationCostCenterId?: number | null;
  transferDate?: string | null;
  notes?: string | null;
  items: Array<{ productId: number; quantity: number }>;
};

export const inventoryTransferService = {
  list(params: { page: number; pageSize: number }) {
    return apiClient.get<InventoryTransferListResponse>(
      API_ENDPOINTS.inventoryTransfers.list,
      { query: params },
    );
  },

  create(payload: InventoryTransferPayload) {
    return apiClient.post<{ data: InventoryTransfer }>(
      API_ENDPOINTS.inventoryTransfers.list,
      payload,
    );
  },

  get(id: number) {
    return apiClient
      .get<{ data: InventoryTransfer }>(
        API_ENDPOINTS.inventoryTransfers.byId(id),
      )
      .then((response) => response.data);
  },
};
