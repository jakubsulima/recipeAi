-- Add indexes to support case-insensitive prefix search and ingredient lookups
CREATE INDEX IF NOT EXISTS idx_recipe_name_lower ON recipe (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_ingredient_name_lower ON ingredient (LOWER(name));
