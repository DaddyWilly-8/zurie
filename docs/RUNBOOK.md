# Zuriè Frontend — Operations Runbook

Practical steps for deploying, rolling back, reading logs, and error
monitoring. See [`../CLAUDE.md`](../CLAUDE.md) for how the app is built;
this document is only about running it.

## Deploy

```bash
./deploy.sh
```

One command, safe to re-run. It activates the pinned Node version (via nvm
and `.nvmrc`), pulls `origin/main`, installs dependencies (including dev —
the build needs TypeScript/Tailwind/etc even in production), does a clean
build, and only then signals cPanel's Passenger app manager to restart by
touching `tmp/restart.txt`.

**If the build fails, the script exits non-zero and `tmp/restart.txt` is
never touched** — Passenger keeps serving the last successful build
indefinitely, so a broken build can never take the live site down. Fix the
build locally, push, and re-run `./deploy.sh`; nothing about the failed
attempt needs cleanup.

If nvm isn't installed on the server, the script falls back to whatever
`node` is already on PATH and warns about the version mismatch risk instead
of failing outright — pin the correct Node version at the OS/hosting level
in that case (this repo targets the version in `.nvmrc`).

### If a deploy step fails

| Step failed         | What happened                                                          | What to do                                                                                                                                         |
| ------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git fetch`/`reset` | Network or auth issue reaching GitHub                                  | Check connectivity/deploy key, re-run `./deploy.sh`                                                                                                |
| `npm install`       | A dependency failed to resolve/install                                 | Re-run; if it persists, check `package-lock.json` was committed and matches `package.json`                                                         |
| `npm run build`     | A type error, lint-as-error, or runtime error during static generation | Read the build output — Next.js names the exact file/line. **The live site is untouched** (see above), so there's no time pressure; fix and re-run |

### Roll back

Same script, pointed at an older commit — there's no separate rollback path:

```bash
git fetch origin
git reset --hard <previous-good-commit-or-tag>
./deploy.sh
```

Because the failed-build case above never restarts the app, the only time
you need a rollback is when a _build that succeeded_ still shipped a bug at
runtime — in that case just deploy the previous commit the normal way.

## Health check

```
GET /api/health
```

Returns `{ status: "ok", timestamp }` with a 200 once this Next.js process
has booted and can serve requests. Point uptime monitoring at this.
Deliberately does **not** call the backend — a slow/down backend shouldn't
fail the frontend's own health probe, since static content and cached pages
are still servable either way. (See the backend's own `GET /up` for its
health check.)

## Error monitoring (Sentry)

`@sentry/nextjs` is wired into `instrumentation.ts` (server/edge init +
`onRequestError`), `instrumentation-client.ts` (browser init), and both
error boundaries (`app/error.tsx`, `app/global-error.tsx`). All of it is a
safe no-op with no DSN configured — every environment, local included, can
leave it wired without side effects.

**To activate it:**

1. Create a Sentry project (Next.js platform) and copy its DSN — reuse the
   same Sentry organization as the backend if you want both repos' errors
   in one place, as two separate projects.
2. Set in the server's environment (`.env.local` for local dev; the
   hosting platform's environment variables in production — never commit
   these):
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>
   SENTRY_DSN=https://<key>@<org>.ingest.sentry.io/<project>
   NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
   SENTRY_ENVIRONMENT=production
   ```
   (`NEXT_PUBLIC_*` is exposed to the browser bundle for client-side error
   capture; the non-prefixed pair stays server-only for Server
   Components/Actions and middleware. They're normally the same DSN.)
3. Redeploy (`./deploy.sh`) so the new env vars are picked up at build/boot
   time.
4. Prove it's working — trigger a real client-side error and confirm it
   reaches Sentry:
   - Easiest: temporarily add a button anywhere that does
     `onClick={() => { throw new Error("Sentry test"); }}`, click it, then
     remove the button. `app/error.tsx`'s `Sentry.captureException(error)`
     call reports it.
   - Or from a Server Component/Action, temporarily `throw new Error(...)`
     — `instrumentation.ts`'s `onRequestError` reports it.
   - Check the Sentry project's Issues tab — the event should appear
     within seconds.

Note: this setup captures and reports errors but does **not** upload
source maps (that needs a `SENTRY_AUTH_TOKEN` and wrapping `next.config.ts`
with `withSentryConfig`, which requires provisioning a Sentry auth token
first) — stack traces in Sentry will point at minified production code
until that's added. Fine to add later; not required for error capture to
work.

## Logs

`npm run start` logs to stdout/stderr — on cPanel's Node.js Application
Manager, this is the "Errors" / application log visible in that UI, or
whatever the process manager redirects stdout to (check the app's log path
in cPanel → Setup Node.js App). There's no separate application log file
written by this repo the way the backend writes `storage/logs/laravel.log`
— Sentry (once configured above) is the durable record of anything that
went wrong; stdout/stderr is only as long-lived as the process manager
keeps it.
