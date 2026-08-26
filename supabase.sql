create extension if not exists pgcrypto;
create table if not exists public.services(id text primary key,name text not null,price integer not null check(price>=0),duration integer not null default 45,active boolean not null default true,sort_order integer not null default 0);
create table if not exists public.bookings(id uuid primary key default gen_random_uuid(),service_id text not null,service_name text not null,price integer not null,booking_date date not null,booking_time text not null,customer_name text not null,phone text not null,note text,status text not null default 'pending' check(status in('pending','confirmed','cancelled')),created_at timestamptz not null default now());
alter table public.bookings drop constraint if exists bookings_booking_date_booking_time_key;
drop index if exists public.unique_active_booking_slot;
create unique index unique_active_booking_slot on public.bookings(booking_date,booking_time) where status <> 'cancelled';
create table if not exists public.site_images(image_key text primary key,url text not null,storage_path text,updated_at timestamptz not null default now());
alter table public.site_images add column if not exists storage_path text;
create table if not exists public.admin_users(user_id uuid primary key references auth.users(id) on delete cascade,created_at timestamptz not null default now());
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()) $$;
create or replace function public.get_booked_times(p_date date) returns table(booking_time text) language sql stable security definer set search_path=public as $$ select b.booking_time from public.bookings b where b.booking_date=p_date and b.status <> 'cancelled' order by b.booking_time $$;
revoke all on function public.get_booked_times(date) from public; grant execute on function public.get_booked_times(date) to anon,authenticated;
revoke all on function public.is_admin() from public; grant execute on function public.is_admin() to authenticated;
insert into public.services(id,name,price,duration,active,sort_order) values ('taper','Taper Fade',200,45,true,1),('low','Low Fade',200,45,true,2),('mid','Mid Fade',200,45,true,3),('high','High Fade',200,45,true,4),('fade-beard','Fade + Skägg',250,60,true,5),('beard','Endast skägg',150,30,true,6) on conflict(id) do nothing;
alter table public.services enable row level security;alter table public.bookings enable row level security;alter table public.site_images enable row level security;alter table public.admin_users enable row level security;
drop policy if exists "Public read active services" on public.services;drop policy if exists "Admin manages services" on public.services;drop policy if exists "Public creates booking" on public.bookings;drop policy if exists "Admin reads bookings" on public.bookings;drop policy if exists "Admin updates bookings" on public.bookings;drop policy if exists "Public reads images" on public.site_images;drop policy if exists "Admin manages images" on public.site_images;
create policy "Public read active services" on public.services for select using(active=true or public.is_admin());create policy "Admin manages services" on public.services for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Public creates booking" on public.bookings for insert to anon,authenticated with check(status='pending');create policy "Admin reads bookings" on public.bookings for select to authenticated using(public.is_admin());create policy "Admin updates bookings" on public.bookings for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy "Public reads images" on public.site_images for select using(true);create policy "Admin manages images" on public.site_images for all to authenticated using(public.is_admin()) with check(public.is_admin());
insert into storage.buckets(id,name,public) values('site-images','site-images',true) on conflict(id) do update set public=true;
drop policy if exists "Public reads site images" on storage.objects;drop policy if exists "Admin uploads site images" on storage.objects;drop policy if exists "Admin updates site images" on storage.objects;drop policy if exists "Admin deletes site images" on storage.objects;
create policy "Public reads site images" on storage.objects for select using(bucket_id='site-images');create policy "Admin uploads site images" on storage.objects for insert to authenticated with check(bucket_id='site-images' and public.is_admin());create policy "Admin updates site images" on storage.objects for update to authenticated using(bucket_id='site-images' and public.is_admin()) with check(bucket_id='site-images' and public.is_admin());create policy "Admin deletes site images" on storage.objects for delete to authenticated using(bucket_id='site-images' and public.is_admin());

-- v3: admin-editable site/contact/notification settings
create table if not exists public.site_settings (
  setting_key text primary key,
  setting_value text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "Public reads site settings" on public.site_settings;
create policy "Public reads site settings" on public.site_settings for select using (true);
drop policy if exists "Admin manages site settings" on public.site_settings;
create policy "Admin manages site settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
insert into public.site_settings(setting_key,setting_value) values
  ('contact_phone','070-487 70 05'),
  ('instagram_handle','@blendxo_'),
  ('whatsapp_number',''),
  ('notification_email','')
on conflict (setting_key) do nothing;
