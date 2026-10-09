import { NextRequest, NextResponse } from 'next/server'
import { verifyMidtransSignature, mapMidtransStatus } from '@/lib/midtrans'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Verifikasi Signature Midtrans jika ada signature_key
    if (body.signature_key && !verifyMidtransSignature(body)) {
      console.warn('[Midtrans Webhook] Invalid Signature:', body.order_id)
      return NextResponse.json({ message: 'Invalid signature' }, { status: 403 })
    }

    const orderCode = body.order_id
    if (!orderCode) {
      return NextResponse.json({ message: 'Missing order_id' }, { status: 400 })
    }

    const mappedStatus = mapMidtransStatus(body.transaction_status, body.fraud_status)
    const adminClient = createAdminClient()

    // Cari order
    const { data: order } = await adminClient
      .from('orders')
      .select('id, code, status')
      .eq('code', orderCode)
      .maybeSingle()

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    if (mappedStatus === 'paid') {
      await adminClient
        .from('orders')
        .update({
          status: 'paid',
          paid_at: body.settlement_time || new Date().toISOString(),
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
    } else if (mappedStatus === 'cancelled') {
      await adminClient
        .from('orders')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id)
    }

    // Catat ke tabel payments
    try {
      await adminClient.from('payments').insert({
        order_id: order.id,
        payment_type: body.payment_type || 'midtrans',
        midtrans_status: body.transaction_status,
        gross_amount: Math.round(Number(body.gross_amount || 0)),
        raw: body,
        signature_valid: true,
      })
    } catch (e) {
      console.warn('[Midtrans Webhook] Logging payment row warning:', e)
    }

    return NextResponse.json({ message: 'OK' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error'
    console.error('[Midtrans Webhook Error]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
