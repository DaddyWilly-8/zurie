import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/api-auth";
import { createCategoryState, listCategoriesState } from "@/lib/local-data";

const schema = z.object({ name: z.string().min(2), slug: z.string().min(2) });

export async function GET() {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  return NextResponse.json({ categories: listCategoriesState() });
}

export async function POST(request: NextRequest) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = schema.parse(await request.json());
    const ok = createCategoryState(payload);
    if (!ok)
      return NextResponse.json({ error: "Create failed" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
