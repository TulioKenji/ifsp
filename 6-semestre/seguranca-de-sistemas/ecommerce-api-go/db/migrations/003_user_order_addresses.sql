ALTER TABLE user_addresses ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
CREATE UNIQUE INDEX IF NOT EXISTS user_addresses_id_owner_unique ON user_addresses(id,user_id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_id UUID;

-- Pedidos antigos recebem um endereço histórico, sem perder seu snapshot e sem
-- preencher a agenda ativa do cliente com centenas de endereços duplicados.
CREATE TEMP TABLE order_address_backfill ON COMMIT DROP AS
SELECT id AS order_id,gen_random_uuid() AS address_id FROM orders WHERE address_id IS NULL;
INSERT INTO user_addresses(id,user_id,recipient_name,postal_code,street,number,complement,neighborhood,city,state,country,archived_at)
SELECT b.address_id,o.user_id,o.shipping_recipient_name,o.shipping_postal_code,o.shipping_street,
o.shipping_number,o.shipping_complement,o.shipping_neighborhood,o.shipping_city,o.shipping_state,o.shipping_country,NOW()
FROM orders o JOIN order_address_backfill b ON b.order_id=o.id;
UPDATE orders o SET address_id=b.address_id FROM order_address_backfill b WHERE b.order_id=o.id;
ALTER TABLE orders ALTER COLUMN address_id SET NOT NULL;
DO $$ BEGIN
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='orders'::regclass AND conname='orders_address_owner_fk') THEN
    ALTER TABLE orders ADD CONSTRAINT orders_address_owner_fk FOREIGN KEY(address_id,user_id)
        REFERENCES user_addresses(id,user_id) ON DELETE RESTRICT;
END IF;
END $$;
CREATE INDEX IF NOT EXISTS orders_address_id_idx ON orders(address_id);
