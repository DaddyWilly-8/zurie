import { productService } from "@/services/products/product.service";
import { toCreatePayload, toInventoryPayload, toUpdatePayload } from "./product-utils";
import type { AdminProduct, ProductFormState } from "./types";

export const productActions = {
  async list(): Promise<AdminProduct[]> {
    const productList = (await productService.listAdminProducts()) as AdminProduct[];
    return productList;
  },

  async create(form: ProductFormState) {
    return productService.createProduct(toCreatePayload(form));
  },

  async update(id: string, form: ProductFormState) {
    await productService.updateProduct(id, toUpdatePayload(form));
    return productService.updateInventory(id, toInventoryPayload(form));
  },

  async remove(id: string) {
    return productService.deleteProduct(id);
  },

  async duplicate(id: string) {
    return productService.duplicateProduct(id);
  },
};
