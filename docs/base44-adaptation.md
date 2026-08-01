# Base44 Adaptation In This Repo

This project does not use the Base44 runtime or SDK, but we mirror its folder organization and admin coding patterns where it helps.

## Folder Arrangement Mapping

Base44 reference:
- `src/components/admin/*` for admin screens and shared admin controls.
- `src/components/ui/*` for reusable UI primitives.
- `src/lib/*` and `src/utils/*` for non-UI logic.
- `src/pages/*` for route-level composition.

Zurie mapping:
- [features/admin](../features/admin) for route-level admin feature clients.
- [components/admin](../components/admin) for shared admin building blocks.
- [services](../services) for API/mock adapters (instead of Base44 entities calls).
- [types](../types) for domain typing.
- [app/(admin)/admin](../app/(admin)/admin) for Next.js route entry points.

## Code Standards We Mirror

1. Keep CRUD screens in a predictable state model:
- `items`, `loading`, `open`, `editing`, `form`, `saving`.

2. Keep forms consistent with shared admin components:
- [components/admin/admin-field.tsx](../components/admin/admin-field.tsx)
- [components/admin/admin-image-uploader.tsx](../components/admin/admin-image-uploader.tsx)

3. Keep data access outside UI:
- Use `services/*` in UI clients.
- Never call backend or integration SDK directly from components.

4. Keep dialog-first admin UX:
- Create/edit actions open dialog forms.
- Save handlers return clear success/error messages.

5. Keep styling consistent:
- Warm neutral cards/tables (`#fbf8f3`, `#ebe2d5`, `#171512`).
- Uppercase micro-labels for admin fields.

## How It Is Used

- Admin pages import shared controls from [components/admin](../components/admin).
- Admin pages call domain services in [services](../services).
- Next.js pages under [app/(admin)/admin](../app/(admin)/admin) only compose shell + feature clients.
