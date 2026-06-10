-- Membership foundation for monthly club fees.
-- This migration introduces membership start months, immutable payment allocations,
-- and explicit non-payable month exemptions without changing auth/RLS architecture.

create unique index if not exists user_profiles_id_club_unique_idx
  on public.user_profiles(id, club_id);

create unique index if not exists payments_id_club_unique_idx
  on public.payments(id, club_id);

create table if not exists public.athlete_memberships (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete restrict,
  athlete_id uuid not null references public.athletes(id) on delete restrict,
  start_month date not null,
  monthly_fee numeric(12, 2) not null default 1000,
  status text not null default 'active',
  created_by_user_profile_id uuid references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint athlete_memberships_start_month_first_day check (date_trunc('month', start_month)::date = start_month),
  constraint athlete_memberships_monthly_fee_positive check (monthly_fee > 0),
  constraint athlete_memberships_status_check check (status in ('active', 'paused', 'inactive')),
  constraint athlete_memberships_athlete_same_club foreign key (athlete_id, club_id) references public.athletes(id, club_id),
  constraint athlete_memberships_creator_same_club foreign key (created_by_user_profile_id, club_id) references public.user_profiles(id, club_id)
);

create unique index if not exists athlete_memberships_one_active_per_athlete_idx
  on public.athlete_memberships(club_id, athlete_id)
  where deleted_at is null;

create index if not exists athlete_memberships_club_status_idx
  on public.athlete_memberships(club_id, status)
  where deleted_at is null;

create table if not exists public.membership_payment_allocations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete restrict,
  athlete_id uuid not null references public.athletes(id) on delete restrict,
  payment_id uuid not null references public.payments(id) on delete restrict,
  membership_month date not null,
  amount_allocated numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint membership_payment_allocations_month_first_day check (date_trunc('month', membership_month)::date = membership_month),
  constraint membership_payment_allocations_amount_positive check (amount_allocated > 0),
  constraint membership_payment_allocations_athlete_same_club foreign key (athlete_id, club_id) references public.athletes(id, club_id),
  constraint membership_payment_allocations_payment_same_club foreign key (payment_id, club_id) references public.payments(id, club_id)
);

create unique index if not exists membership_allocations_unique_active_month_idx
  on public.membership_payment_allocations(club_id, athlete_id, membership_month)
  where deleted_at is null;

create index if not exists membership_allocations_payment_idx
  on public.membership_payment_allocations(payment_id)
  where deleted_at is null;

create index if not exists membership_allocations_athlete_month_idx
  on public.membership_payment_allocations(club_id, athlete_id, membership_month)
  where deleted_at is null;

create table if not exists public.membership_month_exemptions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete restrict,
  athlete_id uuid not null references public.athletes(id) on delete restrict,
  membership_month date not null,
  reason text not null,
  note text not null default '',
  created_by_user_profile_id uuid not null references public.user_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  voided_by_user_profile_id uuid references public.user_profiles(id) on delete restrict,
  voided_at timestamptz,
  deleted_at timestamptz,
  constraint membership_month_exemptions_month_first_day check (date_trunc('month', membership_month)::date = membership_month),
  constraint membership_month_exemptions_reason_not_blank check (length(trim(reason)) > 0),
  constraint membership_month_exemptions_athlete_same_club foreign key (athlete_id, club_id) references public.athletes(id, club_id),
  constraint membership_month_exemptions_creator_same_club foreign key (created_by_user_profile_id, club_id) references public.user_profiles(id, club_id),
  constraint membership_month_exemptions_voider_same_club foreign key (voided_by_user_profile_id, club_id) references public.user_profiles(id, club_id)
);

create unique index if not exists membership_exemptions_unique_active_month_idx
  on public.membership_month_exemptions(club_id, athlete_id, membership_month)
  where deleted_at is null and voided_at is null;

create index if not exists membership_exemptions_athlete_month_idx
  on public.membership_month_exemptions(club_id, athlete_id, membership_month)
  where deleted_at is null;

alter table public.athlete_memberships enable row level security;
alter table public.membership_payment_allocations enable row level security;
alter table public.membership_month_exemptions enable row level security;

