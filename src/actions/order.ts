'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUser } from '@/lib/auth'
import {
  createMidtransSnapToken,
  createMidtransChargeVA,
  getMidtransTransactionStatus,
  mapMidtransStatus,
  type SupportedBank,
  type MidtransChargeVAResponse,
} from '@/lib/midtrans'

export interface CheckoutItemPayload {
  productId: string
  title: string
  slug?: string
  price: number
  qty: number
  imageUrl?: string
  shopId?: string
}

export interface ShippingAddressPayload {
  recipientName: string
  phone: string
  addressLine: string
  city: string
  province: string
  postalCode: string
}

export interface ShippingOptionPayload {
  name: string
  courier: string
  cost: number
  estimatedDays: string
}

export async function createOrderAction(data: {
  items: CheckoutItemPayload[]
  shippingAddress: ShippingAddressPayload
  shippingOption: ShippingOptionPayload
  paymentMethod: 'midtrans' | 'qris' | 'bank_transfer'
  buyerNote?: string
}): Promise<{
  success: boolean
  orderId?: string
  orderCode?: string
  snapToken?: string
  total?: number
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk checkout.' }
    }

    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'Tidak ada produk dalam keranjang checkout.' }
    }

    if (!data.shippingAddress?.addressLine || !data.shippingAddress?.city) {
      return { success: false, error: 'Alamat pengiriman belum lengkap.' }
    }

    const adminClient = createAdminClient()

    // 1. Hitung total
    const subtotal = data.items.reduce((acc, item) => acc + item.price * item.qty, 0)
    const shippingCost = data.shippingOption.cost || 15000
    const serviceFee = 1000
    const grandTotal = subtotal + shippingCost + serviceFee

    // 2. Buat Order Code unik
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randSuffix = Math.floor(1000 + Math.random() * 9000)
    const orderCode = `KRF-${dateStr}-${randSuffix}`

    // 3. Simpan ke tabel orders
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 jam
    const { data: newOrder, error: orderError } = await adminClient
      .from('orders')
      .insert({
        profile_id: user.id,
        code: orderCode,
        status: 'pending_payment',
        total: grandTotal,
        shipping_address: {
          ...data.shippingAddress,
          courier: data.shippingOption.courier,
          shippingService: data.shippingOption.name,
          shippingCost: data.shippingOption.cost,
          estimatedDays: data.shippingOption.estimatedDays,
          buyerNote: data.buyerNote || null,
        },
        expires_at: expiresAt,
      })
      .select('id, code, total')
      .single()

    if (orderError || !newOrder) {
      console.error('[Create Order Error]', orderError)
      return { success: false, error: orderError?.message || 'Gagal membuat pesanan' }
    }

    // 4. Simpan item ke tabel order_items
    const trackingNumber = `KRFEXP-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`
    const orderItems = data.items.map((item) => {
      const commission = Math.round(item.price * 0.05)
      return {
        order_id: newOrder.id,
        shop_id: item.shopId || user.id,
        product_id: item.productId,
        title: item.title,
        price: item.price,
        qty: item.qty,
        shipping_cost: shippingCost,
        commission_amount: commission,
        net_amount: item.price - commission,
        buyer_note: data.buyerNote || null,
        fulfilment_status: 'waiting' as const,
        tracking_number: trackingNumber,
      }
    })

    const { error: itemsError } = await adminClient.from('order_items').insert(orderItems)
    if (itemsError) {
      console.warn('[Order Items Warning]', itemsError)
    }

    // 5. Kosongkan keranjang belanja pengguna
    await adminClient.from('cart_items').delete().eq('profile_id', user.id)

    // 6. Jika metode Midtrans, buat Snap Token
    let snapToken: string | undefined
    if (data.paymentMethod === 'midtrans') {
      const snapRes = await createMidtransSnapToken({
        orderId: newOrder.code,
        grossAmount: newOrder.total,
        customerDetails: {
          firstName: data.shippingAddress.recipientName,
          email: user.email,
          phone: data.shippingAddress.phone,
        },
        itemDetails: [
          ...data.items.map((item) => ({
            id: item.productId,
            name: item.title,
            price: item.price,
            quantity: item.qty,
          })),
          {
            id: 'shipping-fee',
            name: `Ongkir (${data.shippingOption.courier})`,
            price: shippingCost,
            quantity: 1,
          },
          {
            id: 'service-fee',
            name: 'Biaya Layanan',
            price: serviceFee,
            quantity: 1,
          },
        ],
      })

      if (snapRes.token) {
        snapToken = snapRes.token
        await adminClient
          .from('orders')
          .update({ snap_token: snapToken })
          .eq('id', newOrder.id)
      }
    }

    revalidatePath('/cart')
    revalidatePath('/account')
    return {
      success: true,
      orderId: newOrder.id,
      orderCode: newOrder.code,
      snapToken,
      total: newOrder.total,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat checkout'
    console.error('[createOrderAction Error]', msg)
    return { success: false, error: msg }
  }
}

