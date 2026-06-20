# Island Announcement Service

## Overview

The Island Announcement Service is a centralized real-time notification hub for the island ecosystem.

It allows island services (Airport, Hotel, Beach, etc.) and guests to publish events that are immediately broadcast to all connected clients using Server-Sent Events (SSE).

The service acts as the communication layer between island components and provides a single source for real-time announcements.

---


# Running the Application

## Local Development

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm run dev
```

Default URL:

```text
http://localhost:3000
```

---

# Environment Variables

Create a `.env` file:

```env
PORT=3000
CORS_ORIGIN=*
```

| Variable    | Description         | Default |
| ----------- | ------------------- | ------- |
| PORT        | Application port    | 3000    |
| CORS_ORIGIN | Allowed CORS origin | *       |

---

# API Endpoints

---

## SSE Stream

### Connect to Event Stream

```http
GET /events
```

Returns a continuous stream of island announcements.

### Example

```bash
curl -N http://localhost:3000/events
```

Example response:

```text

event: public.announcement
data: {id: uuid, event: EventType, timestamp: Date, source: String, payload: {}}
```

---

## Airport

### Guest Arrival

```http
POST /airport/arrival
```

---

## Hotel

```http
POST /hotel/confirm
```

```http
POST /hotel/cancel
```
---

## Beach

```http
POST /beach/full
```

```http
POST /beach/available
```

---

## Public Announcements

```http
POST /public
```

---

# Event Types

The service currently supports the following event types:

| Event Type                            | Description                    |
| ------------------------------------- | ------------------------------ |
| airport.arrival                       | Guest arrived on the island    |
| hotel.reservation_confirmed           | Guest checked into the hotel   |
| hotel.reservation_canceled            | Guest canceled hotel stay      |
| beach.activity_full                   | Beach activity reached capacity|
| beach.activity_available              | Beach activity available       |
| public.announcement                   | Guest broadcast message        |
