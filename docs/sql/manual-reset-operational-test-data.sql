-- Manual controlled reset for pre-production/demo operational data.
-- DO NOT RUN unless it is explicitly confirmed that current athletes, guardians,
-- attendance, payments, messages, and measurements are test/demo data.
-- This script intentionally preserves clubs, auth users, user_profiles,
-- trainer_profiles, training_groups, belt_ranks, age_groups, and weight_categories.

begin;

do $$
begin
  if to_regclass('public.membership_payment_allocations') is not null then
    execute 'delete from public.membership_payment_allocations';
  end if;

  if to_regclass('public.membership_month_exemptions') is not null then
    execute 'delete from public.membership_month_exemptions';
  end if;

  if to_regclass('public.parent_messages') is not null then
    execute 'delete from public.parent_messages';
  end if;

  if to_regclass('public.athlete_weight_measurements') is not null then
    execute 'delete from public.athlete_weight_measurements';
  end if;

  if to_regclass('public.attendance_entries') is not null then
    execute 'delete from public.attendance_entries';
  end if;

  if to_regclass('public.attendance_sessions') is not null then
    execute 'delete from public.attendance_sessions';
  end if;

  if to_regclass('public.payments') is not null then
    execute 'delete from public.payments';
  end if;

  if to_regclass('public.athlete_guardians') is not null then
    execute 'delete from public.athlete_guardians';
  end if;

  if to_regclass('public.parent_profiles') is not null then
    execute 'delete from public.parent_profiles';
  end if;

  if to_regclass('public.guardians') is not null then
    execute 'delete from public.guardians';
  end if;

  if to_regclass('public.athlete_memberships') is not null then
    execute 'delete from public.athlete_memberships';
  end if;

  if to_regclass('public.athletes') is not null then
    execute 'delete from public.athletes';
  end if;
end $$;

commit;

-- Validation after reset:
-- select count(*) from public.athletes;
-- select count(*) from public.guardians;
-- select count(*) from public.payments;