/**
 * Konfirmasi Pembayaran Pesanan (Auto Sync saat user membayar)
 */
export async function confirmOrderPaymentAction(orderId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }

    const adminClient = createAdminClient()

    // Update status order menjadi 'paid'
    const { error: updateOrderError } = await adminClient
      .from('orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateOrderError) {
      return { success: false, error: updateOrderError.message }
    }

    // Update fulfilment_status item menjadi 'processing' (Sedang Dikemas)
    await adminClient
      .from('order_items')
      .update({
        fulfilment_status: 'processing',
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)

    revalidatePath('/orders')
    revalidatePath(`/orders/${orderId}`)
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengonfirmasi pembayaran'
    return { success: false, error: msg }
  }
}

/**
 * Mengambil Detail Pesanan dan Riwayat Pelacakan Paket
 */
export async function getOrderDetailsAction(orderId: string) {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized', data: null }
    }

    const supabase = await createClient()

    // Ambil order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle()

    if (orderError || !order) {
      return { success: false, error: 'Pesanan tidak ditemukan', data: null }
    }

    // Ambil items beserta tipe produk
    const { data: items } = await supabase
      .from('order_items')
      .select('*, products(type, slug, product_images(path))')
      .eq('order_id', order.id)

    const mappedItems = (items || []).map((it: any) => ({
      ...it,
      type: it.products?.type || (it.download_expires_at ? 'digital' : 'physical'),
      imageUrl: it.products?.product_images?.[0]?.path || null,
      remainingDownloads: Math.max(0, 5 - (it.downloads_count || 0)),
    }))

    // Bentuk Timeline Pelacakan Paket Lengkap
    const createdAt = new Date(order.created_at)
    const paidAt = order.paid_at ? new Date(order.paid_at) : null

    // Format tanggal ramah
    const formatTime = (d: Date) =>
      d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

    const trackingNumber =
      items?.[0]?.tracking_number || `KRFEXP-${order.code.replace(/[^0-9]/g, '')}`

    const shippingInfo = (order.shipping_address as any) || {}

    // Timeline tahapan pengiriman
    const trackingSteps = [
      {
        title: 'Pesanan Dibuat',
        description: 'Menunggu pembayaran dari pembeli',
        time: formatTime(createdAt),
        completed: true,
        current: !paidAt,
      },
      {
        title: 'Pembayaran Dikonfirmasi',
        description: paidAt
          ? `Pembayaran berhasil diverifikasi. Dana aman di rekening penampung Krafita.`
          : 'Menunggu konfirmasi pembayaran',
        time: paidAt ? formatTime(paidAt) : null,
        completed: Boolean(paidAt),
        current: Boolean(paidAt) && order.status === 'paid',
      },
      {
        title: 'Sedang Dikemas (Gudang Asal)',
        description: `Pesanan sedang disiapkan & dikemas dengan bubble wrap aman di Gudang Krafita Hub Barat (Jakarta Barat).`,
        time: paidAt ? formatTime(new Date(paidAt.getTime() + 15 * 60 * 1000)) : null,
        completed: Boolean(paidAt),
        current: false,
      },
      {
        title: 'Sedang Dikirim & Transit',
        description: `Paket dijemput kurir ${shippingInfo.courier || 'Krafita Express'}. Rute Transit: Sorting Hub Jakarta ➔ DC Transit Surabaya ➔ Hub Kota ${shippingInfo.city || 'Tujuan'}.`,
        time: paidAt ? formatTime(new Date(paidAt.getTime() + 60 * 60 * 1000)) : null,
        completed: Boolean(paidAt),
        current: false,
      },
      {
        title: 'Sedang Diantar Kurir ke Alamat Anda',
        description: `Kurir sedang menuju alamat penerima: ${shippingInfo.recipientName || 'Pembeli'} (${shippingInfo.addressLine || ''}, ${shippingInfo.city || ''}). Estimasi tiba: ${shippingInfo.estimatedDays || '2-3 Hari Kerja'}.`,
        time: paidAt ? `Estimasi Tiba: ${shippingInfo.estimatedDays || '2-3 Hari'}` : null,
        completed: false,
        current: Boolean(paidAt),
      },
    ]

    return {
      success: true,
      data: {
        order,
        items: mappedItems,
        shippingInfo,
        trackingNumber,
        trackingSteps,
      },
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengambil detail pesanan'
    return { success: false, error: msg, data: null }
  }
}

