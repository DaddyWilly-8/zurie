import { NextResponse } from "next/server";

// Uptime-monitoring / load-balancer probe target. Proves only that this
// Next.js process has booted and can serve a request — it deliberately
// does not call the backend (a slow/down backend shouldn't make the
// frontend's own health probe fail, since the frontend still has useful
// static content to serve either way).
export function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
