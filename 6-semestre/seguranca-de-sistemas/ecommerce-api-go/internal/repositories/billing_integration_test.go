package repositories_test

import (
	"bytes"
	"context"
	"database/sql"
	"ecommerce-api-go/internal/billing"
	"ecommerce-api-go/internal/database"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/orders"
	"ecommerce-api-go/internal/repositories"
	"ecommerce-api-go/internal/secrets"
	"ecommerce-api-go/internal/validation"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5"
	"sync"
	"testing"
	"time"
)

// Bypass de senha EXCLUSIVO de fixtures de persistência. O teste HTTP usa auth real.
type fixtureReauth struct{}

func (fixtureReauth) Reauthenticate(context.Context, string, string) error { return nil }
func testBilling(t *testing.T, db *sql.DB) billing.Service {
	t.Helper()
	v, err := secrets.New(bytes.Repeat([]byte{42}, 32))
	if err != nil {
		t.Fatal(err)
	}
	return billing.Service{Store: repositories.BillingStore{DB: db}, Auth: fixtureReauth{}, Vault: v}
}
func seedBilling(t *testing.T, db *sql.DB, user string) string {
	t.Helper()
	svc := testBilling(t, db)
	if _, err := svc.SaveProfile(context.Background(), user, models.ProfileInput{CPF: "52998224725", Phone: "11999999999"}); err != nil {
		t.Fatal(err)
	}
	c, err := svc.AddCard(context.Background(), user, models.CardInput{Number: "4242424242424242", HolderName: "ALUNO TESTE", ExpMonth: 12, ExpYear: time.Now().UTC().Year() + 2})
	if err != nil {
		t.Fatal(err)
	}
	return c.ID
}
func TestCardsEncryptionOwnershipExpiryAndSnapshots(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	svc := testBilling(t, db)
	repo := repositories.OrderStore{DB: db}
	orderService := orders.Service{Store: repo}
	var owner, other, product string
	for email, target := range map[string]*string{"billing1@test.com": &owner, "billing2@test.com": &other} {
		if err := db.QueryRow(`INSERT INTO users(email,password_hash,name) VALUES($1,'hash','Teste') RETURNING id`, email).Scan(target); err != nil {
			t.Fatal(err)
		}
	}
	cardID := seedBilling(t, db, owner)
	otherCard := seedBilling(t, db, other)
	var number, holder []byte
	var fingerprint string
	if err := db.QueryRow(`SELECT number_cipher,holder_cipher,fingerprint FROM credit_cards WHERE id=$1`, cardID).Scan(&number, &holder, &fingerprint); err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(number, []byte("424242")) || bytes.Contains(holder, []byte("ALUNO")) {
		t.Fatal("plaintext card stored")
	}
	if pan, err := svc.Vault.Open(number, "card:"+owner+":"+fingerprint+":number"); err != nil || pan != "4242424242424242" {
		t.Fatal("encryption failed", err)
	}
	var cpf, phone []byte
	if err := db.QueryRow(`SELECT cpf_cipher,phone_cipher FROM user_profiles WHERE user_id=$1`, owner).Scan(&cpf, &phone); err != nil {
		t.Fatal(err)
	}
	if bytes.Contains(cpf, []byte("529982")) || bytes.Contains(phone, []byte("999999")) {
		t.Fatal("plaintext profile stored")
	}
	masked, err := svc.Profile(ctx, owner)
	if err != nil || !masked.Complete || masked.CPFMasked != "***.***.***-25" {
		t.Fatal(masked, err)
	}
	cards, err := svc.Cards(ctx, owner)
	if err != nil || len(cards) != 1 || cards[0].ID != cardID {
		t.Fatal("card list ownership", err)
	}
	raw, _ := json.Marshal(cards)
	if bytes.Contains(raw, []byte("42424242")) || bytes.Contains(raw, []byte("cipher")) || bytes.Contains(raw, []byte("fingerprint")) {
		t.Fatal("card response leaks")
	}
	if err = svc.ArchiveCard(ctx, other, cardID, ""); !errors.Is(err, models.ErrNotFound) {
		t.Fatal("IDOR archive", err)
	}
	a, err := (repositories.AddressStore{DB: db}).Save(ctx, owner, "", address())
	if err != nil {
		t.Fatal(err)
	}
	if err = db.QueryRow(`INSERT INTO products(name,slug,price,stock_quantity) VALUES('Teste','card-test',10,3) RETURNING id`).Scan(&product); err != nil {
		t.Fatal(err)
	}
	input := models.CreateOrder{AddressID: a.ID, CreditCardID: otherCard, Items: []models.OrderItemInput{{ProductID: product, Quantity: 1}}}
	if _, err = orderService.Create(ctx, owner, input); !errors.Is(err, models.ErrNotFound) {
		t.Fatal("IDOR checkout", err)
	}
	input.CreditCardID = cardID
	if _, err = db.Exec(`UPDATE credit_cards SET exp_year=2000 WHERE id=$1`, cardID); err != nil {
		t.Fatal(err)
	}
	if _, err = orderService.Create(ctx, owner, input); !errors.Is(err, models.ErrNotFound) {
		t.Fatal("expired card accepted", err)
	}
	if _, err = db.Exec(`UPDATE credit_cards SET exp_year=$2 WHERE id=$1`, cardID, time.Now().UTC().Year()+2); err != nil {
		t.Fatal(err)
	}
	o, err := orderService.Create(ctx, owner, input)
	if err != nil {
		t.Fatal(err)
	}
	if o.CreditCardID == nil || *o.CreditCardID != cardID || o.CardLast4 != "4242" || o.CardBrand != "Visa" {
		t.Fatal("bad card snapshot")
	}
	if _, err = db.Exec(`UPDATE orders SET credit_card_id=$1 WHERE id=$2`, otherCard, o.ID); err == nil {
		t.Fatal("ownership FK missing")
	}
	if err = svc.ArchiveCard(ctx, owner, cardID, ""); err != nil {
		t.Fatal(err)
	}
	var purged bool
	if err = db.QueryRow(`SELECT archived_at IS NOT NULL AND number_cipher IS NULL AND holder_cipher IS NULL FROM credit_cards WHERE id=$1`, cardID).Scan(&purged); err != nil || !purged {
		t.Fatal("card secrets not purged", err)
	}
	if _, err = orderService.Create(ctx, owner, input); !errors.Is(err, models.ErrNotFound) {
		t.Fatal("archived card accepted", err)
	}
	history, err := repo.ByID(ctx, owner, o.ID)
	if err != nil || history.CardLast4 != "4242" {
		t.Fatal("history lost", err)
	}
	if err = repo.Cancel(ctx, owner, o.ID); err != nil {
		t.Fatal("archived card prevents cancel", err)
	}
}
func TestCardQuotaIsConcurrentAndDuplicateIsRejected(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	svc := testBilling(t, db)
	var owner string
	if err := db.QueryRow(`INSERT INTO users(email,password_hash,name) VALUES('cardquota@test.com','hash','Teste') RETURNING id`).Scan(&owner); err != nil {
		t.Fatal(err)
	}
	card := models.CardInput{Number: "4242424242424242", HolderName: "TESTE", ExpMonth: 12, ExpYear: time.Now().UTC().Year() + 2}
	if _, err := svc.AddCard(ctx, owner, card); err != nil {
		t.Fatal(err)
	}
	if _, err := svc.AddCard(ctx, owner, card); err == nil {
		t.Fatal("duplicate accepted")
	}
	// Fixture criptografada distinta por índice; a quota é responsabilidade SQL.
	var wg sync.WaitGroup
	results := make(chan error, 15)
	for i := 0; i < 15; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			_, err := (repositories.BillingStore{DB: db}).AddCard(ctx, owner, models.ProtectedCard{Number: svc.Vault.Seal("test", "quota"), Holder: svc.Vault.Seal("test", "quota"), Fingerprint: fmt.Sprintf("%064d", n), Brand: "Visa", Last4: "4242", ExpMonth: 12, ExpYear: time.Now().UTC().Year() + 2})
			results <- err
		}(i)
	}
	wg.Wait()
	close(results)
	success := 1
	for err := range results {
		if err == nil {
			success++
		} else if !errors.Is(err, validation.ErrInput) {
			t.Fatal(err)
		}
	}
	cards, err := svc.Cards(ctx, owner)
	if err != nil || success != 10 || len(cards) != 10 {
		t.Fatalf("quota bypass: successes=%d cards=%d err=%v", success, len(cards), err)
	}
}

