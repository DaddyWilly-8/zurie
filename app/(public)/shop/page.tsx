import { Box, Stack } from "@mui/material";
import { buildMetadata } from "@/lib/metadata";
import { getProducts } from "@/services/products";
import { ShopGrid } from "@/features/shop/shop-grid";

export const metadata = buildMetadata({
  title: "Zuriè",
  description:
    "Browse premium handbags, totes, shoulder, crossbody, backpacks, and wallets.",
  path: "/shop",
});

type ShopPageProps = {
  searchParams?: Promise<{ category?: string }>;
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = (await searchParams) ?? {};
  const products = await getProducts();

  return (
    <Stack spacing={{ xs: 2.4, md: 3.2 }} sx={{ pt: { xs: 1.5, md: 3 } }}>
      <Box sx={{ pt: 0.8 }}>
        <ShopGrid
          products={products}
          initialCategory={params.category ?? "all"}
        />
      </Box>
    </Stack>
  );
}
