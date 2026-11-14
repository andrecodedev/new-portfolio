-- Bloqueio de login no servidor por EMAIL + IP.
-- Limpar cookie NÃO zera: o timer volta na hora (pelo IP), sem digitar email.
-- Rode no SQL Editor do projeto.

create table if not exists public.admin_login_guard (
  email_key text primary key,
  fails integer not null default 0,
  locked_until timestamptz not null default to_timestamp(0),
  updated_at timestamptz not null default now()
);

alter table public.admin_login_guard enable row level security;

create or replace function public._admin_email_key(p_email text)
returns text
language sql
immutable
as $$
  select 'e:' || md5(lower(trim(p_email)));
$$;

create or replace function public._admin_client_ip()
returns text
language sql
stable
as $$
  select nullif(
    trim(both from split_part(
      coalesce(
        current_setting('request.headers', true)::json->>'x-forwarded-for',
        current_setting('request.headers', true)::json->>'cf-connecting-ip',
        current_setting('request.headers', true)::json->>'x-real-ip',
        ''
      ),
      ',',
      1
    )),
    ''
  );
$$;

create or replace function public._admin_ip_key()
returns text
language sql
stable
as $$
  select case
    when public._admin_client_ip() is null then null
    else 'i:' || md5(public._admin_client_ip())
  end;
$$;

create or replace function public._admin_remaining_ms(p_key text)
returns bigint
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_until timestamptz;
begin
  if p_key is null then
    return 0;
  end if;
  select locked_until into v_until
  from public.admin_login_guard
  where email_key = p_key;
  if v_until is null then
    return 0;
  end if;
  return greatest(0, floor(extract(epoch from (v_until - now())) * 1000))::bigint;
end;
$$;

create or replace function public.admin_login_status(p_email text default '')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_ms bigint := 0;
  v_ip_ms bigint := 0;
  v_ms bigint := 0;
begin
  if p_email is not null and length(trim(p_email)) > 0 then
    v_email_ms := public._admin_remaining_ms(public._admin_email_key(p_email));
  end if;
  v_ip_ms := public._admin_remaining_ms(public._admin_ip_key());
  v_ms := greatest(v_email_ms, v_ip_ms);

  return jsonb_build_object(
    'fails', 0,
    'remaining_ms', v_ms,
    'locked', v_ms > 0
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
  v_email_key text;
  v_ip_key text := public._admin_ip_key();
  v_row public.admin_login_guard%rowtype;
  v_fails integer;
  v_remaining_ms bigint := 0;
  v_max integer := 3;
  v_lock_seconds integer := 300;
  v_lock_until timestamptz;
begin
  if p_email is null or length(trim(p_email)) = 0 then
    return public.admin_login_status('');
  end if;

  -- Limite duro: evita payload gigante (parâmetro bound; não é SQL injection).
  if length(p_email) > 254 then
    return jsonb_build_object('fails', 0, 'remaining_ms', 0, 'locked', false);
  end if;

  v_email_key := public._admin_email_key(p_email);
  v_remaining_ms := greatest(
    public._admin_remaining_ms(v_email_key),
    public._admin_remaining_ms(v_ip_key)
  );

  if v_remaining_ms > 0 then
    return jsonb_build_object('fails', 0, 'remaining_ms', v_remaining_ms, 'locked', true);
  end if;

  select * into v_row from public.admin_login_guard where email_key = v_email_key;
  v_fails := coalesce(v_row.fails, 0) + 1;

  if v_fails >= v_max then
    v_lock_until := now() + make_interval(secs => v_lock_seconds);

    insert into public.admin_login_guard (email_key, fails, locked_until, updated_at)
    values (v_email_key, 0, v_lock_until, now())
    on conflict (email_key) do update
      set fails = 0,
          locked_until = excluded.locked_until,
          updated_at = now();

    if v_ip_key is not null then
      insert into public.admin_login_guard (email_key, fails, locked_until, updated_at)
      values (v_ip_key, 0, v_lock_until, now())
      on conflict (email_key) do update
        set fails = 0,
            locked_until = excluded.locked_until,
            updated_at = now();
    end if;

    return jsonb_build_object('fails', 0, 'remaining_ms', v_lock_seconds * 1000, 'locked', true);
  end if;

  insert into public.admin_login_guard (email_key, fails, locked_until, updated_at)
  values (v_email_key, v_fails, to_timestamp(0), now())
  on conflict (email_key) do update
    set fails = excluded.fails,
        locked_until = to_timestamp(0),
        updated_at = now();

  return jsonb_build_object('fails', v_fails, 'remaining_ms', 0, 'locked', false);
end;
$$;

create or replace function public.admin_login_clear(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_email text := auth.jwt() ->> 'email';
  v_ip_key text := public._admin_ip_key();
begin
  if v_auth_email is null or p_email is null then
    return;
  end if;
  if lower(trim(v_auth_email)) <> lower(trim(p_email)) then
    return;
  end if;

  delete from public.admin_login_guard where email_key = public._admin_email_key(p_email);
  if v_ip_key is not null then
    delete from public.admin_login_guard where email_key = v_ip_key;
  end if;
end;
$$;

revoke all on table public.admin_login_guard from anon, authenticated;
grant execute on function public.admin_login_status(text) to anon, authenticated;
grant execute on function public.admin_login_fail(text) to anon, authenticated;
grant execute on function public.admin_login_clear(text) to authenticated;
