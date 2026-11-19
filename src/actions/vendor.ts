'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth'
import { parseShopMetadata, serializeShopMetadata } from '@/lib/shop-helper'
import { formatAddressLine } from '@/lib/address-helper'
import { formatOrderInvoice } from '@/lib/utils'
import type { Database, FulfilmentStatus, ProductStatus, ProductType, ShopMetadata } from '@/types/database'

type Shop = Database['public']['Tables']['shops']['Row']

import {
  VendorApplicationSchema,
  FirstProductSchema,
  BecomeVendorSchema,
  ProductFormSchema,
  PayoutSchema,
  ShopSettingsSchema,
  type VendorApplicationInput,
  type FirstProductInput,
  type BecomeVendorInput,
  type ProductFormInput,
  type PayoutInput,
  type ShopSettingsInput,
} from '@/lib/validators'

/**
 * 1A. SUBMIT VENDOR APPLICATION (Langkah 2, 3, 4 -> Status Pending)
 */
export async function submitVendorApplicationAction(payload: VendorApplicationInput): Promise<{
  success: boolean
  shop?: Shop
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || !profile) {
      return { success: false, error: 'Silakan login terlebih dahulu.' }
    }

    const parsed = VendorApplicationSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Data pendaftaran tidak valid' }
    }

    const admin = createAdminClient()

    // Cek apakah user sudah memiliki toko
    const { data: existingUserShop } = await admin
      .from('shops')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (existingUserShop?.status === 'active') {
      return { success: false, error: 'Toko Anda sudah berstatus aktif.' }
    }

    // Cek keunikan slug jika toko baru atau slug diubah
    const { data: slugTaken } = await admin
      .from('shops')
      .select('id, profile_id')
      .eq('slug', parsed.data.slug)
      .maybeSingle()

    if (slugTaken && slugTaken.profile_id !== user.id) {
      return { success: false, error: 'Slug toko sudah digunakan oleh toko lain. Silakan ubah nama atau slug.' }
    }

    const metadata: ShopMetadata = {
      pickup_address: parsed.data.pickup_address,
      district: parsed.data.district,
      village: parsed.data.village,
      postal_code: parsed.data.postal_code,
      couriers: parsed.data.couriers,
      bank_name: parsed.data.bank_name,
      bank_account_number: parsed.data.bank_account_number,
      bank_account_holder: parsed.data.bank_account_holder,
    }

    let cleanPhone = parsed.data.phone.trim()
    if (cleanPhone.startsWith('+62')) {
      cleanPhone = '0' + cleanPhone.slice(3).replace(/\D/g, '')
    } else if (cleanPhone.startsWith('62')) {
      cleanPhone = '0' + cleanPhone.slice(2).replace(/\D/g, '')
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = '0' + cleanPhone.slice(1).replace(/\D/g, '')
    } else if (cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone.slice(1).replace(/\D/g, '')
    } else {
      cleanPhone = cleanPhone.replace(/\D/g, '')
    }

    const shopPayload = {
      profile_id: user.id,
      name: parsed.data.name,
      slug: parsed.data.slug,
      phone: cleanPhone,
      whatsapp: cleanPhone,
      email: user.email || null,
      city: parsed.data.city,
      province: parsed.data.province,
      status: 'pending',
      description: serializeShopMetadata(metadata),
      updated_at: new Date().toISOString(),
    }

    let savedShop: Shop

    if (existingUserShop) {
      const { data: updated, error: updateErr } = await admin
        .from('shops')
        .update(shopPayload)
        .eq('id', existingUserShop.id)
        .select()
        .single()

      if (updateErr || !updated) {
        return { success: false, error: updateErr?.message || 'Gagal memperbarui data pendaftaran toko' }
      }
      savedShop = updated
    } else {
      const { data: inserted, error: insertErr } = await admin
        .from('shops')
        .insert({
          ...shopPayload,
          flat_shipping_cost: 15000,
        })
        .select()
        .single()

      if (insertErr || !inserted) {
        return { success: false, error: insertErr?.message || 'Gagal menyimpan pendaftaran toko' }
      }
      savedShop = inserted
    }

    // Simpan alamat gudang ke tabel addresses dengan format desa dan kecamatan lengkap
    const pickupAddressFormatted = formatAddressLine(
      parsed.data.pickup_address,
      parsed.data.village,
      parsed.data.district
    )

    await admin.from('addresses').upsert({
      profile_id: user.id,
      recipient_name: parsed.data.name,
      phone: cleanPhone,
      address_line: pickupAddressFormatted,
      city: parsed.data.city,
      province: parsed.data.province,
      postal_code: parsed.data.postal_code,
      is_default: false,
    }, { onConflict: 'profile_id,address_line' })

    revalidatePath('/')
    revalidatePath('/sell')
    revalidatePath('/moderator/vendors')

    return { success: true, shop: savedShop }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}

/**
 * 1B. GET VENDOR APPLICATION STATUS
 */
export async function getVendorApplicationStatusAction(): Promise<{
  success: boolean
  hasShop: boolean
  shop?: Shop
  metadata?: ShopMetadata
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: true, hasShop: false }
    }

    const admin = createAdminClient()
    const { data: shop } = await admin
      .from('shops')
      .select('*')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!shop) {
      return { success: true, hasShop: false }
    }

    return {
      success: true,
      hasShop: true,
      shop,
      metadata: parseShopMetadata(shop.description),
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat status pendaftaran'
    return { success: false, hasShop: false, error: msg }
  }
}

/**
 * 1C. BATALKAN PENGAJUAN PENDAFTARAN TOKO
 */
export async function cancelVendorApplicationAction(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu.' }
    }

    const admin = createAdminClient()

    // Cari toko milik user yang berstatus pending atau rejected
    const { data: userShop } = await admin
      .from('shops')
      .select('id, name, status')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!userShop) {
      return { success: false, error: 'Tidak ditemukan pengajuan toko untuk dibatalkan.' }
    }

    if (userShop.status !== 'pending' && userShop.status !== 'rejected') {
      return {
        success: false,
        error: 'Hanya pengajuan dengan status pending atau ditolak yang dapat dibatalkan.',
      }
    }

    // Hapus data toko pengajuan
    const { error: deleteErr } = await admin
      .from('shops')
      .delete()
      .eq('id', userShop.id)

    if (deleteErr) {
      return { success: false, error: deleteErr.message || 'Gagal membatalkan pengajuan toko.' }
    }

    if (profile?.role === 'vendor') {
      await admin.from('profiles').update({ role: 'member' }).eq('id', user.id)
    }

    revalidatePath('/sell')
    revalidatePath('/vendor')
    revalidatePath('/moderator/vendors')

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat membatalkan pengajuan.'
    return { success: false, error: msg }
  }
}

