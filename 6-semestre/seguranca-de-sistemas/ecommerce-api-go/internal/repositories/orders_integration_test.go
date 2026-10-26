package repositories_test

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"

	"ecommerce-api-go/internal/addresses"
	"ecommerce-api-go/internal/auth"
	"ecommerce-api-go/internal/handlers"
	"ecommerce-api-go/internal/middleware"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/orders"
	"ecommerce-api-go/internal/repositories"
	"ecommerce-api-go/internal/routes"
)

// Cada teste cria e remove seu próprio schema. Nunca lê DATABASE_URL do projeto.
func testDB(t *testing.T) *sql.DB {
	t.Helper()
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("defina TEST_DATABASE_URL para executar integração com PostgreSQL")
	}
	cfg, err := pgx.ParseConfig(dsn)
	if err != nil {
		t.Fatal(err)
	}
	admin := stdlib.OpenDB(*cfg)
	schema := fmt.Sprintf("orders_test_%d", time.Now().UnixNano())
	if _, err = admin.Exec(`CREATE SCHEMA ` + schema); err != nil {
		admin.Close()
		t.Fatal(err)
	}
	cfg.RuntimeParams["search_path"] = schema + ",public"
	db := stdlib.OpenDB(*cfg)
	db.SetMaxOpenConns(8)
	t.Cleanup(func() {
		db.Close()
		if _, err := admin.Exec(`DROP SCHEMA ` + schema + ` CASCADE`); err != nil {
			t.Error(err)
		}
		admin.Close()
	})
	script, err := os.ReadFile("../../db/db.sql")
	if err != nil {
		t.Fatal(err)
	}
	if _, err = db.Exec(string(script)); err != nil {
		t.Fatal(err)
	}
	return db
}

func address() models.Address {
	return models.Address{RecipientName: "Ana", PostalCode: "12345-678", Street: "Rua", Number: "1", Neighborhood: "Centro", City: "Cidade", State: "SP", Country: "BR"}
}

