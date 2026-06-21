import asyncio
import json
import httpx
from services.parrot.core.config import settings
from tracing import request_id_ctx

TIMEOUT = 5.0

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        headers = {"Content-Type": "application/json"}
        if settings.internal_secret:
            headers["X-Internal-Key"] = settings.internal_secret
        _client = httpx.AsyncClient(timeout=TIMEOUT, headers=headers)
    return _client


def _hdrs() -> dict:
    """Per-request headers — propagates the correlation ID downstream for tracing."""
    rid = request_id_ctx.get()
    return {"X-Request-ID": rid} if rid and rid != "-" else {}


async def close_client():
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
        _client = None


async def get_airport_stats() -> str:
    r = await _get_client().get(f"{settings.airport_service_url}/stats", headers=_hdrs())
    r.raise_for_status()
    return json.dumps(r.json())


async def get_airport_queue_status() -> str:
    r = await _get_client().get(f"{settings.airport_service_url}/queue", headers=_hdrs())
    r.raise_for_status()
    return json.dumps(r.json())


async def get_hotel_rooms() -> str:
    r = await _get_client().get(f"{settings.hotel_service_url}/rooms", headers=_hdrs())
    r.raise_for_status()
    return json.dumps(r.json())


async def get_guest_arrival_status(guest_id: str) -> str:
    r = await _get_client().get(f"{settings.airport_service_url}/arrivals/{guest_id}", headers=_hdrs())
    r.raise_for_status()
    return json.dumps(r.json())


async def get_guest_reservation(guest_id: str) -> str:
    r = await _get_client().get(f"{settings.hotel_service_url}/reservation/by-guest/{guest_id}", headers=_hdrs())
    r.raise_for_status()
    return json.dumps(r.json())


async def get_guest_journey_status(guest_id: str) -> str:
    """Combined arrival + reservation snapshot in one call (the two legs run concurrently).

    Each leg tolerates its own failure: a 404 / timeout becomes an {"error": ...} marker
    inside the result rather than failing the whole tool, so the assistant can still report
    whatever did resolve (e.g. arrival cleared but no booking yet).
    """
    client = _get_client()

    async def _leg(url: str) -> dict:
        try:
            r = await client.get(url, headers=_hdrs())
            r.raise_for_status()
            return r.json()
        except httpx.HTTPStatusError as e:
            return {"error": "not_found"} if e.response.status_code == 404 else {"error": f"status_{e.response.status_code}"}
        except (httpx.ConnectError, httpx.TimeoutException):
            return {"error": "unavailable"}

    arrival, reservation = await asyncio.gather(
        _leg(f"{settings.airport_service_url}/arrivals/{guest_id}"),
        _leg(f"{settings.hotel_service_url}/reservation/by-guest/{guest_id}"),
    )
    return json.dumps({"guest_id": guest_id, "arrival": arrival, "reservation": reservation})
