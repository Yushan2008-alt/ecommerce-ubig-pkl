'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth'
import type { Database, FulfilmentStatus, ProductStatus, ProductType } from '@/types/database'

type Shop = Database['public']['Tables']['shops']['Row']

const BecomeVendorSchema = z.object({
  name: z.string().min(2, 'Nama toko minimal 2 karakter').max(60, 'Nama toko maksimal 60 karakter'),
  slug: z
    .string()
    .min(2, 'Slug toko minimal 2 karakter')
    .max(60, 'Slug toko maksimal 60 karakter')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan strip (-)'),
  category: z.string().optional().nullable(),
  description: z.string().max(1000, 'Deskripsi maksimal 1000 karakter').optional().nullable(),
  logo_url: z.string().url('URL logo tidak valid').optional().nullable(),
  flat_shipping_cost: z.number().min(0, 'Ongkir tidak boleh negatif').default(0),
  whatsapp: z.string().max(20, 'Nomor WhatsApp terlalu panjang').optional().nullable(),
  phone: z.string().max(20, 'Nomor telepon terlalu panjang').optional().nullable(),
  email: z.string().email('Email tidak valid').optional().nullable(),
  city: z.string().max(100, 'Nama kota terlalu panjang').optional().nullable(),
  province: z.string().max(100, 'Nama provinsi terlalu panjang').optional().nullable(),
})

