create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_id_club_unique'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles
      add constraint user_profiles_id_club_unique unique (id, club_id);
  end if;
end $$;

create table public.club_membership_settings (
  club_id uuid primary key references public.clubs(id),
  monthly_fee_amount numeric(12,2) not null default 1000,
  currency text not null default 'MKD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint club_membership_settings_fee_positive check (monthly_fee_amount > 0),
  constraint club_membership_settings_currency_not_blank check (length(trim(currency)) > 0)
);

create table public.membership_payments (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  athlete_id uuid not null references public.athletes(id),
  amount numeric(12,2) not null,
  payment_method text not null default 'cash',
  payment_date date not null default current_date,
  created_by_user_profile_id uuid not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint membership_payments_amount_positive check (amount > 0),
  constraint membership_payments_method_check check (payment_method in ('cash', 'bank_transfer')),
  constraint membership_payments_athlete_same_club foreign key (athlete_id, club_id) references public.athletes(id, club_id),
  constraint membership_payments_creator_same_club foreign key (created_by_user_profile_id, club_id) references public.user_profiles(id, club_id)
);

create index membership_payments_club_athlete_date_idx
  on public.membership_payments(club_id, athlete_id, payment_date desc)
  where deleted_at is null;

create index membership_payments_club_date_idx
  on public.membership_payments(club_id, payment_date desc)
  where deleted_at is null;

alter table public.club_membership_settings enable row level security;
alter table public.membership_payments enable row level security;

create policy "Users can read membership settings in their club"
on public.club_membership_settings for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = club_membership_settings.club_id
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Management and trainers can read club membership payments"
on public.membership_payments for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = membership_payments.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Parents can read linked athlete membership payments"
on public.membership_payments for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1
    from public.user_profiles up
    join public.parent_profiles pp on pp.user_profile_id = up.id
    join public.athlete_guardians ag on ag.guardian_id = pp.guardian_id
    where up.auth_user_id = auth.uid()
      and up.club_id = membership_payments.club_id
      and pp.club_id = membership_payments.club_id
      and ag.club_id = membership_payments.club_id
      and ag.athlete_id = membership_payments.athlete_id
      and up.role = 'parent'
      and up.is_active = true
      and pp.is_active = true
      and ag.is_active = true
      and up.deleted_at is null
      and pp.deleted_at is null
      and ag.deleted_at is null
  )
);

create policy "Management and trainers can create membership payments"
on public.membership_payments for insert
to authenticated
with check (
  exists (
    select 1
    from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.id = membership_payments.created_by_user_profile_id
      and up.club_id = membership_payments.club_id
      and up.role in ('management', 'trainer')
      and up.is_active = true
      and up.deleted_at is null
  )
);
