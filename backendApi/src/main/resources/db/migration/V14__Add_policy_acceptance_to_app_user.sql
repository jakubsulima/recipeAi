ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS terms_version VARCHAR(32),
    ADD COLUMN IF NOT EXISTS privacy_version VARCHAR(32);
