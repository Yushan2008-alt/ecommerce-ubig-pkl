'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export interface WishlistProductItem {
  id: string
  productId: string
  title: string
  slug: string
  price: number
  comparePrice?: number | null
  imageUrl: string
  rating: number
  ratingCount: number
  shopName: string
  shopSlug: string
  createdAt: string
}

/**
 * Toggle tambah/hapus produk dari daftar wishlist user
 */
export async function toggleWishlistAction(
  productId: string
): Promise<{ success: boolean; isFavorited: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, isFavorited: false, error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Cek apakah produk sudah ada di wishlist
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .match({ profile_id: user.id, product_id: productId })
      .maybeSingle()

    if (existing) {
      const { error: delErr } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', existing.id)

      if (delErr) throw delErr
      revalidatePath('/wishlist')
      return { success: true, isFavorited: false }
    } else {
      const { error: insErr } = await supabase
        .from('wishlists')
        .insert({
          profile_id: user.id,
          product_id: productId,
        })

      if (insErr) throw insErr
      revalidatePath('/wishlist')
      return { success: true, isFavorited: true }
    }
  } catch (err: any) {
    console.error('toggleWishlistAction error:', err)
    return { success: false, isFavorited: false, error: err.message || 'Gagal mengubah wishlist' }
  }
}

/**
 * Mengambil daftar wishlist user dari database
 */
export async function getWishlistAction(): Promise<{
  success: boolean
  data: WishlistProductItem[]
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, data: [], error: 'Unauthorized' }
    }

    const supabase = await createClient()
    const { data: rawWishlists, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        created_at,
        products (
          id,
          title,
          slug,
          price,
          compare_price,
          rating_avg,
          rating_count,
          product_images (
            path,
            sort_order
          ),
          shops (
            name,
            slug
          )
        )
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const storageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`
    const items: WishlistProductItem[] = []

    for (const row of rawWishlists || []) {
      const prod = row.products as any
      if (!prod) continue
      const shop = prod.shops as any

      let imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
      if (prod.product_images && prod.product_images.length > 0) {
        const sorted = [...prod.product_images].sort((a, b) => a.sort_order - b.sort_order)
        const path = sorted[0]?.path
        if (path) {
          imageUrl = path.startsWith('http') ? path : `${storageBaseUrl}/${path}`
        }
      }

      items.push({
        id: row.id,
        productId: prod.id,
        title: prod.title,
        slug: prod.slug,
        price: Number(prod.price),
        comparePrice: prod.compare_price ? Number(prod.compare_price) : null,
        imageUrl,
        rating: Number(prod.rating_avg || 0),
        ratingCount: Number(prod.rating_count || 0),
        shopName: shop?.name || 'Toko Krafita',
        shopSlug: shop?.slug || '',
        createdAt: row.created_at,
      })
    }

    return { success: true, data: items }
  } catch (err: any) {
    console.error('getWishlistAction error:', err)
    return { success: false, data: [], error: err.message }
  }
}

/**
 * Menggabungkan wishlist lokal guest ke database user saat login
 */
export async function mergeGuestWishlistAction(
  productIds: string[]
): Promise<{ success: boolean; count: number }> {
  try {
    const { user } = await getUser()
    if (!user || !productIds || productIds.length === 0) {
      return { success: true, count: 0 }
    }

    const supabase = await createClient()
    let count = 0

    for (const pId of productIds) {
      if (!pId) continue
      const { error } = await supabase
        .from('wishlists')
        .upsert(
          { profile_id: user.id, product_id: pId },
          { onConflict: 'profile_id,product_id' }
        )
      if (!error) count++
    }

    revalidatePath('/wishlist')
    return { success: true, count }
  } catch (err: any) {
    console.error('mergeGuestWishlistAction error:', err)
    return { success: false, count: 0 }
  }
}
