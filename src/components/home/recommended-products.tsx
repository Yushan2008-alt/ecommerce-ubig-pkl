'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'
import { ProductHoverActions } from '@/components/products/product-hover-actions'

export interface RecommendedProductItem {
  id: string
  title: string
  slug: string
  price: number
  originalPrice?: number
  discountPercent?: number
  sellerType: 'Star' | 'Star+' | 'Mall'
  tag?: string
  imageUrl: string
  alt: string
  isDigital?: boolean
}

// 18 Produk Rekomendasi Terkurasi dengan Valid UUID untuk Fallback Aman
const defaultRecommendedProducts: RecommendedProductItem[] = [
  {
    id: 'e1000000-0000-4000-a000-000000000001',
    title: 'Rok Midi Hitam Motif Bunga Putih Elegan',
    slug: 'rok-midi-hitam-motif-bunga-putih-elegan',
    price: 249000,
    originalPrice: 320000,
    discountPercent: 22,
    sellerType: 'Mall',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80',
    alt: 'Rok midi wanita elegan corak bunga',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000002',
    title: 'Gaun Kasual Wanita Corak Floral Anggun',
    slug: 'gaun-kasual-wanita-corak-floral-anggun',
    price: 380000,
    originalPrice: 490000,
    discountPercent: 22,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
    alt: 'Gaun santai corak bunga anggun',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000003',
    title: 'Gaun Putih Timeless Silk Edition',
    slug: 'gaun-putih-timeless-silk-edition',
    price: 450000,
    originalPrice: 590000,
    discountPercent: 24,
    sellerType: 'Star',
    tag: 'Stok Terbatas',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
    alt: 'Gaun putih timeless sutra',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000004',
    title: 'Kemeja Katun Halus Light Blue Easy-Care',
    slug: 'kemeja-katun-halus-light-blue-easy-care',
    price: 299000,
    originalPrice: 399000,
    discountPercent: 25,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    alt: 'Kemeja wanita katun biru muda',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000005',
    title: 'Kemeja Oxford Pria Slim Fit Breathable',
    slug: 'kemeja-oxford-pria-slim-fit-breathable',
    price: 349000,
    originalPrice: 450000,
    discountPercent: 22,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
    alt: 'Kemeja pria oxford slim fit',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000006',
    title: 'Kaos Polo Katun Pique Smart Casual',
    slug: 'kaos-polo-katun-pique-smart-casual',
    price: 219000,
    originalPrice: 289000,
    discountPercent: 24,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=600&q=80',
    alt: 'Kaos polo katun pique',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000007',
    title: 'Apple iPhone 15 Pro Titanium 256GB Resmi',
    slug: 'apple-iphone-15-pro-titanium-256gb-resmi',
    price: 18999000,
    originalPrice: 20999000,
    discountPercent: 10,
    sellerType: 'Mall',
    tag: 'Garansi Resmi',
    imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
    alt: 'iPhone 15 Pro Titanium',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000008',
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphone',
    slug: 'sony-wh-1000xm5-wireless-noise-cancelling-headphone',
    price: 4899000,
    originalPrice: 5799000,
    discountPercent: 16,
    sellerType: 'Mall',
    tag: 'Garansi Resmi',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    alt: 'Sony WH-1000XM5 Headphone',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000009',
    title: 'Samsung Galaxy Watch Ultra Titanium GPS BioActive',
    slug: 'samsung-galaxy-watch-ultra-titanium-gps-bioactive',
    price: 7299000,
    originalPrice: 8499000,
    discountPercent: 14,
    sellerType: 'Mall',
    tag: 'Garansi Resmi',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    alt: 'Samsung Galaxy Watch Ultra',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000010',
    title: 'Sony Portable Extra Bass Bluetooth Speaker IP67',
    slug: 'sony-portable-extra-bass-bluetooth-speaker-ip67',
    price: 1799000,
    originalPrice: 2199000,
    discountPercent: 18,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    alt: 'Sony Portable Speaker',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000011',
    title: 'Tas Selempang Kulit Sintetis Premium Elegan',
    slug: 'tas-selempang-kulit-sintetis-premium-elegan',
    price: 189000,
    originalPrice: 269000,
    discountPercent: 30,
    sellerType: 'Star',
    tag: 'Stok Terbatas',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    alt: 'Tas selempang wanita kulit sintetis',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000012',
    title: 'Earphone TWS True Wireless Low Latency Stereo',
    slug: 'earphone-tws-true-wireless-low-latency-stereo',
    price: 349000,
    originalPrice: 499000,
    discountPercent: 30,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
    alt: 'Earphone bluetooth nirkabel kotak pastel',
  },
  {
    id: 'e1000000-0000-4000-a000-000000000013',
    title: 'Template Next.js 16 SaaS Full-Stack Starter Kit',
    slug: 'template-nextjs-16-saas-full-stack-starter-kit',
    price: 499000,
    originalPrice: 799000,
    discountPercent: 38,
    sellerType: 'Mall',
    tag: 'Produk Digital',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
    alt: 'Template Next.js 16 SaaS',
    isDigital: true,
  },
  {
    id: 'e1000000-0000-4000-a000-000000000014',
    title: 'Source Code Flutter eCommerce Multi-Vendor App',
    slug: 'source-code-flutter-ecommerce-multi-vendor-app',
    price: 899000,
    originalPrice: 1299000,
    discountPercent: 31,
    sellerType: 'Mall',
    tag: 'Produk Digital',
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=600&q=80',
    alt: 'Flutter eCommerce Source Code',
    isDigital: true,
  },
  {
    id: 'e1000000-0000-4000-a000-000000000015',
    title: 'E-Book Panduan Praktis Membangun Startup Digital',
    slug: 'ebook-panduan-praktis-membangun-startup-digital',
    price: 149000,
    originalPrice: 219000,
    discountPercent: 32,
    sellerType: 'Star+',
    tag: 'Produk Digital',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    alt: 'E-Book Panduan Startup',
    isDigital: true,
  },
  {
    id: 'e1000000-0000-4000-a000-000000000016',
    title: 'Design System & UI Kit Figma Modern 2026',
    slug: 'design-system-ui-kit-figma-modern-2026',
    price: 349000,
    originalPrice: 499000,
    discountPercent: 30,
    sellerType: 'Star',
    tag: 'Produk Digital',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    alt: 'Figma UI Kit Modern',
    isDigital: true,
  },
  {
    id: '97ca8812-02c7-452f-96ee-b89a5b66639b',
    title: 'Gaun Kasual Wanita Elegan Modern',
    slug: 'women-casual-dress',
    price: 560000,
    originalPrice: 650000,
    discountPercent: 14,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80',
    alt: 'Gaun kasual wanita elegan',
  },
  {
    id: '45dca553-6ff4-479f-bdc6-4727d207ed85',
    title: 'Kemeja Wanita Warna Biru Muda Katun',
    slug: 'light-blue-women-shirt',
    price: 490000,
    originalPrice: 690000,
    discountPercent: 29,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80',
    alt: 'Kemeja wanita warna biru muda',
  },
]

