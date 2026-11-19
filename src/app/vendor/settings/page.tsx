import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { VendorSettingsClient } from '@/components/vendor/vendor-settings-client'
import { AlertCircle } from 'lucide-react'
import { parseShopMetadata } from '@/lib/shop-helper'

export const metadata = {
  title: 'Pengaturan | Krafita',
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

  const meta = parseShopMetadata(shop.description)

  return (
    <VendorSettingsClient
      initialShop={{
        ...shop,
        description:
          meta.bio ||
          (shop.description && !shop.description.trim().startsWith('{') ? shop.description : '') ||
          '',
        bank_name: (shop as any).bank_name || meta.bank_name || '',
        bank_account_number: (shop as any).bank_account_number || meta.bank_account_number || '',
        bank_account_holder: (shop as any).bank_account_holder || meta.bank_account_holder || '',
      }}
    />
  )
}
