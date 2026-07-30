# Services Layer

## Purpose
All data communication must go through this folder.

## Pattern
Component -> Feature Hook/Client -> Service -> API Client -> Laravel API or Mock Adapter

## Runtime Adapter
- `services/api/runtime.ts` controls whether mode is `mock` or `laravel`.

## Do Not
- Do not call `fetch()` directly from UI components for domain operations.
- Do not hardcode API URLs inside features/components.
