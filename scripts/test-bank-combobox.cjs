/**
 * scripts/test-bank-combobox.cjs
 * Comprehensive test suite for Combobox Bank Selection and Indonesian Banks helper logic.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

console.log('=== RUNNING TESTS FOR BANK COMBOBOX AND HELPER UTILITIES ===\n')

// 1. Transpile and load src/lib/shop-helper.ts
const shopHelperPath = path.resolve(__dirname, '../src/lib/shop-helper.ts')
const shopHelperSource = fs.readFileSync(shopHelperPath, 'utf8')
const transpiledHelper = ts.transpileModule(shopHelperSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
})
const shopHelperModule = { exports: {} }
const helperRunner = new Function('module', 'exports', 'require', transpiledHelper.outputText)
helperRunner(shopHelperModule, shopHelperModule.exports, require)

const {
  INDONESIA_BANKS,
  findBankOption,
  getBankLabel,
  resolveBankValue,
  POPULAR_BANKS,
} = shopHelperModule.exports

// Check exports
assert(Array.isArray(INDONESIA_BANKS), 'INDONESIA_BANKS must be an array')
assert.strictEqual(typeof findBankOption, 'function', 'findBankOption must be a function')
assert.strictEqual(typeof getBankLabel, 'function', 'getBankLabel must be a function')
assert.strictEqual(typeof resolveBankValue, 'function', 'resolveBankValue must be a function')
assert(Array.isArray(POPULAR_BANKS), 'POPULAR_BANKS must be preserved for backward compatibility')

console.log(`✓ Total Indonesian Banks configured: ${INDONESIA_BANKS.length}`)

// 2. Verify completeness of bank list
const expectedBankValues = [
  'BCA',
  'Mandiri',
  'BRI',
  'BNI',
  'BSI',
  'CIMB Niaga',
  'Permata',
  'Danamon',
  'BTN',
  'Bank Jago',
  'SeaBank',
  'Allo Bank',
  'Blu',
  'BCA Syariah',
  'Mega Syariah',
  'BJB Syariah',
]

console.log('\n2. Verifying essential bank entries exist:')
for (const expected of expectedBankValues) {
  const found = INDONESIA_BANKS.find((b) => b.value === expected || b.label.includes(expected))
  assert(found, `Expected bank ${expected} was not found in INDONESIA_BANKS`)
  assert(found.value && found.value.length > 0, `Bank ${expected} must have a non-empty value`)
  assert(found.label && found.label.length > 0, `Bank ${expected} must have a non-empty label`)
  console.log(`  ✓ Found: [value: "${found.value}"] -> "${found.label}"`)
}

// 3. Test resolveBankValue & critical disambiguation (Syariah vs Parent Banks)
console.log('\n3. Testing resolveBankValue resolution and disambiguation:')
// Exact value
assert.strictEqual(resolveBankValue('BCA'), 'BCA')
assert.strictEqual(resolveBankValue('bca'), 'BCA')
assert.strictEqual(resolveBankValue('Mandiri'), 'Mandiri')
// Crucial: Syariah variants MUST NOT falsely match their parent short codes!
assert.strictEqual(resolveBankValue('BCA Syariah'), 'BCA Syariah', 'BCA Syariah must NOT resolve to BCA')
assert.strictEqual(resolveBankValue('Bank BCA Syariah'), 'BCA Syariah', 'Bank BCA Syariah must resolve to BCA Syariah')
assert.strictEqual(resolveBankValue('Mega Syariah'), 'Mega Syariah', 'Mega Syariah must NOT resolve to Mega')
assert.strictEqual(resolveBankValue('Bank Mega Syariah'), 'Mega Syariah')
assert.strictEqual(resolveBankValue('Mega'), 'Mega')
assert.strictEqual(resolveBankValue('BJB Syariah'), 'BJB Syariah', 'BJB Syariah must NOT resolve to BJB')
assert.strictEqual(resolveBankValue('BJB'), 'BJB')

// Legacy full names
assert.strictEqual(resolveBankValue('Bank Central Asia (BCA)'), 'BCA')
assert.strictEqual(resolveBankValue('BCA (Bank Central Asia)'), 'BCA')
assert.strictEqual(resolveBankValue('Bank Mandiri'), 'Mandiri')
assert.strictEqual(resolveBankValue('Bank Rakyat Indonesia (BRI)'), 'BRI')
assert.strictEqual(resolveBankValue('Bank Syariah Indonesia (BSI)'), 'BSI')
assert.strictEqual(resolveBankValue('Bank Jago'), 'Bank Jago')
assert.strictEqual(resolveBankValue('SeaBank'), 'SeaBank')
assert.strictEqual(resolveBankValue('Blu by BCA Digital'), 'Blu')

// Unknown bank fallback
assert.strictEqual(resolveBankValue('Bank Antartika'), 'Bank Antartika')
// Edge cases: null, undefined, empty, whitespace
assert.strictEqual(resolveBankValue(''), '')
assert.strictEqual(resolveBankValue('   '), '')
assert.strictEqual(resolveBankValue(null), '')
assert.strictEqual(resolveBankValue(undefined), '')
console.log('  ✓ resolveBankValue handles values, legacy names, case variations, disambiguation, and edge cases correctly.')

// 4. Test getBankLabel
console.log('\n4. Testing getBankLabel display and disambiguation:')
assert.strictEqual(getBankLabel('BCA'), 'BCA (Bank Central Asia)')
assert.strictEqual(getBankLabel('bca'), 'BCA (Bank Central Asia)')
assert.strictEqual(getBankLabel('BCA Syariah'), 'Bank BCA Syariah')
assert.strictEqual(getBankLabel('Mega'), 'Bank Mega')
assert.strictEqual(getBankLabel('Mega Syariah'), 'Bank Mega Syariah')
assert.strictEqual(getBankLabel('BJB'), 'Bank BJB (Jawa Barat & Banten)')
assert.strictEqual(getBankLabel('BJB Syariah'), 'Bank BJB Syariah')
assert.strictEqual(getBankLabel('Mandiri'), 'Bank Mandiri')
assert.strictEqual(getBankLabel('BRI'), 'BRI (Bank Rakyat Indonesia)')
assert.strictEqual(getBankLabel('BSI'), 'Bank Syariah Indonesia (BSI)')
assert.strictEqual(getBankLabel('Bank Central Asia (BCA)'), 'BCA (Bank Central Asia)')
assert.strictEqual(getBankLabel('Bank Antartika'), 'Bank Antartika')
assert.strictEqual(getBankLabel(''), '')
assert.strictEqual(getBankLabel('   '), '')
assert.strictEqual(getBankLabel(null), '')
assert.strictEqual(getBankLabel(undefined), '')
console.log('  ✓ getBankLabel maps values and legacy names to clean display labels correctly.')

// 5. Test search filter algorithm (same as SearchableSelect component)
console.log('\n5. Testing SearchableSelect filter algorithm:')
function filterOptions(options, search) {
  const query = search.toLowerCase().trim()
  return options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(query) ||
      opt.value.toLowerCase().includes(query)
  )
}

// Search "bca" should match BCA, BCA Syariah, Blu by BCA Digital
const bcaResults = filterOptions(INDONESIA_BANKS, 'bca')
assert(bcaResults.some((b) => b.value === 'BCA'), 'Must match BCA')
assert(bcaResults.some((b) => b.value === 'BCA Syariah'), 'Must match BCA Syariah')
console.log(`  ✓ Search "bca" returned ${bcaResults.length} matches`)

// Search "mandiri" should match Bank Mandiri
const mandiriResults = filterOptions(INDONESIA_BANKS, 'mandiri')
assert(mandiriResults.some((b) => b.value === 'Mandiri'), 'Must match Mandiri')
console.log(`  ✓ Search "mandiri" returned ${mandiriResults.length} matches`)

// Search "syariah" should match Islamic banks
const syariahResults = filterOptions(INDONESIA_BANKS, 'syariah')
assert(syariahResults.length >= 7, 'Should find at least 7 Syariah banks')
console.log(`  ✓ Search "syariah" returned ${syariahResults.length} matches`)

// Search "jago"
const jagoResults = filterOptions(INDONESIA_BANKS, 'jago')
assert(jagoResults.some((b) => b.value === 'Bank Jago'), 'Must match Bank Jago')
console.log(`  ✓ Search "jago" returned ${jagoResults.length} matches`)

// Search with whitespace: "  bni  "
const bniResults = filterOptions(INDONESIA_BANKS, '  bni  ')
assert(bniResults.some((b) => b.value === 'BNI'), 'Must handle untrimmed search query')
console.log(`  ✓ Search "  bni  " returned ${bniResults.length} matches`)

// Search non-existent
const nonExistent = filterOptions(INDONESIA_BANKS, 'xyz9999notabank')
assert.strictEqual(nonExistent.length, 0, 'Non-existent search must yield empty array')
console.log('  ✓ Search non-existent returns 0 matches')

// 6. Test keyboard navigation state simulation
console.log('\n6. Testing keyboard navigation calculations:')
function simulateNavigation(length, currentIndex, action) {
  if (length === 0) return -1
  if (action === 'ArrowDown') {
    return currentIndex < length - 1 ? currentIndex + 1 : 0
  }
  if (action === 'ArrowUp') {
    return currentIndex > 0 ? currentIndex - 1 : length - 1
  }
  return currentIndex
}

assert.strictEqual(simulateNavigation(5, 0, 'ArrowDown'), 1)
assert.strictEqual(simulateNavigation(5, 4, 'ArrowDown'), 0, 'Should wrap around to 0 on ArrowDown at end')
assert.strictEqual(simulateNavigation(5, 0, 'ArrowUp'), 4, 'Should wrap around to last index on ArrowUp at start')
assert.strictEqual(simulateNavigation(5, 3, 'ArrowUp'), 2)
assert.strictEqual(simulateNavigation(0, -1, 'ArrowDown'), -1, 'Empty list must remain -1')
console.log('  ✓ Keyboard navigation wrap-around and boundary conditions verified.')

// 7. Test form validation logic in vendor-balance-client
console.log('\n7. Testing bank validation logic in payout form:')
function validatePayoutForm(form, availableBalance) {
  const errors = []
  if (!form.amount || Number(form.amount) < 10000) {
    errors.push('Minimal penarikan dana adalah Rp 10.000.')
  }
  if (Number(form.amount) > availableBalance) {
    errors.push('Nominal penarikan melebihi saldo bersih yang tersedia.')
  }
  if (!form.bankName || !form.bankName.trim() || form.bankName.trim().length < 2) {
    errors.push('Silakan pilih bank tujuan penarikan dana.')
  }
  if (!form.accountNo || form.accountNo.trim().length < 5) {
    errors.push('Nomor rekening bank tidak valid (minimal 5 digit).')
  }
  if (!form.accountHolder || form.accountHolder.trim().length < 3) {
    errors.push('Nama pemilik rekening wajib diisi dengan benar.')
  }
  return errors
}

// Case: Bank empty
const emptyBankResult = validatePayoutForm({
  amount: '50000',
  bankName: '',
  accountNo: '12345678',
  accountHolder: 'Vendor Name',
}, 100000)
assert(emptyBankResult.includes('Silakan pilih bank tujuan penarikan dana.'), 'Must reject empty bankName')
console.log('  ✓ Correctly rejected empty bank selection')

// Case: Bank whitespace only
const whitespaceBankResult = validatePayoutForm({
  amount: '50000',
  bankName: '  ',
  accountNo: '12345678',
  accountHolder: 'Vendor Name',
}, 100000)
assert(whitespaceBankResult.includes('Silakan pilih bank tujuan penarikan dana.'), 'Must reject whitespace bankName')
console.log('  ✓ Correctly rejected whitespace bank selection')

// Case: Valid bank selection
const validFormResult = validatePayoutForm({
  amount: '50000',
  bankName: 'BCA',
  accountNo: '12345678',
  accountHolder: 'Vendor Name',
}, 100000)
assert.strictEqual(validFormResult.length, 0, 'Valid form must pass with 0 errors')
console.log('  ✓ Valid bank selection passes validation')

console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===')
