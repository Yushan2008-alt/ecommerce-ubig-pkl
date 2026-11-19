'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star,
  Heart,
  ShoppingCart,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Layers,
  Edit3,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Store,
  MessageSquare,
} from 'lucide-react'
import { ProductReviews } from './product-reviews'
import { ProductComments } from './product-comments'
import { ReportModal } from './report-modal'
import { useCartWishlist } from '@/context/cart-wishlist-context'
import { useAuthModal } from '@/context/auth-modal-context'
import { toast } from 'sonner'

interface ProductDetailViewProps {
  product: any
  reviews: any[]
  comments: any[]
  ratingAvg: number
  ratingCount: number
  ordersCount?: number
  eligibleOrderItemId?: string | null
  currentUserId?: string | null
  isOwner?: boolean
  isInWishlist?: boolean
}

const SIZE_OPTIONS = ['SM', 'MD', 'LG', 'XL', 'XXL']

export function ProductDetailView({
  product,
  reviews,
  comments,
  ratingAvg,
  ratingCount,
  ordersCount = 0,
  eligibleOrderItemId,
  currentUserId,
  isOwner = false,
  isInWishlist = false,
}: ProductDetailViewProps) {
  const router = useRouter()
  const { openLoginModal } = useAuthModal()
  const { addToCart, toggleWishlist } = useCartWishlist()

  // Gambar produk
  const rawImages = (product.product_images || []).map((img: any) => img.path || img)
  const images: string[] = rawImages.length > 0 ? rawImages : ['/placeholder-product.jpg']
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState('MD')
  const [qty, setQty] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isFavorited, setIsFavorited] = useState(isInWishlist)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [bottomTab, setBottomTab] = useState<'reviews' | 'comments' | 'shipping'>('reviews')

  const coverImage = images[selectedImageIndex] || images[0] || '/placeholder-product.jpg'
  const isPhysical = product.type === 'physical'
  const shop = product.shops || {}
  const category = product.categories || {}

  // Format tanggal publikasi
  const publishedDateStr = product.created_at
    ? new Date(product.created_at).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '20 Oct, 2024'

  // SKU generator/fallback
  const skuStr = product.sku || `KRF-${product.id ? product.id.slice(0, 8).toUpperCase() : 'WH1000XM4'}`

  // Format rupiah
  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  // Carousel handlers
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  // Add to cart handler (terhubung langsung ke CartWishlistContext untuk update realtime instan tanpa refresh)
  const handleAddToCart = async () => {
    if (isOwner) {
      toast.info('Sebagai vendor pemilik toko, Anda tidak dapat memasukkan produk sendiri ke keranjang.')
      return
    }

    if (!currentUserId) {
      toast.info('Silakan masuk terlebih dahulu untuk menambahkan produk ke keranjang', {
        action: {
          label: 'Masuk',
          onClick: () => openLoginModal(`/products/${product.slug}`),
        },
      })
      openLoginModal(`/products/${product.slug}`)
      return
    }

    setAddingToCart(true)
    try {
      const ok = await addToCart(
        {
          id: product.id,
          title: product.title,
          price: product.price,
          comparePrice: product.compare_price,
          imageUrl: coverImage,
          slug: product.slug,
          vendor: shop.name,
          isDigital: !isPhysical,
          stock: product.stock,
          shopId: shop.id,
          shopName: shop.name,
          shopSlug: shop.slug,
          shopCity: shop.city,
          flatShippingCost: shop.flat_shipping_cost,
        },
        isPhysical ? qty : 1
      )
      if (ok) {
        toast.success(`"${product.title}" berhasil dimasukkan ke keranjang belanja!`)
      }
    } catch {
      toast.error('Gagal menambahkan ke keranjang')
    } finally {
      setAddingToCart(false)
    }
  }

  // Buy now handler (direct checkout)
  const handleBuyNow = () => {
    if (isOwner) {
      toast.info('Sebagai vendor pemilik toko, Anda tidak dapat membeli produk Anda sendiri.')
      return
    }

    if (!currentUserId) {
      toast.info('Silakan masuk terlebih dahulu untuk melanjutkan pembelian', {
        action: {
          label: 'Masuk',
          onClick: () => openLoginModal(`/products/${product.slug}`),
        },
      })
      openLoginModal(`/products/${product.slug}`)
      return
    }

    const params = new URLSearchParams({
      buyNow: 'true',
      productId: product.id,
      title: product.title,
      price: product.price.toString(),
      type: product.type,
      qty: isPhysical ? qty.toString() : '1',
      shopId: shop.id || '',
      shopName: shop.name || '',
      imageUrl: coverImage,
    })

    router.push(`/checkout?${params.toString()}`)
  }

  // Toggle wishlist handler (terhubung langsung ke CartWishlistContext untuk update realtime instan tanpa refresh)
  const handleToggleWishlist = async () => {
    if (isOwner) {
      toast.info('Sebagai vendor pemilik toko, Anda tidak dapat menambahkan produk sendiri ke wishlist.')
      return
    }

    if (!currentUserId) {
      toast.info('Silakan masuk terlebih dahulu untuk menambahkan produk ke wishlist', {
        action: {
          label: 'Masuk',
          onClick: () => openLoginModal(`/products/${product.slug}`),
        },
      })
      openLoginModal(`/products/${product.slug}`)
      return
    }

    try {
      const isFav = await toggleWishlist({
        id: product.id,
        productId: product.id,
        title: product.title,
        price: product.price,
        comparePrice: product.compare_price,
        imageUrl: coverImage,
        slug: product.slug,
        vendor: shop.name,
      })
      setIsFavorited(isFav)
    } catch {
      toast.error('Gagal memperbarui status wishlist')
    }
  }

  // Key Features parser
  const keyFeatures = [
    'Material pilihan berkualitas tinggi standar pengrajin UMKM',
    'Pengerjaan rapi, presisi, dan nyaman digunakan sehari-hari',
    'Kemasan protektif aman dan teruji sampai di tangan Anda',
    'Garansi keaslian produk dan proteksi dana Krafita Escrow',
  ]

  return (
    <div className="space-y-8 w-full max-w-full">
      {/* 1. Header Bagian Atas: Judul Produk & Metadata */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-2 border-b border-border/60">
        <div className="space-y-1.5 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-snug">
            {product.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            <span>
              Seller :{' '}
              <strong className="text-foreground font-semibold">
                {shop.name || 'Krafita Official'}
              </strong>
            </span>
            <span>Published : {publishedDateStr}</span>
            <span>
              SKU : <strong className="font-mono text-foreground font-semibold">{skuStr}</strong>
            </span>
          </div>
        </div>

        {/* Action button jika pemilik vendor / admin melihat */}
        {isOwner && (
          <div className="flex items-center gap-2 self-start shrink-0">
            <Link
              href={`/vendor/products`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
            <button
              type="button"
              onClick={() =>
                toast.info('Kelola atau arsipkan produk ini melalui menu Produk di Dashboard Vendor.')
              }
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
              title="Hapus Produk"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Main Section: 2 Kolom Besar (Galeri di Kiri, Detail & Stat Cards di Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* KOLOM KIRI: Galeri Foto dengan Carousel Panah & Thumbnails (Col 1-5) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Foto Utama dengan Panah Carousel */}
          <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100/80 dark:bg-slate-900 border border-border/80 flex items-center justify-center group shadow-xs">
            <Image
              src={coverImage}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-contain p-4 transition-transform duration-300"
            />

            {/* Tombol Panah Kiri (<) */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Foto Sebelumnya"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black shadow-md flex items-center justify-center text-foreground transition-all cursor-pointer hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Tombol Panah Kanan (>) */}
            {images.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Foto Berikutnya"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black shadow-md flex items-center justify-center text-foreground transition-all cursor-pointer hover:scale-105"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Bar Thumbnail 4 Kotak di Bawah Foto Utama */}
          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImageIndex(idx)}
                className={`relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border-2 transition-all cursor-pointer ${
                  selectedImageIndex === idx
                    ? 'border-slate-900 dark:border-[#00a699] ring-2 ring-[#00a699]/30 scale-102 opacity-100'
                    : 'border-border/80 opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="120px"
                  className="object-contain p-1"
                />
              </button>
            ))}

            {/* Placeholder jika foto kurang dari 4 agar tetap simetris sesuai desain referensi */}
            {images.length < 4 &&
              Array.from({ length: 4 - images.length }).map((_, phIdx) => (
                <div
                  key={`ph-${phIdx}`}
                  className="relative aspect-square rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-border/60 flex items-center justify-center opacity-40"
                >
                  <Store className="w-5 h-5 text-muted-foreground/50" />
                </div>
              ))}
          </div>
        </div>

        {/* KOLOM KANAN: Stat Cards & Detail Spesifikasi (Col 6-12) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3 Stat Cards Sejajar Horizontal: Price, Available Stocks, Rating */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {/* Card 1: Price */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-7 h-7 rounded-full bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <CircleDollarSign className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Price</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-foreground tracking-tight block truncate">
                  {formatPrice(product.price)}
                </span>
                {product.compare_price && product.compare_price > product.price && (
                  <span className="text-[11px] text-muted-foreground line-through block">
                    {formatPrice(product.compare_price)}
                  </span>
                )}
              </div>
            </div>

            {/* Card 2: Available Stocks */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-7 h-7 rounded-full bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium">Available Stocks</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-foreground tracking-tight block truncate">
                  {product.stock != null
                    ? product.stock.toLocaleString('id-ID')
                    : isPhysical
                    ? '2,550'
                    : 'Akses Aktif'}
                </span>
              </div>
            </div>

            {/* Card 3: Rating Produk */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="w-7 h-7 rounded-full bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <span className="text-xs font-medium">Rating Produk</span>
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold text-foreground tracking-tight block truncate">
                  {ratingAvg > 0 ? ratingAvg.toFixed(1) : '5.0'}{' '}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({ratingCount || reviews.length})
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Area Bawah Stat Cards: Grid 2 Sub-Kolom (Kiri: Deskripsi & Kontrol, Kanan: Tabel Spesifikasi) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 items-start">
            {/* SUB-KOLOM KIRI (Col 1-8): Description, Key Features, Sizes, Actions */}
            <div className="md:col-span-8 space-y-5">
              {/* Description */}
              <div className="space-y-1">
                <h2 className="text-xs sm:text-sm font-bold text-foreground">Description:</h2>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description ||
                    'Produk pilihan terbaik persembahan pengrajin terverifikasi Krafita. Dikerjakan dengan ketelitian tinggi serta material premium untuk kenyamanan dan kebanggaan produk lokal.'}
                </p>
              </div>

              {/* Key Features */}
              <div className="space-y-1.5">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">Key Features:</h3>
                <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
                  {keyFeatures.map((feat, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sizes */}
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-foreground">Sizes:</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-9 h-9 px-3 rounded-lg text-xs font-semibold flex items-center justify-center border transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black font-bold shadow-xs'
                          : 'border-border/80 bg-background text-foreground hover:bg-muted'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity Counter (hanya jika produk fisik dan BUKAN pemilik produk) */}
              {!isOwner && isPhysical && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs font-bold text-foreground">Jumlah:</span>
                  <div className="inline-flex items-center border border-border rounded-xl overflow-hidden bg-background">
                    <button
                      type="button"
                      disabled={qty <= 1}
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold font-mono">{qty}</span>
                    <button
                      type="button"
                      disabled={qty >= (product.stock || 99)}
                      onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                      className="w-8 h-8 flex items-center justify-center text-sm font-bold text-foreground hover:bg-muted disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Tombol Aksi: Jika vendor pemilik produk, hanya bisa melihat detail */}
              {isOwner ? (
                <div className="w-full max-w-xl p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <Store className="w-4 h-4 text-[#00a699] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">Ini adalah produk dari toko Anda sendiri</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed">
                        Sebagai vendor pemilik produk, Anda tidak dapat memesan, menambahkan ke keranjang, atau menyimpan produk ini ke wishlist. Anda hanya dapat melihat tampilan detail produk ini.
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/60 flex items-center gap-2">
                    <Link
                      href="/vendor/products"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Kelola di Dashboard Vendor</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-2 w-full max-w-xl">
                  {/* 1. Tombol Beli Sekarang */}
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-black font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-sm hover:shadow cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Beli Sekarang</span>
                  </button>

                  {/* 2. Tombol Add to Cart (warna utama projek Krafita #00a699) */}
                  <button
                    type="button"
                    disabled={addingToCart}
                    onClick={handleAddToCart}
                    className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white font-bold text-xs sm:text-sm whitespace-nowrap transition-all shadow-sm hover:shadow cursor-pointer disabled:opacity-60"
                  >
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap">Add to Cart</span>
                  </button>

                  {/* 3. Tombol Wishlist */}
                  <button
                    type="button"
                    onClick={handleToggleWishlist}
                    className={`w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-3 rounded-xl border font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer ${
                      isFavorited
                        ? 'border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800'
                        : 'border-border/80 bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 shrink-0 ${
                        isFavorited ? 'fill-rose-500 text-rose-500' : ''
                      }`}
                    />
                    <span className="whitespace-nowrap">Wishlist</span>
                  </button>
                </div>
              )}
            </div>

            {/* SUB-KOLOM KANAN (Col 9-12): Tabel Spesifikasi Rapi */}
            <div className="md:col-span-4 space-y-4">
              <div className="rounded-2xl border border-border/80 overflow-hidden bg-card text-xs shadow-xs">
                <div className="divide-y divide-border/60">
                  <div className="py-2.5 px-4 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Category</span>
                    <span className="text-foreground font-semibold">
                      {category.name || 'Pakaian & Kerajinan'}
                    </span>
                  </div>
                  <div className="py-2.5 px-4 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Brand</span>
                    <span className="text-foreground font-semibold">
                      {product.brands?.name || shop.name || 'Krafita Official'}
                    </span>
                  </div>
                  <div className="py-2.5 px-4 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Material</span>
                    <span className="text-foreground font-semibold">
                      {product.attributes?.Bahan || 'Kualitas Terpilih'}
                    </span>
                  </div>
                  <div className="py-2.5 px-4 flex items-center justify-between">
                    <span className="text-muted-foreground font-medium">Weight</span>
                    <span className="text-foreground font-semibold">
                      {product.weight || 140} Gr
                    </span>
                  </div>
                </div>
              </div>

              {/* Garansi Pembayaran & Lapor Produk */}
              <div className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/30 border border-border/70 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 text-[#00a699] shrink-0" />
                  <span>Garansi Pembayaran Aman Krafita Escrow</span>
                </div>
                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Ada kendala produk?</span>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className="text-[11px] text-muted-foreground hover:text-rose-600 font-semibold cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    Laporkan Produk
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Section Bawah: Tab Reviews & Diskusi Pembeli */}
      <div className="pt-8 border-t border-border/80 space-y-6">
        {/* Header Tab */}
        <div className="flex items-center justify-between border-b border-border/80 pb-2">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setBottomTab('reviews')}
              className={`pb-2 text-base sm:text-lg font-bold transition-all border-b-2 cursor-pointer ${
                bottomTab === 'reviews'
                  ? 'border-[#00a699] text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setBottomTab('comments')}
              className={`pb-2 text-base sm:text-lg font-bold transition-all border-b-2 cursor-pointer ${
                bottomTab === 'comments'
                  ? 'border-[#00a699] text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Tanya Jawab ({comments.length})
            </button>
            <button
              type="button"
              onClick={() => setBottomTab('shipping')}
              className={`pb-2 text-base sm:text-lg font-bold transition-all border-b-2 cursor-pointer ${
                bottomTab === 'shipping'
                  ? 'border-[#00a699] text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Pengiriman
            </button>
          </div>
        </div>

        {/* Tab Konten: Reviews */}
        {bottomTab === 'reviews' && (
          <div className="animate-in fade-in duration-200">
            <ProductReviews
              productId={product.id}
              reviews={reviews}
              ratingAvg={ratingAvg}
              ratingCount={ratingCount}
              eligibleOrderItemId={eligibleOrderItemId}
              currentUserId={currentUserId}
            />
          </div>
        )}

        {/* Tab Konten: Tanya Jawab / Comments */}
        {bottomTab === 'comments' && (
          <div className="animate-in fade-in duration-200">
            <ProductComments
              productId={product.id}
              comments={comments}
              currentUserId={currentUserId}
              vendorProfileId={shop.profile_id}
            />
          </div>
        )}

        {/* Tab Konten: Pengiriman */}
        {bottomTab === 'shipping' && (
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3 animate-in fade-in duration-200 text-xs text-foreground/85">
            <h3 className="text-sm font-bold text-foreground">Informasi Ongkos Kirim & Layanan</h3>
            <p>
              <strong>Asal Pengiriman:</strong> {shop.city || 'Gudang Pusat'},{' '}
              {shop.province || 'Indonesia'}
            </p>
            <p>
              <strong>Tarif Flat Ongkos Kirim:</strong>{' '}
              <span className="text-[#00a699] font-bold">
                {Number(shop.flat_shipping_cost) === 0
                  ? 'Gratis Ongkir'
                  : formatPrice(Number(shop.flat_shipping_cost || 15000))}
              </span>
            </p>
            <p className="text-muted-foreground">
              *Pengiriman produk fisik didukung ekspedisi terpercaya (JNE, SiCepat, J&T). Pesanan
              akan dikemas aman dan nomor resi pengiriman dapat dipantau di halaman pesanan Anda.
            </p>
          </div>
        )}
      </div>

      {/* MODAL LAPORKAN PRODUK */}
      <ReportModal
        targetType="product"
        targetId={product.id}
        title={product.title}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  )
}
