#!/usr/bin/env python3
"""Check which hotel rooms have free capacity.

The hotel service exposes ``GET /api/hotel/rooms`` via the API gateway.
Each room object includes:
    - ``capacity``   – total number of guests the room can hold
    - ``current_guests`` – guests currently occupying the room

A room is considered *available* when ``current_guests < capacity``.
The script prints a concise list of such rooms, e.g.::

    $ python hotel_available_rooms.py
    Available rooms (2 free slots total):
    • room-deluxe-01  (capacity 3, occupied 1)
    • room-standard-05 (capacity 2, occupied 0)

If the gateway URL differs from the default ``http://localhost:8000`` you can
override it with ``--url``.
"""

import argparse
import json
import sys
from typing import List, Dict

import requests

Room = Dict[str, int | str]


def fetch_rooms(base_url: str) -> List[Room]:
    """Retrieve the full list of rooms from the hotel service.

    Parameters
    ----------
    base_url: str
        Base URL of the API gateway (e.g. ``http://localhost:8000``).

    Returns
    -------
    List[Room]
        Raw list as returned by the ``/api/hotel/rooms`` endpoint.
    """
    url = f"{base_url.rstrip('/')}/api/hotel/rooms"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as exc:
        print(f"[error] Failed to fetch rooms: {exc}", file=sys.stderr)
        sys.exit(1)
    data = resp.json()
    return data.get("rooms", [])


def filter_available(rooms: List[Room]) -> List[Room]:
    """Return only rooms where ``current_guests`` is less than ``capacity``.
    """
    return [r for r in rooms if r.get("current_guests", 0) < r.get("capacity", 0)]


def main() -> None:
    parser = argparse.ArgumentParser(description="List hotel rooms with free capacity")
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="Base URL of the API gateway (default: http://localhost:8000)",
    )
    args = parser.parse_args()

    rooms = fetch_rooms(args.url)
    available = filter_available(rooms)

    total_free = sum(r["capacity"] - r["current_guests"] for r in available)
    if not available:
        print("No rooms have free capacity at the moment.")
        return

    print(f"Available rooms ({total_free} free slot{'s' if total_free != 1 else ''} total):")
    for r in available:
        free = r["capacity"] - r["current_guests"]
        print(f"• {r['id']} (capacity {r['capacity']}, occupied {r['current_guests']}, free {free})")

if __name__ == "__main__":
    main()
