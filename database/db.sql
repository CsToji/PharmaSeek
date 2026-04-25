CREATE TABLE role (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      code VARCHAR(30) NOT NULL UNIQUE,
                      description VARCHAR(255)
);

CREATE TABLE user_account (
                              id BIGINT PRIMARY KEY AUTO_INCREMENT,
                              name VARCHAR(100) NOT NULL,
                              email VARCHAR(150) NOT NULL UNIQUE,
                              password VARCHAR(255) NOT NULL,
                              phone VARCHAR(20),
                              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_role (
                           user_id BIGINT NOT NULL,
                           role_id BIGINT NOT NULL,
                           PRIMARY KEY (user_id, role_id),
                           CONSTRAINT fk_user_role_user
                               FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE,
                           CONSTRAINT fk_user_role_role
                               FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE RESTRICT
);

CREATE TABLE client (
                        id BIGINT PRIMARY KEY,
                        address VARCHAR(255),
                        latitude DOUBLE,
                        longitude DOUBLE,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        CONSTRAINT fk_client_user
                            FOREIGN KEY (id) REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE TABLE pharmacy (
                          id BIGINT PRIMARY KEY,
                          pharmacy_name VARCHAR(150) NOT NULL,
                          address VARCHAR(255) NOT NULL,
                          latitude DECIMAL(10, 7) NOT NULL,
                          longitude DECIMAL(10, 7) NOT NULL,
                          tax_id VARCHAR(50) UNIQUE,
                          schedule VARCHAR(255),
                          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                          updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          CONSTRAINT fk_pharmacy_user
                              FOREIGN KEY (id) REFERENCES user_account(id) ON DELETE CASCADE
);

CREATE TABLE drug (
                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                      name VARCHAR(150) NOT NULL,
                      bar_code VARCHAR(50) UNIQUE,
                      description TEXT,
                      category VARCHAR(100),
                      manufacturer VARCHAR(100),
                      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE catalog (
                         id BIGINT PRIMARY KEY AUTO_INCREMENT,
                         version VARCHAR(20) NOT NULL,
                         updated_at DATE NOT NULL,
                         created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         UNIQUE (version)
);

CREATE TABLE drug_catalog (
                              catalog_id BIGINT NOT NULL,
                              drug_id BIGINT NOT NULL,
                              PRIMARY KEY (catalog_id, drug_id),
                              CONSTRAINT fk_drug_catalog_catalog
                                  FOREIGN KEY (catalog_id) REFERENCES catalog(id) ON DELETE CASCADE,
                              CONSTRAINT fk_drug_catalog_drug
                                  FOREIGN KEY (drug_id) REFERENCES drug(id) ON DELETE CASCADE
);

CREATE TABLE stock (
                       id BIGINT PRIMARY KEY AUTO_INCREMENT,
                       pharmacy_id BIGINT NOT NULL,
                       drug_id BIGINT NOT NULL,
                       quantity INT NOT NULL DEFAULT 0,
                       price DECIMAL(10, 3) NOT NULL,
                       reservation_delay INT NOT NULL DEFAULT 24,
                       updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       UNIQUE (pharmacy_id, drug_id),
                       CONSTRAINT fk_stock_pharmacy
                           FOREIGN KEY (pharmacy_id) REFERENCES pharmacy(id) ON DELETE CASCADE,
                       CONSTRAINT fk_stock_drug
                           FOREIGN KEY (drug_id) REFERENCES drug(id) ON DELETE RESTRICT,
                       CONSTRAINT chk_stock_quantity
                           CHECK (quantity >= 0),
                       CONSTRAINT chk_stock_price
                           CHECK (price > 0),
                       CONSTRAINT chk_stock_delay
                           CHECK (reservation_delay > 0)
);

CREATE TABLE reservation (
                             id BIGINT PRIMARY KEY AUTO_INCREMENT,
                             client_id BIGINT NOT NULL,
                             pharmacy_id BIGINT NOT NULL,
                             reservation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             expiration_date DATETIME,
                             status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                             total DECIMAL(12, 3) NOT NULL DEFAULT 0,
                             notes VARCHAR(500),
                             created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                             CONSTRAINT fk_res_client
                                 FOREIGN KEY (client_id) REFERENCES client(id) ON DELETE RESTRICT,
                             CONSTRAINT fk_res_pharmacy
                                 FOREIGN KEY (pharmacy_id) REFERENCES pharmacy(id) ON DELETE RESTRICT,
                             CONSTRAINT chk_res_status
                                 CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELED', 'COMPLETED', 'EXPIRED')),
                             CONSTRAINT chk_res_dates
                                 CHECK (expiration_date IS NULL OR expiration_date >= reservation_date)
);

CREATE TABLE reservation_item (
                                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                  reservation_id BIGINT NOT NULL,
                                  stock_id BIGINT NOT NULL,
                                  quantity INT NOT NULL,
                                  unit_price DECIMAL(10, 3) NOT NULL,
                                  subtotal DECIMAL(12, 3) NOT NULL,
                                  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                  CONSTRAINT fk_res_item_res
                                      FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_res_item_stock
                                      FOREIGN KEY (stock_id) REFERENCES stock(id) ON DELETE RESTRICT,
                                  CONSTRAINT uq_res_item_unique_stock
                                      UNIQUE (reservation_id, stock_id),
                                  CONSTRAINT chk_res_item_qty
                                      CHECK (quantity > 0),
                                  CONSTRAINT chk_res_item_price
                                      CHECK (unit_price > 0),
                                  CONSTRAINT chk_res_item_subtotal
                                      CHECK (subtotal > 0)
);

CREATE TABLE notification (
                              id BIGINT PRIMARY KEY AUTO_INCREMENT,
                              reservation_id BIGINT NOT NULL,
                              message TEXT NOT NULL,
                              type VARCHAR(20) NOT NULL,
                              sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              is_read BOOLEAN NOT NULL DEFAULT FALSE,
                              created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              CONSTRAINT fk_notification_res
                                  FOREIGN KEY (reservation_id) REFERENCES reservation(id) ON DELETE CASCADE,
                              CONSTRAINT chk_notif_type
                                  CHECK (type IN ('CONFIRMATION', 'CANCELLATION', 'REMINDER', 'COMPLETION'))
);


CREATE TABLE password_reset_token (
                                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                      token VARCHAR(255) NOT NULL UNIQUE,
                                      user_id BIGINT NOT NULL,
                                      expiry_date DATETIME NOT NULL,
                                      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                      CONSTRAINT fk_password_reset_token_user
                                          FOREIGN KEY (user_id) REFERENCES user_account(id) ON DELETE CASCADE
);



INSERT INTO role (code, description) VALUES
                                         ('CLIENT', 'End user / patient'),
                                         ('PHARMACY', 'Pharmacy account'),
                                         ('ADMIN', 'Administrator');


ALTER TABLE drug
    ADD COLUMN requires_prescription BOOLEAN NOT NULL DEFAULT FALSE;


DROP TABLE IF EXISTS drug_catalog;
DROP TABLE IF EXISTS catalog;

ALTER TABLE pharmacy
    ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';

CREATE INDEX idx_pharmacy_approval_status ON pharmacy(approval_status);