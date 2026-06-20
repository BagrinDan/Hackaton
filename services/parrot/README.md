# Parrot Service

AI chat assistant for the island resort. Accepts natural language questions and answers using an LLM with resort context documents and live data from the airport and hotel services via tool calling.

## Architecture

```
Client ──POST /chat──▶ FastAPI
                          │
                   load history (if guest_id)
                          │
                          ▼
                   ┌─────────────┐
                   │  LLM / chat │◀── system prompt + context docs
                   └──────┬──────┘
                          │
              ┌───────────┴───────────┐
              │  tool-calling loop    │  (max 5 rounds)
              │                       │
              │  LLM requests tool ──▶│──▶ Airport Service (HTTP)
              │                       │──▶ Hotel Service   (HTTP)
              │  ◀── tool result ─────│
              └───────────┬───────────┘
                          │
                   save history
                          │
                          ▼
              ChatResponse { reply }
```

If the LLM resolves the question without tools (e.g. general resort info from context docs), the tool-calling loop is skipped entirely.

## Stack

- Python 3.12 + FastAPI
- OpenAI SDK (compatible with OpenRouter, Ollama, vLLM, or any OpenAI-compatible endpoint)
- httpx (async HTTP client for interservice calls)
- Uvicorn (ASGI server)

## Prerequisites

- Docker + Docker Compose
- Python 3.12 (for local development)
- An LLM provider: OpenRouter API key **or** a local LLM server (Ollama, vLLM, etc.)

## Running locally

From the repo root:

```bash
docker compose up --build
```

The service starts on `http://localhost:3003`. Context documents are loaded from the `context/` folder at startup.

Health check:

```bash
curl http://localhost:3003/health
```

For local development without Docker:

```bash
cd services/parrot
pip install -r requirements.txt
LLM_API_KEY=your-key uvicorn main:app --port 3003
```

## Environment variables

| Variable              | Default                          | Description                                                    |
| --------------------- | -------------------------------- | -------------------------------------------------------------- |
| `PORT`                | `3003`                           | HTTP listen port                                               |
| `LLM_BASE_URL`        | `https://openrouter.ai/api/v1`   | OpenAI-compatible API base URL                                 |
| `LLM_API_KEY`         | `""`                             | API key for the LLM provider                                   |
| `LLM_MODEL`           | `meta-llama/llama-3.1-8b-instruct` | Model identifier (provider-specific)                        |
| `LLM_TEMPERATURE`     | `0.4`                            | Sampling temperature (lower = more consistent, tool-faithful)  |
| `LLM_MAX_TOKENS`      | `600`                            | Max tokens per reply (keeps answers chat-sized, bounds cost)   |
| `LLM_TOP_P`           | `1.0`                            | Nucleus sampling top-p                                          |
| `AIRPORT_SERVICE_URL`  | `http://localhost:3001`          | Airport service base URL                                       |
| `HOTEL_SERVICE_URL`    | `http://localhost:3000`          | Hotel service base URL                                         |
| `INTERNAL_SECRET`      | `""`                             | Shared secret sent as `X-Internal-Key` for interservice calls  |
| `CONTEXT_DIR`          | `context`                        | Path to folder with resort context documents                   |
| `MAX_HISTORY_MESSAGES` | `20`                             | Max user+assistant messages kept per conversation              |
| `CONVERSATION_TTL`     | `1800`                           | Seconds before an idle conversation is evicted (default 30 min)|
| `PROFANITY_WORDS`      | *`[Censored]`* | Comma-separated profanity stop list; unset uses the built-in default |

### Switching LLM providers

**OpenRouter (cloud):**

```env
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=sk-or-v1-...
LLM_MODEL=meta-llama/llama-3.1-8b-instruct
```

**Ollama (local):**

```env
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=llama3
```

**vLLM (local):**

```env
LLM_BASE_URL=http://localhost:8080/v1
LLM_API_KEY=unused
LLM_MODEL=meta-llama/Llama-3-8B-Instruct
```

## Endpoints

