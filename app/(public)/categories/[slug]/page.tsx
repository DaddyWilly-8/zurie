import { notFound } from "next/navigation";
import { Stack } from "@mui/material";
import { CATEGORY_OPTIONS } from "@/constants/categories";
import { getProductsByCategory } from "@/services/products";
import { SectionHeading } from "@/components/section-heading";
import { ShopGrid } from "@/features/shop/shop-grid";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = CATEGORY_OPTIONS.find((item) => item.value === slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(slug);

  return (
    <Stack spacing={3}>
      <SectionHeading eyebrow="Category" title={category.label} />
      <ShopGrid products={products} />
    </Stack>
  );
}
