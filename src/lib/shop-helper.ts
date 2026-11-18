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
    desc: 'Pengiriman reguler & express terluas ke seluruh Indonesia',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900',
  },
  {
    id: 'spx',
    name: 'SPX Express',
    desc: 'Layanan armada kilat hemat & terpercaya',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900',
  },
  {
    id: 'jne',
    name: 'JNE Express',
    desc: 'Pilihan pengiriman Reguler',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900',
  },
  {
    id: 'sicepat',
    name: 'SiCepat Ekspres',
    desc: 'Layanan pick-up cepat',
    badgeColor: 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900',
  },
  {
    id: 'anteraja',
    name: 'Anteraja',
    desc: 'Pengiriman modern terintegrasi',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900',
  },
]

export const POPULAR_BANKS = [
  'BCA',
  'Bank Mandiri',
  'BRI',
  'BNI',
  'BSI',
  'CIMB Niaga',
  'Bank Permata',
  'Bank Danamon',
  'Bank Jago',
  'SeaBank',
]

export interface BankOption {
  value: string
  label: string
}

export const INDONESIA_BANKS: BankOption[] = [
  // 1. Bank BUMN & Swasta Terbesar
  { value: 'BCA', label: 'BCA' },
  { value: 'Mandiri', label: 'Bank Mandiri' },
  { value: 'BRI', label: 'BRI' },
  { value: 'BNI', label: 'BNI' },
  { value: 'BSI', label: 'BSI' },
  { value: 'CIMB Niaga', label: 'CIMB Niaga' },
  { value: 'Permata', label: 'Bank Permata' },
  { value: 'Danamon', label: 'Bank Danamon' },
  { value: 'BTN', label: 'Bank Tabungan Negara (BTN)' },
  { value: 'OCBC NISP', label: 'Bank OCBC NISP' },
  { value: 'Panin', label: 'Bank Panin' },
  { value: 'Mega', label: 'Bank Mega' },
  { value: 'Maybank', label: 'Bank Maybank Indonesia' },
  { value: 'Sinarmas', label: 'Bank Sinarmas' },
  { value: 'BTPN', label: 'Bank BTPN / Jenius' },

  // 2. Bank Digital & Neobank Populer
  { value: 'Bank Jago', label: 'Bank Jago' },
  { value: 'SeaBank', label: 'SeaBank' },
  { value: 'Allo Bank', label: 'Allo Bank' },
  { value: 'Neo Commerce', label: 'Bank Neo Commerce (BNC)' },
  { value: 'Blu', label: 'Blu by BCA Digital' },
  { value: 'Line Bank', label: 'Line Bank (KEB Hana)' },
  { value: 'Digibank', label: 'Digibank by DBS' },
  { value: 'Superbank', label: 'Superbank' },
  { value: 'Aladin', label: 'Bank Aladin Syariah' },

  // 3. Bank Swasta & Syariah Lainnya
  { value: 'Muamalat', label: 'Bank Muamalat Indonesia' },
  { value: 'BCA Syariah', label: 'Bank BCA Syariah' },
  { value: 'Mega Syariah', label: 'Bank Mega Syariah' },
  { value: 'Bukopin', label: 'KB Bukopin' },
  { value: 'UOB', label: 'Bank UOB Indonesia' },
  { value: 'Commonwealth', label: 'Bank Commonwealth' },
  { value: 'MNC Bank', label: 'Bank MNC Internasional' },
  { value: 'Artha Graha', label: 'Bank Artha Graha Internasional' },
  { value: 'Victoria', label: 'Bank Victoria International' },
  { value: 'Ina Perdana', label: 'Bank Ina Perdana' },
  { value: 'Mestika', label: 'Bank Mestika Dharma' },
  { value: 'Shinhan', label: 'Bank Shinhan Indonesia' },
  { value: 'QNB', label: 'Bank QNB Indonesia' },
  { value: 'Woori Saudara', label: 'Bank Woori Saudara' },
]

export function findBankOption(valueOrName?: string | null): BankOption | undefined {
  if (!valueOrName) return undefined
  const trimmed = valueOrName.trim().toLowerCase()
  if (!trimmed) return undefined

  // 1. Exact match on value or label (case-insensitive)
  const exact = INDONESIA_BANKS.find(
    (b) => b.value.toLowerCase() === trimmed || b.label.toLowerCase() === trimmed
  )
  if (exact) return exact

  // 2. Normalized match (strip non-alphanumeric, e.g. "bca bank central asia" vs "bca (bank central asia)")
  const clean = trimmed.replace(/[^a-z0-9]/g, '')
  const exactClean = INDONESIA_BANKS.find(
    (b) =>
      b.value.toLowerCase().replace(/[^a-z0-9]/g, '') === clean ||
      b.label.toLowerCase().replace(/[^a-z0-9]/g, '') === clean
  )
  if (exactClean) return exactClean

  // 3. Substring / partial match, prioritized by longest match first
  // to avoid short codes like "BCA" erroneously matching "BCA Syariah"
  const candidates = INDONESIA_BANKS.filter((b) => {
    const valLower = b.value.toLowerCase()
    const labelLower = b.label.toLowerCase()
    return (
      labelLower.includes(trimmed) ||
      valLower.includes(trimmed) ||
      trimmed.includes(valLower) ||
      trimmed.includes(labelLower)
    )
  })

  if (candidates.length > 0) {
    candidates.sort((a, b) => {
      const aValInTrimmed = trimmed.includes(a.value.toLowerCase()) ? a.value.length : 0
      const bValInTrimmed = trimmed.includes(b.value.toLowerCase()) ? b.value.length : 0
      const aLabelInTrimmed = trimmed.includes(a.label.toLowerCase()) ? a.label.length : 0
      const bLabelInTrimmed = trimmed.includes(b.label.toLowerCase()) ? b.label.length : 0
      const aTrimmedInLabel = a.label.toLowerCase().includes(trimmed) ? trimmed.length : 0
      const bTrimmedInLabel = b.label.toLowerCase().includes(trimmed) ? trimmed.length : 0
      const scoreA = Math.max(aValInTrimmed, aLabelInTrimmed, aTrimmedInLabel)
      const scoreB = Math.max(bValInTrimmed, bLabelInTrimmed, bTrimmedInLabel)
      return scoreB - scoreA
    })
    return candidates[0]
  }

  return undefined
}

export function getBankLabel(valueOrName?: string | null): string {
  if (!valueOrName || !valueOrName.trim()) return ''
  const option = findBankOption(valueOrName)
  return option ? option.label : valueOrName.trim()
}

export function resolveBankValue(name?: string | null): string {
  if (!name || !name.trim()) return ''
  const option = findBankOption(name)
  return option ? option.value : name.trim()
}

