# Architecture

## Goal
Zuriè is a frontend-only Next.js 15 application prepared for integration with a separate Laravel backend.

## Principles
- API-first: UI never hardcodes API URLs or endpoint logic.
- Separation of concerns: pages, features, services, and shared types remain independent.
- Mock-first development: frontend runs without backend by using an isolated mock adapter.
- Backend replaceability: switching to Laravel requires environment change, not component rewrites.

## High-Level Flow
- UI Components
- Feature components/hooks
- Domain services
- API client
- Laravel API (or mock adapter in development)

## Runtime Modes
- mock mode: `NEXT_PUBLIC_API_MODE=mock`
- laravel mode: `NEXT_PUBLIC_API_MODE=laravel`

Mode switching is implemented in `services/api/runtime.ts`.

## Core Folders
- `app/`: route composition only
- `components/`: reusable UI building blocks
- `features/`: feature-level UI and state orchestration
- `services/api/`: API client, config, endpoint contracts
- `services/*/`: domain services by module
- `services/mock/`: in-memory mock backend implementation
- `types/`: shared domain and DTO contracts
- `docs/`: implementation and integration documentation

## Auth Strategy
Authentication is abstracted in `services/auth/auth.service.ts`.

Current behavior:
- mock mode: local session storage for admin workflows
- laravel mode: request Laravel auth endpoints with `credentials: include`

Future backend auth compatibility:
- Laravel Sanctum cookies
- CSRF handshake (to be connected when backend is ready)
- role-aware UI rendering via authenticated user object

## Data Safety Notes
Frontend role checks only guide UI behavior. Final authorization and validation must be enforced by Laravel backend policies.
