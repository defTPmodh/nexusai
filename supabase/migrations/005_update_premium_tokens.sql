-- Update Premium plan to have 250k tokens
UPDATE plans
SET token_limit = 2500000
WHERE name = 'premium' AND (token_limit IS NULL OR token_limit != 2500000);

