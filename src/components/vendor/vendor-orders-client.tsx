'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  Search,
  Loader2,
  ListFilter,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Printer,
  MapPin,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import {
  acceptVendorOrderAction,
  rejectVendorOrderAction,
  updateVendorFulfilmentAction,
  getVendorOrdersAction,
} from '@/actions/vendor'
import { createClient } from '@/lib/supabase/client'
import { formatTimeAgo, formatFullDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { FulfilmentStatus } from '@/types/database'
import {
  VendorShippingModal,
  type ShippingModalOrder,
} from './vendor-shipping-modal'
import { VendorPrintReceiptModal } from './vendor-print-receipt-modal'

interface VendorOrdersClientProps {
  initialOrders: any[]
  initialFilter?: string
  initialSearchQuery?: string
}

const ITEMS_PER_PAGE = 10

export function VendorOrdersClient({
  initialOrders,
  initialFilter = 'all',
  initialSearchQuery = '',
}: VendorOrdersClientProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter)
  const [tempStatusFilter, setTempStatusFilter] = useState<string>(initialFilter)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery)
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // State Dialog Tolak Pesanan
  const [rejectModalOrder, setRejectModalOrder] = useState<any | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // State Dialog Resi Pengiriman & Proses Pengiriman KiriminAja
  const [shippingModalOrder, setShippingModalOrder] = useState<ShippingModalOrder | null>(null)
  const [isShippingSubmitting, setIsShippingSubmitting] = useState(false)
  const [printModalOrder, setPrintModalOrder] = useState<any | null>(null)
  const [activeTrackingModal, setActiveTrackingModal] = useState<{
    itemId: string
    title: string
  } | null>(null)
  const [inputResi, setInputResi] = useState('')

  // Supabase Realtime Subscription untuk sinkronisasi pesanan toko
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('vendor-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        async () => {
          const res = await getVendorOrdersAction('all')
          if (res.success && res.orders) {
            setOrders(res.orders)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const res = await getVendorOrdersAction('all')
          if (res.success && res.orders) {
            setOrders(res.orders)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  // Handler Terima Pesanan (waiting -> processing + Saldo masuk dompet)
  const handleAcceptOrder = async (itemId: string) => {
    setLoadingItemId(itemId)
    try {
      const res = await acceptVendorOrderAction(itemId)
      if (res.success) {
        toast.success(
          res.creditedAmount
            ? `Pesanan diterima! Saldo sebesar ${formatPrice(res.creditedAmount)} telah masuk ke kantong toko Anda.`
            : 'Pesanan berhasil diterima dan siap dikemas.'
        )

        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === itemId
              ? {
                  ...ord,
                  fulfilmentStatus: 'processing' as FulfilmentStatus,
                }
              : ord
          )
        )
      } else {
        toast.error(res.error || 'Gagal menerima pesanan')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setLoadingItemId(null)
    }
  }

  // Handler Tolak Pesanan (waiting -> cancelled + Refund otomatis)
  const handleRejectOrder = async () => {
    if (!rejectModalOrder) return
    const itemId = rejectModalOrder.id
    setLoadingItemId(itemId)
    try {
      const res = await rejectVendorOrderAction(itemId, rejectReason.trim() || undefined)
      if (res.success) {
        toast.success('Pesanan berhasil ditolak. Dana pembeli otomatis diproses refund.')
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === itemId
              ? {
                  ...ord,
                  fulfilmentStatus: 'cancelled' as FulfilmentStatus,
                }
              : ord
          )
        )
        setRejectModalOrder(null)
        setRejectReason('')
      } else {
        toast.error(res.error || 'Gagal menolak pesanan')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setLoadingItemId(null)
    }
  }

  // Handler Update Fulfilment (misal Input Resi)
  const handleUpdateStatus = async (
    itemId: string,
    targetStatus: FulfilmentStatus,
    trackingNumber?: string
  ) => {
    setLoadingItemId(itemId)
    try {
      const res = await updateVendorFulfilmentAction(itemId, targetStatus, trackingNumber)
      if (res.success) {
        toast.success(
          targetStatus === 'processing'
            ? 'Status pesanan berhasil diubah ke: Sedang Dikemas.'
            : targetStatus === 'shipped'
            ? 'Nomor resi disimpan! Status pesanan diubah ke: Dalam Pengiriman.'
            : 'Status pesanan diperbarui.'
        )

        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === itemId
              ? {
                  ...ord,
                  fulfilmentStatus: targetStatus,
                  trackingNumber: trackingNumber || ord.trackingNumber,
                }
              : ord
          )
        )
        setActiveTrackingModal(null)
        setInputResi('')
      } else {
        toast.error(res.error || 'Gagal memperbarui status pengiriman')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setLoadingItemId(null)
    }
  }

  // Handler Proses Pengiriman (Step 2 Modal KiriminAja -> Shipped)
  const handleProcessShipping = async (
    itemId: string,
    trackingNumber: string,
    shippingInfo: {
      serviceName: string
      serviceCode: string
      shortName: string
      shippingCost: number
      weight: number
      schedule: string
    }
  ) => {
    setIsShippingSubmitting(true)
    try {
      const chosenCourier = shippingInfo.shortName || shippingInfo.serviceName
      const res = await updateVendorFulfilmentAction(itemId, 'shipped', trackingNumber, chosenCourier)
      if (res.success) {
        toast.success(
          `Pengiriman berhasil diproses! Resi: ${trackingNumber} (${chosenCourier}).`
        )
        setOrders((prev) =>
          prev.map((ord) =>
            ord.id === itemId
              ? {
                  ...ord,
                  fulfilmentStatus: 'shipped' as FulfilmentStatus,
                  trackingNumber,
                  shippingAddress: {
                    ...(ord.shippingAddress || {}),
                    courier: chosenCourier,
                    courier_name: chosenCourier,
                    shippingService: chosenCourier,
                  },
                }
              : ord
          )
        )
        setShippingModalOrder(null)
      } else {
        toast.error(res.error || 'Gagal memproses pengiriman')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setIsShippingSubmitting(false)
    }
  }

  // Hitung jumlah per status dari orders (data lengkap toko)
  const counts = useMemo(() => {
    const res = {
      all: orders.length,
      waiting: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
    }
    for (const ord of orders) {
      if (ord.fulfilmentStatus === 'waiting') res.waiting++
      else if (ord.fulfilmentStatus === 'processing') res.processing++
      else if (ord.fulfilmentStatus === 'shipped') res.shipped++
      else if (ord.fulfilmentStatus === 'completed') res.completed++
      else if (ord.fulfilmentStatus === 'cancelled') res.cancelled++
    }
    return res
  }, [orders])

  const STATUS_OPTIONS = [
    { id: 'all', label: 'Semua', count: counts.all },
    { id: 'waiting', label: 'Belum Diproses', count: counts.waiting },
    { id: 'processing', label: 'Sedang Dikemas', count: counts.processing },
    { id: 'shipped', label: 'Dalam Pengiriman', count: counts.shipped },
    { id: 'completed', label: 'Selesai', count: counts.completed },
    { id: 'cancelled', label: 'Dibatalkan', count: counts.cancelled },
  ]

  // Filter Data berdasarkan status dan kata kunci
  const filtered = useMemo(() => {
    return orders.filter((ord) => {
      const matchesStatus = statusFilter === 'all' || ord.fulfilmentStatus === statusFilter
      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchesStatus

      const cleanQuery = query.replace(/^#/, '')
      const code = (ord.orderCode || '').toLowerCase()
      const invoice = (ord.invoiceNumber || '').toLowerCase()
      const title = (ord.title || '').toLowerCase()
      const buyerName = (ord.buyer?.name || '').toLowerCase()
      const tracking = (ord.trackingNumber || '').toLowerCase()

      const matchesSearch =
        code.includes(query) ||
        code.includes(cleanQuery) ||
        invoice.includes(query) ||
        title.includes(query) ||
        buyerName.includes(query) ||
        tracking.includes(query)

      return matchesStatus && matchesSearch
    })
  }, [orders, statusFilter, searchQuery])

  // Pagination client-side (10 item per halaman)
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // Helper badge metode pengiriman
  const getShippingBadge = (ord: any) => {
    if (ord.productType === 'digital') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800 whitespace-nowrap shadow-2xs">
          ⚡ Digital
        </span>
      )
    }

    const rawCourier =
      ord.shippingAddress?.courier ||
      ord.shippingAddress?.courier_name ||
      ord.shippingAddress?.shippingService ||
      'JNE'

    const isPickup =
      rawCourier.toLowerCase().includes('pickup') ||
      rawCourier.toLowerCase().includes('ambil') ||
      ord.shippingAddress?.delivery_method === 'pickup'

    const distance = ord.shippingAddress?.distance ? ` · ${ord.shippingAddress.distance}` : ''

    if (isPickup) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800 whitespace-nowrap shadow-2xs">
          <Package className="w-3.5 h-3.5" />
          <span>Ambil Sendiri{distance}</span>
        </span>
      )
    }

    // Singkat nama layanan kurir agar enak dibaca
    const formatShortCourier = (str: string) => {
      const cleaned = str.replace(/^(Diantar Kurir\s*[-·:]\s*)/i, '').trim()
      const lower = cleaned.toLowerCase()

      if (lower.includes('anteraja') && (lower.includes('next') || lower.includes('nd'))) {
        return 'AnterAja ND'
      }
      if (lower.includes('anteraja') && (lower.includes('reg') || lower.includes('regular'))) {
        return 'AnterAja Reg'
      }
      if (lower.includes('anteraja')) {
        return 'AnterAja'
      }
      if (lower.includes('jtcargo') || lower.includes('j&t cargo')) {
        return 'J&T Cargo'
      }
      if (lower.includes('j&t') || lower.includes('jnt')) {
        return lower.includes('ez') ? 'J&T EZ' : 'J&T'
      }
      if (lower.includes('sicepat')) {
        return 'SiCepat'
      }
      if (lower.includes('jne')) {
        return 'JNE'
      }
      if (lower.includes('idx')) {
        return 'idx'
      }
      return cleaned
    }

    const shortCourier = formatShortCourier(rawCourier)

    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800 whitespace-nowrap shadow-2xs">
        <Truck className="w-3.5 h-3.5 shrink-0" />
        <span>Diantar Kurir - {shortCourier}</span>
      </span>
    )
  }

  // Helper status badge pemenuhan pesanan
  const getStatusBadge = (status: FulfilmentStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Selesai
          </span>
        )
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800 whitespace-nowrap shadow-2xs">
            <Truck className="w-3.5 h-3.5 shrink-0" /> Dikirim
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap shadow-2xs">
            <Package className="w-3.5 h-3.5 shrink-0" /> Sedang Dikemas
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800 whitespace-nowrap shadow-2xs">
            <X className="w-3.5 h-3.5 shrink-0" /> Dibatalkan
          </span>
        )
      case 'waiting':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap shadow-2xs">
            <Clock className="w-3.5 h-3.5 shrink-0" /> Belum Diproses
          </span>
        )
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 1. Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Pesanan
          </h1>
        </div>

        {/* 2. Search Bar & Tombol Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 min-w-0">
            {/* Kolom Pencarian */}
            <div className="relative flex-1 min-w-0 max-w-md">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                placeholder="Cari no. invoice, pembeli, atau produk..."
                className="w-full h-10 pl-10 pr-4 text-xs bg-card border border-border/80 rounded-xl focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699] transition-all placeholder:text-muted-foreground text-foreground shadow-xs truncate"
              />
            </div>

            {/* Tombol Filter di Mobile tepat di sebelah kolom pencarian */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTempStatusFilter(statusFilter)
                setIsFilterModalOpen(true)
              }}
              className={`h-10 px-3.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer transition-all ${
                statusFilter !== 'all'
                  ? 'bg-[#00a699]/10 border-[#00a699] text-[#00a699] hover:bg-[#00a699]/20'
                  : 'bg-card border-border/80 hover:bg-muted text-foreground'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>Filter</span>
              {statusFilter !== 'all' && (
                <span className="w-2 h-2 rounded-full bg-[#00a699]" />
              )}
            </Button>
          </div>

          {/* Badge Filter Aktif */}
          {statusFilter !== 'all' && (
            <div className="flex items-center gap-1.5 bg-[#00a699]/10 border border-[#00a699]/30 text-[#00a699] px-2.5 py-1.5 rounded-xl text-xs font-semibold self-start sm:self-auto">
              <span>{STATUS_OPTIONS.find((o) => o.id === statusFilter)?.label}</span>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all')
                  setCurrentPage(1)
                }}
                className="hover:text-rose-500 cursor-pointer ml-0.5"
                aria-label="Hapus Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* 3. Tampilan Halaman Berupa Tabel Data (Tanpa Digeser / Muat Penuh) */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
            <ShoppingBag className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">Tidak Ada Pesanan</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'all'
                  ? 'Tidak ada pesanan yang sesuai dengan filter atau kata kunci pencarian.'
                  : 'Belum ada pesanan untuk toko Anda saat ini.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 w-full min-w-0">
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs w-full max-w-full min-w-0">
              <div className="w-full max-w-full min-w-0 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[1020px] h-auto">
                  {/* Header Tabel Responsif (Sesuai Referensi Gambar) */}
                  <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border/80">
                    <tr>
                      <th className="py-4 px-4 w-[13%]">Pesanan</th>
                      <th className="py-4 px-4 w-[24%]">Produk</th>
                      <th className="py-4 px-4 w-[14%]">Pembeli</th>
                      <th className="py-4 px-4 w-[16%]">Pengiriman</th>
                      <th className="py-4 px-4 w-[11%]">Total</th>
                      <th className="py-4 px-3 w-[11%] text-center">Status</th>
                      <th className="py-4 px-3 w-[11%] text-center">Aksi</th>
                      <th className="py-4 px-4 w-[12%] text-right whitespace-nowrap">Waktu Pesanan</th>
                    </tr>
                  </thead>

                  {/* Body Tabel: Flexible height, tidak ada teks terpotong */}
                  <tbody className="divide-y divide-border/60">
                    {paginatedOrders.map((ord) => {
                      const coverImage = ord.imageUrl || '/placeholder-product.jpg'
                      const targetDetailId = ord.orderId || ord.id
                      const displayInvoice = ord.invoiceNumber || ord.orderCode || '-'

                      return (
                        <tr
                          key={ord.id}
                          onClick={() => router.push(`/vendor/orders/${targetDetailId}`)}
                          className="hover:bg-muted/40 transition-colors cursor-pointer group"
                        >
                          {/* 1. Pesanan (Nomor Invoice Klik Langsung Redirect ke Track / Detail) */}
                          <td className="py-5 px-4 align-middle">
                            <Link
                              href={`/vendor/orders/${targetDetailId}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-mono font-bold text-xs text-[#00a699] hover:underline hover:text-[#008f84] transition-colors block"
                            >
                              {displayInvoice}
                            </Link>
                          </td>

                          {/* 2. Produk (Thumbnail + Nama Produk + Jumlah Barang - Flexible Height, Tanpa Terpotong) */}
                          <td className="py-5 px-4 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-muted shrink-0 border border-border shadow-2xs">
                                <Image
                                  src={coverImage}
                                  alt={ord.title}
                                  fill
                                  sizes="44px"
                                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                              </div>
                              <div className="space-y-1">
                                <p className="font-bold text-foreground text-xs leading-snug break-words group-hover:text-[#00a699] transition-colors">
                                  {ord.title}
                                </p>
                                <span className="text-[11px] text-muted-foreground block">
                                  {ord.qty} Barang
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 3. Pembeli (Hanya Nama Akun Tanpa Avatar, Klik Redirect ke Halaman Profil Pembeli) */}
                          <td className="py-5 px-4 align-middle" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/vendor/orders/${targetDetailId}/buyer`}
                              className="font-semibold text-foreground text-xs hover:text-[#00a699] transition-colors block leading-snug cursor-pointer"
                            >
                              {ord.buyer?.name || 'Pelanggan'}
                            </Link>
                          </td>

                          {/* 4. Pengiriman (Badge kurir / Digital Lengkap Tanpa Terpotong) */}
                          <td className="py-5 px-4 align-middle">
                            {getShippingBadge(ord)}
                          </td>

                          {/* 5. Total (Harga total & jumlah barang) */}
                          <td className="py-5 px-4 align-middle">
                            <div className="space-y-0.5">
                              <span className="font-bold text-foreground text-xs block">
                                {formatPrice(ord.price * ord.qty)}
                              </span>
                              <span className="text-[11px] text-muted-foreground block">
                                {ord.qty} Barang
                              </span>
                            </div>
                          </td>

                          {/* 6. Status (Badge pill) */}
                          <td className="py-5 px-3 text-center align-middle">
                            <div className="flex justify-center">
                              {getStatusBadge(ord.fulfilmentStatus)}
                            </div>
                          </td>

                          {/* 7. Aksi (Tolak/Terima saat waiting, Proses saat processing, Tracking saat shipped/selesai) */}
                          <td
                            className="py-5 px-3 text-center align-middle"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* Alur Pesanan Baru (WAITING): Tombol Tolak & Terima */}
                              {ord.fulfilmentStatus === 'waiting' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={loadingItemId === ord.id}
                                    onClick={() => {
                                      setRejectModalOrder(ord)
                                      setRejectReason('')
                                    }}
                                    className="h-7.5 px-2.5 text-xs font-semibold border-rose-300 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer rounded-lg shrink-0 transition-colors shadow-2xs"
                                  >
                                    Tolak
                                  </Button>

                                  <Button
                                    size="sm"
                                    disabled={loadingItemId === ord.id}
                                    onClick={() => handleAcceptOrder(ord.id)}
                                    className="h-7.5 px-3 text-xs bg-[#00a699] hover:bg-[#008f84] text-white font-bold rounded-lg cursor-pointer shrink-0 transition-colors shadow-2xs"
                                  >
                                    {loadingItemId === ord.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      'Terima'
                                    )}
                                  </Button>
                                </>
                              )}

                              {/* Alur Pesanan Diproses (PROCESSING) */}
                              {ord.fulfilmentStatus === 'processing' && (
                                <>
                                  {ord.productType === 'digital' ? (
                                    <Button
                                      size="sm"
                                      disabled={loadingItemId === ord.id}
                                      onClick={() => handleUpdateStatus(ord.id, 'completed')}
                                      className="h-7.5 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shrink-0"
                                    >
                                      Selesai
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      disabled={loadingItemId === ord.id || isShippingSubmitting}
                                      onClick={() =>
                                        setShippingModalOrder({
                                          id: ord.id,
                                          orderId: ord.orderId,
                                          invoiceNumber: ord.invoiceNumber,
                                          orderCode: ord.orderCode,
                                          title: ord.title,
                                          price: Number(ord.price),
                                          qty: Number(ord.qty),
                                          total: Number(ord.price) * Number(ord.qty),
                                        })
                                      }
                                      className="h-7.5 px-3.5 text-xs bg-[#00a699] hover:bg-[#008f84] text-white font-bold rounded-lg cursor-pointer shrink-0 shadow-2xs transition-colors"
                                    >
                                      Proses
                                    </Button>
                                  )}
                                </>
                              )}

                              {/* Status Dikirim (shipped): Aksi Cetak Resi Saja Sesuai Permintaan */}
                              {ord.fulfilmentStatus === 'shipped' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setPrintModalOrder(ord)}
                                  className="h-7.5 px-2.5 text-xs rounded-lg cursor-pointer hover:bg-muted shrink-0 flex items-center gap-1.5 border-border/80 text-foreground shadow-2xs"
                                >
                                  <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                                  <span>Cetak Resi</span>
                                </Button>
                              )}

                              {/* Status Selesai (completed): Aksi Tracking Saja Sesuai Permintaan */}
                              {ord.fulfilmentStatus === 'completed' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => router.push(`/vendor/orders/${targetDetailId}`)}
                                  className="h-7.5 px-2.5 text-xs rounded-lg cursor-pointer hover:bg-muted shrink-0 flex items-center gap-1.5 border-border/80 text-foreground shadow-2xs"
                                >
                                  <Truck className="w-3.5 h-3.5 text-[#00a699]" />
                                  <span>Tracking</span>
                                </Button>
                              )}

                              {/* Status Tanpa Aksi Tambahan (Dibatalkan atau lainnya) */}
                              {ord.fulfilmentStatus !== 'waiting' &&
                                ord.fulfilmentStatus !== 'processing' &&
                                ord.fulfilmentStatus !== 'shipped' &&
                                ord.fulfilmentStatus !== 'completed' && (
                                  <span className="text-muted-foreground text-xs font-medium">-</span>
                                )}
                            </div>
                          </td>

                          {/* 8. Waktu Pesanan (Kolom posisi paling kanan, time-ago + tooltip waktu lengkap) */}
                          <td className="py-5 px-4 text-right align-middle">
                            <Tooltip>
                              <TooltipTrigger
                                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline decoration-dotted underline-offset-2 transition-colors inline-flex items-center gap-1.5 justify-end"
                              >
                                <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                                <span suppressHydrationWarning>
                                  {formatTimeAgo(ord.orderDate)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" align="end" className="text-xs py-1.5 px-3">
                                {formatFullDate(ord.orderDate)}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View (md:hidden) - Persis Referensi Gambar Desain Mobile */}
            <div className="md:hidden space-y-3.5 w-full">
              {paginatedOrders.map((ord) => {
                const coverImage = ord.imageUrl || '/placeholder-product.jpg'
                const targetDetailId = ord.orderId || ord.id
                const displayInvoice = ord.invoiceNumber || ord.orderCode || '-'
                const buyerName = ord.buyer?.name || 'Pelanggan'

                return (
                  <div
                    key={ord.id}
                    onClick={() => router.push(`/vendor/orders/${targetDetailId}`)}
                    className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-xs hover:border-[#00a699]/40 transition-all cursor-pointer"
                  >
                    {/* Baris 1: No. Invoice (Kiri) & Waktu (Kanan) */}
                    <div className="flex items-center justify-between gap-2">
                      <Link
                        href={`/vendor/orders/${targetDetailId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-mono font-bold text-xs text-[#00a699] hover:underline"
                      >
                        {displayInvoice}
                      </Link>
                      <Tooltip>
                        <TooltipTrigger
                          className="text-[11px] text-muted-foreground whitespace-nowrap cursor-pointer hover:text-foreground transition-colors inline-block"
                          suppressHydrationWarning
                        >
                          {formatTimeAgo(ord.orderDate)}
                        </TooltipTrigger>
                        <TooltipContent side="top" align="end" className="text-xs py-1.5 px-3">
                          {formatFullDate(ord.orderDate)}
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    {/* Baris 2: Foto Produk & Nama Produk & Qty */}
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0 border border-border shadow-2xs">
                        <Image
                          src={coverImage}
                          alt={ord.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <p className="font-bold text-foreground text-xs leading-snug line-clamp-2">
                          {ord.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {ord.qty} Barang
                        </p>
                      </div>
                    </div>

                    {/* Baris 3: Nama Pembeli (Kiri) & Badge Layanan Pengiriman (Kanan) */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50">
                      <div
                        className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0 truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/70" />
                        <Link
                          href={`/vendor/orders/${targetDetailId}/buyer`}
                          className="truncate hover:text-[#00a699] transition-colors"
                        >
                          {buyerName}
                        </Link>
                      </div>
                      <div className="shrink-0">
                        {getShippingBadge(ord)}
                      </div>
                    </div>

                    {/* Baris 4: Status (Kiri) & Total Harga (Kanan) */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div>
                        {getStatusBadge(ord.fulfilmentStatus)}
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-foreground">
                          {formatPrice(ord.price * ord.qty)}
                        </span>
                      </div>
                    </div>

                    {/* Baris 5: Tombol Aksi (Jika Ada Aksi) */}
                    {(ord.fulfilmentStatus === 'waiting' ||
                      ord.fulfilmentStatus === 'processing' ||
                      ord.fulfilmentStatus === 'shipped' ||
                      ord.fulfilmentStatus === 'completed') && (
                      <div
                        className="flex items-center justify-end gap-2 pt-2.5 border-t border-border/40"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Waiting: Tolak & Terima */}
                        {ord.fulfilmentStatus === 'waiting' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={loadingItemId === ord.id}
                              onClick={() => {
                                setRejectModalOrder(ord)
                                setRejectReason('')
                              }}
                              className="h-8 px-3 text-xs font-semibold border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5 mr-1" />
                              Tolak
                            </Button>
                            <Button
                              size="sm"
                              disabled={loadingItemId === ord.id}
                              onClick={() => handleAcceptOrder(ord.id)}
                              className="h-8 px-4 text-xs bg-[#00a699] hover:bg-[#008f84] text-white font-bold rounded-xl cursor-pointer shadow-xs"
                            >
                              {loadingItemId === ord.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              )}
                              Terima
                            </Button>
                          </>
                        )}

                        {/* Processing: Selesai (Digital) / Proses (Physical KiriminAja) */}
                        {ord.fulfilmentStatus === 'processing' && (
                          <>
                            {ord.productType === 'digital' ? (
                              <Button
                                size="sm"
                                disabled={loadingItemId === ord.id}
                                onClick={() => handleUpdateStatus(ord.id, 'completed')}
                                className="h-8 px-4 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                              >
                                Selesai
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={loadingItemId === ord.id || isShippingSubmitting}
                                onClick={() =>
                                  setShippingModalOrder({
                                    id: ord.id,
                                    orderId: ord.orderId,
                                    invoiceNumber: ord.invoiceNumber,
                                    orderCode: ord.orderCode,
                                    title: ord.title,
                                    price: Number(ord.price),
                                    qty: Number(ord.qty),
                                    total: Number(ord.price) * Number(ord.qty),
                                  })
                                }
                                className="h-8 px-4 text-xs bg-[#00a699] hover:bg-[#008f84] text-white font-bold rounded-xl cursor-pointer shadow-xs"
                              >
                                Proses
                              </Button>
                            )}
                          </>
                        )}

                        {/* Shipped: Cetak Resi */}
                        {ord.fulfilmentStatus === 'shipped' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPrintModalOrder(ord)}
                            className="h-8 px-3.5 text-xs rounded-xl cursor-pointer hover:bg-muted flex items-center gap-1.5 border-border/80 text-foreground shadow-xs"
                          >
                            <Printer className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>Cetak Resi</span>
                          </Button>
                        )}

                        {/* Completed: Tracking */}
                        {ord.fulfilmentStatus === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/vendor/orders/${targetDetailId}`)}
                            className="h-8 px-3.5 text-xs rounded-xl cursor-pointer hover:bg-muted flex items-center gap-1.5 border-border/80 text-foreground shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#00a699]" />
                            <span>Tracking</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 4. Footer Tabel: Info Data & Pagination Client-side 10 per halaman */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground pt-2 px-1">
              <div>
                Menampilkan{' '}
                <span className="font-semibold text-foreground">
                  {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                </span>{' '}
                -{' '}
                <span className="font-semibold text-foreground">
                  {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{' '}
                dari <span className="font-semibold text-foreground">{filtered.length}</span> pesanan
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <span className="text-xs text-muted-foreground">
                  Hal <strong className="text-foreground">{currentPage}</strong>/{totalPages}
                </span>

                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-8 w-8 p-0 cursor-pointer rounded-lg disabled:opacity-40"
                    aria-label="Halaman Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-8 w-8 p-0 cursor-pointer rounded-lg disabled:opacity-40"
                    aria-label="Halaman Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DIALOG KONFIRMASI TOLAK PESANAN */}
        {rejectModalOrder && (
          <Dialog
            open={Boolean(rejectModalOrder)}
            onOpenChange={(open) => {
              if (!open) {
                setRejectModalOrder(null)
                setRejectReason('')
              }
            }}
          >
            <DialogContent className="sm:max-w-md p-6 space-y-4">
              <DialogHeader>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  Tolak Pesanan Ini?
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  Pesanan <strong className="text-foreground font-mono">{rejectModalOrder.invoiceNumber || rejectModalOrder.orderCode}</strong>{' '}
                  untuk produk <strong className="text-foreground">{rejectModalOrder.title}</strong> akan dibatalkan, dan pembayaran sebesar{' '}
                  <strong className="text-rose-600 font-bold">{formatPrice(rejectModalOrder.price * rejectModalOrder.qty)}</strong>{' '}
                  akan secara otomatis direfund kembali ke akun pembeli.
                </p>

                <div className="space-y-1.5 pt-1">
                  <label className="font-semibold text-foreground block">
                    Alasan Penolakan (Opsional):
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Contoh: Stok barang habis / Toko sedang libur"
                    className="w-full h-9 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-3 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loadingItemId !== null}
                  onClick={() => {
                    setRejectModalOrder(null)
                    setRejectReason('')
                  }}
                  className="text-xs cursor-pointer h-9 px-4 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  disabled={loadingItemId !== null}
                  onClick={handleRejectOrder}
                  className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer h-9 px-5 rounded-xl shadow-xs"
                >
                  {loadingItemId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  ) : null}
                  Tolak & Refund
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* DIALOG MODAL FILTER PESANAN */}
        <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
          <DialogContent className="sm:max-w-md p-6 space-y-5">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-foreground">
                Filter Pesanan
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <label className="text-xs font-bold text-foreground block">
                Status Pesanan
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => {
                  const isSelected = tempStatusFilter === opt.id
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTempStatusFilter(opt.id)}
                      className={`px-3.5 py-2 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00a699] text-white border-[#00a699] shadow-xs'
                          : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border-border/80'
                      }`}
                    >
                      {opt.label} ({opt.count})
                    </button>
                  )
                })}
              </div>
            </div>

            <DialogFooter className="flex flex-row items-center justify-between sm:justify-between gap-2 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setTempStatusFilter('all')}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer px-2"
              >
                Reset
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="text-xs cursor-pointer h-9 px-4 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setStatusFilter(tempStatusFilter)
                    setCurrentPage(1)
                    setIsFilterModalOpen(false)
                  }}
                  className="text-xs font-bold bg-[#00a699] hover:bg-[#008f84] text-white cursor-pointer h-9 px-5 rounded-xl shadow-xs"
                >
                  Terapkan
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* MODAL INPUT RESI PENGIRIMAN */}
        {activeTrackingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
              <div className="space-y-1">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#00a699]" />
                  Input Nomor Resi Pengiriman
                </h2>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  Produk: {activeTrackingModal.title}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Nomor Resi / Pelacakan Kurir <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={inputResi}
                  onChange={(e) => setInputResi(e.target.value)}
                  placeholder="Contoh: JNE-9876543210 atau SIC-00123"
                  className="w-full h-10 px-3.5 text-xs font-mono font-bold bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
                />
                <p className="text-[11px] text-muted-foreground">
                  Nomor resi ini akan langsung dapat dilacak oleh pembeli di halaman detail pesanan.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTrackingModal(null)
                    setInputResi('')
                  }}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!inputResi.trim() || loadingItemId !== null}
                  onClick={() =>
                    handleUpdateStatus(activeTrackingModal.itemId, 'shipped', inputResi.trim())
                  }
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loadingItemId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Simpan & Tandai Dikirim
                </button>
              </div>
            </div>
          </div>
        )}

      {/* MODAL 2-LANGKAH PROSES PENGIRIMAN (KIRIMINAJA PICKUP) */}
        <VendorShippingModal
          isOpen={Boolean(shippingModalOrder)}
          onClose={() => setShippingModalOrder(null)}
          order={shippingModalOrder}
          onProcessShipping={handleProcessShipping}
          isSubmitting={isShippingSubmitting}
        />

        {/* MODAL CETAK LABEL RESI PENGIRIMAN */}
        <VendorPrintReceiptModal
          isOpen={Boolean(printModalOrder)}
          onClose={() => setPrintModalOrder(null)}
          order={printModalOrder}
        />
      </div>
    </TooltipProvider>
  )
}
