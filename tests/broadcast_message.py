#!/usr/bin/env python3
"""Improved broadcast helper for the Island Announcement Service.

The service exposes a small set of POST endpoints (see
services/broadcast/README.MD) behind the API gateway at
``/api/broadcast``.  This script determines the correct URL for the
requested ``service``/``action`` pair, sends the JSON payload and prints
the gateway response.

Supported combinations (derived from the README):
    airport → arrival
    hotel   → confirm | cancel
    beach   → full | available
    public  → announcement (action name ignored; ``--body`` is used)

Usage example::
    python broadcast_message.py \
        --service hotel \
        --action  confirm \
        --body    "Reservation 42 confirmed"
"""

import argparse
import json
import sys
from pathlib import Path

import requests

# Mapping of (service, action) -> endpoint suffix (relative to /api/broadcast)
_ENDPOINT_MAP = {
    ("airport", "arrival"): "airport/arrival",
    ("hotel", "confirm"): "hotel/confirm",
    ("hotel", "cancel"): "hotel/cancel",
    ("beach", "full"): "beach/full",
    ("beach", "available"): "beach/available",
    # ``public`` does not differentiate actions – any action falls back to this endpoint.
    ("public", "announcement"): "public",
    ("public", None): "public",
}


def resolve_endpoint(service: str, action: str | None) -> str:
    """Return the endpoint path for a given service/action.

    Raises ``ValueError`` if the combination is unsupported.
    """
    key = (service, action)
    if key in _ENDPOINT_MAP:
        return _ENDPOINT_MAP[key]
    # Fallback for public announcements where the action name is irrelevant
    if service == "public":
        return _ENDPOINT_MAP[("public", None)]
    raise ValueError(f"Unsupported service/action pair: {service!r}/{action!r}")


def build_url(base: str, endpoint: str) -> str:
    return f"{base.rstrip('/')}/api/broadcast/{endpoint}"


def main() -> None:
    parser = argparse.ArgumentParser(description="Send a broadcast event via the gateway")
    parser.add_argument("--service", required=True, choices=["airport", "hotel", "beach", "public"],
                        help="Target service for the broadcast")
    parser.add_argument("--action", required=False, default=None,
                        help="Action name (depends on service). For public announcements this can be omitted.")
    parser.add_argument("--body", required=True, help="Message body that will be placed in the payload")
    parser.add_argument("--url", default="http://localhost:8000", help="Base URL of the API gateway")

    args = parser.parse_args()

    try:
        endpoint = resolve_endpoint(args.service, args.action)
    except ValueError as exc:
        print(f"[error] {exc}", file=sys.stderr)
        sys.exit(1)

    payload = {"body": args.body}
    target = build_url(args.url, endpoint)

    try:
        response = requests.post(target, json=payload, timeout=10)
    except requests.RequestException as exc:
        print(f"[error] request failed: {exc}", file=sys.stderr)
        sys.exit(1)

    if not response.ok:
        print(f"[error] HTTP {response.status_code}: {response.text}", file=sys.stderr)
        sys.exit(1)

    # Pretty‑print JSON response (the gateway returns {"success": true})
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
    except json.JSONDecodeError:
        print(response.text)

if __name__ == "__main__":
    main()
