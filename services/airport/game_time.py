import time
from datetime import datetime
from config import SIMULATION_START_TIME, GAME_SPEED

SIMULATION_START = datetime.fromisoformat(SIMULATION_START_TIME).timestamp()


def game_now() -> float:
    """Returns current game time in seconds since simulation start."""
    real_elapsed = time.time() - SIMULATION_START
    return real_elapsed * GAME_SPEED
