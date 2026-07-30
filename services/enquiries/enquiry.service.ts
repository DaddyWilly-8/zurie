import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { isMockMode } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export const enquiryService = {
  listEnquiries(params: { page: number; pageSize: number; search?: string; status?: string }) {
    if (isMockMode()) {
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
    if (isMockMode()) {
      return mockBackend.enquiries.create(payload);
    }

    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.contact, payload);
  },

  updateEnquiryStatus(id: string, status: string) {
    if (isMockMode()) {
      return { success: true };
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.enquiries.byId(id), { status });
  },
};
