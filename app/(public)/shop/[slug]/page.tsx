import { notFound } from "next/navigation";
import { Stack } from "@mui/material";
import { ProductDetailClient } from "@/features/shop/product-detail-client";
import { buildMetadata } from "@/lib/metadata";
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
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <Stack spacing={8}>
      <ProductDetailClient product={product} />
    </Stack>
  );
}
