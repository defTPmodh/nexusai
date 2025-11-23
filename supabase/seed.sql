-- Seed LLM Models with pricing
INSERT INTO llm_models (provider, model_name, display_name, cost_per_1k_input_tokens, cost_per_1k_output_tokens, max_tokens) VALUES
-- Google Gemini 2.0 Flash Exp (Free)
('google', 'gemini-2.0-flash-exp:free', 'Google Gemini 2.0 Flash Exp (Free)', 0, 0, 8192),
-- DeepSeek (model_name will be mapped to 'deepseek-chat' in code)
('deepseek', 'deepseek-v3.1', 'DeepSeek V3.1', 0.00014, 0.00056, 16384),
-- DeepSeek Chat V3.0324 (Free)
('deepseek', 'deepseek-chat-v3-0324:free', 'DeepSeek Chat V3.0324 (Free)', 0, 0, 32768),
-- OpenAI GPT-OSS-20B
('openai', 'gpt-oss-20b', 'OpenAI GPT-OSS-20B', 0.0005, 0.0015, 4096),
-- OpenAI GPT-OSS-20B (Free)
('openai', 'gpt-oss-20b:free', 'OpenAI GPT-OSS-20B (Free)', 0, 0, 4096),
-- xAI Grok 4.1 Fast (Free)
('xai', 'grok-4.1-fast:free', 'xAI Grok-4.1 Fast (Free)', 0, 0, 32768),
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

