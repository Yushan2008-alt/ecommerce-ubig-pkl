-- ==============================================================================
-- 0002_rls_storage.sql
-- Row Level Security (RLS) & Supabase Storage Policies
-- ==============================================================================

-- 1. AKTIFKAN RLS DI SEMUA TABEL
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.shops enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.digital_files enable row level security;
alter table public.cart_items enable row level security;
alter table public.wishlists enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.download_logs enable row level security;
alter table public.reviews enable row level security;
alter table public.comments enable row level security;
alter table public.reports enable row level security;
alter table public.payout_requests enable row level security;

-- 2. PROTEKSI ESKALASI HAK AKSES ROLE PROFILES
revoke update on public.profiles from authenticated;
grant update (display_name, phone, avatar_url) on public.profiles to authenticated;

-- 3. POLICIES PER TABEL

-- PROFILES
create policy "profiles_select_own" on public.profiles for select
  using (id = (select auth.uid()));

create policy "profiles_update_own" on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ADDRESSES
create policy "addresses_all_own" on public.addresses for all
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- SHOPS
create policy "shops_select_public_or_own" on public.shops for select
  using (status = 'active' or profile_id = (select auth.uid()));

create policy "shops_update_own" on public.shops for update
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- CATEGORIES & BRANDS (Publik read-only)
create policy "categories_select_public" on public.categories for select using (true);
create policy "brands_select_public" on public.brands for select using (true);

-- PRODUCTS
create policy "products_select_published_or_owner" on public.products for select
  using (status = 'published' or shop_id in (select id from public.shops where profile_id = (select auth.uid())));

create policy "products_write_owner" on public.products for all
  using (shop_id in (select id from public.shops where profile_id = (select auth.uid())))
  with check (shop_id in (select id from public.shops where profile_id = (select auth.uid())));

-- PRODUCT IMAGES
create policy "product_images_select_public_or_owner" on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id
      and (p.status = 'published' or p.shop_id in (select id from public.shops where profile_id = (select auth.uid())))
    )
  );

create policy "product_images_write_owner" on public.product_images for all
  using (
    exists (
      select 1 from public.products p
      join public.shops s on s.id = p.shop_id
      where p.id = product_id and s.profile_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.products p
      join public.shops s on s.id = p.shop_id
      where p.id = product_id and s.profile_id = (select auth.uid())
    )
  );

-- DIGITAL FILES (TIDAK ADA SELECT POLICY PUBLIK - AKSES VIA SIGNED URL SERVER)
create policy "digital_files_owner_select" on public.digital_files for select
  using (
    exists (
      select 1 from public.products p
      join public.shops s on s.id = p.shop_id
      where p.id = product_id and s.profile_id = (select auth.uid())
    )
  );

create policy "digital_files_owner_write" on public.digital_files for all
  using (
    exists (
      select 1 from public.products p
      join public.shops s on s.id = p.shop_id
      where p.id = product_id and s.profile_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.products p
      join public.shops s on s.id = p.shop_id
      where p.id = product_id and s.profile_id = (select auth.uid())
    )
  );

-- CART ITEMS
create policy "cart_items_own_all" on public.cart_items for all
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- WISHLISTS
create policy "wishlists_own_all" on public.wishlists for all
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

-- ORDERS (Hanya SELECT oleh pemilik, penulisan via RPC create_order / service role)
create policy "orders_select_own" on public.orders for select
  using (profile_id = (select auth.uid()));

-- ORDER ITEMS (SELECT oleh pemilik order atau pemilik toko yang bersangkutan)
create policy "order_items_select_buyer_or_vendor" on public.order_items for select
  using (
    order_id in (select id from public.orders where profile_id = (select auth.uid()))
    or shop_id in (select id from public.shops where profile_id = (select auth.uid()))
  );

-- PAYMENTS (Hanya SELECT oleh pembeli pemilik order)
create policy "payments_select_own" on public.payments for select
  using (order_id in (select id from public.orders where profile_id = (select auth.uid())));

-- DOWNLOAD LOGS (Hanya SELECT oleh pembeli pemilik)
create policy "download_logs_select_own" on public.download_logs for select
  using (profile_id = (select auth.uid()));

-- REVIEWS (Publik baca; insert hanya pembeli yang itemnya completed)
create policy "reviews_select_public" on public.reviews for select using (true);

create policy "reviews_insert_verified_buyer" on public.reviews for insert
  with check (
    profile_id = (select auth.uid())
    and exists (
      select 1 from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.id = order_item_id
      and o.profile_id = (select auth.uid())
      and oi.fulfilment_status = 'completed'
    )
  );

create policy "reviews_update_own" on public.reviews for update
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "reviews_delete_own" on public.reviews for delete
  using (profile_id = (select auth.uid()));

-- COMMENTS (Publik baca; insert & edit oleh authenticated)
create policy "comments_select_public" on public.comments for select using (true);

create policy "comments_insert_auth" on public.comments for insert
  with check (profile_id = (select auth.uid()));

create policy "comments_update_own" on public.comments for update
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "comments_delete_own" on public.comments for delete
  using (profile_id = (select auth.uid()));

-- REPORTS (Pelapor insert & select laporan sendiri)
create policy "reports_insert_auth" on public.reports for insert
  with check (reporter_id = (select auth.uid()));

create policy "reports_select_own" on public.reports for select
  using (reporter_id = (select auth.uid()));

-- PAYOUT REQUESTS (Vendor hanya bisa melihat riwayat tokonya, insert via RPC)
create policy "payout_requests_select_vendor" on public.payout_requests for select
  using (shop_id in (select id from public.shops where profile_id = (select auth.uid())));

-- ==============================================================================
-- 4. STORAGE BUCKETS & POLICIES
-- ==============================================================================

-- Buat buckets (idempotent dengan insert on conflict)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('shop-assets', 'shop-assets', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('digital-files', 'digital-files', false, 52428800, null)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Policy Storage: product-images (Publik baca, tulis folder UID sendiri)
create policy "storage_product_images_select_public" on storage.objects for select
  using (bucket_id = 'product-images');

create policy "storage_product_images_insert_own_folder" on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and auth.role() = 'authenticated'
  );

create policy "storage_product_images_update_own_folder" on storage.objects for update
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and auth.role() = 'authenticated'
  );

create policy "storage_product_images_delete_own_folder" on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and auth.role() = 'authenticated'
  );

-- Policy Storage: shop-assets (Publik baca, tulis folder UID sendiri)
create policy "storage_shop_assets_select_public" on storage.objects for select
  using (bucket_id = 'shop-assets');

create policy "storage_shop_assets_insert_own_folder" on storage.objects for insert
  with check (
    bucket_id = 'shop-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and auth.role() = 'authenticated'
  );

create policy "storage_shop_assets_update_own_folder" on storage.objects for update
  using (
    bucket_id = 'shop-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and auth.role() = 'authenticated'
  );

create policy "storage_shop_assets_delete_own_folder" on storage.objects for delete
  using (
    bucket_id = 'shop-assets'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and auth.role() = 'authenticated'
  );

-- Policy Storage: digital-files (PRIVAT: TIDAK ADA POLICY SELECT PUBLIK)
create policy "storage_digital_files_insert_own_folder" on storage.objects for insert
  with check (
    bucket_id = 'digital-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and auth.role() = 'authenticated'
  );

create policy "storage_digital_files_update_own_folder" on storage.objects for update
  using (
    bucket_id = 'digital-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and auth.role() = 'authenticated'
  );

create policy "storage_digital_files_delete_own_folder" on storage.objects for delete
  using (
    bucket_id = 'digital-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and auth.role() = 'authenticated'
  );
