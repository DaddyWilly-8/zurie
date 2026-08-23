import { API_ENDPOINTS } from "@/services/api/endpoints";
import { apiClient } from "@/services/api/client";
import type { AdminProduct } from "@/features/admin/products";
import type { Product } from "@/types/product";
import { getStorefrontCategories } from "@/services/categories/category.service";

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

const unwrapStorefrontProduct = (response: {
  data?: unknown;
  product?: unknown;
}) => {
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
      .get<{ data?: unknown; product?: unknown }>(
        API_ENDPOINTS.products.bySlug(slug),
      )
      .then(unwrapStorefrontProduct);
  },

  listProductsByCategory(category: string) {
    return productService.listStorefrontProducts({ category });
  },

  listAdminProducts() {
    return apiClient
      .get<{ products?: unknown[]; data?: unknown[] }>(
        API_ENDPOINTS.products.adminList,
      )
      .then((res) => res.products ?? res.data ?? []);
  },

  async getAdminProductById(id: string) {
    const response = await apiClient.get<{ data?: unknown }>(
      API_ENDPOINTS.products.adminById(id),
    );
    return (response.data ?? null) as AdminProduct | null;
  },

  createProduct(payload: AdminCreateProductPayload) {
    return apiClient.post<{ success: boolean; id: string }>(
      API_ENDPOINTS.products.list,
      {
        ...payload,
        categoryId: Number(payload.categoryId),
      },
    );
  },

  updateProduct(id: string, payload: AdminProductPayload) {
    return apiClient.patch<{ success: boolean }>(
      API_ENDPOINTS.products.byId(id),
      {
        ...payload,
        categoryId: Number(payload.categoryId),
      },
    );
  },

  /** Partial PATCH /products/{id} — status only, for the list's inline status changer. */
  updateProductStatus(id: string, status: "draft" | "published" | "archived") {
    return apiClient.patch<{ success: boolean }>(
      API_ENDPOINTS.products.byId(id),
      { status },
    );
  },

  deleteProduct(id: string) {
    return apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.products.byId(id),
    );
  },

  duplicateProduct(id: string) {
    return apiClient.post<{ success: boolean; id: string }>(
      API_ENDPOINTS.products.duplicate(id),
    );
  },

  getInventory(id: string) {
    return apiClient.get<{
      data: {
        productId: string | number;
        quantity: number;
        stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
      };
    }>(API_ENDPOINTS.products.inventory(id));
  },

  updateInventory(id: string, payload: InventoryUpdatePayload) {
    return apiClient.patch<{ success: boolean }>(
      API_ENDPOINTS.products.inventory(id),
      payload,
    );
  },

  uploadProductImages(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images[]", file));

    return apiClient.request<{ success: boolean; data: unknown }>(
      API_ENDPOINTS.products.images(id),
      {
        method: "POST",
        body: formData,
        headers: {},
      },
    );
  },

  deleteProductImage(id: string, imageId: string) {
    return apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.products.imageById(id, imageId),
    );
  },

  // ── Storefront normalization layer (folded in from services/products.ts) ──

  async getStorefrontProducts(
    query: StorefrontProductQuery = {},
  ): Promise<Product[]> {
    try {
      const categories =
        (await getStorefrontCategories()) as StorefrontCategory[];
      const resolvedCategory = resolveCategoryQueryValue(
        query.category,
        categories,
      );
      const products = await productService.listStorefrontProducts({
        ...query,
        category: resolvedCategory,
      });
      const normalizedProducts = (products as RawStorefrontProduct[]).map(
        normalizeStorefrontProduct,
      );
      const enriched = await enrichWithCategories(
        normalizedProducts,
        categories,
      );
      return applyStorefrontQuery(enriched, query);
    } catch {
      return [];
    }
  },

  async getStorefrontProductBySlug(slug: string): Promise<Product | null> {
    try {
      const rawProduct = (await productService.getProductBySlug(
        slug,
      )) as RawStorefrontProduct | null;
      const product = rawProduct
        ? normalizeStorefrontProduct(rawProduct)
        : null;
      if (!product) return null;
      return (await enrichWithCategories([product]))[0] ?? product;
    } catch {
      return null;
    }
  },

  async getStorefrontProductsByCategory(category: string): Promise<Product[]> {
    try {
      return productService.getStorefrontProducts({ category });
    } catch {
      return [];
    }
  },
};

// ── Storefront normalization helpers ────────────────────────────────────────

