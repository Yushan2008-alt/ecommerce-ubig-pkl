'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export interface CartProductDetail {
  id: string
  productId: string
  title: string
  slug: string
  price: number
  comparePrice?: number | null
  type: 'physical' | 'digital'
  stock: number | null
  imageUrl: string
  qty: number
  buyerNote: string | null
  shopId: string
  shopName: string
  shopSlug: string
  shopCity: string | null
  flatShippingCost: number
}

export interface ShopCartGroup {
  shopId: string
  shopName: string
  shopSlug: string
  shopCity: string | null
  flatShippingCost: number
  hasPhysical: boolean
  effectiveShippingCost: number
  shopSubtotal: number
  items: CartProductDetail[]
}

export interface CartDetailsResult {
  groups: ShopCartGroup[]
  totalItems: number
  totalProductAmount: number
  totalShippingAmount: number
  grandTotal: number
}

/**
 * Mengambil isi keranjang belanja user terautentikasi lengkap dengan data produk, toko, dan ongkir flat per toko
 */
export async function getCartWithDetails(): Promise<{
  success: boolean
  data: CartDetailsResult | null
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, data: null, error: 'Unauthorized' }
    }

    const supabase = await createClient()
    const { data: rawItems, error } = await supabase
      .from('cart_items')
      .select(`
        id,
        qty,
        buyer_note,
        product_id,
        created_at,
        products (
          id,
          title,
          slug,
          price,
          compare_price,
          type,
          stock,
          status,
          shop_id,
          product_images (
            path,
            sort_order
          ),
          shops (
            id,
            name,
            slug,
            city,
            flat_shipping_cost,
            profile_id
          )
        )
      `)
      .eq('profile_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching cart:', error)
      return { success: false, data: null, error: error.message }
    }

    // Kelompokkan item berdasarkan toko (shops.id)
    const shopMap = new Map<string, ShopCartGroup>()
    let totalItems = 0
    let totalProductAmount = 0

    const storageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images`

    for (const row of rawItems || []) {
      const prod = row.products as any
      if (!prod) continue

      const shop = prod.shops as any
      if (!shop) continue

      // Ambil gambar produk utama
      let imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
      if (prod.product_images && prod.product_images.length > 0) {
        const sortedImages = [...prod.product_images].sort((a, b) => a.sort_order - b.sort_order)
        const primaryImgPath = sortedImages[0]?.path
        if (primaryImgPath) {
          imageUrl = primaryImgPath.startsWith('http')
            ? primaryImgPath
            : `${storageBaseUrl}/${primaryImgPath}`
        }
      }

      const itemDetail: CartProductDetail = {
        id: row.id,
        productId: prod.id,
        title: prod.title,
        slug: prod.slug,
        price: Number(prod.price),
        comparePrice: prod.compare_price ? Number(prod.compare_price) : null,
        type: prod.type,
        stock: prod.stock,
        imageUrl,
        qty: prod.type === 'digital' ? 1 : row.qty,
        buyerNote: row.buyer_note,
        shopId: shop.id,
        shopName: shop.name,
        shopSlug: shop.slug,
        shopCity: shop.city,
        flatShippingCost: Number(shop.flat_shipping_cost || 0),
      }

      totalItems += itemDetail.qty
      totalProductAmount += itemDetail.price * itemDetail.qty

      if (!shopMap.has(shop.id)) {
        shopMap.set(shop.id, {
          shopId: shop.id,
          shopName: shop.name,
          shopSlug: shop.slug,
          shopCity: shop.city,
          flatShippingCost: Number(shop.flat_shipping_cost || 0),
          hasPhysical: false,
          effectiveShippingCost: 0,
          shopSubtotal: 0,
          items: [],
        })
      }

      const group = shopMap.get(shop.id)!
      group.items.push(itemDetail)
      group.shopSubtotal += itemDetail.price * itemDetail.qty
      if (itemDetail.type === 'physical') {
        group.hasPhysical = true
      }
    }

    let totalShippingAmount = 0
    const groups: ShopCartGroup[] = []

    for (const group of shopMap.values()) {
      // Ongkir flat dihitung 0 jika dalam toko tersebut hanya berisi produk digital
      group.effectiveShippingCost = group.hasPhysical ? group.flatShippingCost : 0
      totalShippingAmount += group.effectiveShippingCost
      groups.push(group)
    }

    return {
      success: true,
      data: {
        groups,
        totalItems,
        totalProductAmount,
        totalShippingAmount,
        grandTotal: totalProductAmount + totalShippingAmount,
      },
    }
  } catch (err: any) {
    console.error('getCartWithDetails error:', err)
    return { success: false, data: null, error: err.message || 'Server error' }
  }
}

/**
 * Menambahkan item ke keranjang belanja dengan validasi stok, tipe digital, dan toko sendiri
 */
export async function addToCartAction(
  productId: string,
  qty: number = 1,
  buyerNote?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // 1. Ambil info produk dan toko
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id, title, type, stock, status, shop_id, shops(profile_id)')
      .eq('id', productId)
      .single()

    if (prodErr || !product) {
      return { success: false, error: 'Produk tidak ditemukan' }
    }

    if (product.status !== 'published') {
      return { success: false, error: 'Produk sedang tidak tersedia' }
    }

    // 2. Cegah beli produk toko sendiri
    const shop = product.shops as any
    if (shop?.profile_id === user.id) {
      return { success: false, error: 'Anda tidak dapat membeli produk dari toko Anda sendiri' }
    }

    // 3. Tentukan kuantitas valid (digital selalu 1)
    let finalQty = qty
    if (product.type === 'digital') {
      finalQty = 1
    } else if (product.stock !== null && product.stock !== undefined) {
      if (product.stock <= 0) {
        return { success: false, error: 'Stok produk habis' }
      }
    }

    // 4. Cek apakah item sudah ada di keranjang user
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, qty, buyer_note')
      .match({ profile_id: user.id, product_id: productId })
      .maybeSingle()

    if (existing) {
      const nextQty = product.type === 'digital' ? 1 : existing.qty + finalQty
      if (product.type === 'physical' && product.stock !== null && nextQty > product.stock) {
        return { success: false, error: `Jumlah melebihi stok tersedia (${product.stock})` }
      }

      const { error: updateErr } = await supabase
        .from('cart_items')
        .update({
          qty: nextQty,
          buyer_note: buyerNote !== undefined ? buyerNote : existing.buyer_note,
        })
        .eq('id', existing.id)

      if (updateErr) throw updateErr
    } else {
      if (product.type === 'physical' && product.stock !== null && finalQty > product.stock) {
        return { success: false, error: `Jumlah melebihi stok tersedia (${product.stock})` }
      }

      const { error: insertErr } = await supabase
        .from('cart_items')
        .insert({
          profile_id: user.id,
          product_id: productId,
          qty: finalQty,
          buyer_note: buyerNote || null,
        })

      if (insertErr) throw insertErr
    }

    revalidatePath('/cart')
    return { success: true }
  } catch (err: any) {
    console.error('addToCartAction error:', err)
    return { success: false, error: err.message || 'Gagal menambahkan produk ke keranjang' }
  }
}

/**
 * Mengubah jumlah (qty) produk di keranjang
 */
export async function updateCartQtyAction(
  productId: string,
  qty: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()

    if (qty <= 0) {
      await supabase
        .from('cart_items')
        .delete()
        .match({ profile_id: user.id, product_id: productId })
      revalidatePath('/cart')
      return { success: true }
    }

    // Cek batas tipe dan stok
    const { data: product } = await supabase
      .from('products')
      .select('type, stock')
      .eq('id', productId)
      .single()

    let targetQty = qty
    if (product?.type === 'digital') {
      targetQty = 1
    } else if (product?.stock !== null && product?.stock !== undefined && targetQty > product.stock) {
      return { success: false, error: `Maksimal stok produk adalah ${product.stock}` }
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ qty: targetQty })
      .match({ profile_id: user.id, product_id: productId })

    if (error) throw error

    revalidatePath('/cart')
    return { success: true }
  } catch (err: any) {
    console.error('updateCartQtyAction error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Memperbarui catatan pembeli (buyer_note) untuk produk tertentu
 */
export async function updateBuyerNoteAction(
  productId: string,
  note: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('cart_items')
      .update({ buyer_note: note.trim() || null })
      .match({ profile_id: user.id, product_id: productId })

    if (error) throw error

    revalidatePath('/cart')
    return { success: true }
  } catch (err: any) {
    console.error('updateBuyerNoteAction error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Menghapus item dari keranjang belanja
 */
export async function removeFromCartAction(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .match({ profile_id: user.id, product_id: productId })

    if (error) throw error

    revalidatePath('/cart')
    return { success: true }
  } catch (err: any) {
    console.error('removeFromCartAction error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Mengosongkan seluruh keranjang belanja user
 */
export async function clearCartAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const supabase = await createClient()
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('profile_id', user.id)

    if (error) throw error

    revalidatePath('/cart')
    return { success: true }
  } catch (err: any) {
    console.error('clearCartAction error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Menggabungkan item keranjang lokal (Guest) ke keranjang database akun saat Login
 */
export async function mergeGuestCartAction(
  guestItems: Array<{ id: string; qty: number; buyerNote?: string }>
): Promise<{ success: boolean; mergedCount: number; error?: string }> {
  try {
    const { user } = await getUser()
    if (!user || !guestItems || guestItems.length === 0) {
      return { success: true, mergedCount: 0 }
    }

    let mergedCount = 0
    for (const item of guestItems) {
      if (!item.id) continue
      const res = await addToCartAction(item.id, item.qty || 1, item.buyerNote)
      if (res.success) {
        mergedCount++
      }
    }

    revalidatePath('/cart')
    return { success: true, mergedCount }
  } catch (err: any) {
    console.error('mergeGuestCartAction error:', err)
    return { success: false, mergedCount: 0, error: err.message }
  }
}
