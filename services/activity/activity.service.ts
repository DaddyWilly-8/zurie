import { shouldUseMockForFeature } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";
import { apiClient } from "@/services/api/client";

export const activityService = {
  listActivity(page = 1, pageSize = 20) {
    if (shouldUseMockForFeature("activity")) {
      return mockBackend.activity.list(page, pageSize);
    }

    return apiClient.get<{ data: unknown[]; count: number }>("/activity", {
      query: { page, pageSize },
    });
  },
};