| Method | Path                 | Description                                              |
| ------ | -------------------- | -------------------------------------------------------- |
| GET    | `/health`            | Health check                                             |
| POST   | `/chat`              | Send a message, get an AI response                       |
| POST   | `/chat/stream`       | Same request as `/chat`, streams the reply as SSE        |
| GET    | `/history/{guest_id}`| Get chat history for a guest                             |
| GET    | `/admin/metrics`     | Aggregate observability metrics (store-derived)          |
| GET    | `/admin/conversations`| List conversations with per-conversation summaries      |
| GET    | `/admin/conversations/{guest_id}`| Full raw transcript (incl. tool calls + results) |

## API contract

### POST /chat

Request:

```json
{
  "message": "What rooms are available?",
  "guest_id": "guest-kiki-0001"
}
```

`guest_id` is optional. When provided, the AI can look up that guest's arrival status and hotel reservation, and conversation history is maintained across requests. When omitted, only aggregate data is accessible and no history is kept.

Response 200:

```json
{
  "reply": "There are 3 standard rooms and 1 suite currently available. Standard rooms are $100/night for up to 2 guests, and the suite is $400/night for up to 4 guests."
}
```

Response 502 — LLM service unavailable:

```json
{
  "detail": "LLM service unavailable"
}
```

### POST /chat/stream

Identical request body to `/chat`. Instead of a single JSON reply, the response is a
`text/event-stream` (Server-Sent Events). The tool-calling loop runs server-side; status
events report tool activity (tool name only — never arguments or guest IDs), then the final
answer streams token-by-token. History is saved once the stream ends — the save runs in a
`finally` block, so the turn is persisted even on an early client disconnect or LLM failure
(unlike `/chat`, which persists only on success).

Event types (`data:` is a JSON object):

| Event    | Payload                                          | Meaning                                  |
| -------- | ------------------------------------------------ | ---------------------------------------- |
| `status` | `{"type":"tool_call","name":"..."}`              | A tool is being called                   |
| `status` | `{"type":"tool_result","name":"..."}`            | That tool returned                       |
| `token`  | `{"delta":"..."}`                                | A chunk of the answer text               |
| `done`   | `{"reply":"<full text>"}`                         | Final full reply (terminal)              |
| `error`  | `{"detail":"LLM service unavailable"}`            | The LLM call failed (terminal)           |

A trailing `data: [DONE]` line follows a successful `done` event (OpenAI-style sentinel).

```
event: status
data: {"type": "tool_call", "name": "get_hotel_rooms"}

event: status
data: {"type": "tool_result", "name": "get_hotel_rooms"}

event: token
data: {"delta": "There are 3 standard rooms"}

event: token
data: {"delta": " available right now."}

event: done
data: {"reply": "There are 3 standard rooms available right now."}

data: [DONE]
```

### GET /history/{guest_id}

Returns the visible conversation history (user and assistant messages only) for a guest.

Response 200:

```json
{
  "guest_id": "guest-kiki-0001",
  "messages": [
    { "role": "user", "content": "What rooms are available?" },
    { "role": "assistant", "content": "There are 3 standard rooms and 1 suite currently available." }
  ]
}
```

Response 200 — no history found:

```json
{
  "guest_id": "guest-kiki-0001",
  "messages": []
}
```

## LLM tools

The AI has access to these tools for fetching live data:

| Tool                       | Service | Description                              | Requires `guest_id` |
| -------------------------- | ------- | ---------------------------------------- | -------------------- |
| `get_airport_stats`        | Airport | Aggregate stats (arrivals, wait times)   | No                   |
| `get_airport_queue_status` | Airport | Gate queue sizes and wait times           | No                   |
| `get_hotel_rooms`          | Hotel   | Room availability, types, pricing        | No                   |
| `get_guest_arrival_status` | Airport | Single guest's arrival status            | Yes                  |
| `get_guest_reservation`    | Hotel   | Single guest's active reservation        | Yes                  |
| `get_guest_journey_status` | Airport + Hotel | Combined arrival + reservation snapshot in one call | Yes        |

## Interservice calls

Parrot fetches live data from the airport and hotel services via HTTP. All calls use a 5-second timeout.

| Downstream endpoint                          | Used by tool               |
| -------------------------------------------- | -------------------------- |
| `GET ${AIRPORT_SERVICE_URL}/stats`            | `get_airport_stats`        |
| `GET ${AIRPORT_SERVICE_URL}/queue`            | `get_airport_queue_status` |
| `GET ${AIRPORT_SERVICE_URL}/arrivals/{id}`    | `get_guest_arrival_status`, `get_guest_journey_status` |
| `GET ${HOTEL_SERVICE_URL}/rooms`              | `get_hotel_rooms`          |
| `GET ${HOTEL_SERVICE_URL}/reservation/by-guest/{id}` | `get_guest_reservation`, `get_guest_journey_status` |

