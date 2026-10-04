'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/language-context'
import {
  Store,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  HelpCircle,
} from 'lucide-react'

export default function SellOnKrafitaPage() {
  const { t, locale } = useLanguage()

  return (
    <div className="container mx-auto px-4 max-w-7xl py-6 md:py-8">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="hover:text-foreground transition-colors">
              {t.home}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-semibold text-foreground">{t.sell_title}</li>
        </ol>
      </nav>

      {/* 2. Judul Halaman & Paragraf Konten Lengkap (Bilingual) */}
      <article className="max-w-4xl space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {t.sell_title}
        </h1>

        <div className="space-y-4 text-xs md:text-sm text-foreground/85 leading-relaxed">
          <p>{t.sell_p1}</p>
          <p>{t.sell_p2}</p>
          <p>{t.sell_p3}</p>
          <p>{t.sell_p4}</p>
          <p>{t.sell_p5}</p>
        </div>

        {/* 3. Hero CTA Banner */}
        <div className="pt-6 pb-2">
          <div className="p-6 md:p-8 rounded-lg bg-gradient-to-r from-emerald-50 via-teal-50 to-primary/5 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-card border border-[#00a699]/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                {t.sell_hero_title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg">
                {t.sell_hero_desc}
              </p>
            </div>
            <Link
              href="/register?role=vendor"
              className="inline-flex items-center justify-center gap-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-md transition-all shadow-sm hover:shadow-md shrink-0 focus-visible:ring-2 focus-visible:ring-[#00a699] focus-visible:outline-none cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>{t.sell_cta_button}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 4. Keunggulan Berjualan di Krafita */}
        <div className="pt-8 space-y-4">
          <h2 className="text-base md:text-lg font-bold text-foreground">
            {t.why_sell_title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="p-4 rounded-md border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                {locale === 'id' ? 'Produk Fisik & Digital Sekaligus' : 'Physical & Digital Products'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === 'id'
                  ? 'Jual pakaian, kerajinan tangan, template web, desain grafis, software, hingga berkas audio dengan sistem unduhan aman.'
                  : 'Sell apparel, handmade goods, web templates, graphic designs, software, and audio files with secure cloud downloads.'}
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-4 rounded-md border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                {locale === 'id' ? 'Pembayaran Instan & Aman' : 'Instant & Secure Payments'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === 'id'
                  ? 'Terintegrasi dengan Midtrans (QRIS, VA Bank, E-Wallet). Dana hasil penjualan aman dalam sistem escrow dan cepat cair.'
                  : 'Integrated with Midtrans (QRIS, Bank Transfer, E-Wallets). Secure escrow funds with fast automated payouts.'}
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-4 rounded-md border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                {locale === 'id' ? 'Dashboard Penjual Canggih' : 'Advanced Seller Dashboard'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === 'id'
                  ? 'Kelola stok inventaris, pantau status pengiriman paket, lihat analitik grafik penghasilan, dan balas pesan pelanggan.'
                  : 'Manage inventory stock, track shipment status, analyze real-time revenue charts, and chat with customers.'}
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-4 rounded-md border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2">
              <div className="w-8 h-8 rounded-md bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">
                {locale === 'id' ? 'Perlindungan Penjual Terpercaya' : 'Trusted Seller Protection'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === 'id'
                  ? 'Sistem reputasi transparan, verifikasi toko resmi (Verified Seller), serta dukungan tim bantuan 24/7.'
                  : 'Transparent reputation ratings, official Verified Seller badges, and dedicated 24/7 seller support.'}
              </p>
            </div>
          </div>
        </div>

        {/* 5. Langkah Mudah Menjadi Penjual */}
        <div className="pt-8 space-y-4">
          <h2 className="text-base md:text-lg font-bold text-foreground">
            {t.steps_title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-md bg-muted/20 border border-border/60 space-y-1.5">
              <span className="text-xl font-extrabold text-[#00a699]">01</span>
              <h3 className="font-bold text-xs text-foreground">
                {locale === 'id' ? 'Daftar Akun' : 'Register Account'}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {locale === 'id'
                  ? 'Daftar akun gratis dan pilih opsi buka toko / jual di Krafita.'
                  : 'Sign up for free and choose to open your seller store.'}
              </p>
            </div>

            <div className="p-4 rounded-md bg-muted/20 border border-border/60 space-y-1.5">
              <span className="text-xl font-extrabold text-[#00a699]">02</span>
              <h3 className="font-bold text-xs text-foreground">
                {locale === 'id' ? 'Unggah Produk' : 'List Products'}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {locale === 'id'
                  ? 'Lengkapi foto, deskripsi, harga, varian, dan berkas digital jika ada.'
                  : 'Upload product photos, descriptions, pricing, and digital files.'}
              </p>
            </div>

            <div className="p-4 rounded-md bg-muted/20 border border-border/60 space-y-1.5">
              <span className="text-xl font-extrabold text-[#00a699]">03</span>
              <h3 className="font-bold text-xs text-foreground">
                {locale === 'id' ? 'Kirim Pesanan' : 'Fulfill Orders'}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {locale === 'id'
                  ? 'Kemas produk fisik atau biarkan sistem mengirim berkas digital otomatis.'
                  : 'Pack physical goods or let system deliver digital files instantly.'}
              </p>
            </div>

            <div className="p-4 rounded-md bg-muted/20 border border-border/60 space-y-1.5">
              <span className="text-xl font-extrabold text-[#00a699]">04</span>
              <h3 className="font-bold text-xs text-foreground">
                {locale === 'id' ? 'Tarik Penghasilan' : 'Withdraw Earnings'}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {locale === 'id'
                  ? 'Tarik dana hasil penjualan ke rekening bank lokal Anda kapan saja.'
                  : 'Transfer your sales payout directly to your bank account anytime.'}
              </p>
            </div>
          </div>
        </div>

        {/* 6. FAQ */}
        <div className="pt-8 pb-10 space-y-4 border-t border-border/60">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#00a699]" />
            <h2 className="text-base md:text-lg font-bold text-foreground">
              {t.faq_title}
            </h2>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-md border border-border/70 bg-card space-y-1">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                {locale === 'id'
                  ? 'Berapa biaya untuk mulai berjualan di Krafita?'
                  : 'How much does it cost to start selling on Krafita?'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === 'id'
                  ? 'Pendaftaran toko di Krafita 100% gratis tanpa biaya langganan bulanan. Anda hanya dikenakan potongan komisi kecil yang kompetitif saat transaksi berhasil.'
                  : 'Opening a store on Krafita is 100% free with no monthly subscription fees. A competitive commission fee is only charged upon successful transactions.'}
              </p>
            </div>

            <div className="p-3.5 rounded-md border border-border/70 bg-card space-y-1">
              <h3 className="text-xs sm:text-sm font-semibold text-foreground">
                {locale === 'id'
                  ? 'Apakah saya bisa menjual produk digital seperti source code atau desain?'
                  : 'Can I sell digital products like source codes or graphic designs?'}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {locale === 'id'
                  ? 'Ya, Krafita dirancang khusus mendukung produk fisik dan produk digital dengan penyimpanan file cloud terenkripsi dan unduhan otomatis instan setelah pembayaran terkonfirmasi.'
                  : 'Yes, Krafita natively supports physical and digital goods with encrypted cloud storage and instant download delivery upon verified payment.'}
              </p>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