export interface ServiceOrderPayload {
  customerName: string
  customerPhone: string
  customerEmail: string
  division: string
  serviceName: string
  complexity?: string
  projectTitle: string
  deadline: string
  description?: string
  basePrice: number
  taxAmount: number
  serviceFee: number
  totalAmount: number
  productId?: string
  items?: CheckoutItemPayload[]
}

/**
 * Membuat Pesanan Layanan / Direct Order untuk Flow Checkout 4 Langkah
 */
export async function createServiceOrDirectOrderAction(payload: ServiceOrderPayload): Promise<{
  success: boolean
  orderId?: string
  orderCode?: string
  total?: number
  snapToken?: string
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk melanjutkan pesanan.' }
    }

    if (!payload.customerName || !payload.customerPhone || !payload.customerEmail) {
      return { success: false, error: 'Harap lengkapi data diri pemesan (Nama, No WA, Email).' }
    }

    if (!payload.projectTitle) {
      return { success: false, error: 'Harap isi judul proyek atau pesanan Anda.' }
    }

    const adminClient = createAdminClient()

    // Buat Transaction ID unik seperti referensi JO-ORD-XXXXXX
    const randSuffix = Math.floor(100000 + Math.random() * 900000)
    const orderCode = `JO-ORD-${randSuffix}`

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const grandTotal = Math.round(payload.totalAmount)

    // 1. Simpan order ke database
    const { data: newOrder, error: orderError } = await adminClient
      .from('orders')
      .insert({
        profile_id: user.id,
        code: orderCode,
        status: 'pending_payment',
        total: grandTotal,
        shipping_address: {
          recipientName: payload.customerName,
          phone: payload.customerPhone,
          email: payload.customerEmail,
          division: payload.division,
          serviceName: payload.serviceName,
          complexity: payload.complexity || 'Sedang',
          projectTitle: payload.projectTitle,
          deadline: payload.deadline,
          description: payload.description || '',
          basePrice: payload.basePrice,
          taxAmount: payload.taxAmount,
          serviceFee: payload.serviceFee,
          totalAmount: grandTotal,
          courier: 'Layanan Digital & Sistem',
          shippingCost: 0,
        },
        expires_at: expiresAt,
      })
      .select('id, code, total')
      .single()

    if (orderError || !newOrder) {
      console.error('[Create Service Order Error]', orderError)
      return { success: false, error: orderError?.message || 'Gagal menyimpan pesanan' }
    }

    // 2. Simpan item ke tabel order_items
    const trackingNumber = `JO-TRK-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`
    const commission = Math.round(payload.basePrice * 0.05)

    const { error: itemError } = await adminClient.from('order_items').insert({
      order_id: newOrder.id,
      shop_id: user.id,
      product_id: payload.productId || 'custom-service',
      title: `${payload.serviceName} — ${payload.projectTitle}`,
      price: payload.basePrice,
      qty: 1,
      shipping_cost: 0,
      commission_amount: commission,
      net_amount: payload.basePrice - commission,
      buyer_note: payload.description || null,
      fulfilment_status: 'waiting',
      tracking_number: trackingNumber,
    })

    if (itemError) {
      console.warn('[Create Service Order Item Warning]', itemError)
    }

    // 3. Buat Snap Token Midtrans agar siap digunakan
    let snapToken: string | undefined
    const snapRes = await createMidtransSnapToken({
      orderId: newOrder.code,
      grossAmount: newOrder.total,
      customerDetails: {
        firstName: payload.customerName,
        email: payload.customerEmail,
        phone: payload.customerPhone,
      },
      itemDetails: [
        {
          id: 'item-service',
          name: `${payload.serviceName.slice(0, 40)}`,
          price: Math.round(payload.basePrice),
          quantity: 1,
        },
        {
          id: 'ppn-11',
          name: 'PPN (11%)',
          price: Math.round(payload.taxAmount),
          quantity: 1,
        },
        {
          id: 'service-fee',
          name: 'Biaya Layanan JasaOne',
          price: Math.round(payload.serviceFee),
          quantity: 1,
        },
      ],
    })

    if (snapRes.token) {
      snapToken = snapRes.token
      await adminClient
        .from('orders')
        .update({ snap_token: snapToken })
        .eq('id', newOrder.id)
    }

    revalidatePath('/orders')
    return {
      success: true,
      orderId: newOrder.id,
      orderCode: newOrder.code,
      total: newOrder.total,
      snapToken,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}

