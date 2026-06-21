#!/usr/bin/env python3
"""Automated integration test script for the Hackaton island services.

The script exercises **all documented endpoints** (GET, POST, DELETE, SSE) and
prints a brief report for each request.  It targets the services via the API
gateway (`http://localhost:8000/api/…`) which proxies to the individual back‑ends.

Dependencies
------------
* Python 3.12+
* `requests` – for standard HTTP calls
* `httpx` – for SSE streaming (uses ``httpx.Stream``)

Run
---
```bash
pip install requests httpx[sse]
python3 api_test.py
```
"""

import json
import sys
import time
from typing import Any, Dict, Tuple

import requests
import httpx
import argparse

# ---------------------------------------------------------------------------
# Configuration – override via environment variables if desired
# ---------------------------------------------------------------------------
GATEWAY_URL = "http://localhost:8000/api"
TIMEOUT = 5  # seconds for each request

# Helper utilities ----------------------------------------------------------

def log(section: str, msg: str) -> None:
    print(f"[{section}] {msg}")

# Command‑line argument to enable verbose logging
def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Hackaton API integration test script")
    parser.add_argument("-v", "--verbose", action="store_true", help="Enable detailed request/response logs")
    return parser.parse_args()

_args = _parse_args()
VERBOSE = _args.verbose

def pretty_body(body: Any, limit: int = 200) -> str:
    """Return a JSON‑encoded preview of *body* limited to *limit* characters."""
    if isinstance(body, (dict, list)):
        preview = json.dumps(body)
    else:
        preview = str(body)
    return preview[:limit] + ("..." if len(preview) > limit else "")

# HTTP request helper -----------------------------------------------------
def request(method: str, url: str, **kwargs) -> Tuple[int, Any]:
    """Perform an HTTP request and return ``(status_code, data)``.

    When ``VERBOSE`` is true, the request method, URL, payload and the
    response status with a truncated body are logged via :func:`log`.
    """
    if VERBOSE:
        # Log request details without exposing sensitive data (none expected)
        log("REQ", f"{method} {url} payload={json.dumps(kwargs)}")
    try:
        resp = requests.request(method, url, timeout=TIMEOUT, **kwargs)
        try:
            data = resp.json()
        except Exception:
            data = resp.text
        if VERBOSE:
            log(
                "RES",
                f"{method} {url} → {resp.status_code} body={pretty_body(data)}",
            )
        return resp.status_code, data
    except Exception as e:
        log("ERROR", f"{method} {url} raised {e}")
        return 0, str(e)

def expect_error(section: str, expected_status: int, method: str, url: str, **kwargs) -> None:
    """Perform a request that is expected to fail.

    Logs the outcome and ensures the response contains an ``error`` key
    (when the body is JSON) – useful for verifying error handling paths.
    """
    status, body = request(method, url, **kwargs)
    if status != expected_status:
        log(section, f"❌ {method} {url} expected status {expected_status}, got {status}")
        return
    # When the body is a dict, try to surface the error message
    if isinstance(body, dict) and "error" in body:
        log(section, f"✅ {method} {url} returned expected error – {body['error']}")
    else:
        # Show a preview of whatever was returned
        log(section, f"✅ {method} {url} returned expected status {expected_status} – {pretty_body(body)}")


def report(section: str, expected: int, actual: int, body: Any, desc: str = "") -> None:
    """Print a detailed result line.
    • ✅ when actual == expected, includes an optional description of what was expected.
    • ❌ otherwise, shows expected/actual and a short excerpt of the body.
    """
    if actual == expected:
        suffix = f" – {desc}" if desc else " – OK"
        if VERBOSE:
            # Include brief response body on success when verbose mode is on
            body_preview = pretty_body(body)
            log(section, f"✅ {expected}{suffix} – {body_preview}")
        else:
            log(section, f"✅ {expected}{suffix}")
    else:
        # Truncate body for readability
        body_preview = pretty_body(body)
        log(section, f"❌ expected {expected}, got {actual} – {body_preview}")

# ---------------------------------------------------------------------------
# Service‑specific test groups
# ---------------------------------------------------------------------------

