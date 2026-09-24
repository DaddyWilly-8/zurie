import * as Sentry from "@sentry/nextjs";

// Runs once in the browser before the app renders. A no-op with no DSN
// configured (SDK skips initialization), so this is safe to ship in every
// environment, local included — same convention as the backend's Sentry
// wiring in bootstrap/app.php.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment:
    process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  // Keep this low in production — traces are for performance monitoring,
  // not required for error capture, and sampling every request adds
  // overhead for no benefit at this traffic level.
  tracesSampleRate: 0.1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
