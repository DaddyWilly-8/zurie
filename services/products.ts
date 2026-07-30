import { productService } from "@/services/products/product.service";
import type { Product } from "@/types/product";

export const getProducts = async (): Promise<Product[]> => {
  return (await productService.listStorefrontProducts()) as Product[];
};

export const getProductBySlug = async (
  slug: string,
): Promise<Product | null> => {
  return (await productService.getProductBySlug(slug)) as Product | null;
};

export const getProductsByCategory = async (
  category: string,
): Promise<Product[]> => {
  return (await productService.listProductsByCategory(category)) as Product[];
};
