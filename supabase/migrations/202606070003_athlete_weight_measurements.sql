create table if not exists public.athlete_weight_measurements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  athlete_id uuid not null references public.athletes(id),
  measured_at date not null default current_date,
  weight numeric(6,2) not null,
  note text not null default '',
  created_by_user_profile_id uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint athlete_weight_measurements_weight_positive check (weight > 0),
  constraint athlete_weight_measurements_athlete_same_club foreign key (athlete_id, club_id) references public.athletes(id, club_id)
);

create index if not exists athlete_weight_measurements_athlete_date_idx
  on public.athlete_weight_measurements(athlete_id, measured_at desc, created_at desc)
  where deleted_at is null;

create index if not exists athlete_weight_measurements_club_date_idx
  on public.athlete_weight_measurements(club_id, measured_at desc)
  where deleted_at is null;

alter table public.athlete_weight_measurements enable row level security;

create policy "Management and trainers can read athlete weight measurements"
on public.athlete_weight_measurements for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = athlete_weight_measurements.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Parents can read linked athlete weight measurements"
on public.athlete_weight_measurements for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    join public.parent_profiles pp on pp.user_profile_id = up.id
    join public.athlete_guardians ag on ag.guardian_id = pp.guardian_id
    where up.auth_user_id = auth.uid()
      and up.club_id = athlete_weight_measurements.club_id
      and up.role = 'parent'
      and up.is_active = true
      and up.deleted_at is null
      and pp.is_active = true
      and pp.deleted_at is null
      and ag.club_id = athlete_weight_measurements.club_id
      and ag.athlete_id = athlete_weight_measurements.athlete_id
      and ag.is_active = true
      and ag.deleted_at is null
  )
);
