'use client'

import React from 'react'
import {
  Printer,
  Package,
  X,
  Truck,
  Building,
  MapPin,
  Calendar,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface VendorPrintReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  order: any | null
}

export function VendorPrintReceiptModal({
  isOpen,
  onClose,
  order,
}: VendorPrintReceiptModalProps) {
  if (!order) return null

  const displayInvoice = order.invoiceNumber || order.orderCode || 'INV-2026-00000'
  const trackingNumber =
    order.trackingNumber || `MOCK-ECC${displayInvoice.replace(/^#/, '')}`

  const shipping = order.shippingAddress || {}
  const recipientName =
    shipping.recipientName ||
    shipping.recipient_name ||
    shipping.name ||
    order.buyer?.name ||
    'Penerima'

  const recipientPhone =
    shipping.phone ||
    shipping.phone_number ||
    order.buyer?.phone ||
    '-'

  const addressLine =
    shipping.addressLine ||
    shipping.address_line ||
    shipping.street ||
    ''
  const village = shipping.village || shipping.subdistrict || ''
  const district = shipping.district || shipping.sub_district || ''
  const city = shipping.city || shipping.city_name || 'Kota'
  const province = shipping.province || shipping.province_name || ''
  const postalCode = shipping.postalCode || shipping.postal_code || ''

  const fullAddress = [
    addressLine,
    village ? `Desa/Kel. ${village}` : '',
    district ? `Kec. ${district}` : '',
    city,
    province,
    postalCode,
  ]
    .filter(Boolean)
    .join(', ')

  const courierName =
    shipping.courier || shipping.courier_name || shipping.shippingService || 'AnterAja ND'

  const formatPrice = (num: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/80 shadow-2xl rounded-2xl bg-card print:p-0 print:border-none print:shadow-none">
        {/* Header Modal */}
        <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between print:hidden">
          <DialogTitle className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#00a699]" />
            Cetak Label Resi Pengiriman
          </DialogTitle>
        </div>

        {/* Shipping Label Box (Format Thermal Label 100x150 mm) */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          <div
            id="printable-shipping-label"
            className="border-2 border-dashed border-border/90 rounded-xl p-4 bg-background text-foreground space-y-3 print:border-solid print:border-black print:rounded-none print:p-4 print:text-black font-sans"
          >
            {/* Header Label: Brand & Ekspedisi */}
            <div className="flex items-center justify-between border-b-2 border-foreground/80 pb-2.5">
              <div>
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase block">
                  Marketplace Shipping
                </span>
                <span className="text-base font-black tracking-tight text-foreground">
                  KRAFITA
                </span>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-0.5 rounded bg-foreground text-background font-black text-xs uppercase tracking-wider">
                  {courierName}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground block mt-0.5">
                  Layanan Reguler
                </span>
              </div>
            </div>

            {/* Barcode & Nomor Resi */}
            <div className="text-center py-2 border-b border-foreground/30 space-y-1">
              {/* Representasi Garis Barcode Elegan */}
              <div className="flex items-center justify-center gap-[2px] h-10 w-full max-w-[260px] mx-auto opacity-90 overflow-hidden">
                {[
                  3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 1, 3, 2, 4, 1, 2, 3,
                  1, 4, 2, 1, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 1, 3, 2, 1, 4, 2, 3, 1,
                ].map((w, i) => (
                  <div
                    key={i}
                    style={{ width: `${w}px` }}
                    className="h-full bg-foreground shrink-0"
                  />
                ))}
              </div>
              <p className="font-mono font-bold text-sm sm:text-base tracking-widest uppercase">
                {trackingNumber}
              </p>
              <p className="text-[10px] font-mono text-muted-foreground">
                No. Invoice: {displayInvoice}
              </p>
            </div>

            {/* Penerima & Pengirim (2 Kolom) */}
            <div className="grid grid-cols-2 gap-3 text-xs border-b border-foreground/30 pb-2.5">
              {/* Kolom Penerima */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Kepada:
                </span>
                <p className="font-bold text-foreground text-xs leading-tight">
                  {recipientName}
                </p>
                <p className="text-[11px] font-mono text-muted-foreground">
                  {recipientPhone}
                </p>
                <p className="text-[11px] text-foreground leading-snug line-clamp-3 pt-0.5">
                  {fullAddress || 'Alamat pembeli'}
                </p>
              </div>

              {/* Kolom Pengirim */}
              <div className="space-y-0.5 border-l border-foreground/20 pl-2.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                  Dari:
                </span>
                <p className="font-bold text-foreground text-xs leading-tight">
                  Toko Vendor Krafita
                </p>
                <p className="text-[11px] text-muted-foreground leading-snug pt-0.5">
                  Origin: {city}
                </p>
                <div className="pt-1.5">
                  <span className="text-[10px] text-muted-foreground block">
                    Berat Paket:
                  </span>
                  <span className="font-bold text-xs">250 gram</span>
                </div>
              </div>
            </div>

            {/* Detail Produk & Catatan */}
            <div className="text-xs space-y-1 pt-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                Isi Paket:
              </span>
              <p className="font-medium text-foreground line-clamp-2 leading-tight">
                {order.qty}x {order.title}
              </p>
              <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground">
                <span>Total: {formatPrice(order.price * order.qty)}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Lunas (Non-COD)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <DialogFooter className="p-4 border-t border-border/60 flex flex-row items-center justify-end gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Tutup
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="h-9 px-5 text-xs font-semibold bg-[#00a699] hover:bg-[#008f84] text-white rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Label
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

