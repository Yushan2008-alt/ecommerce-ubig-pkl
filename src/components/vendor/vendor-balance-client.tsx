'use client'

import React, { useState, useEffect } from 'react'
import {
  Wallet,
  Building,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CreditCard,
} from 'lucide-react'
import { requestPayoutAction, getVendorBalanceDataAction, type PayoutInput } from '@/actions/vendor'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface PayoutHistoryItem {
  id: string
  amount: number
  bank_name: string
  account_no: string
  account_holder: string
  status: string
  created_at: string
  paid_at?: string | null
}

interface VendorBalanceClientProps {
  initialData: {
    shop: {
      id: string
      name: string
    }
    totalNetCompleted: number
    pendingPaidPayouts: number
    availableBalance: number
    payoutHistory: PayoutHistoryItem[]
  }
  vendorDisplayName?: string
}

const SUPPORTED_BANKS = [
  'Bank Central Asia (BCA)',
  'Bank Mandiri',
  'Bank Rakyat Indonesia (BRI)',
  'Bank Negara Indonesia (BNI)',
  'Bank Syariah Indonesia (BSI)',
  'CIMB Niaga',
  'Permata Bank',
  'SeaBank',
  'Bank Jago',
]

export function VendorBalanceClient({
  initialData,
  vendorDisplayName = '',
}: VendorBalanceClientProps) {
  const [balanceData, setBalanceData] = useState(initialData)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Ambil data rekening terakhir dari riwayat jika ada
  const lastPayout = initialData.payoutHistory[0]

  const [payoutForm, setPayoutForm] = useState({
    amount: Math.min(initialData.availableBalance, 100000),
    bankName: lastPayout?.bank_name || SUPPORTED_BANKS[0],
    accountNo: lastPayout?.account_no || '',
    accountHolder: lastPayout?.account_holder || vendorDisplayName || '',
  })

  // Supabase Realtime Subscription untuk penarikan saldo & pesanan selesai
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('vendor-balance-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'payout_requests' },
        async () => {
          const res = await getVendorBalanceDataAction()
          if (res.success && res.data) {
            setBalanceData(res.data)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'order_items' },
        async () => {
          const res = await getVendorBalanceDataAction()
          if (res.success && res.data) {
            setBalanceData(res.data)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (payoutForm.amount < 10000) {
      toast.error('Minimal penarikan dana adalah Rp 10.000.')
      return
    }

    if (payoutForm.amount > balanceData.availableBalance) {
      toast.error('Nominal penarikan melebihi saldo bersih yang tersedia.')
      return
    }

    if (!payoutForm.accountNo.trim() || payoutForm.accountNo.length < 5) {
      toast.error('Nomor rekening bank tidak valid (minimal 5 digit).')
      return
    }

    if (!payoutForm.accountHolder.trim() || payoutForm.accountHolder.length < 3) {
      toast.error('Nama pemilik rekening wajib diisi dengan benar.')
      return
    }

    setSubmitting(true)

    try {
      const payload: PayoutInput = {
        amount: Number(payoutForm.amount),
        bankName: payoutForm.bankName,
        accountNo: payoutForm.accountNo.trim(),
        accountHolder: payoutForm.accountHolder.trim(),
      }

      const res = await requestPayoutAction(payload)

      if (res.success) {
        toast.success('Pengajuan penarikan dana berhasil dikirim! Menunggu verifikasi admin.')
        // Kurangi saldo di state lokal dan tambahkan ke riwayat
        setBalanceData((prev) => ({
          ...prev,
          availableBalance: prev.availableBalance - payload.amount,
          pendingPaidPayouts: prev.pendingPaidPayouts + payload.amount,
          payoutHistory: [
            {
              id: res.payoutId || Math.random().toString(),
              amount: payload.amount,
              bank_name: payload.bankName,
              account_no: payload.accountNo,
              account_holder: payload.accountHolder,
              status: 'pending',
              created_at: new Date().toISOString(),
            },
            ...prev.payoutHistory,
          ],
        }))
      } else {
        setErrorMsg(res.error || 'Gagal mengajukan penarikan dana.')
        toast.error(res.error || 'Gagal mengajukan penarikan')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan atau server.')
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Saldo & Penarikan Dana (Payout)
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Real-time
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Kelola saldo bersih hasil penjualan produk toko dan ajukan pencairan ke rekening bank Anda.
        </p>
      </div>

      {/* 2. 3 Kartu Saldo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Saldo Tersedia */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Saldo Siap Ditarik</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatPrice(balanceData.availableBalance)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Bersih setelah potongan komisi 5%
            </p>
          </div>
        </div>

        {/* Total Pendapatan Bersih Selesai */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Penjualan Selesai</span>
            <div className="w-8 h-8 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground">
              {formatPrice(balanceData.totalNetCompleted)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Akumulasi pesanan completed</p>
          </div>
        </div>

        {/* Total Penarikan (Pending / Paid) */}
        <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Dana Telah/Sedang Ditarik</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground">
              {formatPrice(balanceData.pendingPaidPayouts)}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Riwayat pengajuan payout</p>
          </div>
        </div>
      </div>

      {/* 3. Form Request Payout & Verifikasi Rekening */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-5">
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Building className="w-4 h-4 text-[#00a699]" />
            Ajukan Penarikan Dana ke Rekening Bank
          </h2>
          <p className="text-xs text-muted-foreground">
            Pencairan diproses secara manual oleh tim Admin Krafita dalam 1x24 jam kerja.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nominal Payout */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Nominal Penarikan (Rp) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPayoutForm((prev) => ({ ...prev, amount: balanceData.availableBalance }))
                  }
                  className="text-[11px] text-[#00a699] font-bold hover:underline"
                >
                  Tarik Semua
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-muted-foreground">
                  Rp
                </span>
                <input
                  type="number"
                  min={10000}
                  step={5000}
                  required
                  value={payoutForm.amount}
                  onChange={(e) =>
                    setPayoutForm((prev) => ({ ...prev, amount: Number(e.target.value) || 0 }))
                  }
                  className="w-full h-10 pl-10 pr-3.5 text-xs font-mono font-bold bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">Minimal penarikan: Rp 10.000</p>
            </div>

            {/* Nama Bank */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Bank Tujuan <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={payoutForm.bankName}
                onChange={(e) => setPayoutForm((prev) => ({ ...prev, bankName: e.target.value }))}
                className="w-full h-10 px-3 text-xs bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699] cursor-pointer"
              >
                {SUPPORTED_BANKS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nomor Rekening */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Nomor Rekening Bank <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={payoutForm.accountNo}
                onChange={(e) =>
                  setPayoutForm((prev) => ({
                    ...prev,
                    accountNo: e.target.value.replace(/[^0-9]/g, ''),
                  }))
                }
                placeholder="Contoh: 1234567890"
                className="w-full h-10 px-3.5 text-xs font-mono bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>

            {/* Nama Pemilik Rekening (Verifikasi Kecocokan) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  Nama Pemilik Rekening <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Wajib Cocok
                </span>
              </div>
              <input
                type="text"
                required
                value={payoutForm.accountHolder}
                onChange={(e) =>
                  setPayoutForm((prev) => ({ ...prev, accountHolder: e.target.value }))
                }
                placeholder="Nama sesuai buku tabungan"
                className="w-full h-10 px-3.5 text-xs font-bold bg-background border border-border rounded-lg focus:outline-none focus:border-[#00a699]"
              />
            </div>
          </div>

          {/* Info Peringatan Verifikasi Rekening */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Pemberitahuan Keamanan:</strong> Pastikan nama pemilik rekening sesuai dengan
              identitas pemilik toko untuk kelancaran verifikasi manual oleh tim finance Krafita.
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || balanceData.availableBalance < 10000}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00a699] hover:bg-[#008f84] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim Pengajuan...
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Kirim Pengajuan Payout
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Tabel Riwayat Payout */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-foreground border-b border-border/60 pb-2.5">
          Riwayat Pengajuan Penarikan Dana
        </h2>

        {balanceData.payoutHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Belum ada riwayat pengajuan penarikan dana.
          </div>
        ) : (
          <div className="divide-y divide-border/60 overflow-x-auto">
            {balanceData.payoutHistory.map((req: PayoutHistoryItem) => (
              <div
                key={req.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">
                      {req.bank_name} • {req.account_no}
                    </span>
                    <span className="text-muted-foreground">({req.account_holder})</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Diajukan pada:{' '}
                    {new Date(req.created_at).toLocaleString('id-ID', {
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
                    {formatPrice(Number(req.amount))}
                  </span>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      req.status === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : req.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}
                  >
                    {req.status === 'paid' && 'Selesai Dicairkan'}
                    {req.status === 'pending' && 'Menunggu Diproses'}
                    {req.status === 'rejected' && 'Ditolak'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
