create table if not exists public.age_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  min_age integer,
  max_age integer,
  display_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint age_groups_name_not_blank check (length(trim(name)) > 0),
  constraint age_groups_age_range_check check (
    (min_age is null or min_age >= 0)
    and (max_age is null or max_age >= 0)
    and (min_age is null or max_age is null or min_age <= max_age)
  ),
  constraint age_groups_name_unique unique (name)
);

create table if not exists public.weight_categories (
  id uuid primary key default gen_random_uuid(),
  age_group_id uuid not null references public.age_groups(id),
  gender text not null,
  min_weight numeric(6,2),
  max_weight numeric(6,2),
  name text not null,
  display_order integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint weight_categories_name_not_blank check (length(trim(name)) > 0),
  constraint weight_categories_gender_check check (gender in ('M', 'F')),
  constraint weight_categories_weight_range_check check (
    (min_weight is null or min_weight >= 0)
    and (max_weight is null or max_weight >= 0)
    and (min_weight is null or max_weight is null or min_weight <= max_weight)
  )
);

create table if not exists public.belt_ranks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kyu_dan_value integer not null,
  rank_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint belt_ranks_name_not_blank check (length(trim(name)) > 0),
  constraint belt_ranks_name_unique unique (name),
  constraint belt_ranks_order_unique unique (rank_order)
);

alter table public.athletes
  add column if not exists belt_rank_id uuid references public.belt_ranks(id);

create index if not exists age_groups_active_order_idx
  on public.age_groups(display_order)
  where deleted_at is null;

create index if not exists weight_categories_age_gender_order_idx
  on public.weight_categories(age_group_id, gender, display_order)
  where deleted_at is null;

create index if not exists belt_ranks_order_idx
  on public.belt_ranks(rank_order)
  where deleted_at is null;

create index if not exists athletes_belt_rank_idx
  on public.athletes(belt_rank_id)
  where deleted_at is null;

alter table public.age_groups enable row level security;
alter table public.weight_categories enable row level security;
alter table public.belt_ranks enable row level security;

insert into public.belt_ranks (name, kyu_dan_value, rank_order) values
  ('Бел', -6, 10),
  ('Жолт', -5, 20),
  ('Портокалов', -4, 30),
  ('Зелен', -3, 40),
  ('Син', -2, 50),
  ('Кафеав', -1, 60),
  ('Црн', 0, 70),
  ('1 ДАН', 1, 80),
  ('2 ДАН', 2, 90),
  ('3 ДАН', 3, 100),
  ('4 ДАН', 4, 110),
  ('5 ДАН', 5, 120),
  ('6 ДАН', 6, 130),
  ('7 ДАН', 7, 140),
  ('8 ДАН', 8, 150),
  ('9 ДАН', 9, 160),
  ('10 ДАН', 10, 170)
on conflict (name) do update set
  kyu_dan_value = excluded.kyu_dan_value,
  rank_order = excluded.rank_order,
  is_active = true,
  deleted_at = null,
  updated_at = now();

insert into public.age_groups (name, min_age, max_age, display_order)
select distinct on (name)
  name,
  min_age,
  max_age,
  display_order
from public.competition_age_groups
where deleted_at is null
order by name, display_order
on conflict (name) do update set
  min_age = excluded.min_age,
  max_age = excluded.max_age,
  display_order = excluded.display_order,
  is_active = true,
  deleted_at = null,
  updated_at = now();

with source_weights as (
  select
    ag.name as age_group_name,
    wc.gender,
    wc.label,
    lag(wc.max_weight_kg) over (
      partition by wc.age_group_id, wc.gender
      order by wc.display_order
    ) as previous_max_weight,
    wc.max_weight_kg,
    wc.is_open_ended,
    wc.display_order
  from public.competition_weight_categories wc
  join public.competition_age_groups ag on ag.id = wc.age_group_id
  where wc.deleted_at is null
    and ag.deleted_at is null
)
insert into public.weight_categories (age_group_id, gender, min_weight, max_weight, name, display_order)
select
  semantic_age.id,
  source_weights.gender,
  source_weights.previous_max_weight,
  case when source_weights.is_open_ended then null else source_weights.max_weight_kg end,
  source_weights.label,
  source_weights.display_order
from source_weights
join public.age_groups semantic_age on semantic_age.name = source_weights.age_group_name
where not exists (
  select 1
  from public.weight_categories existing
  where existing.age_group_id = semantic_age.id
    and existing.gender = source_weights.gender
    and existing.name = source_weights.label
    and existing.deleted_at is null
);

update public.athletes
set belt_rank_id = belt_ranks.id,
    updated_at = now()
from public.belt_ranks
where public.athletes.belt_rank_id is null
  and public.athletes.deleted_at is null
  and (
    public.athletes.current_belt_text = belt_ranks.name
    or public.athletes.current_belt_text = belt_ranks.name || ' појас'
    or (public.athletes.current_belt_text = 'White belt' and belt_ranks.name = 'Бел')
    or (public.athletes.current_belt_text = 'Yellow belt' and belt_ranks.name = 'Жолт')
    or (public.athletes.current_belt_text = 'Orange belt' and belt_ranks.name = 'Портокалов')
  );
