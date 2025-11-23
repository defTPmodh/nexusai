-- Seed LLM Models with pricing (allowlisted OpenRouter options only)
BEGIN;

-- Remove any models outside the allowlist so the seed is deterministic
DELETE FROM model_permissions WHERE model_id IN (
    SELECT id FROM llm_models
    WHERE (provider, model_name) NOT IN (
        ('xai', 'x-ai/grok-4.1-fast:free'),
        ('openai', 'openai/gpt-oss-20b:free')
    )
);

DELETE FROM llm_models
WHERE (provider, model_name) NOT IN (
    ('xai', 'x-ai/grok-4.1-fast:free'),
    ('openai', 'openai/gpt-oss-20b:free')
);

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

-- Seed permissions for all roles against the allowlist
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'employee', true FROM llm_models
WHERE (provider, model_name) IN (
    ('xai', 'x-ai/grok-4.1-fast:free'),
    ('openai', 'openai/gpt-oss-20b:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'manager', true FROM llm_models
WHERE (provider, model_name) IN (
    ('xai', 'x-ai/grok-4.1-fast:free'),
    ('openai', 'openai/gpt-oss-20b:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models
WHERE (provider, model_name) IN (
    ('xai', 'x-ai/grok-4.1-fast:free'),
    ('openai', 'openai/gpt-oss-20b:free')
)
ON CONFLICT (model_id, role) DO UPDATE SET can_use = true;

COMMIT;
