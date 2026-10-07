'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export interface AddressItem {
  id: string
  profileId: string
  recipientName: string
  phone: string
  addressLine: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
  createdAt: string
}

export interface AddressFormData {
  recipientName: string
  phone: string
  addressLine: string
  city: string
  province: string
  postalCode: string
  isDefault?: boolean
}

/**
 * Mengambil seluruh daftar alamat pengiriman user
 */
export async function getAddressesAction(): Promise<{
  success: boolean
  data: AddressItem[]
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, data: [], error: 'Unauthorized' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('profile_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error

    const mapped: AddressItem[] = (data || []).map((addr) => ({
      id: addr.id,
      profileId: addr.profile_id,
      recipientName: addr.recipient_name,
      phone: addr.phone,
      addressLine: addr.address_line,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postal_code,
      isDefault: addr.is_default,
      createdAt: addr.created_at,
    }))

    return { success: true, data: mapped }
  } catch (err: any) {
    console.error('getAddressesAction error:', err)
    return { success: false, data: [], error: err.message }
  }
}

/**
 * Menambahkan alamat baru ke buku alamat
 */
export async function addAddressAction(
  data: AddressFormData
): Promise<{ success: boolean; data?: AddressItem; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    // Validasi field wajib
    if (!data.recipientName?.trim()) return { success: false, error: 'Nama penerima wajib diisi' }
    if (!data.phone?.trim()) return { success: false, error: 'Nomor telepon wajib diisi' }
    if (!data.addressLine?.trim()) return { success: false, error: 'Alamat lengkap wajib diisi' }
    if (!data.city?.trim()) return { success: false, error: 'Kota wajib diisi' }
    if (!data.province?.trim()) return { success: false, error: 'Provinsi wajib diisi' }
    if (!data.postalCode?.trim()) return { success: false, error: 'Kode pos wajib diisi' }

    const supabase = await createClient()

    // Cek jumlah alamat yang sudah ada
    const { count } = await supabase
      .from('addresses')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id)

    // Jika ini alamat pertama atau user memilih isDefault = true, set default
    const shouldBeDefault = count === 0 || Boolean(data.isDefault)

    if (shouldBeDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('profile_id', user.id)
    }

    const { data: newAddr, error } = await supabase
      .from('addresses')
      .insert({
        profile_id: user.id,
        recipient_name: data.recipientName.trim(),
        phone: data.phone.trim(),
        address_line: data.addressLine.trim(),
        city: data.city.trim(),
        province: data.province.trim(),
        postal_code: data.postalCode.trim(),
        is_default: shouldBeDefault,
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/account')
    revalidatePath('/checkout')

    return {
      success: true,
      data: {
        id: newAddr.id,
        profileId: newAddr.profile_id,
        recipientName: newAddr.recipient_name,
        phone: newAddr.phone,
        addressLine: newAddr.address_line,
        city: newAddr.city,
        province: newAddr.province,
        postalCode: newAddr.postal_code,
        isDefault: newAddr.is_default,
        createdAt: newAddr.created_at,
      },
    }
  } catch (err: any) {
    console.error('addAddressAction error:', err)
    return { success: false, error: err.message || 'Gagal menambahkan alamat' }
  }
}

/**
 * Memperbarui data alamat pengiriman
 */
export async function updateAddressAction(
  id: string,
  data: AddressFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    if (!data.recipientName?.trim()) return { success: false, error: 'Nama penerima wajib diisi' }
    if (!data.phone?.trim()) return { success: false, error: 'Nomor telepon wajib diisi' }
    if (!data.addressLine?.trim()) return { success: false, error: 'Alamat lengkap wajib diisi' }
    if (!data.city?.trim()) return { success: false, error: 'Kota wajib diisi' }
    if (!data.province?.trim()) return { success: false, error: 'Provinsi wajib diisi' }
    if (!data.postalCode?.trim()) return { success: false, error: 'Kode pos wajib diisi' }

    const supabase = await createClient()

    if (data.isDefault) {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('profile_id', user.id)
    }

    const { error } = await supabase
      .from('addresses')
      .update({
        recipient_name: data.recipientName.trim(),
        phone: data.phone.trim(),
        address_line: data.addressLine.trim(),
        city: data.city.trim(),
        province: data.province.trim(),
        postal_code: data.postalCode.trim(),
        ...(data.isDefault !== undefined ? { is_default: Boolean(data.isDefault) } : {}),
      })
      .match({ id, profile_id: user.id })

    if (error) throw error

    revalidatePath('/account')
    revalidatePath('/checkout')
    return { success: true }
  } catch (err: any) {
    console.error('updateAddressAction error:', err)
    return { success: false, error: err.message || 'Gagal memperbarui alamat' }
  }
}

/**
 * Menghapus alamat dari buku alamat
 */
export async function deleteAddressAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()

    // Cek apakah alamat yang dihapus adalah default
    const { data: target } = await supabase
      .from('addresses')
      .select('is_default')
      .match({ id, profile_id: user.id })
      .single()

    const { error } = await supabase
      .from('addresses')
      .delete()
      .match({ id, profile_id: user.id })

    if (error) throw error

    // Jika yang dihapus adalah default, otomatis jadikan alamat tersisa pertama sebagai default
    if (target?.is_default) {
      const { data: remaining } = await supabase
        .from('addresses')
        .select('id')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (remaining && remaining.length > 0) {
        await supabase
          .from('addresses')
          .update({ is_default: true })
          .eq('id', remaining[0].id)
      }
    }

    revalidatePath('/account')
    revalidatePath('/checkout')
    return { success: true }
  } catch (err: any) {
    console.error('deleteAddressAction error:', err)
    return { success: false, error: err.message || 'Gagal menghapus alamat' }
  }
}

/**
 * Menjadikan alamat tertentu sebagai Alamat Utama (is_default = true)
 */
export async function setDefaultAddressAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()

    // 1. Reset semua alamat user menjadi false
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('profile_id', user.id)

    // 2. Set alamat terpilih menjadi true
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .match({ id, profile_id: user.id })

    if (error) throw error

    revalidatePath('/account')
    revalidatePath('/checkout')
    return { success: true }
  } catch (err: any) {
    console.error('setDefaultAddressAction error:', err)
    return { success: false, error: err.message || 'Gagal mengubah alamat utama' }
  }
}
