'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Package,
  FileCode,
  Star,
  Truck,
  ShieldCheck,
  MessageCircle,
  Share2,
  Heart,
  ShoppingCart,
  Zap,
  Store,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react'
import { ProductReviews } from './product-reviews'
import { ProductComments } from './product-comments'
import { ReportModal } from './report-modal'
import { addToCartAction } from '@/actions/cart'
import { toggleWishlistAction } from '@/actions/wishlist'
import { toast } from 'sonner'

interface ProductDetailViewProps {
  product: any
  reviews: any[]
  comments: any[]
  ratingAvg: number
  ratingCount: number
  eligibleOrderItemId?: string | null
  currentUserId?: string | null
  isInWishlist?: boolean
}

export function ProductDetailView({
  product,
  reviews,
  comments,
  ratingAvg,
  ratingCount,
  eligibleOrderItemId,
  currentUserId,
  isInWishlist = false,
}: ProductDetailViewProps) {
  const router = useRouter()
  const images: string[] = (product.product_images || []).map((img: any) => img.path || img)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'shipping' | 'reviews' | 'comments'>('desc')
  const [qty, setQty] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isFavorited, setIsFavorited] = useState(isInWishlist)
  const [isReportOpen, setIsReportOpen] = useState(false)

  const coverImage = images[selectedImageIndex] || '/placeholder-product.jpg'
  const isPhysical = product.type === 'physical'
  const shop = product.shops || {}
  const category = product.categories || {}

  const discountPercent =
    product.compare_price && product.compare_price > product.price
      ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
      : 0

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  // Add to cart handler
  const handleAddToCart = async () => {
    if (!currentUserId) {
      router.push(`/login?next=/products/${product.slug}`)
      return
    }

    setAddingToCart(true)
    try {
      const res = await addToCartAction(product.id, isPhysical ? qty : 1)
      if (res.success) {
        toast.success(`"${product.title}" berhasil dimasukkan ke keranjang belanja!`)
      } else {
        toast.error(res.error || 'Gagal menambahkan ke keranjang')
      }
    } catch {
      toast.error('Gagal menambahkan ke keranjang')
    } finally {
      setAddingToCart(false)
    }
  }

  // Buy now handler (direct checkout)
  const handleBuyNow = () => {
    if (!currentUserId) {
      router.push(`/login?next=/products/${product.slug}`)
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

  // Toggle wishlist handler
  const handleToggleWishlist = async () => {
    if (!currentUserId) {
      router.push(`/login?next=/products/${product.slug}`)
      return
    }

    setIsFavorited(!isFavorited)
    try {
      const res = await toggleWishlistAction(product.id)
      if (res.success) {
        toast.success(res.isFavorited ? 'Ditambahkan ke wishlist' : 'Dihapus dari wishlist')
      }
    } catch {
      setIsFavorited(isFavorited)
    }
  }

  // WhatsApp Chat Link
  const rawWa = shop.whatsapp?.replace(/[^0-9]/g, '') || ''
  const waNumber = rawWa.startsWith('0') ? `62${rawWa.slice(1)}` : rawWa
  const waText = encodeURIComponent(
    `Halo ${shop.name}, saya tertarik dengan produk "${product.title}" di Krafita. Apakah produk ini masih tersedia?`
  )
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waText}` : null

  return (
    <div className="space-y-10">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex items-center space-x-1.5 flex-wrap">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Beranda
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="hover:text-foreground transition-colors">
              Produk
            </Link>
          </li>
          <li>/</li>
          {category.name && (
            <>
              <li>
                <span className="text-foreground">{category.name}</span>
              </li>
              <li>/</li>
            </>
          )}
          <li className="font-semibold text-foreground truncate max-w-xs">{product.title}</li>
        </ol>
      </nav>

      {/* 2. Top Main Section: Galeri (Kiri) & Detail Transaksi (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* GALERI FOTO (Col 1-6) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted/40 border border-border/80 shadow-xs">
            <Image
              src={coverImage}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />

            {/* Badge Diskon */}
            {discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-xs z-10">
                -{discountPercent}%
              </span>
            )}

            {/* Floating Wishlist Button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-xs transition-all shadow-md cursor-pointer ${
                isFavorited
                  ? 'bg-rose-50 text-rose-500 dark:bg-rose-950/80'
                  : 'bg-white/80 hover:bg-white text-foreground/80 dark:bg-black/60 dark:hover:bg-black'
              }`}
              title="Simpan ke Wishlist"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails Picker */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-muted border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#00a699] ring-2 ring-[#00a699]/30 scale-102'
                      : 'border-border/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={imgUrl}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KOLOM INFORMASI & BELI (Col 7-12) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Info: Tipe, Kategori, Judul */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isPhysical
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                }`}
              >
                {isPhysical ? (
                  <>
                    <Package className="w-3.5 h-3.5" /> Produk Fisik
                  </>
                ) : (
                  <>
                    <FileCode className="w-3.5 h-3.5" /> Produk Digital (Unduhan)
                  </>
                )}
              </span>

              {category.name && (
                <span className="text-[11px] font-semibold text-muted-foreground">
                  Kategori: {category.name}
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Rating Stars & Reviews Count */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-4 h-4 ${
                      s <= Math.round(ratingAvg)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-foreground">
                {ratingAvg > 0 ? ratingAvg.toFixed(1) : 'Baru'}
              </span>
              <span className="text-xs text-muted-foreground">
                ({ratingCount} ulasan pembeli)
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-muted/30 border border-border/80 space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-[#00a699]">
                {formatPrice(product.price)}
              </span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {isPhysical
                ? `Stok Tersedia: ${product.stock} unit • SKU: ${product.sku || '-'}`
                : 'Akses unduhan instan langsung aktif setelah pembayaran terverifikasi'}
            </p>
          </div>

          {/* Profil Toko Penjual Singkat */}
          <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#00a699]/10 text-[#00a699] flex items-center justify-center font-bold overflow-hidden shrink-0 border border-border">
                {shop.logo_url ? (
                  <Image
                    src={shop.logo_url}
                    alt={shop.name}
                    width={44}
                    height={44}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <Store className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-0.5 min-w-0">
                <h3 className="text-xs font-bold text-foreground truncate">{shop.name}</h3>
                <p className="text-[11px] text-muted-foreground">
                  {shop.city || 'Indonesia'} • Penjual Terverifikasi
                </p>
              </div>
            </div>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>

          {/* Kuantitas & Action Buttons */}
          <div className="space-y-3 pt-2">
            {isPhysical && (
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-foreground">Jumlah:</label>
                <div className="flex items-center border border-border rounded-xl overflow-hidden bg-background">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={addingToCart}
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border-2 border-[#00a699] text-[#00a699] hover:bg-[#00a699]/10 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-xs"
              >
                <ShoppingCart className="w-4 h-4" />
                Tambah ke Keranjang
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Beli Sekarang
              </button>
            </div>
          </div>

          {/* Keamanan Transaksi & Lapor Produk */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00a699]" />
              Garansi Pembayaran Aman Krafita Escrow
            </span>

            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="text-muted-foreground/80 hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Laporkan Produk
            </button>
          </div>
        </div>
      </div>

      {/* 3. Tab Navigasi Konten Lengkap */}
      <div className="space-y-6 pt-6 border-t border-border/80">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-border/80 overflow-x-auto scrollbar-none pb-px">
          {[
            { id: 'desc', label: 'Deskripsi' },
            { id: 'specs', label: 'Spesifikasi & Info' },
            { id: 'shipping', label: 'Pengiriman & Ongkir' },
            { id: 'reviews', label: `Ulasan (${reviews.length})` },
            { id: 'comments', label: `Diskusi (${comments.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-4 text-xs font-bold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#00a699] text-[#00a699]'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Deskripsi */}
        {activeTab === 'desc' && (
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-foreground">Deskripsi Produk</h3>
            <div className="text-xs md:text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>
        )}

        {/* Tab 2: Spesifikasi Atribut */}
        {activeTab === 'specs' && (
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-foreground">Spesifikasi Tambahan</h3>
            <div className="divide-y divide-border/60 text-xs">
              <div className="py-2.5 flex justify-between">
                <span className="text-muted-foreground">Tipe Produk:</span>
                <span className="font-bold text-foreground capitalize">{product.type}</span>
              </div>
              {isPhysical && (
                <>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-muted-foreground">Berat Barang:</span>
                    <span className="font-bold text-foreground">{product.weight || 0} gram</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-muted-foreground">SKU:</span>
                    <span className="font-mono font-bold text-foreground">{product.sku || '-'}</span>
                  </div>
                </>
              )}
              {product.attributes &&
                Object.entries(product.attributes).map(([k, v]) => (
                  <div key={k} className="py-2.5 flex justify-between">
                    <span className="text-muted-foreground">{k}:</span>
                    <span className="font-bold text-foreground">{v as string}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 3: Pengiriman */}
        {activeTab === 'shipping' && (
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4 animate-in fade-in duration-200">
            <h3 className="text-sm font-bold text-foreground">Informasi Ongkos Kirim & Layanan</h3>
            <div className="space-y-3 text-xs leading-relaxed text-foreground/85">
              <p>
                <strong>Asal Pengiriman:</strong> {shop.city || 'Gudang Pusat'},{' '}
                {shop.province || 'Indonesia'}
              </p>
              <p>
                <strong>Tarif Flat Ongkos Kirim:</strong>{' '}
                <span className="text-emerald-600 font-bold">
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
          </div>
        )}

        {/* Tab 4: Reviews */}
        {activeTab === 'reviews' && (
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

        {/* Tab 5: Comments */}
        {activeTab === 'comments' && (
          <div className="animate-in fade-in duration-200">
            <ProductComments
              productId={product.id}
              comments={comments}
              currentUserId={currentUserId}
              vendorProfileId={shop.profile_id}
            />
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
