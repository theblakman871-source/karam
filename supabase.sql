-- Kör i Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.services (
  id text primary key,
  name text not null,
  price integer not null check (price >= 0),
  duration integer not null default 45,
  active boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_id text not null,
  service_name text not null,
  price integer not null,
  booking_date date not null,
  booking_time text not null,
  customer_name text not null,
  phone text not null,
  note text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now(),
  unique (booking_date, booking_time)
);

create table if not exists public.site_images (
  image_key text primary key,
  url text not null,
  updated_at timestamptz not null default now()
);

insert into public.services(id,name,price,duration,active,sort_order) values
('taper','Taper Fade',200,45,true,1),('low','Low Fade',200,45,true,2),('mid','Mid Fade',200,45,true,3),('high','High Fade',200,45,true,4),('fade-beard','Fade + Skägg',250,60,true,5),('beard','Endast skägg',150,30,true,6)
on conflict (id) do nothing;

alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.site_images enable row level security;

create policy "Public read active services" on public.services for select using (active = true or auth.role() = 'authenticated');
create policy "Admin manages services" on public.services for all to authenticated using (true) with check (true);
create policy "Public creates booking" on public.bookings for insert to anon with check (status = 'pending');
create policy "Admin reads bookings" on public.bookings for select to authenticated using (true);
create policy "Admin updates bookings" on public.bookings for update to authenticated using (true) with check (true);
create policy "Public reads images" on public.site_images for select using (true);
create policy "Admin manages images" on public.site_images for all to authenticated using (true) with check (true);

-- Storage: skapa bucket "site-images" som Public i Supabase Storage.
-- Lägg sedan policy så att authenticated får INSERT/UPDATE/DELETE i bucketen.
