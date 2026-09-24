import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";

// Shape of Media\Resources\MediaResource on the backend.
type RawMedia = {
  id?: string | number;
  url?: string | null;
  folder?: string | null;
  originalFilename?: string | null;
  mimeType?: string | null;
  size?: number | null;
  createdAt?: string | null;
};

// The admin media grid was written against a snake_case shape
// (file_url/file_name/size_bytes) the backend never returned, so every
// tile rendered with an empty src. Map the real resource here instead.
const normalizeMedia = (row: RawMedia) => ({
  id: String(row.id ?? ""),
  file_name: String(row.originalFilename ?? ""),
  file_url: String(row.url ?? ""),
  mime_type: String(row.mimeType ?? ""),
  size_bytes: Number(row.size ?? 0),
  folder: row.folder ?? null,
  used_in: null,
  created_at: String(row.createdAt ?? ""),
});

export const mediaService = {
  listMedia(params: { page: number; pageSize: number; search?: string }) {
    return apiClient
      .get<{ data?: RawMedia[]; count?: number; meta?: { count?: number } }>(
        API_ENDPOINTS.media.list,
        {
          query: params,
        },
      )
      .then((response) => ({
        data: (response.data ?? []).map(normalizeMedia),
        count: response.meta?.count ?? response.count ?? 0,
      }));
  },

  async upload(file: File, folder: string) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    return apiClient
      .request<{ success: boolean; data?: { url?: string }; url?: string }>(
        API_ENDPOINTS.media.upload,
        {
          method: "POST",
          body: formData,
          headers: {},
        },
      )
      .then((response) => ({
        success: response.success,
        url: response.data?.url ?? response.url ?? "",
      }));
  },

  remove(id: string) {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.media.byId(id));
  },
};
