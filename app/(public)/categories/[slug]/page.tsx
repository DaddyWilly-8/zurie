import { notFound } from "next/navigation";
import { Stack } from "@mui/material";
import { getStorefrontCategories } from "@/services/categories/category.service";
import { getProductsByCategory } from "@/services/products";
import { SectionHeading } from "@/components/section-heading";
import { ShopGrid } from "@/features/shop/shop-grid";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getStorefrontCategories();
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(slug);

  return (
    <Stack spacing={3}>
      <SectionHeading eyebrow="Category" title={category.name} />
      <ShopGrid
        products={products}
        categories={categories.map((item) => ({ label: item.name, value: item.slug }))}
        initialCategory={slug}
      />
    </Stack>
  );
}
