package main

import (
	"encoding/json"
	"net/http"
	"time"
)

type rateLimitUpdate struct {
	Limit  *int    `json:"limit"`
	Window *string `json:"window"` // Go duration string, optional
}

// AdminRateLimitHandler updates the live rate limiter at runtime.
func AdminRateLimitHandler(rl *RateLimiter) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		var body rateLimitUpdate
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "invalid body"}`))
			return
		}

		limit := rl.Limit()
		if body.Limit != nil {
			limit = *body.Limit
		}
		per := rl.Window()
		if body.Window != nil {
			d, err := time.ParseDuration(*body.Window)
			if err != nil {
				w.WriteHeader(http.StatusBadRequest)
				w.Write([]byte(`{"error": "invalid window"}`))
				return
			}
			per = d
		}

		rl.SetLimits(limit, per)

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]any{
			"limit":  rl.Limit(),
			"window": rl.Window().String(),
		})
	}
}
