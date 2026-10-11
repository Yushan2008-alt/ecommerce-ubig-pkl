'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth'
import { parseShopMetadata, serializeShopMetadata } from '@/lib/shop-helper'
import type { Database, ShopMetadata, ShopStatus } from '@/types/database'

type Shop = Database['public']['Tables']['shops']['Row']

export interface VendorApplicationItem {
  shop: Shop
  metadata: ShopMetadata
  applicant: {
    id: string
    displayName: string
    email: string | null
    role: string
  }
}

/**
 * 1. GET ALL VENDOR APPLICATIONS (FOR MODERATOR)
 */
export async function getPendingVendorsAction(): Promise<{
  success: boolean
  applications?: VendorApplicationItem[]
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || !profile) {
      return { success: false, error: 'Silakan login terlebih dahulu.' }
    }

    if (profile.role !== 'moderator') {
      return { success: false, error: 'Akses ditolak: Hanya untuk role Moderator.' }
    }

    const admin = createAdminClient()

    // Ambil semua toko
    const { data: shops, error: shopsErr } = await admin
      .from('shops')
      .select('*')
      .order('created_at', { ascending: false })

    if (shopsErr) {
      return { success: false, error: shopsErr.message }
    }

    // Ambil data profil pemilik toko
    const profileIds = (shops || []).map((s) => s.profile_id)
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, display_name, role')
      .in('id', profileIds)

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]))

    const applications: VendorApplicationItem[] = (shops || []).map((shop) => {
      const p = profileMap.get(shop.profile_id)
      const meta = parseShopMetadata(shop.description)

      return {
        shop,
        metadata: meta,
        applicant: {
          id: shop.profile_id,
          displayName: p?.display_name || shop.name,
          email: shop.email || null,
          role: p?.role || 'member',
        },
      }
    })

    return { success: true, applications }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat daftar aplikasi vendor'
    return { success: false, error: msg }
  }
}

/**
 * 2. APPROVE VENDOR APPLICATION (MODERATOR ACTION)
 */
export async function approveVendorAction(shopId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'moderator') {
      return { success: false, error: 'Akses ditolak: Hanya untuk role Moderator.' }
    }

    const admin = createAdminClient()

    // Ambil data toko
    const { data: shop, error: getErr } = await admin
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single()

    if (getErr || !shop) {
      return { success: false, error: 'Toko tidak ditemukan.' }
    }

    const currentMeta = parseShopMetadata(shop.description)
    const updatedMeta: ShopMetadata = {
      ...currentMeta,
      verified_at: new Date().toISOString(),
      moderator_notes: undefined,
    }

    // Update status toko menjadi 'approved'
    const { error: shopUpdateErr } = await admin
      .from('shops')
      .update({
        status: 'approved',
        description: serializeShopMetadata(updatedMeta),
        updated_at: new Date().toISOString(),
      })
      .eq('id', shopId)

    if (shopUpdateErr) {
      return { success: false, error: shopUpdateErr.message }
    }

    // Update role profil pemilik toko menjadi 'vendor'
    await admin
      .from('profiles')
      .update({
        role: 'vendor',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shop.profile_id)

    revalidatePath('/moderator/vendors')
    revalidatePath('/sell')
    revalidatePath('/vendor')

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyetujui toko'
    return { success: false, error: msg }
  }
}

/**
 * 3. REJECT VENDOR APPLICATION (MODERATOR ACTION)
 */
export async function rejectVendorAction(
  shopId: string,
  reason: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'moderator') {
      return { success: false, error: 'Akses ditolak: Hanya untuk role Moderator.' }
    }

    if (!reason.trim()) {
      return { success: false, error: 'Alasan penolakan wajib disertakan.' }
    }

    const admin = createAdminClient()

    const { data: shop, error: getErr } = await admin
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single()

    if (getErr || !shop) {
      return { success: false, error: 'Toko tidak ditemukan.' }
    }

    const currentMeta = parseShopMetadata(shop.description)
    const updatedMeta: ShopMetadata = {
      ...currentMeta,
      moderator_notes: reason.trim(),
    }

    // Update status toko menjadi 'rejected'
    const { error: shopUpdateErr } = await admin
      .from('shops')
      .update({
        status: 'rejected',
        description: serializeShopMetadata(updatedMeta),
        updated_at: new Date().toISOString(),
      })
      .eq('id', shopId)

    if (shopUpdateErr) {
      return { success: false, error: shopUpdateErr.message }
    }

    revalidatePath('/moderator/vendors')
    revalidatePath('/sell')

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menolak pendaftaran toko'
    return { success: false, error: msg }
  }
}

/**
 * 4. TOGGLE MODERATOR ROLE (UNTUK KEMUDAHAN TESTING & DEMO)
 */
export async function toggleModeratorRoleAction(): Promise<{
  success: boolean
  newRole?: string
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || !profile) {
      return { success: false, error: 'Silakan login terlebih dahulu.' }
    }

    const admin = createAdminClient()
    const targetRole = profile.role === 'moderator' ? 'vendor' : 'moderator'

    const { error } = await admin
      .from('profiles')
      .update({
        role: targetRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/')
    revalidatePath('/moderator/vendors')
    revalidatePath('/sell')
    revalidatePath('/vendor')
    revalidatePath('/account')

    return { success: true, newRole: targetRole }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal beralih role'
    return { success: false, error: msg }
  }
}
