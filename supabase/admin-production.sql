-- FOR LATER: use this instead of admin-dev.sql when you protect /admin (needs a login screen + route guard).
-- Run in Supabase > SQL Editor, AFTER schema.sql.
-- Lets signed-in admins add, edit and delete lodges, upload videos and revoke bookings.
-- The public (anon) key still can't do any of that.

-- 1. Who is an admin
create table if not exists admins (email text primary key);
alter table admins enable row level security;   -- no policies: only is_admin() reads it

create or replace function is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;
grant execute on function is_admin() to authenticated;

-- !! Put YOUR email here (then create the same user under Authentication > Users)
insert into admins (email) values ('you@example.com') on conflict do nothing;

-- 2. Lodge management
create policy "admins add lodges"    on lodges for insert to authenticated with check (is_admin());
create policy "admins edit lodges"   on lodges for update to authenticated using (is_admin()) with check (is_admin());
create policy "admins delete lodges" on lodges for delete to authenticated using (is_admin());

-- 3. Requests are now private to admins (replaces the old test-only policy)
drop policy if exists "TEST ONLY read requests" on requests;
create policy "admins read requests" on requests for select to authenticated using (is_admin());

-- 4. Revoking a booking keeps the record but frees the lodge
alter table requests add column if not exists revoked_at timestamptz;

create or replace function revoke_booking(p_lodge_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Not allowed'; end if;
  update requests set revoked_at = now()
    where lodge_id = p_lodge_id and type = 'booking' and revoked_at is null;
  update lodges set is_booked = false where id = p_lodge_id;
end $$;
grant execute on function revoke_booking(uuid) to authenticated;

-- 5. Video storage (public to watch, admins only to change)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lodge-videos', 'lodge-videos', true, 52428800, array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 52428800;

create policy "admins upload videos" on storage.objects for insert to authenticated
  with check (bucket_id = 'lodge-videos' and is_admin());
create policy "admins update videos" on storage.objects for update to authenticated
  using (bucket_id = 'lodge-videos' and is_admin());
create policy "admins delete videos" on storage.objects for delete to authenticated
  using (bucket_id = 'lodge-videos' and is_admin());
