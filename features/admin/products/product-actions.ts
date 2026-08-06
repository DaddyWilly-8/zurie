import { productService } from "@/services/products/product.service";
import { parseImageUrls, toCreatePayload, toInventoryPayload, toUpdatePayload } from "./product-utils";
import type { AdminProduct, ProductFormState } from "./types";

const readProductId = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;
  const direct = (payload as { id?: string | number }).id;
  if (typeof direct === "string" || typeof direct === "number") return String(direct);

  const nested = (payload as { data?: { id?: string | number } }).data?.id;
  if (typeof nested === "string" || typeof nested === "number") return String(nested);

  return null;
};

const isDataUrl = (value: string) => value.startsWith("data:image/");

const dataUrlToFile = async (dataUrl: string, fileNamePrefix: string, index: number) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "png";
  return new File([blob], `${fileNamePrefix}-${index + 1}.${extension}`, {
    type: blob.type || "image/png",
  });
};

const collectNewImageFiles = async (form: ProductFormState, prefix: string) => {
  const urls = parseImageUrls(form.imageUrlsText).filter(isDataUrl);
  return Promise.all(urls.map((dataUrl, index) => dataUrlToFile(dataUrl, prefix, index)));
};

export const productActions = {
  async list(): Promise<AdminProduct[]> {
    const productList = (await productService.listAdminProducts()) as AdminProduct[];
    return productList;
  },

  async getById(id: string): Promise<AdminProduct | null> {
    return productService.getAdminProductById(id) as Promise<AdminProduct | null>;
  },

  async uploadImages(id: string, files: File[]) {
    return productService.uploadProductImages(id, files);
  },

  async deleteImage(id: string, imageId: string) {
    return productService.deleteProductImage(id, imageId);
  },

  async create(form: ProductFormState) {
    const payload = await productService.createProduct(toCreatePayload(form));
    const productId = readProductId(payload);

    if (productId) {
      const files = await collectNewImageFiles(form, `product-${productId}`);
      if (files.length) {
        await productService.uploadProductImages(productId, files);
      }
    }

    return payload;
  },

  async update(id: string, form: ProductFormState) {
    await productService.updateProduct(id, toUpdatePayload(form));

    if (form.removedImageIds.length) {
      await Promise.all(
        form.removedImageIds.map((imageId) => productService.deleteProductImage(id, imageId)),
      );
    }

    const files = await collectNewImageFiles(form, `product-${id}`);
    if (files.length) {
      await productService.uploadProductImages(id, files);
    }

    return productService.updateInventory(id, toInventoryPayload(form));
  },

  async remove(id: string) {
    return productService.deleteProduct(id);
  },

  async duplicate(id: string) {
    return productService.duplicateProduct(id);
  },
};
