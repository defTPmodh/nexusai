INSERT INTO llm_models (provider, model_name, display_name, cost_per_1k_input_tokens, cost_per_1k_output_tokens, max_tokens) VALUES
-- OpenAI GPT-OSS-20B (Free)
('openai', 'gpt-oss-20b:free', 'OpenAI GPT-OSS-20B', 0, 0, 4096),
-- Minimax M2
('minimax', 'minimax-m2:free', 'Minimax M2', 0, 0, 32768),
-- Amazon Nova 2 Lite v1
('amazon', 'nova-2-lite-v1:free', 'Amazon Nova 2 Lite v1', 0, 0, 32768),
-- AllenAI OLMO 3 32B Think
('allenai', 'olmo-3-32b-think:free', 'AllenAI OLMO 3 32B Think', 0, 0, 32768),
-- OpenAI GPT-OSS-120B
('openai', 'gpt-oss-120b:free', 'OpenAI GPT-OSS-120B', 0, 0, 32768)
ON CONFLICT (provider, model_name) DO NOTHING;

-- Seed Model Permissions
-- All roles can use all models
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'student', true FROM llm_models
ON CONFLICT (model_id, role) DO NOTHING;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'teacher', true FROM llm_models
ON CONFLICT (model_id, role) DO NOTHING;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'guardian', true FROM llm_models
ON CONFLICT (model_id, role) DO NOTHING;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models
ON CONFLICT (model_id, role) DO NOTHING;

