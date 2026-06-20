package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/go-chi/chi/v5"
)

// ProxyRoute returns a chi route handler that proxies all requests to the target URL.
// It strips the route prefix (e.g., /api/airport) before forwarding.
func ProxyRoute(target string) func(chi.Router) {
	targetURL, err := url.Parse(target)
	if err != nil {
		log.Fatalf("Invalid proxy target URL: %s", target)
	}

	proxy := httputil.NewSingleHostReverseProxy(targetURL)

	// Custom error handler — return 502 if backend is unreachable
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("Proxy error for %s: %v", r.URL.Path, err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		w.Write([]byte(`{"error": "Service unavailable"}`))
	}

	// Flush immediately — critical for SSE passthrough from Broadcast service
	proxy.FlushInterval = -1

	return func(r chi.Router) {
		r.HandleFunc("/*", func(w http.ResponseWriter, req *http.Request) {
			// Get the wildcard part after /api/<service>
			wildcardPath := chi.URLParam(req, "*")
			if wildcardPath == "" {
				wildcardPath = "/"
			} else if !strings.HasPrefix(wildcardPath, "/") {
				wildcardPath = "/" + wildcardPath
			}

			// Rewrite the request to target the backend
			req.URL.Scheme = targetURL.Scheme
			req.URL.Host = targetURL.Host
			req.URL.Path = wildcardPath
			req.Host = targetURL.Host

			// Query parameters are preserved automatically (req.URL.RawQuery unchanged)

			proxy.ServeHTTP(w, req)
		})
	}
}
