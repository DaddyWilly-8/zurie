import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { cache } from "react";

type CategoryRecord = {
  id: string | number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  visible?: boolean;
  is_visible?: boolean;
  sortOrder?: number;
  sort_order?: number;
};

const normalizeCategory = (item: CategoryRecord): CategoryRecord => ({
  ...item,
  id: String(item.id),
  name: String(item.name ?? ""),
  slug: String(item.slug ?? ""),
  imageUrl: item.imageUrl ?? item.image_url ?? null,
  visible: item.visible ?? item.is_visible ?? true,
  sortOrder: item.sortOrder ?? item.sort_order ?? 0,
});

const unwrapCategories = (
  response: {
    data?: CategoryRecord[];
    categories?: CategoryRecord[];
    meta?: { count?: number };
  },
  onlyVisible: boolean,
) =>
  (response.categories ?? response.data ?? [])
    .map(normalizeCategory)
    .filter((item) => (onlyVisible ? item.visible !== false : true));

export type AdminCategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  visible?: boolean;
  sortOrder?: number;
};

export const categoryService = {
  listCategories() {
    return apiClient
      .get<{
        data?: CategoryRecord[];
        categories?: CategoryRecord[];
        meta?: { count?: number };
      }>(API_ENDPOINTS.categories.list)
      .then((response) => unwrapCategories(response, true));
  },

  listAdminCategories() {
    return apiClient
      .get<{
        data?: CategoryRecord[];
        categories?: CategoryRecord[];
        meta?: { count?: number };
      }>(API_ENDPOINTS.categories.adminList)
      .then((response) => unwrapCategories(response, false));
  },

  createCategory(payload: AdminCategoryPayload) {
    return apiClient.post<{ success: boolean }>(
      API_ENDPOINTS.categories.list,
      payload,
    );
  },

  updateCategory(id: string, payload: Partial<AdminCategoryPayload>) {
    return apiClient.patch<{ success: boolean }>(
      API_ENDPOINTS.categories.byId(id),
      payload,
    );
  },

  deleteCategory(id: string) {
    return apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.categories.byId(id),
    );
  },

  uploadCategoryImage(id: string, image: File) {
    const formData = new FormData();
    formData.append("image", image);

    return apiClient.request<{ success: boolean; data: CategoryRecord }>(
      API_ENDPOINTS.categories.image(id),
      {
        method: "POST",
        body: formData,
        headers: {},
      },
    );
  },

  removeCategoryImage(id: string) {
    return apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.categories.image(id),
    );
  },
};

export const getStorefrontCategories = cache(async () => {
  try {
    return await categoryService.listCategories();
  } catch {
    return [];
  }
});