func TestDataKeyBindingRejectsReplacementAndMissingCanary(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	svc := testBilling(t, db)
	if err := database.BindDataKey(ctx, db, svc.Vault); err != nil {
		t.Fatal(err)
	}
	if err := database.BindDataKey(ctx, db, svc.Vault); err != nil {
		t.Fatal("repeated startup failed", err)
	}
	other, _ := secrets.New(bytes.Repeat([]byte{99}, 32))
	if err := database.BindDataKey(ctx, db, other); err == nil {
		t.Fatal("wrong data key accepted")
	}
	var user string
	if err := db.QueryRow(`INSERT INTO users(email,password_hash,name) VALUES('key@test.com','hash','Teste') RETURNING id`).Scan(&user); err != nil {
		t.Fatal(err)
	}
	seedBilling(t, db, user)
	if _, err := db.Exec(`DELETE FROM data_key_checks`); err != nil {
		t.Fatal(err)
	}
	if err := database.BindDataKey(ctx, db, svc.Vault); err == nil {
		t.Fatal("missing canary silently regenerated over existing data")
	}
}

func TestBillingWithDocumentedRuntimePrivileges(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)
	var schema string
	if err := db.QueryRow(`SELECT current_schema()`).Scan(&schema); err != nil {
		t.Fatal(err)
	}
	role := pgx.Identifier{fmt.Sprintf("billing_runtime_%d", time.Now().UnixNano())}.Sanitize()
	if _, err := db.Exec(`CREATE ROLE ` + role + ` NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE`); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() {
		db.Exec(`RESET ROLE`)
		if _, err := db.Exec(`DROP OWNED BY ` + role); err != nil {
			t.Error(err)
		}
		if _, err := db.Exec(`DROP ROLE ` + role); err != nil {
			t.Error(err)
		}
	})
	schemaID := pgx.Identifier{schema}.Sanitize()
	for _, statement := range []string{
		`GRANT USAGE ON SCHEMA ` + schemaID + ` TO ` + role,
		`GRANT SELECT ON ALL TABLES IN SCHEMA ` + schemaID + ` TO ` + role,
		`GRANT INSERT,UPDATE ON users,sessions,orders,order_items,user_addresses,user_profiles,credit_cards TO ` + role,
		`GRANT INSERT ON audit_logs,data_key_checks TO ` + role,
	} {
		if _, err := db.Exec(statement); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := db.Exec(`SET ROLE ` + role); err != nil {
		t.Fatal(err)
	}
	var user string
	if err := db.QueryRow(`INSERT INTO users(email,password_hash,name) VALUES('runtime@test.com','hash','Teste') RETURNING id`).Scan(&user); err != nil {
		t.Fatal(err)
	}
	svc := testBilling(t, db)
	if err := database.BindDataKey(ctx, db, svc.Vault); err != nil {
		t.Fatal(err)
	}
	cardID := seedBilling(t, db, user)
	if err := svc.ArchiveCard(ctx, user, cardID, ""); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`UPDATE data_key_checks SET check_cipher=check_cipher`); err == nil {
		t.Fatal("runtime can overwrite key canary")
	}
	if _, err := db.Exec(`DROP TABLE user_profiles`); err == nil {
		t.Fatal("runtime has DDL")
	}
}