export type BecomeVendorInput = z.infer<typeof BecomeVendorSchema>

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
    recentOrders: any[]
    chartData: { date: string; sales: number; orders: number }[]
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

    // 3. Ambil total order items toko
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        price,
        qty,
        shipping_cost,
        commission_amount,
        net_amount,
        fulfilment_status,
        created_at,
        orders (
          id,
          code,
          status,
          created_at,
          paid_at,
          shipping_address
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

    // 5. Pesanan terbaru (5 item terakhir)
    const recentOrders = allItems.slice(0, 5).map((item: any) => {
      const order = Array.isArray(item.orders) ? item.orders[0] : item.orders
      return {
        id: item.id,
        orderId: item.order_id,
        orderCode: order?.code || '-',
        itemTotal: Number(item.price) * Number(item.qty),
        fulfilmentStatus: item.fulfilment_status,
        createdAt: item.created_at,
        shippingAddress: order?.shipping_address || {},
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

    // 7. Onboarding Checklist
    const hasProducts = (activeProductsCount || 0) > 0
    const hasBankAccount = (payouts || []).length > 0
    const profileComplete = Boolean(shop.whatsapp && shop.city && shop.description)

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

const ProductFormSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['physical', 'digital']),
  title: z.string().min(3, 'Judul minimal 3 karakter').max(120, 'Judul maksimal 120 karakter'),
  slug: z.string().min(3, 'Slug minimal 3 karakter').max(120),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  brandId: z.string().optional().nullable(),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  comparePrice: z.number().min(0).optional().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  // Khusus Fisik
  sku: z.string().max(50).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  weight: z.number().min(0).default(0),
  flatShippingCost: z.number().min(0).default(0),
  productLocation: z.string().max(100).optional().nullable(),
  attributes: z.record(z.string(), z.string()).optional().default({}),
  // Khusus Digital
  digitalFile: z
    .object({
      path: z.string(),
      fileName: z.string(),
      fileSize: z.number(),
      format: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  // Galeri Gambar
  images: z.array(z.string()).default([]),
})

export type ProductFormInput = z.infer<typeof ProductFormSchema>

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

    const supabase = await createClient()

    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    let query = supabase
      .from('order_items')
      .select(`
        *,
        products (
          id,
          title,
          type,
          slug,
          product_images (path)
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

    if (filterStatus && filterStatus !== 'all') {
      query = query.eq('fulfilment_status', filterStatus as FulfilmentStatus)
    }

    const { data, error } = await query

    if (error) return { success: false, error: error.message }

    const formatted = (data || []).map((it: any) => {
      const order = Array.isArray(it.orders) ? it.orders[0] : it.orders
      const buyerProfile = Array.isArray(order?.profiles) ? order.profiles[0] : order?.profiles
      const product = Array.isArray(it.products) ? it.products[0] : it.products
      const images = Array.isArray(product?.product_images)
        ? product.product_images
        : [product?.product_images]

      return {
        id: it.id,
        orderId: it.order_id,
        orderCode: order?.code || '-',
        orderStatus: order?.status || 'pending_payment',
        orderDate: it.created_at,
        paidAt: order?.paid_at,
        title: it.title,
        price: Number(it.price),
        qty: it.qty,
        netAmount: Number(it.net_amount),
        commissionAmount: Number(it.commission_amount),
        buyerNote: it.buyer_note,
        fulfilmentStatus: it.fulfilment_status as FulfilmentStatus,
        trackingNumber: it.tracking_number,
        productType: product?.type || 'physical',
        productSlug: product?.slug,
        imageUrl: images?.[0]?.path || null,
        shippingAddress: order?.shipping_address || {},
        buyer: {
          name: buyerProfile?.display_name || 'Pembeli',
          phone: buyerProfile?.phone || '-',
          avatar: buyerProfile?.avatar_url,
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

    const supabase = await createClient()

    // Jalankan RPC vendor_update_fulfilment
    const { data, error } = await supabase.rpc('vendor_update_fulfilment', {
      p_item_id: itemId,
      p_status: status,
      p_tracking: trackingNumber?.trim() || null,
    })

    if (error) {
      return { success: false, error: error.message || 'Gagal memperbarui status pengiriman' }
    }

    revalidatePath('/vendor/orders')
    revalidatePath('/vendor')
    revalidatePath('/orders')

    return { success: Boolean(data) }
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
  }
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
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (!shop) return { success: false, error: 'Toko tidak ditemukan' }

    // Hitung total completed net_amount
    const { data: completedItems } = await supabase
      .from('order_items')
      .select('net_amount')
      .eq('shop_id', shop.id)
      .eq('fulfilment_status', 'completed')

    const totalNetCompleted = (completedItems || []).reduce(
      (acc, it) => acc + Number(it.net_amount || 0),
      0
    )

    // Ambil daftar permohonan penarikan dana
    const { data: payouts } = await supabase
      .from('payout_requests')
      .select('*')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })

    const payoutHistory = payouts || []

    const pendingPaidPayouts = payoutHistory
      .filter((p) => p.status === 'pending' || p.status === 'paid')
      .reduce((acc, p) => acc + Number(p.amount), 0)

    const availableBalance = Math.max(0, totalNetCompleted - pendingPaidPayouts)

    return {
      success: true,
      data: {
        shop,
        totalNetCompleted,
        pendingPaidPayouts,
        availableBalance,
        payoutHistory,
      },
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memuat informasi saldo'
    return { success: false, error: msg }
  }
}

const PayoutSchema = z.object({
  amount: z.number().min(10000, 'Minimal penarikan dana adalah Rp 10.000'),
  bankName: z.string().min(2, 'Nama bank wajib dipilih'),
  accountNo: z.string().min(5, 'Nomor rekening minimal 5 digit'),
  accountHolder: z.string().min(3, 'Nama pemilik rekening minimal 3 karakter'),
})

export type PayoutInput = z.infer<typeof PayoutSchema>

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

const ShopSettingsSchema = z.object({
  name: z.string().min(2).max(60),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  flatShippingCost: z.number().min(0).default(0),
  whatsapp: z.string().max(20).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  province: z.string().max(100).optional().nullable(),
})

export type ShopSettingsInput = z.infer<typeof ShopSettingsSchema>

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

    const { error } = await supabase
      .from('shops')
      .update({
        name: parsed.data.name,
        description: parsed.data.description,
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
