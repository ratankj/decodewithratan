
CREATE OR REPLACE FUNCTION public.get_all_users_admin()
RETURNS TABLE (
  profile_id uuid,
  user_id uuid,
  email text,
  display_name text,
  level integer,
  xp_points integer,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id as profile_id,
    p.user_id,
    u.email::text,
    p.display_name,
    p.level,
    p.xp_points,
    p.created_at
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  ORDER BY p.created_at DESC;
$$;
