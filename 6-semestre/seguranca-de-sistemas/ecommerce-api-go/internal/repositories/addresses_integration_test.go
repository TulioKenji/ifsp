package repositories_test

import (
	"context"
	"errors"
	"sync"
	"testing"

	"ecommerce-api-go/internal/addresses"
	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/orders"
	"ecommerce-api-go/internal/repositories"
	"ecommerce-api-go/internal/validation"
)

func TestAddressOwnershipSnapshotsOptionsAndCoupon(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	agenda := addresses.Service{Store: repositories.AddressStore{DB: db}}
	store := repositories.OrderStore{DB: db}
	svc := orders.Service{Store: store}
	var owner, other, product string
	for email, target := range map[string]*string{"owner@test.com": &owner, "other@test.com": &other} {
		if err := db.QueryRow(`INSERT INTO users(email,password_hash,name) VALUES($1,'hash','Teste') RETURNING id`, email).Scan(target); err != nil {
			t.Fatal(err)
		}
	}
	a, err := agenda.Save(ctx, owner, "", address())
	if err != nil {
		t.Fatal(err)
	}
	otherAddress, err := agenda.Save(ctx, other, "", address())
	if err != nil {
		t.Fatal(err)
	}
	if _, err = agenda.Save(ctx, other, a.ID, address()); !errors.Is(err, models.ErrNotFound) {
		t.Fatalf("IDOR update: %v", err)
	}
	if err = agenda.Archive(ctx, other, a.ID); !errors.Is(err, models.ErrNotFound) {
		t.Fatalf("IDOR delete: %v", err)
	}
	if err = db.QueryRow(`INSERT INTO products(name,slug,price,stock_quantity,options) VALUES('Camiseta','camiseta',100.00,10,'{"tamanho":["M","G"],"cor":["Verde"]}') RETURNING id`).Scan(&product); err != nil {
		t.Fatal(err)
	}
	input := models.CreateOrder{AddressID: a.ID, CreditCardID: seedBilling(t, db, owner), CouponCode: " green10 ", Items: []models.OrderItemInput{
		{ProductID: product, Quantity: 2, Options: map[string]string{"tamanho": "M", "cor": "Verde"}},
		{ProductID: product, Quantity: 4, Options: map[string]string{"cor": "Verde", "tamanho": "G"}},
	}}
	input.AddressID = otherAddress.ID
	if _, err = svc.Create(ctx, owner, input); !errors.Is(err, models.ErrNotFound) {
		t.Fatalf("IDOR create: %v", err)
	}
	input.AddressID = a.ID
	input.Items[0].Options["cor"] = "<script>"
	if _, err = svc.Create(ctx, owner, input); !errors.Is(err, orders.ErrValidation) {
		t.Fatalf("invalid option: %v", err)
	}
	var stock, count int
	if err = db.QueryRow(`SELECT stock_quantity FROM products WHERE id=$1`, product).Scan(&stock); err != nil || stock != 10 {
		t.Fatalf("invalid order changed stock: %d %v", stock, err)
	}
	if err = db.QueryRow(`SELECT COUNT(*) FROM orders`).Scan(&count); err != nil || count != 0 {
		t.Fatal("invalid order persisted", count, err)
	}
	input.Items[0].Options["cor"] = "Verde"
	o, err := svc.Create(ctx, owner, input)
	if err != nil {
		t.Fatal(err)
	}
	if o.AddressID != a.ID || o.Subtotal != "600.00" || o.Discount != "50.00" || o.Total != "550.00" || o.CouponCode != "GREEN10" || len(o.Items) != 2 {
		t.Fatalf("snapshot/coupon: %+v", o)
	}
	if _, err = store.UpdateAddress(ctx, owner, o.ID, otherAddress.ID); !errors.Is(err, models.ErrNotFound) {
		t.Fatalf("IDOR replacement: %v", err)
	}
	// Mesmo SQL direto não consegue associar ao pedido um endereço de outro dono.
	if _, err = db.Exec(`UPDATE orders SET address_id=$1 WHERE id=$2`, otherAddress.ID, o.ID); err == nil {
		t.Fatal("composite ownership FK missing")
	}
	updated := address()
	updated.City = "Cidade nova"
	if _, err = agenda.Save(ctx, owner, a.ID, updated); err != nil {
		t.Fatal(err)
	}
	read, err := store.ByID(ctx, owner, o.ID)
	if err != nil || read.ShippingAddress.City != address().City {
		t.Fatal("address snapshot changed", err)
	}
	if err = agenda.Archive(ctx, owner, a.ID); err != nil {
		t.Fatal(err)
	}
	list, err := agenda.List(ctx, owner)
	if err != nil || len(list) != 0 {
		t.Fatal("archived address visible", err)
	}
	if _, err = svc.Create(ctx, owner, input); !errors.Is(err, models.ErrNotFound) {
		t.Fatal("archived address accepted", err)
	}
	read, err = store.ByID(ctx, owner, o.ID)
	if err != nil || read.AddressID != a.ID || len(read.Items) != 2 {
		t.Fatal("historical order lost", err)
	}
	if err = store.Cancel(ctx, owner, o.ID); err != nil {
		t.Fatal(err)
	}
	if err = db.QueryRow(`SELECT stock_quantity FROM products WHERE id=$1`, product).Scan(&stock); err != nil || stock != 10 {
		t.Fatalf("variant restock: %d %v", stock, err)
	}
}

func TestConcurrentAddressQuotaAndTextValidation(t *testing.T) {
	db := testDB(t)
	ctx := context.Background()
	svc := addresses.Service{Store: repositories.AddressStore{DB: db}}
	var owner string
	if err := db.QueryRow(`INSERT INTO users(email,password_hash,name) VALUES('quota@test.com','hash','Quota') RETURNING id`).Scan(&owner); err != nil {
		t.Fatal(err)
	}
	invalid := address()
	invalid.City = "bad\x00text"
	if _, err := svc.Save(ctx, owner, "", invalid); !errors.Is(err, validation.ErrInput) {
		t.Fatal("control accepted", err)
	}
	var wg sync.WaitGroup
	results := make(chan error, 26)
	for i := 0; i < 26; i++ {
		wg.Add(1)
		go func() { defer wg.Done(); _, err := svc.Save(ctx, owner, "", address()); results <- err }()
	}
	wg.Wait()
	close(results)
	success := 0
	for err := range results {
		if err == nil {
			success++
		} else if !errors.Is(err, validation.ErrInput) {
			t.Fatal(err)
		}
	}
	list, err := svc.List(ctx, owner)
	if err != nil || success != 20 || len(list) != 20 {
		t.Fatalf("quota race: successes=%d addresses=%d error=%v", success, len(list), err)
	}
}
