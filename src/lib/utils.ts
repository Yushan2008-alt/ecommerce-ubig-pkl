export { cn } from "cn"

/**
 * Membersihkan karakter non-angka dari input (hanya mengizinkan digit 0-9).
 * - Menangani input number (dibulatkan ke integer terdekat agar desimal tidak merusak digit).
 * - Menghapus prefix mata uang seperti "Rp", "Rp.", "rp ".
 * - Menghapus bagian sen desimal koma Indonesia (misal: ",00" atau ",50").
 * - Menghapus bagian desimal float database / string (misal: ".00" atau ".50").
 * - Menghapus leading zeros berlebih (contoh: "050" -> "50"),
 *   namun tetap mempertahankan "0" tunggal jika nilainya adalah 0.
 *
 * @param val Nilai string atau number yang akan dibersihkan
 * @returns String yang hanya berisi digit angka
 */
export function cleanNumberString(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return ''

  if (typeof val === 'number') {
    if (isNaN(val) || !isFinite(val)) return ''
    val = Math.round(val)
  }

  let str = String(val).trim()
  if (!str) return ''

  // Hapus prefix mata uang Rupiah
  str = str.replace(/^Rp\.?\s*/i, '')

  // Hapus sen desimal Indonesia dengan tanda koma (contoh: ,00 atau ,50)
  str = str.replace(/,\d*$/, '')

  // Hapus bagian desimal format float database jika 4+ digit sebelum titik (contoh: 50000.00)
  if (/^\d{4,}\.\d{1,2}$/.test(str)) {
    str = String(Math.round(parseFloat(str)))
  }

  // Hapus semua karakter selain digit angka
  str = str.replace(/\D/g, '')
  if (!str) return ''

  // Hapus leading zero berlebih tapi pertahankan '0' tunggal
  return str.replace(/^0+(?!$)/, '')
}

/**
 * Memformat string angka atau number menjadi format ribuan dengan pemisah titik (Indonesian number format).
 * Contoh: "50000" -> "50.000", 1500000 -> "1.500.000", "0" -> "0"
 *
 * @param val Nilai string atau number yang akan diformat
 * @returns String angka dengan tanda titik pemisah ribuan
 */
export function formatNumberWithDots(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === '') return ''
  const clean = cleanNumberString(val)
  if (!clean) return ''
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

/**
 * Mengembalikan nilai angka (number) murni dari string berformat titik atau angka.
 * Digunakan untuk parsing nilai input form sebelum dikirimkan ke server action / database.
 * Contoh: "50.000" -> 50000, "1.500.000" -> 1500000, "" -> 0
 *
 * @param val Nilai string atau number yang akan dikonversi ke number
 * @returns Nilai number aman (mengembalikan 0 jika string kosong / invalid)
 */
export function unformatNumber(val: string | number | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0
  const clean = cleanNumberString(val)
  if (!clean) return 0
  const num = Number(clean)
  return isNaN(num) ? 0 : num
}

/**
 * Memformat tanggal menjadi format waktu relatif (time ago) Bahasa Indonesia.
 * Contoh: "Baru saja", "2 menit yang lalu", "1 jam yang lalu", "Kemarin", "3 hari yang lalu".
 *
 * @param dateInput Tanggal dalam bentuk string ISO, timestamp number, atau objek Date
 * @returns String waktu relatif dalam bahasa Indonesia
 */
export function formatTimeAgo(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return '-'

  const date = typeof dateInput === 'object' && dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (isNaN(date.getTime())) return '-'

  const now = Date.now()
  const diffInSeconds = Math.floor((now - date.getTime()) / 1000)

  // Toleransi jika tanggal berada di masa depan atau kurang dari 60 detik yang lalu
  if (diffInSeconds < 60) {
    return 'Baru saja'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} menit yang lalu`
  }

  const diffInHours = Math.floor(diffInSeconds / 3600)
  if (diffInHours < 24) {
    return `${diffInHours} jam lalu`
  }

  const diffInDays = Math.floor(diffInSeconds / 86400)
  if (diffInDays < 7) {
    return `${diffInDays} hari lalu`
  }

  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInDays < 30) {
    return `${diffInWeeks} minggu lalu`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInDays < 365) {
    return `${Math.max(1, diffInMonths)} bulan lalu`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${Math.max(1, diffInYears)} tahun lalu`
}

