create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  training_group_id uuid not null references public.training_groups(id),
  session_date date not null,
  trainer_user_profile_id uuid references public.user_profiles(id),
  notes text not null default '',
  created_by_user_profile_id uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint attendance_sessions_group_same_club foreign key (training_group_id, club_id) references public.training_groups(id, club_id),
  constraint attendance_sessions_trainer_same_club foreign key (trainer_user_profile_id) references public.user_profiles(id),
  constraint attendance_sessions_creator_same_club foreign key (created_by_user_profile_id) references public.user_profiles(id)
);

alter table public.attendance_sessions
  add constraint attendance_sessions_id_club_unique unique (id, club_id);

create table public.attendance_entries (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  attendance_session_id uuid not null references public.attendance_sessions(id),
  athlete_id uuid not null references public.athletes(id),
  status text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint attendance_entries_status_check check (status in ('present', 'absent', 'excused')),
  constraint attendance_entries_session_same_club foreign key (attendance_session_id, club_id) references public.attendance_sessions(id, club_id),
  constraint attendance_entries_athlete_same_club foreign key (athlete_id, club_id) references public.athletes(id, club_id)
);

create unique index attendance_sessions_unique_active_group_date_idx
  on public.attendance_sessions(club_id, training_group_id, session_date)
  where deleted_at is null;

create unique index attendance_entries_unique_active_session_athlete_idx
  on public.attendance_entries(attendance_session_id, athlete_id)
  where deleted_at is null;

create index attendance_sessions_club_date_idx
  on public.attendance_sessions(club_id, session_date desc)
  where deleted_at is null;

create index attendance_entries_session_idx
  on public.attendance_entries(attendance_session_id)
  where deleted_at is null;

create index attendance_entries_athlete_idx
  on public.attendance_entries(athlete_id)
  where deleted_at is null;

alter table public.attendance_sessions enable row level security;
alter table public.attendance_entries enable row level security;

create policy "Management and trainers can read attendance sessions"
on public.attendance_sessions for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = attendance_sessions.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Management and trainers can read attendance entries"
on public.attendance_entries for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = attendance_entries.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
);
