-- Segurança do CMS: rode no SQL Editor do projeto portfolio
-- depois de cms-content.sql e storage-avatars.sql.
--
-- Redundante se cms-content.sql / storage-avatars.sql já exigem aal2 —
-- serve pra reaplicar as policies sem recriar tabela/bucket.

alter table public.cms_content enable row level security;

drop policy if exists "cms_content_auth_insert" on public.cms_content;
create policy "cms_content_auth_insert"
  on public.cms_content
  for insert
  to authenticated
  with check ((auth.jwt() ->> 'aal') = 'aal2');

drop policy if exists "cms_content_auth_update" on public.cms_content;
create policy "cms_content_auth_update"
  on public.cms_content
  for update
  to authenticated
  using ((auth.jwt() ->> 'aal') = 'aal2')
  with check ((auth.jwt() ->> 'aal') = 'aal2');

-- Storage: escrita só com MFA (mesmas regras do storage-avatars.sql).
drop policy if exists "avatars_auth_insert" on storage.objects;
create policy "avatars_auth_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (auth.jwt() ->> 'aal') = 'aal2'
  );

drop policy if exists "avatars_auth_update" on storage.objects;
create policy "avatars_auth_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (auth.jwt() ->> 'aal') = 'aal2'
  )
  with check (
    bucket_id = 'avatars'
    and (auth.jwt() ->> 'aal') = 'aal2'
  );

drop policy if exists "avatars_auth_delete" on storage.objects;
create policy "avatars_auth_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (auth.jwt() ->> 'aal') = 'aal2'
  );
