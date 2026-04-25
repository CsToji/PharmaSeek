ALTER TABLE pharmacy
    ADD COLUMN approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';

CREATE INDEX idx_pharmacy_approval_status ON pharmacy(approval_status);

