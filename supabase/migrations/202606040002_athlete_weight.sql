alter table public.athletes
  add column if not exists weight numeric(6,2);

create index if not exists athletes_weight_idx
  on public.athletes(weight)
  where deleted_at is null;
