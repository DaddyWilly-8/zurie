import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export const newsletterService = {
  subscribe(email: string) {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.newsletter, { email });
  },
};
