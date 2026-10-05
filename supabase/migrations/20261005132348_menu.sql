-- Applied to the Supabase project Rollup_Cinnamon (nrxrayvnjqfjiclkiwhf) on 2026-10-05.
-- The menu admin (api/admin.js) and the live menu feed (api/menu.js) use these
-- with the secret key; nothing here is reachable with the public keys.
-- The first menu row was seeded from src/data/catalog.json:
--   insert into public.menu (id, catalog) values (1, '<contents of catalog.json>'::jsonb);

-- The live menu (one row: the whole catalog as JSON) and every earlier version.
create table public.menu (
  id smallint primary key default 1 check (id = 1),
  catalog jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

create table public.menu_history (
  id bigint generated always as identity primary key,
  version integer not null,
  catalog jsonb not null,
  saved_at timestamptz not null
);

-- Only the site's own API (secret key = service_role) reads or writes these;
-- nothing is reachable with the public keys.
alter table public.menu enable row level security;
alter table public.menu_history enable row level security;
revoke all on table public.menu, public.menu_history from anon, authenticated;
revoke all on sequence public.menu_history_id_seq from anon, authenticated;
grant select, update on table public.menu to service_role;
grant select, insert on table public.menu_history to service_role;
grant usage on sequence public.menu_history_id_seq to service_role;

-- Each publish keeps the previous version and bumps the number. The admin
-- sends the version it started from, so two saves can't overwrite each other.
create function public.menu_before_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.menu_history (version, catalog, saved_at)
  values (old.version, old.catalog, old.updated_at);
  new.version := old.version + 1;
  new.updated_at := now();
  return new;
end;
$$;
revoke execute on function public.menu_before_update() from public, anon, authenticated;

create trigger menu_before_update
before update on public.menu
for each row execute function public.menu_before_update();

-- Photos uploaded from the admin page. Public to read; only the API uploads.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu-photos', 'menu-photos', true, 3145728, array['image/jpeg']);
