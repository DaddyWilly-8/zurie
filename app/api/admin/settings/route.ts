import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertAdmin } from "@/lib/api-auth";
import { updateContactInfoState } from "@/lib/local-data";
import type { ContactInfo } from "@/types/content";

const schema = z.object({
  key: z.string().min(2),
  value: z.record(z.string(), z.unknown()),
});

export async function POST(request: NextRequest) {
  const unauthorized = await assertAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = schema.parse(await request.json());

    if (payload.key === "contact") {
      updateContactInfoState(payload.value as Partial<ContactInfo>);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
}
