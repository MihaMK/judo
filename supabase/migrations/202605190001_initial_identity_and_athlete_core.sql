create extension if not exists pgcrypto;

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint clubs_name_not_blank check (length(trim(name)) > 0),
  constraint clubs_slug_not_blank check (length(trim(slug)) > 0)
);

create table public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  club_id uuid not null references public.clubs(id),
  role text not null,
  display_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint user_profiles_role_check check (role in ('management', 'trainer', 'parent')),
  constraint user_profiles_display_name_not_blank check (length(trim(display_name)) > 0)
);

create table public.training_groups (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  name text not null,
  description text not null default '',
  training_days text not null default '',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint training_groups_name_not_blank check (length(trim(name)) > 0),
  constraint training_groups_id_club_unique unique (id, club_id),
  constraint training_groups_name_unique_per_club unique (club_id, name)
);

create table public.athletes (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  current_group_id uuid references public.training_groups(id),
  full_name text not null,
  birth_date date not null,
  status text not null default 'active',
  joined_at date not null default current_date,
  current_belt_text text not null default 'White belt',
  profile_summary text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint athletes_full_name_not_blank check (length(trim(full_name)) > 0),
  constraint athletes_status_check check (status in ('active', 'paused', 'inactive')),
  constraint athletes_id_club_unique unique (id, club_id),
  constraint athletes_group_same_club foreign key (current_group_id, club_id) references public.training_groups(id, club_id)
);

create table public.guardians (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  full_name text not null,
  phone text not null,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint guardians_full_name_not_blank check (length(trim(full_name)) > 0),
  constraint guardians_id_club_unique unique (id, club_id),
  constraint guardians_phone_not_blank check (length(trim(phone)) > 0)
);

create table public.athlete_guardians (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  athlete_id uuid not null references public.athletes(id),
  guardian_id uuid not null references public.guardians(id),
  relationship text not null,
  is_primary_contact boolean not null default false,
  receives_notifications boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint athlete_guardians_relationship_check check (relationship in ('mother', 'father', 'guardian', 'other')),
  constraint athlete_guardians_athlete_same_club foreign key (athlete_id, club_id) references public.athletes(id, club_id),
  constraint athlete_guardians_guardian_same_club foreign key (guardian_id, club_id) references public.guardians(id, club_id)
);

