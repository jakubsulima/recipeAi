CREATE TABLE shopping_list_item (
    id BIGSERIAL PRIMARY KEY,
    client_item_id VARCHAR(120) NOT NULL,
    name VARCHAR(255) NOT NULL,
    amount DOUBLE PRECISION,
    unit VARCHAR(50),
    checked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_shopping_list_item_user
        FOREIGN KEY (user_id)
            REFERENCES app_user(id)
            ON DELETE CASCADE
);

CREATE INDEX idx_shopping_list_item_user_id ON shopping_list_item(user_id);
CREATE UNIQUE INDEX uk_shopping_list_item_user_client_id ON shopping_list_item(user_id, client_item_id);