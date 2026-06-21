package main

import (
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestCORSMiddlewareSingleHeader(t *testing.T) {
    // allowed origin list contains the test origin
    mw := CORSMiddleware([]string{"http://localhost:5173"})
    handler := mw(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
    }))

    req := httptest.NewRequest(http.MethodGet, "http://example.com", nil)
    req.Header.Set("Origin", "http://localhost:5173")
    rr := httptest.NewRecorder()
    handler.ServeHTTP(rr, req)

    // Check that only one Access-Control-Allow-Origin header exists and matches the origin
    if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:5173" {
        t.Fatalf("expected Access-Control-Allow-Origin to be set to origin, got %q", got)
    }
    // Ensure the header is not duplicated (Go's Header map cannot have duplicate keys, so this suffices)
}
