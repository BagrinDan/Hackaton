# Gateway

Reverse-proxy API gateway that routes frontend and external requests to island backend services.

## Stack

- Go 1.22
- [chi](https://github.com/go-chi/chi) v5 router
- `net/http/httputil` reverse proxy

## Prerequisites

- Docker + Docker Compose
- Go 1.22 (only for local development outside Docker)

## Running locally

From the repo root:

```bash
docker compose up --build
```

The gateway starts on `http://localhost:8000`.

Health check:

```bash
curl http://localhost:8000/health
```

## Environment variables

When running through Docker Compose, variables are set in `docker-compose.yml` under the `gateway` service.

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8000` | Port the gateway listens on |
| `AIRPORT_SERVICE_URL` | `http://localhost:3001` | Airport service base URL |
| `HOTEL_SERVICE_URL` | `http://localhost:3000` | Hotel service base URL |
| `BEACH_SERVICE_URL` | _(empty)_ | Beach service base URL (not registered when empty) |
| `BROADCAST_SERVICE_URL` | _(empty)_ | Broadcast service base URL (not registered when empty) |
| `PARROT_SERVICE_URL` | _(empty)_ | Parrot service base URL (not registered when empty) |
| `CORS_ALLOWED_ORIGINS` | _(empty)_ | Comma-separated list of allowed CORS origins. Docker Compose defaults to `http://localhost:5173` |
| `INTERNAL_SECRET` | _(empty)_ | Shared secret for service-to-service calls via `X-Internal-Key` header |
| `GATEWAY_CACHE_TTL` | _(empty / off)_ | Response cache TTL (Go duration, e.g. `5s`). Empty or `0` disables caching |
| `GATEWAY_RATE_LIMIT` | _(empty / off)_ | Max requests per window per client. Empty or `0` disables rate limiting |
| `GATEWAY_RATE_WINDOW` | `1m` | Rate-limit window (Go duration). Used only when `GATEWAY_RATE_LIMIT` > 0 |

Services with an empty URL are not registered — their `/api/<service>/*` routes will return 404.

A `*_SERVICE_URL` may also list several comma-separated instances; the gateway load-balances across them (see **Service pools** below).

## Routing

All backend services are exposed under `/api/<service>/*`. The gateway strips the prefix before forwarding:

```
GET /api/airport/arrivals  →  GET http://airport:3001/arrivals
POST /api/hotel/reservation →  POST http://hotel:3000/reservation
```

| Prefix | Backend |
| --- | --- |
| `/api/airport/*` | Airport service |
| `/api/hotel/*` | Hotel service |
| `/api/beach/*` | Beach service |
| `/api/broadcast/*` | Broadcast service |
| `/api/parrot/*` | Parrot service |

Query parameters are preserved as-is.

### Service pools (load balancing)

A `*_SERVICE_URL` may be a comma-separated list of instances:

```
PARROT_SERVICE_URL=http://parrot-a:3003,http://parrot-b:3003
```

When a service has more than one URL, the gateway distributes requests across the instances round-robin; a single URL behaves exactly as before. Use this to run multiple instances of a backend for higher throughput.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | Aggregated health check across all configured backends |
| PUT | `/admin/rate-limit` | Update the rate limiter at runtime (admin only) |
| * | `/api/airport/*` | Proxied to airport service |
| * | `/api/hotel/*` | Proxied to hotel service |
| * | `/api/beach/*` | Proxied to beach service (when configured) |
| * | `/api/broadcast/*` | Proxied to broadcast service (when configured) |
| * | `/api/parrot/*` | Proxied to parrot service (when configured) |

## Health check

`GET /health` checks all configured backend services concurrently by calling each service's `/health` endpoint (3-second timeout per service).

Response:

```json
{
  "status": "healthy",
  "services": {
    "airport": { "status": "healthy", "latency": "12ms" },
    "hotel": { "status": "healthy", "latency": "8ms" }
  }
}
```

Overall status is `"healthy"` when all backends are healthy, `"degraded"` when any backend is unreachable or returns a non-200 response. Only configured services appear in the response.

## Middleware

Applied globally in this order:

1. **RequestID** — assigns a unique request ID (`X-Request-Id` header)
2. **RealIP** — extracts the client's real IP from proxy headers
3. **RequestLogger** — logs `METHOD PATH STATUS DURATION REMOTE_ADDR` for every request
4. **Recoverer** — catches panics and returns 500 instead of crashing
5. **CORS** — validates `Origin` against `CORS_ALLOWED_ORIGINS`; responds to `OPTIONS` preflight with `204`
6. **RateLimit** — optional per-client rate limiting; a no-op unless `GATEWAY_RATE_LIMIT` is set (see **Rate limiting** below)

### Auth placeholder

`auth.go` defines an `AuthMiddleware` that is **not currently mounted** on the router. It passes all requests through but recognizes the `X-Internal-Key` header for service-to-service calls. Teams can enable and extend it as needed.

## Rate limiting

Optional, off by default. Set `GATEWAY_RATE_LIMIT` to the maximum number of requests allowed per `GATEWAY_RATE_WINDOW` (default `1m`) per client. Requests beyond the limit receive `429 Too Many Requests` with a `Retry-After` header. When `GATEWAY_RATE_LIMIT` is unset or `0`, the limiter is a pass-through.

The limit and window can be adjusted at runtime (admin only) via `PUT /admin/rate-limit` with a JSON body, e.g. `{ "limit": 600, "window": "1m" }`.

## Response cache

Optional, off by default. Set `GATEWAY_CACHE_TTL` (a Go duration, e.g. `5s`) to cache safe responses — `GET`/`HEAD` requests that return `200` and are not streaming — for that duration. Streaming responses (`text/event-stream`) and non-`200` responses are never cached. When `GATEWAY_CACHE_TTL` is unset or `0`, caching is disabled.

Responses served from the cache carry an `X-Cache: HIT` header.

## Graceful shutdown

The gateway listens for `SIGINT` and `SIGTERM` signals. On shutdown it stops accepting new connections and gives in-flight requests up to 10 seconds to complete before exiting.

## SSE passthrough

The reverse proxy uses `FlushInterval: -1` so Server-Sent Events from the broadcast service are flushed immediately to the client rather than buffered.

## Proxy errors

When a backend is unreachable the gateway returns a `502 Bad Gateway` with:

```json
{"error": "Service unavailable"}
```
