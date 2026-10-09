import 'server-only'
import { createHash, timingSafeEqual } from 'crypto'

interface MidtransTransactionPayload {
  orderId: string
  grossAmount: number
  customerDetails?: {
    firstName?: string
    email?: string
    phone?: string
  }
  itemDetails?: Array<{
    id: string
    price: number
    quantity: number
    name: string
  }>
}

export type SupportedBank = 'bca' | 'bni' | 'bri' | 'permata' | 'mandiri'

export interface MidtransChargeVAResponse {
  success: boolean
  bank: SupportedBank
  vaNumber?: string
  billerCode?: string
  billKey?: string
  transactionId?: string
  simulatorUrl: string
  expiryTime?: string
  error?: string
}

const getBaseUrl = () => {
  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  return isProduction ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'
}

const getAuthHeader = () => {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
  return Buffer.from(`${serverKey}:`).toString('base64')
}

export async function createMidtransSnapToken(payload: MidtransTransactionPayload): Promise<{
  token?: string
  redirectUrl?: string
  error?: string
}> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    console.warn('[Midtrans Warning] MIDTRANS_SERVER_KEY belum dikonfigurasi')
    return { error: 'MIDTRANS_SERVER_KEY belum dikonfigurasi' }
  }

  const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
  const endpoint = isProduction
    ? 'https://app.midtrans.com/snap/v1/transactions'
    : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${getAuthHeader()}`,
      },
      body: JSON.stringify({
        transaction_details: {
          order_id: payload.orderId,
          gross_amount: Math.round(payload.grossAmount),
        },
        customer_details: {
          first_name: payload.customerDetails?.firstName || 'Pelanggan',
          email: payload.customerDetails?.email || 'customer@krafita.com',
          phone: payload.customerDetails?.phone || '08123456789',
        },
        item_details: payload.itemDetails?.map((item) => ({
          id: item.id.slice(0, 50),
          price: Math.round(item.price),
          quantity: item.quantity,
          name: item.name.slice(0, 50),
        })),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[Midtrans Error Response]', data)
      return { error: data.error_messages?.join(', ') || 'Gagal menghubungi server Midtrans' }
    }

    return {
      token: data.token,
      redirectUrl: data.redirect_url,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Koneksi Midtrans gagal'
    console.error('[Midtrans Fetch Error]', msg)
    return { error: msg }
  }
}

/**
 * Membuat transaksi Virtual Account langsung melalui Midtrans Core API (Charge API).
 * Menghasilkan nomor VA nyata yang valid untuk diuji di https://simulator.sandbox.midtrans.com/
 */
export async function createMidtransChargeVA(
  orderId: string,
  grossAmount: number,
  bank: SupportedBank,
  customerDetails?: {
    firstName?: string
    email?: string
    phone?: string
  }
): Promise<MidtransChargeVAResponse> {
  const serverKey = process.env.MIDTRANS_SERVER_KEY
  if (!serverKey) {
    return {
      success: false,
      bank,
      simulatorUrl: 'https://simulator.sandbox.midtrans.com',
      error: 'MIDTRANS_SERVER_KEY belum disetel',
    }
  }

  const baseUrl = getBaseUrl()
  const endpoint = `${baseUrl}/v2/charge`

  let chargeBody: Record<string, unknown> = {}
  let simulatorUrl = 'https://simulator.sandbox.midtrans.com'

  if (bank === 'mandiri') {
    chargeBody = {
      payment_type: 'echannel',
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(grossAmount),
      },
      echannel: {
        bill_info1: 'Pembayaran Order:',
        bill_info2: orderId.slice(0, 30),
      },
      customer_details: {
        first_name: customerDetails?.firstName || 'Pelanggan',
        email: customerDetails?.email || 'customer@krafita.com',
        phone: customerDetails?.phone || '08123456789',
      },
    }
    simulatorUrl = 'https://simulator.sandbox.midtrans.com/mandiri/bill'
  } else if (bank === 'permata') {
    chargeBody = {
      payment_type: 'bank_transfer',
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(grossAmount),
      },
      bank_transfer: {
        bank: 'permata',
      },
      customer_details: {
        first_name: customerDetails?.firstName || 'Pelanggan',
        email: customerDetails?.email || 'customer@krafita.com',
        phone: customerDetails?.phone || '08123456789',
      },
    }
    simulatorUrl = 'https://simulator.sandbox.midtrans.com/permata/va'
  } else {
    // BCA, BNI, BRI
    chargeBody = {
      payment_type: 'bank_transfer',
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(grossAmount),
      },
      bank_transfer: {
        bank,
      },
      customer_details: {
        first_name: customerDetails?.firstName || 'Pelanggan',
        email: customerDetails?.email || 'customer@krafita.com',
        phone: customerDetails?.phone || '08123456789',
      },
    }
    simulatorUrl = `https://simulator.sandbox.midtrans.com/${bank}/va`
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${getAuthHeader()}`,
      },
      body: JSON.stringify(chargeBody),
    })

    const data = await res.json()

    if (!res.ok && data.status_code !== '201') {
      console.error('[Midtrans Charge VA Error]', data)
      return {
        success: false,
        bank,
        simulatorUrl,
        error: data.status_message || 'Gagal membuat tagihan Virtual Account',
      }
    }

    let vaNumber: string | undefined
    let billerCode: string | undefined
    let billKey: string | undefined

    if (bank === 'mandiri') {
      billerCode = data.biller_code
      billKey = data.bill_key
    } else if (bank === 'permata') {
      vaNumber = data.permata_va_number
    } else {
      vaNumber = data.va_numbers?.[0]?.va_number
    }

    return {
      success: true,
      bank,
      vaNumber,
      billerCode,
      billKey,
      transactionId: data.transaction_id,
      simulatorUrl,
      expiryTime: data.expiry_time,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Koneksi Midtrans gagal'
    return {
      success: false,
      bank,
      simulatorUrl,
      error: msg,
    }
  }
}

/**
 * Mengecek status transaksi terkini dari Midtrans
 */
export async function getMidtransTransactionStatus(orderId: string): Promise<{
  success: boolean
  transactionStatus?: string
  fraudStatus?: string
  grossAmount?: string
  paymentType?: string
  settlementTime?: string
  raw?: any
  error?: string
}> {
  const baseUrl = getBaseUrl()
  const endpoint = `${baseUrl}/v2/${orderId}/status`

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${getAuthHeader()}`,
      },
      cache: 'no-store',
    })

    const data = await res.json()

    if (!res.ok && data.status_code !== '200') {
      return {
        success: false,
        error: data.status_message || 'Status transaksi tidak ditemukan',
      }
    }

    return {
      success: true,
      transactionStatus: data.transaction_status,
      fraudStatus: data.fraud_status,
      grossAmount: data.gross_amount,
      paymentType: data.payment_type,
      settlementTime: data.settlement_time,
      raw: data,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal menghubungi server status Midtrans'
    return {
      success: false,
      error: msg,
    }
  }
}

export function mapMidtransStatus(transactionStatus?: string, fraudStatus?: string): 'paid' | 'pending' | 'expired' | 'cancelled' {
  if (!transactionStatus) return 'pending'
  if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus !== 'challenge')) {
    return 'paid'
  }
  if (transactionStatus === 'expire') return 'expired'
  if (['cancel', 'deny', 'failure'].includes(transactionStatus)) return 'cancelled'
  return 'pending'
}

export function verifyMidtransSignature(n: {
  order_id: string
  status_code: string
  gross_amount: string
  signature_key: string
}): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || ''
  const expected = createHash('sha512')
    .update(n.order_id + n.status_code + n.gross_amount + serverKey)
    .digest('hex')
  const a = Buffer.from(expected)
  const b = Buffer.from(n.signature_key ?? '')
  return a.length === b.length && timingSafeEqual(a, b)
}
