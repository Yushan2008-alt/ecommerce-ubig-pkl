'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Wallet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import {
  DashboardDateFilter,
  PeriodSelection,
  getPeriodRange,
} from '@/components/vendor/dashboard-date-filter'
import { SalesChart } from '@/components/vendor/sales-chart'
import { eachDayOfInterval, format, isSameDay, isWithinInterval, startOfDay } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface VendorDashboardClientProps {
  shop: any
  metrics: {
    totalGrossSales: number
    totalNetSales: number
    newOrdersCount: number
    activeProductsCount: number
    availableBalance: number
  }
  recentOrders: any[]
  initialChartData: { date: string; sales: number; orders: number }[]
  rawSales?: { createdAt: string; amount: number; isPaid: boolean }[]
  onboardingChecklist: {
    shopCreated: boolean
    hasProducts: boolean
    hasBankAccount: boolean
    profileComplete: boolean
  }
}

export function VendorDashboardClient({
  shop,
  metrics,
  recentOrders,
  initialChartData,
  rawSales = [],
  onboardingChecklist,
}: VendorDashboardClientProps) {
  const [period, setPeriod] = useState<PeriodSelection>(() => ({
    key: 'thisMonth',
    label: 'Bulan Ini',
    range: getPeriodRange('thisMonth'),
  }))

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  // 1. Filter rawSales berdasarkan rentang waktu yang dipilih
  const { filteredChartData, periodGrossSales } = useMemo(() => {
    if (!rawSales || rawSales.length === 0) {
      return {
        filteredChartData: initialChartData,
        periodGrossSales: metrics.totalGrossSales,
      }
    }

    const { from, to } = period.range
    const paidSales = rawSales.filter((s) => s.isPaid)

    // Filter yang masuk dalam range
    const inRange = paidSales.filter((s) => {
      const d = new Date(s.createdAt)
      return isWithinInterval(d, { start: from, end: to })
    })

    const totalSales = inRange.reduce((acc, s) => acc + s.amount, 0)

    // Buat interval hari
    let days: Date[] = []
    try {
      days = eachDayOfInterval({
        start: startOfDay(from),
        end: startOfDay(to),
      })
    } catch {
      days = [from]
    }

    let chart: { date: string; sales: number; orders: number }[] = []
    if (days.length > 62) {
      // Agregasi bulanan jika rentang lebih dari 62 hari (misal: Tahun Ini / Tahun Lalu)
      const monthlyMap = new Map<string, { sales: number; orders: number }>()
      days.forEach((day) => {
        const monthKey = format(day, 'MMM yyyy', { locale: idLocale })
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { sales: 0, orders: 0 })
        }
      })
      inRange.forEach((s) => {
        const monthKey = format(new Date(s.createdAt), 'MMM yyyy', { locale: idLocale })
        const existing = monthlyMap.get(monthKey)
        if (existing) {
          existing.sales += s.amount
          existing.orders += 1
        }
      })
      chart = Array.from(monthlyMap.entries()).map(([date, val]) => ({
        date,
        sales: val.sales,
        orders: val.orders,
      }))
    } else {
      // Agregasi harian untuk rentang <= 62 hari (Hari Ini, 7 Hari, 30 Hari, Bulan Ini, dsb)
      chart = days.map((day) => {
        const daySales = inRange.filter((s) => isSameDay(new Date(s.createdAt), day))
        const salesSum = daySales.reduce((acc, s) => acc + s.amount, 0)
        return {
          date: format(day, 'd MMM', { locale: idLocale }),
          sales: salesSum,
          orders: daySales.length,
        }
      })
    }

    return {
      filteredChartData: chart,
      periodGrossSales: totalSales,
    }
  }, [rawSales, period, initialChartData, metrics.totalGrossSales])

  // Checklist onboarding
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
      href: '/vendor/settings#bank',
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
      {/* 1. Top Header dengan Title & Dropdown Filter Rentang Tanggal (Gambar 1 & 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ringkasan performa dan transaksi toko {shop.name}
          </p>
        </div>

        {/* Filter Rentang Tanggal Shadcn UI Popover / Dropdown Menu */}
        <div className="flex items-center gap-2">
          <DashboardDateFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* 2. CHECKLIST ONBOARDING PROGRESS */}
      {completedCount < 4 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-primary/5 border border-[#00a699]/30 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">
              <Sparkles className="w-4 h-4 text-[#00a699]" />
              <span>Lengkapi Profil Toko Anda</span>
            </div>
            <span className="text-xs font-bold text-[#00a699]">{progressPercent}%</span>
          </div>

          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00a699] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

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
                  <span
                    className={`text-[11px] leading-snug ${
                      item.done ? 'line-through' : 'font-semibold'
                    }`}
                  >
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
        {/* Card 1: Penjualan (Tersinkronisasi dengan Filter Rentang Waktu) */}
        <Link
          href="/vendor/orders"
          className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3 hover:border-[#00a699]/60 hover:shadow-md transition-all cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Penjualan ({period.label})
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">
              {formatPrice(periodGrossSales)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Semua transaksi lunas ({period.label})
            </p>
          </div>
        </Link>

        {/* Card 2: Pesanan Baru */}
        <Link
          href="/vendor/orders"
          className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3 hover:border-amber-500/60 hover:shadow-md transition-all cursor-pointer block"
        >
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
        </Link>

        {/* Card 3: Produk Aktif */}
        <Link
          href="/vendor/products"
          className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3 hover:border-blue-500/60 hover:shadow-md transition-all cursor-pointer block"
        >
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
        </Link>

        {/* Card 4: Saldo Aktif */}
        <Link
          href="/vendor/balance"
          className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-3 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Saldo Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatPrice(metrics.availableBalance)}
            </h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00a699] mt-0.5">
              Tarik Saldo <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* 4. SALES CHART (SINKRON DENGAN PERIODE, FILTER 7/14/30 HARI DIHAPUS) */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs">
        <SalesChart data={filteredChartData} periodLabel={period.label} />
      </div>

      {/* 5. TABEL 5 PESANAN MASUK TERAKHIR */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-foreground">Pesanan Baru</h2>
          </div>
          <Link
            href="/vendor/orders"
            className="text-xs font-bold text-[#00a699] hover:underline inline-flex items-center gap-1"
          >
            <span>Semua</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <p>Belum ada pesanan masuk untuk toko Anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 overflow-x-auto">
            {recentOrders.slice(0, 3).map((ord: any) => (
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
