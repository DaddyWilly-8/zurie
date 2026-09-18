import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export type MeasurementUnit = {
  id: number;
  name: string;
  symbol: string;
  description: string | null;
  isActive: boolean;
};

export type CreateMeasurementUnitPayload = {
  name: string;
  symbol: string;
  description?: string;
};

export const measurementUnitService = {
  list() {
    return apiClient
      .get<{ data: MeasurementUnit[] }>(API_ENDPOINTS.measurementUnits.list)
      .then((response) => response.data);
  },

  create(payload: CreateMeasurementUnitPayload) {
    return apiClient.post<{ data: MeasurementUnit }>(
      API_ENDPOINTS.measurementUnits.list,
      payload,
    );
  },

  update(id: number, payload: Partial<CreateMeasurementUnitPayload>) {
    return apiClient.patch<{ data: MeasurementUnit }>(
      API_ENDPOINTS.measurementUnits.byId(id),
      payload,
    );
  },

  setActive(id: number, isActive: boolean) {
    return apiClient.patch<{ data: MeasurementUnit }>(
      API_ENDPOINTS.measurementUnits.byId(id),
      { isActive },
    );
  },
};
