package repositories

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"sort"

	"ecommerce-api-go/internal/models"
	"ecommerce-api-go/internal/orders"
)

type OrderStore struct{ DB *sql.DB }

// Transação: ou pedido, snapshots e estoque são todos persistidos, ou tudo é desfeito.
func (s OrderStore) Create(ctx context.Context, userID string, in models.CreateOrder) (models.Order, error) {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return models.Order{}, err
	}
	defer tx.Rollback()
	var profileReady bool
	if err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM user_profiles WHERE user_id=$1)`, userID).Scan(&profileReady); err != nil {
		return models.Order{}, err
	}
	if !profileReady {
		return models.Order{}, fmt.Errorf("%w: complete CPF e telefone em Minha conta", orders.ErrValidation)
	}
	card, err := ownedCard(ctx, tx, userID, in.CreditCardID)
	if err != nil {
		return models.Order{}, err
	}
	a, err := ownedAddress(ctx, tx, userID, in.AddressID)
	if err != nil {
		return models.Order{}, err
	}
	var id string
	err = tx.QueryRowContext(ctx, `INSERT INTO orders (user_id, address_id,coupon_code,credit_card_id,card_brand,card_last4,subtotal, total,
	 shipping_recipient_name, shipping_postal_code, shipping_street, shipping_number,
	 shipping_complement, shipping_neighborhood, shipping_city, shipping_state, shipping_country)
	 VALUES ($1,$11,NULLIF($12,''),$13,$14,$15,0,0,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
		userID, a.RecipientName, a.PostalCode, a.Street, a.Number, a.Complement, a.Neighborhood, a.City, a.State, a.Country, in.AddressID, in.CouponCode, card.ID, card.Brand, card.Last4).Scan(&id)
	if err != nil {
		return models.Order{}, err
	}
	// A mesma ordem de locks em todas as compras reduz deadlocks entre carrinhos.
	sort.Slice(in.Items, func(i, j int) bool { return in.Items[i].ProductID < in.Items[j].ProductID })
	for _, item := range in.Items {
		var productID, name, price string
		var sku *string
		var rawOptions []byte
		// UPDATE obtém lock de linha; o predicado é reavaliado após compras concorrentes.
		err = tx.QueryRowContext(ctx, `UPDATE products SET stock_quantity=stock_quantity-$2
		 WHERE id=$1 AND active=TRUE AND stock_quantity >= $2 RETURNING id,name,sku,price,options`,
			item.ProductID, item.Quantity).Scan(&productID, &name, &sku, &price, &rawOptions)
		if errors.Is(err, sql.ErrNoRows) {
			return models.Order{}, orders.ErrConflict
		}
		if err != nil {
			return models.Order{}, err
		}
		var allowed map[string][]string
		if err = json.Unmarshal(rawOptions, &allowed); err != nil {
			return models.Order{}, err
		}
		if len(allowed) != len(item.Options) {
			return models.Order{}, fmt.Errorf("%w: selecione todas as opções do produto", orders.ErrValidation)
		}
		for key, values := range allowed {
			valid := false
			for _, value := range values {
				if item.Options[key] == value {
					valid = true
					break
				}
			}
			if !valid {
				return models.Order{}, fmt.Errorf("%w: opção de produto inválida", orders.ErrValidation)
			}
		}
		if item.Options == nil {
			item.Options = map[string]string{}
		}
		selected, _ := json.Marshal(item.Options)
		_, err = tx.ExecContext(ctx, `INSERT INTO order_items
		 (order_id,product_id,product_name,sku,quantity,unit_price,total_price,options)
		 VALUES ($1,$2,$3,$4,$5::integer,$6::numeric,$6::numeric*$5::integer,$7::jsonb)`, id, productID, name, sku, item.Quantity, price, string(selected))
		if err != nil {
			return models.Order{}, err
		}
	}
	// NUMERIC faz a conta no banco sem arredondamento de ponto flutuante.
	_, err = tx.ExecContext(ctx, `UPDATE orders SET subtotal=t.amount,
	 discount=CASE WHEN coupon_code='GREEN10' THEN LEAST(ROUND(t.amount*0.10,2),50) ELSE 0 END,
	 total=t.amount-CASE WHEN coupon_code='GREEN10' THEN LEAST(ROUND(t.amount*0.10,2),50) ELSE 0 END
	 FROM (SELECT SUM(total_price) amount FROM order_items WHERE order_id=$1) t WHERE id=$1`, id)
	if err != nil {
		return models.Order{}, err
	}
	if err = audit(ctx, tx, userID, id, "order.created"); err != nil {
		return models.Order{}, err
	}
	out, err := readOrder(ctx, tx, userID, id)
	if err != nil {
		return models.Order{}, err
	}
	if err = tx.Commit(); err != nil {
		return models.Order{}, err
	}
	return out, nil
}

