import { productService } from "@/services/products/product.service";
import type { Product } from "@/types/product";
import { getStorefrontCategories } from "@/services/categories/category.service";

export type StorefrontProductQuery = {
  category?: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  page?: number;
  pageSize?: number;
};

type RawStorefrontProduct = Partial<Product> & {
  id?: string | number;
  slug?: string;
  name?: string;
  description?: string;
  shortDescription?: string;
  price?: number | string;
  salePrice?: number | string | null;
  category?: string;
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
  images?: Array<{ id?: string | number; url?: string; alt?: string; alt_text?: string; isPrimary?: boolean; is_primary?: boolean }>;
  product_images?: Array<{ id?: string | number; url?: string; alt?: string; alt_text?: string; isPrimary?: boolean; is_primary?: boolean }>;
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
  image: { id?: string | number; url?: string; alt?: string; alt_text?: string; isPrimary?: boolean; is_primary?: boolean },
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
  const categoryId = row.categoryId ?? row.category_id;
  const rawCategorySlug = String(row.category ?? row.categorySlug ?? "").trim();
  const baseImageUrl = String(row.featuredImageUrl ?? row.imageUrl ?? row.image_url ?? "").trim();
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

  const images = imageRows.length > 0
    ? imageRows
    : arrayImages.length > 0
      ? arrayImages
    : baseImageUrl
      ? [{ id: undefined, url: baseImageUrl, alt: name || "Product image", isPrimary: true }]
      : [];

  const stockCount = toNumber(row.stockCount ?? row.stock_count ?? row.quantity, 0);
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
    category: rawCategorySlug,
    categoryId,
    categorySlug: rawCategorySlug,
    categoryLabel: undefined,
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

const matchesStorefrontQuery = (product: Product, query: StorefrontProductQuery) => {
  if (query.category) {
    const normalizedQuery = query.category.trim();
    const categorySlug = String(product.categorySlug ?? product.category ?? "").trim();
    const categoryId = String(product.categoryId ?? "").trim();
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

const applyStorefrontQuery = (products: Product[], query: StorefrontProductQuery) => {
  const filtered = products.filter((product) => matchesStorefrontQuery(product, query));

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
    const categorySlug = String(category.slug ?? "").trim().toLowerCase();
    const categoryId = String(category.id ?? "").trim().toLowerCase();
    return categorySlug === normalized || categoryId === normalized;
  });

  return match ? String(match.id) : raw;
};

const enrichWithCategories = async <T extends Product & {
  category?: string;
  categoryId?: string | number;
  categoryLabel?: string;
  categorySlug?: string;
}>(products: T[], categories?: StorefrontCategory[]): Promise<T[]> => {
  const categoryRows = categories ?? ((await getStorefrontCategories()) as StorefrontCategory[]);
  const categoriesById = new Map(categoryRows.map((category) => [String(category.id), category]));
  const categoriesBySlug = new Map(categoryRows.map((category) => [category.slug, category]));

  return products.map((product) => {
    const productCategoryId = String(product.categoryId ?? "").trim();
    const productCategorySlug = String(product.category ?? product.categorySlug ?? "").trim();
    const matchedCategory =
      categoriesById.get(productCategoryId) ?? categoriesBySlug.get(productCategorySlug);

    return {
      ...product,
      category: matchedCategory?.slug ?? productCategorySlug,
      categoryId: product.categoryId ?? matchedCategory?.id,
      categorySlug: matchedCategory?.slug ?? productCategorySlug,
      categoryLabel: matchedCategory?.name ?? product.categoryLabel ?? "Uncategorized",
    };
  });
};

export const getProducts = async (query: StorefrontProductQuery = {}): Promise<Product[]> => {
  try {
    const categories = (await getStorefrontCategories()) as StorefrontCategory[];
    const resolvedCategory = resolveCategoryQueryValue(query.category, categories);
    const products = await productService.listStorefrontProducts({
      ...query,
      category: resolvedCategory,
    });
    const normalizedProducts = (products as RawStorefrontProduct[]).map(normalizeStorefrontProduct);
    const enriched = await enrichWithCategories(normalizedProducts, categories);
    return applyStorefrontQuery(enriched, query);
  } catch {
    return [];
  }
};

export const getProductBySlug = async (
  slug: string,
): Promise<Product | null> => {
  try {
    const rawProduct = (await productService.getProductBySlug(slug)) as RawStorefrontProduct | null;
    const product = rawProduct ? normalizeStorefrontProduct(rawProduct) : null;
    if (!product) return null;
    return (await enrichWithCategories([product]))[0] ?? product;
  } catch {
    return null;
  }
};

export const getProductsByCategory = async (
  category: string,
): Promise<Product[]> => {
  try {
    return getProducts({ category });
  } catch {
    return [];
  }
};
