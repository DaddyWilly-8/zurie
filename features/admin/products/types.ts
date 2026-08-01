export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  sale_price?: number | null;
  sku?: string;
  status?: "draft" | "published" | "out_of_stock" | "archived";
  material?: string;
  seo_title?: string;
  seo_description?: string;
  featured_image_url?: string;
  category: string;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  in_stock: boolean;
  stock_count: number;
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
  compareAt: number;
  sku: string;
  status: "draft" | "published" | "out_of_stock" | "archived";
  material: string;
  dimensions: string;
  hardware: string;
  lining: string;
  seoTitle: string;
  seoDescription: string;
  featuredImageUrl: string;
  category: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  inStock: boolean;
  stockCount: number;
  imageUrlsText: string;
  colorsText: string;
  sizesText: string;
};

export type ProductEdits = Record<string, ProductFormState>;

export type ProductFieldsProps = {
  state: ProductFormState;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
};