`get_guest_journey_status` calls the airport and hotel endpoints concurrently and tolerates either
leg failing (a 404 / timeout becomes an `{"error": ...}` marker in that part of the result).

When `INTERNAL_SECRET` is set, it is sent as the `X-Internal-Key` header on every interservice request.
Each request is also tagged with a correlation id: the service honors an inbound `X-Request-ID`
header (or generates one), echoes it on the response, forwards it on every interservice call, and
includes it as `rid=...` in log lines (alongside per-tool `dur_ms=...` timings).

If a downstream service is unreachable or returns an error, the tool returns a JSON error message to the LLM, which then explains the situation to the guest in natural language. The chat endpoint itself does not fail — only an LLM outage produces a 502.

## Privacy

- **Per-guest tools** — The guest-specific lookups (`get_guest_arrival_status`, `get_guest_reservation`, `get_guest_journey_status`) are only offered to the model when the request includes a `guest_id`.

## Message filtering

Each guest message is passed through a profanity filter before it reaches the LLM and the stored conversation history: words from a stop list are masked with `*` (length preserved, case-insensitive). The stop list comes from the `PROFANITY_WORDS` env var (comma-separated), falling back to a curated built-in default when unset. Filtering applies to the **guest's** message only — model replies and tool output are not masked. See `profanity.py`.

## Conversation management

Conversation history is stored in memory (not persisted to disk).

- Each `guest_id` gets its own message list, capped at `MAX_HISTORY_MESSAGES` user+assistant messages. When the cap is exceeded, the oldest user-assistant pairs are trimmed.
- Conversations idle for longer than `CONVERSATION_TTL` seconds (default 30 min) are evicted. Cleanup runs every 60 seconds.
- Maximum 500 concurrent conversations. If the limit is reached, the oldest conversations are evicted first.
- Anonymous requests (no `guest_id`) do not create or use history.

## Admin / observability

Three read-only endpoints expose the assistant's internal state for operators
(e.g. the island-map diagnostic view). They are **store-derived** — every value
is computed at request time from the in-memory `ConversationStore`; there is no
separate metrics pipeline.

- `GET /admin/metrics` — aggregate counts across all live conversations: active
  conversation count vs. capacity, total messages / user turns / assistant
  turns, per-tool call counts, tool-error count, `FALLBACK` count, and
  censored-message count (user messages the profanity filter masked a word in).
- `GET /admin/conversations` — one row per conversation (turn count, tool usage,
  and `has_censored` / `has_fallback` / `has_tool_error` health flags), newest
  activity first.
- `GET /admin/conversations/{guest_id}` — the **full raw transcript** including
  the `assistant.tool_calls` and `role:tool` results that `GET /history` hides;
  `404` if the guest has no conversation in memory.

All three are `GET` with no request body. The only request parameter is the
`{guest_id}` path segment on the detail endpoint; `last_accessed` fields are Unix
epoch seconds.

### GET /admin/metrics

Response 200:

```json
{
  "total_conversations": 12,
  "max_conversations": 500,
  "total_messages": 84,
  "total_user_turns": 21,
  "total_assistant_turns": 18,
  "tool_calls_total": 15,
  "tool_calls_by_name": {
    "get_hotel_rooms": 6,
    "get_guest_journey_status": 5,
    "get_airport_queue_status": 4
  },
  "tool_errors_total": 2,
  "fallback_total": 1,
  "censored_messages_total": 3,
  "conversations_with_fallback": 1,
  "conversations_with_tool_error": 2,
  "conversations_with_censored": 2
}
```

### GET /admin/conversations

Response 200 (`conversations` sorted by `last_accessed`, newest first):

```json
{
  "count": 1,
  "conversations": [
    {
      "guest_id": "guest-kiki-0001",
      "last_accessed": 1749200000.123,
      "turns": 2,
      "censored_count": 0,
      "total_messages": 6,
      "assistant_turns": 2,
      "tool_calls_by_name": { "get_hotel_rooms": 1 },
      "tool_calls_total": 1,
      "tool_errors": 0,
      "fallback_count": 0,
      "has_censored": false,
      "has_fallback": false,
      "has_tool_error": false
    }
  ]
}
```

