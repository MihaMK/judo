alter table public.athletes
  add column if not exists federation_license_number text null,
  add column if not exists phone text null,
  add column if not exists email text null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'chk_athletes_federation_license_digits'
      and conrelid = 'public.athletes'::regclass
  ) then
    alter table public.athletes
      add constraint chk_athletes_federation_license_digits
      check (
        federation_license_number is null
        or federation_license_number ~ '^[0-9]+$'
      );
  end if;
end $$;

comment on column public.athletes.federation_license_number is
  'Број на легитимација од Џудо Федерација на Македонија. Дозволува само цифри.';

comment on column public.athletes.phone is
  'Директен мобилен телефон на спортистот (опционално).';

comment on column public.athletes.email is
  'Директен email на спортистот (опционално).';
