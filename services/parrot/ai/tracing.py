from contextvars import ContextVar

# Correlation ID for the in-flight request. Set per request (by the chat handlers /
# streaming generator) and read by the interservice HTTP client so the same id flows
# through logs and downstream X-Request-ID headers.
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")
