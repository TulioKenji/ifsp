-- dbsetup executa migrations em transação e registra a versão.
-- Manualmente use psql --single-transaction -v ON_ERROR_STOP=1 -f este-arquivo.sql.
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
        WHERE conrelid='orders'::regclass AND conname='orders_total_consistent') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_total_consistent
            CHECK (total = subtotal + shipping_cost - discount);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint
        WHERE conrelid='order_items'::regclass AND conname='order_items_total_consistent') THEN
        ALTER TABLE order_items ADD CONSTRAINT order_items_total_consistent
            CHECK (total_price = quantity * unit_price);
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS order_items_order_product_unique
    ON order_items (order_id, product_id) WHERE product_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders (user_id, created_at DESC, id);
