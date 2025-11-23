-- Seed additional models for Supabase (run directly in Supabase SQL Editor)
-- Includes Grok, updated DeepSeek, free GPT-OSS, and Minimax coverage.

-- Step 1: Ensure provider constraint allows xAI
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'llm_models_provider_check'
        AND conrelid = 'llm_models'::regclass
    ) THEN
        ALTER TABLE llm_models DROP CONSTRAINT llm_models_provider_check;
    END IF;

    ALTER TABLE llm_models
    ADD CONSTRAINT llm_models_provider_check
    CHECK (provider IN ('openai', 'deepseek', 'minimax', 'google', 'xai'));
END $$;

INSERT INTO llm_models (
    provider,
    model_name,
    display_name,
    cost_per_1k_input_tokens,
    cost_per_1k_output_tokens,
    max_tokens,
    is_active
) VALUES
    ('xai', 'grok-4.1-fast:free', 'xAI Grok-4.1 Fast', 0, 0, 32768, true),
    ('openai', 'gpt-oss-20b:free', 'OpenAI GPT-OSS-20B', 0, 0, 4096, true),
    ('minimax', 'minimax-m2:free', 'Minimax M2', 0, 0, 32768, true)
ON CONFLICT (provider, model_name)
DO UPDATE SET
    is_active = true,
    display_name = EXCLUDED.display_name,
    max_tokens = EXCLUDED.max_tokens,
    cost_per_1k_input_tokens = EXCLUDED.cost_per_1k_input_tokens,
    cost_per_1k_output_tokens = EXCLUDED.cost_per_1k_output_tokens;

-- Step 3: Grant permissions for all roles
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'employee', true FROM llm_models WHERE (provider, model_name) IN (
    ('xai', 'grok-4.1-fast:free'),
    ('openai', 'gpt-oss-20b:free'),
    ('minimax', 'minimax-m2:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'manager', true FROM llm_models WHERE (provider, model_name) IN (
    ('xai', 'grok-4.1-fast:free'),
    ('openai', 'gpt-oss-20b:free'),
    ('minimax', 'minimax-m2:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models WHERE (provider, model_name) IN (
    ('xai', 'grok-4.1-fast:free'),
    ('openai', 'gpt-oss-20b:free'),
    ('minimax', 'minimax-m2:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

-- Step 4: Quick verification
SELECT
    lm.provider,
    lm.model_name,
    lm.display_name,
    lm.is_active,
    COUNT(mp.id) AS permission_count
FROM llm_models lm
LEFT JOIN model_permissions mp ON mp.model_id = lm.id AND mp.can_use = true
WHERE (lm.provider, lm.model_name) IN (
    ('xai', 'grok-4.1-fast:free'),
    ('openai', 'gpt-oss-20b:free'),
    ('minimax', 'minimax-m2:free')
)
GROUP BY lm.provider, lm.model_name, lm.display_name, lm.is_active;