/**
 * 1C. SUBMIT FIRST PRODUCT (Langkah 6 -> Aktivasi Toko Penuh)
 */
export async function submitFirstProductAction(payload: FirstProductInput): Promise<{
  success: boolean
  productId?: string
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || !profile) {
      return { success: false, error: 'Silakan login terlebih dahulu.' }
    }

    const parsed = FirstProductSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Data produk tidak valid' }
    }

    const admin = createAdminClient()

    // Ambil data toko user
    const { data: shop } = await admin
      .from('shops')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (!shop) {
      return { success: false, error: 'Toko belum terdaftar.' }
    }

    // Pastikan slug produk unik
    let productSlug = parsed.data.slug
    const { data: existingSlug } = await admin
      .from('products')
      .select('id')
      .eq('slug', productSlug)
      .maybeSingle()

    if (existingSlug) {
      productSlug = `${productSlug}-${Math.floor(1000 + Math.random() * 9000)}`
    }

    // Pastikan category_id berupa UUID valid, jika berupa slug cari id dari tabel categories
    let finalCategoryId = parsed.data.categoryId
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalCategoryId)
    if (!isUuid) {
      const { data: catRow } = await admin
        .from('categories')
        .select('id')
        .eq('slug', finalCategoryId)
        .maybeSingle()

      if (catRow?.id) {
        finalCategoryId = catRow.id
      } else {
        const { data: fallbackCat } = await admin
          .from('categories')
          .select('id')
          .limit(1)
          .maybeSingle()
        if (fallbackCat?.id) {
          finalCategoryId = fallbackCat.id
        }
      }
    }

    // Buat produk baru
    const { data: newProd, error: prodErr } = await admin
      .from('products')
      .insert({
        shop_id: shop.id,
        category_id: finalCategoryId,
        title: parsed.data.title,
        slug: productSlug,
        description: parsed.data.description,
        type: 'physical',
        price: parsed.data.price,
        stock: parsed.data.stock,
        status: 'published',
        attributes: { Kondisi: 'Baru' },
        updated_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (prodErr || !newProd) {
      return { success: false, error: prodErr?.message || 'Gagal menerbitkan produk pertama' }
    }

    // Masukkan gambar produk
    if (parsed.data.images && parsed.data.images.length > 0) {
      const imgRows = parsed.data.images.map((imgPath, idx) => ({
        product_id: newProd.id,
        path: imgPath,
        sort_order: idx,
      }))
      await admin.from('product_images').insert(imgRows)
    }

    // Aktifkan toko secara penuh (status: 'active')
    await admin
      .from('shops')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', shop.id)

    // Pastikan role profil adalah 'vendor'
    await admin
      .from('profiles')
      .update({
        role: 'vendor',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    revalidatePath('/')
    revalidatePath('/sell')
    revalidatePath('/vendor')
    revalidatePath('/products')
    revalidatePath(`/products/${productSlug}`)

    return { success: true, productId: newProd.id }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyelesaikan pendaftaran produk pertama'
    return { success: false, error: msg }
  }
}

/**
 * 1. BECOME VENDOR ACTION (Onboarding Toko & Role Escalation)
 */
export async function becomeVendorAction(payload: BecomeVendorInput): Promise<{
  success: boolean
  shop?: Shop
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || !profile) {
      return { success: false, error: 'Silakan login terlebih dahulu.' }
    }

    if (profile.role === 'vendor') {
      return { success: false, error: 'Akun Anda sudah terdaftar sebagai Vendor.' }
    }

    const parsed = BecomeVendorSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Data toko tidak valid' }
    }

    const {
      name,
      slug,
      description,
      logo_url,
      flat_shipping_cost,
      whatsapp,
      phone,
      email,
      city,
      province,
    } = parsed.data

    const supabase = await createClient()

    // Cek apakah slug sudah digunakan oleh toko lain
    const { data: existingShop } = await supabase
      .from('shops')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (existingShop) {
      return { success: false, error: 'Slug toko sudah digunakan. Silakan gunakan slug yang lain.' }
    }

    // Panggil RPC become_vendor (Security Definer)
    const { data: newShop, error: rpcError } = await supabase.rpc('become_vendor', {
      p_name: name,
      p_slug: slug,
      p_description: description ?? null,
      p_logo_url: logo_url ?? null,
      p_flat_shipping_cost: flat_shipping_cost,
      p_whatsapp: whatsapp ?? null,
      p_phone: phone ?? null,
      p_email: email ?? (user.email || null),
      p_city: city ?? null,
      p_province: province ?? null,
    })

    if (rpcError) {
      return { success: false, error: rpcError.message || 'Gagal mendaftar sebagai vendor' }
    }

    revalidatePath('/')
    revalidatePath('/sell')
    revalidatePath('/vendor')
    revalidatePath('/account')

    return { success: true, shop: newShop as Shop }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}

export interface VendorRecentOrder {
  id: string
  orderId: string
  orderCode: string
  orderStatus: string
  title: string
  imageUrl: string | null
  productType: 'physical' | 'digital'
  productSlug?: string
  price: number
  qty: number
  shippingCost?: number
  totalPrice: number
  fulfilmentStatus: FulfilmentStatus
  buyerName: string
  buyerPhone?: string
  createdAt: string
  shippingAddress: any
  itemTotal: number
}

/**
 * 2. GET VENDOR DASHBOARD DATA
 */
