-- Rodar no SQL Editor do Supabase (mesmo projeto do Auth).
-- Leitura pública: o site mostra o conteúdo publicado.
-- Escrita só com sessão autenticada: o painel admin.

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
  with check (true);

drop policy if exists "cms_content_auth_update" on public.cms_content;
create policy "cms_content_auth_update"
  on public.cms_content
  for update
  to authenticated
  using (true)
  with check (true);
