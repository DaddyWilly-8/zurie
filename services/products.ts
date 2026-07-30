import {
  findProductBySlugState,
  listProductsByCategoryState,
  listProductsState,
} from "@/lib/local-data";
import type { Product } from "@/types/product";

export const getProducts = async (): Promise<Product[]> => listProductsState();

export const getProductBySlug = async (
  slug: string,
): Promise<Product | null> => {
  return findProductBySlugState(slug);
};

export const getProductsByCategory = async (
  category: string,
): Promise<Product[]> => {
  return listProductsByCategoryState(category);
};