export async function getVendorDashboardDataAction(): Promise<{
  success: boolean
  data?: {
    shop: Shop
    metrics: {
      totalGrossSales: number
      totalNetSales: number
      newOrdersCount: number
      activeProductsCount: number
      availableBalance: number
    }
    recentOrders: VendorRecentOrder[]
    chartData: { date: string; sales: number; orders: number }[]
    rawSales?: { createdAt: string; amount: number; isPaid: boolean }[]
    onboardingChecklist: {
      shopCreated: boolean
      hasProducts: boolean
      hasBankAccount: boolean
      profileComplete: boolean
    }
  }
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized: Vendor only' }
    }

    const supabase = await createClient()

    // 1. Ambil data toko
    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (shopError || !shop) {
      return { success: false, error: 'Data toko tidak ditemukan' }
    }

    // 2. Ambil total produk aktif
    const { count: activeProductsCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shop.id)
      .eq('status', 'published')

    // 3. Ambil total order items toko beserta relasi lengkap (produk, pesanan, pembeli)
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        title,
        price,
        qty,
        shipping_cost,
        commission_amount,
        net_amount,
        fulfilment_status,
        created_at,
        products (
          id,
          title,
          type,
          slug,
          product_images (path, sort_order)
        ),
        orders (
          id,
          code,
          status,
          total,
          created_at,
          paid_at,
          shipping_address,
          profiles (
            id,
            display_name,
            phone,
            avatar_url
          )
        )
      `)
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })

    const allItems = orderItems || []

    // Pesanan baru (waiting atau processing)
    const newOrdersCount = allItems.filter(
      (item) => item.fulfilment_status === 'waiting' || item.fulfilment_status === 'processing'
    ).length

    // Total gross sales & net sales dari item completed/paid
    let totalGrossSales = 0
    let totalNetCompleted = 0

    allItems.forEach((item: any) => {
      const order = Array.isArray(item.orders) ? item.orders[0] : item.orders
      if (order?.status === 'paid') {
        totalGrossSales += Number(item.price) * Number(item.qty)
        if (item.fulfilment_status === 'completed') {
          totalNetCompleted += Number(item.net_amount || 0)
        }
      }
    })

    // 4. Hitung payout requests
    const { data: payouts } = await supabase
      .from('payout_requests')
      .select('amount, status')
      .eq('shop_id', shop.id)

    const pendingPaidPayouts = (payouts || [])
      .filter((p) => p.status === 'pending' || p.status === 'paid')
      .reduce((acc, p) => acc + Number(p.amount), 0)

    const availableBalance = Math.max(0, totalNetCompleted - pendingPaidPayouts)

    const storageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/product-images`

    // 5. Pesanan terbaru (5 item terakhir) dengan data relasional lengkap
    const recentOrders: VendorRecentOrder[] = allItems.slice(0, 5).map((item: any) => {
      const order = Array.isArray(item.orders) ? item.orders[0] : item.orders
      const buyerProfile = Array.isArray(order?.profiles) ? order.profiles[0] : order?.profiles
      const product = Array.isArray(item.products) ? item.products[0] : item.products
      const rawImages = Array.isArray(product?.product_images)
        ? [...product.product_images]
        : product?.product_images
        ? [product.product_images]
        : []

      // Urutkan gambar berdasarkan sort_order terkecil agar gambar cover utama yang ditampilkan
      rawImages.sort((a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
      const primaryPath = rawImages[0]?.path || null

      let imageUrl: string | null = null
      if (primaryPath) {
        if (primaryPath.startsWith('http://') || primaryPath.startsWith('https://') || primaryPath.startsWith('/')) {
          imageUrl = primaryPath
        } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          imageUrl = `${storageBaseUrl}/${primaryPath.replace(/^product-images\//, '')}`
        } else {
          imageUrl = primaryPath
        }
      }

      const shippingAddr = (order?.shipping_address as any) || {}
      const buyerName =
        buyerProfile?.display_name ||
        shippingAddr.recipientName ||
        shippingAddr.recipient_name ||
        shippingAddr.name ||
        shippingAddr.fullName ||
        'Pembeli'

      const title = item.title || product?.title || 'Produk'
      const price = Number(item.price) || 0
      const qty = Number(item.qty) || 1
      const shippingCost = Number(item.shipping_cost) || 0
      const totalPrice = price * qty

      return {
        id: item.id,
        orderId: item.order_id,
        orderCode: order?.code || '-',
        orderStatus: order?.status || 'pending_payment',
        title,
        imageUrl,
        productType: (product?.type as 'physical' | 'digital') || 'physical',
        productSlug: product?.slug || '',
        price,
        qty,
        shippingCost,
        totalPrice,
        fulfilmentStatus: (item.fulfilment_status as FulfilmentStatus) || 'waiting',
        buyerName,
        buyerPhone: buyerProfile?.phone || shippingAddr.phone || '-',
        createdAt: item.created_at || order?.created_at || new Date().toISOString(),
        shippingAddress: shippingAddr,
        itemTotal: totalPrice,
      }
    })

    // 6. Data grafik 14 hari terakhir
    const daysMap = new Map<string, { sales: number; orders: number }>()
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().slice(5, 10) // MM-DD
      daysMap.set(dateKey, { sales: 0, orders: 0 })
    }

    allItems.forEach((item: any) => {
      const dateKey = new Date(item.created_at).toISOString().slice(5, 10)
      if (daysMap.has(dateKey)) {
        const current = daysMap.get(dateKey)!
        daysMap.set(dateKey, {
          sales: current.sales + Number(item.price) * Number(item.qty),
          orders: current.orders + 1,
        })
      }
    })

    const chartData = Array.from(daysMap.entries()).map(([date, val]) => ({
      date,
      sales: val.sales,
      orders: val.orders,
    }))

    const rawSales = allItems.map((item: any) => {
      const order = Array.isArray(item.orders) ? item.orders[0] : item.orders
      return {
        createdAt: item.created_at,
        amount: Number(item.price) * Number(item.qty),
        isPaid: order?.status === 'paid',
      }
    })

    // 7. Onboarding Checklist
    const hasProducts = (activeProductsCount || 0) > 0
    const meta = parseShopMetadata(shop.description)
    const hasBankAccount = Boolean(
      (shop as any).bank_account_number ||
      (shop as any).bank_name ||
      meta.bank_account_number ||
      meta.bank_name ||
      (payouts || []).length > 0
    )
    const profileComplete = Boolean(
      shop.whatsapp &&
      shop.city &&
      (meta.bio || (shop.description && !shop.description.trim().startsWith('{')))
    )

    return {
      success: true,
      data: {
        shop,
        metrics: {
          totalGrossSales,
          totalNetSales: totalNetCompleted,
          newOrdersCount,
          activeProductsCount: activeProductsCount || 0,
          availableBalance,
        },
        recentOrders,
        chartData,
        rawSales,
        onboardingChecklist: {
          shopCreated: true,
          hasProducts,
          hasBankAccount,
          profileComplete,
        },
      },
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat data dashboard'
    return { success: false, error: msg }
  }
}

