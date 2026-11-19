const assert = require('assert')

// 1. Functions under test (extracted exactly from src/components/vendor/vendor-onboarding-wizard.tsx)
function cleanPhoneDigits(value, country = '+62') {
  let digits = value.replace(/\D/g, '')

  if (country === '+62') {
    while (digits.startsWith('62') || digits.startsWith('0')) {
      if (digits.startsWith('62')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }
    }
  } else if (country === '+60') {
    while (digits.startsWith('60') || digits.startsWith('0')) {
      if (digits.startsWith('60')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }
    }
  } else if (country === '+65') {
    while (digits.startsWith('65') || digits.startsWith('0')) {
      if (digits.startsWith('65')) {
        digits = digits.slice(2)
      } else if (digits.startsWith('0')) {
        digits = digits.slice(1)
      }
    }
  }

  return digits
}

function formatPhoneNumber(value, country = '+62') {
  let digits = cleanPhoneDigits(value, country)
  const maxDigits = country === '+62' ? 13 : 12
  digits = digits.slice(0, maxDigits)

  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}-${digits.slice(11)}`
}

function formatPhoneDisplay(rawPhone, defaultCountry = '+62') {
  if (!rawPhone || !rawPhone.trim()) return '-'

  let country = defaultCountry
  const trimmed = rawPhone.trim()

  if (trimmed.startsWith('+60') || trimmed.startsWith('60')) {
    country = '+60'
  } else if (trimmed.startsWith('+65') || trimmed.startsWith('65')) {
    country = '+65'
  } else if (trimmed.startsWith('+62') || trimmed.startsWith('62') || trimmed.startsWith('0')) {
    country = '+62'
  }

  const formatted = formatPhoneNumber(trimmed, country)
  return formatted ? `${country} ${formatted}` : '-'
}

function validatePhoneInput(phone, countryCode) {
  const phoneDigits = cleanPhoneDigits(phone, countryCode)
  if (!phoneDigits) {
    return { valid: false, error: 'Nomor telepon toko wajib diisi.' }
  }
  if (countryCode === '+62') {
    if (!phoneDigits.startsWith('8')) {
      return {
        valid: false,
        error: 'Nomor telepon Indonesia harus diawali angka 8 setelah kode negara +62 (contoh: 812-3456-7890).',
      }
    }
    if (phoneDigits.length < 9 || phoneDigits.length > 13) {
      return {
        valid: false,
        error: 'Nomor telepon tidak valid (minimal 9 digit dan maksimal 13 digit setelah +62).',
      }
    }
  } else {
    if (phoneDigits.length < 7 || phoneDigits.length > 12) {
      return {
        valid: false,
        error: 'Nomor telepon tidak valid (7-12 digit).',
      }
    }
  }
  return { valid: true }
}

function normalizePhonePayload(phone, countryCode) {
  const rawDigits = cleanPhoneDigits(phone, countryCode)
  if (countryCode === '+62') {
    return `0${rawDigits}`
  }
  return `${countryCode}${rawDigits}`
}

function serverCleanPhone(phone) {
  let cleanPhone = phone.trim()
  if (cleanPhone.startsWith('+62')) {
    cleanPhone = '0' + cleanPhone.slice(3).replace(/\D/g, '')
  } else if (cleanPhone.startsWith('62')) {
    cleanPhone = '0' + cleanPhone.slice(2).replace(/\D/g, '')
  } else if (cleanPhone.startsWith('0')) {
    cleanPhone = '0' + cleanPhone.slice(1).replace(/\D/g, '')
  } else if (cleanPhone.startsWith('+')) {
    cleanPhone = '+' + cleanPhone.slice(1).replace(/\D/g, '')
  } else {
    cleanPhone = cleanPhone.replace(/\D/g, '')
  }
  return cleanPhone
}

const VendorPhoneRegex = /^(?:(?:08|\+?628)\d{8,13}|(?:\+?60|\+?65)\d{7,12})$/

console.log('=== RUNNING COMPREHENSIVE PHONE VERIFICATION TESTS ===\n')

// Suite 1: cleanPhoneDigits & formatPhoneNumber
console.log('Suite 1: cleanPhoneDigits & formatPhoneNumber')
assert.strictEqual(cleanPhoneDigits('081234567890', '+62'), '81234567890')
assert.strictEqual(cleanPhoneDigits('+62 812-3456-7890', '+62'), '81234567890')
assert.strictEqual(cleanPhoneDigits('+62 (812) 3456 - 7890', '+62'), '81234567890')
assert.strictEqual(cleanPhoneDigits('6281234567890', '+62'), '81234567890')
assert.strictEqual(cleanPhoneDigits('0081234567890', '+62'), '81234567890')
assert.strictEqual(cleanPhoneDigits('+62081234567890', '+62'), '81234567890')
assert.strictEqual(cleanPhoneDigits('+626281234567890', '+62'), '81234567890')
assert.strictEqual(cleanPhoneDigits('+62', '+62'), '')
assert.strictEqual(cleanPhoneDigits('62', '+62'), '')
assert.strictEqual(cleanPhoneDigits('0', '+62'), '')
assert.strictEqual(cleanPhoneDigits('81234567890', '+62'), '81234567890')

assert.strictEqual(formatPhoneNumber('081234567890', '+62'), '812-3456-7890')
assert.strictEqual(formatPhoneNumber('+62 812-3456-7890', '+62'), '812-3456-7890')
assert.strictEqual(formatPhoneNumber('811234567', '+62'), '811-2345-67')
assert.strictEqual(formatPhoneNumber('8123456789', '+62'), '812-3456-789')
assert.strictEqual(formatPhoneNumber('812345678901', '+62'), '812-3456-7890-1')
assert.strictEqual(formatPhoneNumber('8123456789012', '+62'), '812-3456-7890-12')
// Truncation at 13 digits
assert.strictEqual(formatPhoneNumber('8123456789012999', '+62'), '812-3456-7890-12')
assert.strictEqual(formatPhoneNumber('', '+62'), '')
console.log('  ✓ Suite 1 passed!')

// Suite 2: Progressive typing keystrokes
console.log('\nSuite 2: Progressive typing keystrokes simulation')
const keystrokes = ['0', '8', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
let typed = ''
const progressiveResults = []
for (const k of keystrokes) {
  typed += k
  progressiveResults.push(formatPhoneNumber(typed, '+62'))
}
assert.strictEqual(progressiveResults[0], '') // '0' stripped
assert.strictEqual(progressiveResults[1], '8')
assert.strictEqual(progressiveResults[2], '81')
assert.strictEqual(progressiveResults[3], '812')
assert.strictEqual(progressiveResults[4], '812-3')
assert.strictEqual(progressiveResults[5], '812-34')
assert.strictEqual(progressiveResults[6], '812-345')
assert.strictEqual(progressiveResults[7], '812-3456')
assert.strictEqual(progressiveResults[8], '812-3456-7')
assert.strictEqual(progressiveResults[9], '812-3456-78')
assert.strictEqual(progressiveResults[10], '812-3456-789')
assert.strictEqual(progressiveResults[11], '812-3456-7890')
console.log('  ✓ Suite 2 passed!')

// Suite 3: Step 5 display formatting
console.log('\nSuite 3: Step 5 display formatting (formatPhoneDisplay)')
assert.strictEqual(formatPhoneDisplay('081234567890'), '+62 812-3456-7890')
assert.strictEqual(formatPhoneDisplay('+6281234567890'), '+62 812-3456-7890')
assert.strictEqual(formatPhoneDisplay('6281234567890'), '+62 812-3456-7890')
assert.strictEqual(formatPhoneDisplay('+62 812-3456-7890'), '+62 812-3456-7890')
assert.strictEqual(formatPhoneDisplay('812-3456-7890'), '+62 812-3456-7890')
assert.strictEqual(formatPhoneDisplay('+60123456789'), '+60 123-4567-89')
assert.strictEqual(formatPhoneDisplay('+6581234567'), '+65 812-3456-7')
assert.strictEqual(formatPhoneDisplay(null), '-')
assert.strictEqual(formatPhoneDisplay(''), '-')
console.log('  ✓ Suite 3 passed!')

// Suite 4: Step 2 Validation (validatePhoneInput)
console.log('\nSuite 4: Step 2 Validation')
assert.strictEqual(validatePhoneInput('', '+62').valid, false)
assert.strictEqual(validatePhoneInput('211234567', '+62').valid, false) // doesn't start with 8
assert.strictEqual(validatePhoneInput('81234567', '+62').valid, false) // 8 digits (too short)
assert.strictEqual(validatePhoneInput('811234567', '+62').valid, true) // 9 digits (valid min)
assert.strictEqual(validatePhoneInput('8123456789', '+62').valid, true) // 10 digits
assert.strictEqual(validatePhoneInput('81234567890', '+62').valid, true) // 11 digits
assert.strictEqual(validatePhoneInput('812345678901', '+62').valid, true) // 12 digits
assert.strictEqual(validatePhoneInput('8123456789012', '+62').valid, true) // 13 digits (valid max)
assert.strictEqual(validatePhoneInput('123456', '+60').valid, false) // < 7
assert.strictEqual(validatePhoneInput('12345678', '+60').valid, true)
console.log('  ✓ Suite 4 passed!')

// Suite 5: Payload Normalization & Schema Verification
console.log('\nSuite 5: Payload Normalization & Schema Verification')
const payload1 = normalizePhonePayload('812-3456-7890', '+62')
assert.strictEqual(payload1, '081234567890')
assert.strictEqual(VendorPhoneRegex.test(payload1), true)

const payload2 = normalizePhonePayload('811-2345-67', '+62')
assert.strictEqual(payload2, '0811234567')
assert.strictEqual(VendorPhoneRegex.test(payload2), true)

const payload3 = normalizePhonePayload('812-3456-7890-12', '+62')
assert.strictEqual(payload3, '08123456789012')
assert.strictEqual(VendorPhoneRegex.test(payload3), true)

const payload4 = normalizePhonePayload('123-4567-89', '+60')
assert.strictEqual(payload4, '+60123456789')
assert.strictEqual(VendorPhoneRegex.test(payload4), true)

// Server sanitization
assert.strictEqual(serverCleanPhone(payload1), '081234567890')
assert.strictEqual(serverCleanPhone('+6281234567890'), '081234567890')
assert.strictEqual(serverCleanPhone('6281234567890'), '081234567890')
assert.strictEqual(serverCleanPhone(payload4), '+60123456789')
console.log('  ✓ Suite 5 passed!')

console.log('\n======================================================')
console.log('🎉 ALL COMPREHENSIVE PHONE VERIFICATION TESTS PASSED!')
console.log('======================================================')
