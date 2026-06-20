# Purrlington

React frontend for the Purrlington hackathon challenge. This service is a Vite + React + TypeScript app scaffolded for the island resort UI.

## Stack

- React 19
- Vite
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Zustand
- TanStack Query
- React Router v7

## Local development

Install dependencies and start the dev server with pnpm:

```bash
pnpm install
pnpm dev
```

The app runs at:

```text
http://localhost:5173/
```

The frontend talks to the gateway, so the backend services need to be running too.

## Scripts

```bash
pnpm dev         # start the dev server (HMR)
pnpm build       # type-check and production build
pnpm preview     # serve the production build locally
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit
pnpm format      # prettier --write
```

Run `pnpm lint` and `pnpm typecheck` before submitting.

## Environment variables

Copy `.env.example` if you need local overrides:

```bash
cp .env.example .env
```

When running through Docker Compose, variables are set in `docker-compose.yml` under the `frontend` service (read from the root `.env`).

| Variable                       | Default                 | Description                                                                                                     |
| ------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `VITE_GATEWAY_URL`             | `http://localhost:8000` | Gateway base URL. All guest-facing API calls go through it                                                      |
| `VITE_MOCK`                    | `false`                 | When `true`, MSW mocks the beach and broadcast endpoints. Parrot, airport and hotel always hit the live gateway |
| `VITE_ADMIN_PASSCODE`          | _(empty)_               | Frontend-only prototype admin login passcode. Empty disables admin login                                        |
| `VITE_TRAFFIC_GENERATOR`       | `on`                    | Local visual traffic generator. Set to `off` to disable                                                         |
| `VITE_PARROT_CHAT_COOLDOWN_MS` | `30000`                 | Minimum ms between synthetic parrot chats from the traffic generator (caps LLM API-key spend)                   |
| `VITE_SIMULATION_START_TIME`   | `2026-06-09T09:00:00Z`  | Simulation clock start. Must match the backend values in the root `.env`                                        |
| `VITE_GAME_SPEED`              | `300`                   | Game-time multiplier over real time. Must match the backend                                                     |

## How it fits together

- **Gateway:** every guest-facing API call goes through `VITE_GATEWAY_URL`.
- **Roles:** guests pick an identity; admins sign in with `VITE_ADMIN_PASSCODE`
  (Observer mode), which unlocks every zone and the observability panels. This is
  a frontend-only prototype today and is expected to be enforced in the backend.
- **Real-time:** service events stream over SSE through the gateway, pulse the map
  zones, and populate the Lighthouse feed. A small status pill (top of the map)
  shows whether the live feed is connected, reconnecting, or offline.
- **Validation:** API and event payloads are validated with Zod.

## Project structure

```text
src/
  features/<domain>/   # airport, hotel, beach, parrot, broadcast, map, ...
    api/               # typed service-client wrappers
    components/        # UI
    hooks/             # data + behavior hooks
    types.ts           # Zod schemas + inferred types
  components/ui/        # shadcn primitives
  stores/              # Zustand stores (session, events)
  lib/                 # shared helpers (api-client, guest, simulation-time)
```

Conventions:

- Call services via `api.<service>` (`src/lib/api-client.ts`) and validate
  responses with the Zod schemas in each feature's `types.ts`.
- Server data via TanStack Query; client/session state via Zustand.

**Note:** UI components carry `data-testid` (and some `data-*` state) attributes used by automated tests. Please keep them in place when editing or refactoring components. Don't rename or remove them.