/**
 * 3. GET VENDOR PRODUCTS
 */
export async function getVendorProductsAction(statusFilter?: string): Promise<{
  success: boolean
  products?: any[]
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClient()

    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    let query = supabase
      .from('products')
      .select(`
        *,
        categories (id, name, slug),
        brands (id, name),
        product_images (id, path, sort_order),
        digital_files (id, file_name, size, format)
      `)
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter as ProductStatus)
    }

    const { data: products, error } = await query

    if (error) return { success: false, error: error.message }

    return { success: true, products: products || [] }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil produk'
    return { success: false, error: msg }
  }
}

/**
 * 4. SAVE PRODUCT (CREATE / UPDATE)
 */
export async function saveProductAction(payload: ProductFormInput): Promise<{
  success: boolean
  productId?: string
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized: Vendor only' }
    }

    const parsed = ProductFormSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Input tidak valid' }
    }

    const data = parsed.data
    const supabase = await createClient()

    const { data: shop } = await supabase
      .from('shops')
      .select('id, flat_shipping_cost')
      .eq('profile_id', user.id)
      .single()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    // Jika membuat baru, cek keunikan slug
    if (!data.id) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('slug', data.slug)
        .maybeSingle()

      if (existing) {
        data.slug = `${data.slug}-${Math.floor(1000 + Math.random() * 9000)}`
      }
    }

    const productPayload = {
      shop_id: shop.id,
      category_id: data.categoryId,
      brand_id: data.brandId || null,
      type: data.type as ProductType,
      title: data.title,
      slug: data.slug,
      description: data.description,
      price: data.price,
      compare_price: data.comparePrice || null,
      status: data.status as ProductStatus,
      sku: data.type === 'physical' ? data.sku || null : null,
      stock: data.type === 'physical' ? data.stock : null,
      weight: data.type === 'physical' ? data.weight : null,
      attributes: data.attributes || {},
      updated_at: new Date().toISOString(),
    }

    let targetProductId = data.id

    if (data.id) {
      // Update produk yang ada
      const { error: updateError } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', data.id)
        .eq('shop_id', shop.id)

      if (updateError) return { success: false, error: updateError.message }
    } else {
      // Insert produk baru
      const { data: newProd, error: insertError } = await supabase
        .from('products')
        .insert(productPayload)
        .select('id')
        .single()

      if (insertError || !newProd) {
        return { success: false, error: insertError?.message || 'Gagal membuat produk' }
      }
      targetProductId = newProd.id
    }

    if (!targetProductId) {
      return { success: false, error: 'Product ID gagal diperoleh' }
    }

    // Kelola Galeri Gambar di tabel product_images
    if (data.images && data.images.length > 0) {
      // Hapus data gambar lama untuk diatur ulang urutannya
      await supabase.from('product_images').delete().eq('product_id', targetProductId)

      const imageRows = data.images.map((imgPath, idx) => ({
        product_id: targetProductId!,
        path: imgPath,
        sort_order: idx,
      }))

      await supabase.from('product_images').insert(imageRows)
    }

    // Kelola File Digital di tabel digital_files
    if (data.type === 'digital' && data.digitalFile?.path) {
      // Hapus berkas lama jika ada
      await supabase.from('digital_files').delete().eq('product_id', targetProductId)

      await supabase.from('digital_files').insert({
        product_id: targetProductId,
        path: data.digitalFile.path,
        file_name: data.digitalFile.fileName,
        size: data.digitalFile.fileSize,
        format: data.digitalFile.format || 'ZIP',
      })
    }

    revalidatePath('/')
    revalidatePath('/vendor/products')
    revalidatePath('/vendor')
    revalidatePath('/products')
    revalidatePath(`/products/${data.slug}`)

    return { success: true, productId: targetProductId }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan produk'
    return { success: false, error: msg }
  }
}

/**
 * 5. ARCHIVE PRODUCT
 */
export async function archiveProductAction(productId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('products')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', productId)

    if (error) return { success: false, error: error.message }

    revalidatePath('/vendor/products')
    revalidatePath('/products')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengarsipkan produk'
    return { success: false, error: msg }
  }
}

/**
 * 6. DELETE PRODUCT (Ditolak jika pernah dipesan)
 */
export async function deleteProductAction(productId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized' }
    }

    const supabase = await createClient()

    // Cek apakah produk pernah ada di order_items
    const { count, error: countErr } = await supabase
      .from('order_items')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)

    if (countErr) return { success: false, error: countErr.message }

    if ((count || 0) > 0) {
      return {
        success: false,
        error:
          'Produk yang pernah memiliki transaksi riwayat pesanan tidak boleh dihapus demi integritas data nota. Silakan pilih opsi "Arsipkan".',
      }
    }

    // Jika belum pernah dipesan, boleh di-delete
    const { error: deleteErr } = await supabase.from('products').delete().eq('id', productId)

    if (deleteErr) return { success: false, error: deleteErr.message }

    revalidatePath('/vendor/products')
    revalidatePath('/products')
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus produk'
    return { success: false, error: msg }
  }
}

/**
 * 6b. DELETE MULTIPLE PRODUCTS (Hapus massal produk)
 */
