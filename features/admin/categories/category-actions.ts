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

const readEntityId = (payload: unknown): string | null => {
  if (!payload || typeof payload !== "object") return null;
  const direct = (payload as { id?: string | number }).id;
  if (typeof direct === "string" || typeof direct === "number") return String(direct);

  const nested = (payload as { data?: { id?: string | number } }).data?.id;
  if (typeof nested === "string" || typeof nested === "number") return String(nested);

  return null;
};

const syncCategoryImage = async (categoryId: string, form: CategoryForm) => {
  if (!form.imageUrl.trim()) {
    await categoryService.removeCategoryImage(categoryId);
    return;
  }

  if (!isDataUrl(form.imageUrl.trim())) {
    return;
  }

  const file = await dataUrlToFile(form.imageUrl.trim(), `category-${categoryId}`);
  await categoryService.uploadCategoryImage(categoryId, file);
};

export const categoryActions = {
  async list(): Promise<Category[]> {
    const categories = (await categoryService.listAdminCategories()) as Category[];
    return categories;
  },

  async create(form: CategoryForm) {
    const payload = await categoryService.createCategory(toCategoryPayload(form));
    const categoryId = readEntityId(payload);

    if (categoryId) {
      await syncCategoryImage(categoryId, form);
    }

    return payload;
  },

  async update(id: string, form: CategoryForm) {
    const payload = await categoryService.updateCategory(id, toCategoryPayload(form));
    await syncCategoryImage(id, form);
    return payload;
  },

  async remove(id: string) {
    return categoryService.deleteCategory(id);
  },
};
