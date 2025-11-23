-- Seed LLM Models with pricing (allowlisted OpenRouter options only)
INSERT INTO llm_models (
    provider,
    model_name,
    display_name,
    cost_per_1k_input_tokens,
    cost_per_1k_output_tokens,
    max_tokens
) VALUES
    -- xAI Grok 4.1 Fast (Free)
    ('xai', 'x-ai/grok-4.1-fast:free', 'Grok 4.1 Fast (Free)', 0, 0, 32768),
    -- OpenAI GPT-OSS-20B (Free)
    ('openai', 'openai/gpt-oss-20b:free', 'GPT-OSS-20B (Free)', 0, 0, 4096)
ON CONFLICT (provider, model_name) DO NOTHING;

-- Seed Model Permissions
-- All roles can use all models
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'employee', true FROM llm_models
ON CONFLICT (model_id, role) DO NOTHING;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'manager', true FROM llm_models
ON CONFLICT (model_id, role) DO NOTHING;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models
ON CONFLICT (model_id, role) DO NOTHING;
