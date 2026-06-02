create table public.competition_age_groups (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  code text not null,
  name text not null,
  category_type text not null default 'general',
  min_age integer,
  max_age integer,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint competition_age_groups_name_not_blank check (length(trim(name)) > 0),
  constraint competition_age_groups_code_not_blank check (length(trim(code)) > 0),
  constraint competition_age_groups_type_check check (category_type in ('youth', 'senior', 'veteran', 'general')),
  constraint competition_age_groups_code_unique_per_club unique (club_id, code),
  constraint competition_age_groups_id_club_unique unique (id, club_id)
);

create table public.competition_weight_categories (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  age_group_id uuid not null references public.competition_age_groups(id),
  gender text not null,
  label text not null,
  max_weight_kg numeric(6,2),
  is_open_ended boolean not null default false,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint competition_weight_categories_gender_check check (gender in ('M', 'F')),
  constraint competition_weight_categories_label_not_blank check (length(trim(label)) > 0),
  constraint competition_weight_categories_age_group_same_club foreign key (age_group_id, club_id) references public.competition_age_groups(id, club_id)
);

create table public.athlete_year_generation_rules (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id),
  age_group_id uuid not null references public.competition_age_groups(id),
  label text not null,
  min_age integer,
  max_age integer,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint athlete_year_generation_rules_label_not_blank check (length(trim(label)) > 0),
  constraint athlete_year_generation_rules_age_group_same_club foreign key (age_group_id, club_id) references public.competition_age_groups(id, club_id)
);

create unique index competition_weight_categories_unique_active_idx on public.competition_weight_categories(age_group_id, gender, label) where deleted_at is null;

create index competition_age_groups_club_order_idx on public.competition_age_groups(club_id, display_order) where deleted_at is null;

create index competition_weight_categories_group_order_idx on public.competition_weight_categories(age_group_id, gender, display_order) where deleted_at is null;

create index athlete_year_generation_rules_group_order_idx on public.athlete_year_generation_rules(age_group_id, display_order) where deleted_at is null;

alter table public.competition_age_groups enable row level security;
alter table public.competition_weight_categories enable row level security;
alter table public.athlete_year_generation_rules enable row level security;

create policy "Management can read competition_age_groups"
on public.competition_age_groups for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = competition_age_groups.club_id
      and up.role = 'management'
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Management can read competition_weight_categories"
on public.competition_weight_categories for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = competition_weight_categories.club_id
      and up.role = 'management'
      and up.is_active = true
      and up.deleted_at is null
  )
);