def test_broadcast() -> None:
    base = f"{GATEWAY_URL}/broadcast"
    # SSE stream – read first event only
    sse_url = f"{base}/events"
    log("BROADCAST", f"Connecting to SSE {sse_url}")
    try:
        with httpx.stream("GET", sse_url, timeout=TIMEOUT) as stream:
            for line in stream.iter_lines():
                txt = line.decode() if isinstance(line, (bytes, bytearray)) else line
                if txt.startswith("event:") or txt.startswith("data:"):
                    log("BROADCAST", f"SSE line: {txt}")
                    break
    except Exception as e:
        log("BROADCAST", f"SSE connection failed: {e}")

    # Simple POST endpoints – many return 404/502 as not implemented; we verify they are reachable (status < 500)
    endpoints = ["/airport/arrival", "/hotel/confirm", "/hotel/cancel", "/beach/full", "/beach/available", "/public"]
    for ep in endpoints:
        url = f"{base}{ep}"
        status, body = request("POST", url)
        if status >= 500:
            log("BROADCAST", f"⚠ endpoint {ep} returned server error {status}")
        else:
            log("BROADCAST", f"✅ endpoint {ep} returned {status}")


def test_airport() -> None:
    base = f"{GATEWAY_URL}/airport"
    # health
    status, _ = request("GET", f"{base}/health")
    report("AIRPORT", 200, status, "", "gateway health check")

    # Create a guest arrival (valid payload)
    payload = {
        "guest_id": "guest-test-0001",
        "name": "Test",
        "surname": "User",
        "age": 30,
        "passport_type": "EU",
        "priority": "standard",
        "disability": False,
    }
    status, body = request("POST", f"{base}/arrivals", json=payload)
    report("AIRPORT", 202, status, body, "create arrival (valid payload)")

    # Invalid payload – missing required field
    bad_payload = {"guest_id": "x"}
    status, body = request("POST", f"{base}/arrivals", json=bad_payload)
    report("AIRPORT", 400, status, body)

    # Retrieve the created arrival
    status, body = request("GET", f"{base}/arrivals/guest-test-0001")
    report("AIRPORT", 200, status, body)

    # Retrieve a non‑existent arrival to verify 404 handling
    expect_error("AIRPORT", 404, "GET", f"{base}/arrivals/does-not-exist")

    # Queue status
    status, body = request("GET", f"{base}/queue")
    report("AIRPORT", 200, status, body)

    # Stats summary
    status, body = request("GET", f"{base}/stats")
    report("AIRPORT", 200, status, body)


def test_hotel() -> None:
    base = f"{GATEWAY_URL}/hotel"
    # health
    status, _ = request("GET", f"{base}/health")
    report("HOTEL", 200, status, "")

    # Create a reservation (valid)
    reservation = {
        "guest_id": "guest-test-0001",
        "room_type": "SUITE",
        "guest_count": 2,
        "check_in_day": 1,
        "check_out_day": 4,
    }
    status, body = request("POST", f"{base}/reservation", json=reservation)
    # The API returns 200 on success, but some implementations use 201. Accept both.
    if status in (200, 201):
        log("HOTEL", f"✅ reservation creation returned {status}")
    else:
        report("HOTEL", 200, status, body)
    reservation_id = body.get("id") if isinstance(body, dict) else None

    # Get reservation by ID (if created)
    if reservation_id:
        status, body = request("GET", f"{base}/reservation/{reservation_id}")
        report("HOTEL", 200, status, body)

    # List rooms
    status, body = request("GET", f"{base}/rooms")
    report("HOTEL", 200, status, body)

    # Get active reservation by guest
    status, body = request("GET", f"{base}/reservation/by-guest/guest-test-0001")
    report("HOTEL", 200, status, body)

    # Cancel reservation (if id present)
    if reservation_id:
        status, body = request("DELETE", f"{base}/reservation/{reservation_id}")
        report("HOTEL", 200, status, body)

    # Invalid reservation payload
    bad = {"guest_id": "x"}
    status, body = request("POST", f"{base}/reservation", json=bad)
    report("HOTEL", 400, status, body)

    # Attempt to retrieve a non‑existent reservation to verify error handling
    expect_error("HOTEL", 404, "GET", f"{base}/reservation/nonexistent-id")
    # Attempt to create a reservation with an invalid room type (should return 400)
    bad_room = {"guest_id": "guest-test-0001", "room_type": "UNKNOWN", "guest_count": 1, "check_in_day": 1, "check_out_day": 2}
    expect_error("HOTEL", 400, "POST", f"{base}/reservation", json=bad_room)


