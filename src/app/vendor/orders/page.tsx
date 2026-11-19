import React from 'react'
import { getVendorOrdersAction } from '@/actions/vendor'
import { VendorOrdersClient } from '@/components/vendor/vendor-orders-client'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Pesanan | Krafita',
}

interface VendorOrdersPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VendorOrdersPage({ searchParams }: VendorOrdersPageProps) {
  const params = await searchParams
  const initialStatus = typeof params.status === 'string' ? params.status : 'all'
  const initialSearch = typeof params.q === 'string' ? params.q : typeof params.code === 'string' ? params.code : ''

  // Ambil seluruh pesanan toko agar filter status dan jumlah count akurat di client
  const res = await getVendorOrdersAction('all')

  if (!res.success || !res.orders) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
        <h1 className="text-base font-bold text-foreground">Gagal Memuat Pesanan</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {res.error || 'Terjadi kesalahan sistem saat memuat pesanan toko Anda.'}
        </p>
      </div>
    )
  }

  return (
    <VendorOrdersClient
      initialOrders={res.orders}
      initialFilter={initialStatus}
      initialSearchQuery={initialSearch}
    />
  )
}
