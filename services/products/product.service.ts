import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { isMockMode } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";

export type AdminProductPayload = {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  sku?: string;
  status?: "draft" | "published" | "out_of_stock" | "archived";
  material?: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImageUrl?: string;
  category: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  inStock: boolean;
  stockCount: number;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  specifications: string[];
  imageUrls: string[];
};

export const productService = {
  listStorefrontProducts() {
    if (isMockMode()) {
      return mockBackend.storefront.listProducts();
    }

    return apiClient.get<{ data: unknown[] }>(API_ENDPOINTS.products.list).then((res) =>
      (res as unknown as { products: unknown[] }).products ?? (res.data ?? []),
    );
  },

  getProductBySlug(slug: string) {
    if (isMockMode()) {
      return mockBackend.storefront.findProductBySlug(slug);
    }

    return apiClient.get<{ data: unknown }>(API_ENDPOINTS.products.bySlug(slug)).then((res) =>
      (res as unknown as { data: unknown }).data ?? null,
    );
  },

  listProductsByCategory(category: string) {
    if (isMockMode()) {
      return mockBackend.storefront.listProductsByCategory(category);
    }

    return apiClient.get<{ data: unknown[] }>(API_ENDPOINTS.products.list, {
      query: { category },
    }).then((res) => res.data ?? []);
  },

  listAdminProducts() {
    if (isMockMode()) {
      return mockBackend.products.listAdmin();
    }

    return apiClient.get<{ products: unknown[] }>(API_ENDPOINTS.products.list).then((res) =>
      res.products ?? [],
    );
  },

  createProduct(payload: AdminProductPayload) {
    if (isMockMode()) {
      return mockBackend.products.create(payload);
    }

    return apiClient.post<{ success: boolean; id: string }>(API_ENDPOINTS.products.list, payload);
  },

  updateProduct(id: string, payload: AdminProductPayload) {
    if (isMockMode()) {
      return mockBackend.products.update(id, payload);
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.products.byId(id), payload);
  },

  deleteProduct(id: string) {
    if (isMockMode()) {
      return mockBackend.products.remove(id);
    }

    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.products.byId(id));
  },

  duplicateProduct(id: string) {
    if (isMockMode()) {
      return mockBackend.products.duplicate(id);
    }

    return apiClient.post<{ success: boolean; id: string }>(API_ENDPOINTS.products.duplicate(id));
  },
};
