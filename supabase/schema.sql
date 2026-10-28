-- ============================================================================
-- AUTOVÉRTICE - esquema inicial para Supabase (PostgreSQL)
-- -----------------------------------------------------------------------------
-- Cómo usarlo:
--   1. Crea un proyecto en https://supabase.com
--   2. Abre SQL Editor > New query, pega este archivo y ejecútalo.
--   3. En Authentication > Providers habilita "Email" (por defecto activo).
--   4. Configura VITE_DATA_MODE=supabase + VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
--
-- Todas las escrituras pasan por Row Level Security (RLS): el frontend usa
-- únicamente la clave pública (anon). El rol "admin" se asigna una sola vez
-- desde el SQL (ver sección final), nunca desde el navegador.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- 1. Perfiles con rol (extiende auth.users de Supabase)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text,
  role text not null default 'vendedor' check (role in ('admin', 'vendedor')),
  created_at timestamptz not null default now()
);

-- Función auxiliar (SECURITY DEFINER) para consultar el rol sin recursión de RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Crea el perfil automáticamente al registrarse un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'vendedor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2. Vendedores (la app solo envía un teléfono configurado; nunca inventa)
-- ----------------------------------------------------------------------------
create table if not exists public.sellers (
  id text primary key,
  name text not null,
  type text not null check (type in ('particular', 'concesionario', 'empresa')),
  city text not null,
  phone text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Vehículos (catálogo público + flujo de revisión)
-- ----------------------------------------------------------------------------
create table if not exists public.vehicles (
  id text primary key,
  slug text not null unique,
  vehicle_type text not null check (vehicle_type in ('carro', 'moto')),
  brand text not null,
  model text not null,
  version text not null,
  year int not null,
  price numeric not null check (price >= 0),
  currency text not null default 'COP',
  condition text not null check (condition in ('nuevo', 'usado')),
  mileage int not null default 0,
  city text not null,
  department text not null default '',
  body_type text,
  motorcycle_category text,
  specs jsonb not null default '{}'::jsonb,
  description text not null default '',
  image_urls text[] not null default '{}',
  seller_id text references public.sellers (id) on delete set null,
  listing_status text not null default 'pendiente'
    check (listing_status in ('publicado', 'pendiente', 'rechazado', 'vendido', 'desactivado')),
  is_featured boolean not null default false,
  is_demo boolean not null default false,
  lifestyle_tags text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  verification_notes text[] not null default '{}'
);

create index if not exists vehicles_listing_status_idx on public.vehicles (listing_status);
create index if not exists vehicles_vehicle_type_idx on public.vehicles (vehicle_type);
create index if not exists vehicles_brand_idx on public.vehicles (brand);

-- ----------------------------------------------------------------------------
-- 4. Consultas de usuarios (formulario de contacto / prueba de manejo)
-- ----------------------------------------------------------------------------
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  city text not null,
  vehicle_id text,
  vehicle_label text,
  request_type text not null
    check (request_type in (
      'consulta-vehiculo', 'prueba-manejo', 'informacion-adicional',
      'financiacion', 'publicar-vehiculo', 'asesoria'
    )),
  message text,
  consent boolean not null default false,
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'cerrado')),
  source text not null default 'contacto'
    check (source in ('contacto', 'ficha-vehiculo', 'publicacion', 'prueba-manejo', 'financiacion'))
);

-- ----------------------------------------------------------------------------
-- 5. Publicaciones de usuarios (flujo "Vender mi vehículo")
-- ----------------------------------------------------------------------------
create table if not exists public.vehicle_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pendiente' check (status in ('pendiente', 'aprobado', 'rechazado')),
  vehicle_type text not null check (vehicle_type in ('carro', 'moto')),
  brand text not null,
  model text not null,
  version text not null,
  year int not null,
  mileage int not null,
  price numeric not null,
  city text not null,
  description text not null,
  features text[] not null default '{}',
  photo_count int not null default 0,
  contact_name text not null,
  contact_phone text not null,
  contact_email text,
  published_vehicle_id text
);

-- ----------------------------------------------------------------------------
-- 6. updated_at automático en vehículos
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists vehicles_set_updated_at on public.vehicles;
create trigger vehicles_set_updated_at
  before update on public.vehicles
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.sellers enable row level security;
alter table public.vehicles enable row level security;
alter table public.inquiries enable row level security;
alter table public.vehicle_submissions enable row level security;

-- profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select p.role from public.profiles p where p.id = auth.uid()));

-- sellers: lectura pública de los activos; escritura solo admin.
drop policy if exists "sellers_select" on public.sellers;
create policy "sellers_select"
  on public.sellers for select
  using (active = true or public.is_admin());

drop policy if exists "sellers_write_admin" on public.sellers;
create policy "sellers_write_admin"
  on public.sellers for all
  using (public.is_admin())
  with check (public.is_admin());

-- vehicles: catálogo público solo "publicado"; todo lo demás, admin.
drop policy if exists "vehicles_select_public_or_admin" on public.vehicles;
create policy "vehicles_select_public_or_admin"
  on public.vehicles for select
  using (listing_status = 'publicado' or public.is_admin());

drop policy if exists "vehicles_write_admin" on public.vehicles;
create policy "vehicles_write_admin"
  on public.vehicles for all
  using (public.is_admin())
  with check (public.is_admin());

-- inquiries: cualquiera puede escribir una consulta; leer/cambiar estado, solo admin.
drop policy if exists "inquiries_insert_consent" on public.inquiries;
create policy "inquiries_insert_consent"
  on public.inquiries for insert
  with check (consent = true);

drop policy if exists "inquiries_admin" on public.inquiries;
create policy "inquiries_admin"
  on public.inquiries for select
  using (public.is_admin());

drop policy if exists "inquiries_update_admin" on public.inquiries;
create policy "inquiries_update_admin"
  on public.inquiries for update
  using (public.is_admin())
  with check (public.is_admin());

-- vehicle_submissions: cualquiera puede enviar; revisión, solo admin.
drop policy if exists "submissions_insert_any" on public.vehicle_submissions;
create policy "submissions_insert_any"
  on public.vehicle_submissions for insert
  with check (true);

drop policy if exists "submissions_admin" on public.vehicle_submissions;
create policy "submissions_admin"
  on public.vehicle_submissions for select
  using (public.is_admin());

drop policy if exists "submissions_update_admin" on public.vehicle_submissions;
create policy "submissions_update_admin"
  on public.vehicle_submissions for update
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. Permisos para los roles del navegador (anon y authenticated)
-- ----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.profiles, public.sellers, public.vehicles,
  public.inquiries, public.vehicle_submissions to anon, authenticated;
grant update on public.profiles to authenticated;
grant insert, update on public.sellers, public.vehicles,
  public.inquiries, public.vehicle_submissions to authenticated;
grant delete on public.vehicles to authenticated;

-- ----------------------------------------------------------------------------
-- 9. Crear el PRIMER administrador (ejecutar una sola vez)
-- ----------------------------------------------------------------------------
-- a) Regístrate desde la aplicación (/admin > "Crear primer administrador" o
--    directamente en Supabase > Authentication > Add user con Email confirmado).
-- b) Luego ejecuta en el SQL Editor:
--
-- update public.profiles
--    set role = 'admin'
--  where email = 'tu-correo@ejemplo.com';
--
-- Desde ese momento ese usuario podrá leer y administrar todo el catálogo
-- desde el panel /admin con su sesión de Supabase Auth.
