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
}

// 12 Kategori Kurasi visual sesuai referensi screenshot Modesy
const defaultCategories: CategoryCardItem[] = [
  {
    id: 'cat-1',
    name: 'Clothing',
    slug: 'clothing',
    imageUrl: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=400&q=80',
    alt: 'Koleksi pakaian kasual',
  },
  {
    id: 'cat-2',
    name: 'Home & Living',
    slug: 'home-living',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    alt: 'Dekorasi perabotan rumah tangga',
  },
  {
    id: 'cat-3',
    name: 'Toys & Entertainment',
    slug: 'toys-entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&w=400&q=80',
    alt: 'Boneka dan mainan anak',
  },
  {
    id: 'cat-4',
    name: "Women's Clothing",
    slug: 'pakaian-wanita',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80',
    alt: 'Pakaian wanita trendi',
  },
  {
    id: 'cat-5',
    name: "Men's Clothing",
    slug: 'pakaian-pria',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80',
    alt: 'Pakaian pria formal dan kasual',
  },
  {
    id: 'cat-6',
    name: 'Furniture',
    slug: 'furniture',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    alt: 'Sofa dan furniture interior',
  },
  {
    id: 'cat-7',
    name: 'Necklaces & Accessories',
    slug: 'aksesoris-perhiasan',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
    alt: 'Kalung dan perhiasan emas',
  },
  {
    id: 'cat-8',
    name: 'Graphics',
    slug: 'template-source-code',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
    alt: 'Desain grafis dan seni digital',
  },
  {
    id: 'cat-9',
    name: 'Painting',
    slug: 'painting',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=400&q=80',
    alt: 'Lukisan kanvas dan poster dinding',
  },
  {
    id: 'cat-10',
    name: 'Boots',
    slug: 'boots',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    alt: 'Sepatu kulit dan boots',
  },
  {
    id: 'cat-11',
    name: 'Decorative Pillows',
    slug: 'decorative-pillows',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80',
    alt: 'Bantal dekorasi ruangan santai',
  },
  {
    id: 'cat-12',
    name: 'Handbags',
    slug: 'handbags',
    imageUrl: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80',
    alt: 'Tas jinjing wanita berbahan kulit',
  },
]

export async function CategoryGrid() {
  const supabase = await createClient()

  // Ambil data kategori dari Supabase
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })

  // Gabungkan jika ada data kategori dari database dengan data visual defaults
  const categories: CategoryCardItem[] = defaultCategories.map((item) => {
    const matched = dbCategories?.find(
      (c) => c.slug === item.slug || c.name.toLowerCase() === item.name.toLowerCase()
    )
    if (matched) {
      return {
        ...item,
        id: matched.id,
        slug: matched.slug,
      }
    }
    return item
  })

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      {/* Section Header: Judul Kiri & Link "View All ->" Kanan */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-border/60">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Shop By Category
        </h2>
        <Link
          href="/products"
          className="text-xs md:text-sm font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid 12 Lingkaran Kategori (2 baris x 6 kolom pada desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-6 sm:gap-y-10">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center text-center focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-full focus-visible:outline-none"
          >
            {/* Lingkaran Gambar Kategori */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden bg-muted/60 shadow-xs border-2 border-border/80 group-hover:border-primary group-hover:shadow-md transition-all duration-300">
              <Image
                src={cat.imageUrl}
                alt={cat.alt}
                fill
                sizes="(max-width: 640px) 96px, (max-width: 768px) 112px, (max-width: 1024px) 128px, 144px"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500 ease-out"
                loading="lazy"
              />
            </div>

            {/* Nama Kategori */}
            <span className="mt-3 text-xs sm:text-sm font-medium text-foreground/80 group-hover:text-primary transition-colors line-clamp-2 max-w-[140px]">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
