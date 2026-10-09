import React from 'react'
import { getVendorBalanceDataAction } from '@/actions/vendor'
import { getUser } from '@/lib/auth'
import { VendorBalanceClient } from '@/components/vendor/vendor-balance-client'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Saldo & Penarikan Dana (Payout) — Krafita Vendor Center',
}

export default async function VendorBalancePage() {
  const [res, { profile }] = await Promise.all([
    getVendorBalanceDataAction(),
    getUser(),
  ])

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
        <h1 className="text-base font-bold text-foreground">Gagal Memuat Saldo</h1>
        <p className="text-xs text-muted-foreground mt-1">
          {res.error || 'Terjadi kesalahan sistem saat mengambil data saldo toko Anda.'}
        </p>
      </div>
    )
  }

  return (
    <VendorBalanceClient
      initialData={res.data}
      vendorDisplayName={profile?.display_name || ''}
    />
  )
}
