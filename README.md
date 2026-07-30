# Zuriè Frontend (Next.js 15)

Production-oriented frontend for Zuriè women's handbags, built with Next.js App Router, TypeScript, Material UI, and Font Awesome.

This project is intentionally frontend-only and designed to integrate with a separate Laravel REST API.

## Stack
- Next.js 15 App Router
- TypeScript (strict)
- React
- Material UI
- Font Awesome
- Zustand (client state)

## Architecture Summary
- API-first service layer under `services/api/`
- Domain services under `services/*/`
- Isolated mock backend under `services/mock/`
- Feature modules under `features/`
- Thin route pages under `app/`

See documentation:
- `docs/architecture.md`
- `docs/api-integration.md`
- `docs/admin-dashboard.md`
- `docs/development-guide.md`

## Project Structure
```text
app/
  (public)/
  (auth)/admin/
  (admin)/admin/
components/
features/
hooks/
services/
  api/
  auth/
  products/
  categories/
  orders/
  enquiries/
  content/
  media/
  users/
  dashboard/
  activity/
  notifications/
  mock/
types/
utils/
constants/
providers/
docs/
```

## Environment Variables
Create `.env.local` from `.env.example`.

Required:
- `NEXT_PUBLIC_API_MODE=mock` or `laravel`
- `NEXT_PUBLIC_API_URL` for Laravel mode

Optional:
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_DEMO_ADMIN_EMAIL`
- `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD`
- `NEXT_PUBLIC_GA_ID`

## Running Locally
1. `npm install`
2. `cp .env.example .env.local`
3. `npm run dev`
4. Open `http://localhost:3000`

## Mock API Mode
Set:
- `NEXT_PUBLIC_API_MODE=mock`

In this mode, UI talks to in-memory mock adapter in `services/mock/mock-backend.ts`.

## Laravel API Mode
Set:
- `NEXT_PUBLIC_API_MODE=laravel`
- `NEXT_PUBLIC_API_URL=https://your-laravel-domain/api`

In this mode, services call Laravel endpoints through `services/api/client.ts`.

## Authentication Architecture
Authentication is abstracted in `services/auth/auth.service.ts`.

- Mock mode: local demo session for development
- Laravel mode: cookie-based API calls with `credentials: include`

This supports future Laravel Sanctum/HTTP-only cookie flow.

## Admin Dashboard Modules
- `/admin`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/enquiries`
- `/admin/homepage`
- `/admin/content`
- `/admin/media`
- `/admin/settings`
- `/admin/users`
- `/admin/activity`

## Adding a New API Service
1. Add endpoint in `services/api/endpoints.ts`
2. Add module service in `services/<module>/`
3. Add mock implementation in `services/mock/mock-backend.ts`
4. Use service in feature component/hook

## Adding a New Feature
1. Build feature UI in `features/<module>/`
2. Keep page route in `app/` minimal
3. Add or extend domain service
4. Reuse shared types in `types/`

## Adding a New Admin Module
1. Create page route under `app/(admin)/admin/`
2. Create feature client under `features/admin/`
3. Add service functions
4. Add nav link in `components/admin/admin-shell.tsx`

## Build and Quality Checks
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Deployment
Deploy frontend (for example on Vercel) and point `NEXT_PUBLIC_API_URL` to Laravel API host.

## Security Notes
- Do not place secrets in `NEXT_PUBLIC_*`
- Frontend authorization is UX-only
- Laravel backend must enforce auth, permissions, and data validation
