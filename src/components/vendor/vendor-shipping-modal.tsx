'use client'

import React, { useState } from 'react'
import {
  X,
  Truck,
  Package,
  Lock,
  ChevronDown,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export interface ShippingModalOrder {
  id: string
  orderId?: string
  invoiceNumber?: string
  orderCode?: string
  title: string
  price: number
  qty: number
  total?: number
}

interface VendorShippingModalProps {
  isOpen: boolean
  onClose: () => void
  order: ShippingModalOrder | null
  onProcessShipping: (
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
  ) => Promise<void>
  isSubmitting?: boolean
}

const PICKUP_SCHEDULE_OPTIONS = [
  'Jum, 20 Nov, 08.00',
  'Jum, 20 Nov, 11.00',
  'Jum, 20 Nov, 14.00',
  'Jum, 20 Nov, 17.00',
  'Sab, 21 Nov, 08.00',
  'Sab, 21 Nov, 11.00',
  'Sab, 21 Nov, 14.00',
  'Sab, 21 Nov, 17.00',
]

const SHIPPING_SERVICES = [
  {
    id: 'anteraja-nd',
    name: 'AnterAja Next Day',
    courier: 'anteraja',
    code: 'ND',
    shortName: 'AnterAja ND',
    estimate: 'Estimasi: 1 hari',
    price: 11200,
  },
  {
    id: 'anteraja-reg',
    name: 'AnterAja Regular',
    courier: 'anteraja',
    code: 'REG',
    shortName: 'AnterAja Reg',
    estimate: 'Estimasi: 1-2 hari',
    price: 7000,
  },
  {
    id: 'jtcargo-reg',
    name: 'J&T Cargo Regular',
    courier: 'jtcargo',
    code: 'REG',
    shortName: 'J&T Cargo',
    estimate: 'Estimasi: 1-3 hari',
    price: 42000,
  },
]

export function VendorShippingModal({
  isOpen,
  onClose,
  order,
  onProcessShipping,
  isSubmitting = false,
}: VendorShippingModalProps) {
  const [step, setStep] = useState<1 | 2>(1)
  // Default jadwal pickup kosong (menyuruh user memilih jadwal terlebih dahulu)
  const [pickupSchedule, setPickupSchedule] = useState('')
  // Input angka dibuat tipe teks agar user mengisi sendiri secara manual
  const [packageWeight, setPackageWeight] = useState('')
  const [packageLength, setPackageLength] = useState('')
  const [packageWidth, setPackageWidth] = useState('')
  const [packageHeight, setPackageHeight] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState<string>('anteraja-nd')

  if (!order) return null

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  const rawInvoice = order.invoiceNumber || order.orderCode || 'INV-2026-00000'
  const displayInvoice = rawInvoice.startsWith('#') ? rawInvoice : `#${rawInvoice}`
  const cleanInvoice = rawInvoice.replace(/^#/, '')
  const totalAmount = order.total ?? order.price * order.qty

  const selectedService =
    SHIPPING_SERVICES.find((s) => s.id === selectedServiceId) || SHIPPING_SERVICES[0]

  const handleClose = () => {
    setStep(1)
    setPickupSchedule('')
    setPackageWeight('')
    setPackageLength('')
    setPackageWidth('')
    setPackageHeight('')
    onClose()
  }

  // Validasi Step 1 ke Step 2
  const handleCheckShippingPrice = () => {
    if (!pickupSchedule.trim()) {
      toast.error('Silakan pilih jadwal pickup terlebih dahulu.')
      return
    }

    const weightNum = Number(packageWeight)
    const lengthNum = Number(packageLength)
    const widthNum = Number(packageWidth)
    const heightNum = Number(packageHeight)

    if (!packageWeight.trim() || isNaN(weightNum) || weightNum <= 0) {
      toast.error('Berat paket wajib diisi dengan angka lebih dari 0 gram.')
      return
    }
    if (
      !packageLength.trim() ||
      !packageWidth.trim() ||
      !packageHeight.trim() ||
      isNaN(lengthNum) ||
      isNaN(widthNum) ||
      isNaN(heightNum) ||
      lengthNum <= 0 ||
      widthNum <= 0 ||
      heightNum <= 0
    ) {
      toast.error('Panjang, lebar, dan tinggi paket wajib diisi dengan angka lebih dari 0 cm.')
      return
    }
    setStep(2)
  }

  // Proses Kirim Final (Step 2)
  const handleConfirmProcess = async () => {
    // Format nomor resi sesuai Gambar 4: MOCK-ECCINV-2026-XXXXX
    const trackingNumber = `MOCK-ECC${cleanInvoice}`

    await onProcessShipping(order.id, trackingNumber, {
      serviceName: selectedService.name,
      serviceCode: selectedService.code,
      shortName: selectedService.shortName,
      shippingCost: selectedService.price,
      weight: Number(packageWeight) || 0,
      schedule: pickupSchedule,
    })

    handleClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}
    >
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-border/80 shadow-2xl rounded-2xl bg-card">
        {/* ============================================================== */}
        {/* LANGKAH 1: PROSES PENGIRIMAN (Form KiriminAja Pickup)          */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="p-5 sm:p-6 space-y-4.5 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-border/50 pb-3">
              <div className="space-y-0.5">
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  Proses Pengiriman
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  Pesanan {cleanInvoice}
                </p>
              </div>
            </div>

            {/* 1. Metode Pengiriman */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                Metode Pengiriman
              </label>
              <div className="p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground/70 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground/80" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-tight">
                      Dikirimi Kurir
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Pengiriman menggunakan KiriminAja
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Opsi Penjemputan (Pickup Only Sesuai Permintaan Penguji) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-muted-foreground" />
                Opsi Penjemputan
              </label>
              <div className="p-3 rounded-xl border border-border/80 bg-background hover:bg-muted/20 transition-colors">
                <div className="flex items-start gap-2.5">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-foreground/70 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-foreground/80" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground leading-tight">
                      Pickup
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Kurir mengambil paket dari origin
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Jadwal Pickup & Asuransi (2 Kolom) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5">
              {/* Dropdown Jadwal Pickup: Default Placeholder Kosong */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Jadwal Pickup <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={pickupSchedule}
                    onChange={(e) => setPickupSchedule(e.target.value)}
                    className={`w-full h-10 pl-3 pr-8 text-xs font-medium bg-background border rounded-xl focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699] appearance-none cursor-pointer transition-colors ${
                      !pickupSchedule
                        ? 'text-muted-foreground border-border/80'
                        : 'text-foreground border-border/80'
                    }`}
                  >
                    <option value="" disabled>
                      Pilih jadwal pickup
                    </option>
                    {PICKUP_SCHEDULE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} className="text-foreground">
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Input Asuransi Digembok & Dinonaktifkan (Tidak Bisa Dipencet) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground block">
                  Asuransi
                </label>
                <div
                  className="flex items-center justify-between h-10 px-3 bg-muted/40 border border-border/80 rounded-xl cursor-not-allowed select-none opacity-85"
                  title="Asuransi terkunci dan diwajibkan oleh sistem"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      readOnly
                      className="w-3.5 h-3.5 rounded text-[#00a699] accent-[#00a699] cursor-not-allowed pointer-events-none"
                    />
                    <span>Pakai Asuransi</span>
                  </div>
                  <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </div>
              </div>
            </div>

            {/* 4. Bagian Data Paket */}
            <div className="space-y-2.5 pt-1">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#00a699]" />
                Data Paket
              </label>

              {/* Baris 1: Berat (Tipe Teks) & Nilai Barang (Digembok / Disabled) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground block">
                    Berat (gram) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={packageWeight}
                    onChange={(e) => setPackageWeight(e.target.value.replace(/\D/g, ''))}
                    placeholder="Contoh: 250"
                    className="w-full h-9.5 px-3 text-xs bg-background border border-border/80 rounded-xl focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {packageWeight ? `Berat paket: ${packageWeight} g` : 'Masukkan berat paket dalam satuan gram.'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground block">
                    Nilai Barang
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      disabled
                      readOnly
                      value={formatPrice(totalAmount)}
                      className="w-full h-9.5 pl-3 pr-8 text-xs font-semibold bg-muted/40 text-foreground border border-border/80 rounded-xl cursor-not-allowed select-none opacity-85"
                      title="Nilai barang terkunci otomatis dari subtotal pesanan"
                    />
                    <Lock className="w-3.5 h-3.5 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Otomatis dari subtotal pesanan
                  </p>
                </div>
              </div>

              {/* Baris 2: Dimensi Paket (P, L, T - Tipe Teks agar Diisi Sendiri) */}
              <div className="space-y-1 pt-1">
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      Panjang (cm) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={packageLength}
                      onChange={(e) => setPackageLength(e.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      className="w-full h-9 px-2.5 text-xs text-center bg-background border border-border/80 rounded-xl focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      Lebar (cm) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={packageWidth}
                      onChange={(e) => setPackageWidth(e.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      className="w-full h-9 px-2.5 text-xs text-center bg-background border border-border/80 rounded-xl focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground block">
                      Tinggi (cm) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={packageHeight}
                      onChange={(e) => setPackageHeight(e.target.value.replace(/\D/g, ''))}
                      placeholder="0"
                      className="w-full h-9 px-2.5 text-xs text-center bg-background border border-border/80 rounded-xl focus:outline-none focus:border-[#00a699] focus:ring-1 focus:ring-[#00a699]"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight pt-0.5">
                  Dimensi tidak dikirim saat cek harga, baru dipakai saat order dibuat ke KiriminAja.
                </p>
                <p className="text-[10px] text-rose-500 font-medium leading-tight">
                  Berat, panjang, lebar, dan tinggi wajib diisi dengan angka lebih dari 0.
                </p>
              </div>
            </div>

            {/* Footer Tombol Aksi Step 1 */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleCheckShippingPrice}
                className="h-9 px-5 text-xs font-bold bg-[#00a699] hover:bg-[#008f84] text-white rounded-xl shadow-xs cursor-pointer"
              >
                Cek Harga Pengiriman
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* LANGKAH 2: PILIH LAYANAN PENGIRIMAN (Referensi Gambar 3)       */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-border/50 pb-3">
              <div className="space-y-0.5">
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  Pilih Layanan Pengiriman
                </DialogTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  Pesanan {cleanInvoice}
                </p>
              </div>
            </div>

            {/* Rangkuman Atas: Berat, Nilai Barang, Metode */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-muted/30 border border-border/70 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Berat</span>
                <span className="font-bold text-foreground">{packageWeight || '0'} g</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Nilai Barang</span>
                <span className="font-bold text-foreground">{formatPrice(totalAmount)}</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Metode</span>
                <span className="font-bold text-foreground">Pickup</span>
              </div>
            </div>

            {/* Daftar Pilihan Layanan Ekspedisi */}
            <div className="space-y-2">
              <div>
                <label className="text-xs font-bold text-foreground block">
                  Pilih Layanan
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Layanan pilihan pelanggan ditandai sebagai pilihan jika tersedia.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {SHIPPING_SERVICES.map((srv) => {
                  const isSelected = selectedServiceId === srv.id
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#00a699]/40 bg-[#00a699]/5 dark:bg-[#00a699]/10 shadow-2xs'
                          : 'border-border/70 bg-background hover:bg-muted/30'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground">
                            {srv.name}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {srv.courier} · {srv.code}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {srv.estimate}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground block">
                          {formatPrice(srv.price)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Rangkuman Layanan Terpilih & Biaya Provider (Warna & Tekstur Sama Persis dengan Opsi Terpilih) */}
            <div className="p-3.5 rounded-xl border border-[#00a699]/40 bg-[#00a699]/5 dark:bg-[#00a699]/10 flex items-center justify-between text-xs transition-colors">
              <div className="space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">
                  Layanan dipilih:
                </span>
                <p className="font-bold text-foreground text-xs leading-tight">
                  {selectedService.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {selectedService.code}
                </p>
              </div>
              <div className="text-right space-y-0.5">
                <span className="text-[11px] text-muted-foreground block">
                  Biaya provider
                </span>
                <span className="font-extrabold text-sm text-[#00a699]">
                  {formatPrice(selectedService.price)}
                </span>
              </div>
            </div>

            {/* Footer Tombol Aksi Step 2 */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setStep(1)}
                className="h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Kembali
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmProcess}
                className="h-9 px-5 text-xs font-semibold bg-[#00a699] hover:bg-[#008f84] text-white rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Proses Pengiriman
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
