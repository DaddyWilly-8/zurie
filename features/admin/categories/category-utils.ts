import type { Category, CategoryForm } from "./types";

export const emptyCategoryForm: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  sortOrder: 1,
  visible: true,
};

export const toCategoryForm = (item: Category): CategoryForm => ({
  name: item.name ?? "",
  slug: item.slug ?? "",
  description: item.description ?? "",
  imageUrl: item.image_url ?? "",
  sortOrder: item.sort_order ?? 1,
  visible: item.is_visible ?? true,
});

export const toCategoryPayload = (form: CategoryForm) => ({
  name: form.name,
  slug: form.slug,
  description: form.description,
  visible: form.visible,
  sortOrder: form.sortOrder,
});
