# 🐾 Purrlington Island — FAF Summer Hackathon 2026

A whiskered little resort island, simulated end to end. Guests fly in, clear passport control,
check into a hotel, book a spot on the beach, and chat with a parrot assistant — all running across
a handful of independent services behind a single gateway, with a React web app on top.

## Overview

Purrlington Island is built from a handful of independent services that together simulate a resort.
Each part of the resort — passport control, the hotel, the beach, the assistant — is its own service,
written in its own stack, and they all sit behind one API gateway. The frontend talks only to the
gateway; the gateway routes to the services; the services emit live events that stream back to the UI
in real time. An LLM-powered "parrot" acts as an in-world assistant that can read live resort state to
answer questions.

## The world

You arrive as one of the island's guests — each with a passport type (EU / non-EU), a priority lane,
and the occasional accessibility need. The journey runs **airport → hotel → beach**: land and clear
passport control at the airport, check into a room at the hotel, then book a capacity-limited beach
activity. Along the way you can ask the **parrot** assistant about queues, rooms, and your own
itinerary, and watch island-wide announcements roll in from the **lighthouse** feed. Time runs on an
accelerated game clock, so a full day on the island plays out in minutes.

## Architecture

```
                ┌──────────────┐
                │   Frontend   │  React web app
                └──────┬───────┘
                       │  /api/<service>/*        ◀── SSE event stream ──┐
                ┌──────▼───────┐                                         │
                │   Gateway    │  Go reverse proxy                       │
                └──┬──┬──┬──┬──┴──┐                                      │
                   │  │  │  │     │                                      │
        ┌──────────┘  │  │  │     └──────────┐                          │
        ▼             ▼  ▼  ▼                ▼                          │
    ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────────────┐    │
    │ Airport│  │  Hotel │  │  Beach │  │ Parrot │  │  Broadcast   │────┘
    └───┬────┘  └───┬────┘  └────────┘  └───┬────┘  └──────▲───────┘
        │           │                       │              │
        │           │   parrot reads live   │              │
        │           └───────────────────────┘   services post domain
        └────────────── airport/hotel ─────────►   events to broadcast
```

The frontend reaches every service through the gateway's `/api/<service>/*` routes. Services publish
domain events (arrivals, reservations, activity capacity) to the broadcast hub, which streams them to
the UI over Server-Sent Events. The parrot calls the airport and hotel services directly to fetch live
data for its answers.

## Services at a glance

| Component | Stack | Port | What it does |
|-----------|-------|------|--------------|
| [Frontend](frontend/README.md) | React 19 + TypeScript + Vite | 5173 | Web app: guest selection, interactive island map, admin view, live event feed |
| [Gateway](gateway/README.md) | Go 1.22 + chi v5 | 8000 | Single entry point — routes `/api/*` to services, with health checks, CORS, optional caching, rate-limiting, and round-robin pools |
| [Airport](services/airport/README.md) | Python 3.12 + Flask + SQLite | 3001 | Passport-control simulation — gate queues by passport type, priority lanes, wait-time stats |
| [Hotel](services/hotel/README.md) | NestJS + TypeScript + PostgreSQL (Prisma) | 3000 | Room inventory and reservations, tracked against the simulation calendar |
| [Beach](services/beach/README.md) | Kotlin + Ktor + PostgreSQL (Exposed) | 8080 | Capacity-limited activity bookings for checked-in guests |
| [Parrot](services/parrot/README.md) | Python 3.12 + FastAPI + OpenAI-compatible LLM | 3003 | AI assistant — answers guest questions using tool-calls against live resort data |
| [Broadcast](services/broadcast/README.MD) | Node.js + Express (SSE) | 3002 | Real-time event hub — fans island events out to the UI |

## Repository layout

```
.
├── frontend/            React web app
├── gateway/             Go API gateway / reverse proxy
└── services/
    ├── airport/         Flask passport-control service
    ├── hotel/           NestJS reservation service
    ├── beach/           Ktor activity-booking service
    ├── parrot/          FastAPI LLM assistant
    └── broadcast/       Express SSE event hub
```

## Simulation model

The island shares one accelerated clock across all services, configured via environment variables
(see [`.env.example`](.env.example)):

- `SIMULATION_START_TIME=2026-06-20T00:00:00Z` — when in-game time begins.
- `GAME_SPEED=300` — game time runs 300× real time (1 real second ≈ 5 in-game minutes).

## License

[MIT](LICENSE) © 2026 Sigmoid.
