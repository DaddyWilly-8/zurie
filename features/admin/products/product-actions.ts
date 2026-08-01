import { productService } from "@/services/products/product.service";
import { toPayload } from "./product-utils";
import type { AdminProduct, ProductFormState } from "./types";

export const productActions = {
  async list(): Promise<AdminProduct[]> {
    const productList = (await productService.listAdminProducts()) as AdminProduct[];
    return productList;
  },

  async create(form: ProductFormState) {
    return productService.createProduct(toPayload(form));
  },

  async update(id: string, form: ProductFormState) {
    return productService.updateProduct(id, toPayload(form));
  },

  async remove(id: string) {
    return productService.deleteProduct(id);
  },

  async duplicate(id: string) {
    return productService.duplicateProduct(id);
  },
};
