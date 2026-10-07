'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export interface ProfileData {
  id: string
  email: string
  role: 'member' | 'vendor'
  displayName: string | null
  phone: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Mengambil data profil user terautentikasi
 */
export async function getProfileAction(): Promise<{
  success: boolean
  data?: ProfileData
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClient()
    const { data: currentProfile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !currentProfile) {
      return {
        success: true,
        data: {
          id: user.id,
          email: user.email || '',
          role: (profile?.role as any) || 'member',
          displayName: profile?.display_name || user.user_metadata?.full_name || null,
          phone: profile?.phone || null,
          avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
          createdAt: profile?.created_at || new Date().toISOString(),
          updatedAt: profile?.updated_at || new Date().toISOString(),
        },
      }
    }

    return {
      success: true,
      data: {
        id: currentProfile.id,
        email: user.email || '',
        role: currentProfile.role,
        displayName: currentProfile.display_name,
        phone: currentProfile.phone,
        avatarUrl: currentProfile.avatar_url,
        createdAt: currentProfile.created_at,
        updatedAt: currentProfile.updated_at,
      },
    }
  } catch (err: any) {
    console.error('getProfileAction error:', err)
    return { success: false, error: err.message || 'Gagal mengambil data profil' }
  }
}

/**
 * Memperbarui nama tampilan dan nomor HP profil user
 */
export async function updateProfileAction(data: {
  displayName: string
  phone: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const trimmedName = data.displayName?.trim()
    const trimmedPhone = data.phone?.trim()

    if (!trimmedName) {
      return { success: false, error: 'Nama tampilan tidak boleh kosong' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: trimmedName,
        phone: trimmedPhone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('updateProfileAction error:', error)
      return { success: false, error: error.message }
    }

    revalidatePath('/account')
    return { success: true }
  } catch (err: any) {
    console.error('updateProfileAction error:', err)
    return { success: false, error: err.message || 'Gagal memperbarui profil' }
  }
}

/**
 * Mengunggah avatar user ke bucket 'shop-assets' Supabase Storage
 * Mengikuti RLS policy: folder auth.uid()
 */
export async function uploadAvatarAction(
  formData: FormData
): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const file = formData.get('avatar') as File | null
    if (!file) {
      return { success: false, error: 'Berkas avatar tidak ditemukan' }
    }

    // Validasi tipe berkas
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Format berkas tidak valid. Harap unggah gambar JPG, PNG, atau WebP',
      }
    }

    // Validasi ukuran berkas (maks 2MB)
    const maxSizeBytes = 2 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return { success: false, error: 'Ukuran foto profil maksimal 2MB' }
    }

    const supabase = await createClient()

    // Ekstensi berkas
    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp'
    const fileName = `avatar-${Date.now()}.${ext}`
    const filePath = `${user.id}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload ke bucket shop-assets
    const { error: uploadErr } = await supabase.storage
      .from('shop-assets')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadErr) {
      console.error('uploadAvatarAction upload error:', uploadErr)
      return { success: false, error: uploadErr.message }
    }

    // Ambil URL publik
    const { data: publicUrlData } = supabase.storage
      .from('shop-assets')
      .getPublicUrl(filePath)

    const avatarUrl = publicUrlData.publicUrl

    // Perbarui avatar_url di tabel profiles
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateErr) {
      console.error('uploadAvatarAction update profile error:', updateErr)
      return { success: false, error: updateErr.message }
    }

    revalidatePath('/account')
    return { success: true, avatarUrl }
  } catch (err: any) {
    console.error('uploadAvatarAction error:', err)
    return { success: false, error: err.message || 'Gagal mengunggah foto profil' }
  }
}
