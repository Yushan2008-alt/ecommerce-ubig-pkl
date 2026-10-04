'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/context/language-context'

interface CategoryCardItem {
  id: string
  name_id: string
  name_en: string
  slug: string
  imageUrl: string
  alt_id: string
  alt_en: string
  sub_id?: string
  sub_en?: string
}

// 12 Kategori Kurasi visual bilingual
const defaultCategories: CategoryCardItem[] = [
  {
    id: 'cat-1',
    name_id: 'Pakaian',
    name_en: 'Clothing',
    slug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Koleksi pakaian kasual',
    alt_en: 'Casual clothing collection',
    sub_id: 'Wanita & Pria',
    sub_en: "Women's & Men's",
  },
  {
    id: 'cat-2',
    name_id: 'Rumah & Dekorasi',
    name_en: 'Home & Living',
    slug: 'home-living',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Dekorasi perabotan rumah tangga',
    alt_en: 'Home interior and living decor',
    sub_id: 'Furnitur & Dekorasi',
    sub_en: 'Furniture & Decor',
  },
  {
    id: 'cat-3',
    name_id: 'Mainan & Hiburan',
    name_en: 'Toys & Entertainment',
    slug: 'toys-entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Boneka dan mainan anak',
    alt_en: 'Toys and children entertainment',
    sub_id: 'Game & Model',
    sub_en: 'Games & Figures',
  },
  {
    id: 'cat-4',
    name_id: 'Pakaian Wanita',
    name_en: "Women's Clothing",
    slug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Pakaian wanita trendi',
    alt_en: 'Trendy women apparel',
    sub_id: 'Gaun & Atasan',
    sub_en: 'Dresses & Tops',
  },
  {
    id: 'cat-5',
    name_id: 'Pakaian Pria',
    name_en: "Men's Clothing",
    slug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Pakaian pria formal dan kasual',
    alt_en: 'Men formal and casual clothing',
    sub_id: 'Jaket & Kemeja',
    sub_en: 'Jackets & Shirts',
  },
  {
    id: 'cat-6',
    name_id: 'Furnitur',
    name_en: 'Furniture',
    slug: 'home-living',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Sofa dan furniture interior',
    alt_en: 'Living room sofas and chairs',
    sub_id: 'Sofa & Meja',
    sub_en: 'Sofa & Tables',
  },
  {
    id: 'cat-7',
    name_id: 'Aksesoris & Perhiasan',
    name_en: 'Jewelry & Accessories',
    slug: 'jewelry-accessories',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Kalung dan perhiasan emas',
    alt_en: 'Necklaces and golden jewelry',
    sub_id: 'Emas & Tas',
    sub_en: 'Gold & Bags',
  },
  {
    id: 'cat-8',
    name_id: 'Grafis & Foto',
    name_en: 'Graphics & Photos',
    slug: 'graphics',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Desain grafis dan seni digital',
    alt_en: 'Graphic design and digital assets',
    sub_id: 'Vektor & Foto',
    sub_en: 'Vectors & Photos',
  },
  {
    id: 'cat-9',
    name_id: 'Video & Audio',
    name_en: 'Video & Audio',
    slug: 'video-audio',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Footage video dan efek suara',
    alt_en: 'Stock footage and audio effects',
    sub_id: 'Stok 4K & SFX',
    sub_en: 'Stock 4K & SFX',
  },
  {
    id: 'cat-10',
    name_id: 'Sepatu',
    name_en: 'Shoes',
    slug: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Sepatu kulit dan boots',
    alt_en: 'Leather boots and running shoes',
    sub_id: 'Sneakers & Boots',
    sub_en: 'Sneakers & Boots',
  },
  {
    id: 'cat-11',
    name_id: 'Template Web & Kode',
    name_en: 'Web Templates & Code',
    slug: 'template-source-code',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Template website dan aplikasi web',
    alt_en: 'Website templates and software code',
    sub_id: 'Next.js & Aplikasi',
    sub_en: 'Next.js & Apps',
  },
  {
    id: 'cat-12',
    name_id: 'Tas & Dompet',
    name_en: 'Handbags & Purses',
    slug: 'jewelry-accessories',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    alt_id: 'Tas jinjing wanita berbahan kulit',
    alt_en: 'Women leather handbag',
    sub_id: 'Tas Kulit Mewah',
    sub_en: 'Leather Bags',
  },
]

export function CategoryGrid() {
  const { t, locale } = useLanguage()

  return (
    <section className="container mx-auto px-4 max-w-7xl py-8 md:py-12">
      {/* Section Header: Bilingual */}
      <div className="flex items-center justify-between mb-6 pb-2.5 border-b border-border/60">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {t.shop_by_category}
        </h2>
        <Link
          href="/products"
          className="text-xs md:text-sm font-semibold text-muted-foreground hover:text-[#00a699] transition-colors flex items-center gap-1 group"
        >
          <span>{t.view_all}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid Lingkaran Kategori Diperbesar & Gap Dirapatkan */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-6 sm:gap-y-8">
        {defaultCategories.map((cat) => {
          const name = locale === 'id' ? cat.name_id : cat.name_en
          const alt = locale === 'id' ? cat.alt_id : cat.alt_en
          const sub = locale === 'id' ? cat.sub_id : cat.sub_en
          const previewText = locale === 'id' ? 'Lihat Produk →' : 'View Products →'

          return (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col items-center text-center focus-visible:ring-2 focus-visible:ring-[#00a699] focus-visible:rounded-2xl focus-visible:outline-none p-1.5 rounded-2xl hover:bg-muted/30 transition-all duration-200"
            >
              {/* Lingkaran Gambar Kategori Diperbesar */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-42 lg:h-42 xl:w-44 xl:h-44 rounded-full overflow-hidden bg-muted/60 shadow-xs border-2 border-border/80 group-hover:border-[#00a699] group-hover:shadow-md transition-all duration-300">
                <Image
                  src={cat.imageUrl}
                  alt={alt}
                  fill
                  sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, (max-width: 1024px) 144px, 176px"
                  className="object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                  loading="lazy"
                />

                {/* Overlay hover effect halus dengan hint */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                  <span className="text-[11px] font-semibold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    {previewText}
                  </span>
                </div>
              </div>

              {/* Nama Kategori */}
              <span className="mt-3 text-xs sm:text-sm font-semibold text-foreground/85 group-hover:text-[#00a699] transition-colors line-clamp-2 max-w-[150px] leading-tight">
                {name}
              </span>

              {/* Sub-label preview subtle */}
              {sub && (
                <span className="mt-0.5 text-[11px] text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                  {sub}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
