-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('free', 'premium', 'enterprise')),
  display_name TEXT NOT NULL,
  price_per_user_monthly DECIMAL(10, 2) DEFAULT 0, -- NULL for enterprise (custom pricing)
  currency TEXT NOT NULL DEFAULT 'AED',
  token_limit INTEGER, -- NULL means unlimited
  max_team_members INTEGER, -- NULL means unlimited
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  plan_id UUID REFERENCES plans(id),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  member_count INTEGER DEFAULT 0,
  max_members INTEGER, -- NULL means unlimited
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members (many-to-many relationship)
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Team Invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- User Subscriptions (for individual users or teams)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- For individual subscriptions
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE, -- For team subscriptions (NULL if individual)
  plan_id UUID REFERENCES plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update users table to include team_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_teams_owner_id ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_teams_plan_id ON teams(plan_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_team_id ON subscriptions(team_id);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id);

-- Function to update team member count
CREATE OR REPLACE FUNCTION update_team_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE teams SET member_count = (
      SELECT COUNT(*) FROM team_members WHERE team_id = NEW.team_id
    ) WHERE id = NEW.team_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE teams SET member_count = (
      SELECT COUNT(*) FROM team_members WHERE team_id = OLD.team_id
    ) WHERE id = OLD.team_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update team member count
DROP TRIGGER IF EXISTS trigger_update_team_member_count ON team_members;
CREATE TRIGGER trigger_update_team_member_count
  AFTER INSERT OR DELETE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_member_count();

-- Insert default plans
    INSERT INTO plans (name, display_name, price_per_user_monthly, currency, token_limit, max_team_members, features) VALUES
      ('free', 'Free Plan', 0, 'AED', 25000, 1, '{"rag": true, "chat": true, "documents": 10}'::jsonb),
      ('premium', 'Premium Plan', 19.99, 'AED', 250000, 100, '{"rag": true, "chat": true, "documents": -1, "priority_support": true, "advanced_analytics": true}'::jsonb),
      ('enterprise', 'Enterprise Plan', NULL, 'AED', NULL, NULL, '{"rag": true, "chat": true, "documents": -1, "priority_support": true, "advanced_analytics": true, "custom_integrations": true, "dedicated_support": true}'::jsonb)
ON CONFLICT (name) DO UPDATE SET
  token_limit = EXCLUDED.token_limit,
  max_team_members = EXCLUDED.max_team_members,
  features = EXCLUDED.features;

