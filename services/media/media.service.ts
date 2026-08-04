import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { shouldUseMockForFeature } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export const mediaService = {
  listMedia(params: { page: number; pageSize: number; search?: string }) {
    if (shouldUseMockForFeature("media")) {
      return mockBackend.media.list(params);
    }

    return apiClient.get<{ data: unknown[]; count: number }>(API_ENDPOINTS.media.list, {
      query: params,
    });
  },

  async upload(file: File, folder: string) {
    if (shouldUseMockForFeature("media")) {
      return mockBackend.media.upload(file, folder);
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return apiClient.request<{ success: boolean; url: string }>(API_ENDPOINTS.media.upload, {
      method: "POST",
      body: formData,
      headers: {},
    });
  },

  remove(id: string) {
    if (shouldUseMockForFeature("media")) {
      return mockBackend.media.remove(id);
    }

    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.media.byId(id));
  },
};
