create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists cars (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists cars_updated_at_idx on cars (updated_at desc);

drop trigger if exists cars_set_updated_at on cars;
create trigger cars_set_updated_at
before update on cars
for each row
execute function set_updated_at();

create table if not exists offers (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists offers_updated_at_idx on offers (updated_at desc);

drop trigger if exists offers_set_updated_at on offers;
create trigger offers_set_updated_at
before update on offers
for each row
execute function set_updated_at();

create table if not exists services (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists services_updated_at_idx on services (updated_at desc);

drop trigger if exists services_set_updated_at on services;
create trigger services_set_updated_at
before update on services
for each row
execute function set_updated_at();

create table if not exists dealers (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists dealers_updated_at_idx on dealers (updated_at desc);

drop trigger if exists dealers_set_updated_at on dealers;
create trigger dealers_set_updated_at
before update on dealers
for each row
execute function set_updated_at();

create table if not exists leads (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);

create table if not exists seo (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists seo_updated_at_idx on seo (updated_at desc);

drop trigger if exists seo_set_updated_at on seo;
create trigger seo_set_updated_at
before update on seo
for each row
execute function set_updated_at();
