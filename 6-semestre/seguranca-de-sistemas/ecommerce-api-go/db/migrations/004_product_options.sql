ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB NOT NULL DEFAULT '{}';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS options JSONB NOT NULL DEFAULT '{}';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(20);
DO $$ BEGIN
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='products'::regclass AND conname='products_options_object') THEN
    ALTER TABLE products ADD CONSTRAINT products_options_object CHECK(jsonb_typeof(options)='object' AND pg_column_size(options)<=2048);
END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='order_items'::regclass AND conname='order_items_options_object') THEN
    ALTER TABLE order_items ADD CONSTRAINT order_items_options_object CHECK(jsonb_typeof(options)='object' AND pg_column_size(options)<=1024);
END IF;
END $$;
DROP INDEX IF EXISTS order_items_order_product_unique;
CREATE UNIQUE INDEX IF NOT EXISTS order_items_product_options_unique ON order_items(order_id,product_id,options) WHERE product_id IS NOT NULL;
