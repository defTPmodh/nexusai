-- Quick Fix: Run this directly in Supabase SQL Editor to add Minimax model
-- This ensures everything is set up correctly

-- Step 1: Update constraint to allow 'minimax'
ALTER TABLE llm_models DROP CONSTRAINT IF EXISTS llm_models_provider_check;
ALTER TABLE llm_models ADD CONSTRAINT llm_models_provider_check 
CHECK (provider IN ('openai', 'nvidia', 'deepseek', 'minimax'));

-- Step 2: Insert or update Minimax model (ensure it's active)
INSERT INTO llm_models (provider, model_name, display_name, cost_per_1k_input_tokens, cost_per_1k_output_tokens, max_tokens, is_active) 
VALUES ('minimax', 'minimax-m2:free', 'Minimax M2', 0, 0, 32768, true)
ON CONFLICT (provider, model_name) 
DO UPDATE SET 
    is_active = true,
    display_name = 'Minimax M2',
    max_tokens = 32768;

-- Step 3: Add permissions for all roles
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'employee', true FROM llm_models WHERE provider = 'minimax' AND model_name = 'minimax-m2:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'manager', true FROM llm_models WHERE provider = 'minimax' AND model_name = 'minimax-m2:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models WHERE provider = 'minimax' AND model_name = 'minimax-m2:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

-- Step 4: Verify it was created
SELECT 
    lm.id,
    lm.provider,
    lm.model_name,
    lm.display_name,
    lm.is_active,
    COUNT(mp.id) as permission_count
FROM llm_models lm
LEFT JOIN model_permissions mp ON mp.model_id = lm.id AND mp.can_use = true
WHERE lm.provider = 'minimax'
GROUP BY lm.id, lm.provider, lm.model_name, lm.display_name, lm.is_active;

