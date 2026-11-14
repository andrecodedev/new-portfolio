-- Rodar no SQL Editor do Supabase (projeto portfolio).
-- Leitura pública: o site mostra o conteúdo publicado.
-- Escrita só com sessão autenticada + MFA (aal2).

create table if not exists public.cms_content (
  key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.cms_content enable row level security;

drop policy if exists "cms_content_public_read" on public.cms_content;
create policy "cms_content_public_read"
  on public.cms_content
  for select
  to anon, authenticated
  using (true);

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
