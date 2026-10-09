'use client'

import React, { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  PackageCheck,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Building,
  RefreshCw,
  Copy,
  Receipt,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { getOrderDetailsAction, confirmOrderPaymentAction, confirmOrderReceivedAction } from '@/actions/order'
import { submitReviewAction } from '@/actions/social'
import { Button } from '@/components/ui/button'

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = use(params)
  const orderId = resolvedParams.id

  const [loading, setLoading] = useState(true)
  const [orderData, setOrderData] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmingReceiptId, setConfirmingReceiptId] = useState<string | null>(null)
  const [reviewModalItem, setReviewModalItem] = useState<{ id: string; productId: string; title: string } | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewBody, setReviewBody] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const fetchOrder = async () => {
    try {
      const res = await getOrderDetailsAction(orderId)
      if (res.success && res.data) {
        setOrderData(res.data)
      } else {
        setErrorMessage(res.error || 'Pesanan tidak ditemukan.')
      }
    } catch {
      setErrorMessage('Terjadi kesalahan saat mengambil data pesanan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const handlePayNow = async () => {
    setConfirming(true)
    try {
      const res = await confirmOrderPaymentAction(orderId)
      if (res.success) {
        toast.success('Pembayaran berhasil dikonfirmasi!')
        await fetchOrder()
      } else {
        toast.error(res.error || 'Gagal memproses pembayaran')
      }
    } catch {
      toast.error('Gagal memproses pembayaran')
    } finally {
      setConfirming(false)
    }
  }

  const handleCopyResi = (resi: string) => {
    navigator.clipboard.writeText(resi)
    toast.success('Nomor resi disalin ke papan klip!')
  }

  const handleConfirmReceived = async (itemId: string) => {
    setConfirmingReceiptId(itemId)
    try {
      const res = await confirmOrderReceivedAction(itemId)
      if (res.success) {
        toast.success('Pesanan telah berhasil dikonfirmasi diterima!')
        await fetchOrder()
      } else {
        toast.error(res.error || 'Gagal mengonfirmasi pesanan diterima')
      }
    } catch {
      toast.error('Gagal memproses konfirmasi')
    } finally {
      setConfirmingReceiptId(null)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewModalItem) return
    setSubmittingReview(true)
    try {
      const res = await submitReviewAction({
        orderItemId: reviewModalItem.id,
        productId: reviewModalItem.productId,
        rating: reviewRating,
        body: reviewBody.trim() || null,
      })
      if (res.success) {
        toast.success('Ulasan Anda berhasil dikirimkan! Terima kasih atas feedback Anda.')
        setReviewModalItem(null)
        setReviewBody('')
      } else {
        toast.error(res.error || 'Gagal mengirimkan ulasan')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmittingReview(false)
    }
  }

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#00a699]" />
        <p className="text-sm text-muted-foreground">Memuat detail pesanan & pelacakan paket...</p>
      </div>
    )
  }

  if (errorMessage || !orderData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center container mx-auto px-4 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-3" />
        <h1 className="text-lg font-bold text-foreground">{errorMessage || 'Pesanan Tidak Ditemukan'}</h1>
        <p className="text-xs text-muted-foreground mt-1 mb-6">
          Pastikan tautan pesanan Anda benar atau kembali ke beranda.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-semibold rounded-md"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const { order, items, shippingInfo, trackingNumber, trackingSteps } = orderData
  const isPaid = order.status === 'paid'

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali Belanja
          </Link>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchOrder}
              className="text-xs font-medium h-8 gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Segarkan Status
            </Button>
          </div>
        </div>

        {/* Card Status & Ringkasan Singkat Pesanan */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Detail Pesanan
                </span>
                <span className="font-mono text-xs font-extrabold text-foreground bg-muted/60 px-2.5 py-0.5 rounded border border-border">
                  {order.code}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                Total Tagihan: {formatPrice(order.total)}
              </h1>
              <p className="text-xs text-muted-foreground">
                Dibuat pada:{' '}
                {new Date(order.created_at).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
                  isPaid
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                    : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                }`}
              >
                {isPaid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Pembayaran Berhasil (Lunas)
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" /> Menunggu Pembayaran
                  </>
                )}
              </span>

              {!isPaid && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handlePayNow}
                  disabled={confirming}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 cursor-pointer"
                >
                  {confirming ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memproses...
                    </>
                  ) : (
                    'Konfirmasi Bayar Sekarang'
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Info Nomor Resi & Kurir */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-muted/30 border border-border/60">
            <div>
              <span className="text-[11px] text-muted-foreground block">Ekspedisi Logistik</span>
              <span className="text-xs font-bold text-foreground">
                {shippingInfo.courier || 'Krafita Express'} ({shippingInfo.shippingService || 'Reguler'})
              </span>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Nomor Resi / Pelacakan</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold text-foreground">
                  {trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyResi(trackingNumber)}
                  className="text-[#00a699] hover:text-[#008f84] cursor-pointer"
                  title="Salin Resi"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <span className="text-[11px] text-muted-foreground block">Estimasi Waktu Tiba</span>
              <span className="text-xs font-bold text-emerald-600">
                {shippingInfo.estimatedDays || '2-3 Hari Kerja'}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: TIMELINE LACAK PAKET INTERAKTIF */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-6 sm:p-8 mb-6">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2 mb-6 border-b border-border/60 pb-3">
            <Truck className="w-5 h-5 text-[#00a699]" />
            Lacak Perjalanan Paket
          </h2>

          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
            {trackingSteps.map((step: any, index: number) => {
              const isDone = step.completed
              const isCurrent = step.current

              return (
                <div key={index} className="relative group">
                  {/* Bullet indicator */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-0.5 w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      isDone
                        ? 'bg-[#00a699] text-white ring-4 ring-[#00a699]/20'
                        : isCurrent
                        ? 'bg-amber-500 text-white ring-4 ring-amber-500/20 animate-pulse'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {isDone ? '✓' : index + 1}
                  </div>

                  {/* Konten Step */}
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h3
                        className={`text-sm font-bold ${
                          isDone || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </h3>
                      {step.time && (
                        <span className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                          {step.time}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* SECTION: DETAIL ALAMAT TUJUAN PENGIRIMAN & PRODUK */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Alamat Pengiriman */}
          <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-5 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2.5">
              <MapPin className="w-4 h-4 text-[#00a699]" />
              Alamat Tujuan Pengiriman
            </h3>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-foreground">
                {shippingInfo.recipientName || 'Pembeli'}{' '}
                <span className="text-muted-foreground font-normal font-mono">
                  ({shippingInfo.phone || '-'})
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {shippingInfo.addressLine || '-'}, {shippingInfo.city || ''},{' '}
                {shippingInfo.province || ''} {shippingInfo.postalCode || ''}
              </p>
              {shippingInfo.buyerNote && (
                <div className="mt-2 p-2 bg-muted/40 rounded border border-border/60 text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">Catatan:</span>{' '}
                  {shippingInfo.buyerNote}
                </div>
              )}
            </div>
          </div>

          {/* Rincian Tagihan */}
          <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-5 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-2.5">
              <Receipt className="w-4 h-4 text-[#00a699]" />
              Rincian Pembayaran
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Total Harga Produk</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(
                    items.reduce((acc: number, i: any) => acc + i.price * i.qty, 0)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ongkos Kirim ({shippingInfo.courier || 'Ekspedisi'})</span>
                <span className="font-semibold text-foreground">
                  {formatPrice(shippingInfo.shippingCost || 15000)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Penanganan / Layanan</span>
                <span className="font-semibold text-foreground">{formatPrice(1000)}</span>
              </div>
              <div className="pt-2 border-t border-border/60 flex justify-between font-bold text-sm text-foreground">
                <span>Total Pembayaran</span>
                <span className="text-[#00a699] font-extrabold">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: PRODUK YANG DIBELI */}
        <div className="bg-card rounded-2xl border border-border/80 shadow-xs p-5 sm:p-6 mt-6">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3 mb-4">
            <ShoppingBag className="w-4 h-4 text-[#00a699]" />
            Daftar Produk ({items.length} Barang)
          </h3>

          <div className="divide-y divide-border/60">
            {items.map((item: any) => {
              const isShipped = item.fulfilment_status === 'shipped'
              const isCompleted = item.fulfilment_status === 'completed'
              const productSlug = item.products?.slug

              return (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[#00a699]/10 text-[#00a699] flex items-center justify-center shrink-0 border border-border overflow-hidden">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <PackageCheck className="w-6 h-6" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      {productSlug ? (
                        <Link
                          href={`/products/${productSlug}`}
                          className="text-xs sm:text-sm font-bold text-foreground hover:text-[#00a699] transition-colors line-clamp-1 block"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <h4 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1">
                          {item.title}
                        </h4>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {item.qty} x {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {formatPrice(item.price * item.qty)}
                    </span>

                    {/* Tombol Konfirmasi Diterima */}
                    {isShipped && (
                      <button
                        type="button"
                        disabled={confirmingReceiptId === item.id}
                        onClick={() => handleConfirmReceived(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {confirmingReceiptId === item.id ? 'Memproses...' : 'Konfirmasi Diterima'}
                      </button>
                    )}

                    {/* Tombol Beri Ulasan */}
                    {isCompleted && (
                      <button
                        type="button"
                        onClick={() =>
                          setReviewModalItem({
                            id: item.id,
                            productId: item.product_id,
                            title: item.title,
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500/40 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        Beri Ulasan
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* MODAL DIALOG TULIS ULASAN PRODUK */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                Ulas Produk Ini
              </h2>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {reviewModalItem.title}
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Rating Bintang:</label>
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-foreground">
                    {reviewRating} dari 5 Bintang
                  </span>
                </div>
              </div>

              {/* Ulasan Teks */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Ulasan Anda (Opsional):</label>
                <textarea
                  rows={3}
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Ceritakan kepuasan Anda terhadap kualitas dan pelayanan penjual..."
                  className="w-full p-3 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-[#00a699] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalItem(null)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submittingReview ? (
                    'Mengirim...'
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Kirim Ulasan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
