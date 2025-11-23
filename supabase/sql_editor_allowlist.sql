-- Restrict available models to the approved OpenRouter allowlist (SQL editor ready)
-- Models: x-ai/grok-4.1-fast:free, openai/gpt-oss-20b:free

BEGIN;

-- Drop existing provider constraint so we can tighten allowed providers
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'llm_models_provider_check'
        AND conrelid = 'llm_models'::regclass
    ) THEN
        ALTER TABLE llm_models DROP CONSTRAINT llm_models_provider_check;
    END IF;
END $$;

-- Clear references to models outside the allowlist
UPDATE chat_sessions
SET model_id = NULL
WHERE model_id IN (
    SELECT id FROM llm_models
    WHERE (provider, model_name) NOT IN (
        ('openai', 'openai/gpt-oss-20b:free'),
        ('xai', 'x-ai/grok-4.1-fast:free')
    )
);

DELETE FROM llm_requests
WHERE model_id IN (
    SELECT id FROM llm_models
    WHERE (provider, model_name) NOT IN (
        ('openai', 'openai/gpt-oss-20b:free'),
        ('xai', 'x-ai/grok-4.1-fast:free')
    )
);

-- Remove all non-allowlisted models
DELETE FROM model_permissions
WHERE model_id IN (
    SELECT id FROM llm_models
    WHERE (provider, model_name) NOT IN (
        ('openai', 'openai/gpt-oss-20b:free'),
        ('xai', 'x-ai/grok-4.1-fast:free')
    )
);

DELETE FROM llm_models
WHERE (provider, model_name) NOT IN (
    ('openai', 'openai/gpt-oss-20b:free'),
    ('xai', 'x-ai/grok-4.1-fast:free')
);

-- Enforce provider constraint (only OpenAI + xAI)
ALTER TABLE llm_models
ADD CONSTRAINT IF NOT EXISTS llm_models_provider_check
CHECK (provider IN ('openai', 'xai'));

-- Upsert the allowlisted models
INSERT INTO llm_models (
    provider,
    model_name,
    display_name,
    cost_per_1k_input_tokens,
    cost_per_1k_output_tokens,
    max_tokens,
    is_active
) VALUES
    ('xai', 'x-ai/grok-4.1-fast:free', 'Grok 4.1 Fast (Free)', 0, 0, 32768, true),
    ('openai', 'openai/gpt-oss-20b:free', 'GPT-OSS-20B (Free)', 0, 0, 4096, true)
ON CONFLICT (provider, model_name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    cost_per_1k_input_tokens = EXCLUDED.cost_per_1k_input_tokens,
    cost_per_1k_output_tokens = EXCLUDED.cost_per_1k_output_tokens,
    max_tokens = EXCLUDED.max_tokens,
    is_active = true;

-- Ensure permissions for all roles
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'employee', true FROM llm_models WHERE (provider, model_name) IN (
    ('openai', 'openai/gpt-oss-20b:free'),
    ('xai', 'x-ai/grok-4.1-fast:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'manager', true FROM llm_models WHERE (provider, model_name) IN (
    ('openai', 'openai/gpt-oss-20b:free'),
    ('xai', 'x-ai/grok-4.1-fast:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models WHERE (provider, model_name) IN (
    ('openai', 'openai/gpt-oss-20b:free'),
    ('xai', 'x-ai/grok-4.1-fast:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

COMMIT;
