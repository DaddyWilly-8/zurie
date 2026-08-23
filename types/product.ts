export type ProductCategory =
  | string
  | {
      id?: string | number;
      name?: string;
      slug?: string;
      description?: string | null;
      imageUrl?: string | null;
      image_url?: string | null;
      visible?: boolean;
      is_visible?: boolean;
      sortOrder?: number;
      sort_order?: number;
      [key: string]: unknown;
    };

export type ProductColor = {
  name: string;
  hex: string;
};

export type ProductImage = {
  id?: string;
  url: string;
  alt: string;
  isPrimary?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  categoryLabel?: string;
  categoryId?: string | number;
  categorySlug?: string;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  inStock: boolean;
  stockCount: number;
  specifications: string[];
  colors: ProductColor[];
  sizes: string[];
  images: ProductImage[];
  createdAt?: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
  product: Product;
};
