import { notFound } from "next/navigation";
import { Stack } from "@mui/material";
import { ProductDetailClient } from "@/features/shop/product-detail-client";
import { buildMetadata } from "@/lib/metadata";
import { getStorefrontCategories } from "@/services/categories/category.service";
import { getProductBySlug } from "@/services/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return buildMetadata({
      title: "Product Not Found | Zuriè",
      description: "This product could not be found.",
      path: `/shop/${slug}`,
    });
  }

  return buildMetadata({
    title: `${product.name} | Zuriè`,
    description: product.description,
    path: `/shop/${product.slug}`,
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, categories] = await Promise.all([
    getProductBySlug(slug),
    getStorefrontCategories(),
  ]);

  if (!product) notFound();

  const categoryLabel =
    (typeof product.category === "object" && product.category && "name" in product.category
      ? String(product.category.name ?? "")
      : categories.find((item) => item.slug === product.categorySlug || item.slug === product.category)?.name) ??
    "Uncategorized";

  return (
    <Stack spacing={8}>
      <ProductDetailClient product={product} categoryLabel={categoryLabel} />
    </Stack>
  );
}
