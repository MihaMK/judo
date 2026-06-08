alter table public.clubs
  add column if not exists logo_path text;

create index if not exists clubs_logo_path_idx
  on public.clubs(logo_path)
  where logo_path is not null and deleted_at is null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'club-branding',
  'club-branding',
  false,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
