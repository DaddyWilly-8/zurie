import type { AdminProduct, ProductFormState } from "./types";

const toInventoryStatus = (state: ProductFormState) => {
  if (!state.inStock) return "OUT_OF_STOCK" as const;
  if (state.stockCount <= 0) return "OUT_OF_STOCK" as const;
  return "IN_STOCK" as const;
};

const parseList = (value: string) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export const parseImageUrls = (value: string) => parseList(value);

const getColorHex = (name: string): string => {
  const colorMap: Record<string, string> = {
    Beige: "#D4C4B7",
    Black: "#111111",
    Tan: "#D2B48C",
    White: "#FFFFFF",
    Brown: "#8B4513",
    Navy: "#000080",
    Red: "#FF0000",
    Blue: "#0000FF",
    Green: "#008000",
    Yellow: "#FFFF00",
    Purple: "#800080",
    Orange: "#FFA500",
    Pink: "#FFC0CB",
    Grey: "#808080",
    Silver: "#C0C0C0",
    Gold: "#FFD700",
    Rose: "#FF007F",
    Camel: "#C19A6B",
    Cognac: "#9A463D",
    Ivory: "#FFFFF0",
    Champagne: "#F7E7CE",
    Mocha: "#8B7355",
    Saddle: "#8B4513",
    Chestnut: "#954535",
    Mahogany: "#C04000",
    Ebony: "#555D50",
    Onyx: "#353839",
    Slate: "#708090",
    Stone: "#928E85",
    Sand: "#C2B280",
    Clay: "#B66A4A",
    Terracotta: "#E2725B",
    Sage: "#8A9A5B",
    Olive: "#808000",
    Hunter: "#355E3B",
    Forest: "#228B22",
    Teal: "#008080",
    Aqua: "#00FFFF",
    Sky: "#87CEEB",
    Indigo: "#4B0082",
    Violet: "#EE82EE",
    Lavender: "#E6E6FA",
    Mauve: "#E0B0FF",
    Burgundy: "#800020",
    Crimson: "#DC143C",
    Ruby: "#E0115F",
    Garnet: "#733635",
    Amber: "#FFBF00",
    Honey: "#E5A93E",
    Saffron: "#F4C430",
    Copper: "#B87333",
    Bronze: "#CD7F32",
    Chrome: "#DFE0DF",
    Nickel: "#727472",
    Titanium: "#878681",
  };

  return colorMap[name] || "#CCCCCC";
};

const parseColors = (value: string) => {
  const colors = parseList(value)
    .map((name) => {
      if (!name) return null;
      const hex = getColorHex(name);
      return { name, hex };
    })
    .filter((item): item is { name: string; hex: string } => item !== null);

  return colors.length ? colors : [{ name: "Beige", hex: "#D4C4B7" }];
};

export const emptyFormState: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  price: 0,
  compareAt: 0,
  sku: "",
  status: "draft",
  material: "",
  dimensions: "",
  hardware: "",
  lining: "",
  seoTitle: "",
  seoDescription: "",
  featuredImageUrl: "",
  category: "tote-bags",
  featured: false,
  bestSeller: false,
  newArrival: false,
  inStock: true,
  stockCount: 1,
  imageUrlsText: "",
  colorsText: "Beige, Black, Tan",
  sizesText: "One Size",
};

export const toFormState = (product: AdminProduct): ProductFormState => ({
  name: product.name,
  slug: product.slug,
  description: product.description,
  shortDescription: product.short_description ?? "",
  price: product.price,
  compareAt: product.sale_price ?? 0,
  sku: product.sku ?? "",
  status: product.status ?? "published",
  material: product.material ?? "",
  dimensions: product.specifications[1] ?? "",
  hardware: product.specifications[2] ?? "",
  lining: product.specifications[3] ?? "",
  seoTitle: product.seo_title ?? "",
  seoDescription: product.seo_description ?? "",
  featuredImageUrl: product.featured_image_url ?? "",
  category: product.category,
  featured: product.featured,
  bestSeller: product.best_seller,
  newArrival: product.new_arrival,
  inStock: (product.stock_status ?? (product.in_stock ? "IN_STOCK" : "OUT_OF_STOCK")) !== "OUT_OF_STOCK",
  stockCount: product.stock_count,
  imageUrlsText: product.product_images.map((item) => item.url).join("\n"),
  colorsText: product.colors.map((item) => item.name).join(", "),
  sizesText: product.sizes.join(", "),
});

const toBasePayload = (state: ProductFormState) => ({
  name: state.name.trim(),
  slug: state.slug.trim(),
  description: state.description.trim(),
  shortDescription: state.shortDescription.trim(),
  price: Number(state.price),
  salePrice: Number(state.compareAt) > 0 ? Number(state.compareAt) : null,
  sku: state.sku.trim(),
  status: state.status,
  material: state.material.trim(),
  seoTitle: state.seoTitle.trim(),
  seoDescription: state.seoDescription.trim(),
  featuredImageUrl: state.featuredImageUrl.trim() || undefined,
  category: state.category.trim(),
  featured: state.featured,
  bestSeller: state.bestSeller,
  newArrival: state.newArrival,
  colors: parseColors(state.colorsText),
  sizes: parseList(state.sizesText),
  specifications: [state.material, state.dimensions, state.hardware, state.lining].map((item) => item.trim()),
  imageUrls: parseImageUrls(state.imageUrlsText),
});

export const toCreatePayload = (state: ProductFormState) => ({
  ...toBasePayload(state),
  quantity: Math.max(0, Number(state.stockCount) || 0),
});

export const toUpdatePayload = (state: ProductFormState) => toBasePayload(state);

export const toInventoryPayload = (state: ProductFormState) => ({
  quantity: Math.max(0, Number(state.stockCount) || 0),
  stockStatus: toInventoryStatus(state),
});
