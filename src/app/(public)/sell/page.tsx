import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { getUser } from '@/lib/auth'
import {
  Store,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  PackageCheck,
  CheckCircle,
  HelpCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sell on Krafita — Buka Toko Online & Jual Produk Fisik & Digital',
  description:
    'Mulai jualan online di Krafita. Jangkau ribuan pembeli, kelola pesanan dan inventaris dengan mudah, serta nikmati pembayaran instan dan aman.',
}

export default async function SellOnKrafitaPage() {
  const { user, profile } = await getUser()

  const isVendor = profile?.role === 'vendor'
  const ctaLink = user
    ? isVendor
      ? '/vendor'
      : '/vendor/onboarding'
    : '/register?role=vendor'

  const ctaText = user
    ? isVendor
      ? 'Buka Dashboard Vendor'
      : 'Lengkapi Data Toko Anda'
    : 'Mulai Berjualan Sekarang (Daftar Gratis)'

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6 md:py-8">
      {/* 1. Breadcrumbs (Persis Gambar Referensi 2: Home / Sell on Krafita) */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-foreground">Sell on Krafita</li>
        </ol>
      </nav>

      {/* 2. Judul Halaman & Paragraf Konten Lengkap (Persis Gambar 2) */}
      <article className="max-w-4xl space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Sell on Krafita
        </h1>

        <div className="space-y-4 text-xs md:text-sm text-foreground/85 leading-relaxed">
          <p>
            At Krafita, we make it easy and hassle-free for you to sell your products to customers all over the world. Whether you are a professional seller or just looking to make some extra cash, Krafita provides you with the perfect platform to showcase your products and reach a wider audience.
          </p>

          <p>
            Our platform is designed to provide you with the tools and support you need to create a successful online business. With a user-friendly interface and powerful features, you can easily list your products, manage your inventory, and process orders.
          </p>

          <p>
            At Krafita, we understand that selling online can be a daunting task. That&apos;s why we offer a range of resources to help you succeed. From seller guides and tutorials to customer support and seller forums, we are committed to helping you grow your business and achieve your goals.
          </p>

          <p>
            With Krafita, you can sell a wide range of products, including fashion, beauty, home and garden, electronics, and more. Our platform is designed to provide you with maximum exposure and reach, so you can connect with customers from all over the world.
          </p>

          <p>
            Join the Krafita community today and start selling your products to a global audience. With our powerful platform and dedicated support team, the sky is the limit for your online business.
          </p>
        </div>

        {/* 3. Hero CTA Banner */}
        <div className="pt-6 pb-2">
          <div className="p-6 md:p-8 rounded-lg bg-gradient-to-r from-emerald-50 via-teal-50 to-primary/5 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-card border border-[#00a699]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Siap Melipatgandakan Penjualan Bisnis Anda?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                Buka toko Anda dalam hitungan menit tanpa biaya pendaftaran bulanan. Jual produk fisik maupun digital sekarang.
              </p>
            </div>
            <Link
              href={ctaLink}
              className="inline-flex items-center justify-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-md transition-all shadow-sm hover:shadow-md shrink-0 focus-visible:ring-2 focus-visible:ring-[#00a699] focus-visible:outline-none cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>{ctaText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4. Keunggulan Berjualan di Krafita (4 Cards) */}
        <div className="pt-8 space-y-4">
          <h2 className="text-base md:text-lg font-bold text-foreground">
            Mengapa Memilih Berjualan di Krafita?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="p-4 rounded-md border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                Produk Fisik &amp; Digital Sekaligus
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Jual pakaian, kerajinan tangan, template web, desain grafis, software, hingga berkas audio dengan sistem unduhan aman.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-md border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                Pembayaran Instan &amp; Aman
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Terintegrasi dengan Midtrans (QRIS, VA Bank, E-Wallet). Dana hasil penjualan aman dalam sistem escrow dan cepat cair.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-md border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                Dashboard Penjual Canggih
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kelola stok inventaris, pantau status pengiriman paket, lihat analitik grafik penghasilan, dan balas pesan pelanggan.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-4 rounded-md border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                Perlindungan Penjual Terpercaya
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sistem reputasi transparan, verifikasi toko resmi (*Verified Seller*), serta dukungan tim bantuan 24/7.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Langkah Mudah Menjadi Penjual */}
        <div className="pt-8 space-y-4">
          <h2 className="text-base md:text-lg font-bold text-foreground">
            4 Langkah Mudah Memulai
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-md bg-muted/20 border border-border/60 space-y-1.5">
              <span className="text-xl font-extrabold text-[#00a699]">01</span>
              <h3 className="font-bold text-xs text-foreground">Daftar Akun</h3>
              <p className="text-[11px] text-muted-foreground">
                Daftar akun gratis dan pilih opsi buka toko / jual di Krafita.
              </p>
            </div>

            <div className="p-4 rounded-md bg-muted/20 border border-border/60 space-y-1.5">
              <span className="text-xl font-extrabold text-[#00a699]">02</span>
              <h3 className="font-bold text-xs text-foreground">Unggah Produk</h3>
              <p className="text-[11px] text-muted-foreground">
                Lengkapi foto, deskripsi, harga, varian, dan unggah berkas jika produk digital.
              </p>
            </div>

            <div className="p-4 rounded-md bg-muted/20 border border-border/60 space-y-1.5">
              <span className="text-xl font-extrabold text-[#00a699]">03</span>
              <h3 className="font-bold text-xs text-foreground">Kirim Pesanan</h3>
              <p className="text-[11px] text-muted-foreground">
                Kemas produk fisik atau biarkan sistem mengirim berkas digital secara otomatis.
              </p>
            </div>

            <div className="p-4 rounded-md bg-muted/20 border border-border/60 space-y-1.5">
              <span className="text-xl font-extrabold text-[#00a699]">04</span>
              <h3 className="font-bold text-xs text-foreground">Tarik Penghasilan</h3>
              <p className="text-[11px] text-muted-foreground">
                Tarik dana penghasilan penjualan Anda ke rekening bank lokal kapan saja.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Pertanyaan Umum (FAQ) */}
        <div className="pt-8 pb-10 space-y-4 border-t border-border/60">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#00a699]" />
            <h2 className="text-base md:text-lg font-bold text-foreground">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-border/70 bg-card space-y-1">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                Berapa biaya untuk mulai berjualan di Krafita?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pendaftaran toko di Krafita 100% gratis tanpa biaya langganan bulanan. Anda hanya dikenakan potongan komisi kecil yang kompetitif saat transaksi berhasil.
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-border/70 bg-card space-y-1">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                Apakah saya bisa menjual produk digital seperti source code atau desain?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ya, Krafita dirancang khusus mendukung produk fisik dan produk digital dengan penyimpanan file cloud terenkripsi dan unduhan otomatis instan setelah pembayaran terkonfirmasi.
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
