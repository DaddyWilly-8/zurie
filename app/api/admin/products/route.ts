import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/api-auth";
import { createProductState, listAdminProductsState } from "@/lib/local-data";

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
  imageUrl: z.string().url().optional(),
});

export async function GET() {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  return NextResponse.json({ products: listAdminProductsState() });
}

export async function POST(request: NextRequest) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = schema.parse(await request.json());
    const id = createProductState(payload);
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