/**
 * Menghasilkan Nomor Virtual Account Midtrans Sandbox untuk Bank Pilihan
 */
export async function requestBankVaPaymentAction(
  orderCode: string,
  bank: SupportedBank
): Promise<MidtransChargeVAResponse> {
  try {
    const adminClient = createAdminClient()

    const { data: order } = await adminClient
      .from('orders')
      .select('id, code, total, shipping_address')
      .eq('code', orderCode)
      .maybeSingle()

    if (!order) {
      return {
        success: false,
        bank,
        simulatorUrl: 'https://simulator.sandbox.midtrans.com',
        error: 'Order tidak ditemukan',
      }
    }

    const shippingInfo = (order.shipping_address as any) || {}

    const vaResult = await createMidtransChargeVA(
      order.code,
      order.total,
      bank,
      {
        firstName: shippingInfo.recipientName || 'Pelanggan',
        email: shippingInfo.email || 'customer@krafita.com',
        phone: shippingInfo.phone || '08123456789',
      }
    )

    if (vaResult.success) {
      // Simpan data VA ke order shipping_address
      await adminClient
        .from('orders')
        .update({
          shipping_address: {
            ...shippingInfo,
            paymentMethod: 'virtual_account',
            selectedBank: bank,
            vaNumber: vaResult.vaNumber || vaResult.billKey,
            billerCode: vaResult.billerCode,
            billKey: vaResult.billKey,
            simulatorUrl: vaResult.simulatorUrl,
          },
        })
        .eq('id', order.id)
    }

    return vaResult
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghasilkan Virtual Account'
    return {
      success: false,
      bank,
      simulatorUrl: 'https://simulator.sandbox.midtrans.com',
      error: msg,
    }
  }
}

/**
 * Mengecek dan menyinkronkan status pembayaran secara langsung
 */
