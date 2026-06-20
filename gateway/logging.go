package main

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5/middleware"
)

func RequestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrap response writer to capture status code
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)

		next.ServeHTTP(ww, r)

		log.Printf(
			"%s %s %d %s %s",
			r.Method,
			r.URL.Path,
			ww.Status(),
			time.Since(start).Round(time.Millisecond),
			r.RemoteAddr,
		)
	})
}
