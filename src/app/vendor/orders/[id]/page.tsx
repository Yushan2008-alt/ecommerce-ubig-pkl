import React from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { getVendorOrderDetailAction } from '@/actions/vendor'
import { VendorOrderDetailClient } from '@/components/vendor/vendor-order-detail-client'

export const metadata = {
  title: 'Detail Pesanan | Krafita',
}

interface VendorOrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function VendorOrderDetailPage({
  params,
}: VendorOrderDetailPageProps) {
  const { id } = await params
  const res = await getVendorOrderDetailAction(id)

  if (!res.success || !res.order) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border max-w-lg mx-auto space-y-4 my-8">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">Gagal Memuat Pesanan</h2>
          <p className="text-xs text-muted-foreground">
            {res.error || 'Pesanan tidak ditemukan atau Anda tidak memiliki akses ke rincian pesanan ini.'}
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

  return <VendorOrderDetailClient initialOrder={res.order} />
}
