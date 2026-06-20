from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Service configuration, read from environment variables (matched case-insensitively).

    Defaults match the documented values in README / .env.example. Typing means a malformed
    value (e.g. a non-numeric PORT or GAME_SPEED) fails fast at startup with a clear error
    instead of surfacing as a confusing crash later.
    """

    # env_ignore_empty: an env var set to an empty string falls back to the field default
    # instead of overriding it — so an unset PROFANITY_WORDS passed through docker-compose
    # (which resolves to "") still yields the curated default list rather than disabling masking.
    model_config = SettingsConfigDict(extra="ignore", env_ignore_empty=True)

    port: int = 3003

    llm_base_url: str = "https://openrouter.ai/api/v1"
    llm_api_key: str = ""
    llm_model: str = "meta-llama/llama-3.1-8b-instruct"

    # Sampling params for the assistant. Low temperature keeps tool-grounded answers
    # faithful and consistent; max_tokens keeps replies chat-bubble sized and bounds cost.
    llm_temperature: float = 0.4
    llm_max_tokens: int = 600
    llm_top_p: float = 1.0

    airport_service_url: str = "http://localhost:3001"
    hotel_service_url: str = "http://localhost:3000"
    internal_secret: str = ""

    context_dir: str = "context"

    max_history_messages: int = 20
    conversation_ttl: int = 1800

    # Guest-message profanity stop list, comma-separated. Override to replace the
    # built-in default entirely (the defaults do not merge).
    profanity_words: str = "ass,crap,damn,hell,piss,shit,bastard"


settings = Settings()
