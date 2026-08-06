import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().min(1, "Slug is required"),
  description: z.string(),
  shortDescription: z.string().max(500, "Short description cannot exceed 500 characters"),
  price: z
    .number()
    .nullable()
    .refine((value) => value !== null, "Price is required")
    .refine((value) => value === null || value >= 0, "Price cannot be negative"),
  buyingPrice: z
    .number()
    .nullable()
    .refine((value) => value !== null, "Buying price is required")
    .refine((value) => value === null || value >= 0, "Buying price cannot be negative"),
  compareAt: z
    .number()
    .nullable()
    .refine((value) => value === null || value >= 0, "Compare at cannot be negative"),
  sku: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  material: z.string(),
  dimensions: z.string(),
  hardware: z.string(),
  lining: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
  featuredImageUrl: z.string(),
  categoryId: z.preprocess(
    (value) => (value == null ? "" : String(value)),
    z.string().trim().min(1, "Category is required"),
  ),
  category: z.string(),
  featured: z.boolean(),
  bestSeller: z.boolean(),
  newArrival: z.boolean(),
  inStock: z.boolean(),
  stockCount: z.number().min(0, "Stock quantity cannot be negative"),
  imageUrlsText: z.string(),
  existingImageIds: z.array(z.string()),
  removedImageIds: z.array(z.string()),
  colorsText: z.string(),
  sizesText: z.string(),
}).refine(
  (values) => values.compareAt === null || values.price === null || values.compareAt <= values.price,
  {
    message: "Sale price cannot be greater than price",
    path: ["compareAt"],
  },
);
