/**
 * scripts/seed-marketplace-catalog.cjs
 *
 * Script seeding katalog produk resmi (Fisik & Digital) ke Supabase Database.
 * Menyediakan toko vendor resmi, kategori, brand, 16 produk berkualitas tinggi,
 * galeri foto produk, dan file digital unduhan.
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Baca .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
}

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SECRET_KEY tidak ditemukan di environment!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function main() {
  console.log('=== MEMULAI SEEDING KATALOG MARKETPLACE KRAFITA ===\n');

  // 1. Dapatkan Pengguna Vendor
  console.log('1. Mengidentifikasi Vendor Resmi...');
  const { data: usersData, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) throw userErr;

  let vendorUser = usersData.users.find((u) => u.email?.toLowerCase() === 'mlyus6471@gmail.com');
  if (!vendorUser && usersData.users.length > 0) {
    vendorUser = usersData.users[0];
  }

  if (!vendorUser) {
    throw new Error('Tidak ada user auth yang terdaftar untuk dijadikan vendor');
  }

  console.log(`   Vendor User ID: ${vendorUser.id} (${vendorUser.email})`);

  // Pastikan role di profil adalah vendor
  await supabase
    .from('profiles')
    .upsert({
      id: vendorUser.id,
      role: 'vendor',
      display_name: 'Krafita Official Store',
      updated_at: new Date().toISOString(),
    });

  // 2. Pastikan Toko Vendor Aktif
  console.log('\n2. Memastikan Toko Vendor Resmi Aktif...');
  let shopId;
  const { data: existingShops, error: shopErr } = await supabase
    .from('shops')
    .select('id, name, slug, status')
    .eq('profile_id', vendorUser.id)
    .maybeSingle();

  if (existingShops) {
    shopId = existingShops.id;
    await supabase
      .from('shops')
      .update({ status: 'active', flat_shipping_cost: 15000 })
      .eq('id', shopId);
    console.log(`   Toko aktif ditemukan: "${existingShops.name}" (ID: ${shopId})`);
  } else {
    shopId = '0a000000-0000-0000-0000-000000000001';
    const { error: newShopErr } = await supabase.from('shops').insert({
      id: shopId,
      profile_id: vendorUser.id,
      name: 'Krafita Official Store',
      slug: 'krafita-official',
      description: 'Official flagship store Krafita Marketplace: Fashion, Gadget, & Produk Digital.',
      status: 'active',
      flat_shipping_cost: 15000,
      city: 'Kota Malang',
      province: 'Jawa Timur',
    });
    if (newShopErr) throw newShopErr;
    console.log(`   Toko baru dibuat: "Krafita Official Store" (ID: ${shopId})`);
  }

  // 3. Pastikan Brand Tersedia
  console.log('\n3. Menyiapkan Brand...');
  const brands = [
    { id: 'b1111111-1111-1111-1111-111111111111', name: 'Uniqlo', slug: 'uniqlo' },
    { id: 'b2222222-2222-2222-2222-222222222222', name: 'Zara', slug: 'zara' },
    { id: 'b3333333-3333-3333-3333-333333333333', name: 'Apple', slug: 'apple' },
    { id: 'b4444444-4444-4444-4444-444444444444', name: 'Samsung', slug: 'samsung' },
    { id: 'b5555555-5555-5555-5555-555555555555', name: 'Sony', slug: 'sony' },
    { id: 'b6666666-6666-6666-6666-666666666666', name: 'Ubig Studio', slug: 'ubig-studio' },
  ];
  for (const b of brands) {
    await supabase.from('brands').upsert(b, { onConflict: 'id' });
  }
  console.log('   Brand siap.');

  // 4. Dapatkan Kategori
  console.log('\n4. Mengambil Kategori...');
  const { data: categories } = await supabase.from('categories').select('id, name, slug');
  if (!categories || categories.length === 0) {
    throw new Error('Tabel categories kosong. Silakan jalankan migrasi schema dasar terlebih dahulu.');
  }

  const findCat = (slugPart) => {
    const match = categories.find((c) => c.slug.includes(slugPart) || c.name.toLowerCase().includes(slugPart));
    return match ? match.id : categories[0].id;
  };

  const catFashion = findCat('pakaian');
  const catWomen = findCat('wanita') || catFashion;
  const catMen = findCat('pria') || catFashion;
  const catGadget = findCat('aksesoris') || categories[0].id;
  const catDigital = findCat('template') || findCat('digital') || findCat('video') || categories[0].id;

  // 5. Daftar 16 Produk Kaya (12 Fisik + 4 Digital)
  console.log('\n5. Melakukan Seeding 16 Produk Unggulan...');

  const catalogProducts = [
    // --- FASHION WANITA & PRIA (FISIK) ---
    {
      id: 'e1000000-0000-4000-a000-000000000001',
      title: 'Rok Midi Hitam Motif Bunga Putih Elegan',
      slug: 'rok-midi-hitam-motif-bunga-putih-elegan',
      category_id: catWomen,
      brand_id: 'b2222222-2222-2222-2222-222222222222',
      type: 'physical',
      price: 249000,
      compare_price: 320000,
      stock: 45,
      sku: 'ZRA-ROK-001',
      weight: 300,
      description: 'Rok midi wanita elegan dengan corak bunga putih minimalis. Dibuat dari bahan katun halus premium, sangat nyaman digunakan untuk kegiatan formal maupun santai sehari-hari.',
      rating_avg: 4.85,
      rating_count: 54,
      imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000002',
      title: 'Gaun Kasual Wanita Corak Floral Anggun',
      slug: 'gaun-kasual-wanita-corak-floral-anggun',
      category_id: catWomen,
      brand_id: 'b2222222-2222-2222-2222-222222222222',
      type: 'physical',
      price: 380000,
      compare_price: 490000,
      stock: 30,
      sku: 'ZRA-DRS-002',
      weight: 350,
      description: 'Sundress kasual corak bunga bernuansa cerah. Dibuat dengan serat sutra kombinasi katun adem dan jatuh anggun saat dipakai di segala suasana.',
      rating_avg: 4.90,
      rating_count: 42,
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000003',
      title: 'Gaun Putih Timeless Silk Edition',
      slug: 'gaun-putih-timeless-silk-edition',
      category_id: catWomen,
      brand_id: 'b1111111-1111-1111-1111-111111111111',
      type: 'physical',
      price: 450000,
      compare_price: 590000,
      stock: 25,
      sku: 'UNQ-WHT-003',
      weight: 320,
      description: 'Gaun putih timeless dengan potongan modern minimalis. Cocok untuk pesta kebun, hangout, atau semi-formal meeting.',
      rating_avg: 4.75,
      rating_count: 67,
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000004',
      title: 'Kemeja Katun Halus Light Blue Easy-Care',
      slug: 'kemeja-katun-halus-light-blue-easy-care',
      category_id: catWomen,
      brand_id: 'b1111111-1111-1111-1111-111111111111',
      type: 'physical',
      price: 299000,
      compare_price: 399000,
      stock: 50,
      sku: 'UNQ-SHT-004',
      weight: 250,
      description: 'Kemeja wanita warna light blue berbahan 100% premium cotton dengan sentuhan easy-care yang tidak mudah kusut.',
      rating_avg: 4.88,
      rating_count: 89,
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000005',
      title: 'Kemeja Oxford Pria Slim Fit Breathable',
      slug: 'kemeja-oxford-pria-slim-fit-breathable',
      category_id: catMen,
      brand_id: 'b1111111-1111-1111-1111-111111111111',
      type: 'physical',
      price: 349000,
      compare_price: 450000,
      stock: 60,
      sku: 'UNQ-OXF-005',
      weight: 300,
      description: 'Kemeja formal dan kasual pria Oxford cloth slim fit. Memberikan siluet rapi, tegas, dan bahan berpori yang breathable seharian.',
      rating_avg: 4.92,
      rating_count: 112,
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000006',
      title: 'Kaos Polo Katun Pique Smart Casual',
      slug: 'kaos-polo-katun-pique-smart-casual',
      category_id: catMen,
      brand_id: 'b2222222-2222-2222-2222-222222222222',
      type: 'physical',
      price: 219000,
      compare_price: 289000,
      stock: 75,
      sku: 'ZRA-POLO-006',
      weight: 220,
      description: 'Polo shirt katun pique dengan kerah kokoh bertekstur. Sangat cocok untuk gaya busana smart casual saat santai maupun semi-formal.',
      rating_avg: 4.80,
      rating_count: 64,
      imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80',
    },

    // --- GADGET & ELEKTRONIK (FISIK) ---
    {
      id: 'e1000000-0000-4000-a000-000000000007',
      title: 'Apple iPhone 15 Pro Titanium 256GB Resmi',
      slug: 'apple-iphone-15-pro-titanium-256gb-resmi',
      category_id: catGadget,
      brand_id: 'b3333333-3333-3333-3333-333333333333',
      type: 'physical',
      price: 18999000,
      compare_price: 20999000,
      stock: 12,
      sku: 'APL-IP15P-256',
      weight: 500,
      description: 'Smartphone flagship tercanggih dengan rangka titanium kelas dirgantara, chip A17 Pro revolusioner, dan sistem kamera profesional 48MP.',
      rating_avg: 4.98,
      rating_count: 145,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000008',
      title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphone',
      slug: 'sony-wh-1000xm5-wireless-noise-cancelling-headphone',
      category_id: catGadget,
      brand_id: 'b5555555-5555-5555-5555-555555555555',
      type: 'physical',
      price: 4899000,
      compare_price: 5799000,
      stock: 20,
      sku: 'SNY-WHXM5-BLK',
      weight: 850,
      description: 'Headphone over-ear peredam bising terbaik di industri dengan 8 mikrofon terintegrasi, Auto NC Optimizer, dan kualitas audio Hi-Res luar biasa.',
      rating_avg: 4.93,
      rating_count: 98,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000009',
      title: 'Samsung Galaxy Watch Ultra Titanium GPS BioActive',
      slug: 'samsung-galaxy-watch-ultra-titanium-gps-bioactive',
      category_id: catGadget,
      brand_id: 'b4444444-4444-4444-4444-444444444444',
      type: 'physical',
      price: 7299000,
      compare_price: 8499000,
      stock: 18,
      sku: 'SMG-GWU-TIT',
      weight: 420,
      description: 'Smartwatch tangguh berbalut Titanium kelas militer dengan sensor bioaktif lengkap, GPS frekuensi ganda, dan daya tahan baterai hingga 100 jam.',
      rating_avg: 4.87,
      rating_count: 53,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000010',
      title: 'Sony Portable Extra Bass Bluetooth Speaker IP67',
      slug: 'sony-portable-extra-bass-bluetooth-speaker-ip67',
      category_id: catGadget,
      brand_id: 'b5555555-5555-5555-5555-555555555555',
      type: 'physical',
      price: 1799000,
      compare_price: 2199000,
      stock: 35,
      sku: 'SNY-SPK-XB23',
      weight: 950,
      description: 'Speaker nirkabel portabel tahan air dan debu standar IP67 dengan teknologi Extra Bass bertenaga. Sangat ideal untuk petualangan outdoor.',
      rating_avg: 4.79,
      rating_count: 77,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000011',
      title: 'Tas Selempang Kulit Sintetis Premium Elegan',
      slug: 'tas-selempang-kulit-sintetis-premium-elegan',
      category_id: catWomen,
      brand_id: 'b2222222-2222-2222-2222-222222222222',
      type: 'physical',
      price: 189000,
      compare_price: 269000,
      stock: 40,
      sku: 'ZRA-BAG-011',
      weight: 450,
      description: 'Tas selempang wanita berbahan kulit sintetis premium dengan aksen emas minimalis, tahan air ringan, dan kompartemen luas.',
      rating_avg: 4.82,
      rating_count: 91,
      imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'e1000000-0000-4000-a000-000000000012',
      title: 'Earphone TWS True Wireless Low Latency Stereo',
      slug: 'earphone-tws-true-wireless-low-latency-stereo',
      category_id: catGadget,
      brand_id: 'b5555555-5555-5555-5555-555555555555',
      type: 'physical',
      price: 349000,
      compare_price: 499000,
      stock: 65,
      sku: 'SNY-TWS-012',
      weight: 180,
      description: 'Earphone nirkabel cerdas dengan koneksi Bluetooth 5.3 stabil, driver audio dinamis, dan casing pengisian daya ramping.',
      rating_avg: 4.76,
      rating_count: 120,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    },

    // --- PRODUK DIGITAL (TEMPLATE & SOURCE CODE) ---
    {
      id: 'e1000000-0000-4000-a000-000000000013',
      title: 'Template Next.js 16 SaaS Full-Stack Starter Kit',
      slug: 'template-nextjs-16-saas-full-stack-starter-kit',
      category_id: catDigital,
      brand_id: 'b6666666-6666-6666-6666-666666666666',
      type: 'digital',
      price: 499000,
      compare_price: 799000,
      stock: null, // Harus null untuk digital
      sku: 'UBG-NEXT16-PRO',
      weight: null,
      description: 'Boilerplate SaaS siap produksi dengan Next.js App Router, Supabase Auth & RLS, integrasi pembayaran Midtrans, Tailwind CSS, dan Dark Mode elegan.',
      rating_avg: 4.97,
      rating_count: 156,
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      digitalFile: {
        file_name: 'nextjs-saas-starter-kit-v2.zip',
        path: 'digital-products/nextjs-saas-starter-kit-v2.zip',
        size: 15420000, // ~15.4 MB
        format: 'zip',
      },
    },
    {
      id: 'e1000000-0000-4000-a000-000000000014',
      title: 'Source Code Flutter eCommerce Multi-Vendor App',
      slug: 'source-code-flutter-ecommerce-multi-vendor-app',
      category_id: catDigital,
      brand_id: 'b6666666-6666-6666-6666-666666666666',
      type: 'digital',
      price: 899000,
      compare_price: 1299000,
      stock: null,
      sku: 'UBG-FLUTTER-ECO',
      weight: null,
      description: 'Aplikasi mobile cross-platform Android & iOS lengkap dengan keranjang belanja, checkout, real-time status pesanan, dan integrasi API RESTful modern.',
      rating_avg: 4.94,
      rating_count: 94,
      imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=600&q=80',
      digitalFile: {
        file_name: 'flutter-multivendor-ecom-source.zip',
        path: 'digital-products/flutter-multivendor-ecom-source.zip',
        size: 42100000, // ~42.1 MB
        format: 'zip',
      },
    },
    {
      id: 'e1000000-0000-4000-a000-000000000015',
      title: 'E-Book Panduan Praktis Membangun Startup Digital',
      slug: 'ebook-panduan-praktis-membangun-startup-digital',
      category_id: catDigital,
      brand_id: 'b6666666-6666-6666-6666-666666666666',
      type: 'digital',
      price: 149000,
      compare_price: 219000,
      stock: null,
      sku: 'UBG-EBK-STARTUP',
      weight: null,
      description: 'E-Book 280 halaman menyajikan strategi validasi ide bisnis, perancangan MVP, monetisasi berkelanjutan, hingga strategi scaling berbasis studi kasus nyata.',
      rating_avg: 4.86,
      rating_count: 83,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      digitalFile: {
        file_name: 'panduan-startup-digital-2026.pdf',
        path: 'digital-products/panduan-startup-digital-2026.pdf',
        size: 18400000, // ~18.4 MB
        format: 'pdf',
      },
    },
    {
      id: 'e1000000-0000-4000-a000-000000000016',
      title: 'Design System & UI Kit Figma Modern 2026',
      slug: 'design-system-ui-kit-figma-modern-2026',
      category_id: catDigital,
      brand_id: 'b6666666-6666-6666-6666-666666666666',
      type: 'digital',
      price: 349000,
      compare_price: 499000,
      stock: null,
      sku: 'UBG-FIGMA-MOD',
      weight: null,
      description: 'Kit desain Figma komprehensif berisi lebih dari 800+ komponen adaptif, token warna semantik, tipografi modern, auto-layout 5.0, dan ratusan varian UI.',
      rating_avg: 4.91,
      rating_count: 104,
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
      digitalFile: {
        file_name: 'krafita-figma-ui-kit-2026.fig',
        path: 'digital-products/krafita-figma-ui-kit-2026.fig',
        size: 26800000, // ~26.8 MB
        format: 'fig',
      },
    },
  ];

  for (const prod of catalogProducts) {
    const { digitalFile, imageUrl, ...productFields } = prod;

    // 1. Simpan produk
    const { error: prodErr } = await supabase.from('products').upsert(
      {
        ...productFields,
        shop_id: shopId,
        status: 'published',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    if (prodErr) {
      console.error(`   [FAIL] Gagal menyimpan produk "${prod.title}":`, prodErr.message);
      continue;
    }

    // 2. Simpan gambar produk
    const { data: existingImg } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', prod.id)
      .limit(1);

    if (!existingImg || existingImg.length === 0) {
      await supabase.from('product_images').insert({
        product_id: prod.id,
        path: imageUrl,
        sort_order: 1,
      });
    } else {
      await supabase
        .from('product_images')
        .update({ path: imageUrl, sort_order: 1 })
        .eq('id', existingImg[0].id);
    }

    // 3. Simpan file digital jika produk digital
    if (prod.type === 'digital' && digitalFile) {
      const { data: existingFile } = await supabase
        .from('digital_files')
        .select('id')
        .eq('product_id', prod.id)
        .limit(1);

      if (!existingFile || existingFile.length === 0) {
        await supabase.from('digital_files').insert({
          product_id: prod.id,
          file_name: digitalFile.file_name,
          path: digitalFile.path,
          size: digitalFile.size,
          format: digitalFile.format,
        });
      } else {
        await supabase
          .from('digital_files')
          .update({
            file_name: digitalFile.file_name,
            path: digitalFile.path,
            size: digitalFile.size,
            format: digitalFile.format,
          })
          .eq('id', existingFile[0].id);
      }
    }

    console.log(`   [OK] "${prod.title}" (${prod.type.toUpperCase()}) - Rp ${prod.price.toLocaleString('id-ID')}`);
  }

  console.log('\n=== SEEDING KATALOG RESMI BERHASIL SELESAI ===');
}

main().catch((err) => {
  console.error('\nFATAL ERROR SEEDING:', err);
  process.exit(1);
});
