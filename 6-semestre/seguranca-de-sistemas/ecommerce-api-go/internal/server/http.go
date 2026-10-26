package server

import (
	"crypto/tls"
	"log"
	"net/http"
	"time"

	"ecommerce-api-go/internal/config"
	"ecommerce-api-go/internal/middleware"
)

func New(c config.Settings, next http.Handler) *http.Server {
	return &http.Server{
		Addr: c.Addr,
		Handler: middleware.Recover(log.Default(), middleware.SecurityHeaders(
			middleware.RateLimit(c.RatePerMinute, time.Minute, middleware.Concurrency(c.Inflight, middleware.LimitRequestBody(
				middleware.CORS(c.Origins, next),
			))),
		)),
		ReadHeaderTimeout: 3 * time.Second, ReadTimeout: 10 * time.Second, WriteTimeout: 10 * time.Second,
		IdleTimeout: 15 * time.Second, MaxHeaderBytes: 16 << 10,
		TLSConfig: &tls.Config{MinVersion: tls.VersionTLS12},
	}
}
