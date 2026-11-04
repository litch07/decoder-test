// test_google_sheets_pubhtml.js — Verification test suite for Google Sheets & pubhtml compatibility

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("==================================================");
console.log("   RUNNING GOOGLE SHEETS PUBHTML TEST SUITE       ");
console.log("==================================================\n");

// --- TEST 1: Manifest Permissions for Google Docs & UIU Portals ---
console.log("[TEST 1] Manifest Host Permissions and Optional Permissions");
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

assert.strictEqual(manifest.manifest_version, 3);
assert.ok(manifest.host_permissions, "manifest.json must contain host_permissions");
assert.ok(manifest.host_permissions.includes("*://docs.google.com/*"), "host_permissions must include *://docs.google.com/* for Google Sheets");
assert.ok(manifest.host_permissions.includes("*://*.uiu.ac.bd/*"), "host_permissions must include *://*.uiu.ac.bd/* for UIU portals");
assert.ok(!manifest.host_permissions.includes("<all_urls>"), "host_permissions must NEVER contain blanket <all_urls>");
assert.ok(manifest.optional_host_permissions.includes("*://*/*"), "optional_host_permissions must contain *://*/* for user add-ons");
assert.strictEqual(manifest.content_scripts, undefined, "content_scripts must not be statically registered in manifest");

console.log("  ✓ Manifest permissions correctly configured for Google Sheets and UIU portals\n");

// --- TEST 2: Domain Matching Logic with Wildcards and Subdomains ---
console.log("[TEST 2] Subdomain & Wildcard Domain Matching");

const contentJs = fs.readFileSync('content.js', 'utf8');
const backgroundJs = fs.readFileSync('background.js', 'utf8');
const popupJs = fs.readFileSync('popup.js', 'utf8');

