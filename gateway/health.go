package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

type serviceHealth struct {
	Status  string `json:"status"`
	Latency string `json:"latency"`
}

func HealthHandler(cfg Config) http.HandlerFunc {
	allServices := map[string]string{
		"airport":   cfg.AirportServiceURL,
		"hotel":     cfg.HotelServiceURL,
		"beach":     cfg.BeachServiceURL,
		"broadcast": cfg.BroadcastServiceURL,
		"parrot":    cfg.ParrotServiceURL,
	}

	// Only check services that are configured
	services := make(map[string]string)
	for name, url := range allServices {
		if url != "" {
			services[name] = url
		}
	}

	return func(w http.ResponseWriter, r *http.Request) {
		results := make(map[string]serviceHealth)
		var mu sync.Mutex
		var wg sync.WaitGroup

		// Check all services concurrently
		for name, url := range services {
			wg.Add(1)
			go func(name, url string) {
				defer wg.Done()

				start := time.Now()
				client := &http.Client{Timeout: 3 * time.Second}

				resp, err := client.Get(fmt.Sprintf("%s/health", url))
				latency := time.Since(start).Round(time.Millisecond).String()

				status := "unhealthy"
				if err == nil && resp.StatusCode == http.StatusOK {
					status = "healthy"
					resp.Body.Close()
				}

				mu.Lock()
				results[name] = serviceHealth{Status: status, Latency: latency}
				mu.Unlock()
			}(name, url)
		}

		wg.Wait()

		// Overall status: healthy only if all services are healthy
		overall := "healthy"
		for _, sh := range results {
			if sh.Status != "healthy" {
				overall = "degraded"
				break
			}
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":   overall,
			"services": results,
		})
	}
}