type RawStorefrontProduct = Partial<Product> & {
  id?: string | number;
  slug?: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number | string;
  salePrice?: number | string | null;
  category?: unknown;
  categoryId?: string | number;
  category_id?: string | number;
  categorySlug?: string;
  featured?: boolean;
  bestSeller?: boolean;
  best_seller?: boolean;
  newArrival?: boolean;
  new_arrival?: boolean;
  inStock?: boolean;
  in_stock?: boolean;
  stockCount?: number;
  stock_count?: number;
  quantity?: number;
  stockStatus?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  featuredImageUrl?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  imageUrls?: string[];
  image_urls?: string[];
  images?: Array<{
    id?: string | number;
    url?: string;
    alt?: string;
    alt_text?: string;
    isPrimary?: boolean;
    is_primary?: boolean;
  }>;
  product_images?: Array<{
    id?: string | number;
    url?: string;
    alt?: string;
    alt_text?: string;
    isPrimary?: boolean;
    is_primary?: boolean;
  }>;
  specifications?: string[];
  colors?: Array<{ name: string; hex: string }>;
  sizes?: string[];
  createdAt?: string;
  created_at?: string;
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeImageRow = (
  image: {
    id?: string | number;
    url?: string;
    alt?: string;
    alt_text?: string;
    isPrimary?: boolean;
    is_primary?: boolean;
  },
  index: number,
) => {
  const imageUrl = String(image.url ?? "").trim();
  if (!imageUrl) return null;

  return {
    id: image.id ? String(image.id) : undefined,
    url: imageUrl,
    alt: String(image.alt ?? image.alt_text ?? "Product image"),
    isPrimary: image.isPrimary ?? image.is_primary ?? index === 0,
  };
};

const normalizeStorefrontProduct = (row: RawStorefrontProduct): Product => {
  const id = String(row.id ?? "");
  const slug = String(row.slug ?? "");
  const name = String(row.name ?? "");
  const categoryPayload = row.category;
  const categoryObject =
    categoryPayload &&
    typeof categoryPayload === "object" &&
    !Array.isArray(categoryPayload)
      ? {
          id: String((categoryPayload as { id?: unknown }).id ?? ""),
          name: String((categoryPayload as { name?: unknown }).name ?? ""),
          slug: String((categoryPayload as { slug?: unknown }).slug ?? ""),
          description:
            (categoryPayload as { description?: unknown }).description ?? null,
          imageUrl: String(
            ((categoryPayload as { imageUrl?: unknown }).imageUrl ??
              (categoryPayload as { image_url?: unknown }).image_url ??
              "") ||
              "",
          ),
          visible:
            (categoryPayload as { visible?: unknown }).visible ??
            (categoryPayload as { is_visible?: unknown }).is_visible ??
            true,
          sortOrder:
            (categoryPayload as { sortOrder?: unknown }).sortOrder ??
            (categoryPayload as { sort_order?: unknown }).sort_order ??
            0,
        }
      : undefined;
  const categoryId = row.categoryId ?? row.category_id ?? categoryObject?.id;
  const rawCategorySlug = String(
    categoryObject?.slug ??
      row.categorySlug ??
      (typeof categoryPayload === "string" ? categoryPayload : "") ??
      "",
  ).trim();
  const baseImageUrl = String(
    row.featuredImageUrl ?? row.imageUrl ?? row.image_url ?? "",
  ).trim();
  const imageUrlList = (row.imageUrls ?? row.image_urls ?? [])
    .map((url) => String(url ?? "").trim())
    .filter(Boolean);
  const imageRows = (row.images ?? row.product_images ?? [])
    .map((image, index) => normalizeImageRow(image, index))
    .filter((image): image is NonNullable<typeof image> => Boolean(image));

  const arrayImages = imageUrlList.map((url, index) => ({
    id: undefined,
    url,
    alt: name || "Product image",
    isPrimary: index === 0,
  }));

  const images =
    imageRows.length > 0
      ? imageRows
      : arrayImages.length > 0
        ? arrayImages
        : baseImageUrl
          ? [
              {
                id: undefined,
                url: baseImageUrl,
                alt: name || "Product image",
                isPrimary: true,
              },
            ]
          : [];

  const stockCount = toNumber(
    row.stockCount ?? row.stock_count ?? row.quantity,
    0,
  );
  const inStock =
    typeof row.inStock === "boolean"
      ? row.inStock
      : typeof row.in_stock === "boolean"
        ? row.in_stock
        : row.stockStatus
          ? row.stockStatus !== "OUT_OF_STOCK"
          : stockCount > 0;

  return {
    id,
    slug,
    name,
    description: String(row.description ?? row.shortDescription ?? ""),
    price: toNumber(row.salePrice ?? row.price, 0),
    category: (categoryObject ?? rawCategorySlug) as Product["category"],
    categoryId,
    categorySlug: rawCategorySlug,
    categoryLabel: categoryObject?.name || undefined,
    featured: Boolean(row.featured),
    bestSeller: Boolean(row.bestSeller ?? row.best_seller),
    newArrival: Boolean(row.newArrival ?? row.new_arrival),
    inStock,
    stockCount,
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    colors: Array.isArray(row.colors) ? row.colors : [],
    sizes: Array.isArray(row.sizes) ? row.sizes : [],
    images,
    createdAt: row.createdAt ?? row.created_at,
  };
};

const getCategorySlugValue = (product: Product) => {
  if (
    product.category &&
    typeof product.category === "object" &&
    !Array.isArray(product.category)
  ) {
    return String((product.category as { slug?: unknown }).slug ?? "").trim();
  }

  return String(product.categorySlug ?? product.category ?? "").trim();
};

const getCategoryIdValue = (product: Product) => {
  if (
    product.category &&
    typeof product.category === "object" &&
    !Array.isArray(product.category)
  ) {
    return String((product.category as { id?: unknown }).id ?? "").trim();
  }

  return String(product.categoryId ?? "").trim();
};

const matchesStorefrontQuery = (
  product: Product,
  query: StorefrontProductQuery,
) => {
  if (query.category) {
    const normalizedQuery = query.category.trim();
    const categorySlug = getCategorySlugValue(product);
    const categoryId = getCategoryIdValue(product);
    const hasCategorySignal = Boolean(categorySlug || categoryId);

    if (
      hasCategorySignal &&
      categorySlug !== normalizedQuery &&
      categoryId !== normalizedQuery
    ) {
      return false;
    }
  }

  return true;
};

const applyStorefrontQuery = (
  products: Product[],
  query: StorefrontProductQuery,
) => {
  const filtered = products.filter((product) =>
    matchesStorefrontQuery(product, query),
  );

  if (query.pageSize && query.pageSize > 0) {
    const page = query.page && query.page > 0 ? query.page : 1;
    const start = (page - 1) * query.pageSize;
    return filtered.slice(start, start + query.pageSize);
  }

  return filtered;
};

type StorefrontCategory = {
  id: string | number;
  name: string;
  slug: string;
};

const resolveCategoryQueryValue = (
  requestedCategory: string | undefined,
  categories: StorefrontCategory[],
) => {
  const raw = String(requestedCategory ?? "").trim();
  if (!raw || raw.toLowerCase() === "all") return undefined;

  const normalized = raw.toLowerCase();
  const match = categories.find((category) => {
    const categorySlug = String(category.slug ?? "")
      .trim()
      .toLowerCase();
    const categoryId = String(category.id ?? "")
      .trim()
      .toLowerCase();
    return categorySlug === normalized || categoryId === normalized;
  });

  return match ? String(match.id) : raw;
};

const enrichWithCategories = async <T extends Product>(
  products: T[],
  categories?: StorefrontCategory[],
): Promise<T[]> => {
  const categoryRows =
    categories ?? ((await getStorefrontCategories()) as StorefrontCategory[]);
  const categoriesById = new Map(
    categoryRows.map((category) => [String(category.id), category]),
  );
  const categoriesBySlug = new Map(
    categoryRows.map((category) => [category.slug, category]),
  );

  return products.map((product) => {
    const productCategoryId = String(product.categoryId ?? "").trim();
    const productCategorySlug = String(
      (product.category &&
      typeof product.category === "object" &&
      !Array.isArray(product.category)
        ? (product.category as { slug?: unknown }).slug
        : (product.category ?? product.categorySlug ?? "")) ?? "",
    ).trim();
    const productCategoryObject =
      product.category &&
      typeof product.category === "object" &&
      !Array.isArray(product.category)
        ? (product.category as StorefrontCategory)
        : undefined;
    const matchedCategory =
      productCategoryObject ??
      categoriesById.get(productCategoryId) ??
      categoriesBySlug.get(productCategorySlug);

    return {
      ...product,
      category: matchedCategory ?? product.category ?? productCategorySlug,
      categoryId:
        product.categoryId ?? productCategoryObject?.id ?? matchedCategory?.id,
      categorySlug:
        productCategoryObject?.slug ??
        matchedCategory?.slug ??
        productCategorySlug,
      categoryLabel:
        productCategoryObject?.name ??
        matchedCategory?.name ??
        product.categoryLabel ??
        "Uncategorized",
    };
  });
};