function extractFunction(src, name) {
  const startIdx = src.indexOf(`function ${name}`);
  assert.ok(startIdx !== -1, `Function ${name} not found`);
  let depth = 0;
  let started = false;
  let endIdx = -1;
  for (let i = startIdx; i < src.length; i++) {
    if (src[i] === '{') {
      depth++;
      started = true;
    } else if (src[i] === '}') {
      depth--;
      if (started && depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
  }
  return src.slice(startIdx, endIdx);
}

const checkContent = new Function("host", "allowedSites", extractFunction(contentJs, "isHostAllowed") + "; return isHostAllowed(host, allowedSites);");
const checkBackground = new Function("host", "allowedSites", extractFunction(backgroundJs, "isDomainAllowed") + "; return isDomainAllowed(host, allowedSites);");
const checkPopup = new Function("host", "allowedSites", extractFunction(popupJs, "isHostAllowed") + "; return isHostAllowed(host, allowedSites);");

const testCases = [
  { host: "docs.google.com", allowed: ["docs.google.com"], expected: true, desc: "Exact docs.google.com" },
  { host: "docs.google.com", allowed: ["google.com"], expected: true, desc: "Root google.com matches docs.google.com" },
  { host: "docs.google.com", allowed: ["*.google.com"], expected: true, desc: "*.google.com matches docs.google.com" },
  { host: "ucam.uiu.ac.bd", allowed: ["uiu.ac.bd"], expected: true, desc: "Root uiu.ac.bd matches ucam.uiu.ac.bd" },
  { host: "ucam.uiu.ac.bd", allowed: ["*.uiu.ac.bd"], expected: true, desc: "*.uiu.ac.bd matches ucam.uiu.ac.bd" },
  { host: "elms.uiu.ac.bd", allowed: ["ucam.uiu.ac.bd", "elms.uiu.ac.bd", "docs.google.com"], expected: true, desc: "Portal default list" },
  { host: "randomsite.org", allowed: ["docs.google.com", "uiu.ac.bd"], expected: false, desc: "Unallowed domain" }
];

testCases.forEach(tc => {
  assert.strictEqual(checkContent(tc.host, tc.allowed), tc.expected, `content.js: ${tc.desc}`);
  assert.strictEqual(checkBackground(tc.host, tc.allowed), tc.expected, `background.js: ${tc.desc}`);
  assert.strictEqual(checkPopup(tc.host, tc.allowed), tc.expected, `popup.js: ${tc.desc}`);
});

console.log("  ✓ Domain matching functions verified identical and accurate across content.js, background.js, and popup.js\n");

// --- TEST 3: Default Allowed Sites Initialization in background.js ---
console.log("[TEST 3] Default Allowed Sites in background.js");
assert.ok(backgroundJs.includes('"docs.google.com"'), "background.js must include docs.google.com in DEFAULT_ALLOWED_SITES");
assert.ok(backgroundJs.includes('"ucam.uiu.ac.bd"'), "background.js must include ucam.uiu.ac.bd in DEFAULT_ALLOWED_SITES");
assert.ok(backgroundJs.includes('"elms.uiu.ac.bd"'), "background.js must include elms.uiu.ac.bd in DEFAULT_ALLOWED_SITES");
assert.ok(backgroundJs.includes('syncRegisteredContentScripts().catch'), "background.js must sync registered content scripts at top level");

console.log("  ✓ background.js initializes default allowed sites including Google Docs\n");

// --- TEST 4: Same-Origin Iframe Hooking in content.js ---
console.log("[TEST 4] Google Sheets pubhtml Iframe Hooking in content.js");
assert.ok(contentJs.includes("function hookSameOriginIframes"), "content.js must contain hookSameOriginIframes function");
assert.ok(contentJs.includes("function processSameOriginIframe"), "content.js must contain processSameOriginIframe function");
assert.ok(contentJs.includes("iframe.addEventListener(\"load\""), "content.js must listen for iframe load event for sheet switching");
assert.ok(contentJs.includes("hookSameOriginIframes(rootNode)"), "init() must call hookSameOriginIframes");

console.log("  ✓ content.js includes same-origin iframe observation for Google Sheets pubhtml\n");

// --- TEST 5: Table Cell & Course Code Regex on Google Sheets markup ---
console.log("[TEST 5] Course Code Detection on Google Sheets Table Cells");
const courses = JSON.parse(fs.readFileSync('courses.json', 'utf8'));

// Build regex similar to content.js
function buildTestRegex(map) {
  const patterns = Object.keys(map).map(code => {
    const escaped = code.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    const flexible = escaped.replace(/\\ /g, "[\\s]*");
    return `(?<![\\w-])${flexible}(?![\\w-])`;
  });
  return new RegExp(patterns.join("|"), "gi");
}

const regex = buildTestRegex(courses);

// Test samples found directly in the user's exam routine sheet
const sheetSampleSnippets = [
  { text: "AIS 3209", expected: "AIS 3209" },
  { text: "QNT 2105", expected: "QNT 2105" },
  { text: "MGT 4132", expected: "MGT 4132" },
  { text: "ENG 1013", expected: "ENG 1013" },
  { text: "ENG 1011/<br> ENG 1101", expected: "ENG 1011" },
  { text: "CSE 1111", expected: "CSE 1111" }
];

sheetSampleSnippets.forEach(s => {
  regex.lastIndex = 0;
  const match = regex.exec(s.text);
  assert.ok(match, `Should match course code in snippet: "${s.text}"`);
  assert.strictEqual(match[0].trim(), s.expected, `Should accurately match ${s.expected}`);
});

console.log("  ✓ Catalog regex correctly extracts course codes from Google Sheets table cells\n");

// --- TEST 6: Zero-innerHTML Guarantee Across All Modified Files ---
console.log("[TEST 6] Zero-innerHTML Compliance");
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

const backgroundInnerHtml = getNonCommentLinesWithPattern('background.js', /innerHTML|insertAdjacentHTML/);
assert.strictEqual(backgroundInnerHtml.length, 0, `background.js must have 0 innerHTML calls, found: ${backgroundInnerHtml.length}`);

const popupInnerHtml = getNonCommentLinesWithPattern('popup.js', /innerHTML|insertAdjacentHTML/);
assert.strictEqual(popupInnerHtml.length, 0, `popup.js must have 0 innerHTML calls, found: ${popupInnerHtml.length}`);

console.log("  ✓ Zero innerHTML or insertAdjacentHTML calls verified across all scripts\n");

console.log("==================================================");
console.log("  ALL GOOGLE SHEETS PUBHTML TESTS PASSED (6 / 6)  ");
console.log("==================================================");