export async function checkAndSyncPaymentStatusAction(orderCode: string): Promise<{
  success: boolean
  isPaid: boolean
  status?: string
  paidAt?: string
  error?: string
}> {
  try {
    const adminClient = createAdminClient()

    const { data: order } = await adminClient
      .from('orders')
      .select('id, code, status, paid_at')
      .eq('code', orderCode)
      .maybeSingle()

    if (!order) {
      return { success: false, isPaid: false, error: 'Pesanan tidak ditemukan' }
    }

    if (order.status === 'paid') {
      return {
        success: true,
        isPaid: true,
        status: 'paid',
        paidAt: order.paid_at || new Date().toISOString(),
      }
    }

    const midtransRes = await getMidtransTransactionStatus(orderCode)
    if (!midtransRes.success) {
      return { success: true, isPaid: false, status: order.status }
    }

    const mapped = mapMidtransStatus(midtransRes.transactionStatus, midtransRes.fraudStatus)
    if (mapped === 'paid') {
      const paidTime = midtransRes.settlementTime || new Date().toISOString()
      await adminClient
        .from('orders')
        .update({
          status: 'paid',
          paid_at: paidTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)

      await adminClient
        .from('order_items')
        .update({
          fulfilment_status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', order.id)

      revalidatePath(`/orders/${order.id}`)
      return {
        success: true,
        isPaid: true,
        status: 'paid',
        paidAt: paidTime,
      }
    }

    return {
      success: true,
      isPaid: false,
      status: order.status,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal memeriksa status pembayaran'
    return { success: false, isPaid: false, error: msg }
  }
}

export interface MarketplaceOrderItemPayload {
  productId: string
  title: string
  price: number
  qty: number
  imageUrl?: string
  shopId?: string
  shopName?: string
  type: 'physical' | 'digital'
  buyerNote?: string
}

export interface MarketplaceOrderPayload {
  items: MarketplaceOrderItemPayload[]
  shippingAddress?: {
    recipientName: string
    phone: string
    addressLine: string
    city: string
    province: string
    postalCode: string
  } | null
  shippingOption?: {
    name: string
    courier: string
    cost: number
    estimatedDays: string
  } | null
  hasPhysicalItems: boolean
  customerEmail?: string
}

/**
 * Membuat Pesanan Marketplace Multi-Vendor (Mendukung Produk Fisik & Digital)
 */
export async function createMarketplaceOrderAction(data: MarketplaceOrderPayload): Promise<{
  success: boolean
  orderId?: string
  orderCode?: string
  snapToken?: string
  total?: number
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Silakan login terlebih dahulu untuk checkout.' }
    }

    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'Tidak ada produk dalam pesanan.' }
    }

    if (data.hasPhysicalItems) {
      if (!data.shippingAddress?.addressLine || !data.shippingAddress?.city || !data.shippingAddress?.recipientName) {
        return { success: false, error: 'Alamat pengiriman fisik belum lengkap.' }
      }
    }

    const adminClient = createAdminClient()

    // 1. Hitung total biaya
    const subtotal = data.items.reduce((acc, item) => acc + item.price * (item.qty || 1), 0)
    const shippingCost = data.hasPhysicalItems ? (data.shippingOption?.cost || 15000) : 0
    const serviceFee = 1000 // Biaya Layanan Krafita
    const grandTotal = subtotal + shippingCost + serviceFee

    // 2. Buat Order Code unik: KRF-ORD-XXXXXX
    const randSuffix = Math.floor(100000 + Math.random() * 900000)
    const orderCode = `KRF-ORD-${randSuffix}`

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 jam

    const shippingInfoJson = {
      recipientName: data.shippingAddress?.recipientName || user.email || 'Pelanggan Krafita',
      phone: data.shippingAddress?.phone || '-',
      addressLine: data.shippingAddress?.addressLine || '-',
      city: data.shippingAddress?.city || '-',
      province: data.shippingAddress?.province || '-',
      postalCode: data.shippingAddress?.postalCode || '-',
      courier: data.hasPhysicalItems ? (data.shippingOption?.courier || 'Krafita Express') : 'Pengiriman Digital',
      shippingService: data.hasPhysicalItems ? (data.shippingOption?.name || 'Reguler') : 'Instant Cloud Download',
      shippingCost,
      estimatedDays: data.hasPhysicalItems ? (data.shippingOption?.estimatedDays || '2-3 Hari') : 'Akses Instan Setelah Lunas',
      hasPhysicalItems: data.hasPhysicalItems,
      hasDigitalItems: data.items.some((i) => i.type === 'digital'),
      email: data.customerEmail || user.email,
    }

    // 3. Simpan ke tabel orders
    const { data: newOrder, error: orderError } = await adminClient
      .from('orders')
      .insert({
        profile_id: user.id,
        code: orderCode,
        status: 'pending_payment',
        total: grandTotal,
        shipping_address: shippingInfoJson,
        expires_at: expiresAt,
      })
      .select('id, code, total')
      .single()

    if (orderError || !newOrder) {
      console.error('[Create Marketplace Order Error]', orderError)
      return { success: false, error: orderError?.message || 'Gagal membuat pesanan' }
    }

    // 4. Simpan ke tabel order_items
    const trackingNumber = `KRFEXP-${Date.now().toString().slice(-6)}${Math.floor(10 + Math.random() * 90)}`
    const downloadExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 hari

    const orderItems = data.items.map((item) => {
      const commission = Math.round(item.price * 0.05)
      return {
        order_id: newOrder.id,
        shop_id: item.shopId || user.id,
        product_id: item.productId,
        title: item.title,
        price: item.price,
        qty: item.qty || 1,
        shipping_cost: shippingCost,
        commission_amount: commission,
        net_amount: item.price - commission,
        buyer_note: item.buyerNote || null,
        fulfilment_status: 'waiting' as const,
        tracking_number: item.type === 'physical' ? trackingNumber : null,
        downloads_count: 0,
        download_expires_at: item.type === 'digital' ? downloadExpiresAt : null,
      }
    })

    const { error: itemsError } = await adminClient.from('order_items').insert(orderItems)
    if (itemsError) {
      console.warn('[Order Items Insert Warning]', itemsError)
    }

    // 5. Kosongkan keranjang belanja pengguna
    await adminClient.from('cart_items').delete().eq('profile_id', user.id)

    // 6. Buat Snap Token Midtrans
    let snapToken: string | undefined
    const snapRes = await createMidtransSnapToken({
      orderId: newOrder.code,
      grossAmount: newOrder.total,
      customerDetails: {
        firstName: data.shippingAddress?.recipientName || 'Pelanggan Krafita',
        email: user.email,
        phone: data.shippingAddress?.phone || '08123456789',
      },
      itemDetails: [
        ...data.items.map((item) => ({
          id: item.productId.slice(0, 50),
          name: item.title.slice(0, 50),
          price: Math.round(item.price),
          quantity: item.qty || 1,
        })),
        ...(shippingCost > 0
          ? [
              {
                id: 'shipping-cost',
                name: `Ongkir (${data.shippingOption?.courier || 'Kurir'})`,
                price: shippingCost,
                quantity: 1,
              },
            ]
          : []),
        {
          id: 'service-fee',
          name: 'Biaya Layanan Krafita',
          price: serviceFee,
          quantity: 1,
        },
      ],
    })

    if (snapRes.token) {
      snapToken = snapRes.token
      await adminClient.from('orders').update({ snap_token: snapToken }).eq('id', newOrder.id)
    }

    revalidatePath('/cart')
    revalidatePath('/orders')
    return {
      success: true,
      orderId: newOrder.id,
      orderCode: newOrder.code,
      snapToken,
      total: newOrder.total,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat checkout'
    return { success: false, error: msg }
  }
}

/**
 * Mengambil atau membuat Snap Token untuk Order tertentu (Midtrans Snap Embed)
 */
export async function getOrCreateSnapTokenAction(orderCode: string): Promise<{
  success: boolean
  snapToken?: string
  error?: string
}> {
  try {
    const adminClient = createAdminClient()
    const { data: order } = await adminClient
      .from('orders')
      .select('id, code, total, snap_token, shipping_address')
      .eq('code', orderCode)
      .maybeSingle()

    if (!order) {
      return { success: false, error: 'Pesanan tidak ditemukan' }
    }

    if (order.snap_token) {
      return { success: true, snapToken: order.snap_token }
    }

    // Jika belum ada snap token, buat baru via Midtrans
    const shipping = order.shipping_address as any
    const snapRes = await createMidtransSnapToken({
      orderId: order.code,
      grossAmount: order.total,
      customerDetails: {
        firstName: shipping?.recipientName || 'Pelanggan Krafita',
        phone: shipping?.phone || '08123456789',
        email: shipping?.email || 'pembeli@krafita.com',
      },
      itemDetails: [
        {
          id: 'order-total',
          name: `Pesanan ${order.code}`,
          price: order.total,
          quantity: 1,
        },
      ],
    })

    if (snapRes.token) {
      await adminClient.from('orders').update({ snap_token: snapRes.token }).eq('id', order.id)
      return { success: true, snapToken: snapRes.token }
    }

    return { success: false, error: snapRes.error || 'Gagal menghasilkan token Midtrans Snap' }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat membuat snap token'
    return { success: false, error: msg }
  }
}

/**
 * Konfirmasi pesanan telah diterima oleh pembeli (fulfilment_status -> completed)
 */
export async function confirmOrderReceivedAction(itemId: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { user } = await getUser()
    if (!user) {
      return { success: false, error: 'Unauthorized: Silakan login terlebih dahulu' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.rpc('confirm_received', {
      p_item_id: itemId,
    })

    if (error) {
      return { success: false, error: error.message || 'Gagal mengonfirmasi pesanan diterima' }
    }

    revalidatePath('/orders')
    revalidatePath('/vendor')
    revalidatePath('/vendor/orders')
    revalidatePath('/vendor/balance')

    return { success: Boolean(data) }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem'
    return { success: false, error: msg }
  }
}



