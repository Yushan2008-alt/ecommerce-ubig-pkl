import { HeroSlider } from '@/components/home/hero-slider'
import { CategoryGrid } from '@/components/home/category-grid'
import { RecommendedProducts } from '@/components/home/recommended-products'
import Link from 'next/link'
import { Package, Download, ShieldCheck, Sparkles, Store } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="w-full flex flex-col bg-background">
      {/* 1. SLIDESHOW HERO BANNER (Persis di bawah Category Bar) */}
      <HeroSlider />

      {/* 2. SHOP BY CATEGORY (12 Lingkaran Kategori persis di bawah Slideshow) */}
      <CategoryGrid />

      {/* 3. REKOMENDASI PRODUK (6 Kolom Grid persis di bawah Kategori + Tombol "Login Untuk Lihat Lainnya") */}
      <RecommendedProducts />

      {/* 4. VALUE PROPOSITION & TRUST BADGES (Minimalis & Elegan) */}
      <section className="border-t border-border/60 bg-muted/20 py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/70 shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Package className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">Produk Fisik Terkurasi</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Belanja pakaian, kerajinan, dan perabotan dari ribuan vendor terpercaya dengan tarif ongkir flat.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/70 shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Download className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">Aset Digital Instan</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Download e-book, template grafis, dan source code langsung aktif seketika setelah pembayaran terverifikasi.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-xl bg-background border border-border/70 shadow-xs">
              <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">Pembayaran Terjamin</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Transaksi aman menggunakan QRIS, Virtual Account bank nasional, dan GoPay dengan verifikasi otomatis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BANNER AJAKAN MULAI BERJUALAN */}
      <section className="container mx-auto px-4 max-w-7xl py-12 md:py-16">
        <div className="rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Program Multi-Vendor Krafita</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Ingin Menjual Produk Fisik atau Karya Digital Anda?
            </h2>
            <p className="text-xs md:text-sm text-neutral-300 leading-relaxed">
              Buka toko online gratis hanya dalam hitungan menit. Jual karya kreatif atau produk fisik Anda ke seluruh Indonesia dengan komisi platform yang adil.
            </p>
          </div>
          <Link
            href="/sell"
            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-[#00a699] hover:bg-[#008f84] text-white font-semibold text-sm transition-colors shadow-md hover:shadow-lg shrink-0"
          >
            <Store className="w-4 h-4 mr-2" />
            <span>Daftar Jadi Penjual Sekarang</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
