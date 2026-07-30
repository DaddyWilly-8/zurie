import type { ProductCategory } from "@/types/product";

export const CATEGORY_OPTIONS: Array<{
  label: string;
  value: ProductCategory;
}> = [
  { label: "Handbags", value: "handbags" },
  { label: "Tote Bags", value: "tote-bags" },
  { label: "Shoulder Bags", value: "shoulder-bags" },
  { label: "Crossbody Bags", value: "crossbody-bags" },
  { label: "Backpacks", value: "backpacks" },
  { label: "Wallets", value: "wallets" },
];
