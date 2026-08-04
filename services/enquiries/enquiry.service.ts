import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { shouldUseMockForFeature } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export const enquiryService = {
  listEnquiries(params: { page: number; pageSize: number; search?: string; status?: string }) {
    if (shouldUseMockForFeature("enquiries")) {
      return mockBackend.enquiries.list(params);
    }

    return apiClient.get<{
      data: unknown[];
      count: number;
      page: number;
      pageSize: number;
    }>(API_ENDPOINTS.enquiries.list, { query: params });
  },

  createEnquiry(payload: { name: string; email: string; message: string }) {
    if (shouldUseMockForFeature("contact")) {
      return mockBackend.enquiries.create(payload);
    }

    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.contact, payload);
  },

  updateEnquiryStatus(id: string, status: string) {
    if (shouldUseMockForFeature("enquiries")) {
      return { success: true };
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.enquiries.byId(id), { status });
  },
};
