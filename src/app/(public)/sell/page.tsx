import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { VendorOnboardingWizard } from '@/components/vendor/vendor-onboarding-wizard'
import { parseShopMetadata } from '@/lib/shop-helper'
import {
  Store,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  CreditCard,
  Sparkles,
} from 'lucide-react'

export const metadata = {
  title: 'Buka Toko & Jual Karya di Krafita — Marketplace Multi-Vendor',
  description:
    'Daftarkan toko online Anda di Krafita. Jual produk fisik dan produk digital dengan komisi bersahabat, pembayaran terintegrasi Midtrans, dan jangkauan pelanggan se-Indonesia.',
}

export default async function SellOnKrafitaPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>
}) {
  const { user, profile } = await getUser()
  const { step } = await searchParams

  let userShop = null
  let userShopMeta = null

  if (user) {
    const supabase = await createClient()
    const { data: s } = await supabase
      .from('shops')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle()

    userShop = s
    if (s) {
      userShopMeta = parseShopMetadata(s.description)
    }

    // Jika toko sudah aktif penuh, arahkan ke dashboard vendor
    if (s?.status === 'active' && profile?.role === 'vendor') {
      redirect('/vendor')
    }
  }

  const supabase = await createClient()
  const { data: dbCategories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('sort_order', { ascending: true })

  const isMemberOrVendorPending = Boolean(user)

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
          {userShop?.status === 'approved'
            ? 'Langkah Terakhir: Unggah Produk Pertama Anda'
            : userShop?.status === 'pending'
            ? 'Pendaftaran Toko Sedang Ditinjau Moderator'
            : 'Buka Toko Anda dalam 6 Langkah Mudah'}
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
          {userShop?.status === 'approved'
            ? 'Pendaftaran toko Anda telah disetujui! Unggah produk pertama Anda agar toko resmi aktif dan produk Anda tampil di katalog Krafita.'
            : userShop?.status === 'pending'
            ? 'Pendaftaran toko Anda telah tersimpan dan saat ini menunggu verifikasi dari tim moderator kami.'
            : 'Bergabunglah dengan ribuan kreator, pengrajin, dan pelaku usaha di seluruh Indonesia. Pendaftaran terverifikasi, ekspedisi terpadu, dan pencairan dana aman.'}
        </p>
      </div>

      {/* 3. WIZARD KHUSUS MEMBER ATAU HERO BANNER UNTUK GUEST */}
      {isMemberOrVendorPending ? (
        <section className="mb-14">
          <VendorOnboardingWizard
            userEmail={user?.email || ''}
            userName={profile?.display_name || ''}
            existingShop={userShop}
            existingMetadata={userShopMeta}
            categories={dbCategories || []}
            initialStep={step === '6' && userShop?.status === 'approved' ? 6 : undefined}
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
                Masuk atau buat akun Krafita Anda sekarang untuk mengakses alur pendaftaran toko resmi.
              </p>
            </div>
            <Link
              href="/register?next=/sell"
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

          <div className="p-5 rounded-xl border border-border/80 bg-card hover:border-[#00a699]/60 transition-colors space-y-2 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-foreground">
              Perlindungan Terpercaya
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verifikasi toko oleh moderator resmi untuk menjaga standar kualitas ekosistem belanja Krafita.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
