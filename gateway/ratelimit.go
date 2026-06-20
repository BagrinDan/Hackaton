package main

import (
	"net/http"
	"strconv"
	"sync"
	"sync/atomic"
	"time"
)

type window struct {
	count int
	reset time.Time
}

// RateLimiter is a fixed-window per-client limiter. limit and the window are
// stored atomically so they can be adjusted at runtime (see admin.go).
type RateLimiter struct {
	mu sync.Mutex
	// clients holds one fixed-window counter per client key.
	clients map[string]*window
	limit   atomic.Int64 // requests per window; <= 0 disables limiting
	perNs   atomic.Int64 // window length, nanoseconds
}

func NewRateLimiter(limit int, per time.Duration) *RateLimiter {
	rl := &RateLimiter{clients: make(map[string]*window)}
	rl.limit.Store(int64(limit))
	rl.perNs.Store(int64(per))
	return rl
}

// Limit returns the current per-window request limit.
func (rl *RateLimiter) Limit() int { return int(rl.limit.Load()) }

// Window returns the current window length.
func (rl *RateLimiter) Window() time.Duration { return time.Duration(rl.perNs.Load()) }

// SetLimits updates the limiter at runtime. A window <= 0 is left unchanged.
func (rl *RateLimiter) SetLimits(limit int, per time.Duration) {
	rl.limit.Store(int64(limit))
	if per > 0 {
		rl.perNs.Store(int64(per))
	}
}

func (rl *RateLimiter) allow(key string) bool {
	limit := int(rl.limit.Load())
	per := time.Duration(rl.perNs.Load())

	rl.mu.Lock()
	w := rl.clients[key]
	now := time.Now()
	if w == nil || now.After(w.reset) {
		w = &window{count: 0, reset: now.Add(per)}
		rl.clients[key] = w
	}
	cur := w.count
	rl.mu.Unlock()

	if cur >= limit {
		return false
	}
	rl.mu.Lock()
	w.count++
	rl.mu.Unlock()
	return true
}

// RateLimitMiddleware admits up to the limiter's current limit per window per
// client, keyed on RemoteAddr (chi RealIP runs upstream). The limit is read per
// request so it can be toggled at runtime; a limit <= 0 passes through.
func RateLimitMiddleware(rl *RateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if rl == nil || rl.Limit() <= 0 {
				next.ServeHTTP(w, r)
				return
			}
			if !rl.allow(r.RemoteAddr) {
				w.Header().Set("Retry-After", strconv.Itoa(int(rl.Window().Seconds())))
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				w.Write([]byte(`{"error": "rate limit exceeded"}`))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
