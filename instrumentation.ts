// Next.js's server-startup hook — runs once when the server process boots,
// before any request is handled, in both the Node.js and Edge runtimes.
// Loads the runtime-appropriate Sentry config (each file is itself a no-op
// with no DSN set).
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (...args: unknown[]) => {
  const Sentry = await import("@sentry/nextjs");
  // @ts-expect-error — Sentry's captureRequestError signature matches
  // Next's onRequestError hook exactly; Next doesn't publicly export the
  // hook's type from the "next" package to type-check against here.
  await Sentry.captureRequestError(...args);
};
