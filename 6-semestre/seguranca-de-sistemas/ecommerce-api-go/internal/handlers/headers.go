package handlers

import (
	"fmt"
	"net/http"
)

func (h *Handler) Headers(w http.ResponseWriter, r *http.Request) {
	for name, values := range r.Header {
		for _, value := range values {
			fmt.Fprintf(w, "%s: %s\n", name, value)
		}
	}
}
