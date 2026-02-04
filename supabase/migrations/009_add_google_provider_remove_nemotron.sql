-- Add 'google' to the provider CHECK constraint and remove all nvidia models
-- Step 1: Drop existing constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'llm_models_provider_check' 
        AND conrelid = 'llm_models'::regclass
    ) THEN
        ALTER TABLE llm_models DROP CONSTRAINT llm_models_provider_check;
    END IF;
END $$;

-- Step 2: Remove all nvidia models and their permissions BEFORE adding new constraint
-- First, handle foreign key references
-- For chat_sessions, set model_id to NULL (preserves session history)
UPDATE chat_sessions 
SET model_id = NULL 
WHERE model_id IN (SELECT id FROM llm_models WHERE provider = 'nvidia');

-- For llm_requests, delete the audit records (they're just logs, safe to remove)
DELETE FROM llm_requests 
WHERE model_id IN (SELECT id FROM llm_models WHERE provider = 'nvidia');

-- Delete permissions for nvidia models (has ON DELETE CASCADE, but being explicit)
DELETE FROM model_permissions 
WHERE model_id IN (SELECT id FROM llm_models WHERE provider = 'nvidia');

-- Now delete nvidia models (all foreign key references are cleared)
DELETE FROM llm_models 
WHERE provider = 'nvidia';

-- Step 3: Now add constraint with google included, nvidia removed
ALTER TABLE llm_models 
ADD CONSTRAINT llm_models_provider_check 
CHECK (provider IN ('openai', 'deepseek', 'minimax', 'google'));

-- Insert Google Gemini 2.0 Flash Exp model (free tier)
INSERT INTO llm_models (provider, model_name, display_name, cost_per_1k_input_tokens, cost_per_1k_output_tokens, max_tokens, is_active) VALUES
('google', 'gemini-2.0-flash-exp:free', 'Google Gemini 2.0 Flash Exp (Free)', 0, 0, 8192, true)
ON CONFLICT (provider, model_name) 
DO UPDATE SET 
    is_active = true,
    display_name = 'Google Gemini 2.0 Flash Exp (Free)',
    max_tokens = 8192;

-- Add permissions for Gemini model (all roles can use)
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'student', true FROM llm_models WHERE provider = 'google' AND model_name = 'gemini-2.0-flash-exp:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'teacher', true FROM llm_models WHERE provider = 'google' AND model_name = 'gemini-2.0-flash-exp:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'guardian', true FROM llm_models WHERE provider = 'google' AND model_name = 'gemini-2.0-flash-exp:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models WHERE provider = 'google' AND model_name = 'gemini-2.0-flash-exp:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

