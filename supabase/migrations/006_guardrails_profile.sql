-- Guardrails table for admin-configured PII detection rules
CREATE TABLE IF NOT EXISTS guardrails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  pii_types TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of PII types to detect: ['ssn', 'credit_card', 'email', 'phone', 'ip_address']
  action TEXT NOT NULL DEFAULT 'redact' CHECK (action IN ('redact', 'block', 'warn')), -- What to do when PII is detected
  allowlist_patterns TEXT[] DEFAULT ARRAY[]::TEXT[], -- Regex patterns to allowlist
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for enabled guardrails
CREATE INDEX IF NOT EXISTS idx_guardrails_enabled ON guardrails(enabled) WHERE enabled = true;

-- Insert default guardrail
INSERT INTO guardrails (name, description, enabled, pii_types, action) VALUES
  ('default', 'Default PII detection guardrail', true, ARRAY['ssn', 'credit_card', 'email', 'phone', 'ip_address'], 'redact')
ON CONFLICT (name) DO NOTHING;

-- Users table updates for profile information
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

