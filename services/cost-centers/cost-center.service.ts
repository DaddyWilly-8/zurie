import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type CostCenter = {
  id: number;
  name: string;
  parentId: number | null;
  isActive: boolean;
};

export type CreateCostCenterPayload = {
  name: string;
  parentId?: number | null;
};

export const costCenterService = {
  list() {
    return apiClient
      .get<{ data: CostCenter[] }>(API_ENDPOINTS.costCenters.list)
      .then((response) => response.data);
  },

  create(payload: CreateCostCenterPayload) {
    return apiClient.post<{ data: CostCenter }>(
      API_ENDPOINTS.costCenters.list,
      payload,
    );
  },

  update(id: number, payload: Partial<CreateCostCenterPayload>) {
    return apiClient.patch<{ data: CostCenter }>(
      API_ENDPOINTS.costCenters.byId(id),
      payload,
    );
  },

  setActive(id: number, isActive: boolean) {
    return apiClient.patch<{ data: CostCenter }>(
      API_ENDPOINTS.costCenters.byId(id),
      { isActive },
    );
  },
};
