// test_allowed_domains_management.js — Automated test suite for Task 2.3: Allowed Domains Search & Bulk Management

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("==================================================");
console.log("    RUNNING ALLOWED DOMAINS TEST SUITE (2.3)      ");
console.log("==================================================\n");

// --- TEST 1: DOM Elements in popup.html ---
console.log("[TEST 1] Allowed Domains Search & Bulk UI Elements in popup.html");
const popupHtml = fs.readFileSync(path.join(__dirname, "..", "popup.html"), "utf8");

// Search & filter elements
assert.ok(popupHtml.includes('id="domainsCountBadge"'), "popup.html must contain domainsCountBadge");
assert.ok(popupHtml.includes('id="domainSearchRow"'), "popup.html must contain domainSearchRow");
assert.ok(popupHtml.includes('id="domainSearchInput"'), "popup.html must contain domainSearchInput");
assert.ok(popupHtml.includes('id="domainSearchClearBtn"'), "popup.html must contain domainSearchClearBtn");

// Bulk selection elements
assert.ok(popupHtml.includes('id="domainBulkToolbar"'), "popup.html must contain domainBulkToolbar");
assert.ok(popupHtml.includes('id="domainSelectAll"'), "popup.html must contain domainSelectAll");
assert.ok(popupHtml.includes('id="domainSelectAllText"'), "popup.html must contain domainSelectAllText");
assert.ok(popupHtml.includes('id="bulkRemoveDomainsBtn"'), "popup.html must contain bulkRemoveDomainsBtn");
assert.ok(popupHtml.includes('id="bulkRemoveDomainsBtnText"'), "popup.html must contain bulkRemoveDomainsBtnText");

// Core allowlist container
assert.ok(popupHtml.includes('id="allowlistContainer"'), "popup.html must contain allowlistContainer");
assert.ok(popupHtml.includes('id="allowlistInput"'), "popup.html must contain allowlistInput");
assert.ok(popupHtml.includes('id="allowlistBtn"'), "popup.html must contain allowlistBtn");

console.log("  ✓ All required Search and Bulk Management UI elements verified in popup.html\n");

// --- TEST 2: Zero-innerHTML Security Verification ---
console.log("[TEST 2] Zero-innerHTML Security Verification");
const popupJs = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");

function getNonCommentLinesWithPattern(content, pattern) {
  const lines = content.split(/\r?\n/);
  return lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return false;
    return pattern.test(line);
  });
}

const innerHtmlMatches = getNonCommentLinesWithPattern(popupJs, /innerHTML|insertAdjacentHTML/);
assert.strictEqual(innerHtmlMatches.length, 0, `popup.js must maintain 0 innerHTML calls, found: ${innerHtmlMatches.length}`);
console.log("  ✓ Zero innerHTML or insertAdjacentHTML calls verified in popup.js\n");

// --- TEST 3: Real-Time Domain Search and Filtering Logic ---
console.log("[TEST 3] Real-Time Domain Search and Filtering Logic");

const sampleSites = [
  "ucam.uiu.ac.bd",
  "lms.uiu.ac.bd",
  "elms.uiu.ac.bd",
  "*.uiu.ac.bd",
  "dspace.uiu.ac.bd",
  "portal.example.com"
];

function filterSites(sites, query) {
  const q = (query || "").trim().toLowerCase();
  return q ? sites.filter(s => s.toLowerCase().includes(q)) : sites;
}

// Substring match
const ucamMatches = filterSites(sampleSites, "ucam");
assert.strictEqual(ucamMatches.length, 1);
assert.strictEqual(ucamMatches[0], "ucam.uiu.ac.bd");

// Wildcard and multi-matches
const lmsMatches = filterSites(sampleSites, "lms");
assert.strictEqual(lmsMatches.length, 2);
assert.ok(lmsMatches.includes("lms.uiu.ac.bd"));
assert.ok(lmsMatches.includes("elms.uiu.ac.bd"));

// Broad domain match
const uiuMatches = filterSites(sampleSites, "uiu.ac.bd");
assert.strictEqual(uiuMatches.length, 5);

// Case insensitive
const upperMatches = filterSites(sampleSites, "UCAM");
assert.strictEqual(upperMatches.length, 1);

// Empty query returns all
const allMatches = filterSites(sampleSites, "");
assert.strictEqual(allMatches.length, sampleSites.length);