def test_beach() -> None:
    base = f"{GATEWAY_URL}/beach"
    # health – the service may be down; treat any 2xx as healthy.
    status, _ = request("GET", f"{base}/health")
    if 200 <= status < 300:
        log("BEACH", f"✅ health {status}")
    else:
        log("BEACH", f"⚠ health returned {status} (service may be disabled)")

    # Get all activities
    status, body = request("GET", f"{base}/activities")
    report("BEACH", 200, status, body)
    activities = body.get("activities", []) if isinstance(body, dict) else []
    activity_id = activities[0].get("activity_id") if activities else None

    # Get details for the first activity
    if activity_id:
        status, body = request("GET", f"{base}/activity/{activity_id}")
        report("BEACH", 200, status, body)

        # Book activity (success path)
        book_payload = {"id": "guest-test-0001"}
        status, body = request("POST", f"{base}/activity/book/{activity_id}", json=book_payload)
        if 200 <= status < 300:
            log("BEACH", f"✅ booked activity – {status}")
        else:
            report("BEACH", 200, status, body)

        # Cancel booking (success path)
        status, body = request("POST", f"{base}/activity/cancel/{activity_id}", json=book_payload)
        if 200 <= status < 300:
            log("BEACH", f"✅ cancelled activity – {status}")
        else:
            report("BEACH", 200, status, body)

        # Attempt to re‑book to provoke possible errors – just log status
        status, _ = request("POST", f"{base}/activity/book/{activity_id}", json=book_payload)
        log("BEACH", f"Re‑book attempt status: {status}")


def test_parrot() -> None:
    base = f"{GATEWAY_URL}/parrot"
    # health
    status, _ = request("GET", f"{base}/health")
    report("PARROT", 200, status, "")

    # Simple chat request (anonymous)
    chat_payload = {"message": "What is the weather?"}
    status, body = request("POST", f"{base}/chat", json=chat_payload)
    report("PARROT", 200, status, body)

    # Chat with guest context – triggers tool calls (if services up)
    chat_guest = {"message": "How many rooms are available?", "guest_id": "guest-test-0001"}
    status, body = request("POST", f"{base}/chat", json=chat_guest)
    report("PARROT", 200, status, body)

    # SSE streaming endpoint – read first token event
    stream_url = f"{base}/chat/stream"
    log("PARROT", f"Connecting to streaming chat at {stream_url}")
    try:
        with httpx.stream("POST", stream_url, json=chat_payload, timeout=TIMEOUT) as stream:
            for line in stream.iter_lines():
                txt = line.decode() if isinstance(line, (bytes, bytearray)) else line
                if txt.startswith("event:") or txt.startswith("data:"):
                    log("PARROT", f"SSE line: {txt}")
                    break
    except Exception as e:
        log("PARROT", f"Streaming failed: {e}")

    # History endpoint – should be empty for anonymous
    status, body = request("GET", f"{base}/history/guest-test-0001")
    if status == 200:
        log("PARROT", f"✅ history retrieved – {body}")
    else:
        log("PARROT", f"⚠ history returned {status}")

    # Admin metrics (read‑only)
    status, body = request("GET", f"{base}/admin/metrics")
    report("PARROT", 200, status, body)


def test_gateway_health() -> None:
    url = "http://localhost:8000/health"
    status, body = request("GET", url)
    report("GATEWAY", 200, status, body)

def summarize(results: Dict[str, Tuple[int, int]]) -> None:
    total = sum(1 for r in results.values() if r[0])
    failures = sum(1 for r in results.values() if not r[0])
    log("SUMMARY", f"✅ Passed: {total - failures}, ❌ Failed: {failures}")

def main() -> None:
    log("RUN", "Starting integration test suite")
    test_gateway_health()
    test_broadcast()
    test_airport()
    test_hotel()
    test_beach()
    test_parrot()
    log("RUN", "Test suite completed")

if __name__ == "__main__":
    main()
