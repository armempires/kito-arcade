-- Migração CRM Tables (Kito Arcade)

-- =========================================
-- CLIENTS
-- =========================================
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pet_name text not null,
  phone text not null,
  email text not null,
  created_at timestamptz default now(),
  portal_user_id uuid,
  has_portal_access boolean default true,
  profile_completed boolean default false,
  whatsapp text,
  birth_date text,
  cpf text,
  cnpj text,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  estado text,
  admin_notes text,
  contracted_domain text,
  contracted_hosting text,
  contracted_extras text,
  contracted_service_type text,
  contracted_service_name text,
  contracted_total_value numeric,
  contracted_installments integer,
  first_payment_date text,
  pipeline_id text,
  pipeline_current_step integer default 1,
  custom_pipeline_steps jsonb,
  contract_accepted boolean default false,
  contract_accepted_at timestamptz,
  contract_text text,
  asaas_customer_id text,
  asaas_subscription_id text
);

-- =========================================
-- CLIENT_PAYMENTS
-- =========================================
create table if not exists public.client_payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients on delete cascade,
  due_date date not null,
  amount numeric(12,2) not null,
  status text default 'pending' not null,
  payment_method text default 'pix',
  paid_at timestamptz,
  asaas_payment_id text,
  asaas_pix_qr_code text,
  asaas_pix_copy_paste text,
  notes text,
  installment_number integer,
  created_at timestamptz default now() not null
);

-- =========================================
-- SERVICES
-- =========================================
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '' not null,
  price numeric(10,2) default 0 not null,
  image_url text,
  display_order integer default 0 not null,
  created_at timestamptz default now()
);

-- =========================================
-- PROFESSIONALS
-- =========================================
create table if not exists public.professionals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar text,
  created_at timestamptz default now(),
  email text
);

-- =========================================
-- PROFESSIONAL_SCHEDULES
-- =========================================
create table if not exists public.professional_schedules (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.professionals on delete cascade,
  day_of_week integer not null check (day_of_week between 1 and 7),
  time text not null,
  available boolean default true,
  created_at timestamptz default now()
);

-- =========================================
-- BOOKINGS
-- =========================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,
  date text not null,
  time text not null,
  professional_id uuid not null references public.professionals on delete restrict,
  professional_name text not null,
  phone text not null,
  tutor_name text not null,
  pet_name text not null,
  notes text default '',
  status text default 'Pendente' not null
    check (status in ('Pendente', 'Em atendimento', 'Concluido', 'Cancelado')),
  created_at timestamptz default now(),
  email text,
  service_id uuid references public.services on delete set null
);

-- =========================================
-- BLOG_POSTS
-- =========================================
create table if not exists public.blog_posts (
  id text primary key,
  slug text not null,
  title text not null,
  excerpt text,
  content text not null,
  cover_image text,
  category text not null,
  category_slug text not null,
  tags text[] default '{}'::text[],
  author_name text default 'Kito Expert',
  author_avatar text default '/assets/covers/card_kito_expert.jpg',
  author_role text default 'Especialista Kito',
  reading_time_minutes integer default 5,
  views_count integer default 0
);

-- =========================================
-- EMAIL_VERIFICATIONS
-- =========================================
create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  verified boolean default false,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);

-- =========================================
-- EMAIL_LOGS
-- =========================================
create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid,
  recipient_email text not null,
  recipient_type text not null
    check (recipient_type in ('client', 'professional', 'admin')),
  subject text not null,
  status text default 'sent' not null
    check (status in ('sent', 'failed', 'delivered')),
  error text,
  created_at timestamptz default now()
);

-- =========================================
-- INDEXES (only for columns that exist)
-- =========================================
create index if not exists idx_clients_email on public.clients(email);
create index if not exists idx_clients_portal_user_id on public.clients(portal_user_id);
create index if not exists idx_clients_cpf on public.clients(cpf);
create index if not exists idx_client_payments_client_id on public.client_payments(client_id);
create index if not exists idx_client_payments_status on public.client_payments(status);
create index if not exists idx_client_payments_asaas_payment_id on public.client_payments(asaas_payment_id);
create index if not exists idx_services_display_order on public.services(display_order);
create index if not exists idx_bookings_date on public.bookings(date);
create index if not exists idx_bookings_professional_id on public.bookings(professional_id);
create index if not exists idx_bookings_service_id on public.bookings(service_id);
create index if not exists idx_bookings_status on public.bookings(status);
create index if not exists idx_blog_posts_slug on public.blog_posts(slug);
create index if not exists idx_blog_posts_category on public.blog_posts(category);
create index if not exists idx_email_verifications_email on public.email_verifications(email);
create index if not exists idx_email_verifications_code on public.email_verifications(code);
create index if not exists idx_email_logs_booking_id on public.email_logs(booking_id);
create index if not exists idx_email_logs_recipient_email on public.email_logs(recipient_email);

