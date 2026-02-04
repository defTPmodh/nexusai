-- Add guardian role to users and model_permissions
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK (role IN ('student', 'teacher', 'guardian', 'admin'));

ALTER TABLE model_permissions DROP CONSTRAINT IF EXISTS model_permissions_role_check;
ALTER TABLE model_permissions
  ADD CONSTRAINT model_permissions_role_check CHECK (role IN ('student', 'teacher', 'guardian', 'admin'));

-- Classroom invitations (for teacher/student/guardian roles)
CREATE TABLE IF NOT EXISTS classroom_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student', 'guardian')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_classroom_invitations_team_id ON classroom_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_classroom_invitations_email ON classroom_invitations(email);
CREATE INDEX IF NOT EXISTS idx_classroom_invitations_token ON classroom_invitations(token);
