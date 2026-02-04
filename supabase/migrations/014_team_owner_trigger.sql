-- Ensure team creator becomes an owner member automatically
CREATE OR REPLACE FUNCTION public.add_team_owner_member()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure FK checks can be deferred if constraint is deferrable
  SET CONSTRAINTS ALL DEFERRED;
  IF NEW.owner_id IS NOT NULL THEN
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner')
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_add_team_owner_member ON public.teams;
CREATE TRIGGER trigger_add_team_owner_member
AFTER INSERT ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.add_team_owner_member();
