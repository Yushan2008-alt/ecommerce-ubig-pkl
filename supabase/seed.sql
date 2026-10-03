-- ==============================================================================
-- seed.sql
-- Master Data Awal: Kategori 3 Tingkat & Brand
-- ==============================================================================

-- 1. SEED BRANDS
insert into public.brands (id, name, slug)
values
  ('b1111111-1111-1111-1111-111111111111', 'Uniqlo', 'uniqlo'),
  ('b2222222-2222-2222-2222-222222222222', 'Zara', 'zara'),
  ('b3333333-3333-3333-3333-333333333333', 'Apple', 'apple'),
  ('b4444444-4444-4444-4444-444444444444', 'Samsung', 'samsung'),
  ('b5555555-5555-5555-5555-555555555555', 'Sony', 'sony'),
  ('b6666666-6666-6666-6666-666666666666', 'Ubig Studio', 'ubig-studio')
on conflict (slug) do nothing;

-- 2. SEED KATEGORI 3 TINGKAT

-- LEVEL 1: Kategori Utama (Parent = NULL)
insert into public.categories (id, parent_id, name, slug, icon_url, sort_order)
values
  ('c1000000-0000-0000-0000-000000000000', null, 'Fashion & Pakaian', 'fashion-pakaian', 'Shirt', 1),
  ('c2000000-0000-0000-0000-000000000000', null, 'Elektronik & Gadget', 'elektronik-gadget', 'Laptop', 2),
  ('c3000000-0000-0000-0000-000000000000', null, 'Produk Digital', 'produk-digital', 'Download', 3)
on conflict (slug) do nothing;

-- LEVEL 2: Sub-Kategori (Parent = Level 1)
insert into public.categories (id, parent_id, name, slug, sort_order)
values
  -- Sub dari Fashion
  ('c1100000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'Pakaian Pria', 'pakaian-pria', 1),
  ('c1200000-0000-0000-0000-000000000000', 'c1000000-0000-0000-0000-000000000000', 'Pakaian Wanita', 'pakaian-wanita', 2),

  -- Sub dari Elektronik
  ('c2100000-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000000', 'Smartphone & Tablet', 'smartphone-tablet', 1),
  ('c2200000-0000-0000-0000-000000000000', 'c2000000-0000-0000-0000-000000000000', 'Audio & Speaker', 'audio-speaker', 2),

  -- Sub dari Produk Digital
  ('c3100000-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000000', 'E-Book & Dokumen', 'ebook-dokumen', 1),
  ('c3200000-0000-0000-0000-000000000000', 'c3000000-0000-0000-0000-000000000000', 'Template & Source Code', 'template-source-code', 2)
on conflict (slug) do nothing;

-- LEVEL 3: Sub-Sub-Kategori (Parent = Level 2)
insert into public.categories (id, parent_id, name, slug, sort_order)
values
  -- Sub-sub dari Pakaian Pria
  ('c1110000-0000-0000-0000-000000000000', 'c1100000-0000-0000-0000-000000000000', 'Kaos & Polo', 'kaos-polo', 1),
  ('c1120000-0000-0000-0000-000000000000', 'c1100000-0000-0000-0000-000000000000', 'Kemeja', 'kemeja-pria', 2),

  -- Sub-sub dari Pakaian Wanita
  ('c1210000-0000-0000-0000-000000000000', 'c1200000-0000-0000-0000-000000000000', 'Dress & Terusan', 'dress-terusan', 1),
  ('c1220000-0000-0000-0000-000000000000', 'c1200000-0000-0000-0000-000000000000', 'Blouse & Atasan', 'blouse-atasan', 2),

  -- Sub-sub dari Smartphone
  ('c2110000-0000-0000-0000-000000000000', 'c2100000-0000-0000-0000-000000000000', 'Aksesoris Handphone', 'aksesoris-handphone', 1),

  -- Sub-sub dari Audio
  ('c2210000-0000-0000-0000-000000000000', 'c2200000-0000-0000-0000-000000000000', 'Headphone & TWS', 'headphone-tws', 1),

  -- Sub-sub dari E-Book
  ('c3110000-0000-0000-0000-000000000000', 'c3100000-0000-0000-0000-000000000000', 'Bisnis & Marketing', 'ebook-bisnis', 1),

  -- Sub-sub dari Template & Source Code
  ('c3210000-0000-0000-0000-000000000000', 'c3200000-0000-0000-0000-000000000000', 'Template Web & Desain UI', 'template-web-ui', 1)
on conflict (slug) do nothing;
