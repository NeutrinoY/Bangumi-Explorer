# Architecture · 2026-07

This document records the current architecture after the July 2026 rebuild. It focuses on decisions that affect future maintenance.

## Application boundary

Bangumi Explorer is a static-first Next.js app with a single interactive explorer island.

- `src/app/page.tsx` is the only Server Component with product logic. It reads `public/data/index.json` at build time and renders the first page of the default ranking view.
- `src/features/explorer/explorer-app.tsx` owns the client-side browsing surface after hydration.
- Filtering, sorting, search, pagination, detail loading, collection state, and admin actions run on the client.
- The app stays single-route. Explorer state is encoded in query parameters.

This keeps the first paint visible without moving the core browsing loop to the server.

## Feature layout

The source tree follows a feature-first shape:

- `src/features/explorer`: filtering, sorting, pagination, detail modal, URL state
- `src/features/collection`: collection status model and Supabase sync
- `src/features/auth`: admin login
- `src/shared/data`: data loading, Supabase client, shared subject types
- `src/shared/ui`: small reusable UI hooks and primitives

Each feature keeps pure domain logic separate from hooks and components. For example, `explorer/domain` contains reducer actions, query logic, presets, state defaults, and URL encoding.

## Data artifacts

The ETL outputs static JSON into `public/data`.

- `index.json`: browse index with fields needed for cards, search, filters, sorting, and staff search
- `details-0.json` through `details-7.json`: detail buckets keyed by subject id

The browser loads `index.json` first. Detail buckets load on demand and are also prefetched after the index is ready. Loader functions cache promises so concurrent requests share the same fetch.

The old `public/db.json` file is intentionally removed. The app no longer reads a monolithic database file.

## ETL contract

The TypeScript ETL lives in `etl/` and runs with `tsx`.

- `etl/schemas.ts` validates upstream Bangumi subject data with zod
- `etl/transform.ts` maps upstream rows into app-facing subject records
- `etl/merge.ts` writes `index.json` and detail buckets
- `src/shared/data/subject.ts` defines the shared output types

The ETL aborts if more than 1% of upstream files fail validation. Duplicate subject ids are deduplicated during merge.

## Explorer state

Explorer state uses one reducer in `src/features/explorer/domain/actions.ts`.

The reducer owns cross-field rules:

- Any filter or sort change resets pagination to page 1
- A season is only valid when the year range pins one year
- The type filter cannot become empty
- Presets compose with the episode filter instead of overwriting it

URL state is a projection of reducer state. The first render uses `DEFAULT_STATE` so the server output and hydration match. After mount, `useExplorer` reads `window.location.search` and dispatches a `hydrate` action.

URL writes use debounced `history.replaceState` instead of router navigation. This avoids unnecessary React Server Component work while preserving shareable links.

## Collection and auth

Supabase stores collection state in `user_collections`.

- Public visitors read the configured owner collection via `NEXT_PUBLIC_ADMIN_UID`
- Admin writes require a Supabase auth session for that same user id
- The login modal asks only for a password; the email comes from `NEXT_PUBLIC_ADMIN_EMAIL`
- Updates are optimistic and roll back with a toast on sync failure
- Realtime events update the local collection map without refetching the full table

Row Level Security remains the real write boundary. Client checks only improve UI behavior.

## Interaction principles

The UI favors stable, low-cost motion:

- Card images fade in after load
- Detail modals use opacity and small scale changes, not shared-element poster morphs
- Filter sheets use transform-based motion
- `prefers-reduced-motion` compresses animation duration globally

The app avoids virtualization because pagination limits rendering to 60 cards per page.

## Deferred decisions

- Add shareable detail URLs such as `/subject/326` or `?detail=326`
- Generate Supabase database types instead of maintaining `CollectionRow` by hand
- Split `index.json` further if the browse index grows enough to affect first-load cost
- Add virtualization only if pagination is removed
