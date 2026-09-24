import * as Sentry from "@sentry/nextjs";

// Node.js runtime (API routes, Server Components, Server Actions). A no-op
// with no DSN configured — see instrumentation-client.ts for why that's
// deliberate.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