create table public.trainer_profiles (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  user_profile_id uuid not null unique references public.user_profiles(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.parent_profiles (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  user_profile_id uuid not null references public.user_profiles(id),
  guardian_id uuid not null references public.guardians(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint parent_profiles_unique_guardian_user unique (user_profile_id, guardian_id)
);

create index user_profiles_auth_user_id_idx on public.user_profiles(auth_user_id) where deleted_at is null;
create index user_profiles_club_role_idx on public.user_profiles(club_id, role) where deleted_at is null;
create index training_groups_club_active_idx on public.training_groups(club_id, is_active) where deleted_at is null;
create index athletes_club_status_idx on public.athletes(club_id, status) where deleted_at is null;
create index athletes_current_group_idx on public.athletes(current_group_id) where deleted_at is null;
create index guardians_club_active_idx on public.guardians(club_id, is_active) where deleted_at is null;
create index athlete_guardians_athlete_idx on public.athlete_guardians(athlete_id) where deleted_at is null;
create index athlete_guardians_guardian_idx on public.athlete_guardians(guardian_id) where deleted_at is null;
create unique index athlete_guardians_unique_active_link_idx
  on public.athlete_guardians(athlete_id, guardian_id)
  where deleted_at is null;
create index trainer_profiles_user_profile_idx on public.trainer_profiles(user_profile_id) where deleted_at is null;
create index parent_profiles_user_profile_idx on public.parent_profiles(user_profile_id) where deleted_at is null;
create index parent_profiles_guardian_idx on public.parent_profiles(guardian_id) where deleted_at is null;

alter table public.clubs enable row level security;
alter table public.user_profiles enable row level security;
alter table public.training_groups enable row level security;
alter table public.athletes enable row level security;
alter table public.guardians enable row level security;
alter table public.athlete_guardians enable row level security;
alter table public.trainer_profiles enable row level security;
alter table public.parent_profiles enable row level security;

create policy "Users can read their active club"
on public.clubs for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = clubs.id
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Users can read their own active profile"
on public.user_profiles for select
to authenticated
using (
  deleted_at is null
  and auth_user_id = auth.uid()
  and is_active = true
);

create policy "Users can read active training groups in their club"
on public.training_groups for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = training_groups.club_id
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Management and trainers can read club athletes"
on public.athletes for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = athletes.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Parents can read linked athletes"
on public.athletes for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    join public.parent_profiles pp on pp.user_profile_id = up.id
    join public.athlete_guardians ag on ag.guardian_id = pp.guardian_id
    where up.auth_user_id = auth.uid()
      and up.club_id = athletes.club_id
      and pp.club_id = athletes.club_id
      and ag.club_id = athletes.club_id
      and ag.athlete_id = athletes.id
      and up.role = 'parent'
      and up.is_active = true
      and pp.is_active = true
      and ag.is_active = true
      and up.deleted_at is null
      and pp.deleted_at is null
      and ag.deleted_at is null
  )
);

create policy "Management and trainers can read club guardians"
on public.guardians for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = guardians.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Parents can read their own guardian records"
on public.guardians for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    join public.parent_profiles pp on pp.user_profile_id = up.id
    where up.auth_user_id = auth.uid()
      and pp.guardian_id = guardians.id
      and up.club_id = guardians.club_id
      and pp.club_id = guardians.club_id
      and up.role = 'parent'
      and up.is_active = true
      and pp.is_active = true
      and up.deleted_at is null
      and pp.deleted_at is null
  )
);

create policy "Users can read athlete guardian links in their club scope"
on public.athlete_guardians for select
to authenticated
using (
  deleted_at is null
  and (
    exists (
      select 1
      from public.user_profiles up
      where up.auth_user_id = auth.uid()
        and up.club_id = athlete_guardians.club_id
        and up.role in ('management', 'trainer')
        and up.is_active = true
        and up.deleted_at is null
    )
    or exists (
      select 1
      from public.user_profiles up
      join public.parent_profiles pp on pp.user_profile_id = up.id
      where up.auth_user_id = auth.uid()
        and pp.guardian_id = athlete_guardians.guardian_id
        and up.club_id = athlete_guardians.club_id
        and pp.club_id = athlete_guardians.club_id
        and up.role = 'parent'
        and up.is_active = true
        and pp.is_active = true
        and up.deleted_at is null
        and pp.deleted_at is null
    )
  )
);

create policy "Management and trainers can read trainer profiles in their club scope"
on public.trainer_profiles for select
to authenticated
using (
  deleted_at is null
  and (
    exists (
      select 1
      from public.user_profiles up
      where up.auth_user_id = auth.uid()
        and up.club_id = trainer_profiles.club_id
        and up.role = 'management'
        and up.is_active = true
        and up.deleted_at is null
    )
    or exists (
      select 1
      from public.user_profiles up
      where up.auth_user_id = auth.uid()
        and up.id = trainer_profiles.user_profile_id
        and up.club_id = trainer_profiles.club_id
        and up.role = 'trainer'
        and up.is_active = true
        and up.deleted_at is null
    )
  )
);

create policy "Management can read parent profiles and parents can read their own"
on public.parent_profiles for select
to authenticated
using (
  deleted_at is null
  and (
    exists (
      select 1
      from public.user_profiles up
      where up.auth_user_id = auth.uid()
        and up.club_id = parent_profiles.club_id
        and up.role = 'management'
        and up.is_active = true
        and up.deleted_at is null
    )
    or exists (
      select 1
      from public.user_profiles up
      where up.auth_user_id = auth.uid()
        and up.id = parent_profiles.user_profile_id
        and up.club_id = parent_profiles.club_id
        and up.role = 'parent'
        and up.is_active = true
        and up.deleted_at is null
    )
  )
);