export async function deleteMultipleProductsAction(productIds: string[]): Promise<{
  success: boolean
  deletedCount: number
  failedCount: number
  deletedIds: string[]
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, deletedCount: 0, failedCount: 0, deletedIds: [], error: 'Unauthorized' }
    }

    const supabase = await createClient()

    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!shop) {
      return { success: false, deletedCount: 0, failedCount: 0, deletedIds: [], error: 'Toko tidak ditemukan' }
    }

    let deletedCount = 0
    let failedCount = 0
    const deletedIds: string[] = []

    for (const pid of productIds) {
      const { count } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', pid)

      if ((count || 0) > 0) {
        failedCount++
        continue
      }

      const { error: deleteErr } = await supabase
        .from('products')
        .delete()
        .eq('id', pid)
        .eq('shop_id', shop.id)

      if (deleteErr) {
        failedCount++
      } else {
        deletedCount++
        deletedIds.push(pid)
      }
    }

    revalidatePath('/vendor/products')
    revalidatePath('/products')

    return {
      success: deletedCount > 0 || failedCount === 0,
      deletedCount,
      failedCount,
      deletedIds,
      error:
        failedCount > 0
          ? `${failedCount} produk tidak dapat dihapus karena sudah memiliki riwayat pesanan (disarankan diarsipkan).`
          : undefined,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus produk terpilih'
    return { success: false, deletedCount: 0, failedCount: 0, deletedIds: [], error: msg }
  }
}

/**
 * 7. GET VENDOR INCOMING ORDERS
 */
export async function getVendorOrdersAction(filterStatus?: string): Promise<{
  success: boolean
  orders?: any[]
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized' }
    }

    const admin = createAdminClient()

    const { data: shop } = await admin
      .from('shops')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    let query = admin
      .from('order_items')
      .select(`
        *,
        products (
          id,
          title,
          type,
          slug,
          product_images (path, sort_order)
        ),
        orders (
          id,
          profile_id,
          code,
          status,
          total,
          created_at,
          paid_at,
          shipping_address
        )
      `)
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })

    if (filterStatus && filterStatus !== 'all') {
      query = query.eq('fulfilment_status', filterStatus as FulfilmentStatus)
    }

    const { data, error } = await query

    if (error) return { success: false, error: error.message }

    // Ambil profile pembeli untuk semua orders
    const buyerProfileIds = Array.from(
      new Set(
        (data || [])
          .map((it: any) => {
            const ord = Array.isArray(it.orders) ? it.orders[0] : it.orders
            return ord?.profile_id
          })
          .filter(Boolean)
      )
    )

    const profilesMap = new Map<string, any>()
    if (buyerProfileIds.length > 0) {
      const { data: profileRows } = await admin
        .from('profiles')
        .select('id, display_name, phone, avatar_url')
        .in('id', buyerProfileIds)

      if (profileRows) {
        for (const p of profileRows) {
          profilesMap.set(p.id, p)
        }
      }
    }

    const storageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/product-images`

    const formatted = (data || []).map((it: any) => {
      const order = Array.isArray(it.orders) ? it.orders[0] : it.orders
      const buyerProfile = order?.profile_id ? profilesMap.get(order.profile_id) : null
      const product = Array.isArray(it.products) ? it.products[0] : it.products
      const rawImages = Array.isArray(product?.product_images)
        ? [...product.product_images]
        : product?.product_images
        ? [product.product_images]
        : []

      rawImages.sort((a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
      const primaryPath = rawImages[0]?.path || null

      let imageUrl: string | null = null
      if (primaryPath) {
        if (primaryPath.startsWith('http://') || primaryPath.startsWith('https://') || primaryPath.startsWith('/')) {
          imageUrl = primaryPath
        } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          imageUrl = `${storageBaseUrl}/${primaryPath.replace(/^product-images\//, '')}`
        } else {
          imageUrl = primaryPath
        }
      }

      const shippingAddr = (order?.shipping_address as any) || {}
      const orderRawCode = order?.code || '-'
      const invoiceNumber = formatOrderInvoice(orderRawCode, order?.created_at || it.created_at, it.id)
      const buyerName =
        buyerProfile?.display_name ||
        shippingAddr.recipientName ||
        shippingAddr.recipient_name ||
        shippingAddr.name ||
        'Pembeli'
      const buyerPhone = buyerProfile?.phone || shippingAddr.phone || '-'

      return {
        id: it.id,
        orderId: it.order_id,
        orderCode: orderRawCode,
        invoiceNumber,
        orderStatus: order?.status || 'pending_payment',
        orderDate: it.created_at || order?.created_at,
        paidAt: order?.paid_at,
        title: it.title,
        price: Number(it.price),
        qty: it.qty,
        shippingCost: Number(it.shipping_cost || 0),
        netAmount: Number(it.net_amount || (Number(it.price) * Number(it.qty))),
        commissionAmount: Number(it.commission_amount || 0),
        buyerNote: it.buyer_note || shippingAddr.buyerNote || null,
        fulfilmentStatus: it.fulfilment_status as FulfilmentStatus,
        trackingNumber: it.tracking_number,
        productType: product?.type || 'physical',
        productSlug: product?.slug,
        imageUrl,
        shippingAddress: shippingAddr,
        buyer: {
          id: buyerProfile?.id || order?.profile_id,
          name: buyerName,
          phone: buyerPhone,
          avatar: buyerProfile?.avatar_url || null,
          email: shippingAddr.email || null,
        },
      }
    })

    return { success: true, orders: formatted }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat pesanan masuk'
    return { success: false, error: msg }
  }
}

/**
 * 7b. GET VENDOR ORDER DETAIL
 * Mengambil data rincian satu pesanan untuk vendor.
 * Mendukung pencarian berdasarkan order_id (id orders) maupun item_id (id order_items).
 */
