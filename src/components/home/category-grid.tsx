import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'

interface CategoryCardItem {
  id: string
  name: string
  slug: string
  imageUrl: string
  alt: string
  subPreview?: string
}

// 12 Kategori Kurasi visual sesuai referensi screenshot Krafita
const defaultCategories: CategoryCardItem[] = [
  {
    id: 'cat-1',
    name: 'Clothing',
    slug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
    alt: 'Koleksi pakaian kasual',
    subPreview: "Women's & Men's",
  },
  {
    id: 'cat-2',
    name: 'Home & Living',
    slug: 'home-living',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    alt: 'Dekorasi perabotan rumah tangga',
    subPreview: 'Furniture & Decor',
  },
  {
    id: 'cat-3',
    name: 'Toys & Entertainment',
    slug: 'toys-entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=400&q=80',
    alt: 'Boneka dan mainan anak',
    subPreview: 'Games & Figures',
  },
  {
    id: 'cat-4',
    name: "Women's Clothing",
    slug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80',
    alt: 'Pakaian wanita trendi',
    subPreview: 'Dresses & Tops',
  },
  {
    id: 'cat-5',
    name: "Men's Clothing",
    slug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    alt: 'Pakaian pria formal dan kasual',
    subPreview: 'Jackets & Shirts',
  },
  {
    id: 'cat-6',
    name: 'Furniture',
    slug: 'home-living',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    alt: 'Sofa dan furniture interior',
    subPreview: 'Sofa & Tables',
  },
  {
    id: 'cat-7',
    name: 'Jewelry & Accessories',
    slug: 'jewelry-accessories',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
    alt: 'Kalung dan perhiasan emas',
    subPreview: 'Gold & Bags',
  },
  {
    id: 'cat-8',
    name: 'Graphics & Photos',
    slug: 'graphics',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    alt: 'Desain grafis dan seni digital',
    subPreview: 'Vectors & Photos',
  },
  {
    id: 'cat-9',
    name: 'Video & Audio',
    slug: 'video-audio',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80',
    alt: 'Footage video dan efek suara',
    subPreview: 'Stock 4K & SFX',
  },
  {
    id: 'cat-10',
    name: 'Shoes',
    slug: 'shoes',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    alt: 'Sepatu kulit dan boots',
    subPreview: 'Sneakers & Boots',
  },
  {
    id: 'cat-11',
    name: 'Web Templates & Code',
    slug: 'template-source-code',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
    alt: 'Template website dan aplikasi web',
    subPreview: 'Next.js & Apps',
  },
  {
    id: 'cat-12',
    name: 'Handbags & Purses',
    slug: 'jewelry-accessories',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    alt: 'Tas jinjing wanita berbahan kulit',
    subPreview: 'Leather Bags',
  },
]

export async function CategoryGrid() {
  const supabase = await createClient()

  // Ambil data kategori dari Supabase jika ada
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })

  const categories: CategoryCardItem[] = defaultCategories.map((item) => {
    const matched = dbCategories?.find(
      (c) => c.slug === item.slug || c.name.toLowerCase() === item.name.toLowerCase()
    )
    if (matched) {
      return {
        ...item,
        id: matched.id,
      }
    }
    return item
  })

  return (
    <section className="container mx-auto px-4 max-w-7xl py-8 md:py-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 pb-2.5 border-b border-border/60">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Shop By Category
        </h2>
        <Link
          href="/products"
          className="text-xs md:text-sm font-semibold text-muted-foreground hover:text-[#00a699] transition-colors flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid Lingkaran Kategori: Diperbesar dan gap dirapatkan sesuai permintaan user */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-2 sm:gap-x-3 md:gap-x-4 gap-y-6 sm:gap-y-8">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center text-center focus-visible:ring-2 focus-visible:ring-[#00a699] focus-visible:rounded-2xl focus-visible:outline-none p-1.5 rounded-2xl hover:bg-muted/30 transition-all duration-200"
          >
            {/* Lingkaran Gambar Kategori Diperbesar */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-42 lg:h-42 xl:w-44 xl:h-44 rounded-full overflow-hidden bg-muted/60 shadow-xs border-2 border-border/80 group-hover:border-[#00a699] group-hover:shadow-md transition-all duration-300">
              <Image
                src={cat.imageUrl}
                alt={cat.alt}
                fill
                sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, (max-width: 1024px) 144px, 176px"
                className="object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
                loading="lazy"
              />

              {/* Overlay hover effect halus dengan hint subkategori */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2">
                <span className="text-[11px] font-semibold text-white bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Lihat Produk →
                </span>
              </div>
            </div>

            {/* Nama Kategori */}
            <span className="mt-3 text-xs sm:text-sm font-semibold text-foreground/85 group-hover:text-[#00a699] transition-colors line-clamp-2 max-w-[150px] leading-tight">
              {cat.name}
            </span>

            {/* Sub-label preview subtle */}
            {cat.subPreview && (
              <span className="mt-0.5 text-[11px] text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                {cat.subPreview}
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
