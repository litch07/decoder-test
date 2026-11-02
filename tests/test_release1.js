// test_release1.js — Verification test suite for Release 1 deliverables

const fs = require('fs');
const assert = require('assert');

console.log("==================================================");
console.log("       RUNNING RELEASE 1 VERIFICATION SUITE       ");
console.log("==================================================\n");

// 1. Data Normalization & prerequisiteNote in courses.json
console.log("[TEST 1] Data Normalization in courses.json");
const courses = JSON.parse(fs.readFileSync('courses.json', 'utf8'));
const CREDIT_PATTERN = /minimum|credit/i;
let misplacedCount = 0;
for (const [code, data] of Object.entries(courses)) {
  if (typeof data === 'object' && Array.isArray(data.prerequisites)) {
    for (const p of data.prerequisites) {
      if (CREDIT_PATTERN.test(p)) misplacedCount++;
    }
  }
}
assert.strictEqual(misplacedCount, 0, "No credit notes should remain in prerequisites arrays");

const affectedCourses = ['CSE 4000A', 'CSE 4451', 'DS 3120', 'DS 4000A', 'DS 4123'];
affectedCourses.forEach(code => {
  assert.ok(courses[code], `Course ${code} must exist`);
  assert.ok(courses[code].prerequisiteNote, `Course ${code} must have prerequisiteNote`);
  assert.strictEqual(typeof courses[code].prerequisiteNote, 'string');
  assert.ok(courses[code].prerequisiteNote.length > 0);
});
console.log("  ✓ All 5 target courses have prerequisiteNote and 0 misplaced credit notes in arrays\n");

// 2. Zero-innerHTML Security Hardening
console.log("[TEST 2] Zero-innerHTML Security Hardening");
function getNonCommentLinesWithPattern(filepath, pattern) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split(/\r?\n/);
  return lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return false;
    return pattern.test(line);
  });
}

const contentInnerHtml = getNonCommentLinesWithPattern('content.js', /innerHTML|insertAdjacentHTML/);
assert.strictEqual(contentInnerHtml.length, 0, `content.js must have 0 innerHTML calls, found: ${contentInnerHtml.length}`);

const popupInnerHtml = getNonCommentLinesWithPattern('popup.js', /innerHTML|insertAdjacentHTML/);
assert.strictEqual(popupInnerHtml.length, 0, `popup.js must have 0 innerHTML calls, found: ${popupInnerHtml.length}`);
console.log("  ✓ Zero innerHTML or insertAdjacentHTML calls in content.js and popup.js\n");

// 3. Manifest V3 & Optional Host Permissions
console.log("[TEST 3] Manifest V3 & Permissions Model");
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
assert.strictEqual(manifest.manifest_version, 3);
assert.ok(manifest.optional_host_permissions, "Manifest must have optional_host_permissions");
assert.ok(manifest.optional_host_permissions.includes("*://*/*"), "optional_host_permissions must include *://*/*");

if (manifest.host_permissions) {
  assert.ok(!manifest.host_permissions.includes("<all_urls>"), "host_permissions must not contain <all_urls>");
}
assert.strictEqual(manifest.content_scripts, undefined, "content_scripts should not be statically registered in manifest");
assert.ok(manifest.permissions.includes("scripting"), "permissions must include scripting");
assert.ok(manifest.permissions.includes("tabs"), "permissions must include tabs");
console.log("  ✓ Manifest uses optional_host_permissions without blanket <all_urls>\n");

// 4. UI Elements in popup.html
console.log("[TEST 4] Form Inputs and UI Elements in popup.html");
const popupHtml = fs.readFileSync('popup.html', 'utf8');
assert.ok(popupHtml.includes('id="detailPrereqNote"'), "popup.html must have detailPrereqNote input");
assert.ok(popupHtml.includes('id="singleCoursePrereqNote"'), "popup.html must have singleCoursePrereqNote input");
assert.ok(popupHtml.includes('id="reportIssueBtn"'), "popup.html must have reportIssueBtn");
console.log("  ✓ All required UI elements present in popup.html\n");

// 5. 2 MB Safety Caps in Code
console.log("[TEST 5] Safety Caps & Payloads");
const popupJs = fs.readFileSync('popup.js', 'utf8');
assert.ok(popupJs.includes('MAX_IMPORT_BYTES = 2 * 1024 * 1024'), "popup.js must enforce 2MB batch upload cap");

const backgroundJs = fs.readFileSync('background.js', 'utf8');
assert.ok(backgroundJs.includes('MAX_SYNC_BYTES = 2 * 1024 * 1024'), "background.js must enforce 2MB catalog sync cap");
console.log("  ✓ 2 MB safety cap active in popup batch upload and background sync\n");

// 6. Security, Privacy and CI Documentation
console.log("[TEST 6] Repository Protection & Documentation");
assert.ok(fs.existsSync('SECURITY.md'), "SECURITY.md must exist");
assert.ok(fs.existsSync('PRIVACY.md'), "PRIVACY.md must exist");
assert.ok(fs.existsSync('README.md'), "README.md must exist");
assert.ok(fs.existsSync('.github/workflows/validate-catalog.yml'), "CI workflow file must exist");

const privacyText = fs.readFileSync('PRIVACY.md', 'utf8');
assert.ok(privacyText.includes('optional host permissions'), "PRIVACY.md must explain optional host permissions");

const securityText = fs.readFileSync('SECURITY.md', 'utf8');
assert.ok(securityText.includes('Zero-innerHTML'), "SECURITY.md must document Zero-innerHTML architecture");
console.log("  ✓ SECURITY.md, PRIVACY.md, README.md, and CI workflow verified\n");

// 7. Script Syntax Validity (Zero Parse Errors)
console.log("[TEST 7] JavaScript Syntax Validity Across All Scripts");
const { execSync } = require('child_process');
['popup.js', 'background.js', 'content.js'].forEach(script => {
  execSync(`node -c "${script}"`, { stdio: 'pipe' });
});
console.log("  ✓ popup.js, background.js, and content.js passed syntax validation with zero errors\n");

console.log("==================================================");
console.log("    ALL RELEASE 1 TESTS PASSED WITH 100% SUCCESS  ");
console.log("==================================================");

