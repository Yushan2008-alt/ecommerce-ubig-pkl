import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { VendorOnboardingWizard } from '@/components/vendor/vendor-onboarding-wizard'
import {
  Store,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  HelpCircle,
  Sparkles,
} from 'lucide-react'

export const metadata = {
  title: 'Buka Toko & Jual Karya di Krafita — Marketplace Multi-Vendor',
  description:
    'Daftarkan toko online Anda di Krafita. Jual produk fisik dan produk digital dengan komisi bersahabat, pembayaran terintegrasi Midtrans, dan jangkauan pelanggan se-Indonesia.',
}

export default async function SellOnKrafitaPage() {
  const { user, profile } = await getUser()

  // Jika user sudah berstatus vendor, langsung arahkan ke Dashboard Vendor
  if (profile?.role === 'vendor') {
    redirect('/vendor')
  }

  const isMember = Boolean(user && profile?.role === 'member')

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6 md:py-10">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-foreground">Buka Toko di Krafita</li>
        </ol>
      </nav>

      {/* 2. Top Header Intro */}
      <div className="max-w-3xl mb-8 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00a699]/10 text-[#00a699] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Krafita Vendor Portal
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
          {isMember ? 'Buka Toko Anda dalam 3 Langkah Mudah' : 'Jual Produk Fisik & Digital di Krafita'}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {isMember
            ? 'Lengkapi formulir onboarding singkat di bawah ini untuk mengaktifkan toko Anda secara instan dan mulai berjualan ke ribuan pelanggan.'
            : 'Bergabunglah dengan ribuan kreator, pengrajin, dan pelaku usaha di seluruh Indonesia. Proses pendaftaran gratis, pencairan dana aman, dan dashboard lengkap.'}
        </p>
      </div>

      {/* 3. WIZARD KHUSUS MEMBER ATAU HERO BANNER UNTUK GUEST */}
      {isMember ? (
        <section className="mb-14">
          <VendorOnboardingWizard
            userEmail={user?.email || ''}
            userName={profile?.display_name || ''}
          />
        </section>
      ) : (
        /* GUEST CTA BANNER */
        <section className="mb-12">
          <div className="p-6 md:p-10 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-primary/5 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-card border border-[#00a699]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Siap Memulai Perjalanan Bisnis Anda?
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                Masuk atau buat akun Krafita Anda sekarang untuk mengakses formulir pendaftaran toko instan.
              </p>
            </div>
            <Link
              href="/register?next=/sell&role=vendor"
              className="inline-flex items-center justify-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg shrink-0 cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Daftar & Buka Toko Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 4. Keunggulan Berjualan di Krafita */}
      <section className="pt-6 space-y-4">
        <h2 className="text-base md:text-lg font-bold text-foreground">
          Keunggulan Menjadi Penjual di Krafita
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">
              Produk Fisik & Digital
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Jual pakaian, kerajinan tangan, template web, desain grafis, software, hingga berkas audio dengan sistem unduhan aman.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">
              Pembayaran Terpadu
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Terintegrasi Midtrans (QRIS, VA Bank, E-Wallet). Dana hasil penjualan aman dalam sistem escrow dan cepat cair.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">
              Dashboard Analitik
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kelola stok inventaris, pantau status pengiriman paket, lihat grafik analitik penghasilan, dan balas diskusi pembeli.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-5 rounded-xl border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">
              Perlindungan Terpercaya
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sistem reputasi transparan, verifikasi toko resmi, serta perlindungan penjual dari ulasan palsu tanpa transaksi.
            </p>
          </div>
        </div>
      </section>

      {/* 5. 4 Langkah Mudah */}
      <section className="pt-10 space-y-4">
        <h2 className="text-base md:text-lg font-bold text-foreground">
          Alur Mudah Menjadi Penjual Sukses
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <span className="text-2xl font-black text-[#00a699]">01</span>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">Daftar Akun & Toko</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Isi data toko Anda melalui wizard 3 langkah untuk aktivasi instan tanpa ribet.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <span className="text-2xl font-black text-[#00a699]">02</span>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">Unggah Produk</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Lengkapi foto WebP, harga, stok fisik, atau unggah berkas file digital privat Anda.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <span className="text-2xl font-black text-[#00a699]">03</span>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">Kirim Pesanan</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Kemas produk fisik & input nomor resi kurir, atau biarkan sistem mengirim berkas digital otomatis.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-muted/20 border border-border/60 space-y-2">
            <span className="text-2xl font-black text-[#00a699]">04</span>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">Tarik Penghasilan</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Tarik saldo bersih hasil penjualan langsung ke rekening bank lokal Anda kapan saja.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="pt-10 pb-12 space-y-4 border-t border-border/60 mt-10">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#00a699]" />
          <h2 className="text-base md:text-lg font-bold text-foreground">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              Berapa biaya untuk mulai berjualan di Krafita?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pendaftaran toko di Krafita 100% gratis tanpa biaya langganan bulanan. Anda hanya dikenakan potongan komisi platform transparan sebesar 5% ketika transaksi berhasil dan selesai.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/70 bg-card space-y-1.5 shadow-xs">
            <h3 className="text-xs sm:text-sm font-bold text-foreground">
              Apakah saya bisa menjual produk digital seperti software atau template?
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ya, Krafita dirancang khusus mendukung produk fisik dan produk digital dengan penyimpanan cloud terenkripsi dan unduhan otomatis instan bagi pembeli setelah pembayaran terkonfirmasi.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
