-- RLS validation checklist for the Judo project.
-- Run against a local Supabase database after creating real Auth users and
-- user_profiles mappings. These are scenario checks, not production policies.
--
-- Do not run these checks with a service role connection. Service role bypasses
-- RLS and cannot validate real app visibility.

-- 1. As a management user:
-- select id, full_name from public.athletes;
-- Expected: all active club athletes are visible.

-- 2. As a trainer user:
-- select id, full_name from public.athletes;
-- Expected: operational club athletes are visible.

-- 3. As a parent user linked through parent_profiles -> guardians:
-- select id, full_name from public.athletes;
-- Expected: only linked children are visible.

-- 4. As a parent user:
-- select id, full_name from public.guardians;
-- Expected: only the parent's own guardian record is visible.

-- 5. As an authenticated user without user_profiles:
-- select id, full_name from public.athletes;
-- Expected: no rows.

-- 6. Anonymous:
-- select id, full_name from public.athletes;
-- Expected: no rows.

-- 7. Parent direct profile route equivalent:
-- As parent-ana, try to select Marko's athlete ID.
-- Expected: no rows.

-- 8. Parent guardian isolation:
-- As parent-ana, try to select Elena/Viktor/Sara guardian rows.
-- Expected: no rows.
