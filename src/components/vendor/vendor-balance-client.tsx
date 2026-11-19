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
  Clock,
} from 'lucide-react'
import { requestPayoutAction, getVendorBalanceDataAction } from '@/actions/vendor'
import type { PayoutInput } from '@/lib/validators'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  formatNumberWithDots,
  unformatNumber,
  formatTimeAgo,
  formatFullDate,
} from '@/lib/utils'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { NumberInput } from '@/components/ui/number-input'
import { SearchableSelect } from '@/components/ui/searchSelect'
import {
  INDONESIA_BANKS,
  getBankLabel,
  resolveBankValue,
} from '@/lib/shop-helper'

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
    bankDetails?: {
      bankName: string
      accountNo: string
      accountHolder: string
    }
  }
  vendorDisplayName?: string
}

export const SUPPORTED_BANKS = INDONESIA_BANKS.map((b) => b.label)

export function VendorBalanceClient({
  initialData,
  vendorDisplayName = '',
}: VendorBalanceClientProps) {
  const [balanceData, setBalanceData] = useState(initialData)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Ambil data rekening terakhir dari riwayat jika ada, atau dari profil toko
  const lastPayout = initialData.payoutHistory[0]
  const defaultBank = lastPayout?.bank_name || initialData.bankDetails?.bankName || ''
  const defaultAccountNo = lastPayout?.account_no || initialData.bankDetails?.accountNo || ''
  const defaultAccountHolder =
    lastPayout?.account_holder || initialData.bankDetails?.accountHolder || vendorDisplayName || ''

  const [payoutForm, setPayoutForm] = useState({
    amount: formatNumberWithDots(Math.min(initialData.availableBalance, 100000)),
    bankName: resolveBankValue(defaultBank) || defaultBank,
    accountNo: defaultAccountNo,
    accountHolder: defaultAccountHolder,
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

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const parsedAmount = unformatNumber(payoutForm.amount)

    if (parsedAmount < 10000) {
      toast.error('Minimal penarikan dana adalah Rp 10.000.')
      return
    }

    if (parsedAmount > balanceData.availableBalance) {
      toast.error('Nominal penarikan melebihi saldo bersih yang tersedia.')
      return
    }

    if (!payoutForm.bankName || !payoutForm.bankName.trim() || payoutForm.bankName.trim().length < 2) {
      toast.error('Silakan pilih bank tujuan penarikan dana.')
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

    setShowConfirmModal(true)
  }

  const handleConfirmPayout = async () => {
    const parsedAmount = unformatNumber(payoutForm.amount)
    setSubmitting(true)
    setErrorMsg(null)

    try {
      const payload: PayoutInput = {
        amount: parsedAmount,
        bankName: payoutForm.bankName,
        accountNo: payoutForm.accountNo.trim(),
        accountHolder: payoutForm.accountHolder.trim(),
      }

      const res = await requestPayoutAction(payload)

      if (res.success) {
        toast.success('Penarikan dana berhasil diproses ke rekening Anda!')
        setShowConfirmModal(false)
        // Kurangi saldo di state lokal dan tambahkan ke riwayat (status langsung Selesai)
        const newAvailable = Math.max(0, balanceData.availableBalance - payload.amount)
        setBalanceData((prev) => ({
          ...prev,
          availableBalance: newAvailable,
          pendingPaidPayouts: prev.pendingPaidPayouts + payload.amount,
          payoutHistory: [
            {
              id: res.payoutId || Math.random().toString(),
              amount: payload.amount,
              bank_name: payload.bankName,
              account_no: payload.accountNo,
              account_holder: payload.accountHolder,
              status: 'paid',
              created_at: new Date().toISOString(),
              paid_at: new Date().toISOString(),
            },
            ...prev.payoutHistory,
          ],
        }))
        setPayoutForm((prev) => ({
          ...prev,
          amount: formatNumberWithDots(Math.min(newAvailable, 100000)),
        }))
      } else {
        setErrorMsg(res.error || 'Gagal memproses penarikan dana.')
        toast.error(res.error || 'Gagal memproses penarikan')
      }
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan atau server.')
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* 1. Header Toolbar */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Saldo
          </h1>
        </div>

        {/* 2. 3 Kartu Saldo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full min-w-0">
          {/* Saldo Tersedia */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Saldo</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatPrice(balanceData.availableBalance)}
              </h2>
          
            </div>
          </div>

          {/* Total Pendapatan Bersih Selesai */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Total Penjualan</span>
              <div className="w-8 h-8 rounded-lg bg-[#00a699]/10 text-[#00a699] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">
                {formatPrice(balanceData.totalNetCompleted)}
              </h2>
           
            </div>
          </div>

          {/* Total Penarikan (Pending / Paid) */}
          <div className="p-5 rounded-2xl bg-card border border-border/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Saldo Ditarik</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">
                {formatPrice(balanceData.pendingPaidPayouts)}
              </h2>
             
            </div>
          </div>
        </div>

        {/* 3. Form Request Payout & Verifikasi Rekening */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Building className="w-4 h-4 text-[#00a699]" />
              Ajukan Penarikan Dana ke Rekening Bank
            </h2>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleOpenConfirm} className="space-y-4">
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
                      setPayoutForm((prev) => ({
                        ...prev,
                        amount: formatNumberWithDots(balanceData.availableBalance),
                      }))
                    }
                    className="text-[11px] text-[#00a699] font-bold hover:underline cursor-pointer"
                  >
                    Tarik Semua
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-semibold text-muted-foreground z-10">
                    Rp
                  </span>
                  <NumberInput
                    required
                    value={payoutForm.amount}
                    onChange={(e) =>
                      setPayoutForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    placeholder="0"
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
                <SearchableSelect
                  options={INDONESIA_BANKS}
                  value={payoutForm.bankName}
                  onChange={(val) => setPayoutForm((prev) => ({ ...prev, bankName: val }))}
                  placeholder="Pilih Bank Tujuan..."
                  searchPlaceholder="Cari nama bank (BCA, Mandiri, BRI, BSI, dll)..."
                />
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

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting || balanceData.availableBalance < 10000}
                className="inline-flex items-center justify-center min-w-[90px] px-6 py-2.5 rounded-xl bg-[#00a699] hover:bg-[#008f84] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 4. Tabel Riwayat Pengajuan */}
        <div className="rounded-2xl bg-card border border-border/80 shadow-xs overflow-hidden w-full max-w-full min-w-0">
          <div className="p-5 border-b border-border/60">
            <h2 className="text-sm font-bold text-foreground">
              Riwayat Pengajuan
            </h2>
          </div>

          {balanceData.payoutHistory.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              Belum ada riwayat pengajuan penarikan dana.
            </div>
          ) : (
            <>
              {/* Desktop Table View (Hidden on mobile) */}
              <div className="hidden md:block w-full max-w-full min-w-0 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[640px] h-auto">
                  <thead className="bg-muted/30 text-muted-foreground font-semibold border-b border-border/80">
                    <tr>
                      <th className="py-3.5 px-4 w-[35%]">Rekening Tujuan</th>
                      <th className="py-3.5 px-4 w-[25%]">Nominal</th>
                      <th className="py-3.5 px-4 w-[20%] text-center">Status</th>
                      <th className="py-3.5 px-4 w-[20%] text-right whitespace-nowrap">Waktu Pengajuan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {balanceData.payoutHistory.map((req: PayoutHistoryItem) => (
                      <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                        {/* Rekening Tujuan */}
                        <td className="py-4 px-4 align-middle">
                          <div className="space-y-0.5">
                            <span className="font-bold text-foreground block">
                              {getBankLabel(req.bank_name) || req.bank_name || 'Bank'} • {req.account_no}
                            </span>
                            <span className="text-[11px] text-muted-foreground block">
                              a.n. {req.account_holder}
                            </span>
                          </div>
                        </td>

                        {/* Nominal */}
                        <td className="py-4 px-4 align-middle">
                          <span className="font-bold text-foreground text-xs">
                            {formatPrice(Number(req.amount))}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center align-middle">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              req.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                                : req.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            }`}
                          >
                            {req.status === 'paid' && 'Paid'}
                            {req.status === 'pending' && 'Pending'}
                            {req.status === 'rejected' && 'Rejected'}
                          </span>
                        </td>

                        {/* Waktu Pengajuan (time-ago + tooltip waktu lengkap) */}
                        <td className="py-4 px-4 text-right align-middle">
                          <Tooltip>
                            <TooltipTrigger
                              type="button"
                              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer underline decoration-dotted underline-offset-2 transition-colors inline-flex items-center gap-1.5 justify-end"
                              title={formatFullDate(req.created_at)}
                            >
                              <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                              <span suppressHydrationWarning>
                                {formatTimeAgo(req.created_at)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="end">
                              {formatFullDate(req.created_at)}
                            </TooltipContent>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (md:hidden) */}
              <div className="md:hidden divide-y divide-border/60">
                {balanceData.payoutHistory.map((req: PayoutHistoryItem) => (
                  <div key={req.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-foreground">
                        {getBankLabel(req.bank_name) || req.bank_name || 'Bank'} • {req.account_no}
                      </span>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : req.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        }`}
                      >
                        {req.status === 'paid' && 'Paid'}
                        {req.status === 'pending' && 'Pending'}
                        {req.status === 'rejected' && 'Rejected'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="text-muted-foreground text-[11px]">
                        a.n. {req.account_holder}
                      </span>
                      <span className="font-black text-sm text-[#00a699]">
                        {formatPrice(Number(req.amount))}
                      </span>
                    </div>

                    <div className="text-right text-[11px] text-muted-foreground pt-1" suppressHydrationWarning>
                      {formatTimeAgo(req.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 5. Pop-up Dialog Konfirmasi Penarikan */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-card border border-border/80 shadow-lg">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-base font-bold text-foreground">
                Konfirmasi Penarikan
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                Periksa kembali data rekening.
              </p>
            </DialogHeader>

            {/* Rincian Rekening (Warna lembut, tidak mencolok) */}
            <div className="space-y-3 py-2">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nominal</span>
                  <span className="font-bold text-foreground text-sm">
                    {formatPrice(unformatNumber(payoutForm.amount))}
                  </span>
                </div>
                <div className="border-t border-border/50 pt-2 flex items-center justify-between">
                  <span className="text-muted-foreground">Bank Tujuan</span>
                  <span className="font-semibold text-foreground">
                    {getBankLabel(payoutForm.bankName) || payoutForm.bankName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">No. Rekening</span>
                  <span className="font-mono font-bold text-foreground">
                    {payoutForm.accountNo}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nama Pemilik</span>
                  <span className="font-semibold text-foreground">
                    {payoutForm.accountHolder}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-border/80 bg-background hover:bg-muted text-foreground transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmPayout}
                className="inline-flex items-center justify-center min-w-[80px] px-5 py-2 text-xs font-bold rounded-xl bg-[#00a699] hover:bg-[#008f84] disabled:opacity-50 text-white transition-all shadow-xs cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim'
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