create policy "Management can read athlete_year_generation_rules"
on public.athlete_year_generation_rules for select
to authenticated
using (
  deleted_at is null
  and exists (
    select 1 from public.user_profiles up
    where up.auth_user_id = auth.uid()
      and up.club_id = athlete_year_generation_rules.club_id
      and up.role = 'management'
      and up.is_active = true
      and up.deleted_at is null
  )
);

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'deca-poletarci', 'деца-полетарци', 'youth', null, null, 1) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-30.0', 30, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-34.0', 34, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-38.0', 38, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-42.0', 42, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-46.0', 46, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-50.0', 50, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-55.0', 55, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 9 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 10 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+73.0', null, true, 11 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-28.0', 28, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-32.0', 32, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-36.0', 36, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-40.0', 40, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-44.0', 44, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-48.0', 48, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-52.0', 52, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-57.0', 57, false, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-63.0', 63, false, 9 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '+63.0', null, true, 10 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='deca-poletarci' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'u12', 'U12-деца', 'youth', null, 11, 2) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-30.0', 30, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-34.0', 34, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-38.0', 38, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-42.0', 42, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-46.0', 46, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-50.0', 50, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-55.0', 55, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 9 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 10 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+73.0', null, true, 11 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-28.0', 28, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-32.0', 32, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-36.0', 36, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-40.0', 40, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-44.0', 44, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-48.0', 48, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-52.0', 52, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-57.0', 57, false, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-63.0', 63, false, 9 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '+63.0', null, true, 10 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u12' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'u14', 'U14-помлади пионери', 'youth', null, 13, 3) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-38.0', 38, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-42.0', 42, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-46.0', 46, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-50.0', 50, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-55.0', 55, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+73.0', null, true, 9 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-32.0', 32, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-36.0', 36, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-40.0', 40, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-44.0', 44, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-48.0', 48, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-52.0', 52, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-57.0', 57, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-63.0', 63, false, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '+63.0', null, true, 9 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u14' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'u16', 'U16-пионери', 'youth', null, 15, 4) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-46.0', 46, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-50.0', 50, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-55.0', 55, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+90.0', null, true, 9 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-36.0', 36, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-40.0', 40, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-44.0', 44, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-48.0', 48, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-52.0', 52, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-57.0', 57, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-63.0', 63, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-70.0', 70, false, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '+70.0', null, true, 9 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u16' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'u18', 'U18-кадети', 'youth', null, 17, 5) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-50.0', 50, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-55.0', 55, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+90.0', null, true, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-40.0', 40, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-44.0', 44, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-48.0', 48, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-52.0', 52, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-57.0', 57, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-63.0', 63, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-70.0', 70, false, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '+70.0', null, true, 8 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u18' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'u21', 'U21-јуниори', 'youth', null, 20, 6) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-48.0', 48, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-52.0', 52, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-57.0', 57, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-63.0', 63, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-70.0', 70, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-78.0', 78, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '+78.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u21' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'u23', 'U23-помлади сениори', 'youth', null, 22, 7) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-48.0', 48, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-52.0', 52, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-57.0', 57, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-63.0', 63, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-70.0', 70, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-78.0', 78, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '+78.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='u23' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'seniori', 'сениори', 'senior', null, null, 8) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-48.0', 48, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-52.0', 52, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-57.0', 57, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-63.0', 63, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-70.0', 70, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '-78.0', 78, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'F', '+78.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='seniori' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'f1-m1-30-34', 'F1/M1 30-34-ветерани', 'veteran', null, null, 9) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f1-m1-30-34' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f1-m1-30-34' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f1-m1-30-34' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f1-m1-30-34' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f1-m1-30-34' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f1-m1-30-34' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f1-m1-30-34' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f1-m1-30-34' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'f2-m2-35-39', 'F2/M2 35-39-ветерани', 'veteran', null, null, 10) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f2-m2-35-39' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f2-m2-35-39' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f2-m2-35-39' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f2-m2-35-39' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f2-m2-35-39' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f2-m2-35-39' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f2-m2-35-39' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f2-m2-35-39' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'f3-m3-40-44', 'F3/M3 40-44-ветерани', 'veteran', null, null, 11) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f3-m3-40-44' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f3-m3-40-44' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f3-m3-40-44' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f3-m3-40-44' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f3-m3-40-44' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f3-m3-40-44' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f3-m3-40-44' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f3-m3-40-44' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'f4-m4-45-49', 'F4/M4 45-49-ветерани', 'veteran', null, null, 12) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f4-m4-45-49' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f4-m4-45-49' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f4-m4-45-49' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f4-m4-45-49' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f4-m4-45-49' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f4-m4-45-49' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f4-m4-45-49' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f4-m4-45-49' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'f5-m5-50-54', 'F5/M5 50-54-ветерани', 'veteran', null, null, 13) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f5-m5-50-54' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f5-m5-50-54' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f5-m5-50-54' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f5-m5-50-54' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f5-m5-50-54' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f5-m5-50-54' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f5-m5-50-54' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f5-m5-50-54' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'f6-m6-55-59', 'F6/M6 55-59-ветерани', 'veteran', null, null, 14) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f6-m6-55-59' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f6-m6-55-59' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f6-m6-55-59' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f6-m6-55-59' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f6-m6-55-59' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f6-m6-55-59' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f6-m6-55-59' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f6-m6-55-59' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'f7-m7-60-64', 'F7/M7 60-64-ветерани', 'veteran', null, null, 15) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f7-m7-60-64' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f7-m7-60-64' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f7-m7-60-64' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f7-m7-60-64' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f7-m7-60-64' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f7-m7-60-64' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f7-m7-60-64' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f7-m7-60-64' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'f8-m8-65-69', 'F8/M8 65-69-ветерани', 'veteran', null, null, 16) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f8-m8-65-69' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f8-m8-65-69' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f8-m8-65-69' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f8-m8-65-69' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f8-m8-65-69' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f8-m8-65-69' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f8-m8-65-69' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f8-m8-65-69' on conflict do nothing;

insert into public.competition_age_groups (club_id, code, name, category_type, min_age, max_age, display_order) values ('11111111-1111-4111-8111-111111111111', 'f9-m9-70plus', 'F9/M9 70+-ветерани', 'veteran', null, null, 17) on conflict (club_id, code) do nothing;

insert into public.athlete_year_generation_rules (club_id, age_group_id, label, min_age, max_age, display_order) select club_id, id, name, min_age, max_age, display_order from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f9-m9-70plus' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-60.0', 60, false, 1 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f9-m9-70plus' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-66.0', 66, false, 2 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f9-m9-70plus' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-73.0', 73, false, 3 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f9-m9-70plus' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-81.0', 81, false, 4 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f9-m9-70plus' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-90.0', 90, false, 5 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f9-m9-70plus' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '-100.0', 100, false, 6 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f9-m9-70plus' on conflict do nothing;

insert into public.competition_weight_categories (club_id, age_group_id, gender, label, max_weight_kg, is_open_ended, display_order) select '11111111-1111-4111-8111-111111111111', id, 'M', '+100.0', null, true, 7 from public.competition_age_groups where club_id='11111111-1111-4111-8111-111111111111' and code='f9-m9-70plus' on conflict do nothing;
