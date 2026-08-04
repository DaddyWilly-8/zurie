import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { isMockMode } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

type CategoryRecord = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  is_visible?: boolean;
  sort_order?: number;
};

const unwrapCategories = (response: { data?: CategoryRecord[]; categories?: CategoryRecord[] }) =>
  response.categories ?? response.data ?? [];

export type AdminCategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  visible?: boolean;
  sortOrder?: number;
};

export const categoryService = {
  listAdminCategories() {
    if (isMockMode()) {
      return mockBackend.categories.list();
    }

    return apiClient.get<{ data?: CategoryRecord[]; categories?: CategoryRecord[] }>(API_ENDPOINTS.categories.adminList).then(unwrapCategories);
  },

  createCategory(payload: AdminCategoryPayload) {
    if (isMockMode()) {
      return mockBackend.categories.create({ name: payload.name, slug: payload.slug });
    }

    return apiClient.post<{ success: boolean }>(API_ENDPOINTS.categories.list, payload);
  },

  updateCategory(id: string, payload: Partial<AdminCategoryPayload>) {
    if (isMockMode()) {
      return mockBackend.categories.update(id, {
        name: payload.name,
        slug: payload.slug,
      });
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.categories.byId(id), payload);
  },

  deleteCategory(id: string) {
    if (isMockMode()) {
      return mockBackend.categories.remove(id);
    }

    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.categories.byId(id));
  },
};
