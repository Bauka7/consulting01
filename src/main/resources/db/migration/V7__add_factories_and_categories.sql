CREATE TABLE factories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    location    VARCHAR(255),
    image_url   TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE product_categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url    TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE factory_categories (
    factory_id  UUID NOT NULL REFERENCES factories(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (factory_id, category_id)
);

ALTER TABLE consultants ADD COLUMN factory_id UUID REFERENCES factories(id) ON DELETE SET NULL;
ALTER TABLE requests    ADD COLUMN factory_id UUID REFERENCES factories(id) ON DELETE SET NULL;

CREATE INDEX idx_factories_name         ON factories(name);
CREATE INDEX idx_consultants_factory_id ON consultants(factory_id);
CREATE INDEX idx_requests_factory_id    ON requests(factory_id);
