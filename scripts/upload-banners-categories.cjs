const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function downloadAndUpload(sourceUrl, storagePath, bucket = 'product-images') {
  try {
    console.log(`Downloading ${storagePath}...`);
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
    console.log(` -> SUCCESS ${storagePath} -> ${pubData.publicUrl}`);
    return pubData.publicUrl;
  } catch (err) {
    console.error(` -> FAILED ${storagePath}:`, err.message);
    return null;
  }
}

async function run() {
  console.log('=== UPLOAD BANNERS & CATEGORY CIRCLES KE SUPABASE STORAGE ===\n');

  // 1. HERO SLIDESHOW BANNERS
  const banners = [
    {
      path: 'banners/hero-slide-1.jpg',
      url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1920&q=85',
    },
    {
      path: 'banners/hero-slide-2.jpg',
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=85',
    },
    {
      path: 'banners/hero-slide-3.jpg',
      url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1920&q=85',
    },
  ];

  console.log('1. Mengunggah 3 Hero Banner Slideshow...');
  const bannerUrls = {};
  for (const b of banners) {
    const pub = await downloadAndUpload(b.url, b.path);
    bannerUrls[b.path] = pub;
  }

  // 2. 12 KATEGORI LINGKARAN
  const catCircles = [
    { path: 'categories/circle-clothing.jpg', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-home-living.jpg', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-toys.jpg', url: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-womens-clothing.jpg', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-mens-clothing.jpg', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-furniture.jpg', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-jewelry.jpg', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-graphics.jpg', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-video-audio.jpg', url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-shoes.jpg', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-templates.jpg', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80' },
    { path: 'categories/circle-handbags.jpg', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80' },
  ];

  console.log('\n2. Mengunggah 12 Gambar Lingkaran Kategori...');
  const catUrls = {};
  for (const c of catCircles) {
    const pub = await downloadAndUpload(c.url, c.path);
    catUrls[c.path] = pub;
  }

  console.log('\n=== SELESAI MENGUNGGAH BANNERS & KATEGORI ===');
}

run().catch(console.error);
