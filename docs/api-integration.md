# API Integration Guide

For full backend implementation requirements (admin + storefront + dynamic content contract), see `docs/backend-handoff-guide.md`.

## Environment Variables
- `NEXT_PUBLIC_API_URL`: Laravel API base URL, example `https://api.example.com/api`
- `NEXT_PUBLIC_API_MODE`: `mock` or `laravel`

## API Client
Shared client is implemented in `services/api/client.ts`.

Capabilities:
- centralized base URL handling
- query parameter support
- timeout handling
- JSON parsing with clear error propagation
- `credentials: include` for cookie-based auth

## Endpoint Contracts
All endpoint paths are centralized in `services/api/endpoints.ts`.

Do not hardcode endpoint strings in components.

## Service Pattern
Each module has a service:
- `services/products/product.service.ts`
- `services/categories/category.service.ts`
- `services/orders/order.service.ts`
- `services/enquiries/enquiry.service.ts`
- `services/content/content.service.ts`
- `services/auth/auth.service.ts`

Services decide runtime adapter:
- mock adapter in `services/mock/mock-backend.ts`
- real HTTP calls via `apiClient`

## Expected Laravel Endpoint Examples
- `GET /products`
- `GET /products/{slug}`
- `POST /products`
- `PUT /products/{id}`
- `DELETE /products/{id}`
- `GET /categories`
- `POST /categories`
- `PUT /categories/{id}`
- `DELETE /categories/{id}`
- `GET /orders`
- `PUT /orders/{id}`
- `GET /settings`
- `PUT /settings`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/user`

## CSRF/Sanctum Readiness
When backend is ready:
- call Sanctum CSRF endpoint before auth POSTs
- keep `credentials: include`
- preserve cookie/session behavior in browser

## Error/Loading Pattern
For API-driven screens:
- load on mount
- show loading feedback
- show empty states when collections are empty
- show retry/error feedback for request failures
