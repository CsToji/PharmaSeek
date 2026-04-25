CREATE TABLE users (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       email VARCHAR(120) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       role ENUM('CLIENT', 'PHARMACY') NOT NULL,
                       enabled BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE TABLE clients (
                         id BIGINT PRIMARY KEY,
                         full_name VARCHAR(120) NOT NULL,
                         cin VARCHAR(20) UNIQUE,
                         phone VARCHAR(20),
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                         FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_client_cin ON clients(cin);
CREATE TABLE pharmacies (
                            id BIGINT PRIMARY KEY,
                            pharmacy_name VARCHAR(150) NOT NULL,
                            matricule_fiscale VARCHAR(50) NOT NULL UNIQUE,
                            address VARCHAR(255) NOT NULL,
                            latitude DECIMAL(10,8) ,
                            longitude DECIMAL(11,8),
                            phone VARCHAR(20),
                            verified BOOLEAN DEFAULT FALSE,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                            FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_pharmacy_matricule ON pharmacies(matricule_fiscale);
CREATE INDEX idx_pharmacies_location ON pharmacies(latitude, longitude);
CREATE TABLE drugs (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(150) NOT NULL,
                       description TEXT,
                       requires_prescription BOOLEAN DEFAULT FALSE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_drug_name ON drugs(name);
CREATE TABLE pharmacy_stock (
                                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                pharmacy_id BIGINT NOT NULL,
                                drug_id BIGINT NOT NULL,
                                quantity INT NOT NULL CHECK (quantity >= 0),
                                price DECIMAL(10,2) NOT NULL,
                                reservation_delay_minutes INT NOT NULL,
                                version INT DEFAULT 0,
                                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                                FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE,
                                FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE,
                                UNIQUE KEY unique_stock (pharmacy_id, drug_id)
);
CREATE INDEX idx_stock_drug ON pharmacy_stock(drug_id);
CREATE INDEX idx_stock_pharmacy ON pharmacy_stock(pharmacy_id);
CREATE TABLE reservations (
                              id BIGINT AUTO_INCREMENT PRIMARY KEY,
                              client_id BIGINT NOT NULL,
                              pharmacy_id BIGINT NOT NULL,
                              status ENUM('PENDING','CONFIRMED','CANCELLED','EXPIRED') DEFAULT 'PENDING',
                              total_price DECIMAL(10,2),
                              reserved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              expiration_time DATETIME,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                              FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
                              FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE
);
CREATE INDEX idx_reservation_status ON reservations(status);
CREATE INDEX idx_reservation_client ON reservations(client_id);
CREATE INDEX idx_reservation_pharmacy ON reservations(pharmacy_id);
CREATE TABLE reservation_items (
                                   id BIGINT AUTO_INCREMENT PRIMARY KEY,
                                   reservation_id BIGINT NOT NULL,
                                   drug_id BIGINT NOT NULL,
                                   quantity INT NOT NULL CHECK (quantity > 0),
                                   price_at_reservation DECIMAL(10,2) NOT NULL,

                                   FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
                                   FOREIGN KEY (drug_id) REFERENCES drugs(id)
);
