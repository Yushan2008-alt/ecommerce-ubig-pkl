-- ==============================================================================
-- 0004_otp_codes.sql
-- Tabel Penyimpanan Kode OTP untuk Verifikasi Email Manual
-- ==============================================================================

create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code text not null,
  type text not null default 'signup',
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- RLS: Tidak ada policy publik/authenticated, hanya bisa diakses via service_role di server
alter table public.otp_codes enable row level security;

-- Index untuk pencarian cepat berdasarkan email dan tipe
create index if not exists idx_otp_codes_email_type on public.otp_codes (email, type);
