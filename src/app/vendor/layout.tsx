import React from 'react'
import { requireVendor } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { VendorSidebar } from '@/components/vendor/vendor-sidebar'

export const metadata = {
  title: 'Dashboard Vendor — Krafita Vendor Center',
  description: 'Kelola produk, pantau pesanan masuk, saldo penjualan, dan pengaturan toko Krafita.',
}

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await requireVendor('/vendor')
  const supabase = await createClient()

  // Ambil data toko milik vendor
  const { data: shop } = await supabase
    .from('shops')
    .select('name, slug, logo_url, status')
    .eq('profile_id', user.id)
    .single()

  const safeShop = shop || {
    name: 'Toko Krafita',
    slug: 'toko',
    logo_url: null,
    status: 'active',
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-background flex flex-col lg:flex-row">
      <VendorSidebar
        shop={safeShop}
        user={{ email: user.email }}
        profile={{
          display_name: profile?.display_name,
          avatar_url: profile?.avatar_url,
        }}
      />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  )
}