export async function getVendorOrderDetailAction(id: string): Promise<{
  success: boolean
  order?: any
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized' }
    }

    const admin = createAdminClient()

    const { data: shop } = await admin
      .from('shops')
      .select('id, name, slug')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    let targetOrderId = id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    if (isUuid) {
      // Cek apakah parameter `id` merupakan order_items.id milik toko ini
      const { data: itemMatch } = await admin
        .from('order_items')
        .select('order_id')
        .eq('id', id)
        .eq('shop_id', shop.id)
        .maybeSingle()

      targetOrderId = itemMatch ? itemMatch.order_id : id
    } else {
      // 1. Cek langsung kecocokan order code (contoh: ORD-20261119-XXXX)
      const { data: orderByCode } = await admin
        .from('orders')
        .select('id')
        .eq('code', id)
        .maybeSingle()

      if (orderByCode) {
        targetOrderId = orderByCode.id
      } else {
        // 2. Cek kecocokan jika input berupa format invoice (contoh: INV-2026-XXXXX)
        const cleanSuffix = id.replace(/^INV-\d+-/i, '').replace(/^[#A-Za-z]+-/, '')
        const { data: ordersWithSuffix } = await admin
          .from('orders')
          .select('id, code')
          .ilike('code', `%${cleanSuffix}%`)
          .limit(1)

        if (ordersWithSuffix && ordersWithSuffix.length > 0) {
          targetOrderId = ordersWithSuffix[0].id
        } else {
          return { success: false, error: 'Pesanan tidak ditemukan' }
        }
      }
    }

    // Ambil order utama
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('*')
      .eq('id', targetOrderId)
      .maybeSingle()

    if (orderErr || !order) {
      return { success: false, error: 'Pesanan tidak ditemukan' }
    }

    // Ambil profile pembeli
    let buyerProfile = null
    if (order.profile_id) {
      const { data: pData } = await admin
        .from('profiles')
        .select('id, display_name, phone, avatar_url')
        .eq('id', order.profile_id)
        .maybeSingle()
      buyerProfile = pData
    }

    // Ambil log pembayaran
    const { data: payments } = await admin
      .from('payments')
      .select('id, payment_type, midtrans_status, gross_amount, created_at')
      .eq('order_id', targetOrderId)
      .order('created_at', { ascending: false })

    // Ambil items milik toko ini
    const { data: items, error: itemsErr } = await admin
      .from('order_items')
      .select(`
        *,
        products (
          id,
          title,
          type,
          slug,
          product_images (path, sort_order)
        )
      `)
      .eq('order_id', targetOrderId)
      .eq('shop_id', shop.id)

    if (itemsErr) {
      return { success: false, error: itemsErr.message }
    }

    if (!items || items.length === 0) {
      return { success: false, error: 'Pesanan tidak ditemukan untuk toko Anda' }
    }

    const storageBaseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || ''}/storage/v1/object/public/product-images`

    const formattedItems = (items || []).map((it: any) => {
      const product = Array.isArray(it.products) ? it.products[0] : it.products
      const rawImages = Array.isArray(product?.product_images)
        ? [...product.product_images]
        : product?.product_images
        ? [product.product_images]
        : []

      rawImages.sort((a: any, b: any) => (a?.sort_order ?? 0) - (b?.sort_order ?? 0))
      const primaryPath = rawImages[0]?.path || null

      let imageUrl: string | null = null
      if (primaryPath) {
        if (primaryPath.startsWith('http://') || primaryPath.startsWith('https://') || primaryPath.startsWith('/')) {
          imageUrl = primaryPath
        } else if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          imageUrl = `${storageBaseUrl}/${primaryPath.replace(/^product-images\//, '')}`
        } else {
          imageUrl = primaryPath
        }
      }

      return {
        id: it.id,
        orderId: it.order_id,
        title: it.title,
        price: Number(it.price),
        qty: it.qty,
        shippingCost: Number(it.shipping_cost || 0),
        netAmount: Number(it.net_amount || (Number(it.price) * Number(it.qty))),
        commissionAmount: Number(it.commission_amount || 0),
        buyerNote: it.buyer_note,
        fulfilmentStatus: it.fulfilment_status as FulfilmentStatus,
        trackingNumber: it.tracking_number,
        productType: product?.type || 'physical',
        productSlug: product?.slug,
        imageUrl,
      }
    })

    const shipping = (order.shipping_address as any) || {}
    const invoiceNumber = formatOrderInvoice(order.code, order.created_at, order.id)
    const latestPayment = payments && payments.length > 0 ? payments[0] : null

    return {
      success: true,
      order: {
        id: order.id,
        code: order.code,
        invoiceNumber,
        status: order.status,
        total: order.total,
        createdAt: order.created_at,
        paidAt: order.paid_at,
        shippingAddress: shipping,
        buyer: {
          id: buyerProfile?.id || order.profile_id,
          name: buyerProfile?.display_name || shipping.recipientName || 'Pembeli',
          phone: buyerProfile?.phone || shipping.phone || '-',
          avatar: buyerProfile?.avatar_url || null,
          email: shipping.email || null,
        },
        payment: {
          paymentType: latestPayment?.payment_type || 'Pembayaran Otomatis Midtrans',
          status: latestPayment?.midtrans_status || order.status,
          paidAt: order.paid_at || order.created_at,
        },
        items: formattedItems,
      },
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat rincian pesanan'
    return { success: false, error: msg }
  }
}

/**
 * 8. UPDATE VENDOR FULFILMENT (Resi & Status Pengiriman)
 */
export async function updateVendorFulfilmentAction(
  itemId: string,
  status: FulfilmentStatus,
  trackingNumber?: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized' }
    }

    const admin = createAdminClient()

    const { data: shop } = await admin
      .from('shops')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    const updatePayload: { fulfilment_status: FulfilmentStatus; updated_at: string; tracking_number?: string | null } = {
      fulfilment_status: status,
      updated_at: new Date().toISOString(),
    }
    if (trackingNumber !== undefined) {
      updatePayload.tracking_number = trackingNumber.trim() || null
    }

    const { error } = await admin
      .from('order_items')
      .update(updatePayload)
      .eq('id', itemId)
      .eq('shop_id', shop.id)

    if (error) {
      return { success: false, error: error.message || 'Gagal memperbarui status pengiriman' }
    }

    revalidatePath('/vendor/orders')
    revalidatePath('/vendor')
    revalidatePath('/orders')

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}

/**
 * 8b. TERIMA PESANAN VENDOR (Status waiting -> processing + Saldo masuk kantong toko vendor)
 */
