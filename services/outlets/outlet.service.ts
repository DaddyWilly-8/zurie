import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type SalesOutlet = {
  id: number;
  name: string;
  type: "physical" | "online";
  address: string | null;
  costCenterId: number | null;
  isActive: boolean;
};

export type CreateOutletPayload = {
  name: string;
  type: "physical" | "online";
  address?: string;
  costCenterId?: number | null;
};

export const outletService = {
  /** GET /admin/outlets — backend only ever returns active outlets (allActive()). */
  list() {
    return apiClient
      .get<{ data: SalesOutlet[] }>(API_ENDPOINTS.outlets.list)
      .then((response) => response.data);
  },

  create(payload: CreateOutletPayload) {
    return apiClient.post<{ data: SalesOutlet }>(
      API_ENDPOINTS.outlets.list,
      payload,
    );
  },

  update(id: number, payload: Partial<CreateOutletPayload>) {
    return apiClient.patch<{ data: SalesOutlet }>(
      API_ENDPOINTS.outlets.byId(id),
      payload,
    );
  },

  setActive(id: number, isActive: boolean) {
    return apiClient.patch<{ data: SalesOutlet }>(
      API_ENDPOINTS.outlets.byId(id),
      { isActive },
    );
  },
};
