import { apiClient } from "@/services/api/client";
import { API_ENDPOINTS } from "@/services/api/endpoints";

export const activityService = {
  listActivity(page = 1, pageSize = 20) {
    return apiClient.get<{ data?: unknown[]; count?: number; meta?: { count?: number } }>(API_ENDPOINTS.activity.list, {
      query: { page, pageSize },
    }).then((response) => ({
      data: response.data ?? [],
      count: response.meta?.count ?? response.count ?? 0,
    }));
  },
};