export function RecommendedProducts({
  initialProducts,
  isLoggedIn = false,
}: {
  initialProducts?: RecommendedProductItem[]
  isLoggedIn?: boolean
}) {
  const { t, locale } = useLanguage()
  const products = initialProducts && initialProducts.length > 0 ? initialProducts : defaultRecommendedProducts

  return (
    <section id="rekomendasi" className="container mx-auto px-4 max-w-7xl pt-2 pb-16">
      {/* 1. Header Tab: REKOMENDASI / RECOMMENDED */}
      <div className="w-full bg-background border-b-2 border-primary mb-4 py-2.5 sm:py-3">
        <div className="flex items-center justify-center">
          <span className="text-primary font-extrabold text-sm sm:text-base tracking-wider uppercase select-none">
            {t.recommended}
          </span>
        </div>
      </div>

      {/* 2. Grid Produk: 6 Kolom Sesuai Desain E-Commerce Modern */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-2.5 md:gap-3">
        {products.map((item) => {
          const formattedPrice = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(item.price).replace(/\s+/g, '')

          return (
            <Link
              key={item.id}
              href={`/products/${item.slug}`}
              className="group bg-card border border-border/80 hover:border-primary/60 hover:shadow-md transition-all rounded-xs overflow-hidden flex flex-col focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
            >
              {/* Gambar Produk dengan Diskon di Kiri Atas & Hover Action Buttons di Kanan Atas */}
              <div className="relative aspect-square w-full bg-muted/40 overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Badge Diskon di Pojok Kiri Atas */}
                {item.discountPercent && (
                  <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-sm shadow-xs z-10">
                    -{item.discountPercent}%
                  </div>
                )}

                {/* Floating Action Buttons: Cart & Wishlist Animasi Slide-in Kanan Atas */}
                <ProductHoverActions
                  product={{
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    comparePrice: item.originalPrice,
                    imageUrl: item.imageUrl,
                    slug: item.slug,
                    vendor: item.sellerType,
                    isDigital: item.isDigital,
                  }}
                />
              </div>

              {/* Detail Konten Produk */}
              <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                {/* Judul Produk dengan Badge Star/Star+ */}
                <div className="space-y-1">
                  <h3 className="text-xs font-normal text-foreground line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                    <span className="bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-xs inline-block mr-1 align-baseline">
                      {item.sellerType}
                    </span>
                    {item.title}
                  </h3>

                  {/* Tag Garansi Harga Terbaik / Produk Digital */}
                  {item.tag && (
                    <div className="pt-0.5">
                      <span className="border border-primary/40 text-primary bg-primary/5 text-[9px] font-medium px-1.5 py-0.5 rounded-2xs inline-block">
                        {item.tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Harga Produk */}
                <div className="pt-1">
                  <span className="text-primary text-sm sm:text-base font-bold tabular-nums">
                    {formattedPrice}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* 3. Tombol Aksi Katalog / Login */}
      <div className="pt-10 pb-6 flex justify-center">
        {isLoggedIn ? (
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-12 py-3 bg-[#00a699] hover:bg-[#008f84] text-xs sm:text-sm font-semibold text-white rounded-xs shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            {locale === 'id' ? 'Lihat Semua Produk di Katalog' : 'Browse All Products in Catalog'}
          </Link>
        ) : (
          <Link
            href="/login?next=%2F#rekomendasi"
            className="inline-flex items-center justify-center px-12 py-3 bg-background border border-primary/30 hover:border-primary hover:bg-primary/5 text-xs sm:text-sm font-medium text-foreground hover:text-primary rounded-xs shadow-2xs transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          >
            {t.login_for_more}
          </Link>
        )}
      </div>
    </section>
  )
}
