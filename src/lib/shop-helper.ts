import type { ShopMetadata } from '@/types/database'

export function parseShopMetadata(description: string | null | undefined): ShopMetadata {
  if (!description) return {}
  try {
    if (description.trim().startsWith('{') && description.trim().endsWith('}')) {
      const parsed = JSON.parse(description)
      return typeof parsed === 'object' && parsed !== null ? parsed : { bio: description }
    }
  } catch {
    // Fallback jika description adalah plain text
  }
  return { bio: description }
}

export function serializeShopMetadata(meta: ShopMetadata): string {
  return JSON.stringify(meta)
}

export const POPULAR_COURIERS = [
  {
    id: 'jnt',
    name: 'J&T Express',
    desc: 'Pengiriman reguler & express terluas ke seluruh pelosok Indonesia',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900',
  },
  {
    id: 'spx',
    name: 'SPX Express',
    desc: 'Layanan armada kilat hemat & terpercaya dengan tracking presisi',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900',
  },
  {
    id: 'jne',
    name: 'JNE Express',
    desc: 'Pilihan pengiriman Reguler, YES (Yakin Esok Sampai), dan OKE',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900',
  },
  {
    id: 'sicepat',
    name: 'SiCepat Ekspres',
    desc: 'Layanan pick-up cepat dengan pengiriman barang sampai kilat',
    badgeColor: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900',
  },
  {
    id: 'anteraja',
    name: 'Anteraja',
    desc: 'Pengiriman modern terintegrasi dengan pelacakan akurat',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900',
  },
]

export const POPULAR_BANKS = [
  'BCA (Bank Central Asia)',
  'Bank Mandiri',
  'BRI (Bank Rakyat Indonesia)',
  'BNI (Bank Negara Indonesia)',
  'BSI (Bank Syariah Indonesia)',
  'CIMB Niaga',
  'Bank Permata',
  'Bank Danamon',
  'Bank Jago',
  'SeaBank',
]