type querier interface {
	QueryRowContext(context.Context, string, ...any) *sql.Row
}

// O dono participa do WHERE, inclusive no detalhe: conhecer um UUID não dá acesso.
func readOrder(ctx context.Context, db querier, userID, id string) (models.Order, error) {
	var o models.Order
	var address, items []byte
	err := db.QueryRowContext(ctx, `SELECT o.id,o.status,o.subtotal,o.shipping_cost,o.discount,o.total,o.currency,o.address_id,COALESCE(o.coupon_code,''),o.credit_card_id,COALESCE(o.card_brand,''),COALESCE(o.card_last4,''),
	 json_build_object('recipient_name',o.shipping_recipient_name,'postal_code',o.shipping_postal_code,
	 'street',o.shipping_street,'number',o.shipping_number,'complement',COALESCE(o.shipping_complement,''),
	 'neighborhood',o.shipping_neighborhood,'city',o.shipping_city,'state',o.shipping_state,'country',o.shipping_country),
	 COALESCE((SELECT json_agg(json_build_object('id',i.id,'product_id',i.product_id,
	 'product_name',i.product_name,'sku',i.sku,'quantity',i.quantity,'unit_price',i.unit_price::text,
	 'total_price',i.total_price::text,'options',i.options) ORDER BY i.id) FROM order_items i WHERE i.order_id=o.id),'[]'::json),
	 o.created_at,o.updated_at FROM orders o WHERE o.id=$1 AND o.user_id=$2`, id, userID).
		Scan(&o.ID, &o.Status, &o.Subtotal, &o.ShippingCost, &o.Discount, &o.Total, &o.Currency, &o.AddressID, &o.CouponCode, &o.CreditCardID, &o.CardBrand, &o.CardLast4, &address, &items, &o.CreatedAt, &o.UpdatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return o, models.ErrNotFound
	}
	if err != nil {
		return o, err
	}
	if err = json.Unmarshal(address, &o.ShippingAddress); err != nil {
		return o, err
	}
	err = json.Unmarshal(items, &o.Items)
	return o, err
}

func (s OrderStore) ByID(ctx context.Context, userID, id string) (models.Order, error) {
	return readOrder(ctx, s.DB, userID, id)
}

func (s OrderStore) List(ctx context.Context, userID string, page, size int) ([]models.Order, int, error) {
	// Uma única consulta evita N+1 e mantém total/página no mesmo snapshot.
	var raw []byte
	var total int
	err := s.DB.QueryRowContext(ctx, `SELECT (SELECT COUNT(*) FROM orders WHERE user_id=$1),
	 COALESCE(json_agg(row_to_json(p) ORDER BY p.created_at DESC,p.id),'[]'::json) FROM
	 (SELECT id,status,subtotal::text,shipping_cost::text,discount::text,total::text,currency,address_id,COALESCE(coupon_code,'') coupon_code,credit_card_id,COALESCE(card_brand,'') card_brand,COALESCE(card_last4,'') card_last4,
	 json_build_object('recipient_name',shipping_recipient_name,'postal_code',shipping_postal_code,
	 'street',shipping_street,'number',shipping_number,'complement',COALESCE(shipping_complement,''),
	 'neighborhood',shipping_neighborhood,'city',shipping_city,'state',shipping_state,'country',shipping_country) shipping_address,
	 '[]'::json items,created_at,updated_at FROM orders WHERE user_id=$1
	 ORDER BY created_at DESC,id LIMIT $2 OFFSET $3) p`, userID, size, (page-1)*size).Scan(&total, &raw)
	if err != nil {
		return nil, 0, err
	}
	out := []models.Order{}
	err = json.Unmarshal(raw, &out)
	return out, total, err
}

