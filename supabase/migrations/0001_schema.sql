-- ==============================================================================
-- 0001_schema.sql
-- Marketplace Multi-Vendor (Produk Fisik & Digital)
-- ==============================================================================

-- 1. ENUMS
create type public.user_role as enum ('member', 'vendor');
create type public.product_type as enum ('physical', 'digital');
create type public.product_status as enum ('draft', 'published', 'archived');
create type public.order_status as enum ('pending_payment', 'paid', 'expired', 'cancelled');
create type public.fulfilment_status as enum ('waiting', 'processing', 'shipped', 'completed', 'cancelled');
create type public.payout_status as enum ('pending', 'paid', 'rejected');
create type public.report_status as enum ('open', 'resolved', 'dismissed');

-- 2. TABEL UTAMA

-- Profiles (terhubung langsung ke auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'member',
  display_name text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Addresses (Buku alamat member)
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  address_line text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- Shops (Toko milik vendor - 1 profil hanya 1 toko)
create table public.shops (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  flat_shipping_cost numeric not null default 0 check (flat_shipping_cost >= 0),
  whatsapp text,
  phone text,
  email text,
  city text,
  province text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories (Hirarki 3 tingkat)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete cascade,
  name text not null,
  slug text not null unique,
  icon_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Brands
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

-- Products (Produk Fisik & Digital)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete restrict,
  brand_id uuid references public.brands(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text not null,
  type public.product_type not null default 'physical',
  price numeric not null check (price >= 0),
  compare_price numeric check (compare_price is null or compare_price >= 0),
  stock int check (stock is null or stock >= 0),
  sku text,
  weight numeric check (weight is null or weight >= 0),
  attributes jsonb not null default '{}'::jsonb,
  status public.product_status not null default 'draft',
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  search_tsv tsvector generated always as (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(description, ''))) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint digital_stock_check check (type != 'digital' or stock is null)
);

-- Product Images
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  path text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Digital Files (Aset unduhan digital - bucket privat)
create table public.digital_files (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  path text not null,
  file_name text not null,
  size bigint not null,
  format text not null,
  created_at timestamptz not null default now()
);

-- Cart Items
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  qty int not null default 1 check (qty > 0),
  buyer_note text,
  created_at timestamptz not null default now(),
  constraint unique_profile_product_cart unique (profile_id, product_id)
);

-- Wishlists
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint unique_profile_product_wishlist unique (profile_id, product_id)
);

-- Orders (Header transaksi pembayaran)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete restrict,
  code text not null unique,
  status public.order_status not null default 'pending_payment',
  total numeric not null check (total >= 0),
  snap_token text,
  expires_at timestamptz,
  paid_at timestamptz,
  shipping_address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order Items (Snapshot transaksi per item toko)
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  shop_id uuid not null references public.shops(id) on delete restrict,
  product_id uuid not null references public.products(id) on delete restrict,
  title text not null,
  price numeric not null check (price >= 0),
  compare_price numeric check (compare_price is null or compare_price >= 0),
  qty int not null check (qty > 0),
  shipping_cost numeric not null default 0 check (shipping_cost >= 0),
  commission_amount numeric not null default 0 check (commission_amount >= 0),
  net_amount numeric not null default 0,
  buyer_note text,
  fulfilment_status public.fulfilment_status not null default 'waiting',
  tracking_number text,
  downloads_count int not null default 0 check (downloads_count >= 0),
  download_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Payments (Log Midtrans payment notification)
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  payment_type text,
  midtrans_status text,
  gross_amount numeric not null,
  raw jsonb not null default '{}'::jsonb,
  signature_valid boolean not null default true,
  created_at timestamptz not null default now()
);

-- Download Logs (Audit trail unduhan produk digital)
create table public.download_logs (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Reviews (Hanya untuk item pesanan yang sudah completed)
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  order_item_id uuid not null unique references public.order_items(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments (Diskusi produk publik)
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Reports (Laporan pelanggaran produk atau komentar)
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('product', 'comment')),
  target_id uuid not null,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null,
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);

