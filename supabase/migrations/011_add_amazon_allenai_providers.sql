-- Add 'amazon' and 'allenai' to the provider CHECK constraint, remove 'xai'
-- Step 1: Drop existing constraint if it exists (must drop before removing rows)
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

-- Step 2: Remove xai models and handle foreign key references
-- First, handle chat_sessions - set model_id to NULL for xai models
UPDATE chat_sessions 
SET model_id = NULL 
WHERE model_id IN (SELECT id FROM llm_models WHERE provider = 'xai');

-- Delete audit records for xai models
DELETE FROM llm_requests 
WHERE model_id IN (SELECT id FROM llm_models WHERE provider = 'xai');

-- Delete permissions for xai models
DELETE FROM model_permissions 
WHERE model_id IN (SELECT id FROM llm_models WHERE provider = 'xai');

-- Now delete xai models
DELETE FROM llm_models 
WHERE provider = 'xai';

-- Step 3: Add constraint with amazon and allenai included (xai removed)
ALTER TABLE llm_models 
ADD CONSTRAINT llm_models_provider_check 
CHECK (provider IN ('openai', 'deepseek', 'minimax', 'google', 'amazon', 'allenai'));

-- Step 4: Insert new models
INSERT INTO llm_models (provider, model_name, display_name, cost_per_1k_input_tokens, cost_per_1k_output_tokens, max_tokens, is_active) VALUES
('amazon', 'nova-2-lite-v1:free', 'Amazon Nova 2 Lite v1', 0, 0, 32768, true),
('allenai', 'olmo-3-32b-think:free', 'AllenAI OLMO 3 32B Think', 0, 0, 32768, true),
('openai', 'gpt-oss-120b:free', 'OpenAI GPT-OSS-120B', 0, 0, 32768, true)
ON CONFLICT (provider, model_name) 
DO UPDATE SET 
    is_active = true,
    display_name = EXCLUDED.display_name,
    max_tokens = EXCLUDED.max_tokens,
    cost_per_1k_input_tokens = EXCLUDED.cost_per_1k_input_tokens,
    cost_per_1k_output_tokens = EXCLUDED.cost_per_1k_output_tokens;

-- Step 5: Add permissions for all roles (student, teacher, admin)
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'student', true FROM llm_models WHERE (provider, model_name) IN (
    ('amazon', 'nova-2-lite-v1:free'),
    ('allenai', 'olmo-3-32b-think:free'),
    ('openai', 'gpt-oss-120b:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'teacher', true FROM llm_models WHERE (provider, model_name) IN (
    ('amazon', 'nova-2-lite-v1:free'),
    ('allenai', 'olmo-3-32b-think:free'),
    ('openai', 'gpt-oss-120b:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'guardian', true FROM llm_models WHERE (provider, model_name) IN (
    ('amazon', 'nova-2-lite-v1:free'),
    ('allenai', 'olmo-3-32b-think:free'),
    ('openai', 'gpt-oss-120b:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models WHERE (provider, model_name) IN (
    ('amazon', 'nova-2-lite-v1:free'),
    ('allenai', 'olmo-3-32b-think:free'),
    ('openai', 'gpt-oss-120b:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