-- =========================================
-- UNIQUE CONSTRAINTS (safe via DO blocks)
-- =========================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_clients_email_unique' AND schemaname = 'public') THEN
    CREATE UNIQUE INDEX idx_clients_email_unique ON public.clients(email);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_blog_posts_slug_unique' AND schemaname = 'public') THEN
    CREATE UNIQUE INDEX idx_blog_posts_slug_unique ON public.blog_posts(slug);
  END IF;
END $$;

-- =========================================
-- RLS: role-based policies
-- =========================================

-- clients
alter table public.clients enable row level security;
drop policy if exists "anon_select_clients" on public.clients;
drop policy if exists "admin_full_manage_clients" on public.clients;
create policy "anon_select_clients" on public.clients for select to anon, authenticated using (true);
create policy "admin_full_manage_clients" on public.clients for all to authenticated using ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client') with check ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client');

-- client_payments — anon no access; authenticated full
alter table public.client_payments enable row level security;
drop policy if exists "authenticated_select_client_payments" on public.client_payments;
drop policy if exists "authenticated_insert_client_payments" on public.client_payments;
drop policy if exists "authenticated_update_client_payments" on public.client_payments;
drop policy if exists "authenticated_delete_client_payments" on public.client_payments;
create policy "authenticated_select_client_payments" on public.client_payments for select to authenticated using (true);
create policy "authenticated_insert_client_payments" on public.client_payments for insert to authenticated with check (true);
create policy "authenticated_update_client_payments" on public.client_payments for update to authenticated using (true) with check (true);
create policy "authenticated_delete_client_payments" on public.client_payments for delete to authenticated using (true);

-- services
alter table public.services enable row level security;
drop policy if exists "anon_select_services" on public.services;
drop policy if exists "admin_modify_services" on public.services;
create policy "anon_select_services" on public.services for select to anon, authenticated using (true);
create policy "admin_modify_services" on public.services for all to authenticated using ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client') with check ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client');

-- professionals
alter table public.professionals enable row level security;
drop policy if exists "anon_select_professionals" on public.professionals;
drop policy if exists "admin_modify_professionals" on public.professionals;
create policy "anon_select_professionals" on public.professionals for select to anon, authenticated using (true);
create policy "admin_modify_professionals" on public.professionals for all to authenticated using ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client') with check ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client');

-- professional_schedules
alter table public.professional_schedules enable row level security;
drop policy if exists "anon_select_professional_schedules" on public.professional_schedules;
drop policy if exists "admin_modify_professional_schedules" on public.professional_schedules;
create policy "anon_select_professional_schedules" on public.professional_schedules for select to anon, authenticated using (true);
create policy "admin_modify_professional_schedules" on public.professional_schedules for all to authenticated using ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client') with check ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client');

-- bookings — anon can SELECT + INSERT, authenticated full CRUD
alter table public.bookings enable row level security;
drop policy if exists "anon_select_bookings" on public.bookings;
drop policy if exists "anon_insert_bookings" on public.bookings;
drop policy if exists "authenticated_modify_bookings" on public.bookings;
create policy "anon_select_bookings" on public.bookings for select to anon, authenticated using (true);
create policy "anon_insert_bookings" on public.bookings for insert to anon, authenticated with check (true);
create policy "authenticated_modify_bookings" on public.bookings for all to authenticated using (true) with check (true);

-- blog_posts
alter table public.blog_posts enable row level security;
drop policy if exists "anon_select_blog_posts" on public.blog_posts;
drop policy if exists "admin_modify_blog_posts" on public.blog_posts;
create policy "anon_select_blog_posts" on public.blog_posts for select to anon, authenticated using (true);
create policy "admin_modify_blog_posts" on public.blog_posts for all to authenticated using ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client') with check ((auth.jwt() -> 'user_metadata' ->> 'role') is distinct from 'client');

-- email_verifications (service_role only)
alter table public.email_verifications enable row level security;
revoke all on public.email_verifications from anon, authenticated;
grant all on public.email_verifications to service_role;

-- email_logs
alter table public.email_logs enable row level security;
drop policy if exists "anon_select_email_logs" on public.email_logs;
drop policy if exists "anon_insert_email_logs" on public.email_logs;
drop policy if exists "authenticated_modify_email_logs" on public.email_logs;
create policy "anon_select_email_logs" on public.email_logs for select to anon, authenticated using (true);
create policy "anon_insert_email_logs" on public.email_logs for insert to anon, authenticated with check (true);
create policy "authenticated_modify_email_logs" on public.email_logs for all to authenticated using (true) with check (true);
