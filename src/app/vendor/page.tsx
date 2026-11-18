import React from 'react'
import Link from 'next/link'
import { getVendorDashboardDataAction } from '@/actions/vendor'
import { VendorDashboardClient } from '@/components/vendor/vendor-dashboard-client'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Dashboard Vendor | Krafita',
}

export default async function VendorDashboardPage() {
  const res = await getVendorDashboardDataAction()

  if (!res.success || !res.data) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
        <h1 className="text-base font-bold text-foreground">Gagal Memuat Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          {res.error || 'Terjadi kesalahan sistem saat mengambil data toko.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00a699] text-white text-xs font-semibold rounded-lg"
        >
          Kembali ke Beranda
        </Link>
      </div>
    )
  }

  const { shop, metrics, recentOrders, chartData, rawSales, onboardingChecklist } = res.data

  return (
    <VendorDashboardClient
      shop={shop}
      metrics={metrics}
      recentOrders={recentOrders}
      initialChartData={chartData}
      rawSales={rawSales}
      onboardingChecklist={onboardingChecklist}
    />
  )
}
