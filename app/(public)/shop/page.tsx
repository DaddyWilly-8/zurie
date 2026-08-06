import { buildMetadata } from "@/lib/metadata";
import { ShopPageClient } from "@/features/shop/shop-page-client";

export const metadata = buildMetadata({
  title: "Zuriè",
  description:
    "Browse premium handbags, totes, shoulder, crossbody, backpacks, and wallets.",
  path: "/shop",
});

export default function ShopPage() {
  return <ShopPageClient />;
}
