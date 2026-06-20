import requests
from config import BROADCAST_SERVICE_URL, INTERNAL_SECRET


class BroadcastClient:
    """Publishes airport events to the Broadcast service.

    Fire-and-forget: if Broadcast is down, events are silently lost.
    """

    def __init__(self):
        self.url = BROADCAST_SERVICE_URL
        self.secret = INTERNAL_SECRET

    def publish_event(self, result: dict):
        """Publish a guest-processed event. Never raises exceptions."""
        try:
            requests.post(
                f"{self.url}/airport/arrival",
                json={
                    "channel": "resort-wide",
                    "message": (
                        f"{result['name']} {result['surname']} "
                        f"(ID: {result['guest_id']}) {result['status']} at "
                        f"{result['gate'].split('-')[0]} Passport Gate "
                        f"({result['gate']}). Passport: {result['passport_type']}, "
                        f"Wait: {result['wait_time_seconds']:.0f}s game time"
                    ),
                    "sender": "airport-service",
                    "data": {
                        "guest_id": result["guest_id"],
                        "name": result["name"],
                        "surname": result["surname"],
                        "age": result["age"],
                        "passport_type": result["passport_type"],
                        "priority": result["priority"],
                        "disability": result.get("disability", False),
                        "status": result["status"],
                        "gate": result["gate"],
                        "queued_at": result["queued_at"],
                        "processed_at": result["processed_at"],
                        "wait_time_seconds": result["wait_time_seconds"],
                    },
                },
                headers={"X-Internal-Key": self.secret, "Content-Type": "application/json"},
                timeout=2,
            )
        except Exception:
            pass
