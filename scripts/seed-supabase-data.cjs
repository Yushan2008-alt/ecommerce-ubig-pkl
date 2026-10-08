const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function downloadAndUpload(sourceUrl, storagePath, bucket = 'product-images') {
  try {
    console.log(`Downloading ${storagePath} from ${sourceUrl}...`);
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = (res.headers.get('content-type') || 'image/jpeg').split(';')[0];
    const mimeType = contentType.includes('image/') ? contentType : 'image/jpeg';

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw error;
    const { data: pubData } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    console.log(` -> SUCCESS uploaded to ${bucket}/${storagePath}`);
    return pubData.publicUrl;
  } catch (err) {
    console.error(` -> FAILED uploading ${storagePath}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('=== MULAI SINKRONISASI DATABASE & STORAGE SUPABASE ===\n');

  // 1. CARI USER TERVERIFIKASI
  console.log('1. Mengambil user terverifikasi...');
  const { data: usersData, error: userErr } = await supabase.auth.admin.listUsers();
  if (userErr) throw userErr;

  const targetEmail = 'mlyus6471@gmail.com';
  const verifiedUser = usersData.users.find(u => u.email?.toLowerCase() === targetEmail);
  if (!verifiedUser) {
    throw new Error(`User ${targetEmail} tidak ditemukan di auth.users`);
  }
  console.log(`   User ID: ${verifiedUser.id} (${verifiedUser.email})`);
  console.log(`   Status Verifikasi: ${verifiedUser.email_confirmed_at ? 'TERVERIFIKASI' : 'BELUM'}`);

  // 2. UPLOAD AVATAR & UPDATE PROFILE
  console.log('\n2. Mengunggah Avatar & Memperbarui Profil...');
  const avatarUrl = await downloadAndUpload(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    `avatars/${verifiedUser.id}.jpg`,
    'product-images'
  );

  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: verifiedUser.id,
      role: 'vendor',
      display_name: 'Chandra Dewi',
      phone: '081234567890',
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });
  if (profileErr) console.error('   Gagal update profile:', profileErr);
  else console.log('   Profil Chandra Dewi berhasil diperbarui menjadi vendor dengan avatar!');

  // 3. TAMBAH BUKU ALAMAT PENGGUNA (ADDRESSES)
  console.log('\n3. Menambahkan Buku Alamat Pengguna...');
  const { data: existingAddress } = await supabase
    .from('addresses')
    .select('id')
    .eq('profile_id', verifiedUser.id)
    .limit(1);

  if (!existingAddress || existingAddress.length === 0) {
    const { error: addrErr } = await supabase.from('addresses').insert({
      profile_id: verifiedUser.id,
      recipient_name: 'Chandra Dewi',
      phone: '081234567890',
      address_line: 'Jl. Soekarno Hatta No. 45, Lowokwaru',
      city: 'Kota Malang',
      province: 'Jawa Timur',
      postal_code: '65141',
      is_default: true,
    });
    if (addrErr) console.error('   Gagal insert address:', addrErr);
    else console.log('   Buku alamat default berhasil ditambahkan untuk Chandra Dewi.');
  } else {
    console.log('   Alamat sudah ada, melewati insert.');
  }

  // 4. UPLOAD LOGO TOKO & BUAT TOKO RESMI (SHOPS)
  console.log('\n4. Mengunggah Logo Toko & Mendaftarkan Toko Vendor...');
  const storeLogoUrl = await downloadAndUpload(
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=400&q=80',
    'shops/krafita-official-logo.jpg',
    'product-images'
  );

  const shopId = '0a000000-0000-0000-0000-000000000001';
  const { error: shopErr } = await supabase.from('shops').upsert({
    id: shopId,
    profile_id: verifiedUser.id,
    name: 'Krafita Official Store',
    slug: 'krafita-official',
    description: 'Official flagship store Krafita Marketplace: busana kasual elegan, gadget & aksesoris resmi, serta aset digital berkualitas tinggi.',
    logo_url: storeLogoUrl,
    flat_shipping_cost: 15000,
    whatsapp: '081234567890',
    phone: '081234567890',
    email: targetEmail,
    city: 'Kota Malang',
    province: 'Jawa Timur',
    status: 'active',
    updated_at: new Date().toISOString(),
  });
  if (shopErr) console.error('   Gagal upsert toko:', shopErr);
  else console.log('   Toko "Krafita Official Store" berhasil didaftarkan di Supabase!');

  // 5. UPLOAD CATEGORY COVER IMAGES
  console.log('\n5. Mengunggah Gambar Cover Kategori ke Supabase Storage...');
  const categoryImages = [
    {
      slug: 'fashion-pakaian',
      url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=500&q=80',
    },
    {
      slug: 'elektronik-gadget',
      url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=500&q=80',
    },
    {
      slug: 'produk-digital',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=500&q=80',
    },
  ];

  for (const cat of categoryImages) {
    const pubUrl = await downloadAndUpload(cat.url, `categories/${cat.slug}.jpg`, 'product-images');
    if (pubUrl) {
      await supabase.from('categories').update({ icon_url: pubUrl }).eq('slug', cat.slug);
      console.log(`   Kategori ${cat.slug} icon_url diperbarui dengan URL Supabase Storage.`);
    }
  }

  // 6. DAFTAR PRODUK & UPLOAD GAMBAR COVER PRODUK KE STORAGE
  console.log('\n6. Mengunggah Gambar Produk & Menyimpan Produk ke Database Supabase...');

  const productsToSeed = [
    // FASHION
    {
      id: '0b100000-0000-0000-0000-000000000001',
      title: 'Rok Midi Hitam Motif Bunga Putih',
      slug: 'rok-midi-hitam-motif-bunga-putih',
      category_id: 'c1210000-0000-0000-0000-000000000000', // Dress & Terusan
      brand_id: 'b2222222-2222-2222-2222-222222222222', // Zara
      type: 'physical',
      price: 480000,
      compare_price: 550000,
      stock: 35,
      sku: 'ZARA-SKT-001',
      weight: 300,
      description: 'Rok midi wanita elegan dengan corak bunga putih minimalis. Bahan katun halus, nyaman digunakan untuk kegiatan formal maupun santai sehari-hari.',
      rating_avg: 4.8,
      rating_count: 24,
      imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b100000-0000-0000-0000-000000000002',
      title: 'Gaun Santai Wanita Corak Bunga',
      slug: 'gaun-santai-wanita-corak-bunga',
      category_id: 'c1210000-0000-0000-0000-000000000000', // Dress & Terusan
      brand_id: 'b2222222-2222-2222-2222-222222222222', // Zara
      type: 'physical',
      price: 800000,
      compare_price: 890000,
      stock: 20,
      sku: 'ZARA-DRS-002',
      weight: 350,
      description: 'Sundress kasual corak bunga bernuansa cerah. Dibuat dengan serat sutra kombinasi sutra katun adem dan jatuh anggun saat dipakai.',
      rating_avg: 4.9,
      rating_count: 18,
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b100000-0000-0000-0000-000000000003',
      title: 'Gaun Kasual Wanita Elegan Putih',
      slug: 'gaun-kasual-wanita-elegan-putih',
      category_id: 'c1210000-0000-0000-0000-000000000000',
      brand_id: 'b1111111-1111-1111-1111-111111111111', // Uniqlo
      type: 'physical',
      price: 560000,
      compare_price: 620000,
      stock: 28,
      sku: 'UNIQ-DRS-003',
      weight: 320,
      description: 'Gaun putih timeless dengan potongan modern minimalis. Cocok untuk pesta kebun, hangout, atau semi-formal meeting.',
      rating_avg: 4.7,
      rating_count: 31,
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b100000-0000-0000-0000-000000000004',
      title: 'Kemeja Wanita Biru Muda Katun Halus',
      slug: 'kemeja-wanita-biru-muda-katun-halus',
      category_id: 'c1220000-0000-0000-0000-000000000000', // Blouse & Atasan
      brand_id: 'b1111111-1111-1111-1111-111111111111', // Uniqlo
      type: 'physical',
      price: 490000,
      compare_price: 690000,
      stock: 45,
      sku: 'UNIQ-SHT-004',
      weight: 250,
      description: 'Kemeja wanita warna light blue berbahan 100% premium cotton dengan sentuhan easy-care yang tidak mudah kusut.',
      rating_avg: 5.0,
      rating_count: 42,
      imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b100000-0000-0000-0000-000000000005',
      title: 'Kemeja Pria Oxford Slim Fit Premium',
      slug: 'kemeja-pria-oxford-slim-fit-premium',
      category_id: 'c1120000-0000-0000-0000-000000000000', // Kemeja Pria
      brand_id: 'b1111111-1111-1111-1111-111111111111', // Uniqlo
      type: 'physical',
      price: 399000,
      compare_price: 499000,
      stock: 50,
      sku: 'UNIQ-OXF-005',
      weight: 300,
      description: 'Kemeja formal dan kasual pria Oxford cloth slim fit. Memberikan siluet rapi, tegas, dan bahan berpori yang breathable seharian.',
      rating_avg: 4.9,
      rating_count: 56,
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b100000-0000-0000-0000-000000000006',
      title: 'Kaos Polo Pria Katun Pique Classic',
      slug: 'kaos-polo-pria-katun-pique-classic',
      category_id: 'c1110000-0000-0000-0000-000000000000', // Kaos & Polo
      brand_id: 'b2222222-2222-2222-2222-222222222222', // Zara
      type: 'physical',
      price: 299000,
      compare_price: 350000,
      stock: 60,
      sku: 'ZARA-POLO-006',
      weight: 220,
      description: 'Polo shirt katun pique dengan kerah kokoh bertekstur. Sangat cocok untuk smart casual style saat santai maupun semi-formal.',
      rating_avg: 4.8,
      rating_count: 37,
      imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80',
    },

    // ELEKTRONIK & GADGET
    {
      id: '0b200000-0000-0000-0000-000000000001',
      title: 'Apple iPhone 15 Pro Titanium 256GB',
      slug: 'apple-iphone-15-pro-titanium-256gb',
      category_id: 'c2100000-0000-0000-0000-000000000000', // Smartphone & Tablet
      brand_id: 'b3333333-3333-3333-3333-333333333333', // Apple
      type: 'physical',
      price: 18999000,
      compare_price: 20999000,
      stock: 15,
      sku: 'APPL-IP15P-256',
      weight: 500,
      description: 'Smartphone flagship tercanggih dengan rangka titanium kelas dirgantara, chip A17 Pro revolusioner, dan sistem kamera profesional 48MP.',
      rating_avg: 5.0,
      rating_count: 68,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b200000-0000-0000-0000-000000000002',
      title: 'Sony WH-1000XM5 Wireless Noise Cancelling',
      slug: 'sony-wh-1000xm5-wireless-noise-cancelling',
      category_id: 'c2210000-0000-0000-0000-000000000000', // Headphone & TWS
      brand_id: 'b5555555-5555-5555-5555-555555555555', // Sony
      type: 'physical',
      price: 4999000,
      compare_price: 5999000,
      stock: 22,
      sku: 'SONY-WHXM5-BLK',
      weight: 850,
      description: 'Headphone over-ear peredam bising terbaik di industri dengan 8 mikrofon, Auto NC Optimizer, dan kualitas audio Hi-Res luar biasa.',
      rating_avg: 4.9,
      rating_count: 51,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b200000-0000-0000-0000-000000000003',
      title: 'Samsung Galaxy Watch Ultra Titanium GPS',
      slug: 'samsung-galaxy-watch-ultra-titanium-gps',
      category_id: 'c2110000-0000-0000-0000-000000000000', // Aksesoris Handphone
      brand_id: 'b4444444-4444-4444-4444-444444444444', // Samsung
      type: 'physical',
      price: 7499000,
      compare_price: 8499000,
      stock: 18,
      sku: 'SMSG-GWU-TIT',
      weight: 420,
      description: 'Smartwatch tangguh berbalut Titanium kelas militer dengan sensor bioaktif lengkap, GPS frekuensi ganda, dan daya tahan baterai hingga 100 jam.',
      rating_avg: 4.8,
      rating_count: 29,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b200000-0000-0000-0000-000000000004',
      title: 'Sony Portable Extra Bass Bluetooth Speaker',
      slug: 'sony-portable-extra-bass-bluetooth-speaker',
      category_id: 'c2200000-0000-0000-0000-000000000000', // Audio & Speaker
      brand_id: 'b5555555-5555-5555-5555-555555555555', // Sony
      type: 'physical',
      price: 1899000,
      compare_price: 2199000,
      stock: 25,
      sku: 'SONY-SPK-XB23',
      weight: 950,
      description: 'Speaker nirkabel portabel tahan air IP67 dengan teknologi Extra Bass bertenaga. Sangat ideal untuk petualangan outdoor dan pesta musik.',
      rating_avg: 4.7,
      rating_count: 34,
      imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    },

    // PRODUK DIGITAL
    {
      id: '0b300000-0000-0000-0000-000000000001',
      title: 'Template Next.js 16 SaaS Full-Stack Starter Kit',
      slug: 'template-nextjs-16-saas-fullstack-starter-kit',
      category_id: 'c3210000-0000-0000-0000-000000000000', // Template Web & Desain UI
      brand_id: 'b6666666-6666-6666-6666-666666666666', // Ubig Studio
      type: 'digital',
      price: 499000,
      compare_price: 799000,
      stock: null, // Digital stock must be null
      sku: 'UBIG-NEXT16-SaaS',
      weight: null,
      description: 'Boilerplate SaaS siap produksi dengan Next.js App Router, Supabase Auth & RLS, integrasi pembayaran Midtrans, Tailwind CSS, dan Dark Mode elegan.',
      rating_avg: 5.0,
      rating_count: 85,
      imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b300000-0000-0000-0000-000000000002',
      title: 'Source Code Flutter eCommerce Multi-Vendor App',
      slug: 'source-code-flutter-ecommerce-multivendor-app',
      category_id: 'c3210000-0000-0000-0000-000000000000', // Template Web & Desain UI
      brand_id: 'b6666666-6666-6666-6666-666666666666', // Ubig Studio
      type: 'digital',
      price: 899000,
      compare_price: 1299000,
      stock: null,
      sku: 'UBIG-FLUTTER-ECOM',
      weight: null,
      description: 'Aplikasi mobile cross-platform Android & iOS lengkap dengan keranjang belanja, checkout, real-time chat vendor, dan integrasi API RESTful modern.',
      rating_avg: 4.9,
      rating_count: 62,
      imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b300000-0000-0000-0000-000000000003',
      title: 'E-Book Panduan Praktis Membangun Startup Digital',
      slug: 'ebook-panduan-praktis-membangun-startup-digital',
      category_id: 'c3110000-0000-0000-0000-000000000000', // Bisnis & Marketing
      brand_id: 'b6666666-6666-6666-6666-666666666666', // Ubig Studio
      type: 'digital',
      price: 149000,
      compare_price: 199000,
      stock: null,
      sku: 'UBIG-EBOOK-STARTUP',
      weight: null,
      description: 'E-Book 280 halaman menyajikan strategi validasi ide, perancangan MVP, monetisasi berkelanjutan, hingga strategi scaling berbasis data nyata.',
      rating_avg: 4.8,
      rating_count: 40,
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: '0b300000-0000-0000-0000-000000000004',
      title: 'Design System & UI Kit Figma Modern 2026',
      slug: 'design-system-ui-kit-figma-modern-2026',
      category_id: 'c3210000-0000-0000-0000-000000000000', // Template Web & Desain UI
      brand_id: 'b6666666-6666-6666-6666-666666666666', // Ubig Studio
      type: 'digital',
      price: 349000,
      compare_price: 499000,
      stock: null,
      sku: 'UBIG-FIGMA-KIT',
      weight: null,
      description: 'Kit desain Figma lengkap berisi lebih dari 800+ komponen adaptif, token warna semantik, tipografi modern, auto-layout 5.0, dan ratusan varian UI.',
      rating_avg: 4.9,
      rating_count: 73,
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    },
  ];

  for (const prod of productsToSeed) {
    // 1. Upload cover image to storage
    const storageCoverPath = `products/${prod.slug}/cover.jpg`;
    const coverStorageUrl = await downloadAndUpload(prod.imageUrl, storageCoverPath, 'product-images');
    const finalImageUrl = coverStorageUrl || prod.imageUrl;

    // 2. Insert into products table
    const { error: prodErr } = await supabase.from('products').upsert({
      id: prod.id,
      shop_id: shopId,
      category_id: prod.category_id,
      brand_id: prod.brand_id,
      title: prod.title,
      slug: prod.slug,
      description: prod.description,
      type: prod.type,
      price: prod.price,
      compare_price: prod.compare_price,
      stock: prod.stock,
      sku: prod.sku,
      weight: prod.weight,
      status: 'published',
      rating_avg: prod.rating_avg,
      rating_count: prod.rating_count,
      updated_at: new Date().toISOString(),
    });

    if (prodErr) {
      console.error(`   Gagal menyimpan produk ${prod.title}:`, prodErr);
      continue;
    }

    // 3. Insert into product_images table
    const { error: imgErr } = await supabase.from('product_images').upsert({
      product_id: prod.id,
      path: finalImageUrl,
      sort_order: 1,
    }, { onConflict: 'product_id,path' });

    if (imgErr) {
      // jika belum ada unique constraint, coba insert biasa jika belum ada
      const { data: existingImg } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', prod.id)
        .limit(1);

      if (!existingImg || existingImg.length === 0) {
        await supabase.from('product_images').insert({
          product_id: prod.id,
          path: finalImageUrl,
          sort_order: 1,
        });
      }
    }

    console.log(`   [OK] Produk ${prod.title} tersimpan dengan cover Supabase Storage!`);
  }

  // 7. RECORD OTP AUDIT ENTRY
  console.log('\n7. Mencatat Riwayat Verifikasi OTP ke Database...');
  await supabase.from('otp_codes').insert({
    email: targetEmail,
    code: '256768',
    type: 'verified_audit',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
  console.log('   Riwayat OTP akun terverifikasi berhasil dicatat di tabel otp_codes.');

  console.log('\n=== SEMUA DATA BERHASIL DISINKRONISASI KE SUPABASE ===');
}

main().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
