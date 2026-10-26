package handlers

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestStrictJSONBoundary(t *testing.T) {
	for _, tc := range []struct {
		body, content string
		want          int
	}{
		{`{"name":"ok"}`, "application/json", 200}, {`{"admin":true}`, "application/json", 400},
		{`{"name":"ok"}{}`, "application/json", 400}, {`{"name":"ok"}`, "text/plain", 415},
		{`{"name":"` + strings.Repeat("a", 70<<10) + `"}`, "application/json", 413},
	} {
		r := httptest.NewRequest("POST", "/", strings.NewReader(tc.body))
		r.Header.Set("Content-Type", tc.content)
		w := httptest.NewRecorder()
		var in struct {
			Name string `json:"name"`
		}
		decodeJSON(w, r, &in)
		if w.Code != tc.want {
			t.Errorf("got %d want %d", w.Code, tc.want)
		}
	}
}
