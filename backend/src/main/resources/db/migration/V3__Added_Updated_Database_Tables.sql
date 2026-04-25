DROP TABLE IF EXISTS reservation_item CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS reservation CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS drug_catalog CASCADE;
DROP TABLE IF EXISTS catalog CASCADE;
DROP TABLE IF EXISTS drug CASCADE;
DROP TABLE IF EXISTS pharmacy CASCADE;
DROP TABLE IF EXISTS client CASCADE;
DROP TABLE IF EXISTS user_role CASCADE;
DROP TABLE IF EXISTS role CASCADE;
DROP TABLE IF EXISTS user_account CASCADE;

CREATE TABLE role (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE user_account (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_role (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE RESTRICT
);

CREATE TABLE client (
    id BIGINT PRIMARY KEY,
    address VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_client_user FOREIGN KEY (id) REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE TABLE pharmacy (
    id BIGINT PRIMARY KEY,
    pharmacy_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    tax_id VARCHAR(50) UNIQUE,
    schedule VARCHAR(255),
    approval_status VARCHAR(20) DEFAULT 'PENDING',
    phone VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pharmacy_user FOREIGN KEY (id) REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE TABLE drug (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    bar_code VARCHAR(50) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    manufacturer VARCHAR(100),
    requires_prescription BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock (
    id BIGSERIAL PRIMARY KEY,
    pharmacy_id BIGINT NOT NULL,
    drug_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 3) NOT NULL,
    reservation_delay INT NOT NULL DEFAULT 24,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (pharmacy_id, drug_id),
    CONSTRAINT fk_stock_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacy(id) ON DELETE CASCADE,
    CONSTRAINT fk_stock_drug FOREIGN KEY (drug_id) REFERENCES drug(id) ON DELETE RESTRICT,
    CONSTRAINT chk_stock_quantity CHECK (quantity >= 0),
    CONSTRAINT chk_stock_price CHECK (price > 0),
    CONSTRAINT chk_stock_delay CHECK (reservation_delay > 0)
);

CREATE TABLE reservation (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    pharmacy_id BIGINT NOT NULL,
    reservation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiration_date TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total DECIMAL(12, 3) NOT NULL DEFAULT 0,
    notes VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_res_client FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE RESTRICT,
    CONSTRAINT fk_res_pharmacy FOREIGN KEY (pharmacy_id) REFERENCES pharmacy(id) ON DELETE RESTRICT,
    CONSTRAINT chk_res_status CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'EXPIRED'))
);

CREATE TABLE reservation_item (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    stock_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 3) NOT NULL,
    subtotal DECIMAL(12, 3) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_res_item_res FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE,
    CONSTRAINT fk_res_item_stock FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE RESTRICT,
    CONSTRAINT uq_res_item_unique_stock UNIQUE (reservation_id, stock_id),
    CONSTRAINT chk_res_item_qty CHECK (quantity > 0),
    CONSTRAINT chk_res_item_price CHECK (unit_price > 0),
    CONSTRAINT chk_res_item_subtotal CHECK (subtotal > 0)
);

CREATE TABLE notification (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT,
    user_id BIGINT,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_res FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE TABLE password_reset_token (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE
);

INSERT INTO role (code, description) VALUES
    ('CLIENT', 'End user / patient'),
    ('PHARMACY', 'Pharmacy account'),
    ('ADMIN', 'Administrator');