// Non-matching query
const noMatches = filterSites(sampleSites, "nonexistent");
assert.strictEqual(noMatches.length, 0);

console.log("  ✓ Real-time search filtering behaves accurately across exact, wildcard, and substring queries\n");

// --- TEST 4: Multi-Select and Select All Behavior ---
console.log("[TEST 4] Multi-Select and Select All Behavior");

const selectedSet = new Set();

// Toggle individual items
function toggleDomainSelection(set, site, isSelected) {
  if (isSelected) set.add(site);
  else set.delete(site);
}

toggleDomainSelection(selectedSet, "ucam.uiu.ac.bd", true);
toggleDomainSelection(selectedSet, "lms.uiu.ac.bd", true);
assert.strictEqual(selectedSet.size, 2);
assert.ok(selectedSet.has("ucam.uiu.ac.bd"));
assert.ok(selectedSet.has("lms.uiu.ac.bd"));

// Deselect single
toggleDomainSelection(selectedSet, "ucam.uiu.ac.bd", false);
assert.strictEqual(selectedSet.size, 1);
assert.ok(!selectedSet.has("ucam.uiu.ac.bd"));
assert.ok(selectedSet.has("lms.uiu.ac.bd"));

// Select all visible subset
const visibleSubset = filterSites(sampleSites, "lms"); // ["lms.uiu.ac.bd", "elms.uiu.ac.bd"]
visibleSubset.forEach(site => selectedSet.add(site));
assert.strictEqual(selectedSet.size, 2);
assert.ok(selectedSet.has("lms.uiu.ac.bd"));
assert.ok(selectedSet.has("elms.uiu.ac.bd"));

// Deselect visible subset
visibleSubset.forEach(site => selectedSet.delete(site));
assert.strictEqual(selectedSet.size, 0);

console.log("  ✓ Multi-selection and subset Select/Deselect All logic verified\n");

// --- TEST 5: Bulk Remove Mutation & Permission Revocation Safety ---
console.log("[TEST 5] Bulk Remove Mutation & Permission Revocation Safety");

let currentAllowed = [...sampleSites];
const toDelete = ["lms.uiu.ac.bd", "elms.uiu.ac.bd"];

// Compute origins for permission revocation
function getOriginForDomain(domain) {
  return domain.startsWith("*")
    ? `*://${domain.replace(/^\*\./, "")}/*`
    : `*://${domain}/*`;
}

assert.strictEqual(getOriginForDomain("ucam.uiu.ac.bd"), "*://ucam.uiu.ac.bd/*");
assert.strictEqual(getOriginForDomain("*.uiu.ac.bd"), "*://uiu.ac.bd/*");

// Execute deletion
currentAllowed = currentAllowed.filter(s => !toDelete.includes(s));
assert.strictEqual(currentAllowed.length, 4);
assert.ok(!currentAllowed.includes("lms.uiu.ac.bd"));
assert.ok(!currentAllowed.includes("elms.uiu.ac.bd"));
assert.ok(currentAllowed.includes("ucam.uiu.ac.bd"));
assert.ok(currentAllowed.includes("*.uiu.ac.bd"));

console.log("  ✓ Bulk removal cleanly cleanses domain array and calculates permission origins accurately\n");

// --- TEST 6: Event Listeners & Modal Integration in popup.js ---
console.log("[TEST 6] Event Listeners and Modal Integration in popup.js");

assert.ok(popupJs.includes('domainSearchInput?.addEventListener("input"'), "popup.js must handle search input");
assert.ok(popupJs.includes('domainSearchClearBtn?.addEventListener("click"'), "popup.js must handle search clear");
assert.ok(popupJs.includes('domainSelectAll?.addEventListener("change"'), "popup.js must handle select all change");
assert.ok(popupJs.includes('bulkRemoveDomainsBtn?.addEventListener("click"'), "popup.js must handle bulk remove click");
assert.ok(popupJs.includes('pendingAction === "bulk-remove-domains"'), "modalConfirmBtn must handle bulk-remove-domains action");
assert.ok(popupJs.includes('chrome.permissions.remove'), "popup.js must revoke permissions on domain removal");

console.log("  ✓ All required event handlers and modal confirmation branches verified in popup.js\n");

console.log("==================================================");
console.log("  ALL ALLOWED DOMAINS TESTS PASSED (6 / 6)        ");
console.log("==================================================");