func TestOrdersTransactionOwnershipAndConcurrentStock(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	store := repositories.OrderStore{DB: db}
	service := orders.Service{Store: store}
	var owner, other, product string
	if err := db.QueryRow(`INSERT INTO users(email,password_hash,name) VALUES ('a@test.com','hash','Ana') RETURNING id`).Scan(&owner); err != nil {
		t.Fatal(err)
	}
	if err := db.QueryRow(`INSERT INTO users(email,password_hash,name) VALUES ('b@test.com','hash','Bia') RETURNING id`).Scan(&other); err != nil {
		t.Fatal(err)
	}
	if err := db.QueryRow(`INSERT INTO products(name,slug,price,stock_quantity) VALUES ('Produto','produto',19.90,1) RETURNING id`).Scan(&product); err != nil {
		t.Fatal(err)
	}
	saved, err := (repositories.AddressStore{DB: db}).Save(ctx, owner, "", address())
	if err != nil {
		t.Fatal(err)
	}
	in := models.CreateOrder{AddressID: saved.ID, CreditCardID: seedBilling(t, db, owner), Items: []models.OrderItemInput{{ProductID: product, Quantity: 1}}}
	var wg sync.WaitGroup
	results := make(chan models.Order, 2)
	failures := make(chan error, 2)
	for i := 0; i < 2; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			input := in
			input.Items = append([]models.OrderItemInput(nil), in.Items...)
			o, err := service.Create(ctx, owner, input)
			if err != nil {
				failures <- err
			} else {
				results <- o
			}
		}()
	}
	wg.Wait()
	close(results)
	close(failures)
	if len(results) != 1 || len(failures) != 1 {
		for err := range failures {
			t.Logf("create error: %v", err)
		}
		t.Fatalf("oversell/rollback: success=%d failure=%d", len(results), len(failures))
	}
	for err := range failures {
		if !errors.Is(err, orders.ErrConflict) {
			t.Fatal(err)
		}
	}
	o := <-results
	if o.Total != "19.90" || len(o.Items) != 1 || o.Items[0].UnitPrice != "19.90" {
		t.Fatalf("snapshot: %+v", o)
	}
	if _, err := store.ByID(ctx, other, o.ID); !errors.Is(err, models.ErrNotFound) {
		t.Fatalf("IDOR read: %v", err)
	}
	if _, err := store.UpdateAddress(ctx, other, o.ID, saved.ID); !errors.Is(err, models.ErrNotFound) {
		t.Fatalf("IDOR update: %v", err)
	}
	if err := store.Cancel(ctx, other, o.ID); !errors.Is(err, models.ErrNotFound) {
		t.Fatalf("IDOR delete: %v", err)
	}
	items, total, err := store.List(ctx, owner, 1, 10)
	if err != nil || total != 1 || len(items) != 1 {
		t.Fatalf("list %v %d %+v", err, total, items)
	}
	items, total, err = store.List(ctx, owner, 2, 10)
	if err != nil || total != 1 || len(items) != 0 {
		t.Fatalf("empty page loses total: %v %d", err, total)
	}
	updated := address()
	updated.City = "Outra cidade"
	saved, err = (repositories.AddressStore{DB: db}).Save(ctx, owner, saved.ID, updated)
	if err != nil {
		t.Fatal(err)
	}
	o, err = store.UpdateAddress(ctx, owner, o.ID, saved.ID)
	if err != nil || o.ShippingAddress.City != updated.City {
		t.Fatalf("update: %v %+v", err, o)
	}
	if _, err = db.Exec(`UPDATE products SET price=99.99 WHERE id=$1`, product); err != nil {
		t.Fatal(err)
	}
	o, err = store.ByID(ctx, owner, o.ID)
	if err != nil || o.Total != "19.90" {
		t.Fatalf("historical price changed: %v %+v", err, o)
	}
	cancelResults := make(chan error, 2)
	for i := 0; i < 2; i++ {
		wg.Add(1)
		go func() { defer wg.Done(); cancelResults <- store.Cancel(ctx, owner, o.ID) }()
	}
	wg.Wait()
	close(cancelResults)
	success := 0
	for err := range cancelResults {
		if err == nil {
			success++
		} else if !errors.Is(err, orders.ErrConflict) {
			t.Fatal(err)
		}
	}
	var stock, count int
	if err = db.QueryRow(`SELECT stock_quantity FROM products WHERE id=$1`, product).Scan(&stock); err != nil {
		t.Fatal(err)
	}
	if err = db.QueryRow(`SELECT COUNT(*) FROM orders`).Scan(&count); err != nil {
		t.Fatal(err)
	}
	if success != 1 || stock != 1 || count != 1 {
		t.Fatalf("cancel/rollback: successes=%d stock=%d orders=%d", success, stock, count)
	}
	if _, err = store.UpdateAddress(ctx, owner, o.ID, saved.ID); !errors.Is(err, orders.ErrConflict) {
		t.Fatal("cancelled order edited", err)
	}
}

