import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { AdminProduct } from "@/features/admin/products";

export type AdminProductPayload = {
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price: number;
  buyingPrice: number;
  salePrice?: number | null;
  sku?: string;
  status?: "draft" | "published" | "archived";
  material?: string;
  seoTitle?: string;
  seoDescription?: string;
  categoryId: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  colors?: Array<{ name: string; hex: string }>;
  sizes?: string[];
  specifications?: string[];
};

export type AdminCreateProductPayload = AdminProductPayload & {
  quantity?: number;
};

export type InventoryUpdatePayload = {
  quantity?: number;
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
};

export type StorefrontProductQuery = {
  category?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  page?: number;
  pageSize?: number;
};

const unwrapStorefrontProducts = (response: {
  data?: unknown[] | { data?: unknown[]; products?: unknown[] };
  products?: unknown[];
}) => {
  if (Array.isArray(response.products)) return response.products;
  if (Array.isArray(response.data)) return response.data;
  if (response.data && typeof response.data === "object") {
    const nested = response.data as { data?: unknown[]; products?: unknown[] };
    if (Array.isArray(nested.products)) return nested.products;
    if (Array.isArray(nested.data)) return nested.data;
  }

  return [];
};

const unwrapStorefrontProduct = (response: { data?: unknown; product?: unknown }) => {
  if (response.product) return response.product;
  if (response.data && typeof response.data === "object") {
    const nested = response.data as { data?: unknown; product?: unknown };
    if (nested.product) return nested.product;
    if (nested.data) return nested.data;
  }

  return response.data ?? null;
};

export const productService = {
  listStorefrontProducts(query: StorefrontProductQuery = {}) {
    return apiClient
      .get<{
        data?: unknown[] | { data?: unknown[]; products?: unknown[] };
        products?: unknown[];
      }>(API_ENDPOINTS.products.list, { query })
      .then(unwrapStorefrontProducts);
  },

  getProductBySlug(slug: string) {
    return apiClient
      .get<{ data?: unknown; product?: unknown }>(API_ENDPOINTS.products.bySlug(slug))
      .then(unwrapStorefrontProduct);
  },

  listProductsByCategory(category: string) {
    return productService.listStorefrontProducts({ category });
  },

  listAdminProducts() {
    return apiClient.get<{ products?: unknown[]; data?: unknown[] }>(API_ENDPOINTS.products.adminList).then((res) =>
      res.products ?? res.data ?? [],
    );
  },

  async getAdminProductById(id: string) {
    const response = await apiClient.get<{ data?: unknown }>(API_ENDPOINTS.products.adminById(id));
    return (response.data ?? null) as AdminProduct | null;
  },

  createProduct(payload: AdminCreateProductPayload) {
    return apiClient.post<{ success: boolean; id: string }>(API_ENDPOINTS.products.list, {
      ...payload,
      categoryId: Number(payload.categoryId),
    });
  },

  updateProduct(id: string, payload: AdminProductPayload) {
    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.products.byId(id), {
      ...payload,
      categoryId: Number(payload.categoryId),
    });
  },

  deleteProduct(id: string) {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.products.byId(id));
  },

  duplicateProduct(id: string) {
    return apiClient.post<{ success: boolean; id: string }>(API_ENDPOINTS.products.duplicate(id));
  },

  getInventory(id: string) {
    return apiClient.get<{ data: { productId: string | number; quantity: number; stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" } }>(
      API_ENDPOINTS.products.inventory(id),
    );
  },

  updateInventory(id: string, payload: InventoryUpdatePayload) {
    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.products.inventory(id), payload);
  },

  uploadProductImages(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images[]", file));

    return apiClient.request<{ success: boolean; data: unknown }>(API_ENDPOINTS.products.images(id), {
      method: "POST",
      body: formData,
      headers: {},
    });
  },

  deleteProductImage(id: string, imageId: string) {
    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.products.imageById(id, imageId));
  },
};
