-- Karam Barber – Supabase schema
-- Kör hela filen i Supabase > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  customer_name text not null,
  customer_phone text not null,
  service_id text,
  service_name text not null,
  price numeric(10,2) not null default 0,
  barber text not null,
  booking_date date not null,
  booking_time time not null,
  note text default '',
  status text not null default 'Skickad till WhatsApp',
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_time_idx
  on public.bookings (booking_date, booking_time);

alter table public.bookings enable row level security;

-- Publika besökare får skapa bokningar men inte läsa, ändra eller radera dem.
drop policy if exists "public can create bookings" on public.bookings;
create policy "public can create bookings"
on public.bookings
for insert
to anon, authenticated
with check (true);

-- Viktigt: ingen SELECT-policy för anon. Därmed kan besökare inte läsa bokningslistan.
-- För framtida serverbaserad admin kan authenticated-policy läggas till via egen adminlösning.
