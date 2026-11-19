/**
 * scripts/test-address-helper.cjs
 * Comprehensive verification for address-helper and address actions compliance.
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

console.log('=== RUNNING TESTS FOR ADDRESS HELPER & SERVER ACTION CONSTRAINTS ===\n')

// 1. Transpile and load src/lib/address-helper.ts
const helperPath = path.resolve(__dirname, '../src/lib/address-helper.ts')
assert(fs.existsSync(helperPath), 'src/lib/address-helper.ts must exist')

const helperSource = fs.readFileSync(helperPath, 'utf8')
const hasServerDirective = /^\s*['"]use server['"]/m.test(helperSource)
assert(!hasServerDirective, 'src/lib/address-helper.ts MUST NOT have "use server" directive')

const transpiledHelper = ts.transpileModule(helperSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
})
const helperModule = { exports: {} }
const helperRunner = new Function('module', 'exports', 'require', transpiledHelper.outputText)
helperRunner(helperModule, helperModule.exports, require)

const { formatAddressLine, extractAddressLineDetails } = helperModule.exports

assert.strictEqual(typeof formatAddressLine, 'function', 'formatAddressLine must be exported')
assert.strictEqual(typeof extractAddressLineDetails, 'function', 'extractAddressLineDetails must be exported')

// =========================================================================
// TEST 1: formatAddressLine functionality & edge cases
// =========================================================================
console.log('--- TEST 1: formatAddressLine ---')

// 1a. Normal combination
const formatted1 = formatAddressLine('Jl. Merdeka No. 10', 'Gambir', 'Gambir')
assert.strictEqual(formatted1, 'Jl. Merdeka No. 10, Kel. Gambir, Kec. Gambir')
console.log('  ✓ 1a: Basic street, village, district combined correctly')

// 1b. Only village
const formatted2 = formatAddressLine('Jl. Sudirman No. 5', 'Karet Semanggi', '')
assert.strictEqual(formatted2, 'Jl. Sudirman No. 5, Kel. Karet Semanggi')
console.log('  ✓ 1b: Village only handled correctly')

// 1c. Only district
const formatted3 = formatAddressLine('Jl. Gatot Subroto No. 8', undefined, 'Setiabudi')
assert.strictEqual(formatted3, 'Jl. Gatot Subroto No. 8, Kec. Setiabudi')
console.log('  ✓ 1c: District only handled correctly')

// 1d. Neither village nor district
const formatted4 = formatAddressLine('Jl. Thamrin No. 1', '', '   ')
assert.strictEqual(formatted4, 'Jl. Thamrin No. 1')
console.log('  ✓ 1d: No village/district returns base cleanly')

// 1e. Idempotency / Deduplication of existing Kel. and Kec.
const preformatted = 'Jl. Sukolilo No. 12, Kel. Keputih, Kec. Sukolilo'
const reFormatted = formatAddressLine(preformatted, 'Gebang Putih', 'Sukolilo Baru')
assert.strictEqual(reFormatted, 'Jl. Sukolilo No. 12, Kel. Gebang Putih, Kec. Sukolilo Baru')
console.log('  ✓ 1e: Existing Kel. and Kec. tags stripped without duplicating tokens')

// 1f. Empty / falsy inputs
assert.strictEqual(formatAddressLine(''), '')
assert.strictEqual(formatAddressLine(undefined), '')
console.log('  ✓ 1f: Falsy base string handled safely')

// 1g. Empty base with village & district (NO leading comma)
const formattedEmptyBase = formatAddressLine('', 'Gambir', 'Gambir')
assert.strictEqual(formattedEmptyBase, 'Kel. Gambir, Kec. Gambir')
console.log('  ✓ 1g: Empty street address formats without leading comma')

// 1h. Village and district pre-tagged with Kel. / Kec.
const formattedPretagged = formatAddressLine('Jl. Sudirman', 'Kel. Menteng', 'Kec. Menteng')
assert.strictEqual(formattedPretagged, 'Jl. Sudirman, Kel. Menteng, Kec. Menteng')
console.log('  ✓ 1h: Pre-tagged village/district input normalized cleanly')

// 1i. Street name containing "Kelapa" or "Kecepatan" preserved
const formattedKelapa = formatAddressLine('Jl. Kelapa Dua No. 5', 'Menteng', 'Menteng')
assert.strictEqual(formattedKelapa, 'Jl. Kelapa Dua No. 5, Kel. Menteng, Kec. Menteng')
console.log('  ✓ 1i: Street name with word-initial "Kel" preserved without false stripping\n')

// =========================================================================
// TEST 2: extractAddressLineDetails functionality & edge cases
// =========================================================================
console.log('--- TEST 2: extractAddressLineDetails ---')

// 2a. Full extract
const res1 = extractAddressLineDetails('Jl. Pahlawan No. 45, Kel. Alun-Alun Contong, Kec. Bubutan')
assert.strictEqual(res1.cleanAddressLine, 'Jl. Pahlawan No. 45')
assert.strictEqual(res1.village, 'Alun-Alun Contong')
assert.strictEqual(res1.district, 'Bubutan')
console.log('  ✓ 2a: Extracted clean line, village, and district')

// 2b. Case insensitivity (kel., kec.)
const res2 = extractAddressLineDetails('Jl. Basuki Rahmat No. 1, kel. embong kaliasin, kec. genteng')
assert.strictEqual(res2.cleanAddressLine, 'Jl. Basuki Rahmat No. 1')
assert.strictEqual(res2.village, 'embong kaliasin')
assert.strictEqual(res2.district, 'genteng')
console.log('  ✓ 2b: Case-insensitive extraction handled')

// 2c. Only village in address line
const res3 = extractAddressLineDetails('Jl. Veteran No. 3, Kel. Kebon Kelapa')
assert.strictEqual(res3.cleanAddressLine, 'Jl. Veteran No. 3')
assert.strictEqual(res3.village, 'Kebon Kelapa')
assert.strictEqual(res3.district, undefined)
console.log('  ✓ 2c: Village-only extraction handled')

// 2d. Only district in address line
const res4 = extractAddressLineDetails('Jl. Hayam Wuruk No. 2, Kec. Taman Sari')
assert.strictEqual(res4.cleanAddressLine, 'Jl. Hayam Wuruk No. 2')
assert.strictEqual(res4.village, undefined)
assert.strictEqual(res4.district, 'Taman Sari')
console.log('  ✓ 2d: District-only extraction handled')

// 2e. Plain address without Kel/Kec
const res5 = extractAddressLineDetails('Jl. Malioboro No. 15')
assert.strictEqual(res5.cleanAddressLine, 'Jl. Malioboro No. 15')
assert.strictEqual(res5.village, undefined)
assert.strictEqual(res5.district, undefined)
console.log('  ✓ 2e: Plain address extraction handled')

// 2f. Falsy input
const res6 = extractAddressLineDetails('')
assert.strictEqual(res6.cleanAddressLine, '')
assert.strictEqual(res6.village, undefined)
assert.strictEqual(res6.district, undefined)
console.log('  ✓ 2f: Empty address input handled safely')

// 2g. Address starting with Kel. without leading comma
const res7 = extractAddressLineDetails('Kel. Menteng, Kec. Menteng')
assert.strictEqual(res7.cleanAddressLine, '')
assert.strictEqual(res7.village, 'Menteng')
assert.strictEqual(res7.district, 'Menteng')
console.log('  ✓ 2g: Initial Kel. token stripped cleanly from cleanAddressLine')

// 2h. Full Indonesian words Kelurahan and Kecamatan
const res8 = extractAddressLineDetails('Jl. Merdeka No. 1, Kelurahan Menteng, Kecamatan Menteng')
assert.strictEqual(res8.cleanAddressLine, 'Jl. Merdeka No. 1')
assert.strictEqual(res8.village, 'Menteng')
assert.strictEqual(res8.district, 'Menteng')
console.log('  ✓ 2h: Spelled out Kelurahan and Kecamatan extracted and stripped')

// 2i. Address with parentheses
const res9 = extractAddressLineDetails('Jl. Gatot Subroto No. 10 (Kel. Karet Semanggi, Kec. Setiabudi)')
assert.strictEqual(res9.cleanAddressLine, 'Jl. Gatot Subroto No. 10')
assert.strictEqual(res9.village, 'Karet Semanggi')
assert.strictEqual(res9.district, 'Setiabudi')
console.log('  ✓ 2i: Address with parentheses parsed cleanly')

// 2j. Street name with Kelapa Gading not falsely matched as village
const res10 = extractAddressLineDetails('Jl. Kelapa Gading No. 12, Kel. Kelapa Gading Barat, Kec. Kelapa Gading')
assert.strictEqual(res10.cleanAddressLine, 'Jl. Kelapa Gading No. 12')
assert.strictEqual(res10.village, 'Kelapa Gading Barat')
assert.strictEqual(res10.district, 'Kelapa Gading')
console.log('  ✓ 2j: Street name "Kelapa Gading" preserved without false match\n')

// =========================================================================
// TEST 3: Static Analysis of src/actions/address.ts for 'use server' rule
// =========================================================================
console.log('--- TEST 3: Next.js Server Action Constraints Verification ---')

const actionPath = path.resolve(__dirname, '../src/actions/address.ts')
const actionSource = fs.readFileSync(actionPath, 'utf8')

// Parse AST of src/actions/address.ts
const sourceFile = ts.createSourceFile(
  actionPath,
  actionSource,
  ts.ScriptTarget.Latest,
  true
)

const exportedFunctions = []
const syncExports = []

ts.forEachChild(sourceFile, (node) => {
  if (ts.isFunctionDeclaration(node)) {
    const isExported = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    if (isExported && node.name) {
      const isAsync = node.modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword)
      exportedFunctions.push({ name: node.name.text, isAsync })
      if (!isAsync) {
        syncExports.push(node.name.text)
      }
    }
  }
})

console.log(`  Exported functions from src/actions/address.ts: ${exportedFunctions.map((f) => f.name).join(', ')}`)
assert.strictEqual(syncExports.length, 0, `Forbidden sync exports found in 'use server' file: ${syncExports.join(', ')}`)
assert(exportedFunctions.length >= 4, 'Must have Server Actions exported')
exportedFunctions.forEach((f) => {
  assert(f.isAsync, `Server Action "${f.name}" must be an async function`)
})
console.log('  ✓ 3: ALL exported functions in src/actions/address.ts are async functions (Server Actions compliant)\n')

// =========================================================================
// TEST 4: Verify imports in dependent files
// =========================================================================
console.log('--- TEST 4: Dependent Files Import Verification ---')

const vendorPath = path.resolve(__dirname, '../src/actions/vendor.ts')
const vendorSource = fs.readFileSync(vendorPath, 'utf8')
assert(!vendorSource.includes("formatAddressLine } from '@/actions/address'"), 'vendor.ts must not import formatAddressLine from actions/address')
assert(vendorSource.includes("formatAddressLine } from '@/lib/address-helper'"), 'vendor.ts must import formatAddressLine from lib/address-helper')
console.log('  ✓ 4a: src/actions/vendor.ts imports formatAddressLine from @/lib/address-helper')

const modalPath = path.resolve(__dirname, '../src/components/account/address-modal.tsx')
const modalSource = fs.readFileSync(modalPath, 'utf8')
assert(!modalSource.includes("extractAddressLineDetails,\n} from '@/actions/address'"), 'address-modal.tsx must not import extractAddressLineDetails from actions/address')
assert(modalSource.includes("extractAddressLineDetails } from '@/lib/address-helper'"), 'address-modal.tsx must import extractAddressLineDetails from lib/address-helper')
console.log('  ✓ 4b: src/components/account/address-modal.tsx imports extractAddressLineDetails from @/lib/address-helper')

console.log('\n=================================================================')
console.log('🎉 ALL ADDRESS HELPER & SERVER ACTION TESTS PASSED (100% SUCCESS)')
console.log('=================================================================')
