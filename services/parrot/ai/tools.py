import json
import httpx
from services import (
    get_airport_stats,
    get_airport_queue_status,
    get_hotel_rooms,
    get_guest_arrival_status,
    get_guest_reservation,
    get_guest_journey_status,
)

TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_airport_stats",
            "description": "Get aggregate airport statistics: total arrivals, processed count, average wait times, gate and passport distribution.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_airport_queue_status",
            "description": "Get current gate queue sizes and wait times at passport control. Returns aggregate info per gate (no personal guest details). Use this for any question about the airport, passport control, gates, or queues — including how they work.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_hotel_rooms",
            "description": "Get all hotel rooms with current availability, types, capacity, and pricing. Use this for any question that touches rooms, reservations, bookings, check-in/out, or how the hotel works — including general or definitional ones.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
]

GUEST_TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_guest_arrival_status",
            "description": "Look up a specific guest's arrival and passport control status.",
            "parameters": {
                "type": "object",
                "properties": {
                    "guest_id": {"type": "string", "description": "The guest ID to look up, e.g. guest-kiki-0001"},
                },
                "required": ["guest_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_guest_reservation",
            "description": "Look up a specific guest's active hotel reservation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "guest_id": {"type": "string", "description": "The guest ID to look up, e.g. guest-kiki-0001"},
                },
                "required": ["guest_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_guest_journey_status",
            "description": "Get a combined snapshot of the current guest's journey: their airport arrival / passport-control status AND their active hotel reservation, in a single call. Prefer this over the individual lookups when the guest asks something broad like 'where am I', 'what's my status', or 'am I all set for my stay'.",
            "parameters": {
                "type": "object",
                "properties": {
                    "guest_id": {"type": "string", "description": "The guest ID to look up, e.g. guest-kiki-0001"},
                },
                "required": ["guest_id"],
            },
        },
    },
]

_DISPATCH = {
    "get_airport_stats": lambda **_: get_airport_stats(),
    "get_airport_queue_status": lambda **_: get_airport_queue_status(),
    "get_hotel_rooms": lambda **_: get_hotel_rooms(),
    "get_guest_arrival_status": lambda *, guest_id, **_: get_guest_arrival_status(guest_id),
    "get_guest_reservation": lambda *, guest_id, **_: get_guest_reservation(guest_id),
    "get_guest_journey_status": lambda *, guest_id, **_: get_guest_journey_status(guest_id),
}

async def execute_tool(name: str, arguments: dict, allowed_guest_id: str | None) -> str:
    fn = _DISPATCH.get(name)
    if fn is None:
        return json.dumps({"error": f"Unknown tool: {name}"})

    try:
        return await fn(**arguments)
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            return json.dumps({"error": "Not found"})
        return json.dumps({"error": f"Service returned {e.response.status_code}"})
    except (httpx.ConnectError, httpx.TimeoutException):
        return json.dumps({"error": f"Service unavailable for {name}"})
