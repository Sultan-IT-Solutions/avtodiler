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

create table if not exists shop_models (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shop_models_updated_at_idx on shop_models (updated_at desc);

drop trigger if exists shop_models_set_updated_at on shop_models;
create trigger shop_models_set_updated_at
before update on shop_models
for each row
execute function set_updated_at();

create table if not exists shop_categories (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shop_categories_updated_at_idx on shop_categories (updated_at desc);

drop trigger if exists shop_categories_set_updated_at on shop_categories;
create trigger shop_categories_set_updated_at
before update on shop_categories
for each row
execute function set_updated_at();

create table if not exists shop_products (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shop_products_updated_at_idx on shop_products (updated_at desc);

drop trigger if exists shop_products_set_updated_at on shop_products;
create trigger shop_products_set_updated_at
before update on shop_products
for each row
execute function set_updated_at();

create table if not exists shop_stores (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shop_stores_updated_at_idx on shop_stores (updated_at desc);

drop trigger if exists shop_stores_set_updated_at on shop_stores;
create trigger shop_stores_set_updated_at
before update on shop_stores
for each row
execute function set_updated_at();

create table if not exists shop_reviews (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shop_reviews_updated_at_idx on shop_reviews (updated_at desc);

drop trigger if exists shop_reviews_set_updated_at on shop_reviews;
create trigger shop_reviews_set_updated_at
before update on shop_reviews
for each row
execute function set_updated_at();

create table if not exists shop_requests (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists shop_requests_created_at_idx on shop_requests (created_at desc);

create table if not exists shop_orders (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shop_orders_updated_at_idx on shop_orders (updated_at desc);

drop trigger if exists shop_orders_set_updated_at on shop_orders;
create trigger shop_orders_set_updated_at
before update on shop_orders
for each row
execute function set_updated_at();

create table if not exists shop_inventory_movements (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists shop_inventory_movements_created_at_idx on shop_inventory_movements (created_at desc);

create table if not exists shop_seo_pages (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists shop_seo_pages_updated_at_idx on shop_seo_pages (updated_at desc);

drop trigger if exists shop_seo_pages_set_updated_at on shop_seo_pages;
create trigger shop_seo_pages_set_updated_at
before update on shop_seo_pages
for each row
execute function set_updated_at();
