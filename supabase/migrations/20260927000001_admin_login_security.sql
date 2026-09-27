-- Tabela: admin_login_whitelist
create table if not exists public.admin_login_whitelist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  label text,
  active boolean default true,
  created_at timestamptz default now(),
  created_by text
);

-- Tabela: admin_login_tokens
create table if not exists public.admin_login_tokens (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  otp_code text not null,
  expires_at timestamptz not null,
  used boolean default false,
  attempts integer default 0,
  max_attempts integer default 3,
  created_at timestamptz default now()
);

create index if not exists idx_admin_whitelist_email on public.admin_login_whitelist(email);
create index if not exists idx_admin_whitelist_active on public.admin_login_whitelist(active);
create index if not exists idx_admin_tokens_email on public.admin_login_tokens(email);
create index if not exists idx_admin_tokens_otp on public.admin_login_tokens(otp_code);
create index if not exists idx_admin_tokens_expires on public.admin_login_tokens(expires_at);

alter table public.admin_login_whitelist enable row level security;
alter table public.admin_login_tokens enable row level security;

-- Whitelist: authenticated can SELECT (frontend needs to read it), service_role full manage
drop policy if exists "authenticated_select_admin_login_whitelist" on public.admin_login_whitelist;
create policy "authenticated_select_admin_login_whitelist"
  on public.admin_login_whitelist for select to authenticated using (true);

revoke all on public.admin_login_whitelist from anon;
grant all on public.admin_login_whitelist to service_role;

-- Tokens: service_role only (security sensitive)
revoke all on public.admin_login_tokens from anon, authenticated;
grant all on public.admin_login_tokens to service_role;