drop policy if exists "Users can read athlete memberships in their club scope" on public.athlete_memberships;
create policy "Users can read athlete memberships in their club scope"
on public.athlete_memberships for select
to authenticated
using (
  deleted_at is null
  and (
    exists (
      select 1
      from public.user_profiles up
      where up.auth_user_id = auth.uid()
        and up.club_id = athlete_memberships.club_id
        and up.role in ('management', 'trainer')
        and up.is_active = true
        and up.deleted_at is null
    )
    or exists (
      select 1
      from public.user_profiles up
      join public.parent_profiles pp on pp.user_profile_id = up.id
      join public.athlete_guardians ag on ag.guardian_id = pp.guardian_id
      where up.auth_user_id = auth.uid()
        and up.club_id = athlete_memberships.club_id
        and pp.club_id = athlete_memberships.club_id
        and ag.club_id = athlete_memberships.club_id
        and ag.athlete_id = athlete_memberships.athlete_id
        and up.role = 'parent'
        and up.is_active = true
        and pp.is_active = true
        and ag.is_active = true
        and up.deleted_at is null
        and pp.deleted_at is null
        and ag.deleted_at is null
    )
  )
);

drop policy if exists "Management can manage athlete memberships" on public.athlete_memberships;
create policy "Management can manage athlete memberships"
on public.athlete_memberships for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = athlete_memberships.club_id
      and up.role = 'management'
      and up.is_active = true
      and up.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = athlete_memberships.club_id
      and up.role = 'management'
      and up.is_active = true
      and up.deleted_at is null
  )
);

drop policy if exists "Users can read membership payment allocations in their club scope" on public.membership_payment_allocations;
create policy "Users can read membership payment allocations in their club scope"
on public.membership_payment_allocations for select
to authenticated
using (
  deleted_at is null
  and (
    exists (
      select 1
      from public.user_profiles up
      where up.auth_user_id = auth.uid()
        and up.club_id = membership_payment_allocations.club_id
        and up.role in ('management', 'trainer')
        and up.is_active = true
        and up.deleted_at is null
    )
    or exists (
      select 1
      from public.user_profiles up
      join public.parent_profiles pp on pp.user_profile_id = up.id
      join public.athlete_guardians ag on ag.guardian_id = pp.guardian_id
      where up.auth_user_id = auth.uid()
        and up.club_id = membership_payment_allocations.club_id
        and pp.club_id = membership_payment_allocations.club_id
        and ag.club_id = membership_payment_allocations.club_id
        and ag.athlete_id = membership_payment_allocations.athlete_id
        and up.role = 'parent'
        and up.is_active = true
        and pp.is_active = true
        and ag.is_active = true
        and up.deleted_at is null
        and pp.deleted_at is null
        and ag.deleted_at is null
    )
  )
);

drop policy if exists "Management and trainers can insert membership payment allocations" on public.membership_payment_allocations;
create policy "Management and trainers can insert membership payment allocations"
on public.membership_payment_allocations for insert
to authenticated
with check (
  exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = membership_payment_allocations.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
);

drop policy if exists "Users can read membership exemptions in their club scope" on public.membership_month_exemptions;
create policy "Users can read membership exemptions in their club scope"
on public.membership_month_exemptions for select
to authenticated
using (
  deleted_at is null
  and (
    exists (
      select 1
      from public.user_profiles up
      where up.auth_user_id = auth.uid()
        and up.club_id = membership_month_exemptions.club_id
        and up.role in ('management', 'trainer')
        and up.is_active = true
        and up.deleted_at is null
    )
    or exists (
      select 1
      from public.user_profiles up
      join public.parent_profiles pp on pp.user_profile_id = up.id
      join public.athlete_guardians ag on ag.guardian_id = pp.guardian_id
      where up.auth_user_id = auth.uid()
        and up.club_id = membership_month_exemptions.club_id
        and pp.club_id = membership_month_exemptions.club_id
        and ag.club_id = membership_month_exemptions.club_id
        and ag.athlete_id = membership_month_exemptions.athlete_id
        and up.role = 'parent'
        and up.is_active = true
        and pp.is_active = true
        and ag.is_active = true
        and up.deleted_at is null
        and pp.deleted_at is null
        and ag.deleted_at is null
    )
  )
);

drop policy if exists "Management and trainers can manage membership exemptions" on public.membership_month_exemptions;
create policy "Management and trainers can manage membership exemptions"
on public.membership_month_exemptions for all
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = membership_month_exemptions.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
)
with check (
  exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = membership_month_exemptions.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
);




