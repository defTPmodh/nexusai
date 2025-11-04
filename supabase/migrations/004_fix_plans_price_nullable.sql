-- Fix plans table to allow NULL price_per_user_monthly for Enterprise plan
ALTER TABLE plans ALTER COLUMN price_per_user_monthly DROP NOT NULL;

-- Update enterprise plan if it exists with NULL price
UPDATE plans SET price_per_user_monthly = NULL WHERE name = 'enterprise' AND price_per_user_monthly IS NOT NULL;

