package main

import (
	"context"
	"encoding/json"
	"flag"
	"log"
	"os"
	"time"

	"ecommerce-api-go/internal/loadtest"
)

func main() {
	o := loadtest.Options{}
	flag.StringVar(&o.URL, "url", "http://127.0.0.1:8080/api/products", "alvo GET autorizado")
	flag.IntVar(&o.Requests, "requests", 2000, "total limitado de requisições")
	flag.IntVar(&o.Concurrency, "concurrency", 16, "workers, máximo 64")
	flag.IntVar(&o.RPS, "rps", 0, "taxa global; 0 = rajada limitada por concorrência")
	flag.DurationVar(&o.Duration, "duration", 30*time.Second, "prazo máximo, até 60s")
	flag.BoolVar(&o.AllowRemote, "allow-remote", false, "permitir alvo remoto explicitamente autorizado")
	flag.Parse()
	r, err := loadtest.Run(context.Background(), o)
	if err != nil {
		log.Fatal(err)
	}
	encoder := json.NewEncoder(os.Stdout)
	encoder.SetIndent("", "  ")
	if err = encoder.Encode(r); err != nil {
		log.Fatal(err)
	}
	failed := r.NetworkErrors > 0 || r.Completed != r.Requested
	for status := range r.Statuses {
		if (status < 200 || status >= 300) && status != 429 && status != 503 {
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