func TestHTTPStatefulSessionAndCRUD(t *testing.T) {
	db := testDB(t)
	service := auth.Service{Users: models.UserModel{DB: db}, Sessions: models.SessionModel{DB: db}}
	billingService := testBilling(t, db)
	billingService.Auth = service
	h := middleware.CORS([]string{"http://localhost:5173"}, routes.New(handlers.New(service, models.ProductModel{DB: db}), handlers.OrderHandler{Service: orders.Service{Store: repositories.OrderStore{DB: db}}}, handlers.AddressHandler{Service: addresses.Service{Store: repositories.AddressStore{DB: db}}}, handlers.BillingHandler{Service: billingService}, t.TempDir()))
	var cookie *http.Cookie
	var csrf string
	request := func(method, path, body string, withCSRF bool) *httptest.ResponseRecorder {
		r := httptest.NewRequest(method, "http://localhost:8080"+path, strings.NewReader(body))
		r.RemoteAddr = "127.0.0.1:23456"
		r.Header.Set("Origin", "http://localhost:5173")
		r.Header.Set("Content-Type", "application/json")
		if cookie != nil {
			r.AddCookie(cookie)
		}
		if withCSRF {
			r.Header.Set("X-CSRF-Token", csrf)
		}
		w := httptest.NewRecorder()
		h.ServeHTTP(w, r)
		return w
	}
	check := func(w *httptest.ResponseRecorder, status int) {
		t.Helper()
		if w.Code != status {
			t.Fatalf("want %d got %d: %s", status, w.Code, w.Body)
		}
	}
	credentials := `{"email":"ana@test.com","password":"a-very-long-password","name":"Ana"}`
	check(request("GET", "/api/orders", "", false), 401)
	check(request("POST", "/api/auth/register", credentials, false), 201)
	login := request("POST", "/api/auth/login", credentials, false)
	check(login, 200)
	if len(login.Result().Cookies()) != 1 {
		t.Fatal("missing session cookie")
	}
	cookie = login.Result().Cookies()[0]
	if !cookie.HttpOnly || cookie.SameSite != http.SameSiteLaxMode {
		t.Fatal("unsafe cookie flags")
	}
	var identity map[string]string
	if err := json.Unmarshal(login.Body.Bytes(), &identity); err != nil {
		t.Fatal(err)
	}
	csrf = identity["csrf_token"]
	check(request("GET", "/api/auth/session", "", false), 200)
	profileBody := `{"cpf":"529.982.247-25","phone":"(11) 99999-9999","current_password":"a-very-long-password"}`
	check(request("PUT", "/api/profile", profileBody, false), 403)
	check(request("PUT", "/api/profile", profileBody, true), 200)
	check(request("GET", "/api/profile", "", false), 200)
	cardBody, _ := json.Marshal(models.CardInput{Number: "4242424242424242", HolderName: "ALUNO TESTE", ExpMonth: 12, ExpYear: time.Now().UTC().Year() + 2, CurrentPassword: "a-very-long-password"})
	createdCard := request("POST", "/api/cards", string(cardBody), true)
	check(createdCard, 201)
	var card models.CreditCard
	if err := json.Unmarshal(createdCard.Body.Bytes(), &card); err != nil {
		t.Fatal(err)
	}
	check(request("GET", "/api/cards", "", false), 200)
	check(request("POST", "/api/cards", strings.TrimSuffix(string(cardBody), "}")+`,"cvv":"123"}`, true), 400)
	check(request("POST", "/api/auth/logout", "", false), 403)
	var product string
	if err := db.QueryRow(`INSERT INTO products(name,slug,price,stock_quantity) VALUES ('Teste','teste',10.50,3) RETURNING id`).Scan(&product); err != nil {
		t.Fatal(err)
	}
	aBody, _ := json.Marshal(address())
	check(request("POST", "/api/addresses", string(aBody), false), 403)
	createdAddress := request("POST", "/api/addresses", string(aBody), true)
	check(createdAddress, 201)
	var saved models.SavedAddress
	if err := json.Unmarshal(createdAddress.Body.Bytes(), &saved); err != nil {
		t.Fatal(err)
	}
	check(request("GET", "/api/addresses", "", false), 200)
	check(request("PUT", "/api/addresses/"+saved.ID, string(aBody), true), 200)
	body, _ := json.Marshal(models.CreateOrder{Items: []models.OrderItemInput{{ProductID: product, Quantity: 2}}, AddressID: saved.ID, CreditCardID: card.ID})
	check(request("POST", "/api/orders", string(body), false), 403)
	created := request("POST", "/api/orders", string(body), true)
	check(created, 201)
	var order models.Order
	if err := json.Unmarshal(created.Body.Bytes(), &order); err != nil {
		t.Fatal(err)
	}
	check(request("GET", "/api/orders/"+order.ID, "", false), 200)
	check(request("GET", "/api/orders", "", false), 200)
	update, _ := json.Marshal(map[string]any{"address_id": saved.ID})
	check(request("PUT", "/api/orders/"+order.ID, string(update), true), 200)
	check(request("DELETE", "/api/orders/"+order.ID, "", true), 204)
	check(request("DELETE", "/api/orders/"+order.ID, "", true), 409)
	check(request("DELETE", "/api/addresses/"+saved.ID, "", true), 204)
	check(request("DELETE", "/api/cards/"+card.ID, `{"current_password":"wrong-password-long"}`, true), 403)
	check(request("DELETE", "/api/cards/"+card.ID, `{"current_password":"a-very-long-password"}`, true), 204)
	check(request("POST", "/api/auth/logout", "", true), 204)
	check(request("GET", "/api/orders", "", false), 401)
}