export async function acceptVendorOrderAction(itemId: string): Promise<{
  success: boolean
  creditedAmount?: number
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized: Vendor only' }
    }

    const admin = createAdminClient()

    // Ambil data toko vendor
    const { data: shop } = await admin
      .from('shops')
      .select('id, name, description')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    // Ambil order_item
    const { data: item, error: itemErr } = await admin
      .from('order_items')
      .select('id, order_id, title, price, qty, net_amount, fulfilment_status, orders(code, status)')
      .eq('id', itemId)
      .eq('shop_id', shop.id)
      .maybeSingle()

    if (itemErr || !item) {
      return { success: false, error: 'Item pesanan tidak ditemukan' }
    }

    const orderData = Array.isArray(item.orders) ? item.orders[0] : item.orders
    if (orderData?.status === 'cancelled') {
      return { success: false, error: 'Pesanan telah dibatalkan oleh sistem atau pembeli' }
    }

    if (item.fulfilment_status !== 'waiting') {
      return {
        success: false,
        error: `Pesanan tidak dapat diterima karena status saat ini adalah: ${item.fulfilment_status}`,
      }
    }

    // 1. Update status order_item menjadi processing (Sedang Dikemas)
    const { error: updateErr } = await admin
      .from('order_items')
      .update({
        fulfilment_status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)

    if (updateErr) {
      return { success: false, error: updateErr.message || 'Gagal memperbarui status pesanan' }
    }

    // 2. Hitung nominal yang masuk ke dompet vendor (net_amount atau subtotal)
    const orderCode = orderData?.code || item.order_id.slice(0, 8)
    const creditedAmount = Number(item.net_amount || (Number(item.price) * Number(item.qty)))

    // 3. Catat mutasi kredit ke metadata saldo toko vendor (shops.description.balance & ledger)
    const currentMeta = parseShopMetadata(shop.description)
    const currentBalance = Number(currentMeta.balance || 0)
    const newBalance = currentBalance + creditedAmount

    const invoiceCode = formatOrderInvoice(orderCode, new Date().toISOString(), item.id)
    const ledgerEntry = {
      id: `TX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      type: 'credit' as const,
      amount: creditedAmount,
      description: `Penerimaan pesanan ${invoiceCode} (${item.title})`,
      orderId: item.order_id,
      itemId: item.id,
      createdAt: new Date().toISOString(),
    }

    const currentLedger = Array.isArray(currentMeta.ledger) ? currentMeta.ledger : []
    const updatedLedger = [ledgerEntry, ...currentLedger]

    const updatedMeta: ShopMetadata = {
      ...currentMeta,
      balance: newBalance,
      ledger: updatedLedger,
    }

    await admin
      .from('shops')
      .update({
        description: serializeShopMetadata(updatedMeta),
        updated_at: new Date().toISOString(),
      })
      .eq('id', shop.id)

    revalidatePath('/vendor/orders')
    revalidatePath('/vendor/balance')
    revalidatePath('/vendor')
    revalidatePath(`/vendor/orders/${item.order_id}`)
    revalidatePath(`/vendor/orders/${item.id}`)

    return { success: true, creditedAmount }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}

/**
 * 8c. TOLAK PESANAN VENDOR (Status waiting -> cancelled + Refund otomatis)
 */
export async function rejectVendorOrderAction(
  itemId: string,
  reason?: string
): Promise<{
  success: boolean
  refundAmount?: number
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized: Vendor only' }
    }

    const admin = createAdminClient()

    // Ambil data toko vendor
    const { data: shop } = await admin
      .from('shops')
      .select('id, name, description')
      .eq('profile_id', user.id)
      .maybeSingle()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    // Ambil order_item beserta detail produk
    const { data: item, error: itemErr } = await admin
      .from('order_items')
      .select('id, order_id, product_id, title, price, qty, net_amount, fulfilment_status, products(id, type, stock), orders(id, code, status)')
      .eq('id', itemId)
      .eq('shop_id', shop.id)
      .maybeSingle()

    if (itemErr || !item) {
      return { success: false, error: 'Item pesanan tidak ditemukan' }
    }

    if (item.fulfilment_status === 'cancelled') {
      return { success: false, error: 'Pesanan sudah dibatalkan sebelumnya.' }
    }

    if (item.fulfilment_status === 'shipped' || item.fulfilment_status === 'completed') {
      return { success: false, error: 'Pesanan yang sedang dikirim atau sudah selesai tidak dapat ditolak.' }
    }

    // 1. Jika pesanan sebelumnya sempat berstatus processing (saldo sudah masuk), tarik saldo kembali
    if (item.fulfilment_status === 'processing') {
      const netAmount = Number(item.net_amount || (Number(item.price) * Number(item.qty)))
      const currentMeta = parseShopMetadata(shop.description)
      const currentBalance = Number(currentMeta.balance || 0)
      const newBalance = Math.max(0, currentBalance - netAmount)

      const orderData = Array.isArray(item.orders) ? item.orders[0] : item.orders
      const orderCode = orderData?.code || item.order_id.slice(0, 8)
      const invoiceCode = formatOrderInvoice(orderCode, new Date().toISOString(), item.id)

      const debitLedgerEntry = {
        id: `TX-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        type: 'debit' as const,
        amount: netAmount,
        description: `Pembatalan/Tolak pesanan ${invoiceCode} (${item.title})`,
        orderId: item.order_id,
        itemId: item.id,
        createdAt: new Date().toISOString(),
      }

      const currentLedger = Array.isArray(currentMeta.ledger) ? currentMeta.ledger : []
      const updatedMeta: ShopMetadata = {
        ...currentMeta,
        balance: newBalance,
        ledger: [debitLedgerEntry, ...currentLedger],
      }

      await admin
        .from('shops')
        .update({
          description: serializeShopMetadata(updatedMeta),
          updated_at: new Date().toISOString(),
        })
        .eq('id', shop.id)
    }

    // 2. Update status order_item menjadi cancelled
    const { error: cancelErr } = await admin
      .from('order_items')
      .update({
        fulfilment_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)

    if (cancelErr) {
      return { success: false, error: cancelErr.message || 'Gagal membatalkan pesanan' }
    }

    // 3. Kembalikan stok produk jika produk fisik
    const product = Array.isArray(item.products) ? item.products[0] : item.products
    if (product && product.type === 'physical' && typeof product.stock === 'number') {
      await admin
        .from('products')
        .update({
          stock: product.stock + Number(item.qty),
          updated_at: new Date().toISOString(),
        })
        .eq('id', product.id)
    }

    // 4. Catat transaksi refund otomatis di tabel payments
    const refundAmount = Number(item.price) * Number(item.qty)

    await admin.from('payments').insert({
      order_id: item.order_id,
      payment_type: 'refund',
      midtrans_status: 'refund',
      gross_amount: refundAmount,
      raw: {
        type: 'auto_refund',
        item_id: item.id,
        reason: reason || 'Pesanan ditolak oleh penjual (stok habis / toko tutup sementara)',
        status: 'refund_processed',
        timestamp: new Date().toISOString(),
      },
      signature_valid: true,
    })

    // 5. Jika seluruh item dalam order ini berstatus cancelled, update order status ke cancelled
    const { data: remainingItems } = await admin
      .from('order_items')
      .select('id, fulfilment_status')
      .eq('order_id', item.order_id)

    const allCancelled = (remainingItems || []).every((it) => it.fulfilment_status === 'cancelled')
    if (allCancelled) {
      await admin
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.order_id)
    }

    revalidatePath('/vendor/orders')
    revalidatePath('/vendor')
    revalidatePath('/orders')
    revalidatePath(`/vendor/orders/${item.order_id}`)
    revalidatePath(`/vendor/orders/${item.id}`)

    return { success: true, refundAmount }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}

