export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  visible?: boolean;
  is_visible?: boolean;
  sortOrder?: number;
  sort_order?: number;
};

export type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  sortOrder: number;
  visible: boolean;
};
