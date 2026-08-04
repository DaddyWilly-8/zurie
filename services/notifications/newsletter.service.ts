import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { shouldUseMockForFeature } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export const newsletterService = {
  subscribe(email: string) {
    if (shouldUseMockForFeature("newsletter")) {
      return mockBackend.notifications.newsletter(email);
    }

    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.newsletter, { email });
  },
};
