import { categoryService } from "@/services/categories/category.service";
import { toCategoryPayload } from "./category-utils";
import type { Category, CategoryForm } from "./types";

export const categoryActions = {
  async list(): Promise<Category[]> {
    const categories = (await categoryService.listAdminCategories()) as Category[];
    return categories;
  },

  async create(form: CategoryForm) {
    return categoryService.createCategory(toCategoryPayload(form));
  },

  async update(id: string, form: CategoryForm) {
    return categoryService.updateCategory(id, toCategoryPayload(form));
  },

  async remove(id: string) {
    return categoryService.deleteCategory(id);
  },
};
