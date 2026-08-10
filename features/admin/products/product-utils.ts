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

export const parseImageUrls = (value: string) =>
  value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

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

const parseColors = (value: string): Array<{ name: string; hex: string }> | undefined => {
  const colors = parseList(value)
    .map((name) => {
      if (!name) return null;
      const hex = getColorHex(name);
      return { name, hex };
    })
    .filter((item): item is { name: string; hex: string } => item !== null);

  return colors.length ? colors : undefined;
};

const optionalText = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

const optionalStringList = (values: string[]) => {
  return values.length ? values : undefined;
};

export const emptyFormState: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  price: null,
  buyingPrice: null,
  compareAt: null,
  sku: "",
  status: "draft",
  material: "",
  dimensions: "",
  hardware: "",
  lining: "",
  seoTitle: "",
  seoDescription: "",
  featuredImageUrl: "",
  categoryId: "",
  category: "tote-bags",
  featured: false,
  bestSeller: false,
  newArrival: false,
  inStock: true,
  stockCount: 0,
  imageUrlsText: "",
  existingImageIds: [],
  removedImageIds: [],
  colorsText: "",
  sizesText: "One Size",
};

export const toFormState = (product: AdminProduct): ProductFormState => {
  const imageUrls = [
    ...(product.images ?? []).map((item) => item.url),
    ...(product.imageUrls ?? []),
    ...(product.product_images ?? []).map((item) => item.url),
  ].filter((url): url is string => Boolean(url));

  const imageIds = (product.images ?? []).map((item) => String(item.id));
  const stockStatus = product.stockStatus ?? product.stock_status ?? (product.in_stock ? "IN_STOCK" : "OUT_OF_STOCK");

  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? product.short_description ?? "",
    price: product.price ?? null,
    buyingPrice: product.buyingPrice ?? product.buying_price ?? product.price ?? null,
    compareAt: product.salePrice ?? product.sale_price ?? null,
    sku: product.sku ?? "",
    status: product.status ?? "draft",
    material: product.material ?? "",
    dimensions: product.specifications?.[0] ?? "",
    hardware: product.specifications?.[1] ?? "",
    lining: product.specifications?.[2] ?? "",
    seoTitle: product.seoTitle ?? product.seo_title ?? "",
    seoDescription: product.seoDescription ?? product.seo_description ?? "",
    featuredImageUrl: product.featuredImageUrl ?? product.featured_image_url ?? "",
    categoryId: String(product.categoryId ?? product.category_id ?? product.category ?? ""),
    category: product.category ?? "",
    featured: Boolean(product.featured),
    bestSeller: Boolean(product.bestSeller ?? product.best_seller),
    newArrival: Boolean(product.newArrival ?? product.new_arrival),
    inStock: stockStatus !== "OUT_OF_STOCK",
    stockCount: product.quantity ?? product.stockCount ?? product.stock_count ?? 0,
    imageUrlsText: imageUrls.join("\n"),
    existingImageIds: imageIds,
    removedImageIds: [],
    colorsText: (product.colors ?? []).map((item) => item.name).join(", "),
    sizesText: (product.sizes ?? []).join(", "),
  };
};

const toBasePayload = (state: ProductFormState) => {
  const description = optionalText(state.description);
  const shortDescription = optionalText(state.shortDescription);
  const sku = optionalText(state.sku);
  const material = optionalText(state.material);
  const seoTitle = optionalText(state.seoTitle);
  const seoDescription = optionalText(state.seoDescription);
  const colors = parseColors(state.colorsText);
  const sizes = optionalStringList(parseList(state.sizesText));
  const specifications = optionalStringList(
    [state.dimensions, state.hardware, state.lining].map((item) => item.trim()).filter(Boolean),
  );
  return {
    name: state.name.trim(),
    slug: state.slug.trim(),
    categoryId: String(state.categoryId ?? "").trim(),
    buyingPrice: Number(state.buyingPrice ?? 0),
    price: Number(state.price ?? 0),
    status: state.status,
    featured: Boolean(state.featured),
    bestSeller: Boolean(state.bestSeller),
    newArrival: Boolean(state.newArrival),
    ...(description ? { description } : {}),
    ...(shortDescription ? { shortDescription } : {}),
    ...(sku ? { sku } : {}),
    ...(state.compareAt !== null ? { salePrice: Number(state.compareAt) } : {}),
    ...(material ? { material } : {}),
    ...(colors ? { colors } : {}),
    ...(sizes ? { sizes } : {}),
    ...(specifications ? { specifications } : {}),
    ...(seoTitle ? { seoTitle } : {}),
    ...(seoDescription ? { seoDescription } : {}),
  };
};

export const toCreatePayload = (state: ProductFormState) => ({
  ...toBasePayload(state),
  quantity: Math.max(0, Number(state.stockCount) || 0),
});

export const toUpdatePayload = (state: ProductFormState) => toBasePayload(state);

export const toInventoryPayload = (state: ProductFormState) => ({
  quantity: Math.max(0, Number(state.stockCount) || 0),
  stockStatus: toInventoryStatus(state),
});
