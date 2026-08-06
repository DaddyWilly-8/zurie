import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import { isMockMode } from "@/services/api/runtime";
import { mockBackend } from "@/services/mock/mock-backend";
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

    return apiClient.get<{ products?: unknown[]; data?: unknown[] }>(API_ENDPOINTS.products.adminList).then((res) =>
      res.products ?? res.data ?? [],
    );
  },

  async getAdminProductById(id: string) {
    if (isMockMode()) {
      const products = await mockBackend.products.listAdmin();
      return (products.find((product: AdminProduct) => product.id === id) ?? null) as AdminProduct | null;
    }

    const response = await apiClient.get<{ data?: unknown }>(API_ENDPOINTS.products.adminById(id));
    return (response.data ?? null) as AdminProduct | null;
  },

  createProduct(payload: AdminCreateProductPayload) {
    if (isMockMode()) {
      return mockBackend.products.create({
        ...payload,
        description: payload.description ?? "",
        category: payload.categoryId,
        buyingPrice: payload.buyingPrice,
        featured: payload.featured ?? false,
        bestSeller: payload.bestSeller ?? false,
        newArrival: payload.newArrival ?? false,
        colors: payload.colors ?? [],
        sizes: payload.sizes ?? [],
        specifications: payload.specifications ?? [],
        imageUrls: [],
        inStock: (payload.quantity ?? 0) > 0,
        stockCount: payload.quantity ?? 0,
      });
    }

    return apiClient.post<{ success: boolean; id: string }>(API_ENDPOINTS.products.list, {
      ...payload,
      categoryId: Number(payload.categoryId),
    });
  },

  updateProduct(id: string, payload: AdminProductPayload) {
    if (isMockMode()) {
      return mockBackend.products.update(id, {
        ...payload,
        description: payload.description ?? "",
        category: payload.categoryId,
        buyingPrice: payload.buyingPrice,
        featured: payload.featured ?? false,
        bestSeller: payload.bestSeller ?? false,
        newArrival: payload.newArrival ?? false,
        colors: payload.colors ?? [],
        sizes: payload.sizes ?? [],
        specifications: payload.specifications ?? [],
        imageUrls: [],
        inStock: true,
        stockCount: 1,
      });
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.products.byId(id), {
      ...payload,
      categoryId: Number(payload.categoryId),
    });
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

  getInventory(id: string) {
    if (isMockMode()) {
      return Promise.resolve({ data: { productId: id, quantity: 0, stockStatus: "OUT_OF_STOCK" as const } });
    }

    return apiClient.get<{ data: { productId: string | number; quantity: number; stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" } }>(
      API_ENDPOINTS.products.inventory(id),
    );
  },

  updateInventory(id: string, payload: InventoryUpdatePayload) {
    if (isMockMode()) {
      return Promise.resolve({ success: true });
    }

    return apiClient.patch<{ success: boolean }>(API_ENDPOINTS.products.inventory(id), payload);
  },

  uploadProductImages(id: string, files: File[]) {
    if (isMockMode()) {
      return Promise.resolve({ success: true });
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images[]", file));

    return apiClient.request<{ success: boolean; data: unknown }>(API_ENDPOINTS.products.images(id), {
      method: "POST",
      body: formData,
      headers: {},
    });
  },

  deleteProductImage(id: string, imageId: string) {
    if (isMockMode()) {
      return Promise.resolve({ success: true });
    }

    return apiClient.delete<{ success: boolean }>(API_ENDPOINTS.products.imageById(id, imageId));
  },
};
