-- =========================================================
-- EXTENSIONS
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- =========================================================
-- ENUMS
-- =========================================================

CREATE TYPE user_role AS ENUM (
    'customer',
    'seller',
    'admin'
);

CREATE TYPE user_status AS ENUM (
    'active',
    'blocked',
    'disabled'
);

CREATE TYPE order_status AS ENUM (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'authorized',
    'paid',
    'failed',
    'refunded',
    'cancelled'
);

CREATE TYPE payment_method AS ENUM (
    'pix',
    'credit_card',
    'debit_card',
    'boleto'
);

CREATE TYPE shipment_status AS ENUM (
    'pending',
    'preparing',
    'shipped',
    'in_transit',
    'delivered',
    'returned'
);

CREATE TYPE address_type AS ENUM (
    'home',
    'work',
    'other'
);


-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    email VARCHAR(320) NOT NULL,
    password_hash TEXT NOT NULL,

    name VARCHAR(150) NOT NULL,

    role user_role NOT NULL DEFAULT 'customer',
    status user_status NOT NULL DEFAULT 'active',

    email_verified_at TIMESTAMPTZ,

    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,

    last_login_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_lowercase
        CHECK (email = LOWER(email)),

    CONSTRAINT users_failed_login_attempts_positive
        CHECK (failed_login_attempts >= 0)
);


CREATE UNIQUE INDEX users_email_unique
    ON users (email);


CREATE INDEX users_role_idx
    ON users (role);

CREATE INDEX users_status_idx
    ON users (status);


-- =========================================================
-- USER ADDRESSES
-- =========================================================

CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    type address_type NOT NULL DEFAULT 'home',

    recipient_name VARCHAR(150) NOT NULL,

    postal_code VARCHAR(20) NOT NULL,
    street VARCHAR(200) NOT NULL,
    number VARCHAR(20) NOT NULL,
    complement VARCHAR(100),

    neighborhood VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'BR',

    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    archived_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX user_addresses_user_id_idx
    ON user_addresses (user_id);

CREATE UNIQUE INDEX user_addresses_id_owner_unique ON user_addresses(id,user_id);


CREATE UNIQUE INDEX user_addresses_one_default
    ON user_addresses (user_id)
    WHERE is_default = TRUE;


-- =========================================================
-- SESSIONS - STATEFUL AUTHENTICATION
-- =========================================================

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Nunca armazene o token da sessão em texto puro.
    -- Armazene somente o hash.
    token_hash CHAR(64) NOT NULL,

    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    expires_at TIMESTAMPTZ NOT NULL,

    revoked_at TIMESTAMPTZ,

    CONSTRAINT sessions_expiration
        CHECK (expires_at > created_at)
);


CREATE UNIQUE INDEX sessions_token_hash_unique
    ON sessions (token_hash);


CREATE INDEX sessions_user_id_idx
    ON sessions (user_id);

CREATE INDEX sessions_expires_at_idx
    ON sessions (expires_at);

CREATE INDEX sessions_active_idx
    ON sessions (user_id, expires_at)
    WHERE revoked_at IS NULL;


-- =========================================================
-- PRODUCTS
-- =========================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    seller_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,

    description TEXT,

    price NUMERIC(12,2) NOT NULL,

    stock_quantity INTEGER NOT NULL DEFAULT 0,

    sku VARCHAR(100),

    active BOOLEAN NOT NULL DEFAULT TRUE,
    options JSONB NOT NULL DEFAULT '{}' CONSTRAINT products_options_object CHECK(jsonb_typeof(options)='object' AND pg_column_size(options)<=2048),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT products_price_positive
        CHECK (price >= 0),

    CONSTRAINT products_stock_positive
        CHECK (stock_quantity >= 0)
);


CREATE UNIQUE INDEX products_slug_unique
    ON products (slug);

CREATE UNIQUE INDEX products_sku_unique
    ON products (sku)
    WHERE sku IS NOT NULL;

CREATE INDEX products_seller_id_idx
    ON products (seller_id);

CREATE INDEX products_active_idx
    ON products (active);

CREATE INDEX products_search_idx
    ON products USING GIN (
        to_tsvector(
            'simple',
            name || ' ' || COALESCE(description, '') || ' ' || COALESCE(sku, '')
        )
    );


-- =========================================================
-- PRODUCT IMAGES
-- =========================================================

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    url TEXT NOT NULL,

    alt_text VARCHAR(255),

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX product_images_product_sort_idx
    ON product_images (product_id, sort_order, id);


