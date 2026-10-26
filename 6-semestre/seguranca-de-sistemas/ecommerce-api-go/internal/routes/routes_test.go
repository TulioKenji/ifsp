package routes

import (
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/handlers"
	"ecommerce-api-go/internal/models"
)

func TestSPAFallbackAndAPIIsolation(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "index.html"), []byte("<main>SPA</main>"), 0600); err != nil {
		t.Fatal(err)
	}
	h := New(handlers.New(auth.Service{}, models.ProductModel{}), handlers.OrderHandler{}, handlers.AddressHandler{}, handlers.BillingHandler{}, dir)
	for _, tc := range []struct {
		path string
		want int
		spa  bool
	}{
		{"/pedidos/a", 200, true}, {"/assets/missing.js", 404, false}, {"/.env", 404, false},
		{"/api/unknown", 404, false}, {"/api/orders", 401, false}, {"/api/addresses", 401, false}, {"/api/profile", 401, false}, {"/api/cards", 401, false}, {"/cart", 200, true},
	} {
		r := httptest.NewRequest("GET", tc.path, nil)
		r.Header.Set("Accept", "text/html")
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		if w.Code != tc.want || strings.Contains(w.Body.String(), "<main>SPA</main>") != tc.spa {
			t.Errorf("%s: %d %s", tc.path, w.Code, w.Body)
		}
	}
}
