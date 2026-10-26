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
