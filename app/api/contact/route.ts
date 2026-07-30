import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertRateLimit } from "@/lib/rate-limit";
import { addEnquiryState } from "@/lib/local-data";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  message: z.string().min(10).max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    assertRateLimit(`contact:${ip}`, 8, 60_000);
    const payload = schema.parse(await request.json());

    addEnquiryState({
      name: payload.name,
      email: payload.email,
      message: payload.message,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
