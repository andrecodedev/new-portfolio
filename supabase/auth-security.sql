-- Segurança do CMS: rode no SQL Editor do projeto NOVO depois de cms-content.sql
-- e storage-avatars.sql.
--
-- 1) Garante RLS ligado na tabela pública do CMS.
alter table public.cms_content enable row level security;

-- 2) (Opcional) restringe escrita a usuários autenticados com MFA (aal2).
--    Sessões só com senha (aal1) não conseguem publicar.
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
