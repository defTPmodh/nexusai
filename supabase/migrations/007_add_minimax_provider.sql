-- Add 'minimax' to the provider CHECK constraint
-- Drop existing constraint if it exists (PostgreSQL doesn't allow modifying CHECK constraints directly)
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

ALTER TABLE llm_models 
ADD CONSTRAINT llm_models_provider_check 
CHECK (provider IN ('openai', 'nvidia', 'deepseek', 'minimax'));

-- Insert Minimax model (ensure is_active is true)
INSERT INTO llm_models (provider, model_name, display_name, cost_per_1k_input_tokens, cost_per_1k_output_tokens, max_tokens, is_active) VALUES
('minimax', 'minimax-m2:free', 'Minimax M2', 0, 0, 32768, true)
ON CONFLICT (provider, model_name) 
DO UPDATE SET 
    is_active = true,
    display_name = 'Minimax M2',
    max_tokens = 32768;

-- Add permissions for Minimax model (all roles can use)
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'employee', true FROM llm_models WHERE provider = 'minimax' AND model_name = 'minimax-m2:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'manager', true FROM llm_models WHERE provider = 'minimax' AND model_name = 'minimax-m2:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models WHERE provider = 'minimax' AND model_name = 'minimax-m2:free'
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

