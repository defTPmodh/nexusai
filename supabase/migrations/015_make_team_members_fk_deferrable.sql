-- Make team_members.team_id FK deferrable to avoid timing issues on insert
ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_team_id_fkey;
ALTER TABLE team_members
  ADD CONSTRAINT team_members_team_id_fkey
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
  DEFERRABLE INITIALLY DEFERRED;
