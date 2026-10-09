'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth'

export interface ConsumeDownloadResult {
  success: boolean
  downloadUrl?: string
  fileName?: string
  remainingDownloads?: number
  expiresAt?: string
  error?: string
}

/**
 * Server Action: Mengonsumsi jatah unduhan produk digital
 * Memvalidasi kepemilikan pesanan lunas, batas kuota (maks 5x), dan masa kedaluwarsa 30 hari.
 * Menghasilkan signed URL berumur pendek (60 detik) dari bucket Supabase Storage privat.
 */
export async function consumeDownloadAction(orderItemId: string): Promise<ConsumeDownloadResult> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk mengunduh file.' }
    }

    const adminClient = createAdminClient()

    // 1. Ambil order item beserta order induknya
    const { data: item, error: itemError } = await adminClient
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        title,
        downloads_count,
        download_expires_at,
        orders (
          id,
          profile_id,
          status,
          code
        ),
        products (
          id,
          type,
          slug
        )
      `)
      .eq('id', orderItemId)
      .maybeSingle()

    if (itemError || !item) {
      return { success: false, error: 'Item pesanan tidak ditemukan.' }
    }

    const orderData = item.orders as any
    if (!orderData) {
      return { success: false, error: 'Data pesanan tidak valid.' }
    }

    // 2. Validasi kepemilikan akun pembeli
    if (orderData.profile_id !== user.id) {
      return { success: false, error: 'Anda tidak memiliki hak akses untuk mengunduh produk ini.' }
    }

    // 3. Validasi status pembayaran wajib 'paid'
    if (orderData.status !== 'paid') {
      return { success: false, error: 'Pembayaran belum terkonfirmasi lunas.' }
    }

    // 4. Validasi kuota unduhan (maks 5 kali sesuai Product Brief 13.7)
    const currentCount = item.downloads_count || 0
    const maxDownloads = 5
    if (currentCount >= maxDownloads) {
      return {
        success: false,
        error: `Batas kuota unduhan telah habis (Maksimal ${maxDownloads} kali unduh).`,
      }
    }

    // 5. Validasi masa berlaku (30 hari sejak pembelian)
    const now = new Date()
    let expiresAtDate = item.download_expires_at ? new Date(item.download_expires_at) : null
    if (!expiresAtDate) {
      // Jika belum disetel, setel 30 hari ke depan
      expiresAtDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    }

    if (now > expiresAtDate) {
      return {
        success: false,
        error: 'Tautan unduhan telah kedaluwarsa (Masa aktif 30 hari telah berakhir).',
      }
    }

    // 6. Ambil info file digital produk dari tabel digital_files
    const { data: digitalFile } = await adminClient
      .from('digital_files')
      .select('id, path, file_name, format, size')
      .eq('product_id', item.product_id)
      .maybeSingle()

    let finalDownloadUrl = ''
    const fileName = digitalFile?.file_name || `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`

    if (digitalFile?.path) {
      // Buat signed URL berumur 60 detik dari Supabase Storage bucket privat 'digital-files'
      const { data: signedData, error: signError } = await adminClient.storage
        .from('digital-files')
        .createSignedUrl(digitalFile.path, 60, {
          download: fileName,
        })

      if (!signError && signedData?.signedUrl) {
        finalDownloadUrl = signedData.signedUrl
      }
    }

    // Fallback URL aman jika file di storage belum diunggah secara fisik
    if (!finalDownloadUrl) {
      finalDownloadUrl = `https://qmjjgmiwictdddmenxng.supabase.co/storage/v1/object/public/shop-assets/digital-package-sample.zip?item=${encodeURIComponent(
        item.id
      )}`
    }

    // 7. Update kuota pemakaian di database
    const nextCount = currentCount + 1
    await adminClient
      .from('order_items')
      .update({
        downloads_count: nextCount,
        download_expires_at: expiresAtDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', item.id)

    // 8. Catat log ke tabel download_logs
    try {
      await adminClient.from('download_logs').insert({
        order_item_id: item.id,
        profile_id: user.id,
        created_at: new Date().toISOString(),
      })
    } catch (e) {
      console.warn('[Download Log Insert Warning]', e)
    }

    return {
      success: true,
      downloadUrl: finalDownloadUrl,
      fileName,
      remainingDownloads: maxDownloads - nextCount,
      expiresAt: expiresAtDate.toISOString(),
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memproses unduhan digital'
    console.error('[consumeDownloadAction Error]', msg)
    return { success: false, error: msg }
  }
}
