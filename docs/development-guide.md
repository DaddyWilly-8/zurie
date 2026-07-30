# Development Guide

## Install
1. `npm install`
2. Copy env file: `cp .env.example .env.local`
3. Start: `npm run dev`

## Recommended Local Mode
Use mock mode during frontend development:
- `NEXT_PUBLIC_API_MODE=mock`
- optional demo login credentials:
  - `NEXT_PUBLIC_DEMO_ADMIN_EMAIL`
  - `NEXT_PUBLIC_DEMO_ADMIN_PASSWORD`

## Build and Quality Checks
- `npm run typecheck`
- `npm run lint`
- `npm run build`

## Add a New API Service
1. Add endpoint path in `services/api/endpoints.ts`
2. Add service module in `services/<domain>/`
3. Implement mock behavior in `services/mock/mock-backend.ts`
4. Consume service from feature component/hook

## Add a New Feature Module
1. Create UI in `features/<module>/`
2. Keep page file thin in `app/`
3. Add service functions for all data operations
4. Reuse shared types in `types/domain.ts` or `types/*.ts`

## Add a New Admin Module
1. Add route under `app/(admin)/admin/<module>/page.tsx`
2. Add navigation entry in `components/admin/admin-shell.tsx`
3. Add feature client in `features/admin/`
4. Add service adapter for API + mock mode

## Mock-to-Laravel Switch Checklist
1. Set `NEXT_PUBLIC_API_MODE=laravel`
2. Set `NEXT_PUBLIC_API_URL`
3. Verify endpoint payload shapes
4. Verify auth cookie and CSRF flow
5. Validate error handling for non-2xx responses

## Security Notes
- Never store private keys in `NEXT_PUBLIC_*`
- Frontend checks are UX-only, not authority
- Backend must enforce validation, auth, and permissions
