package queryparams

import (
	"net/url"
	"strings"
	"testing"

	"ecommerce-api-go/internal/validation"
)

// Fuzzing explora formatos/bytes inesperados além dos exemplos escritos manualmente.
func FuzzParse(f *testing.F) {
	for _, raw := range []string{"", "page=1&size=20", "page=999999999999999999999999999", "size=-1", "queryparam=%00", "queryparam=%FF", "field=name%3BDROP+TABLE+users"} {
		f.Add(raw)
	}
	f.Fuzz(func(t *testing.T, raw string) {
		values, err := url.ParseQuery(raw)
		if err != nil {
			return
		}
		p, err := Parse(values)
		if err != nil {
			return
		}
		if p.Page < 1 || p.Page > 10000 || p.Size < 1 || p.Size > 100 || p.Offset() < 0 || len(p.Query) > 120 || !validation.PlainText(p.Query) {
			t.Fatalf("unbounded input accepted: %+v", p)
		}
		switch p.Field {
		case "all", "name", "description", "sku":
		default:
			t.Fatal("untrusted field accepted")
		}
	})
}

func TestBulkProductIDsAreBoundedAndValidated(t *testing.T) {
	id := "00000000-0000-0000-0000-000000000001"
	for _, raw := range []string{"' OR 1=1", strings.Repeat(id+",", 50) + id, "{" + id + "}"} {
		if _, err := Parse(url.Values{"ids": {raw}}); err == nil {
			t.Fatal("invalid IDs accepted")
		}
	}
	p, err := Parse(url.Values{"ids": {id}, "queryparam": {"ssd"}})
	if err != nil || len(p.IDs) != 1 || p.Size != 50 || p.Query != "ssd" {
		t.Fatal(p, err)
	}
}
