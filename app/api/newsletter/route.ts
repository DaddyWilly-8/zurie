import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertRateLimit } from "@/lib/rate-limit";
import { upsertNewsletterState } from "@/lib/local-data";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    assertRateLimit(`newsletter:${ip}`, 12, 60_000);
    const payload = schema.parse(await request.json());

    upsertNewsletterState(payload.email);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
