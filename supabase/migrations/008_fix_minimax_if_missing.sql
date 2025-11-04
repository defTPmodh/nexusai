-- Fix script: Ensure Minimax model and permissions exist
-- Run this if the model isn't showing up

-- First, ensure the constraint allows 'minimax'
DO $$ 
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'llm_models_provider_check' 
        AND conrelid = 'llm_models'::regclass
    ) THEN
        ALTER TABLE llm_models DROP CONSTRAINT llm_models_provider_check;
    END IF;
    
    -- Add constraint with minimax included
    ALTER TABLE llm_models ADD CONSTRAINT llm_models_provider_check 
    CHECK (provider IN ('openai', 'nvidia', 'deepseek', 'minimax'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Insert or update Minimax model (ensure is_active is true)
INSERT INTO llm_models (provider, model_name, display_name, cost_per_1k_input_tokens, cost_per_1k_output_tokens, max_tokens, is_active) 
VALUES ('minimax', 'minimax-m2:free', 'Minimax M2', 0, 0, 32768, true)
ON CONFLICT (provider, model_name) 
DO UPDATE SET 
    is_active = true,
    display_name = 'Minimax M2',
    max_tokens = 32768,
    cost_per_1k_input_tokens = 0,
    cost_per_1k_output_tokens = 0;

-- Get the Minimax model ID and add permissions
DO $$
DECLARE
    minimax_id UUID;
BEGIN
    SELECT id INTO minimax_id FROM llm_models WHERE provider = 'minimax' AND model_name = 'minimax-m2:free';
    
    IF minimax_id IS NOT NULL THEN
        -- Add/update permissions for all roles
        INSERT INTO model_permissions (model_id, role, can_use)
        VALUES 
            (minimax_id, 'employee', true),
            (minimax_id, 'manager', true),
            (minimax_id, 'admin', true)
        ON CONFLICT (model_id, role) 
        DO UPDATE SET can_use = true;
        
        RAISE NOTICE 'Minimax model ID: %, Permissions created/updated', minimax_id;
    ELSE
        RAISE NOTICE 'ERROR: Minimax model not found after insert!';
    END IF;
END $$;

