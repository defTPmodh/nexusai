INSERT INTO llm_models (provider, model_name, display_name, cost_per_1k_input_tokens, cost_per_1k_output_tokens, max_tokens) VALUES
-- OpenAI GPT-OSS-20B (Free)
('openai', 'gpt-oss-20b:free', 'OpenAI GPT-OSS-20B', 0, 0, 4096),
-- xAI Grok 4.1 Fast
('xai', 'grok-4.1-fast:free', 'xAI Grok-4.1 Fast', 0, 0, 32768),
-- Minimax M2
('minimax', 'minimax-m2:free', 'Minimax M2', 0, 0, 32768)
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

