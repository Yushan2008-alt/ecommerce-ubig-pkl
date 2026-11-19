'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  MessageSquare,
  Copy,
  Loader2,
  ShieldCheck,
  User,
  Calendar,
  Printer,
  CreditCard,
  ChevronRight,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
  XCircle,
} from 'lucide-react'
import {
  acceptVendorOrderAction,
  rejectVendorOrderAction,
  updateVendorFulfilmentAction,
} from '@/actions/vendor'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatTimeAgo, formatFullDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { FulfilmentStatus } from '@/types/database'

interface VendorOrderDetailClientProps {
  initialOrder: any
}

export function VendorOrderDetailClient({ initialOrder }: VendorOrderDetailClientProps) {
  const router = useRouter()
  const [order, setOrder] = useState<any>(initialOrder)
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null)

  // Tracking modal state
  const [activeTrackingModal, setActiveTrackingModal] = useState<{
    itemId: string
    title: string
  } | null>(null)
  const [inputResi, setInputResi] = useState('')

  // Reject modal state
  const [rejectModalOrder, setRejectModalOrder] = useState<{
    itemId: string
    title: string
  } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  // Handler Terima Pesanan
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
        setOrder((prev: any) => ({
          ...prev,
          items: (prev.items || []).map((it: any) =>
            it.id === itemId
              ? {
                  ...it,
                  fulfilmentStatus: 'processing' as FulfilmentStatus,
                }
              : it
          ),
        }))
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal menerima pesanan')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setLoadingItemId(null)
    }
  }

  // Handler Tolak Pesanan
  const handleRejectOrder = async () => {
    if (!rejectModalOrder) return
    const itemId = rejectModalOrder.itemId
    setLoadingItemId(itemId)
    try {
      const res = await rejectVendorOrderAction(itemId, rejectReason.trim() || undefined)
      if (res.success) {
        toast.success('Pesanan berhasil ditolak. Dana pembeli otomatis diproses refund.')
        setOrder((prev: any) => ({
          ...prev,
          items: (prev.items || []).map((it: any) =>
            it.id === itemId
              ? {
                  ...it,
                  fulfilmentStatus: 'cancelled' as FulfilmentStatus,
                }
              : it
          ),
        }))
        setRejectModalOrder(null)
        setRejectReason('')
        router.refresh()
      } else {
        toast.error(res.error || 'Gagal menolak pesanan')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setLoadingItemId(null)
    }
  }

  // Handler Update Fulfilment (Resi)
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
        setOrder((prev: any) => ({
          ...prev,
          items: (prev.items || []).map((it: any) =>
            it.id === itemId
              ? {
                  ...it,
                  fulfilmentStatus: targetStatus,
                  trackingNumber: trackingNumber || it.trackingNumber,
                }
              : it
          ),
        }))
        router.refresh()
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

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} disalin ke papan klip!`)
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  const shipping = order.shippingAddress || {}
  const items = order.items || []
  const totalNet = items.reduce((acc: number, it: any) => acc + (it.netAmount || 0), 0)
  const totalSubtotal = items.reduce(
    (acc: number, it: any) => acc + (it.price || 0) * (it.qty || 1),
    0
  )
  const totalCommission = items.reduce(
    (acc: number, it: any) => acc + (it.commissionAmount || 0),
    0
  )
  const totalShipping = items.reduce(
    (acc: number, it: any) => acc + (it.shippingCost || 0),
    0
  )

  const displayInvoice = order.invoiceNumber || order.code || 'INV-2026-00001'

  // Hitung overall fulfilment status
  const anyCancelled = items.every((it: any) => it.fulfilmentStatus === 'cancelled')
  const allCompleted = items.length > 0 && items.every((it: any) => it.fulfilmentStatus === 'completed')
  const anyShipped = items.some((it: any) => it.fulfilmentStatus === 'shipped' || it.fulfilmentStatus === 'completed')
  const anyProcessing = items.some(
    (it: any) =>
      it.fulfilmentStatus === 'processing' ||
      it.fulfilmentStatus === 'shipped' ||
      it.fulfilmentStatus === 'completed'
  )

  // Timeline Step Status (0: Belum, 1: Dibayar, 2: Diterima, 3: Siap Diambil/Dikirim, 4: Selesai)
  let currentStep = 1
  if (order.status === 'paid') currentStep = 1
  if (anyProcessing) currentStep = 2
  if (anyShipped) currentStep = 3
  if (allCompleted) currentStep = 4
  if (anyCancelled) currentStep = -1

  const TRACKING_STEPS = [
    {
      step: 1,
      title: 'Dibayar',
      desc: order.paidAt ? formatTimeAgo(order.paidAt) : 'Pembayaran terverifikasi',
      icon: ShieldCheck,
    },
    {
      step: 2,
      title: 'Diterima',
      desc: anyProcessing ? 'Pesanan diterima & dikemas' : 'Menunggu konfirmasi toko',
      icon: Package,
    },
    {
      step: 3,
      title: 'Siap Diambil/Dikirim',
      desc: anyShipped
        ? items.find((it: any) => it.trackingNumber)?.trackingNumber || 'Dalam perjalanan'
        : 'Menunggu penyerahan ke kurir',
      icon: Truck,
    },
    {
      step: 4,
      title: 'Selesai',
      desc: allCompleted ? 'Paket telah diterima pembeli' : 'Menunggu konfirmasi terima',
      icon: CheckCircle2,
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb Navigasi Sesuai Referensi Gambar 2 */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground print:hidden">
        <Link
          href="/vendor/orders"
          className="hover:text-foreground hover:underline transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Pesanan
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60" />
        <span className="font-mono font-bold text-foreground">{displayInvoice}</span>
      </nav>

      {/* 2. Header Invoice Utama & Tombol Cetak */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/70 print:border-none">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight font-mono">
              {displayInvoice}
            </h1>
            <button
              type="button"
              onClick={() => handleCopyText(displayInvoice, 'Nomor Invoice')}
              className="text-muted-foreground hover:text-[#00a699] cursor-pointer transition-colors print:hidden"
              title="Salin Nomor Invoice"
            >
              <Copy className="w-4 h-4" />
            </button>

            {/* Badge Status Pesanan */}
            {anyCancelled ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <XCircle className="w-3.5 h-3.5" /> Dibatalkan
              </span>
            ) : allCompleted ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
              </span>
            ) : anyShipped ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                <Truck className="w-3.5 h-3.5" /> Dalam Pengiriman
              </span>
            ) : anyProcessing ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Package className="w-3.5 h-3.5" /> Sedang Dikemas
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5" /> Belum Diproses
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5" suppressHydrationWarning>
              <Calendar className="w-3.5 h-3.5" />
              {formatFullDate(order.createdAt)}
            </span>
            <span>&bull;</span>
            <span>{items.length} Total Item</span>
            <span>&bull;</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {order.status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}
            </span>
          </div>
        </div>

        {/* Tombol Cetak Invoice */}
        <div className="flex items-center gap-2 print:hidden self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrintInvoice}
            className="h-9 px-4 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs hover:bg-muted"
          >
            <Printer className="w-4 h-4 text-[#00a699]" />
            <span>Cetak Invoice</span>
          </Button>
        </div>
      </div>

      {/* 3. Timeline Tracking Visual Horizontal (Persis Referensi Gambar 2) */}
      <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-6 space-y-4">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#00a699]" />
          Status Pelacakan Pesanan
        </h2>

        {anyCancelled ? (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-bold text-sm block">Pesanan Dibatalkan</strong>
              <p className="leading-relaxed">
                Pesanan ini telah dibatalkan dan proses refund pembayaran otomatis telah dicatat untuk pembeli.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative pt-2 pb-4">
            {/* Horizontal Line Connector */}
            <div className="hidden sm:block absolute top-[28px] left-[6%] right-[6%] h-[3px] bg-border/80 -z-0">
              <div
                className="h-full bg-[#00a699] transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(0, ((currentStep - 1) / (TRACKING_STEPS.length - 1)) * 100))}%`,
                }}
              />
            </div>

            {/* Stepper Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
              {TRACKING_STEPS.map((step) => {
                const isPassed = currentStep >= step.step
                const isCurrent = currentStep === step.step
                const StepIcon = step.icon

                return (
                  <div
                    key={step.step}
                    className="flex flex-col items-center text-center space-y-2 group"
                  >
                    {/* Circle Icon Indicator */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-[#00a699] text-white shadow-md shadow-[#00a699]/20'
                          : isCurrent
                          ? 'bg-[#00a699]/15 text-[#00a699] border-2 border-[#00a699]'
                          : 'bg-muted/80 text-muted-foreground border border-border'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-0.5 px-1">
                      <p
                        className={`text-xs font-bold ${
                          isPassed
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Grid Konten Utama: Card Pembeli & Pengiriman, Card Pembayaran, Card Produk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Produk Dipesan & Alamat Pengiriman */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card Produk Dipesan */}
          <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center justify-between pb-3 border-b border-border/60">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#00a699]" />
                Produk Dipesan ({items.length} Item)
              </span>
              <span className="text-xs text-muted-foreground font-normal">
                Subtotal: <strong className="text-foreground">{formatPrice(totalSubtotal)}</strong>
              </span>
            </h2>

            <div className="space-y-4 divide-y divide-border/60">
              {items.map((it: any) => {
                const isPhysical = it.productType === 'physical'
                const coverImage = it.imageUrl || '/placeholder-product.jpg'

                return (
                  <div key={it.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-start gap-3.5">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border">
                        <Image
                          src={coverImage}
                          alt={it.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPhysical
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                                : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                            }`}
                          >
                            {isPhysical ? 'Fisik' : 'Digital'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              it.fulfilmentStatus === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : it.fulfilmentStatus === 'shipped'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                                : it.fulfilmentStatus === 'processing'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : it.fulfilmentStatus === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {it.fulfilmentStatus === 'completed' && 'Selesai'}
                            {it.fulfilmentStatus === 'shipped' && 'Dalam Pengiriman'}
                            {it.fulfilmentStatus === 'processing' && 'Sedang Dikemas'}
                            {it.fulfilmentStatus === 'waiting' && 'Belum Diproses'}
                            {it.fulfilmentStatus === 'cancelled' && 'Dibatalkan'}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-foreground">
                          {it.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {it.qty} x {formatPrice(it.price)} ={' '}
                          <strong className="text-foreground">{formatPrice(it.price * it.qty)}</strong>
                        </p>

                        {/* Catatan Pembeli */}
                        {it.buyerNote && (
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5 mt-2">
                            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                            <span>
                              <strong>Catatan Pembeli:</strong> {it.buyerNote}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nomor Resi & Tombol Aksi Fulfilment per item */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-border/40">
                      <div>
                        {it.trackingNumber ? (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">No. Resi:</span>
                            <span className="font-mono font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border">
                              {it.trackingNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(it.trackingNumber, 'Nomor Resi')}
                              className="text-[#00a699] hover:underline cursor-pointer"
                              title="Salin Resi"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">
                            {isPhysical
                              ? 'Nomor resi belum dimasukkan.'
                              : 'Produk digital dikirim secara otomatis ke akun pembeli.'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto print:hidden">
                        {/* Aksi saat Status WAITING: Tolak & Terima */}
                        {it.fulfilmentStatus === 'waiting' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={loadingItemId === it.id}
                              onClick={() =>
                                setRejectModalOrder({ itemId: it.id, title: it.title })
                              }
                              className="h-8 px-3 text-xs font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                            >
                              Tolak Pesanan
                            </Button>

                            <Button
                              size="sm"
                              disabled={loadingItemId === it.id}
                              onClick={() => handleAcceptOrder(it.id)}
                              className="h-8 px-4 text-xs bg-[#00a699] hover:bg-[#008f84] text-white font-bold rounded-lg cursor-pointer shadow-xs"
                            >
                              {loadingItemId === it.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              )}
                              Terima Pesanan
                            </Button>
                          </>
                        )}

                        {/* Aksi saat Status PROCESSING: Input Resi & Kirim (Fisik) atau Tandai Selesai (Digital) */}
                        {it.fulfilmentStatus === 'processing' && isPhysical && (
                          <Button
                            size="sm"
                            disabled={loadingItemId === it.id}
                            onClick={() =>
                              setActiveTrackingModal({ itemId: it.id, title: it.title })
                            }
                            className="h-8 px-3.5 text-xs bg-[#00a699] hover:bg-[#008f84] text-white font-bold rounded-lg cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5 mr-1" />
                            Input Resi & Kirim
                          </Button>
                        )}

                        {it.fulfilmentStatus === 'processing' && !isPhysical && (
                          <Button
                            size="sm"
                            disabled={loadingItemId === it.id}
                            onClick={() => handleUpdateStatus(it.id, 'completed')}
                            className="h-8 px-3.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Tandai Selesai
                          </Button>
                        )}

                        {it.fulfilmentStatus === 'shipped' && (
                          <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-blue-500" />
                            Dalam perjalanan ke pembeli...
                          </span>
                        )}

                        {it.fulfilmentStatus === 'completed' && (
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
          </div>

          {/* Card Alamat Pengiriman Lengkap */}
          <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border/60">
              <MapPin className="w-4 h-4 text-[#00a699]" />
              Informasi Pengiriman & Tujuan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px] block">Kurir & Layanan:</span>
                <p className="font-bold text-foreground">
                  {shipping.courier || 'Kurir Standar'} - {shipping.shippingService || 'Reguler'}
                </p>
                {shipping.estimatedDays && (
                  <p className="text-[11px] text-muted-foreground">
                    Estimasi pengiriman: {shipping.estimatedDays}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground text-[11px] block">Penerima & Kontak:</span>
                <p className="font-bold text-foreground">
                  {shipping.recipientName || shipping.recipient_name || shipping.name || order.buyer?.name || 'Penerima'}
                </p>
                <p className="text-muted-foreground">
                  {shipping.phone || shipping.phone_number || order.buyer?.phone || '-'}
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1 pt-2 border-t border-border/40">
                <span className="text-muted-foreground text-[11px] block">Alamat Tujuan:</span>
                <p className="text-foreground leading-relaxed">
                  {shipping.addressLine || shipping.address_line || shipping.street || '-'}
                  {shipping.village || shipping.subdistrict || shipping.kelurahan
                    ? `, Desa/Kel. ${shipping.village || shipping.subdistrict || shipping.kelurahan}`
                    : ''}
                  {shipping.district || shipping.sub_district || shipping.kecamatan
                    ? `, Kec. ${shipping.district || shipping.sub_district || shipping.kecamatan}`
                    : ''}
                  <br />
                  {[
                    shipping.city || shipping.city_name,
                    shipping.province || shipping.province_name,
                    shipping.postalCode || shipping.postal_code || shipping.postcode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Card Data Pembeli & Card Pembayaran Finansial */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card Pembeli */}
          <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-5 space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border/60">
              <User className="w-4 h-4 text-[#00a699]" />
              Data Akun Pembeli
            </h2>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#00a699]/15 text-[#00a699] font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                {order.buyer?.avatar ? (
                  <Image
                    src={order.buyer.avatar}
                    alt={order.buyer.name}
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  order.buyer?.name?.charAt(0)?.toUpperCase() || 'P'
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground text-xs truncate">
                  {order.buyer?.name || 'Pelanggan'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-[#00a699]" />
                  {order.buyer?.phone || '-'}
                </p>
                {order.buyer?.email && (
                  <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#00a699]" />
                    {order.buyer.email}
                  </p>
                )}
              </div>
            </div>

            {order.buyer?.phone && order.buyer?.phone !== '-' && (
              <div className="pt-2 border-t border-border/60 print:hidden">
                <a
                  href={`https://wa.me/${order.buyer.phone.replace(/^0/, '62').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Hubungi via WhatsApp
                </a>
              </div>
            )}
          </div>

          {/* Card Pembayaran & Finansial Toko */}
          <div className="rounded-2xl bg-card border border-border/80 shadow-xs p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 pb-3 border-b border-border/60">
              <CreditCard className="w-4 h-4 text-[#00a699]" />
              Rincian Pembayaran
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status Pembayaran</span>
                <span
                  className={`font-bold ${
                    order.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  {order.status === 'paid' ? 'Lunas' : 'Menunggu Bayar'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Metode Pembayaran</span>
                <span className="font-semibold text-foreground">
                  {order.payment?.paymentType || 'Pembayaran Online'}
                </span>
              </div>

              {order.paidAt && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Waktu Bayar</span>
                  <span className="text-muted-foreground" suppressHydrationWarning>
                    {formatTimeAgo(order.paidAt)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal Produk</span>
                  <span className="font-semibold text-foreground">
                    {formatPrice(totalSubtotal)}
                  </span>
                </div>

                {totalShipping > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Ongkos Kirim</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(totalShipping)}
                    </span>
                  </div>
                )}

                {totalCommission > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Biaya Layanan Platform</span>
                    <span className="text-rose-500 font-semibold">
                      -{formatPrice(totalCommission)}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-border/60 flex items-center justify-between">
                  <span className="font-bold text-foreground">Pendapatan Bersih</span>
                  <span className="font-extrabold text-[#00a699] text-base">
                    {formatPrice(totalNet)}
                  </span>
                </div>

                <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
                  Saldo pembayaran pesanan otomatis masuk ke dompet toko Anda setelah pesanan diterima dan dikonfirmasi.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                Pesanan untuk produk <strong className="text-foreground">{rejectModalOrder.title}</strong>{' '}
                akan dibatalkan, dan pembayaran akan secara otomatis direfund kembali ke akun pembeli.
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

      {/* MODAL INPUT RESI PENGIRIMAN */}
      {activeTrackingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 print:hidden">
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
                Nomor resi ini akan langsung dapat dilacak oleh pembeli di halaman status pesanan.
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
    </div>
  )
}
