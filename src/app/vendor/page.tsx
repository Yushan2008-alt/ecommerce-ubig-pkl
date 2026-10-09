import React from 'react'
import Link from 'next/link'
import { getVendorDashboardDataAction } from '@/actions/vendor'
import { SalesChart } from '@/components/vendor/sales-chart'
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Wallet,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Truck,
  CreditCard,
  Settings,
} from 'lucide-react'

export default async function VendorDashboardPage() {
  const res = await getVendorDashboardDataAction()

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
        <h1 className="text-base font-bold text-foreground">Gagal Memuat Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {res.error || 'Terjadi kesalahan sistem saat mengambil data toko.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a699] text-white text-xs font-semibold rounded-lg"
        >
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const { shop, metrics, recentOrders, chartData, onboardingChecklist } = res.data

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  // Hitung persentase onboarding
  const checklistItems = [
    { label: 'Pendaftaran Toko Selesai', done: true, href: '/vendor/settings' },
    {
      label: 'Tambah Produk Pertama (Fisik atau Digital)',
      done: onboardingChecklist.hasProducts,
      href: '/vendor/products/new',
      cta: 'Tambah Produk',
    },
    {
      label: 'Atur Rekening Bank untuk Penarikan Saldo',
      done: onboardingChecklist.hasBankAccount,
      href: '/vendor/balance',
      cta: 'Atur Rekening',
    },
    {
      label: 'Lengkapi Kontak WhatsApp & Lokasi Toko',
      done: onboardingChecklist.profileComplete,
      href: '/vendor/settings',
      cta: 'Perbarui Info',
    },
  ]

  const completedCount = checklistItems.filter((i) => i.done).length
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100)

  return (
    <div className="space-y-6">
      {/* 1. Top Greeting & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Dashboard Toko {shop.name}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Aktif
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Selamat datang kembali! Pantau analitik penjualan, proses pesanan, dan kelola produk Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/vendor/products/new"
            className="inline-flex items-center gap-1.5 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Link>
          <Link
            href={`/products`}
            className="inline-flex items-center gap-1.5 bg-card hover:bg-muted/60 text-foreground border border-border text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors shrink-0"
            title="Lihat katalog"
          >
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Katalog</span>
          </Link>
        </div>
      </div>

      {/* 2. CHECKLIST ONBOARDING PROGRESS (Tampil jika belum 100%) */}
      {progressPercent < 100 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-primary/5 border border-[#00a699]/30 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">
                <Sparkles className="w-4 h-4 text-[#00a699]" />
                Langkah Kesiapan Toko ({progressPercent}% Selesai)
              </div>
              <p className="text-[11px] text-muted-foreground">
                Selesaikan langkah-langkah berikut untuk memaksimalkan potensi penjualan toko Anda.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#00a699] shrink-0">
              {completedCount} dari {checklistItems.length} Selesai
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00a699] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Checklist Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {checklistItems.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex flex-col justify-between gap-2 text-xs transition-all ${
                  item.done
                    ? 'bg-muted/30 border-border/60 text-muted-foreground'
                    : 'bg-card border-[#00a699]/40 text-foreground shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      item.done ? 'text-emerald-500' : 'text-muted-foreground/40'
                    }`}
                  />
                  <span className={`text-[11px] leading-snug ${item.done ? 'line-through' : 'font-semibold'}`}>
                    {item.label}
                  </span>
                </div>
                {!item.done && item.cta && (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00a699] hover:underline pt-1"
                  >
                    {item.cta}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 4 METRIK KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Gross Sales */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Penjualan</span>
            <div className="w-9 h-9 rounded-xl bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {formatPrice(metrics.totalGrossSales)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Semua transaksi lunas</p>
          </div>
        </div>

        {/* Card 2: Pesanan Baru */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pesanan Baru</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {metrics.newOrdersCount}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Perlu diproses / dikemas</p>
          </div>
        </div>

        {/* Card 3: Produk Aktif */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Produk Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {metrics.activeProductsCount}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Tayang di etalase pembeli</p>
          </div>
        </div>

        {/* Card 4: Saldo Bersih Tersedia */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Saldo Tersedia</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatPrice(metrics.availableBalance)}
            </h2>
            <Link
              href="/vendor/balance"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00a699] hover:underline mt-0.5"
            >
              Tarik Saldo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. GRAFIK TREN PENJUALAN HARIAN (RECHARTS) */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Tren Penjualan 14 Hari Terakhir</h2>
            <p className="text-xs text-muted-foreground">
              Grafik pendapatan harian dari pesanan pelanggan
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
            14 Hari Terakhir
          </span>
        </div>

        <SalesChart data={chartData} />
      </div>

      {/* 5. TABEL 5 PESANAN MASUK TERAKHIR */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Pesanan Masuk Terbaru</h2>
            <p className="text-xs text-muted-foreground">
              Daftar barang pesanan yang masuk ke toko Anda
            </p>
          </div>
          <Link
            href="/vendor/orders"
            className="text-xs font-bold text-[#00a699] hover:underline inline-flex items-center gap-1"
          >
            Lihat Semua Pesanan
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p>Belum ada pesanan masuk untuk toko Anda.</p>
            <p className="text-[11px]">
              Pastikan Anda sudah mempublikasikan produk agar pembeli dapat melakukan checkout.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 overflow-x-auto">
            {recentOrders.map((ord: any) => (
              <div
                key={ord.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded">
                      {ord.orderCode}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.fulfilmentStatus === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : ord.fulfilmentStatus === 'shipped'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                          : ord.fulfilmentStatus === 'processing'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {ord.fulfilmentStatus === 'waiting' && 'Menunggu Diproses'}
                      {ord.fulfilmentStatus === 'processing' && 'Sedang Dikemas'}
                      {ord.fulfilmentStatus === 'shipped' && 'Dalam Pengiriman'}
                      {ord.fulfilmentStatus === 'completed' && 'Selesai'}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-[11px]">
                    {new Date(ord.createdAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="font-bold text-foreground text-sm">
                    {formatPrice(ord.itemTotal)}
                  </span>
                  <Link
                    href="/vendor/orders"
                    className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-[11px] font-semibold text-foreground transition-colors"
                  >
                    Kelola Resi
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
