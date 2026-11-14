-- Bloqueio de login no servidor (não zera ao limpar cookies/localStorage).
-- Rode no SQL Editor do projeto.

create table if not exists public.admin_login_guard (
  email_key text primary key,
  fails integer not null default 0,
  locked_until timestamptz not null default to_timestamp(0),
  updated_at timestamptz not null default now()
);

alter table public.admin_login_guard enable row level security;

-- Sem policies de SELECT/INSERT/UPDATE/DELETE para anon/authenticated.
-- Só as functions security definer abaixo acessam a tabela.

create or replace function public._admin_email_key(p_email text)
returns text
language sql
immutable
as $$
  select md5(lower(trim(p_email)));
$$;

create or replace function public.admin_login_status(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text := public._admin_email_key(p_email);
  v_row public.admin_login_guard%rowtype;
  v_remaining_ms bigint := 0;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    return jsonb_build_object('fails', 0, 'remaining_ms', 0, 'locked', false);
  end if;

  select * into v_row from public.admin_login_guard where email_key = v_key;
  if not found then
    return jsonb_build_object('fails', 0, 'remaining_ms', 0, 'locked', false);
  end if;

  v_remaining_ms := greatest(
    0,
    floor(extract(epoch from (v_row.locked_until - now())) * 1000)
  )::bigint;

  if v_remaining_ms > 0 then
    return jsonb_build_object(
      'fails', v_row.fails,
      'remaining_ms', v_remaining_ms,
      'locked', true
    );
  end if;

  return jsonb_build_object(
    'fails', v_row.fails,
    'remaining_ms', 0,
    'locked', false
  );
end;
$$;

create or replace function public.admin_login_fail(p_email text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text := public._admin_email_key(p_email);
  v_row public.admin_login_guard%rowtype;
  v_fails integer;
  v_remaining_ms bigint := 0;
  v_max integer := 3;
  v_lock_seconds integer := 300;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    return jsonb_build_object('fails', 0, 'remaining_ms', 0, 'locked', false);
  end if;

  select * into v_row from public.admin_login_guard where email_key = v_key;

  if found and v_row.locked_until > now() then
    v_remaining_ms := floor(extract(epoch from (v_row.locked_until - now())) * 1000)::bigint;
    return jsonb_build_object(
      'fails', v_row.fails,
      'remaining_ms', v_remaining_ms,
      'locked', true
    );
  end if;

  v_fails := coalesce(v_row.fails, 0) + 1;

  if v_fails >= v_max then
    insert into public.admin_login_guard (email_key, fails, locked_until, updated_at)
    values (v_key, 0, now() + make_interval(secs => v_lock_seconds), now())
    on conflict (email_key) do update
      set fails = 0,
          locked_until = excluded.locked_until,
          updated_at = now();
    v_remaining_ms := v_lock_seconds * 1000;
    return jsonb_build_object('fails', 0, 'remaining_ms', v_remaining_ms, 'locked', true);
  end if;

  insert into public.admin_login_guard (email_key, fails, locked_until, updated_at)
  values (v_key, v_fails, to_timestamp(0), now())
  on conflict (email_key) do update
    set fails = excluded.fails,
        locked_until = to_timestamp(0),
        updated_at = now();

  return jsonb_build_object('fails', v_fails, 'remaining_ms', 0, 'locked', false);
end;
$$;

-- Só limpa o lock depois de login válido (JWT com o mesmo email).
create or replace function public.admin_login_clear(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_email text := auth.jwt() ->> 'email';
  v_key text;
begin
  if v_auth_email is null or p_email is null then
    return;
  end if;
  if lower(trim(v_auth_email)) <> lower(trim(p_email)) then
    return;
  end if;

  v_key := public._admin_email_key(p_email);
  delete from public.admin_login_guard where email_key = v_key;
end;
$$;

revoke all on table public.admin_login_guard from anon, authenticated;
grant execute on function public.admin_login_status(text) to anon, authenticated;
grant execute on function public.admin_login_fail(text) to anon, authenticated;
grant execute on function public.admin_login_clear(text) to authenticated;
