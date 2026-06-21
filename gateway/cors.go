package main

import (
	"log" // Не забываем импортировать log
	"net/http"
	"strings"
)

func CORSMiddleware(allowedOrigins []string) func(http.Handler) http.Handler {
    originSet := make(map[string]bool)
    allowAll := false
    for _, o := range allowedOrigins {
        trimmed := strings.TrimSpace(o)
        if trimmed == "*" {
            allowAll = true
        }
        originSet[trimmed] = true
    }
    log.Printf("CORS init: allowAll=%v origins=%v", allowAll, allowedOrigins)

    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            origin := r.Header.Get("Origin")
            log.Printf("CORS request: origin=%q method=%s path=%s inSet=%v",
                origin, r.Method, r.URL.Path, originSet[origin])

			if allowAll && origin != "" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			} else if originSet[origin] {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			} else if allowAll && origin == "" {
				w.Header().Set("Access-Control-Allow-Origin", "*")
			}

			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Internal-Key")
			w.Header().Set("Access-Control-Max-Age", "3600")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}