### GET /admin/conversations/{guest_id}

Response 200 — `transcript` is a uniform, frontend-friendly message list: every
entry keeps top-level `role` + `content` (content is `null` when a turn only made
tool calls), so text turns render exactly like `/history`. Tool activity is
preserved but flattened — assistant `tool_calls` become `{id, name, arguments}`
(`arguments` left as the raw string), and each `tool` row carries the resolved
tool `name` plus its `tool_call_id`. `summary` is the same per-conversation shape
used in the list above:

```json
{
  "guest_id": "guest-kiki-0001",
  "last_accessed": 1749200000.123,
  "summary": {
    "turns": 1,
    "censored_count": 0,
    "total_messages": 4,
    "assistant_turns": 1,
    "tool_calls_by_name": { "get_hotel_rooms": 1 },
    "tool_calls_total": 1,
    "tool_errors": 0,
    "fallback_count": 0,
    "has_censored": false,
    "has_fallback": false,
    "has_tool_error": false
  },
  "transcript": [
    { "role": "user", "content": "What rooms are available?" },
    { "role": "assistant", "content": null, "tool_calls": [
      { "id": "call_1", "name": "get_hotel_rooms", "arguments": "{}" }
    ] },
    { "role": "tool", "name": "get_hotel_rooms", "tool_call_id": "call_1",
      "content": "{\"rooms\": [{\"type\": \"standard\", \"available\": 3}]}" },
    { "role": "assistant", "content": "There are 3 standard rooms available." }
  ]
}
```

Response 404 — no conversation in memory for that guest:

```json
{ "detail": "Conversation not found" }
```

Notes:

- **Current-window semantics** — counts reflect only conversations currently in
  memory; TTL-evicted ones are gone, and **latency percentiles are not
  available** (durations are logged, not aggregated).
- **Non-mutating** — admin reads never refresh a conversation's `last_accessed`,
  so inspecting a session does not keep it alive or skew TTL eviction.
- **Unauthenticated, raw content** — consistent with the rest of the service,
  these endpoints require no auth and the transcript returns conversation
  content verbatim, including any PII the guest typed. Intended for trusted /
  admin use only.

## Context documents

Place `.md` or `.txt` files in the `context/` folder. They are loaded at startup and injected into the LLM system prompt. Add resort descriptions, FAQs, facility info, or any static knowledge the AI should have.

## Guest IDs

Guest IDs are opaque, non-empty strings — there is no enforced format. The frontend uses
`<surname>-<firstname>` slugs (for example, `mango-miles`).

`guest-kiki-0001` is the fixed identifier for the mascot guest.

## Testing

Send a chat message (anonymous):

```bash
curl -X POST http://localhost:3003/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How busy is the airport?"}'
```

Send a chat message with guest context:

```bash
curl -X POST http://localhost:3003/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Where am I in the queue?", "guest_id": "guest-kiki-0001"}'
```

Retrieve conversation history:

```bash
curl http://localhost:3003/history/guest-kiki-0001
```

Stream a reply as Server-Sent Events (`-N` disables curl's buffering):

```bash
curl -N -X POST http://localhost:3003/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "What rooms are available?", "guest_id": "guest-kiki-0001"}'
```

Inspect the admin/observability endpoints (note the detail view shows the raw
tool calls and tool results that `/history` hides):

```bash
curl http://localhost:3003/admin/metrics
curl http://localhost:3003/admin/conversations
curl http://localhost:3003/admin/conversations/guest-kiki-0001
```

## Project structure

```
services/parrot/
  main.py             # App factory, lifespan, middleware, entrypoint
  routes.py           # HTTP endpoints (APIRouter)
  config.py           # Settings (pydantic-settings)
  schemas.py          # Pydantic request/response models
  history.py          # In-memory conversation store and TTL cleanup
  llm.py              # OpenAI client, tool-calling loop, streaming generator
  tools.py            # Tool schemas, dispatch, access control
  profanity.py        # Profanity masking for guest messages
  services.py         # HTTP client for interservice calls
  admin.py            # Store-derived admin/observability derivations
  tracing.py          # Per-request correlation id (contextvar)
  context_loader.py   # Loads context docs from folder
  context/            # Resort context documents (.md, .txt)
```
