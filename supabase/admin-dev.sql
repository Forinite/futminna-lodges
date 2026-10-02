-- TESTING ONLY. Run in Supabase > SQL Editor, after schema.sql.
-- Lets the unprotected /admin pages add, edit and delete lodges, upload videos and
-- revoke bookings using the public key. Anyone who finds the URL can do these things,
-- so don't leave this on a live site. Before launch, run admin-production.sql instead.

-- Lodge management
create policy "DEV open insert lodges" on lodges for insert to anon, authenticated with check (true);
create policy "DEV open update lodges" on lodges for update to anon, authenticated using (true) with check (true);
create policy "DEV open delete lodges" on lodges for delete to anon, authenticated using (true);

-- Requests list (already created in schema.sql as "TEST ONLY read requests", so nothing to add)

-- Revoking a booking keeps the record but frees the lodge
alter table requests add column if not exists revoked_at timestamptz;

create or replace function revoke_booking(p_lodge_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  update requests set revoked_at = now()
    where lodge_id = p_lodge_id and type = 'booking' and revoked_at is null;
  update lodges set is_booked = false where id = p_lodge_id;
end $$;
grant execute on function revoke_booking(uuid) to anon, authenticated;

-- Video storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('lodge-videos', 'lodge-videos', true, 52428800, array['video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true, file_size_limit = 52428800;

create policy "DEV open upload videos" on storage.objects for insert to anon, authenticated with check (bucket_id = 'lodge-videos');
create policy "DEV open delete videos" on storage.objects for delete to anon, authenticated using (bucket_id = 'lodge-videos');
