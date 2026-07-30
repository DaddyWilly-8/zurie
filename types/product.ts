export type ProductCategory =
  | "handbags"
  | "tote-bags"
  | "shoulder-bags"
  | "crossbody-bags"
  | "backpacks"
  | "wallets";

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
