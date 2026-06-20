package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"
	"sync/atomic"

	"github.com/go-chi/chi/v5"
)

// ProxyPool round-robins requests across a set of backend instances using a
// lock-free atomic counter.
type ProxyPool struct {
	proxies []*httputil.ReverseProxy
	targets []*url.URL
	next    uint32 // atomic counter
}

// NewProxyPool builds one reverse proxy per target, matching the single-host
// proxy configured in proxy.go (SSE-friendly flush + JSON 502 on failure).
func NewProxyPool(targets []string) *ProxyPool {
	p := &ProxyPool{}
	for _, target := range targets {
		targetURL, err := url.Parse(target)
		if err != nil {
			log.Fatalf("Invalid proxy target URL: %s", target)
		}

		proxy := httputil.NewSingleHostReverseProxy(targetURL)
		proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
			log.Printf("Proxy error for %s: %v", r.URL.Path, err)
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadGateway)
			w.Write([]byte(`{"error": "Service unavailable"}`))
		}
		// Flush immediately — critical for SSE passthrough.
		proxy.FlushInterval = -1

		p.proxies = append(p.proxies, proxy)
		p.targets = append(p.targets, targetURL)
	}
	return p
}

// pick returns the index of the next backend, round-robin.
func (p *ProxyPool) pick() int {
	n := atomic.AddUint32(&p.next, 1) - 1
	return int(n % uint32(len(p.proxies)))
}

// PooledProxyRoute returns a chi route handler that round-robins requests across
// the target pool. It strips the route prefix (e.g. /api/parrot) before
// forwarding, mirroring ProxyRoute.
func PooledProxyRoute(targets []string) func(chi.Router) {
	pool := NewProxyPool(targets)

	return func(r chi.Router) {
		r.HandleFunc("/*", func(w http.ResponseWriter, req *http.Request) {
			wildcardPath := chi.URLParam(req, "*")
			if wildcardPath == "" {
				wildcardPath = "/"
			} else if !strings.HasPrefix(wildcardPath, "/") {
				wildcardPath = "/" + wildcardPath
			}

			i := pool.pick()
			target := pool.targets[i]

			// Rewrite the request to target the chosen backend.
			req.URL.Scheme = target.Scheme
			req.URL.Host = target.Host
			req.URL.Path = wildcardPath
			req.Host = target.Host

			// Query parameters are preserved automatically (RawQuery unchanged).

			pool.proxies[i].ServeHTTP(w, req)
		})
	}
}
