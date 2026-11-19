import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getBuyerOrdersAction } from '@/actions/order'
import { BuyerOrdersClient } from '@/components/orders/buyer-orders-client'

export const metadata: Metadata = {
  title: 'Pesanan Saya | Krafita',
  description: 'Lihat dan lacak seluruh status pesanan belanja Anda di Krafita secara real-time.',
}

export default async function BuyerOrdersPage() {
  const { user } = await getUser()

  if (!user) {
    redirect('/login?redirect=/orders')
  }

  const res = await getBuyerOrdersAction()
  const orders = res.orders || []

  return <BuyerOrdersClient initialOrders={orders} />
}