func TestSessionLifecycleAndLoginLockout(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	svc := auth.Service{Users: models.UserModel{DB: db}, Sessions: models.SessionModel{DB: db}}
	user, err := svc.Register(ctx, "session@test.com", "test-password-long", "Teste")
	if err != nil {
		t.Fatal(err)
	}
	var first, last string
	for i := 0; i < 7; i++ {
		_, session, token, err := svc.Login(ctx, user.Email, "test-password-long")
		if err != nil {
			t.Fatal(err)
		}
		if i == 0 {
			first = token
		}
		last = token
		if session.TokenHash == token || session.TokenHash != auth.TokenHash(token) {
			t.Fatal("raw token persisted")
		}
	}
	var active int
	if err = db.QueryRow(`SELECT COUNT(*) FROM sessions WHERE user_id=$1 AND revoked_at IS NULL AND expires_at>NOW()`, user.ID).Scan(&active); err != nil || active != 5 {
		t.Fatalf("session cap: %d %v", active, err)
	}
	if _, _, err = svc.Authenticate(ctx, first); !errors.Is(err, models.ErrNotFound) {
		t.Fatal("old session not revoked", err)
	}
	if _, _, err = svc.Authenticate(ctx, last); err != nil {
		t.Fatal(err)
	}
	if _, err = db.Exec(`UPDATE users SET status='blocked' WHERE id=$1`, user.ID); err != nil {
		t.Fatal(err)
	}
	if _, _, err = svc.Authenticate(ctx, last); !errors.Is(err, auth.ErrInvalidCredentials) {
		t.Fatal("blocked account accepted", err)
	}
	if _, err = db.Exec(`UPDATE users SET status='active' WHERE id=$1`, user.ID); err != nil {
		t.Fatal(err)
	}
	if _, err = db.Exec(`UPDATE sessions SET expires_at=created_at+INTERVAL '1 millisecond' WHERE token_hash=$1`, auth.TokenHash(last)); err != nil {
		t.Fatal(err)
	}
	if _, _, err = svc.Authenticate(ctx, last); !errors.Is(err, models.ErrNotFound) {
		t.Fatal("expired session accepted", err)
	}
	for i := 0; i < 5; i++ {
		if _, _, _, err = svc.Login(ctx, user.Email, "wrong-password-long"); !errors.Is(err, auth.ErrInvalidCredentials) {
			t.Fatal(err)
		}
	}
	if _, _, _, err = svc.Login(ctx, user.Email, "test-password-long"); !errors.Is(err, auth.ErrInvalidCredentials) {
		t.Fatal("locked account logged in", err)
	}
	if _, err = db.Exec(`UPDATE users SET locked_until=NOW()-INTERVAL '1 second' WHERE id=$1`, user.ID); err != nil {
		t.Fatal(err)
	}
	if _, _, _, err = svc.Login(ctx, user.Email, "test-password-long"); err != nil {
		t.Fatal("lock did not expire", err)
	}
	if err = svc.Sessions.Prune(ctx); err != nil {
		t.Fatal(err)
	}
	var expired int
	if err = db.QueryRow(`SELECT COUNT(*) FROM sessions WHERE expires_at<=NOW()`).Scan(&expired); err != nil || expired != 0 {
		t.Fatal("expired sessions not pruned", err)
	}
}
