import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  AlertCircle,
  Phone,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  X,
} from 'lucide-react'
import { getVendorOrderDetailAction } from '@/actions/vendor'
import { formatFullDate } from '@/lib/utils'

export const metadata = {
  title: 'Profil Pembeli | Krafita',
}

interface VendorBuyerProfilePageProps {
  params: Promise<{ id: string }>
}

export default async function VendorBuyerProfilePage({
  params,
}: VendorBuyerProfilePageProps) {
  const { id } = await params
  const res = await getVendorOrderDetailAction(id)

  if (!res.success || !res.order) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border max-w-lg mx-auto space-y-4 my-8">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">Data Pembeli Tidak Ditemukan</h2>
          <p className="text-xs text-muted-foreground">
            {res.error || 'Pesanan tidak ditemukan atau Anda tidak memiliki akses ke pesanan ini.'}
          </p>
        </div>
        <Link
          href="/vendor/orders"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Pesanan
        </Link>
      </div>
    )
  }

  const { order } = res
  const shipping = order.shippingAddress || {}
  const buyer = order.buyer || {}

  // Normalisasi data penerima & telepon
  const recipientName =
    shipping.recipientName ||
    shipping.recipient_name ||
    shipping.name ||
    buyer.name ||
    'Penerima'

  const phone =
    shipping.phone ||
    shipping.phoneNumber ||
    shipping.phone_number ||
    buyer.phone ||
    '-'

  const rawAddressLine =
    shipping.addressLine ||
    shipping.address_line ||
    shipping.street ||
    ''

  const village =
    shipping.village ||
    shipping.subdistrict ||
    shipping.kelurahan ||
    ''

  const district =
    shipping.district ||
    shipping.sub_district ||
    shipping.kecamatan ||
    ''

  const city =
    shipping.city ||
    shipping.city_name ||
    ''

  const province =
    shipping.province ||
    shipping.province_name ||
    ''

  const postalCode =
    shipping.postalCode ||
    shipping.postal_code ||
    shipping.postcode ||
    ''

  // Format alamat lengkap komprehensif
  const addressParts: string[] = []
  if (rawAddressLine) addressParts.push(rawAddressLine)
  if (village) addressParts.push(`Desa/Kel. ${village}`)
  if (district) addressParts.push(`Kec. ${district}`)
  if (city) addressParts.push(city)
  if (province) addressParts.push(province)
  if (postalCode) addressParts.push(postalCode)

  const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Alamat pengiriman tidak tersedia'

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
            <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
          </span>
        )
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800 whitespace-nowrap">
            <Truck className="w-3.5 h-3.5" /> Dalam Pengiriman
          </span>
        )
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800 whitespace-nowrap">
            <Package className="w-3.5 h-3.5" /> Sedang Dikemas
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800 whitespace-nowrap">
            <X className="w-3.5 h-3.5" /> Dibatalkan
          </span>
        )
      case 'waiting':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800 whitespace-nowrap">
            <Clock className="w-3.5 h-3.5" /> Siap Diambil
          </span>
        )
    }
  }

  // Tentukan status pesanan toko
  const firstItem = order.items && order.items.length > 0 ? order.items[0] : null
  const currentStatus = firstItem?.fulfilmentStatus || order.status || 'waiting'

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header & Tombol Kembali */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/vendor/orders"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Pesanan
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Profil Pembeli
          </h1>
        </div>
      </div>

      {/* Kartu Profil Pembeli Sesuai Referensi Gambar */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Baris Atas: Avatar, Nama, Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-border/60">
          <div className="flex items-center gap-4">
            {/* Foto Profil Pembeli (Hanya Muncul Saat Redirect Sesuai Permintaan) */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#00a699]/15 text-[#00a699] font-bold text-xl flex items-center justify-center shrink-0 border-2 border-border shadow-xs">
              {buyer.avatar ? (
                <Image
                  src={buyer.avatar}
                  alt={buyer.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>{buyer.name?.charAt(0)?.toUpperCase() || 'P'}</span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground">
                {buyer.name || 'Pelanggan'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Nama penerima: <span className="font-semibold text-foreground">{recipientName}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Pembeli pada pesanan{' '}
                <Link
                  href={`/vendor/orders/${order.id}`}
                  className="font-mono font-bold text-[#00a699] hover:underline"
                >
                  {order.invoiceNumber || `#${order.code}`}
                </Link>
              </p>
            </div>
          </div>

          {/* Badge Status */}
          <div className="shrink-0">
            {getStatusBadge(currentStatus)}
          </div>
        </div>

        {/* Informasi Kontak & Alamat Pengiriman */}
        <div className="space-y-3.5 text-xs sm:text-sm">
          {/* Nomor Telepon */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <Phone className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <span className="text-foreground font-medium">{phone}</span>
          </div>

          {/* Alamat Pengiriman */}
          <div className="flex items-start gap-3 text-muted-foreground">
            <MapPin className="w-4 h-4 text-muted-foreground/70 shrink-0 mt-0.5" />
            <p className="text-foreground leading-relaxed flex-1">
              {fullAddress}
            </p>
          </div>

          {/* Waktu Pesanan Dibuat */}
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="w-4 h-4 text-muted-foreground/70 shrink-0" />
            <p className="text-foreground">
              Pesanan dibuat {formatFullDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

