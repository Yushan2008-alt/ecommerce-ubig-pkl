'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Wallet,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Truck,
  Loader2,
  MapPin,
  X,
} from 'lucide-react'
import {
  DashboardDateFilter,
  PeriodSelection,
  getPeriodRange,
} from '@/components/vendor/dashboard-date-filter'
import { SalesChart } from '@/components/vendor/sales-chart'
import { eachDayOfInterval, format, isSameDay, isWithinInterval, startOfDay } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { formatTimeAgo } from '@/lib/utils'
import { updateVendorFulfilmentAction, type VendorRecentOrder } from '@/actions/vendor'
import type { FulfilmentStatus } from '@/types/database'
import { toast } from 'sonner'

interface VendorDashboardClientProps {
  shop: any
  metrics: {
    totalGrossSales: number
    totalNetSales: number
    newOrdersCount: number
    activeProductsCount: number
    availableBalance: number
  }
  recentOrders: VendorRecentOrder[]
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
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [optimisticStatusMap, setOptimisticStatusMap] = useState<Record<string, FulfilmentStatus>>({})
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const isDismissed = localStorage.getItem(`onboarding_dismissed_${shop?.id}`)
      if (isDismissed === 'true') {
        setDismissed(true)
      }
    } catch {}
  }, [shop?.id])

  const handleDismissOnboarding = () => {
    setDismissed(true)
    try {
      localStorage.setItem(`onboarding_dismissed_${shop?.id}`, 'true')
    } catch {}
  }

  // Gabungkan data pesanan terbaru dari server dengan status pemenuhan optimistik lokal
  const ordersList = useMemo(() => {
    return recentOrders.map((ord) => ({
      ...ord,
      fulfilmentStatus: optimisticStatusMap[ord.id] || ord.fulfilmentStatus,
    }))
  }, [recentOrders, optimisticStatusMap])

  const handleProcessOrder = async (e: React.MouseEvent, itemId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setProcessingId(itemId)
    try {
      const res = await updateVendorFulfilmentAction(itemId, 'processing')
      if (res.success) {
        toast.success('Pesanan berhasil diterima (Status: Sedang Dikemas)!')
        setOptimisticStatusMap((prev) => ({
          ...prev,
          [itemId]: 'processing',
        }))
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal memproses pesanan')
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses pesanan')
    } finally {
      setProcessingId(null)
    }
  }

  const handleRejectOrder = async (e: React.MouseEvent, itemId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const confirmed = window.confirm('Apakah Anda yakin ingin menolak pesanan ini?')
    if (!confirmed) return

    setProcessingId(itemId)
    try {
      const res = await updateVendorFulfilmentAction(itemId, 'cancelled')
      if (res.success) {
        toast.success('Pesanan telah ditolak')
        setOptimisticStatusMap((prev) => ({
          ...prev,
          [itemId]: 'cancelled',
        }))
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal menolak pesanan')
      }
    } catch {
      toast.error('Terjadi kesalahan saat memproses pesanan')
    } finally {
      setProcessingId(null)
    }
  }

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
    } else if (days.length <= 1) {
      // Periode 1 hari (Hari Ini / Kemarin): Bagi menjadi 6 slot waktu agar kurva grafik terbentuk rapi
      const singleDay = days[0] || from
      const timeSlots = [
        { label: '00:00', startH: 0, endH: 4 },
        { label: '04:00', startH: 4, endH: 8 },
        { label: '08:00', startH: 8, endH: 12 },
        { label: '12:00', startH: 12, endH: 16 },
        { label: '16:00', startH: 16, endH: 20 },
        { label: '20:00', startH: 20, endH: 24 },
      ]

      chart = timeSlots.map((slot) => {
        const slotSales = inRange.filter((s) => {
          const d = new Date(s.createdAt)
          if (!isSameDay(d, singleDay)) return false
          const hour = d.getHours()
          return hour >= slot.startH && hour < slot.endH
        })
        const salesSum = slotSales.reduce((acc, s) => acc + s.amount, 0)
        return {
          date: slot.label,
          sales: salesSum,
          orders: slotSales.length,
        }
      })
    } else {
      // Agregasi harian untuk rentang 2 - 62 hari (7 Hari, 30 Hari, Bulan Ini, dsb)
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
  
        </div>

        {/* Filter Rentang Tanggal Shadcn UI Popover / Dropdown Menu */}
        <div className="flex items-center gap-2">
          <DashboardDateFilter value={period} onChange={setPeriod} />
        </div>
      </div>

      {/* 2. CHECKLIST ONBOARDING PROGRESS */}
      {completedCount < 4 && !dismissed && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-primary/5 border border-[#00a699]/30 space-y-4 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">
              <Sparkles className="w-4 h-4 text-[#00a699]" />
              <span>Lengkapi Profil Toko Anda</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#00a699]">{progressPercent}%</span>
              <button
                type="button"
                onClick={handleDismissOnboarding}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors cursor-pointer"
                title="Tutup checklist onboarding"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
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
         
          </div>
        </Link>
      </div>

      {/* 4. SALES CHART (SINKRON DENGAN PERIODE, FILTER 7/14/30 HARI DIHAPUS) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs w-full max-w-full min-w-0 overflow-hidden">
        <SalesChart data={filteredChartData} periodLabel={period.label} />
      </div>

      {/* 5. KARTU PESANAN BARU (INFORMASI LENGKAP: PRODUK, TOTAL HARGA, STATUS, NAMA PEMBELI, JUMLAH, TIME-AGO, AKSI PROSES) */}
      <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4 w-full max-w-full min-w-0">
        {/* Header Card */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#00a699]" />
            <h2 className="text-sm sm:text-base font-bold text-foreground">Pesanan Baru</h2>
            <span className="text-muted-foreground/50 text-xs font-normal">
              {ordersList.slice(0, 5).length}
            </span>
          </div>
          <Link
            href="/vendor/orders"
            className="text-xs font-medium text-muted-foreground hover:text-[#00a699] inline-flex items-center gap-1 transition-colors"
          >
            <span>Semua →</span>
          </Link>
        </div>

        {ordersList.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/30" />
            <p>Belum ada pesanan masuk untuk toko Anda.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {ordersList.slice(0, 5).map((ord) => {
              const isPhysical = ord.productType === 'physical'
              const rawCourier = ord.shippingAddress?.courier || ord.shippingAddress?.courier_name || ''
              const courierName = !rawCourier
                ? 'Diantar Kurir'
                : rawCourier.toLowerCase().startsWith('diantar')
                ? rawCourier
                : `Diantar ${rawCourier}`

              const displayCode =
                !ord.orderCode || ord.orderCode === '-'
                  ? '-'
                  : ord.orderCode.startsWith('#')
                  ? ord.orderCode
                  : `#${ord.orderCode}`

              const orderLink =
                ord.orderCode && ord.orderCode !== '-'
                  ? `/vendor/orders?q=${encodeURIComponent(ord.orderCode)}`
                  : '/vendor/orders'

              return (
                <div
                  key={ord.id}
                  className="py-3.5 space-y-2"
                >
                  {/* Baris Atas: Kode Pesanan + Pill Status (Kiri), Time-Ago (Kanan) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={orderLink}
                        className="font-mono text-xs font-bold text-[#00a699] hover:underline"
                        title={displayCode !== '-' ? `Lihat ${displayCode}` : 'Lihat pesanan'}
                      >
                        {displayCode}
                      </Link>

                      {/* Pill Status Kecil */}
                      {ord.fulfilmentStatus === 'waiting' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>Baru</span>
                        </span>
                      )}
                      {ord.fulfilmentStatus === 'processing' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Package className="w-3 h-3 text-amber-500" />
                          <span>Sedang Dikemas</span>
                        </span>
                      )}
                      {ord.fulfilmentStatus === 'shipped' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          <Truck className="w-3 h-3 text-purple-500" />
                          <span>Dalam Pengiriman</span>
                        </span>
                      )}
                      {ord.fulfilmentStatus === 'completed' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Selesai</span>
                        </span>
                      )}
                      {ord.fulfilmentStatus === 'cancelled' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          <span>Dibatalkan</span>
                        </span>
                      )}
                    </div>

                    <span
                      className="text-[11px] text-muted-foreground/80 font-normal shrink-0"
                      title={ord.createdAt ? new Date(ord.createdAt).toLocaleString('id-ID') : ''}
                      suppressHydrationWarning
                    >
                      {formatTimeAgo(ord.createdAt)}
                    </span>
                  </div>

                  {/* Baris Tengah: Nama Produk & Jumlah (Kiri), Total Harga (Kanan) */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={orderLink}
                        className="hover:underline block"
                      >
                        <h3 className="text-sm font-bold text-foreground truncate" title={ord.title}>
                          {ord.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ord.qty} item
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-bold text-foreground">
                        {formatPrice(ord.totalPrice || ord.itemTotal || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Baris Bawah: Pembeli (Kiri), Badge Kurir + Tombol Aksi (Kanan) */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-0.5">
                    {/* Sisi Kiri: Nama Pembeli */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                      {isPhysical ? (
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                      )}
                      <span className="truncate max-w-[150px] sm:max-w-[220px]" title={ord.buyerName}>
                        {ord.buyerName || 'Pembeli'}
                      </span>
                    </div>

                    {/* Sisi Kanan: Badge Kurir Pengiriman & Tombol Aksi */}
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {/* Badge Kurir */}
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium bg-muted/60 px-2 py-0.5 rounded">
                        {!isPhysical ? (
                          <span>⚡ Digital</span>
                        ) : (
                          <>
                            <Truck className="w-3 h-3 text-muted-foreground" />
                            <span>{courierName}</span>
                          </>
                        )}
                      </span>

                      {/* Tombol Aksi */}
                      {ord.fulfilmentStatus === 'waiting' && (
                        <>
                          <button
                            type="button"
                            disabled={Boolean(processingId)}
                            onClick={(e) => handleRejectOrder(e, ord.id)}
                            className="px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                            title="Tolak pesanan"
                          >
                            Tolak
                          </button>
                          <button
                            type="button"
                            disabled={Boolean(processingId)}
                            onClick={(e) => handleProcessOrder(e, ord.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#00a699] hover:bg-[#008f84] active:scale-95 text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                            title="Terima pesanan (ubah status ke Sedang Dikemas)"
                          >
                            {processingId === ord.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : null}
                            <span>Terima</span>
                          </button>
                        </>
                      )}

                      {ord.fulfilmentStatus === 'processing' && (
                        <Link
                          href={orderLink}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#00a699] hover:bg-[#008f84] active:scale-95 text-white text-xs font-semibold transition-all shadow-2xs"
                          title="Input nomor resi dan kirim pesanan"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Kirim</span>
                        </Link>
                      )}

                      {(ord.fulfilmentStatus === 'shipped' ||
                        ord.fulfilmentStatus === 'completed' ||
                        ord.fulfilmentStatus === 'cancelled') && (
                        <Link
                          href={orderLink}
                          className="px-2.5 py-1 rounded-lg border border-border/80 hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                          title="Buka rincian pesanan"
                        >
                          Detail
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
