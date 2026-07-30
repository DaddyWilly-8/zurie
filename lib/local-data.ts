import { CATEGORY_OPTIONS } from "@/constants/categories";
import { SAMPLE_PRODUCTS } from "@/constants/sample-products";
import type { BrandContent, ContactInfo } from "@/types/content";
import type { Product } from "@/types/product";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
};

type EnquiryItem = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

const defaultBrandContent: BrandContent = {
  heroTitle: "Carry Confidence. Wear Elegance.",
  heroSubtitle:
    "Discover elevated handbags designed for modern women who move with style and purpose.",
  heroImage: "/images/hero/zurie-hero.png",
  story:
    "Zurie was founded to create handbags that blend timeless design, premium materials, and everyday functionality.",
  mission: "To empower women with elegant accessories that elevate every moment.",
  vision: "To become Africa's leading modern luxury handbag house loved globally.",
  qualityCommitment:
    "Every Zurie piece is crafted with meticulous detail, durable materials, and premium finishing standards.",
};

const defaultContactInfo: ContactInfo = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "255718752434",
  phone: "+254 718 752 434",
  email: "hello@zurie.co.tz",
  address: "Nairobi, Kenya",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=Nairobi&t=&z=13&ie=UTF8&iwloc=&output=embed",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  tiktok: "https://tiktok.com",
};

const cloneProduct = (product: Product): Product => ({
  ...product,
  specifications: [...product.specifications],
  colors: product.colors.map((color) => ({ ...color })),
  sizes: [...product.sizes],
  images: product.images.map((image) => ({ ...image })),
});

const nowIso = () => new Date().toISOString();
const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const state: {
  products: Product[];
  categories: CategoryItem[];
  enquiries: EnquiryItem[];
  newsletter: Array<{ email: string; created_at: string }>;
  brandContent: BrandContent;
  contactInfo: ContactInfo;
} = {
  products: SAMPLE_PRODUCTS.map((product, index) => ({
    ...cloneProduct(product),
    createdAt: product.createdAt ?? new Date(Date.now() - index * 1000).toISOString(),
  })),
  categories: CATEGORY_OPTIONS.map((item) => ({
    id: item.value,
    name: item.label,
    slug: item.value,
  })),
  enquiries: [] as EnquiryItem[],
  newsletter: [] as Array<{ email: string; created_at: string }>,
  brandContent: { ...defaultBrandContent },
  contactInfo: { ...defaultContactInfo },
};

export const getBrandContentState = () => ({ ...state.brandContent });

export const updateBrandContentState = (payload: Partial<BrandContent>) => {
  state.brandContent = {
    ...state.brandContent,
    ...payload,
  };
};

export const getContactInfoState = () => ({ ...state.contactInfo });

export const updateContactInfoState = (payload: Partial<ContactInfo>) => {
  state.contactInfo = {
    ...state.contactInfo,
    ...payload,
  };
};

export const listProductsState = (): Product[] => state.products.map(cloneProduct);

export const listProductsByCategoryState = (category: string): Product[] =>
  state.products
    .filter((product) => product.category === category)
    .map(cloneProduct);

export const findProductBySlugState = (slug: string): Product | null => {
  const match = state.products.find((product) => product.slug === slug);
  return match ? cloneProduct(match) : null;
};

export const listAdminProductsState = () =>
  state.products
    .slice()
    .sort((a, b) => Number(new Date(b.createdAt ?? 0)) - Number(new Date(a.createdAt ?? 0)))
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      category: product.category,
      featured: product.featured,
      best_seller: product.bestSeller,
      new_arrival: product.newArrival,
      in_stock: product.inStock,
      stock_count: product.stockCount,
      colors: product.colors.map((color) => ({ ...color })),
      sizes: [...product.sizes],
      specifications: [...product.specifications],
      created_at: product.createdAt ?? nowIso(),
      product_images: product.images.map((image, index) => ({
        id: image.id ?? `${product.id}_${index}`,
        url: image.url,
        alt_text: image.alt,
        is_primary: image.isPrimary ?? index === 0,
      })),
    }));

