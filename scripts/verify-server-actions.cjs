/**
 * scripts/verify-server-actions.cjs
 * Comprehensive verification for Next.js 'use server' boundary compliance.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== VERIFYING SERVER ACTION EXPORT BOUNDARIES ===');

const actionsDir = path.resolve(__dirname, '../src/actions');
const actionFiles = fs.readdirSync(actionsDir).filter((f) => f.endsWith('.ts'));

assert.ok(actionFiles.length >= 10, 'Expected at least 10 action files');

let totalExports = 0;
let actionCount = 0;

actionFiles.forEach((file) => {
  const fullPath = path.join(actionsDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');

  // Verify 'use server' at top
  const hasUseServer = lines.slice(0, 5).some((l) => l.includes("'use server'") || l.includes('"use server"'));
  assert.ok(hasUseServer, `File ${file} MUST contain 'use server' directive`);

  // Check every exported symbol
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('export ')) {
      totalExports++;

      // Must be an async function
      const isAsyncFunc = /^\s*export\s+async\s+function\s+([a-zA-Z0-9_]+)/.test(trimmed);
      assert.ok(
        isAsyncFunc,
        `VIOLATION in ${file} at line ${idx + 1}: '${trimmed}'. Only 'export async function' is allowed in 'use server' files.`
      );
      actionCount++;
    }
  });

  console.log(`✓ ${file}: verified valid. Only exported async functions.`);
});

console.log(`\nAll ${actionFiles.length} server action modules verified. Total verified server actions: ${actionCount}`);

// Verify validators
console.log('\n=== VERIFYING VALIDATOR SCHEMAS IN src/lib/validators.ts ===');
const validatorsContent = fs.readFileSync(path.resolve(__dirname, '../src/lib/validators.ts'), 'utf8');

const requiredSchemas = [
  'VendorApplicationSchema',
  'FirstProductSchema',
  'BecomeVendorSchema',
  'ProductFormSchema',
  'PayoutSchema',
  'ShopSettingsSchema',
  'ReviewSchema',
  'CommentSchema',
  'ReportSchema',
];

requiredSchemas.forEach((schema) => {
  const regex = new RegExp(`export\\s+const\\s+${schema}\\s*=\\s*z\\.object`);
  assert.ok(regex.test(validatorsContent), `Schema '${schema}' must be exported as z.object in validators.ts`);
  console.log(`✓ ${schema} correctly exported from src/lib/validators.ts`);
});

// Verify newly created type files
console.log('\n=== VERIFYING DEDICATED TYPE FILES ===');
const requiredTypeFiles = [
  'account.ts',
  'address.ts',
  'cart.ts',
  'download.ts',
  'moderator.ts',
  'order.ts',
  'wishlist.ts',
];

requiredTypeFiles.forEach((typeFile) => {
  const filePath = path.resolve(__dirname, `../src/types/${typeFile}`);
  assert.ok(fs.existsSync(filePath), `Type file src/types/${typeFile} must exist`);
  const content = fs.readFileSync(filePath, 'utf8');
  assert.ok(content.length > 20, `Type file src/types/${typeFile} must not be empty`);
  console.log(`✓ src/types/${typeFile} verified present and populated.`);
});

console.log('\n=== ALL VERIFICATIONS PASSED SUCCESSFULLY ===');
