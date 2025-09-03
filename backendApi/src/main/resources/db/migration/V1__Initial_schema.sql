-- Initial database schema for Recipe AI application
-- This migration creates all the necessary tables and relationships

-- Create app_user table
CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'ADMIN'))
);

-- Create user_preferences table
CREATE TABLE user_preferences (
    user_id BIGINT PRIMARY KEY,
    diet VARCHAR(50) CHECK (diet IN ('NONE', 'VEGETARIAN', 'VEGAN', 'GLUTEN_FREE', 'DAIRY_FREE', 'KETO', 'PALEO', 'MEDITERRANEAN', 'LOW_CARB', 'HIGH_PROTEIN', 'OTHER')),
    CONSTRAINT fk_user_preferences_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Create disliked_ingredients table (for user preferences)
CREATE TABLE disliked_ingredients (
    user_id BIGINT NOT NULL,
    ingredient VARCHAR(255) NOT NULL,
    CONSTRAINT fk_disliked_ingredients_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Create ingredient table
CREATE TABLE ingredient (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create recipe table
CREATE TABLE recipe (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    time_to_prepare VARCHAR(255),
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_recipe_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Create recipe_instructions table (for ElementCollection)
CREATE TABLE recipe_instructions (
    recipe_id BIGINT NOT NULL,
    instruction TEXT,
    CONSTRAINT fk_recipe_instructions_recipe FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE
);

-- Create recipe_ingredient table (many-to-many relationship)
CREATE TABLE recipe_ingredient (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    unit VARCHAR(255),
    CONSTRAINT fk_recipe_ingredient_recipe FOREIGN KEY (recipe_id) REFERENCES recipe(id) ON DELETE CASCADE,
    CONSTRAINT fk_recipe_ingredient_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredient(id) ON DELETE CASCADE
);

-- Create fridge_ingredient table
CREATE TABLE fridge_ingredient (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    expiration_date DATE,
    unit VARCHAR(50) CHECK (unit IN ('GRAMS', 'KILOGRAMS', 'LITERS', 'MILLILITERS', 'PIECES')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('FRIDGE', 'FREEZER', 'FRUITS_VEGETABLES', 'SHELF')),
    amount DOUBLE PRECISION NOT NULL,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_fridge_ingredient_user FOREIGN KEY (user_id) REFERENCES app_user(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_app_user_email ON app_user(email);
CREATE INDEX idx_recipe_user_id ON recipe(user_id);
CREATE INDEX idx_recipe_ingredient_recipe_id ON recipe_ingredient(recipe_id);
CREATE INDEX idx_recipe_ingredient_ingredient_id ON recipe_ingredient(ingredient_id);
CREATE INDEX idx_fridge_ingredient_user_id ON fridge_ingredient(user_id);
CREATE INDEX idx_disliked_ingredients_user_id ON disliked_ingredients(user_id);

-- Add comments for documentation
COMMENT ON TABLE app_user IS 'Users of the recipe application';
COMMENT ON TABLE user_preferences IS 'User dietary preferences and restrictions';
COMMENT ON TABLE ingredient IS 'Master list of ingredients';
COMMENT ON TABLE recipe IS 'User-created or generated recipes';
COMMENT ON TABLE fridge_ingredient IS 'Ingredients available in users fridges';
COMMENT ON TABLE recipe_ingredient IS 'Junction table linking recipes to ingredients with quantities';
