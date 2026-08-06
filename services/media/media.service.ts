import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

export const mediaService = {
  listMedia(params: { page: number; pageSize: number; search?: string }) {
    return apiClient
      .get<{ data?: unknown[]; count?: number; meta?: { count?: number } }>(API_ENDPOINTS.media.list, {
        query: params,
      })
      .then((response) => ({
        data: response.data ?? [],
        count: response.meta?.count ?? response.count ?? 0,
      }));
  },

  async upload(file: File, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return apiClient.request<{ success: boolean; data?: { url?: string }; url?: string }>(API_ENDPOINTS.media.upload, {
      method: "POST",
      body: formData,
      headers: {},
    }).then((response) => ({
      success: response.success,
      url: response.data?.url ?? response.url ?? "",
    }));
  },

  remove(id: string) {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.media.byId(id));
  },
};