-- =========================================================
-- CATEGORIES
-- =========================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE UNIQUE INDEX categories_name_unique
    ON categories (name);

CREATE UNIQUE INDEX categories_slug_unique
    ON categories (slug);


-- =========================================================
-- PRODUCT <-> CATEGORY
-- =========================================================

CREATE TABLE product_categories (
    product_id UUID NOT NULL
        REFERENCES products(id)
        ON DELETE CASCADE,

    category_id UUID NOT NULL
        REFERENCES categories(id)
        ON DELETE CASCADE,

    PRIMARY KEY (product_id, category_id)
);


-- =========================================================
-- ORDERS
-- =========================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    status order_status NOT NULL DEFAULT 'pending',
    address_id UUID NOT NULL,
    coupon_code VARCHAR(20),

    subtotal NUMERIC(12,2) NOT NULL,
    shipping_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,

    currency CHAR(3) NOT NULL DEFAULT 'BRL',

    -- Snapshot do endereço no momento da compra.
    -- Não dependa do endereço atual do usuário.
    shipping_recipient_name VARCHAR(150) NOT NULL,
    shipping_postal_code VARCHAR(20) NOT NULL,
    shipping_street VARCHAR(200) NOT NULL,
    shipping_number VARCHAR(20) NOT NULL,
    shipping_complement VARCHAR(100),
    shipping_neighborhood VARCHAR(100) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_state VARCHAR(100) NOT NULL,
    shipping_country VARCHAR(100) NOT NULL DEFAULT 'BR',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT orders_subtotal_positive
        CHECK (subtotal >= 0),

    CONSTRAINT orders_shipping_positive
        CHECK (shipping_cost >= 0),

    CONSTRAINT orders_discount_positive
        CHECK (discount >= 0),

    CONSTRAINT orders_total_positive
        CHECK (total >= 0),

    CONSTRAINT orders_total_consistent
        CHECK (total = subtotal + shipping_cost - discount),
    CONSTRAINT orders_address_owner_fk FOREIGN KEY(address_id,user_id)
        REFERENCES user_addresses(id,user_id) ON DELETE RESTRICT
);


CREATE INDEX orders_user_id_idx
    ON orders (user_id);

CREATE INDEX orders_address_id_idx ON orders(address_id);

CREATE INDEX orders_status_idx
    ON orders (status);

CREATE INDEX orders_created_at_idx
    ON orders (created_at DESC);


-- =========================================================
-- ORDER ITEMS
-- =========================================================

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE CASCADE,

    product_id UUID
        REFERENCES products(id)
        ON DELETE SET NULL,

    -- Snapshot dos dados do produto.
    product_name VARCHAR(200) NOT NULL,
    sku VARCHAR(100),

    quantity INTEGER NOT NULL,
    options JSONB NOT NULL DEFAULT '{}' CONSTRAINT order_items_options_object CHECK(jsonb_typeof(options)='object' AND pg_column_size(options)<=1024),

    -- Preço no momento da compra.
    unit_price NUMERIC(12,2) NOT NULL,

    total_price NUMERIC(12,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT order_items_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT order_items_unit_price_positive
        CHECK (unit_price >= 0),

    CONSTRAINT order_items_total_price_positive
        CHECK (total_price >= 0),

    CONSTRAINT order_items_total_consistent
        CHECK (total_price = quantity * unit_price)
);


CREATE INDEX order_items_order_id_idx
    ON order_items (order_id);

CREATE INDEX order_items_product_id_idx
    ON order_items (product_id);

CREATE UNIQUE INDEX order_items_product_options_unique
    ON order_items (order_id, product_id, options) WHERE product_id IS NOT NULL;

-- Lista do cliente usa filtro + ordenação; evita ordenar todo o histórico.
CREATE INDEX orders_user_created_idx ON orders (user_id, created_at DESC, id);


-- =========================================================
-- PAYMENTS
-- =========================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE RESTRICT,

    method payment_method NOT NULL,

    status payment_status NOT NULL DEFAULT 'pending',

    amount NUMERIC(12,2) NOT NULL,

    -- ID fornecido pelo gateway de pagamento.
    provider_transaction_id VARCHAR(255),

    paid_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT payments_amount_positive
        CHECK (amount > 0)
);


CREATE UNIQUE INDEX payments_provider_transaction_unique
    ON payments (provider_transaction_id)
    WHERE provider_transaction_id IS NOT NULL;


CREATE INDEX payments_order_id_idx
    ON payments (order_id);

CREATE INDEX payments_status_idx
    ON payments (status);


