'use client'

import React, { useState } from 'react'
import { AlertTriangle, X, Loader2, CheckCircle2 } from 'lucide-react'
import { submitReportAction } from '@/actions/social'
import { toast } from 'sonner'

interface ReportModalProps {
  targetType: 'product' | 'comment'
  targetId: string
  title?: string
  isOpen: boolean
  onClose: () => void
}

const REPORT_REASONS = [
  'Barang tiruan / pelanggaran hak cipta',
  'Deskripsi produk menyesatkan atau tidak sesuai',
  'Penipuan atau spam komersial',
  'Konten terlarang / berbahaya',
  'Ujaran kebencian atau kata-kata kasar',
  'Lainnya',
]

export function ReportModal({
  targetType,
  targetId,
  title,
  isOpen,
  onClose,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0])
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const finalReason =
      selectedReason === 'Lainnya' && additionalNotes.trim()
        ? `Lainnya: ${additionalNotes.trim()}`
        : `${selectedReason}${additionalNotes.trim() ? ` — Catatan: ${additionalNotes.trim()}` : ''}`

    try {
      const res = await submitReportAction({
        targetType,
        targetId,
        reason: finalReason,
      })

      if (res.success) {
        toast.success('Laporan berhasil dikirimkan. Terima kasih atas partisipasi Anda!')
        onClose()
      } else {
        toast.error(res.error || 'Gagal mengirimkan laporan')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Laporkan {targetType === 'product' ? 'Produk' : 'Komentar'}
              </h2>
              {title && <p className="text-[11px] text-muted-foreground truncate max-w-xs">{title}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Alasan Pelaporan</label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none p-1.5 rounded-lg hover:bg-muted/50"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-3.5 h-3.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Catatan Tambahan (Opsional)</label>
            <textarea
              rows={3}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Berikan detail tambahan mengenai dugaan pelanggaran..."
              className="w-full p-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Kirim Laporan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
