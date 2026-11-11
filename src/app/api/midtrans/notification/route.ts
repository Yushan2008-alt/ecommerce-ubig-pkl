import { NextRequest, NextResponse } from 'next/server'
import { verifyMidtransSignature, mapMidtransStatus } from '@/lib/midtrans'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. Verifikasi Signature Midtrans
    if (body.signature_key) {
      if (!verifyMidtransSignature(body)) {
        console.warn('[Midtrans Webhook] Invalid Signature:', body.order_id)
        return NextResponse.json({ message: 'Invalid signature' }, { status: 403 })
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn('[Midtrans Webhook] Missing signature in production:', body.order_id)
      return NextResponse.json({ message: 'Missing signature_key' }, { status: 403 })
    }

    const orderCode = body.order_id
    if (!orderCode) {
      return NextResponse.json({ message: 'Missing order_id' }, { status: 400 })
    }

    const mappedStatus = mapMidtransStatus(body.transaction_status, body.fraud_status)
    const adminClient = createAdminClient()

    // 2. Eksekusi RPC atomik apply_payment_status di Postgres
    const { error: rpcError } = await adminClient.rpc('apply_payment_status', {
      p_code: orderCode,
      p_status: mappedStatus,
      p_gross: Math.round(Number(body.gross_amount || 0)),
      p_type: body.payment_type || 'midtrans',
      p_raw: body,
    })

    if (rpcError) {
      console.error('[Midtrans Webhook RPC Error]', rpcError.message)
      if (rpcError.message.includes('tidak ditemukan')) {
        return NextResponse.json({ message: rpcError.message }, { status: 404 })
      }
      return NextResponse.json({ message: rpcError.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'OK', status: mappedStatus })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook error'
    console.error('[Midtrans Webhook Error]', msg)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
