-- ==============================================================================
-- 0005_vendor_onboarding_moderator.sql
-- Alur Pendaftaran Vendor 6 Langkah & Panel Moderator
-- ==============================================================================

-- 1. Tambahkan role 'moderator' ke enum user_role jika belum ada
do $$
begin
  if not exists (
    select 1 from pg_enum 
    where enumtypid = 'public.user_role'::regtype 
    and enumlabel = 'moderator'
  ) then
    alter type public.user_role add value 'moderator';
  end if;
end $$;

-- 2. Tambahkan kolom baru pada tabel public.shops
alter table public.shops 
  add column if not exists pickup_address text,
  add column if not exists postal_code text,
  add column if not exists couriers text[] default '{}'::text[],
  add column if not exists bank_name text,
  add column if not exists bank_account_number text,
  add column if not exists bank_account_holder text,
  add column if not exists moderator_notes text,
  add column if not exists verified_at timestamptz;

-- 3. Policy agar moderator dapat melihat dan memperbarui status toko
create policy "Moderator dapat melihat semua toko"
  on public.shops for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'moderator'
    )
    or auth.uid() = profile_id
    or status = 'active'
  );

create policy "Moderator dapat memperbarui status toko"
  on public.shops for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'moderator'
    )
    or auth.uid() = profile_id
  );