-- Payout Requests (Pengajuan penarikan dana vendor)
create table public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete restrict,
  amount numeric not null check (amount > 0),
  bank_name text not null,
  account_no text not null,
  account_holder text not null,
  status public.payout_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

-- 3. INDEXES
create index idx_products_search_tsv on public.products using gin (search_tsv);
create index idx_products_shop_id on public.products(shop_id);
create index idx_products_category_id on public.products(category_id);
create index idx_products_brand_id on public.products(brand_id);
create index idx_products_status on public.products(status);

create index idx_product_images_product_id on public.product_images(product_id);
create index idx_digital_files_product_id on public.digital_files(product_id);

create index idx_cart_items_profile_id on public.cart_items(profile_id);
create index idx_cart_items_product_id on public.cart_items(product_id);
create index idx_wishlists_profile_id on public.wishlists(profile_id);

create index idx_orders_profile_id on public.orders(profile_id);
create index idx_orders_code on public.orders(code);
create index idx_orders_status on public.orders(status);

create index idx_order_items_order_id on public.order_items(order_id);
create index idx_order_items_shop_id on public.order_items(shop_id);
create index idx_order_items_product_id on public.order_items(product_id);

create index idx_reviews_product_id on public.reviews(product_id);
create index idx_reviews_profile_id on public.reviews(profile_id);
create index idx_comments_product_id on public.comments(product_id);
create index idx_payout_requests_shop_id on public.payout_requests(shop_id);

-- 4. TRIGGERS & FUNCTIONS DASAR

-- Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger tr_shops_updated_at before update on public.shops for each row execute function public.set_updated_at();
create trigger tr_products_updated_at before update on public.products for each row execute function public.set_updated_at();
create trigger tr_orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger tr_order_items_updated_at before update on public.order_items for each row execute function public.set_updated_at();
create trigger tr_reviews_updated_at before update on public.reviews for each row execute function public.set_updated_at();
create trigger tr_comments_updated_at before update on public.comments for each row execute function public.set_updated_at();

-- Auto-create profile saat user mendaftar via auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    'member'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-recalculate rating_avg dan rating_count pada produk
create or replace function public.update_product_rating()
returns trigger as $$
declare
  v_prod_id uuid;
begin
  if (tg_op = 'DELETE') then
    v_prod_id := old.product_id;
  else
    v_prod_id := new.product_id;
  end if;

  update public.products
  set
    rating_avg = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where product_id = v_prod_id), 0),
    rating_count = (select count(*) from public.reviews where product_id = v_prod_id)
  where id = v_prod_id;

  return null;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_review_change
  after insert or update or delete on public.reviews
  for each row execute function public.update_product_rating();

-- 5. VIEWS

-- Profil publik (hanya nama & avatar untuk tampilan review/komentar publik)
create or replace view public.public_profiles as
select id, display_name, avatar_url
from public.profiles;

-- Admin minimalis view: Pengajuan penarikan dana pending
create or replace view public.v_admin_pending_payouts as
select
  pr.id as request_id,
  s.name as shop_name,
  s.email as shop_email,
  s.phone as shop_phone,
  pr.amount,
  pr.bank_name,
  pr.account_no,
  pr.account_holder,
  pr.status,
  pr.created_at
from public.payout_requests pr
join public.shops s on s.id = pr.shop_id
where pr.status = 'pending'
order by pr.created_at asc;

-- Admin minimalis view: Laporan yang belum diselesaikan
create or replace view public.v_admin_open_reports as
select
  r.id as report_id,
  r.target_type,
  r.target_id,
  p.display_name as reporter_name,
  r.reason,
  r.status,
  r.created_at
from public.reports r
join public.profiles p on p.id = r.reporter_id
where r.status = 'open'
order by r.created_at asc;
