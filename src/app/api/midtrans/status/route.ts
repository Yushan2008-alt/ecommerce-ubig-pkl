import { NextRequest, NextResponse } from 'next/server'
import { getMidtransTransactionStatus, mapMidtransStatus } from '@/lib/midtrans'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const orderCode = searchParams.get('order_code') || searchParams.get('order_id')

    if (!orderCode) {
      return NextResponse.json({ success: false, error: 'order_code is required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // 1. Ambil order dari database
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, code, status, total, paid_at')
      .eq('code', orderCode)
      .maybeSingle()

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Pesanan tidak ditemukan di database' }, { status: 404 })
    }

    // Jika sudah lunas di database, langsung kembalikan isPaid = true
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        isPaid: true,
        orderId: order.id,
        orderCode: order.code,
        status: 'paid',
        paidAt: order.paid_at,
      })
    }

    // 2. Cek status ke Midtrans API
    const midtransRes = await getMidtransTransactionStatus(orderCode)

    if (!midtransRes.success) {
      return NextResponse.json({
        success: true,
        isPaid: false,
        status: order.status,
        midtransStatus: 'not_found_or_pending',
      })
    }

    const mapped = mapMidtransStatus(midtransRes.transactionStatus, midtransRes.fraudStatus)

    // 3. Jika status settlement / capture, sinkronkan ke database menjadi 'paid'
    if (mapped === 'paid') {
      const paidAtTime = midtransRes.settlementTime || new Date().toISOString()

      await adminClient
        .from('orders')
        .update({
          status: 'paid',
          paid_at: paidAtTime,
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

      return NextResponse.json({
        success: true,
        isPaid: true,
        orderId: order.id,
        orderCode: order.code,
        status: 'paid',
        paidAt: paidAtTime,
        transactionStatus: midtransRes.transactionStatus,
      })
    }

    return NextResponse.json({
      success: true,
      isPaid: false,
      status: order.status,
      midtransStatus: midtransRes.transactionStatus,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error checking midtrans status'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
