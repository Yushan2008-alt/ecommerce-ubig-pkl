'use client'

import React, { useState } from 'react'
import {
  Star,
  CheckCircle2,
  ShieldCheck,
  MessageSquare,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { submitReviewAction, type ReviewInput } from '@/actions/social'
import { toast } from 'sonner'

interface ReviewItem {
  id: string
  rating: number
  body?: string | null
  createdAt: string
  userName: string
  userAvatar?: string | null
}

interface ProductReviewsProps {
  productId: string
  reviews: ReviewItem[]
  ratingAvg: number
  ratingCount: number
  eligibleOrderItemId?: string | null
  currentUserId?: string | null
}

export function ProductReviews({
  productId,
  reviews,
  ratingAvg,
  ratingCount,
  eligibleOrderItemId,
  currentUserId,
}: ProductReviewsProps) {
  const [reviewList, setReviewList] = useState<ReviewItem[]>(reviews)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [formRating, setFormRating] = useState(5)
  const [formBody, setFormBody] = useState('')
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [hasReviewed, setHasReviewed] = useState(false)

  // Hitung distribusi rating
  const distribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewList.filter((r) => r.rating === stars).length
    const pct = reviewList.length > 0 ? (count / reviewList.length) * 100 : 0
    return { stars, count, pct }
  })

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eligibleOrderItemId) {
      toast.error('Ulasan hanya dapat diberikan setelah pesanan berstatus Selesai.')
      return
    }

    setSubmitting(true)

    try {
      const res = await submitReviewAction({
        orderItemId: eligibleOrderItemId,
        productId,
        rating: formRating,
        body: formBody.trim() || null,
      })

      if (res.success) {
        toast.success('Ulasan Anda berhasil dikirimkan! Terima kasih atas ulasan berharga Anda.')
        setHasReviewed(true)
        setShowReviewForm(false)

        // Tambah ke daftar lokal
        const newReview: ReviewItem = {
          id: Math.random().toString(),
          rating: formRating,
          body: formBody.trim(),
          createdAt: new Date().toISOString(),
          userName: 'Anda (Pembeli Terverifikasi)',
          userAvatar: null,
        }
        setReviewList([newReview, ...reviewList])
      } else {
        toast.error(res.error || 'Gagal mengirimkan ulasan')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Rekapitulasi Bintang & Distribusi */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Skor Rata-rata (Col 1-5) */}
        <div className="md:col-span-5 text-center md:text-left space-y-2 border-b md:border-b-0 md:border-r border-border/60 pb-6 md:pb-0 md:pr-6">
          <div className="flex items-baseline justify-center md:justify-start gap-2">
            <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
              {ratingAvg.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">/ 5.0</span>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(ratingAvg)
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            Berdasarkan <strong>{reviewList.length}</strong> ulasan dari pembeli terverifikasi
          </p>
        </div>

        {/* Bar Distribusi Bintang (Col 6-12) */}
        <div className="md:col-span-7 space-y-1.5">
          {distribution.map(({ stars, count, pct }) => (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <span className="w-12 font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
                {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right font-mono text-muted-foreground text-[11px] shrink-0">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Tombol atau Form Tulis Ulasan (Jika Eligible) */}
      {eligibleOrderItemId && !hasReviewed && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-primary/5 border border-[#00a699]/30 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00a699]" />
                Anda Membeli Produk Ini!
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Bagikan pengalaman belanja Anda untuk membantu calon pembeli lainnya.
              </p>
            </div>
            {!showReviewForm && (
              <button
                type="button"
                onClick={() => setShowReviewForm(true)}
                className="px-4 py-2 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Tulis Ulasan
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleSubmitReview} className="space-y-4 pt-2 border-t border-border/60">
              {/* Star Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Beri Nilai Bintang:</label>
                <div className="flex items-center gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setFormRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating ?? formRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-foreground">
                    {(hoverRating ?? formRating)} dari 5 Bintang
                  </span>
                </div>
              </div>

              {/* Teks Ulasan */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Ulasan Anda (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={formBody}
                  onChange={(e) => setFormBody(e.target.value)}
                  placeholder="Ceritakan kualitas produk, kesesuaian deskripsi, kecepatan kirim..."
                  className="w-full p-3 text-xs bg-background border border-border rounded-xl focus:outline-none focus:border-[#00a699] resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#00a699] hover:bg-[#008f84] text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengirim Ulasan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Kirim Ulasan Terverifikasi
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* 3. Daftar Ulasan Pembeli */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-foreground">Semua Ulasan Pembeli</h3>

        {reviewList.length === 0 ? (
          <div className="p-8 text-center bg-card rounded-2xl border border-border/80 text-xs text-muted-foreground space-y-1">
            <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p>Belum ada ulasan untuk produk ini.</p>
            <p className="text-[11px]">Jadilah pembeli pertama yang memberikan ulasan!</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60 bg-card rounded-2xl border border-border/80 shadow-xs px-6">
            {reviewList.map((rev) => (
              <div key={rev.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#00a699]/10 text-[#00a699] font-bold text-xs flex items-center justify-center">
                      {rev.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground">{rev.userName}</span>
                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3" /> Pembeli Terverifikasi
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] text-muted-foreground">
                    {new Date(rev.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Rating Bintang */}
                <div className="flex items-center gap-0.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/20'
                      }`}
                    />
                  ))}
                </div>

                {rev.body && (
                  <p className="text-xs text-foreground/90 leading-relaxed pt-0.5">{rev.body}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
