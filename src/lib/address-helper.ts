/**
 * src/lib/address-helper.ts
 * Utility functions for address formatting and parsing.
 * Note: Do NOT add 'use server' to this file. It is a shared utility module
 * safe to import from Server Actions, Server Components, and Client Components.
 */

export interface ExtractedAddressDetails {
  cleanAddressLine: string
  district?: string
  village?: string
}

/**
 * Format string alamat lengkap dengan kelurahan dan kecamatan secara bersih
 */
export function formatAddressLine(
  streetAddress?: string | null,
  village?: string | null,
  district?: string | null
): string {
  // Bersihkan token Kel. dan Kec. yang mungkin sudah ada agar tidak terjadi duplikasi saat diedit berulang kali
  const base = (streetAddress || '')
    .replace(/(?:^|[,\s(]+)(?:\bKel\.|\bKelurahan\b|\bDesa\b)\s*[^,;()]+(?=\s*(?:\bKec\.|\bKecamatan\b|$|[,;)]))/gi, '')
    .replace(/(?:^|[,\s(]+)(?:\bKec\.|\bKecamatan\b)\s*[^,;()]+(?=\s*(?:\bKel\.|\bKelurahan\b|\bDesa\b|$|[,;)]))/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/^[,\s()]+|[,\s()]+$/g, '')
    .replace(/,\s*,+/g, ', ')
    .trim()

  const parts: string[] = []
  const cleanVil = (village || '').replace(/^(?:\bKel\.|\bKelurahan\b|\bDesa\b)\s*/i, '').trim()
  if (cleanVil) {
    parts.push(`Kel. ${cleanVil}`)
  }

  const cleanDist = (district || '').replace(/^(?:\bKec\.|\bKecamatan\b)\s*/i, '').trim()
  if (cleanDist) {
    parts.push(`Kec. ${cleanDist}`)
  }

  if (base && parts.length > 0) {
    return `${base}, ${parts.join(', ')}`
  }
  if (!base && parts.length > 0) {
    return parts.join(', ')
  }
  return base
}

/**
 * Ekstrak alamat jalan, kelurahan, dan kecamatan dari address_line
 */
export function extractAddressLineDetails(rawAddressLine?: string | null): ExtractedAddressDetails {
  const line = (rawAddressLine || '').trim()
  let district: string | undefined
  let village: string | undefined

  const kelMatch = line.match(/(?:^|[,\s(]+)(?:\bKel\.|\bKelurahan\b|\bDesa\b)\s*([^,;()]+?)(?=\s*(?:\bKec\.|\bKecamatan\b|$|[,;)]))/i)
  if (kelMatch && kelMatch[1]?.trim()) {
    village = kelMatch[1].trim()
  }

  const kecMatch = line.match(/(?:^|[,\s(]+)(?:\bKec\.|\bKecamatan\b)\s*([^,;()]+?)(?=\s*(?:\bKel\.|\bKelurahan\b|\bDesa\b|$|[,;)]))/i)
  if (kecMatch && kecMatch[1]?.trim()) {
    district = kecMatch[1].trim()
  }

  const cleanAddressLine = line
    .replace(/(?:^|[,\s(]+)(?:\bKel\.|\bKelurahan\b|\bDesa\b)\s*[^,;()]+(?=\s*(?:\bKec\.|\bKecamatan\b|$|[,;)]))/gi, '')
    .replace(/(?:^|[,\s(]+)(?:\bKec\.|\bKecamatan\b)\s*[^,;()]+(?=\s*(?:\bKel\.|\bKelurahan\b|\bDesa\b|$|[,;)]))/gi, '')
    .replace(/\(\s*\)/g, '')
    .replace(/^[,\s()]+|[,\s()]+$/g, '')
    .replace(/,\s*,+/g, ', ')
    .trim()

  return { cleanAddressLine, district, village }
}
