ALTER TABLE app_user
    ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(20);

UPDATE app_user
SET subscription_plan = 'FREE'
WHERE subscription_plan IS NULL;

ALTER TABLE app_user
    ALTER COLUMN subscription_plan SET NOT NULL;

DO
$$
    BEGIN
        IF NOT EXISTS (
            SELECT 1
            FROM pg_constraint
            WHERE conname = 'chk_app_user_subscription_plan'
        ) THEN
            ALTER TABLE app_user
                ADD CONSTRAINT chk_app_user_subscription_plan
                    CHECK (subscription_plan IN ('FREE', 'PAID'));
        END IF;
    END
$$;