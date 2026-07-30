import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/api-auth";
import { updateBrandContentState } from "@/lib/local-data";
import type { BrandContent } from "@/types/content";

const schema = z.object({
  key: z.string().min(2),
  payload: z.record(z.string(), z.unknown()),
});

export async function POST(request: NextRequest) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = schema.parse(await request.json());

    if (payload.key === "brand") {
      updateBrandContentState(payload.payload as Partial<BrandContent>);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
