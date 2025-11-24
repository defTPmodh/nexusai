-- Update plan token limits to new defaults
UPDATE plans
SET token_limit = 100000
WHERE name = 'free' AND (token_limit IS NULL OR token_limit != 100000);

UPDATE plans
SET token_limit = 1000000
WHERE name = 'premium' AND (token_limit IS NULL OR token_limit != 1000000);
