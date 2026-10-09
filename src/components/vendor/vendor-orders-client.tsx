'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  MessageSquare,
  Search,
  Loader2,
  Copy,
} from 'lucide-react'
import { updateVendorFulfilmentAction, getVendorOrdersAction } from '@/actions/vendor'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { FulfilmentStatus } from '@/types/database'

interface VendorOrdersClientProps {
  initialOrders: any[]
}

export function VendorOrdersClient({ initialOrders }: VendorOrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)

  // Supabase Realtime Subscription untuk pesanan masuk toko
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('vendor-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        async () => {
          const res = await getVendorOrdersAction(statusFilter)
          if (res.success && res.orders) {
            setOrders(res.orders)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        async () => {
          const res = await getVendorOrdersAction(statusFilter)
          if (res.success && res.orders) {
            setOrders(res.orders)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [statusFilter])

  // State Dialog Resi Pengiriman
  const [activeTrackingModal, setActiveTrackingModal] = useState<{
    itemId: string
    title: string
  } | null>(null)
  const [inputResi, setInputResi] = useState('')

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

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

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi)
    toast.success('Nomor resi disalin ke papan klip!')
  }

  // Filter Data
  const filtered = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'all' || ord.fulfilmentStatus === statusFilter
    const matchesSearch =
      ord.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.buyer?.name && ord.buyer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesStatus && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Pesanan Masuk
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Kelola pesanan masuk toko Anda, proses kemasan, dan input nomor resi pengiriman ({orders.length} pesanan).
          </p>
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'waiting', label: 'Menunggu Dikemas' },
            { id: 'processing', label: 'Sedang Dikemas' },
            { id: 'shipped', label: 'Dikirim' },
            { id: 'completed', label: 'Selesai' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#00a699] text-white shadow-xs'
                  : 'bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kode pesanan / resi / pembeli..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
          />
        </div>
      </div>

      {/* 3. Orders List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-card border border-border space-y-3">
          <ShoppingBag className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Tidak Ada Pesanan</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Tidak ada pesanan yang sesuai dengan filter atau kata kunci pencarian.'
                : 'Belum ada pesanan masuk untuk toko Anda saat ini.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ord) => {
            const isPhysical = ord.productType === 'physical'
            const coverImage = ord.imageUrl || '/placeholder-product.jpg'
            const shipping = ord.shippingAddress || {}

            return (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border transition-all space-y-4"
              >
                {/* Header Card: Kode Order, Tanggal, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border">
                      {ord.orderCode}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(ord.orderDate).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      ord.fulfilmentStatus === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : ord.fulfilmentStatus === 'shipped'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                        : ord.fulfilmentStatus === 'processing'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {ord.fulfilmentStatus === 'waiting' && (
                      <>
                        <Clock className="w-3.5 h-3.5" /> Menunggu Dikemas
                      </>
                    )}
                    {ord.fulfilmentStatus === 'processing' && (
                      <>
                        <Package className="w-3.5 h-3.5" /> Sedang Dikemas
                      </>
                    )}
                    {ord.fulfilmentStatus === 'shipped' && (
                      <>
                        <Truck className="w-3.5 h-3.5" /> Sedang Dikirim
                      </>
                    )}
                    {ord.fulfilmentStatus === 'completed' && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                      </>
                    )}
                  </span>
                </div>

                {/* Konten Utama Pesanan: Produk & Rincian Finansial */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Info Barang (Col 1-7) */}
                  <div className="md:col-span-7 flex items-start gap-3.5 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                      <Image
                        src={coverImage}
                        alt={ord.title}
                        fill
                        sizes="64px"
                        className="object-cover object-center"
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPhysical
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                              : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                          }`}
                        >
                          {isPhysical ? 'Fisik' : 'Digital'}
                        </span>
                        <h2 className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {ord.title}
                        </h2>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {ord.qty} x {formatPrice(ord.price)} ={' '}
                        <strong className="text-foreground">{formatPrice(ord.price * ord.qty)}</strong>
                      </p>

                      {/* Catatan Pembeli jika ada */}
                      {ord.buyerNote && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5 mt-1.5">
                          <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                          <span>
                            <strong>Catatan Pembeli:</strong> {ord.buyerNote}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Pembeli & Alamat (Col 8-12) */}
                  <div className="md:col-span-5 p-3 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground">Pembeli:</span>
                      <span className="font-bold text-foreground">
                        {ord.buyer?.name || 'Pelanggan'}
                      </span>
                    </div>

                    {isPhysical && (
                      <div className="space-y-0.5 pt-1 border-t border-border/40 text-[11px]">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#00a699]" /> Alamat Pengiriman:
                        </span>
                        <p className="text-foreground leading-snug">
                          {shipping.recipientName || 'Penerima'} ({shipping.phone || '-'})
                          <br />
                          {shipping.addressLine || '-'}, {shipping.city || ''} {shipping.province || ''}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
                      <span className="text-muted-foreground">Pendapatan Bersih Toko:</span>
                      <span className="font-extrabold text-[#00a699]">
                        {formatPrice(ord.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Resi & Action Buttons */}
                <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Resi Kurir */}
                  <div>
                    {ord.trackingNumber ? (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">No. Resi Pengiriman:</span>
                        <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
                          {ord.trackingNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyResi(ord.trackingNumber)}
                          className="text-[#00a699] hover:underline cursor-pointer"
                          title="Salin Resi"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        {isPhysical
                          ? 'Belum ada nomor resi pengiriman yang dimasukkan.'
                          : 'Produk digital terkirim instan ke halaman My Downloads pembeli.'}
                      </span>
                    )}
                  </div>

                  {/* Tombol Aksi Fulfilment */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {/* Kemas Pesanan (waiting -> processing) */}
                    {ord.fulfilmentStatus === 'waiting' && isPhysical && (
                      <button
                        type="button"
                        disabled={loadingItemId === ord.id}
                        onClick={() => handleUpdateStatus(ord.id, 'processing')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                      >
                        {loadingItemId === ord.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Package className="w-3.5 h-3.5" />
                        )}
                        Kemas Pesanan
                      </button>
                    )}

                    {/* Kirim Pesanan & Input Resi (processing/waiting -> shipped) */}
                    {(ord.fulfilmentStatus === 'processing' ||
                      (ord.fulfilmentStatus === 'waiting' && isPhysical)) && (
                      <button
                        type="button"
                        disabled={loadingItemId === ord.id}
                        onClick={() =>
                          setActiveTrackingModal({ itemId: ord.id, title: ord.title })
                        }
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Input Resi & Kirim
                      </button>
                    )}

                    {ord.fulfilmentStatus === 'shipped' && (
                      <span className="text-xs text-muted-foreground italic">
                        Menunggu konfirmasi penerimaan pembeli...
                      </span>
                    )}

                    {ord.fulfilmentStatus === 'completed' && (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Transaksi Selesai
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

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
                className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted"
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
    </div>
  )
}
