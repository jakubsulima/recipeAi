-- Add real multi-diet support by storing selected diets per user.
-- Keep the existing user_preferences.diet column for backward compatibility.

CREATE TABLE IF NOT EXISTS user_diets (
    user_id BIGINT NOT NULL,
    diet VARCHAR(50) NOT NULL CHECK (diet IN ('NONE', 'VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'KETO', 'PALEO', 'MEDITERRANEAN', 'LOW_CARB', 'HIGH_PROTEIN', 'OTHER')),
    CONSTRAINT pk_user_diets PRIMARY KEY (user_id, diet),
    CONSTRAINT fk_user_diets_user FOREIGN KEY (user_id) REFERENCES user_preferences(user_id) ON DELETE CASCADE
);

-- Backfill existing single-diet values into the new table.
INSERT INTO user_diets (user_id, diet)
SELECT user_id,
       COALESCE(NULLIF(TRIM(diet), ''), 'NONE')
FROM user_preferences
ON CONFLICT (user_id, diet) DO NOTHING;

-- Ensure every user has at least one stored diet.
INSERT INTO user_diets (user_id, diet)
SELECT up.user_id, 'NONE'
FROM user_preferences up
LEFT JOIN user_diets ud ON ud.user_id = up.user_id
WHERE ud.user_id IS NULL
ON CONFLICT (user_id, diet) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_diets_user_id ON user_diets(user_id);
