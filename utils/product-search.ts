import type { Product } from "@/types/product";

export const getProductCategoryName = (product: Product): string =>
  typeof product.category === "object" && product.category
    ? String((product.category as { name?: unknown }).name ?? "")
    : "";

export const getProductCategorySlug = (product: Product): string =>
  typeof product.category === "object" && product.category
    ? String((product.category as { slug?: unknown }).slug ?? "")
    : String(
        product.categorySlug ?? product.category ?? product.categoryId ?? "",
      );

export const buildProductSearchHaystack = (product: Product): string =>
  [
    product.name,
    product.description,
    product.categoryLabel ?? "",
    getProductCategoryName(product),
    getProductCategorySlug(product),
    product.bestSeller ? "best seller bestseller" : "",
    product.newArrival ? "new arrival new" : "",
    product.featured ? "featured" : "",
    product.originalPrice != null ? "discount sale on sale offer" : "",
  ]
    .join(" ")
    .toLowerCase();

export const productMatchesQuery = (
  product: Product,
  query: string,
): boolean => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return buildProductSearchHaystack(product).includes(normalized);
};
