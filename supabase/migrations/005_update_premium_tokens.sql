-- Update Premium plan to have 250k tokens
UPDATE plans
SET token_limit = 250000
WHERE name = 'premium' AND (token_limit IS NULL OR token_limit != 250000);

