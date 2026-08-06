import { categoryService } from "@/services/categories/category.service";
import { toCategoryPayload } from "./category-utils";
import type { Category, CategoryForm } from "./types";

const dataUrlToFile = async (dataUrl: string, fallbackName: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const extension = blob.type.split("/")[1] || "png";
  return new File([blob], `${fallbackName}.${extension}`, { type: blob.type || "image/png" });
};

const isDataUrl = (value: string) => value.startsWith("data:image/");


export const categoryActions = {
  async list(): Promise<Category[]> {
    const categories = (await categoryService.listAdminCategories()) as Category[];
    return categories;
  },

  async create(form: CategoryForm) {
    const payload = await categoryService.createCategory(toCategoryPayload(form));
    return payload;
  },

  async update(id: string, form: CategoryForm) {
    return categoryService.updateCategory(id, toCategoryPayload(form));
  },

  async uploadImage(id: string, dataUrl: string) {
    if (!isDataUrl(dataUrl.trim())) return null;
    const file = await dataUrlToFile(dataUrl.trim(), `category-${id}`);
    return categoryService.uploadCategoryImage(id, file);
  },

  async removeImage(id: string) {
    return categoryService.removeCategoryImage(id);
  },

  async remove(id: string) {
    return categoryService.deleteCategory(id);
  },
};
