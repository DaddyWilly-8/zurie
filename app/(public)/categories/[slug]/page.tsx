import { notFound } from "next/navigation";
import { Stack } from "@mui/material";
import { getStorefrontCategories } from "@/services/categories/category.service";
import { productService } from "@/services/products/product.service";
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

  const products = await productService.getStorefrontProductsByCategory(slug);

  return (
    <Stack spacing={3}>
      <SectionHeading eyebrow="Category" title={category.name} />
      <ShopGrid
        products={products}
        categories={categories.map((item) => ({
          label: item.name,
          value: item.slug,
        }))}
        initialCategory={slug}
      />
    </Stack>
  );
}
