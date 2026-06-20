package main

import (
	"net/http"
	"os"
)

// AuthMiddleware admits service-to-service calls that present a valid
// X-Internal-Key and passes all other requests through to the next handler.
func AuthMiddleware(next http.Handler) http.Handler {
	internalSecret := os.Getenv("INTERNAL_SECRET")

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Service-to-service calls with a valid internal key are allowed.
		if key := r.Header.Get("X-Internal-Key"); key != "" && key == internalSecret {
			next.ServeHTTP(w, r)
			return
		}

		next.ServeHTTP(w, r)
	})
}
