-- Migração para redefinição de senhas com OTP via Resend HTTP (Kito Resend Auth)
create table if not exists public.password_resets (
  id varchar(64) primary key,
  user_type varchar(16) not null,            -- 'employee' ou 'manager'
  company_id varchar(32),                    -- preenchido se 'employee'
  target_id varchar(64) not null,            -- employee_id ou user_id
  email varchar(320) not null,
  code varchar(10) not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  verified_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_resets_lookup 
  on public.password_resets(user_type, email, verified_at, used_at);

alter table public.password_resets enable row level security;
revoke all on public.password_resets from anon, authenticated;
grant all on public.password_resets to service_role;