-- =========================================================
-- SHIPMENTS
-- =========================================================

CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES orders(id)
        ON DELETE RESTRICT,

    status shipment_status NOT NULL DEFAULT 'pending',

    carrier VARCHAR(100),

    tracking_code VARCHAR(150),

    shipped_at TIMESTAMPTZ,

    estimated_delivery_at TIMESTAMPTZ,

    delivered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE UNIQUE INDEX shipments_tracking_code_unique
    ON shipments (tracking_code)
    WHERE tracking_code IS NOT NULL;


CREATE INDEX shipments_order_id_idx
    ON shipments (order_id);

CREATE INDEX shipments_status_idx
    ON shipments (status);


-- =========================================================
-- AUDIT LOG
-- =========================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    action VARCHAR(100) NOT NULL,

    resource_type VARCHAR(100),
    resource_id UUID,

    ip_address INET,

    user_agent TEXT,

    metadata JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX audit_logs_user_id_idx
    ON audit_logs (user_id);

CREATE INDEX audit_logs_resource_idx
    ON audit_logs (resource_type, resource_id);

CREATE INDEX audit_logs_created_at_idx
    ON audit_logs (created_at DESC);


-- =========================================================
-- UPDATED_AT TRIGGER
-- =========================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER user_addresses_updated_at
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


CREATE TRIGGER shipments_updated_at
BEFORE UPDATE ON shipments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();


-- Cria módulos novos sem fabricar CPF, telefone ou cartão para usuários antigos.
CREATE TABLE IF NOT EXISTS user_profiles (
 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 cpf_cipher BYTEA NOT NULL CHECK(octet_length(cpf_cipher) BETWEEN 30 AND 128),
 phone_cipher BYTEA NOT NULL CHECK(octet_length(phone_cipher) BETWEEN 30 AND 128),
 cpf_masked VARCHAR(20) NOT NULL, phone_masked VARCHAR(30) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS credit_cards (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 number_cipher BYTEA CHECK(octet_length(number_cipher) BETWEEN 30 AND 128),
 holder_cipher BYTEA CHECK(octet_length(holder_cipher) BETWEEN 30 AND 1024),
 fingerprint CHAR(64) NOT NULL,
 brand VARCHAR(20) NOT NULL CHECK(brand IN ('Visa','Mastercard','Amex')),
 last4 CHAR(4) NOT NULL CHECK(last4 ~ '^[0-9]{4}$'),
 exp_month SMALLINT NOT NULL CHECK(exp_month BETWEEN 1 AND 12),
 exp_year SMALLINT NOT NULL CHECK(exp_year BETWEEN 2000 AND 2200),
 archived_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CONSTRAINT credit_cards_active_cipher CHECK(archived_at IS NOT NULL OR (number_cipher IS NOT NULL AND holder_cipher IS NOT NULL)),
 CONSTRAINT credit_cards_id_owner_unique UNIQUE(id,user_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS credit_cards_active_fingerprint ON credit_cards(user_id,fingerprint) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS credit_cards_user_active ON credit_cards(user_id,created_at,id) WHERE archived_at IS NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS credit_card_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_brand VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_last4 CHAR(4);
-- Somente registros anteriores à migração podem continuar sem cartão. Não
-- inventamos números para backfill e não expomos a flag nos contratos HTTP.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS card_required BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE orders ALTER COLUMN card_required SET DEFAULT TRUE;
DO $$ BEGIN
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='orders'::regclass AND conname='orders_card_owner_fk') THEN
 ALTER TABLE orders ADD CONSTRAINT orders_card_owner_fk FOREIGN KEY(credit_card_id,user_id) REFERENCES credit_cards(id,user_id) ON DELETE RESTRICT;
END IF;
IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='orders'::regclass AND conname='orders_card_required') THEN
 ALTER TABLE orders ADD CONSTRAINT orders_card_required CHECK(NOT card_required OR (credit_card_id IS NOT NULL AND card_brand IS NOT NULL AND card_last4 IS NOT NULL));
END IF;
END $$;
CREATE INDEX IF NOT EXISTS orders_credit_card_id_idx ON orders(credit_card_id);

-- Canário para recusar uma chave trocada acidentalmente. Nenhum segredo em claro.
CREATE TABLE IF NOT EXISTS data_key_checks (
 id SMALLINT PRIMARY KEY CHECK(id=1),
 check_cipher BYTEA NOT NULL CHECK(octet_length(check_cipher) BETWEEN 30 AND 128)
);
