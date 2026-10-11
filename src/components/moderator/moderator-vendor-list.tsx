'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  approveVendorAction,
  rejectVendorAction,
  toggleModeratorRoleAction,
  type VendorApplicationItem,
} from '@/actions/moderator'
import {
  Store,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Truck,
  CreditCard,
  User,
  ShieldCheck,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  AlertTriangle,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import { POPULAR_COURIERS } from '@/lib/shop-helper'

interface ModeratorVendorListProps {
  initialApplications: VendorApplicationItem[]
  currentRole: string
  userName: string
}

export function ModeratorVendorList({
  initialApplications,
  currentRole,
  userName,
}: ModeratorVendorListProps) {
  const [applications, setApplications] = useState<VendorApplicationItem[]>(initialApplications)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [rejectModalShop, setRejectModalShop] = useState<VendorApplicationItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [togglingRole, setTogglingRole] = useState(false)

  // Filter applications
  const filtered = applications.filter((app) => {
    if (filterStatus !== 'all' && app.shop.status !== filterStatus) {
      return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchName = app.shop.name.toLowerCase().includes(q)
      const matchApplicant = app.applicant.displayName.toLowerCase().includes(q)
      const matchCity = (app.shop.city || '').toLowerCase().includes(q)
      const matchPhone = (app.shop.phone || '').includes(q)
      if (!matchName && !matchApplicant && !matchCity && !matchPhone) {
        return false
      }
    }
    return true
  })

  // Handle Approve
  const handleApprove = async (shopId: string, shopName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menyetujui pendaftaran toko "${shopName}"? Calon vendor akan dapat melanjutkan ke langkah upload produk pertama.`)) {
      return
    }

    setProcessingId(shopId)
    try {
      const res = await approveVendorAction(shopId)
      if (res.success) {
        toast.success(`Toko "${shopName}" berhasil disetujui!`)
        setApplications((prev) =>
          prev.map((a) =>
            a.shop.id === shopId
              ? {
                  ...a,
                  shop: { ...a.shop, status: 'approved' },
                  metadata: { ...a.metadata, verified_at: new Date().toISOString() },
                }
              : a
          )
        )
      } else {
        toast.error(res.error || 'Gagal menyetujui toko.')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Open Reject Modal
  const handleOpenReject = (app: VendorApplicationItem) => {
    setRejectModalShop(app)
    setRejectReason('')
  }

  // Handle Submit Reject
  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectModalShop) return
    if (!rejectReason.trim()) {
      toast.error('Silakan isi alasan penolakan.')
      return
    }

    setProcessingId(rejectModalShop.shop.id)
    try {
      const res = await rejectVendorAction(rejectModalShop.shop.id, rejectReason.trim())
      if (res.success) {
        toast.success(`Pendaftaran toko "${rejectModalShop.shop.name}" ditolak.`)
        setApplications((prev) =>
          prev.map((a) =>
            a.shop.id === rejectModalShop.shop.id
              ? {
                  ...a,
                  shop: { ...a.shop, status: 'rejected' },
                  metadata: { ...a.metadata, moderator_notes: rejectReason.trim() },
                }
              : a
          )
        )
        setRejectModalShop(null)
      } else {
        toast.error(res.error || 'Gagal menolak toko.')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setProcessingId(null)
    }
  }

  // Handle Toggle Role for testing
  const handleToggleRole = async () => {
    setTogglingRole(true)
    try {
      const res = await toggleModeratorRoleAction()
      if (res.success) {
        toast.success(`Role akun berhasil dialihkan menjadi: ${res.newRole}`)
        window.location.reload()
      } else {
        toast.error(res.error || 'Gagal beralih role')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setTogglingRole(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" />
            Menunggu Verifikasi
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Disetujui (Menunggu Produk #1)
          </span>
        )
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" />
            Toko Aktif Penuh
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" />
            Ditolak
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground">
            {status}
          </span>
        )
    }
  }

  const pendingCount = applications.filter((a) => a.shop.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00a699]" />
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Panel Verifikasi Toko Vendor
            </h1>
          </div>
          <p className="text-xs text-muted-foreground">
            Kelola dan tinjau pengajuan pembukaan toko baru di Krafita Marketplace.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-muted-foreground block">Login Sebagai</span>
            <span className="text-xs font-bold text-foreground">{userName} ({currentRole})</span>
          </div>

          <button
            type="button"
            onClick={handleToggleRole}
            disabled={togglingRole}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-border hover:bg-muted transition-colors cursor-pointer"
            title="Klik untuk beralih role antar testing"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#00a699]" />
            <span>{togglingRole ? 'Mengubah...' : 'Beralih Mode Testing'}</span>
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 border border-border/80 rounded-xl overflow-x-auto w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Semua ({applications.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterStatus === 'pending'
                ? 'bg-[#00a699] text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Menunggu Tinjauan</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${filterStatus === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'}`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'approved'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Disetujui
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'active'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Aktif
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filterStatus === 'rejected'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Ditolak
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari toko, pemilik, kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs bg-card border border-border rounded-xl focus:outline-none focus:border-[#00a699]"
          />
        </div>
      </div>

      {/* 3. Applications Cards / Table */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-card border border-border/80 rounded-2xl space-y-2">
          <Store className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-sm font-bold text-foreground">Tidak Ada Pendaftaran Toko</h3>
          <p className="text-xs text-muted-foreground">
            {filterStatus === 'pending'
              ? 'Semua pendaftaran telah ditinjau! Tidak ada toko pending saat ini.'
              : 'Tidak ditemukan pengajuan toko yang sesuai dengan filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((app) => {
            const isPending = app.shop.status === 'pending'
            const isProcessing = processingId === app.shop.id

            return (
              <div
                key={app.shop.id}
                className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-[#00a699]/40 transition-all space-y-4"
              >
                {/* Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00a699]/10 text-[#00a699] flex items-center justify-center shrink-0 font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{app.shop.name}</h3>
                        <span className="text-[11px] text-muted-foreground font-mono">@{app.shop.slug}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {app.applicant.displayName}
                        </span>
                        <span>•</span>
                        <span>{app.shop.phone || '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div>{getStatusBadge(app.shop.status)}</div>
                </div>

                {/* Grid Detail Informasi */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Alamat Pengambilan */}
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px]">
                      <MapPin className="w-3 h-3 text-[#00a699]" />
                      Alamat Pengambilan (Gudang/Rumah)
                    </span>
                    <p className="font-semibold text-foreground leading-relaxed">
                      {app.metadata.pickup_address || '-'}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {app.shop.city}, {app.shop.province} {app.metadata.postal_code || ''}
                    </p>
                  </div>

                  {/* Ekspedisi Jasa Kirim */}
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 space-y-1.5">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px]">
                      <Truck className="w-3 h-3 text-[#00a699]" />
                      Jasa Kirim (Ekspedisi Aktif)
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {app.metadata.couriers && app.metadata.couriers.length > 0 ? (
                        app.metadata.couriers.map((cId) => {
                          const courier = POPULAR_COURIERS.find((c) => c.id === cId)
                          return (
                            <span
                              key={cId}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00a699]/10 text-[#00a699] border border-[#00a699]/20"
                            >
                              {courier?.name || cId.toUpperCase()}
                            </span>
                          )
                        })
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Belum memilih</span>
                      )}
                    </div>
                  </div>

                  {/* Rekening Bank */}
                  <div className="p-3.5 rounded-xl border border-border/60 bg-muted/15 space-y-1">
                    <span className="text-muted-foreground font-medium flex items-center gap-1.5 text-[11px]">
                      <CreditCard className="w-3 h-3 text-[#00a699]" />
                      Rekening Bank Pencairan
                    </span>
                    <p className="font-bold text-foreground">
                      {app.metadata.bank_name || '-'}
                    </p>
                    <p className="font-mono text-foreground/80 text-[11px]">
                      {app.metadata.bank_account_number || '-'} a.n {app.metadata.bank_account_holder || '-'}
                    </p>
                  </div>
                </div>

                {/* Catatan Penolakan jika ada */}
                {app.metadata.moderator_notes && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Alasan Penolakan:</strong>
                      <p>{app.metadata.moderator_notes}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  {isPending && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenReject(app)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-500/10 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApprove(app.shop.id, app.shop.name)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#00a699] hover:bg-[#008f84] transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Setujui Pendaftaran</span>
                      </button>
                    </>
                  )}

                  {app.shop.status === 'approved' && (
                    <span className="text-[11px] text-muted-foreground italic">
                      Menunggu vendor mengunggah produk pertama di langkah 6.
                    </span>
                  )}

                  {app.shop.status === 'active' && (
                    <Link
                      href={`/vendor`}
                      className="text-xs font-semibold text-[#00a699] hover:underline"
                    >
                      Lihat Toko di Vendor Center →
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalShop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">
                Tolak Pendaftaran: {rejectModalShop.shop.name}
              </h3>
              <p className="text-xs text-muted-foreground">
                Berikan alasan penolakan agar calon vendor dapat memperbaiki data pendaftarannya.
              </p>
            </div>

            <form onSubmit={handleSubmitReject} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-bold text-foreground">
                  Alasan Penolakan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Alamat pengambilan barang tidak lengkap, mohon cantumkan nomor rumah/patokan jelas..."
                  className="w-full p-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalShop(null)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={processingId !== null}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {processingId ? 'Memproses...' : 'Kirim Penolakan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
