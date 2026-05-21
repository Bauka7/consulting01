-- =================================================================
-- V9: Request order detail fields + shipment tracking
-- =================================================================

ALTER TABLE requests
    ADD COLUMN quantity        INTEGER            CHECK (quantity > 0),
    ADD COLUMN unit            VARCHAR(20),
    ADD COLUMN deadline        DATE,
    ADD COLUMN tracking_number VARCHAR(100),
    ADD COLUMN tracking_url    TEXT,
    ADD COLUMN shipped_at      TIMESTAMP,
    ADD COLUMN factory_comment TEXT;

-- Index for factory lookup (consultant queries requests by factory)
CREATE INDEX idx_requests_factory_id ON requests(factory_id) WHERE factory_id IS NOT NULL;

COMMENT ON COLUMN requests.quantity        IS 'Number of units ordered';
COMMENT ON COLUMN requests.unit            IS 'Unit of measurement: шт, кг, м², м, тонн, контейнер';
COMMENT ON COLUMN requests.deadline        IS 'Desired delivery deadline (client-specified)';
COMMENT ON COLUMN requests.tracking_number IS 'Shipment tracking number (entered by consultant/factory)';
COMMENT ON COLUMN requests.tracking_url    IS 'Direct link to courier tracking page';
COMMENT ON COLUMN requests.shipped_at      IS 'Timestamp when shipment was dispatched';
COMMENT ON COLUMN requests.factory_comment IS 'Factory response/comment to consultant (production notes, price, lead time)';
