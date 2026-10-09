import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { VendorSettingsClient } from '@/components/vendor/vendor-settings-client'
import { AlertCircle } from 'lucide-react'

export const metadata = {
  title: 'Pengaturan Toko — Krafita Vendor Center',
}

export default async function VendorSettingsPage() {
  const { user } = await getUser()
  const supabase = await createClient()

  const { data: shop, error } = await supabase
    .from('shops')
    .select('*')
    .eq('profile_id', user!.id)
    .single()

  if (error || !shop) {
    return (
      <div className="p-8 text-center bg-card rounded-2xl border border-border">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
        <h1 className="text-base font-bold text-foreground">Toko Tidak Ditemukan</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Data toko untuk akun Anda belum tersedia.
        </p>
      </div>
    )
  }

  return <VendorSettingsClient initialShop={shop} />
}
