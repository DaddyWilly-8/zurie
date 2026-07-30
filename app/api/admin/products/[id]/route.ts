import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/api-auth";
import { deleteProductState, updateProductState } from "@/lib/local-data";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  category: z.string().min(2),
  featured: z.boolean().default(false),
  bestSeller: z.boolean().default(false),
  newArrival: z.boolean().default(false),
  inStock: z.boolean().default(true),
  stockCount: z.number().int().nonnegative(),
  colors: z.array(z.object({ name: z.string(), hex: z.string() })),
  sizes: z.array(z.string()),
  specifications: z.array(z.string()),
  imageUrls: z.array(z.string().url()).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = schema.parse(await request.json());
    const { id } = await params;

    const ok = updateProductState(id, {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      price: payload.price,
      category: payload.category,
      featured: payload.featured,
      bestSeller: payload.bestSeller,
      newArrival: payload.newArrival,
      inStock: payload.inStock,
      stockCount: payload.stockCount,
      colors: payload.colors,
      sizes: payload.sizes,
      specifications: payload.specifications,
      imageUrls: payload.imageUrls,
    });

    if (!ok)
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  const ok = deleteProductState(id);
  if (!ok)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });

  return NextResponse.json({ success: true });
}
