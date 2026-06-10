-- Training scheduler foundation.
-- Concrete sessions are generated from recurring templates and then used by attendance.

do $$
begin
  if not exists (
    select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'training_session_type'
  ) then
    create type public.training_session_type as enum ('regular', 'extra');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_type where typnamespace = 'public'::regnamespace and typname = 'training_session_status'
  ) then
    create type public.training_session_status as enum ('scheduled', 'completed', 'cancelled', 'rescheduled');
  end if;
end $$;

create table if not exists public.training_schedules (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete restrict,
  training_group_id uuid not null,
  day_of_week integer not null check (day_of_week between 1 and 7),
  start_time time not null,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz null,
  constraint training_schedules_group_same_club
    foreign key (training_group_id, club_id)
    references public.training_groups(id, club_id)
    on delete restrict
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'training_schedules_id_club_unique'
      and conrelid = 'public.training_schedules'::regclass
  ) then
    alter table public.training_schedules
      add constraint training_schedules_id_club_unique unique (id, club_id);
  end if;
end $$;

create unique index if not exists training_schedules_active_slot_idx
  on public.training_schedules (club_id, training_group_id, day_of_week, start_time)
  where deleted_at is null and is_active = true;

create index if not exists training_schedules_club_day_idx
  on public.training_schedules (club_id, day_of_week)
  where deleted_at is null;

alter table public.training_schedules enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'training_schedules'
      and policyname = 'training_schedules_select_same_club'
  ) then
    create policy training_schedules_select_same_club
      on public.training_schedules
      for select
      using (
        exists (
          select 1
          from public.user_profiles up
          where up.auth_user_id = auth.uid()
            and up.club_id = training_schedules.club_id
            and up.role in ('management', 'trainer')
            and up.is_active = true
            and up.deleted_at is null
        )
      );
  end if;
end $$;

alter table public.attendance_sessions
  add column if not exists schedule_id uuid null,
  add column if not exists session_type public.training_session_type null,
  add column if not exists status public.training_session_status null,
  add column if not exists scheduled_date date null,
  add column if not exists scheduled_time time null,
  add column if not exists original_date date null,
  add column if not exists original_time time null,
  add column if not exists cancellation_reason text null;

update public.attendance_sessions
set session_type = 'regular'
where session_type is null;

update public.attendance_sessions
set status = 'scheduled'
where status is null;

update public.attendance_sessions
set scheduled_date = session_date
where scheduled_date is null;

update public.attendance_sessions
set scheduled_time = time '00:00'
where scheduled_time is null;

alter table public.attendance_sessions
  alter column session_type set default 'regular',
  alter column session_type set not null,
  alter column status set default 'scheduled',
  alter column status set not null,
  alter column scheduled_date set not null,
  alter column scheduled_time set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_sessions_schedule_same_club'
      and conrelid = 'public.attendance_sessions'::regclass
  ) then
    alter table public.attendance_sessions
      add constraint attendance_sessions_schedule_same_club
      foreign key (schedule_id, club_id)
      references public.training_schedules(id, club_id)
      on delete set null;
  end if;
end $$;

drop index if exists public.attendance_sessions_unique_active_group_date_idx;

create unique index if not exists attendance_sessions_unique_active_slot_idx
  on public.attendance_sessions (club_id, training_group_id, scheduled_date, scheduled_time)
  where deleted_at is null and status <> 'cancelled';

create index if not exists attendance_sessions_club_scheduled_date_idx
  on public.attendance_sessions (club_id, scheduled_date, status)
  where deleted_at is null;

create index if not exists attendance_sessions_group_scheduled_date_idx
  on public.attendance_sessions (training_group_id, scheduled_date)
  where deleted_at is null;
