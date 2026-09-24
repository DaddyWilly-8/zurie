import * as Sentry from "@sentry/nextjs";

// Edge runtime (middleware.ts). Same DSN/no-op behaviour as the other two
// runtime configs — see instrumentation-client.ts.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
