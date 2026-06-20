import os

PORT = int(os.environ.get("PORT", "3001"))
DATABASE_PATH = os.environ.get("DATABASE_PATH", "airport.db")
BROADCAST_SERVICE_URL = os.environ.get("BROADCAST_SERVICE_URL", "http://broadcast:3002")
INTERNAL_SECRET = os.environ.get("INTERNAL_SECRET", "")
SIMULATION_START_TIME = os.environ.get("SIMULATION_START_TIME", "2026-06-20T00:00:00Z")
GAME_SPEED = int(os.environ.get("GAME_SPEED", "300"))
EU_GATES = int(os.environ.get("EU_GATES", "3"))
ALL_GATES = int(os.environ.get("ALL_GATES", "2"))
PROCESSING_TIME_EU = float(os.environ.get("PROCESSING_TIME_EU", "300"))
PROCESSING_TIME_ALL = float(os.environ.get("PROCESSING_TIME_ALL", "600"))
