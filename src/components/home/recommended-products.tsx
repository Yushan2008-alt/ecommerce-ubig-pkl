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
}

// 18 Produk Rekomendasi Terkurasi Sesuai Referensi Gambar Shopee / Marketplace
const defaultRecommendedProducts: RecommendedProductItem[] = [
  {
    id: 'prod-1',
    title: 'SOKLIN LIQUID 1 DUS / SOKLIN CAIR 20ML 1 DUS RENCENG ISI 120 SACHET',
    slug: 'soklin-liquid-1-dus',
    price: 24999,
    discountPercent: 15,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=400&q=80',
    alt: 'Soklin liquid detergen cair 1 dus',
  },
  {
    id: 'prod-2',
    title: 'iPhone X-XS / XR / Xsmax / 11 12 Pro 13 Pro Max Case Hybrid Shockproof',
    slug: 'iphone-case-hybrid-shockproof',
    price: 14900,
    discountPercent: 20,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
    alt: 'Casing iPhone hybrid pelindung benturan',
  },
  {
    id: 'prod-3',
    title: 'Tas Selempang Wanita Inara Bags Kulit Sintetis Premium Elegan',
    slug: 'tas-selempang-wanita-inara-bags',
    price: 7500,
    discountPercent: 63,
    sellerType: 'Star',
    tag: 'Stok Terbatas',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80',
    alt: 'Tas selempang wanita kulit sintetis krem',
  },
  {
    id: 'prod-4',
    title: 'DUNIAMU STORE || PAKET GROSIR Scora Sheer Glow Skin Up Cream 30g',
    slug: 'scora-sheer-glow-up-cream',
    price: 4000000,
    discountPercent: 10,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    alt: 'Paket grosir perawatan kulit wajah',
  },
  {
    id: 'prod-5',
    title: 'Sandal Jepit Pria Classic Trendy Desain Karet Lentur dan Santai',
    slug: 'sandal-jepit-pria-classic-trendy',
    price: 8022,
    discountPercent: 33,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=400&q=80',
    alt: 'Sandal jepit santai pria warna hitam',
  },
  {
    id: 'prod-6',
    title: 'COD SETELAN BAJU BOLA ANAK USIA 6BLN-12THN Full Printing Breathable',
    slug: 'setelan-baju-bola-anak',
    price: 21120,
    discountPercent: 12,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=400&q=80',
    alt: 'Setelan baju olahraga bola anak',
  },
  {
    id: 'prod-7',
    title: 'Indomie Mie Instan [72g / 5pcs] ( Free Ongkir Extra Kebutuhan Dapur )',
    slug: 'indomie-mie-instan-5pcs',
    price: 19300,
    discountPercent: 10,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80',
    alt: 'Indomie goreng paket hemat 5 bungkus',
  },
  {
    id: 'prod-8',
    title: 'Extro Sarung Tangan Billiard Wanita MARETA Bahan Lycra Berkualitas',
    slug: 'extro-sarung-tangan-billiard',
    price: 23900,
    discountPercent: 23,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=400&q=80',
    alt: 'Sarung tangan biliar bahan lycra wanita',
  },
  {
    id: 'prod-9',
    title: 'CELANA HOMMY PART 3 KULOT ADEM PIYAMA MOTIF ETNIK WANITA',
    slug: 'celana-hommy-kulot-piyama',
    price: 24020,
    discountPercent: 66,
    sellerType: 'Star',
    tag: 'Stok Terbatas',
    imageUrl: 'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=400&q=80',
    alt: 'Celana kulot motif wanita bahan adem',
  },
  {
    id: 'prod-10',
    title: '( F ) ( ECER ) MASCARA MAYBELINE HYPERCURL WATERPROOF LONG LASTING',
    slug: 'mascara-hypercurl-waterproof',
    price: 12879,
    discountPercent: 14,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
    alt: 'Mascara bulu mata tahan air',
  },
  {
    id: 'prod-11',
    title: '【 Barang Tersedia 】 Peluit Presto Tutup Panci Stainless Steel Universal',
    slug: 'peluit-presto-tutup-panci',
    price: 8899,
    discountPercent: 11,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=400&q=80',
    alt: 'Tutup panci presto serbaguna',
  },
  {
    id: 'prod-12',
    title: 'Headset Bluetooth Cerdas / Earphone TWS Wireless Low Latency',
    slug: 'headset-bluetooth-cerdas-tws',
    price: 21900,
    discountPercent: 18,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
    alt: 'Earphone bluetooth nirkabel kotak pastel',
  },
  {
    id: 'prod-13',
    title: 'Sarung Jempol Gaming AP King V4 | Accessories Finger Sleeve Anti Keringat',
    slug: 'sarung-jempol-gaming-ap-king-v4',
    price: 20999,
    discountPercent: 32,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
    alt: 'Sarung jempol gaming responsif',
  },
  {
    id: 'prod-14',
    title: 'AL SENTER MINI 3 LED SWAT 5 MODE Senter Cas USB Tahan Air Portable',
    slug: 'al-senter-mini-3-led-swat',
    price: 17895,
    discountPercent: 1,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400&q=80',
    alt: 'Senter saku mini tactical led',
  },
  {
    id: 'prod-15',
    title: 'Hijab Paris Jadul Varisha Segiempat Polos Katun Lembut Nyaman',
    slug: 'hijab-paris-jadul-varisha',
    price: 15392,
    discountPercent: 14,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80',
    alt: 'Jilbab paris polos aneka warna',
  },
  {
    id: 'prod-16',
    title: 'Topi Pria Wanita Murah Kualitas Premium Baseball Cap Sport Casual',
    slug: 'topi-pria-wanita-premium-baseball',
    price: 15348,
    discountPercent: 57,
    sellerType: 'Star+',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80',
    alt: 'Topi baseball warna merah sporty',
  },
  {
    id: 'prod-17',
    title: 'BAUT TITAN M6x15 DRAT 10 PANJANG 1.5CM BIG HEAD MOTOR Universal',
    slug: 'baut-titan-m6x15-drat-10',
    price: 9999,
    discountPercent: 13,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=400&q=80',
    alt: 'Baut titanium motor warna ungu',
  },
  {
    id: 'prod-18',
    title: 'Botol Sport 500ml / Tumbler Botol Minum Alumunium Portabel Sepeda',
    slug: 'botol-sport-500ml-tumbler',
    price: 25000,
    discountPercent: 4,
    sellerType: 'Star',
    tag: 'Garansi Harga Terbaik',
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80',
    alt: 'Botol minum olahraga bahan stainless',
  },
]

export function RecommendedProducts() {
  const { t } = useLanguage()
  const products = defaultRecommendedProducts

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

      {/* 2. Grid Produk: 6 Kolom Sesuai Referensi Gambar */}
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

                {/* Badge Diskon di Pojok Kiri Atas Sesuai Gambar Referensi (-12%) */}
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

                  {/* Tag Garansi Harga Terbaik / Stok Terbatas */}
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

      {/* 3. Tombol Login Untuk Lihat Lainnya (Bilingual) */}
      <div className="pt-10 pb-6 flex justify-center">
        <Link
          href="/login?next=%2F#rekomendasi"
          className="inline-flex items-center justify-center px-12 py-3 bg-background border border-primary/30 hover:border-primary hover:bg-primary/5 text-xs sm:text-sm font-medium text-foreground hover:text-primary rounded-xs shadow-2xs transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        >
          {t.login_for_more}
        </Link>
      </div>
    </section>
  )
}
