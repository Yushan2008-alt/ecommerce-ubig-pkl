import React from 'react'
import { getVendorProductsAction } from '@/actions/vendor'
import { VendorProductsClient } from '@/components/vendor/vendor-products-client'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Katalog Produk Saya — Krafita Vendor Center',
}

export default async function VendorProductsPage() {
  const res = await getVendorProductsAction('all')

  if (!res.success || !res.products) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
        <h1 className="text-base font-bold text-foreground">Gagal Memuat Produk</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {res.error || 'Terjadi kesalahan saat mengambil daftar produk toko Anda.'}
        </p>
      </div>
    )
  }

  return <VendorProductsClient initialProducts={res.products} />
}