/**
 * 9. GET VENDOR BALANCE & PAYOUT DATA
 */
export async function getVendorBalanceDataAction(): Promise<{
  success: boolean
  data?: {
    shop: Shop
    totalNetCompleted: number
    pendingPaidPayouts: number
    availableBalance: number
    payoutHistory: any[]
    bankDetails?: {
      bankName: string
      accountNo: string
      accountHolder: string
    }
  }
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized' }
    }

    const admin = createAdminClient()

    const { data: shop } = await admin
      .from('shops')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    // Hitung total pesanan diterima (processing, shipped, completed)
    const { data: activeItems } = await admin
      .from('order_items')
      .select('net_amount, fulfilment_status')
      .eq('shop_id', shop.id)
      .in('fulfilment_status', ['processing', 'shipped', 'completed'])

    const totalNetCompleted = (activeItems || []).reduce(
      (acc, it) => acc + Number(it.net_amount || 0),
      0
    )

    // Ambil daftar permohonan penarikan dana
    const { data: payouts } = await admin
      .from('payout_requests')
      .select('*')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })

    const payoutHistory = payouts || []

    const pendingPaidPayouts = payoutHistory
      .filter((p) => p.status === 'pending' || p.status === 'paid')
      .reduce((acc, p) => acc + Number(p.amount), 0)

    const meta = parseShopMetadata(shop.description)
    const baseBalance = typeof meta.balance === 'number' ? meta.balance : totalNetCompleted
    const availableBalance = Math.max(0, baseBalance - pendingPaidPayouts)

    const bankDetails = {
      bankName: (shop as any).bank_name || meta.bank_name || '',
      accountNo: (shop as any).bank_account_number || meta.bank_account_number || '',
      accountHolder: (shop as any).bank_account_holder || meta.bank_account_holder || '',
    }

    return {
      success: true,
      data: {
        shop,
        totalNetCompleted,
        pendingPaidPayouts,
        availableBalance,
        payoutHistory,
        bankDetails,
      },
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat informasi saldo'
    return { success: false, error: msg }
  }
}

/**
 * 10. REQUEST PAYOUT ACTION
 */
export async function requestPayoutAction(payload: PayoutInput): Promise<{
  success: boolean
  payoutId?: string
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized: Vendor only' }
    }

    const parsed = PayoutSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid' }
    }

    const { amount, bankName, accountNo, accountHolder } = parsed.data
    const supabase = await createClient()

    // Panggil RPC request_payout
    const { data, error } = await supabase.rpc('request_payout', {
      p_amount: amount,
      p_bank_name: bankName,
      p_account_no: accountNo,
      p_account_holder: accountHolder,
    })

    if (error) {
      return { success: false, error: error.message || 'Gagal mengajukan penarikan dana' }
    }

    revalidatePath('/vendor/balance')
    revalidatePath('/vendor')

    return { success: true, payoutId: (data as any)?.id }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}

/**
 * 11. UPDATE SHOP SETTINGS
 */
export async function updateShopSettingsAction(payload: ShopSettingsInput): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user, profile } = await getUser()
    if (!user || profile?.role !== 'vendor') {
      return { success: false, error: 'Unauthorized' }
    }

    const parsed = ShopSettingsSchema.safeParse(payload)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message || 'Data tidak valid' }
    }

    const supabase = await createClient()

    // Ambil data toko lama untuk mempertahankan metadata (seperti bank, kurir, alamat gudang)
    const { data: existingShop } = await supabase
      .from('shops')
      .select('description')
      .eq('profile_id', user.id)
      .single()

    const currentMeta = parseShopMetadata(existingShop?.description)
    const updatedMeta: ShopMetadata = {
      ...currentMeta,
      bio: parsed.data.description !== undefined ? (parsed.data.description || '') : (currentMeta.bio || ''),
      ...(parsed.data.bankName !== undefined ? { bank_name: parsed.data.bankName || undefined } : {}),
      ...(parsed.data.bankAccountNumber !== undefined
        ? { bank_account_number: parsed.data.bankAccountNumber || undefined }
        : {}),
      ...(parsed.data.bankAccountHolder !== undefined
        ? { bank_account_holder: parsed.data.bankAccountHolder || undefined }
        : {}),
    }

    const { error } = await supabase
      .from('shops')
      .update({
        name: parsed.data.name,
        description: serializeShopMetadata(updatedMeta),
        logo_url: parsed.data.logoUrl,
        flat_shipping_cost: parsed.data.flatShippingCost,
        whatsapp: parsed.data.whatsapp,
        phone: parsed.data.phone,
        city: parsed.data.city,
        province: parsed.data.province,
        updated_at: new Date().toISOString(),
      })
      .eq('profile_id', user.id)

    if (error) return { success: false, error: error.message }

    revalidatePath('/vendor/settings')
    revalidatePath('/vendor')
    revalidatePath('/')

    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menyimpan pengaturan toko'
    return { success: false, error: msg }
  }
}