func lockPending(ctx context.Context, tx *sql.Tx, userID, id string) error {
	var status string
	err := tx.QueryRowContext(ctx, `SELECT status FROM orders WHERE id=$1 AND user_id=$2 FOR UPDATE`, id, userID).Scan(&status)
	if errors.Is(err, sql.ErrNoRows) {
		return models.ErrNotFound
	}
	if err != nil {
		return err
	}
	if status != "pending" {
		return orders.ErrConflict
	}
	// Futuras integrações de pagamento/envio devem obter o mesmo lock de orders.
	var busy bool
	err = tx.QueryRowContext(ctx, `SELECT EXISTS(SELECT 1 FROM payments WHERE order_id=$1 AND status NOT IN ('failed','cancelled'))
	 OR EXISTS(SELECT 1 FROM shipments WHERE order_id=$1)`, id).Scan(&busy)
	if err != nil {
		return err
	}
	if busy {
		return orders.ErrConflict
	}
	return nil
}

func (s OrderStore) UpdateAddress(ctx context.Context, userID, id, addressID string) (models.Order, error) {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return models.Order{}, err
	}
	defer tx.Rollback()
	if err = lockPending(ctx, tx, userID, id); err != nil {
		return models.Order{}, err
	}
	a, err := ownedAddress(ctx, tx, userID, addressID)
	if err != nil {
		return models.Order{}, err
	}
	_, err = tx.ExecContext(ctx, `UPDATE orders SET shipping_recipient_name=$2,shipping_postal_code=$3,
	 shipping_street=$4,shipping_number=$5,shipping_complement=$6,shipping_neighborhood=$7,
	 shipping_city=$8,shipping_state=$9,shipping_country=$10,address_id=$11 WHERE id=$1`,
		id, a.RecipientName, a.PostalCode, a.Street, a.Number, a.Complement, a.Neighborhood, a.City, a.State, a.Country, addressID)
	if err != nil {
		return models.Order{}, err
	}
	if err = audit(ctx, tx, userID, id, "order.address_updated"); err != nil {
		return models.Order{}, err
	}
	out, err := readOrder(ctx, tx, userID, id)
	if err != nil {
		return out, err
	}
	err = tx.Commit()
	return out, err
}

func (s OrderStore) Cancel(ctx context.Context, userID, id string) error {
	tx, err := s.DB.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if err = lockPending(ctx, tx, userID, id); err != nil {
		return err
	}
	// Lock do pedido impede duas devoluções. Produtos usam a ordem de locks da compra.
	rows, err := tx.QueryContext(ctx, `SELECT product_id::text,quantity FROM order_items WHERE order_id=$1 AND product_id IS NOT NULL ORDER BY product_id`, id)
	if err != nil {
		return err
	}
	items := []models.OrderItemInput{}
	for rows.Next() {
		var i models.OrderItemInput
		if err = rows.Scan(&i.ProductID, &i.Quantity); err != nil {
			rows.Close()
			return err
		}
		items = append(items, i)
	}
	err = rows.Err()
	rows.Close()
	if err != nil {
		return err
	}
	for _, i := range items {
		if _, err = tx.ExecContext(ctx, `UPDATE products SET stock_quantity=stock_quantity+$2 WHERE id=$1`, i.ProductID, i.Quantity); err != nil {
			return err
		}
	}
	if _, err = tx.ExecContext(ctx, `UPDATE orders SET status='cancelled' WHERE id=$1`, id); err != nil {
		return err
	}
	if err = audit(ctx, tx, userID, id, "order.cancelled"); err != nil {
		return err
	}
	return tx.Commit()
}

func audit(ctx context.Context, tx *sql.Tx, userID, id, action string) error {
	_, err := tx.ExecContext(ctx, `INSERT INTO audit_logs(user_id,action,resource_type,resource_id) VALUES ($1,$2,'order',$3)`, userID, action, id)
	return err
}
