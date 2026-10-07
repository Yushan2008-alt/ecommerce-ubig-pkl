import { Metadata } from 'next'
import { requireUser } from '@/lib/auth'
import { getProfileAction } from '@/actions/account'
import { getAddressesAction } from '@/actions/address'
import { AccountView } from '@/components/account/account-view'

export const metadata: Metadata = {
  title: 'Akun Saya — Krafita',
  description: 'Kelola profil akun dan buku alamat pengiriman Anda di Krafita.',
}

export default async function AccountPage() {
  await requireUser('/account')

  const [profileRes, addressesRes] = await Promise.all([
    getProfileAction(),
    getAddressesAction(),
  ])

  const profile = profileRes.data || {
    id: '',
    email: '',
    role: 'member',
    displayName: null,
    phone: null,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const addresses = addressesRes.data || []

  return <AccountView profile={profile} addresses={addresses} />
}