export const createProductState = (payload: {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  inStock: boolean;
  stockCount: number;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  specifications: string[];
  imageUrls?: string[];
  imageUrl?: string;
}) => {
  const id = createId("p");
  const incomingImageUrls = (payload.imageUrls ?? [])
    .map((item) => item.trim())
    .filter(Boolean);
  const fallbackImageUrl = payload.imageUrl?.trim() || "/images/products/fallback.png";
  const imageUrls = incomingImageUrls.length ? incomingImageUrls : [fallbackImageUrl];

  const product: Product = {
    id,
    slug: payload.slug,
    name: payload.name,
    description: payload.description,
    price: payload.price,
    category: payload.category as Product["category"],
    featured: payload.featured,
    bestSeller: payload.bestSeller,
    newArrival: payload.newArrival,
    inStock: payload.inStock,
    stockCount: payload.stockCount,
    specifications: payload.specifications,
    colors: payload.colors,
    sizes: payload.sizes,
    images: imageUrls.map((url, index) => ({
      id: `${id}_${index}`,
      url,
      alt: `${payload.name} image ${index + 1}`,
      isPrimary: index === 0,
    })),
    createdAt: nowIso(),
  };

  state.products.unshift(product);
  return id;
};

export const updateProductState = (
  id: string,
  payload: {
    name: string;
    slug: string;
    description: string;
    price: number;
    category: string;
    featured: boolean;
    bestSeller: boolean;
    newArrival: boolean;
    inStock: boolean;
    stockCount: number;
    colors: Array<{ name: string; hex: string }>;
    sizes: string[];
    specifications: string[];
    imageUrls?: string[];
  },
) => {
  const index = state.products.findIndex((product) => product.id === id);
  if (index < 0) return false;

  const existing = state.products[index];
  state.products[index] = {
    ...existing,
    name: payload.name,
    slug: payload.slug,
    description: payload.description,
    price: payload.price,
    category: payload.category as Product["category"],
    featured: payload.featured,
    bestSeller: payload.bestSeller,
    newArrival: payload.newArrival,
    inStock: payload.inStock,
    stockCount: payload.stockCount,
    colors: payload.colors,
    sizes: payload.sizes,
    specifications: payload.specifications,
    images: (payload.imageUrls ?? [])
      .map((url) => url.trim())
      .filter(Boolean)
      .map((url, imageIndex) => ({
        id: existing.images[imageIndex]?.id ?? `${existing.id}_${imageIndex}`,
        url,
        alt: `${payload.name} image ${imageIndex + 1}`,
        isPrimary: imageIndex === 0,
      })),
  };

  if (!state.products[index].images.length) {
    state.products[index].images = [
      {
        id: `${existing.id}_0`,
        url: "/images/products/fallback.png",
        alt: `${payload.name} image 1`,
        isPrimary: true,
      },
    ];
  }

  return true;
};

export const deleteProductState = (id: string) => {
  const before = state.products.length;
  state.products = state.products.filter((product) => product.id !== id);
  return state.products.length !== before;
};

export const listCategoriesState = (): CategoryItem[] =>
  state.categories
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((item) => ({ ...item }));

export const createCategoryState = (payload: { name: string; slug: string }) => {
  const exists = state.categories.some((item) => item.slug === payload.slug);
  if (exists) return false;

  state.categories.push({
    id: createId("cat"),
    name: payload.name,
    slug: payload.slug,
  });
  return true;
};

export const updateCategoryState = (
  id: string,
  payload: { name?: string; slug?: string },
) => {
  const index = state.categories.findIndex((item) => item.id === id);
  if (index < 0) return false;

  state.categories[index] = {
    ...state.categories[index],
    ...payload,
  };
  return true;
};

export const deleteCategoryState = (id: string) => {
  const before = state.categories.length;
  state.categories = state.categories.filter((item) => item.id !== id);
  return state.categories.length !== before;
};

export const addEnquiryState = (payload: {
  name: string;
  email: string;
  message: string;
}) => {
  state.enquiries.unshift({
    id: createId("enq"),
    name: payload.name,
    email: payload.email,
    message: payload.message,
    created_at: nowIso(),
  });
};

export const listEnquiriesState = (): EnquiryItem[] =>
  state.enquiries.map((item) => ({ ...item }));

export const upsertNewsletterState = (email: string) => {
  const existing = state.newsletter.find((item) => item.email === email);
  if (existing) return;
  state.newsletter.unshift({ email, created_at: nowIso() });
};

export const getDashboardCountsState = () => ({
  products: state.products.length,
  enquiries: state.enquiries.length,
  newsletterSubscribers: state.newsletter.length,
});
