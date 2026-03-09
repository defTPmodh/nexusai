-- Revert school-focused roles back to business roles
-- student -> employee
-- teacher -> manager
-- guardian -> contractor

-- Normalize existing user and permission roles
UPDATE users SET role = 'employee' WHERE role = 'student';
UPDATE users SET role = 'manager' WHERE role = 'teacher';
UPDATE users SET role = 'contractor' WHERE role = 'guardian';

UPDATE model_permissions SET role = 'employee' WHERE role = 'student';
UPDATE model_permissions SET role = 'manager' WHERE role = 'teacher';
UPDATE model_permissions SET role = 'contractor' WHERE role = 'guardian';

-- Enforce business role constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('employee', 'manager', 'contractor', 'admin'));
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'employee';

ALTER TABLE model_permissions DROP CONSTRAINT IF EXISTS model_permissions_role_check;
ALTER TABLE model_permissions
  ADD CONSTRAINT model_permissions_role_check CHECK (role IN ('employee', 'manager', 'contractor', 'admin'));

-- Ensure every active model has permissions for business roles
INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'employee', true FROM llm_models
ON CONFLICT (model_id, role) DO UPDATE SET can_use = EXCLUDED.can_use;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'manager', true FROM llm_models
ON CONFLICT (model_id, role) DO UPDATE SET can_use = EXCLUDED.can_use;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'contractor', true FROM llm_models
ON CONFLICT (model_id, role) DO UPDATE SET can_use = EXCLUDED.can_use;

INSERT INTO model_permissions (model_id, role, can_use)
SELECT id, 'admin', true FROM llm_models
ON CONFLICT (model_id, role) DO UPDATE SET can_use = EXCLUDED.can_use;

-- Business invitation table (replaces classroom invitations)
CREATE TABLE IF NOT EXISTS business_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'employee', 'contractor')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_business_invitations_team_id ON business_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_business_invitations_email ON business_invitations(email);
CREATE INDEX IF NOT EXISTS idx_business_invitations_token ON business_invitations(token);

-- Migrate any existing classroom invitations if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'classroom_invitations'
  ) THEN
    INSERT INTO business_invitations (
      id, team_id, email, invited_by, role, token, status, expires_at, created_at, accepted_at
    )
    SELECT
      id,
      team_id,
      email,
      invited_by,
      CASE role
        WHEN 'teacher' THEN 'manager'
        WHEN 'student' THEN 'employee'
        WHEN 'guardian' THEN 'contractor'
        ELSE 'employee'
      END,
      token,
      status,
      expires_at,
      created_at,
      accepted_at
    FROM classroom_invitations
    ON CONFLICT (token) DO NOTHING;

    DROP TABLE IF EXISTS classroom_invitations;
  END IF;
END $$;
