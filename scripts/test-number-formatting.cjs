/**
 * scripts/test-number-formatting.cjs
 * Comprehensive Automated Test Suite for Indonesian Number Formatting & Cleaning Utilities.
 * Directly loads and tests the real src/lib/utils.ts via TypeScript transpileModule.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

// 1. Load actual src/lib/utils.ts without duplicating code
const utilsPath = path.resolve(__dirname, '../src/lib/utils.ts');
const utilsSource = fs.readFileSync(utilsPath, 'utf8');
const transpiled = ts.transpileModule(utilsSource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS }
});

const utilsModule = { exports: {} };
const runner = new Function('module', 'exports', 'require', transpiled.outputText);
runner(utilsModule, utilsModule.exports, require);

const { cleanNumberString, formatNumberWithDots, unformatNumber } = utilsModule.exports;

assert.strictEqual(typeof cleanNumberString, 'function', 'cleanNumberString must be exported as a function');
assert.strictEqual(typeof formatNumberWithDots, 'function', 'formatNumberWithDots must be exported as a function');
assert.strictEqual(typeof unformatNumber, 'function', 'unformatNumber must be exported as a function');

console.log('=== RUNNING TESTS FOR REAL src/lib/utils.ts EXPORTS ===\n');

// =========================================================================
// 1. cleanNumberString tests
// =========================================================================
console.log('1. Testing cleanNumberString:');
// Empty & nullish
assert.strictEqual(cleanNumberString(''), '', 'Empty string should return empty string');
assert.strictEqual(cleanNumberString(null), '', 'null should return empty string');
assert.strictEqual(cleanNumberString(undefined), '', 'undefined should return empty string');
assert.strictEqual(cleanNumberString('abc'), '', 'Letters only should return empty string');

// Indonesian currency & sen comma decimals
assert.strictEqual(cleanNumberString('Rp 50.000'), '50000', 'Should strip Rp prefix and dots');
assert.strictEqual(cleanNumberString('Rp. 50.000'), '50000', 'Should strip Rp. prefix and dots');
assert.strictEqual(cleanNumberString('Rp 1.250.000,00'), '1250000', 'Should strip Rp and sen comma decimals (,00)');
assert.strictEqual(cleanNumberString('50.000,00'), '50000', 'Should strip sen comma decimals (,00)');

// Database float strings (.00, .50)
assert.strictEqual(cleanNumberString('50000.00'), '50000', 'Should handle database float string 50000.00');
assert.strictEqual(cleanNumberString('1500000.00'), '1500000', 'Should handle database float string 1500000.00');
assert.strictEqual(cleanNumberString('1500.5'), '1501', 'Should round float decimal string');

// Number types
assert.strictEqual(cleanNumberString(50000), '50000', 'Number input 50000 should return string 50000');
assert.strictEqual(cleanNumberString(50000.00), '50000', 'Number input 50000.00 should return string 50000');
assert.strictEqual(cleanNumberString(0), '0', 'Number input 0 should return string 0');
assert.strictEqual(cleanNumberString(-50000), '50000', 'Negative number should be cleaned to positive digits');
assert.strictEqual(cleanNumberString(NaN), '', 'NaN should return empty string');
assert.strictEqual(cleanNumberString(Infinity), '', 'Infinity should return empty string');

// Leading zeros
assert.strictEqual(cleanNumberString('0'), '0', 'Single 0 should remain 0');
assert.strictEqual(cleanNumberString('00'), '0', 'Double 0 should become 0');
assert.strictEqual(cleanNumberString('000'), '0', 'Triple 0 should become 0');
assert.strictEqual(cleanNumberString('050'), '50', 'Leading zero should be removed');
assert.strictEqual(cleanNumberString('000123'), '123', 'Multiple leading zeros should be removed');

console.log('✓ cleanNumberString passed all tests.');

// =========================================================================
// 2. formatNumberWithDots tests
// =========================================================================
console.log('\n2. Testing formatNumberWithDots:');
assert.strictEqual(formatNumberWithDots(''), '', 'Empty string returns empty string');
assert.strictEqual(formatNumberWithDots(null), '', 'null returns empty string');
assert.strictEqual(formatNumberWithDots(undefined), '', 'undefined returns empty string');
assert.strictEqual(formatNumberWithDots('0'), '0', '"0" formats to "0"');
assert.strictEqual(formatNumberWithDots(0), '0', '0 formats to "0"');
assert.strictEqual(formatNumberWithDots('5'), '5', '"5" formats to "5"');
assert.strictEqual(formatNumberWithDots('50'), '50', '"50" formats to "50"');
assert.strictEqual(formatNumberWithDots('500'), '500', '"500" formats to "500"');
assert.strictEqual(formatNumberWithDots('1000'), '1.000', '"1000" formats to "1.000"');
assert.strictEqual(formatNumberWithDots('50000'), '50.000', '"50000" formats to "50.000"');
assert.strictEqual(formatNumberWithDots(50000), '50.000', '50000 formats to "50.000"');
assert.strictEqual(formatNumberWithDots('50.000'), '50.000', 'Already dotted string formats to "50.000"');
assert.strictEqual(formatNumberWithDots('1500000'), '1.500.000', '"1500000" formats to "1.500.000"');
assert.strictEqual(formatNumberWithDots(1500000), '1.500.000', '1500000 formats to "1.500.000"');
assert.strictEqual(formatNumberWithDots('10000000'), '10.000.000', '"10000000" formats to "10.000.000"');
assert.strictEqual(formatNumberWithDots('050000'), '50.000', 'Leading zero stripped and formatted to "50.000"');
assert.strictEqual(formatNumberWithDots('5000a0'), '50.000', 'Injected letter stripped and formatted to "50.000"');
assert.strictEqual(formatNumberWithDots('Rp 1.250.000,00'), '1.250.000', 'Clipboard currency with sen formatted to "1.250.000"');
assert.strictEqual(formatNumberWithDots('50000.00'), '50.000', 'Database float string formatted to "50.000"');
console.log('✓ formatNumberWithDots passed all tests.');

// =========================================================================
// 3. unformatNumber tests
// =========================================================================
console.log('\n3. Testing unformatNumber:');
assert.strictEqual(unformatNumber(''), 0, 'Empty string returns 0');
assert.strictEqual(unformatNumber(null), 0, 'null returns 0');
assert.strictEqual(unformatNumber(undefined), 0, 'undefined returns 0');
assert.strictEqual(unformatNumber('0'), 0, '"0" returns 0');
assert.strictEqual(unformatNumber(0), 0, '0 returns 0');
assert.strictEqual(unformatNumber('50.000'), 50000, '"50.000" unformats to 50000');
assert.strictEqual(unformatNumber(50000), 50000, '50000 unformats to 50000');
assert.strictEqual(unformatNumber('1.500.000'), 1500000, '"1.500.000" unformats to 1500000');
assert.strictEqual(unformatNumber('10.000.000'), 10000000, '"10.000.000" unformats to 10000000');
assert.strictEqual(unformatNumber('Rp 150.000'), 150000, '"Rp 150.000" unformats to 150000');
assert.strictEqual(unformatNumber('Rp 1.250.000,00'), 1250000, '"Rp 1.250.000,00" unformats to 1250000');
assert.strictEqual(unformatNumber('50000.00'), 50000, '"50000.00" unformats to 50000');
assert.strictEqual(unformatNumber('invalid'), 0, '"invalid" returns 0 without NaN');
assert.ok(!isNaN(unformatNumber('invalid')), 'Must never return NaN');
assert.ok(!isNaN(unformatNumber('50.000')), 'Must never return NaN for dotted numbers');
console.log('✓ unformatNumber passed all tests.');

// =========================================================================
// 4. Form integration & Keystroke Simulation
// =========================================================================
console.log('\n4. Testing form simulation:');

// Simulate user typing "50000" step by step
let input = '';
input = formatNumberWithDots(input + '5');
assert.strictEqual(input, '5');
input = formatNumberWithDots(input + '0');
assert.strictEqual(input, '50');
input = formatNumberWithDots(input + '0');
assert.strictEqual(input, '500');
input = formatNumberWithDots(input + '0');
assert.strictEqual(input, '5.000');
input = formatNumberWithDots(input + '0');
assert.strictEqual(input, '50.000');

// User backspaces the last digit
input = formatNumberWithDots(input.slice(0, -1));
assert.strictEqual(input, '5.000');

// User backspaces again
input = formatNumberWithDots(input.slice(0, -1));
assert.strictEqual(input, '500');

// Mid-string insertion: insert '9' inside '50.000' at index 1 ('5|0.000')
const beforeInsert = '50.000';
const inserted = beforeInsert.slice(0, 1) + '9' + beforeInsert.slice(1);
assert.strictEqual(formatNumberWithDots(inserted), '590.000');

// Backspace on dot separator simulation:
// When cursor is at index 3 in '50.|000' and user hits Backspace,
// delete the digit before the dot (index 1) and the dot (index 2) -> '5000' -> '5.000'
const atDot = '50.000';
const cursorAt = 3;
assert.strictEqual(atDot[cursorAt - 1], '.');
const afterDotBackspace = atDot.slice(0, cursorAt - 2) + atDot.slice(cursorAt);
assert.strictEqual(formatNumberWithDots(afterDotBackspace), '5.000');

// User submits form with "50.000"
input = '50.000';
const payloadPrice = unformatNumber(input);
assert.strictEqual(payloadPrice, 50000);
assert.strictEqual(typeof payloadPrice, 'number');
assert.ok(!isNaN(payloadPrice));

console.log('✓ Form typing, mid-string insertion, and unformat simulation passed!');
console.log('\nALL TESTS PASSED SUCCESSFULLY! (100% SUCCESS)');
