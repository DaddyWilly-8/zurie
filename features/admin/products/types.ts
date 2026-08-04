export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  buying_price?: number;
  sale_price?: number | null;
  sku?: string;
  status?: "draft" | "published" | "archived";
  material?: string;
  seo_title?: string;
  seo_description?: string;
  featured_image_url?: string;
  category_id?: string;
  category: string;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  in_stock: boolean;
  stock_count: number;
  stock_status?: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  imageUrls?: string[];
  images?: Array<{ id: string; url: string; sortOrder: number }>;
  colors: Array<{ name: string; hex: string }>;
  sizes: string[];
  specifications: string[];
  product_images: Array<{
    id: string;
    url: string;
    alt_text: string;
    is_primary: boolean;
  }>;
};

export type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  buyingPrice: number;
  compareAt: number;
  sku: string;
  status: "draft" | "published" | "archived";
  material: string;
  dimensions: string;
  hardware: string;
  lining: string;
  seoTitle: string;
  seoDescription: string;
  featuredImageUrl: string;
  categoryId: string;
  category: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  inStock: boolean;
  stockCount: number;
  imageUrlsText: string;
  existingImageIds: string[];
  removedImageIds: string[];
  colorsText: string;
  sizesText: string;
};

export type ProductEdits = Record<string, ProductFormState>;

export type ProductFieldsProps = {
  state: ProductFormState;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
  categoryOptions: Array<{ value: string; label: string }>;
};
