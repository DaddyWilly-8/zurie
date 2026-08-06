import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export const enquiryService = {
  listEnquiries(params: { page: number; pageSize: number; search?: string; status?: string }) {
    return apiClient.get<{
      data?: unknown[];
      count?: number;
      page?: number;
      pageSize?: number;
      meta?: { count?: number; page?: number; pageSize?: number };
    }>(API_ENDPOINTS.enquiries.list, { query: params }).then((response) => ({
      data: response.data ?? [],
      count: response.meta?.count ?? response.count ?? 0,
      page: response.meta?.page ?? response.page ?? params.page,
      pageSize: response.meta?.pageSize ?? response.pageSize ?? params.pageSize,
    }));
  },

  createEnquiry(payload: { name: string; email: string; message: string }) {
    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.contact, payload);
  },

  updateEnquiryStatus(id: string, status: string) {
    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.enquiries.byId(id), { status });
  },
};
