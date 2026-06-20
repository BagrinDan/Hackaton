# Hotel Service

Manages private room inventory and guest reservations for the island resort.

## Stack

- NestJS + TypeScript
- PostgreSQL 18
- Prisma 7 (CJS mode, `@prisma/adapter-pg`)

## Prerequisites

- Docker + Docker Compose
- Node 24
- pnpm

## Running locally

From the repo root:

```bash
docker compose up --build
```

The service starts on `http://localhost:3000`. On first boot the entrypoint automatically runs migrations and seeds the room inventory: 10 STANDARD, 6 DELUXE, and 4 SUITE rooms.

Health check:

```bash
curl http://localhost:3000/health
```

## Environment variables

When running through Docker Compose, environment overrides are read from the **repo-root** `.env` file, next to `docker-compose.yml`.

```bash
cp .env.example .env
```

The `services/hotel/.env.example` file is only for running the Nest service directly from `services/hotel/` outside Docker.

| Variable                | Default                 | Description                                                                                   |
| ----------------------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | —                       | PostgreSQL connection string                                                                  |
| `SIMULATION_START_TIME` | `2026-06-14T09:00:00Z`  | ISO timestamp when in-game time starts                                                        |
| `GAME_SPEED`            | `300`                   | In-game seconds advanced per real-world second. `300` means 1 real second = 5 in-game minutes |
| `AIRPORT_SERVICE_URL`   | `http://localhost:3001` | Future airport service base URL for pre-booking guest processing checks                       |
| `BROADCAST_SERVICE_URL` | `http://localhost:3002` | Future broadcast/notification service base URL for hotel domain events                        |

For local testing, set `SIMULATION_START_TIME` near the current time so recent bookings show up in `GET /rooms`.

## Inventory and reservations

Rooms are fixed inventory seeded on startup:

| Type     | Count | Capacity | Price/night |
| -------- | ----- | -------- | ----------- |
| STANDARD | 10    | 2        | 100         |
| DELUXE   | 6     | 3        | 200         |
| SUITE    | 4     | 4        | 400         |

Reservations assign one private room to a guest party for a simulated date range. `GET /rooms` returns each room with its current occupancy count.

## Endpoints

| Method | Path                              | Description                        |
| ------ | --------------------------------- | ---------------------------------- |
| GET    | `/health`                         | Health check                       |
| POST   | `/reservation`                    | Book a room                        |
| GET    | `/reservation/:id`                | Get reservation by reservation ID  |
| DELETE | `/reservation/:id`                | Cancel a reservation               |
| GET    | `/reservation/by-guest/:guest_id` | Get active reservation for a guest |
| GET    | `/rooms`                          | All rooms with current occupancy   |

`check_in_day` / `check_out_day` are integer **simulation-day** offsets from `SIMULATION_START_TIME` (day `0` = start), not calendar dates.

## API examples

Create a reservation:

```bash
curl -X POST http://localhost:3000/reservation \
  -H 'content-type: application/json' \
  -d '{
    "guest_id": "guest-kiki-0001",
    "room_type": "SUITE",
    "guest_count": 2,
    "check_in_day": 1,
    "check_out_day": 4
  }'
```

Reservation responses include:

```json
{
  "id": "a1b2c3d4-...",
  "guest_id": "guest-kiki-0001",
  "room_id": "room-suite-01",
  "room_type": "SUITE",
  "guest_count": 2,
  "check_in_day": 1,
  "check_out_day": 4,
  "status": "CONFIRMED"
}
```

Cancel responses include:

```json
{
  "id": "a1b2c3d4-...",
  "status": "CANCELLED"
}
```

Room responses include:

```json
{
  "rooms": [
    {
      "id": "room-standard-01",
      "type": "STANDARD",
      "capacity": 2,
      "price_per_night": 100,
      "current_guests": 1
    }
  ]
}
```

Errors use standard HTTP status codes and return a JSON body of the shape `{ "error": "message" }`.

## Database

Migrations live in `prisma/migrations/` and are applied automatically on startup via `prisma migrate deploy`.

To create a new migration during development with the DB running:

```bash
pnpm exec prisma migrate dev --name <name>
```

To reset the database:

```bash
pnpm run db:reset
```
