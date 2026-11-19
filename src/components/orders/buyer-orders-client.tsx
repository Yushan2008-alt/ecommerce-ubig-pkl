'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Search,
  X,
  Package,
  Store,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  CreditCard,
  ShoppingBag,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getBuyerOrdersAction, confirmEntireOrderReceivedAction, type BuyerOrder } from '@/actions/order'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-context'
import { Button } from '@/components/ui/button'

interface BuyerOrdersClientProps {
  initialOrders: BuyerOrder[]
}

type TabKey = 'all' | 'unpaid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'refund'

export function BuyerOrdersClient({ initialOrders }: BuyerOrdersClientProps) {
  const router = useRouter()
  const { locale } = useLanguage()
  const [orders, setOrders] = useState<BuyerOrder[]>(initialOrders)
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null)

  // Sinkronisasi otomatis saat data props dari server berubah
  useEffect(() => {
    setOrders(initialOrders)
  }, [initialOrders])

  // Re-fetch function
  const reloadOrders = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true)
    try {
      const res = await getBuyerOrdersAction()
      if (res.success && res.orders) {
        setOrders(res.orders)
      }
    } catch {
      // ignore
    } finally {
      if (showIndicator) setIsRefreshing(false)
    }
  }, [])

  const handleCompleteOrder = async (orderId: string) => {
    setCompletingOrderId(orderId)
    try {
      const res = await confirmEntireOrderReceivedAction(orderId)
      if (res.success) {
        toast.success('Pesanan berhasil diselesaikan!')
        await reloadOrders(false)
      } else {
        toast.error(res.error || 'Gagal menyelesaikan pesanan')
      }
    } catch {
      toast.error('Terjadi kesalahan saat menyelesaikan pesanan')
    } finally {
      setCompletingOrderId(null)
    }
  }

  // Supabase Realtime Subscription + Window Focus + Interval Sync (Sinkronisasi Otomatis Tanpa Reload)
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('buyer-orders-realtime-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          reloadOrders(false)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        () => {
          reloadOrders(false)
        }
      )
      .subscribe()

    // Sinkron saat tab/jendela kembali fokus
    const handleFocus = () => {
      reloadOrders(false)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reloadOrders(false)
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Polling interval lembut (setiap 8 detik) untuk memastikan data selalu sinkron
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        reloadOrders(false)
      }
    }, 8000)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearInterval(intervalId)
    }
  }, [reloadOrders])

  // Hitung jumlah pesanan per tab status
  const counts = useMemo(() => {
    const res: Record<TabKey, number> = {
      all: orders.length,
      unpaid: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
      refund: 0,
    }

    for (const ord of orders) {
      if (ord.computedStatus === 'unpaid') res.unpaid++
      else if (ord.computedStatus === 'waiting' || ord.computedStatus === 'processing') res.processing++
      else if (ord.computedStatus === 'shipped') res.shipped++
      else if (ord.computedStatus === 'completed') res.completed++
      else if (ord.computedStatus === 'cancelled') res.cancelled++
    }

    return res
  }, [orders])

  // Filter pesanan berdasarkan tab dan pencarian
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // 1. Filter Tab
      if (activeTab === 'unpaid' && ord.computedStatus !== 'unpaid') return false
      if (activeTab === 'processing' && ord.computedStatus !== 'processing' && ord.computedStatus !== 'waiting') return false
      if (activeTab === 'shipped' && ord.computedStatus !== 'shipped') return false
      if (activeTab === 'completed' && ord.computedStatus !== 'completed') return false
      if (activeTab === 'cancelled' && ord.computedStatus !== 'cancelled') return false
      if (activeTab === 'refund') return false // Placeholder tab pengembalian barang

      // 2. Filter Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchCode = ord.code.toLowerCase().includes(q)
        const matchProduct = ord.items.some((it) => it.title.toLowerCase().includes(q))
        const matchShop = ord.items.some((it) => it.shopName.toLowerCase().includes(q))
        if (!matchCode && !matchProduct && !matchShop) {
          return false
        }
      }

      return true
    })
  }, [orders, activeTab, searchQuery])

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const TABS: { id: TabKey; label: string; count: number }[] = [
    { id: 'all', label: locale === 'en' ? 'All' : 'Semua', count: counts.all },
    { id: 'unpaid', label: locale === 'en' ? 'Unpaid' : 'Belum Bayar', count: counts.unpaid },
    { id: 'processing', label: locale === 'en' ? 'Processing' : 'Dikemas', count: counts.processing },
    { id: 'shipped', label: locale === 'en' ? 'Shipped' : 'Dikirim', count: counts.shipped },
    { id: 'completed', label: locale === 'en' ? 'Completed' : 'Selesai', count: counts.completed },
    { id: 'cancelled', label: locale === 'en' ? 'Cancelled' : 'Dibatalkan', count: counts.cancelled },
    { id: 'refund', label: locale === 'en' ? 'Return' : 'Pengembalian', count: counts.refund },
  ]

  // Render status badge minimalis tanpa background warna
  const renderStatusBadge = (status: BuyerOrder['computedStatus']) => {
    switch (status) {
      case 'unpaid':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Belum Bayar</span>
          </span>
        )
      case 'waiting':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Diterima</span>
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-500">
            <Package className="w-3.5 h-3.5" />
            <span>Dikemas</span>
          </span>
        )
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00a699]">
            <Truck className="w-3.5 h-3.5" />
            <span>Dikirim</span>
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Selesai</span>
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500">
            <XCircle className="w-3.5 h-3.5" />
            <span>Dibatalkan</span>
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-[75vh] py-6 sm:py-10 bg-slate-50/40 dark:bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Judul Halaman */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {locale === 'en' ? 'My Orders' : 'Pesanan Saya'}
            </h1>
         
          </div>
        </div>

        {/* 1. STATUS TABS: Penuhi lebar secara merata (Grid 7 Kolom di Desktop, Scroll Responsif di Mobile) */}
        <div className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden mb-5">
          <div className="w-full flex md:grid md:grid-cols-7 border-b border-border/80 overflow-x-auto md:overflow-x-visible no-scrollbar scroll-smooth">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 md:flex-initial min-w-[100px] md:min-w-0 w-full py-3.5 px-1 sm:px-2 md:px-1 lg:px-2.5 text-xs lg:text-sm font-semibold whitespace-nowrap transition-colors flex items-center justify-center gap-1 cursor-pointer text-center ${
                    isActive
                      ? 'text-[#00a699] font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground ml-0.5">
                      ({tab.count})
                    </span>
                  )}

                  {/* Garis Bawah Aktif (Teal Krafita) - Menutupi bawah per kolom tab secara presisi */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a699] rounded-t-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* 2. SEARCH BAR (Sesuai Referensi Gambar) */}
          <div className="p-3.5 sm:p-4 bg-muted/20 border-b border-border/60">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-muted-foreground/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === 'en' ? 'Search Your Orders' : 'Cari Pesanan Anda'}
                className="w-full h-10 pl-10 pr-9 text-xs sm:text-sm bg-background border border-border/80 rounded-xl focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]/30 transition-all placeholder:text-muted-foreground/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 3. KONTEN PESANAN (EMPTY STATE ATAU TABEL PESANAN) */}
          {filteredOrders.length === 0 ? (
            /* EMPTY STATE: Sesuai Referensi Gambar */
            <div className="py-16 sm:py-24 px-4 text-center flex flex-col items-center justify-center">
              {/* Ilustrasi Clipboard Minimalis Sesuai Gambar */}
              <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#00a699]/10 flex items-center justify-center">
                  <div className="w-14 h-16 rounded-lg bg-card border-2 border-[#00a699]/40 shadow-sm relative flex flex-col items-center pt-2">
                    {/* Klip Papan */}
                    <div className="w-6 h-2 rounded-t-sm bg-[#00a699] absolute -top-2" />
                    {/* Garis Isi Papan */}
                    <div className="w-8 h-1 bg-muted-foreground/20 rounded-full mb-1.5" />
                    <div className="w-8 h-1 bg-muted-foreground/20 rounded-full mb-1.5" />
                    <div className="w-6 h-1 bg-muted-foreground/20 rounded-full self-start ml-3" />
                  </div>
                </div>
                {/* Aksen Dot Dekoratif */}
                <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400" />
                <div className="absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-[#00a699]" />
                <div className="absolute bottom-1 right-3 w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>

              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Belum ada pesanan
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-6">
                {searchQuery
                  ? 'Tidak ada pesanan yang sesuai'
                  : 'Anda belum memiliki pesanan'}
              </p>

              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Mulai Belanja</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {/* DESKTOP VIEW: TABEL PROFESIONAL & MINIMALIS */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3 px-5">Pesanan</th>
                      <th className="py-3 px-5">Produk</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-5 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs">
                    {filteredOrders.map((ord) => {
                      const firstItem = ord.items[0]
                      const totalItems = ord.items.reduce((acc, i) => acc + i.qty, 0)
                      const otherItemsCount = ord.items.length - 1

                      return (
                        <tr
                          key={ord.id}
                          onClick={() => router.push(`/orders/${ord.id}`)}
                          className="hover:bg-muted/30 transition-colors cursor-pointer group"
                        >
                          {/* 1. Pesanan & Toko */}
                          <td className="py-4 px-5 align-top">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1.5 text-foreground font-bold">
                                <Store className="w-3.5 h-3.5 text-[#00a699] shrink-0" />
                                <span className="truncate max-w-[170px]">{firstItem?.shopName || 'Toko Krafita'}</span>
                              </div>
                              <span className="font-mono text-xs font-semibold text-[#00a699] group-hover:underline block">
                                {ord.code}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                <Clock className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                                <span>{formatDate(ord.createdAt)}</span>
                              </div>
                            </div>
                          </td>

                          {/* 2. Produk */}
                          <td className="py-4 px-5 align-top">
                            <div className="flex items-start gap-3">
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0 border border-border shadow-2xs">
                                {firstItem?.imageUrl ? (
                                  <Image
                                    src={firstItem.imageUrl}
                                    alt={firstItem.title}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                    <Package className="w-5 h-5 text-muted-foreground/40" />
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1 min-w-0">
                                <p className="font-bold text-foreground line-clamp-2 leading-snug group-hover:text-[#00a699] transition-colors">
                                  {firstItem?.title || 'Produk Pesanan'}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                                  <span>{firstItem?.qty || 1}x barang</span>
                                  <span>•</span>
                                  <span className="font-semibold text-foreground">
                                    {formatPrice(firstItem?.price || 0)}
                                  </span>
                                  {otherItemsCount > 0 && (
                                    <span className="bg-muted px-1.5 py-0.2 rounded text-[10px] text-muted-foreground font-medium">
                                      +{otherItemsCount} produk lainnya
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 3. Total Belanja */}
                          <td className="py-4 px-4 align-top whitespace-nowrap">
                            <div className="space-y-0.5">
                              <span className="text-sm font-bold text-foreground block">
                                {formatPrice(ord.total)}
                              </span>
                              <span className="text-[11px] text-muted-foreground block">
                                {totalItems} total barang
                              </span>
                            </div>
                          </td>

                          {/* 4. Status */}
                          <td className="py-4 px-4 align-top text-center whitespace-nowrap">
                            {renderStatusBadge(ord.computedStatus)}
                          </td>

                          {/* 5. Aksi */}
                          <td className="py-4 px-5 align-top text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {ord.computedStatus === 'unpaid' ? (
                                <Link
                                  href={`/orders/${ord.id}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-2xs"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Bayar</span>
                                </Link>
                              ) : ord.computedStatus === 'shipped' ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    disabled={completingOrderId === ord.id}
                                    onClick={() => handleCompleteOrder(ord.id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                                    title="Konfirmasi bahwa barang telah diterima dan selesaikan pesanan"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{completingOrderId === ord.id ? 'Memproses...' : 'Selesai'}</span>
                                  </button>
                                  <Link
                                    href={`/orders/${ord.id}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/80 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                                  >
                                    <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                                    <span>Lacak</span>
                                  </Link>
                                </div>
                              ) : (
                                <Link
                                  href={`/orders/${ord.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/80 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                                >
                                  <span>Detail</span>
                                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE VIEW: KARTU PESANAN RESPONSIF (MOBILE-FRIENDLY) */}
              <div className="md:hidden divide-y divide-border/60">
                {filteredOrders.map((ord) => {
                  const firstItem = ord.items[0]
                  const otherItemsCount = ord.items.length - 1
                  const totalItems = ord.items.reduce((acc, i) => acc + i.qty, 0)

                  return (
                    <div
                      key={ord.id}
                      onClick={() => router.push(`/orders/${ord.id}`)}
                      className="p-4 space-y-3 hover:bg-muted/20 active:bg-muted/40 transition-colors cursor-pointer"
                    >
                      {/* Baris Atas: Toko & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Store className="w-3.5 h-3.5 text-[#00a699] shrink-0" />
                          <span className="font-bold text-xs text-foreground truncate">
                            {firstItem?.shopName || 'Toko Krafita'}
                          </span>
                        </div>
                        {renderStatusBadge(ord.computedStatus)}
                      </div>

                      {/* Baris Tengah: Info Produk */}
                      <div className="flex items-start gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0 border border-border shadow-2xs">
                          {firstItem?.imageUrl ? (
                            <Image
                              src={firstItem.imageUrl}
                              alt={firstItem.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                              <Package className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-bold text-xs text-foreground line-clamp-2 leading-snug">
                            {firstItem?.title || 'Produk Pesanan'}
                          </p>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>{firstItem?.qty || 1}x barang</span>
                            <span className="font-semibold text-foreground">
                              {formatPrice(firstItem?.price || 0)}
                            </span>
                          </div>
                          {otherItemsCount > 0 && (
                            <p className="text-[10px] text-muted-foreground">
                              +{otherItemsCount} produk lainnya
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Baris Bawah: Total & Tombol Aksi */}
                      <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] text-muted-foreground">
                            Total {totalItems} Barang
                          </p>
                          <p className="text-xs sm:text-sm font-extrabold text-[#00a699]">
                            {formatPrice(ord.total)}
                          </p>
                        </div>

                        <div onClick={(e) => e.stopPropagation()}>
                          {ord.computedStatus === 'unpaid' ? (
                            <Link
                              href={`/orders/${ord.id}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-2xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Bayar</span>
                            </Link>
                          ) : ord.computedStatus === 'shipped' ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={completingOrderId === ord.id}
                                onClick={() => handleCompleteOrder(ord.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{completingOrderId === ord.id ? '...' : 'Selesai'}</span>
                              </button>
                              <Link
                                href={`/orders/${ord.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border/80 hover:bg-muted text-xs font-medium text-foreground transition-colors"
                              >
                                <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>Lacak</span>
                              </Link>
                            </div>
                          ) : (
                            <Link
                              href={`/orders/${ord.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border/80 hover:bg-muted text-xs font-semibold text-foreground transition-colors"
                            >
                              <span>Lihat Rincian</span>
                              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
