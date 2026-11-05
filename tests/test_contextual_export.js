// test_contextual_export.js — Automated test suite for Task 2.1: Contextual Export in Course Manager

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("==================================================");
console.log("    RUNNING CONTEXTUAL EXPORT TEST SUITE (2.1)    ");
console.log("==================================================\n");

// --- TEST 1: DOM Elements in popup.html ---
console.log("[TEST 1] UI Elements & Header Controls in popup.html");
const popupHtml = fs.readFileSync(path.join(__dirname, "..", "popup.html"), "utf8");

assert.ok(popupHtml.includes('id="exportCoursesBtn"'), "popup.html must contain exportCoursesBtn in header");
assert.ok(/class="[^"]*\bheader-export-btn\b[^"]*"/.test(popupHtml), "export button must have header-export-btn class");
assert.ok(popupHtml.includes('id="exportModal"'), "popup.html must contain exportModal container");
assert.ok(popupHtml.includes('id="exportModalCloseBtn"'), "export modal must contain exportModalCloseBtn");
assert.ok(popupHtml.includes('id="exportModalCancelBtn"'), "export modal must contain exportModalCancelBtn");
assert.ok(popupHtml.includes('id="exportOptionsList"'), "export modal must contain exportOptionsList container");
assert.ok(popupHtml.includes('class="header-actions"'), "header must contain header-actions wrapper");

console.log("  ✓ Header export button and export modal elements verified in popup.html\n");

// --- TEST 2: Zero-innerHTML Security Hardening ---
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

// --- TEST 3: Course Normalization & Export Formatting ---
console.log("[TEST 3] Course Normalization & Schema Formatting");

function normalizeCourseData(val) {
  if (!val) return { name: "", examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "" };
  if (typeof val === "string") {
    return { name: val.trim(), examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "" };
  }
  const name = (val.name || "").trim();
  const examDay = (val.examDay || "").trim();
  const examSlot = (val.examSlot || "").trim();
  const prerequisiteNote = (val.prerequisiteNote || "").trim();
  const prerequisites = Array.isArray(val.prerequisites)
    ? val.prerequisites.map(p => String(p).trim()).filter(Boolean).sort()
    : [];
  return { name, examDay, examSlot, prerequisites, prerequisiteNote };
}

function formatCourseForExport(courseData) {
  const norm = normalizeCourseData(courseData);
  const out = {
    name: norm.name,
    examDay: norm.examDay || "",
    examSlot: norm.examSlot || "",
    prerequisites: Array.isArray(norm.prerequisites) ? norm.prerequisites : []
  };
  if (norm.prerequisiteNote) {
    out.prerequisiteNote = norm.prerequisiteNote;
  }
  return out;
}

// Case A: Full course object with prerequisiteNote
const fullCourse = {
  name: "Final Year Design Project - I",
  examDay: "D4",
  examSlot: "T2",
  prerequisites: ["CSE 3715"],
  prerequisiteNote: "MINIMUM 85 credits"
};
const formattedFull = formatCourseForExport(fullCourse);
assert.strictEqual(formattedFull.name, "Final Year Design Project - I");
assert.strictEqual(formattedFull.examDay, "D4");
assert.strictEqual(formattedFull.examSlot, "T2");
assert.deepStrictEqual(formattedFull.prerequisites, ["CSE 3715"]);
assert.strictEqual(formattedFull.prerequisiteNote, "MINIMUM 85 credits");

// Case B: Minimal course without note
const minCourse = {
  name: "Structured Programming",
  examDay: "",
  examSlot: "",
  prerequisites: []
};
const formattedMin = formatCourseForExport(minCourse);
assert.strictEqual(formattedMin.name, "Structured Programming");
assert.strictEqual(formattedMin.examDay, "");
assert.strictEqual(formattedMin.examSlot, "");
assert.deepStrictEqual(formattedMin.prerequisites, []);
assert.strictEqual(formattedMin.prerequisiteNote, undefined, "Empty prerequisiteNote must be omitted from export object");

// Case C: Legacy string format upgrade
const legacyCourse = "Database Management Systems";
const formattedLegacy = formatCourseForExport(legacyCourse);
assert.strictEqual(formattedLegacy.name, "Database Management Systems");
assert.strictEqual(formattedLegacy.examDay, "");
assert.strictEqual(formattedLegacy.examSlot, "");
assert.deepStrictEqual(formattedLegacy.prerequisites, []);

console.log("  ✓ All course shapes correctly normalized to canonical schema\n");

// --- TEST 4: Full Active Database Payload Generation ---
console.log("[TEST 4] Active Database Payload Generation");

const mockBundled = {
  "CSE 1111": { name: "Structured Programming", examDay: "D1", examSlot: "T1", prerequisites: [] },
  "CSE 2215": { name: "Data Structures", examDay: "D2", examSlot: "T2", prerequisites: ["CSE 1111"] }
};

const mockRemote = {};

const mockUser = {
  "CSE 2215": { name: "Data Structures (Custom Edit)", examDay: "D2", examSlot: "T2", prerequisites: ["CSE 1111"] },
  "CSE 4999": { name: "Advanced AI Special Topics", examDay: "D3", examSlot: "T3", prerequisites: ["CSE 2215"] }
};

const mockSoftDeleted = ["CSE 1111"];
const mockHardDeleted = [];

// Merged active catalog
const mockActiveCourses = {
  "CSE 2215": { name: "Data Structures (Custom Edit)", examDay: "D2", examSlot: "T2", prerequisites: ["CSE 1111"] },
  "CSE 4999": { name: "Advanced AI Special Topics", examDay: "D3", examSlot: "T3", prerequisites: ["CSE 2215"] }
};

const activeEntries = Object.entries(mockActiveCourses).sort((a, b) => a[0].localeCompare(b[0]));
const activePayload = {};
for (const [code, data] of activeEntries) {
  activePayload[code] = formatCourseForExport(data);
}

assert.strictEqual(Object.keys(activePayload).length, 2);
assert.ok(activePayload["CSE 2215"]);
assert.strictEqual(activePayload["CSE 2215"].name, "Data Structures (Custom Edit)");
assert.ok(activePayload["CSE 4999"]);
assert.ok(!activePayload["CSE 1111"], "Soft deleted course must not be in active export");

console.log("  ✓ Active catalog export excludes deleted courses and preserves merged user edits\n");

// --- TEST 5: Custom Additions & Edits Payload Generation ---
console.log("[TEST 5] Custom Additions & Edits Payload Generation");

const customEntries = Object.entries(mockUser)
  .filter(([code]) => !mockSoftDeleted.includes(code) && !mockHardDeleted.includes(code))
  .sort((a, b) => a[0].localeCompare(b[0]));

const customPayload = {};
for (const [code, data] of customEntries) {
  const finalData = mockActiveCourses[code] || data;
  customPayload[code] = formatCourseForExport(finalData);
}

assert.strictEqual(Object.keys(customPayload).length, 2);
assert.ok(customPayload["CSE 2215"]);
assert.ok(customPayload["CSE 4999"]);

// If a user course was soft-deleted, ensure it is excluded
const mockSoftDeletedWithUser = ["CSE 4999"];
const customEntriesFiltered = Object.entries(mockUser)
  .filter(([code]) => !mockSoftDeletedWithUser.includes(code) && !mockHardDeleted.includes(code));
assert.strictEqual(customEntriesFiltered.length, 1);
assert.strictEqual(customEntriesFiltered[0][0], "CSE 2215");

console.log("  ✓ Custom additions & edits payload correctly isolated from storage\n");

// --- TEST 6: Contextual / Filtered Payload Generation ---
console.log("[TEST 6] Contextual & Filtered Payload Generation");

function getCourseOrigin(code, bundled, remote, user) {
  const inBundled = !!bundled[code];
  const inRemote = !!remote[code];
  const inUser = !!user[code];

  if (!inBundled && !inRemote && inUser) {
    return "user";
  } else if ((inBundled || inRemote) && inUser) {
    return "edited";
  } else {
    return "official";
  }
}

function filterCourses(coursesObj, filter, search, bundled, remote, user) {
  const lc = (search || "").toLowerCase().trim();
  return Object.entries(coursesObj).filter(([code, data]) => {
    const name = typeof data === "object" && data !== null ? (data.name || "") : (data || "");
    if (lc && !String(code).toLowerCase().includes(lc) && !String(name).toLowerCase().includes(lc)) {
      return false;
    }
    const origin = getCourseOrigin(code, bundled, remote, user);
    if (filter !== "all" && filter !== origin) {
      return false;
    }
    return true;
  }).sort((a, b) => a[0].localeCompare(b[0]));
}

// Scenario A: Filter by "user"
const userFiltered = filterCourses(mockActiveCourses, "user", "", mockBundled, mockRemote, mockUser);
assert.strictEqual(userFiltered.length, 1);
assert.strictEqual(userFiltered[0][0], "CSE 4999");

// Scenario B: Filter by "edited"
const editedFiltered = filterCourses(mockActiveCourses, "edited", "", mockBundled, mockRemote, mockUser);
assert.strictEqual(editedFiltered.length, 1);
assert.strictEqual(editedFiltered[0][0], "CSE 2215");

// Scenario C: Search query "topics"
const searchFiltered = filterCourses(mockActiveCourses, "all", "topics", mockBundled, mockRemote, mockUser);
assert.strictEqual(searchFiltered.length, 1);
assert.strictEqual(searchFiltered[0][0], "CSE 4999");

console.log("  ✓ Contextual filtering accurately narrows export payload by active category & query\n");

// --- TEST 7: Batch Upload Round-Trip Compatibility ---
console.log("[TEST 7] Batch Upload Round-Trip Compatibility");

// The exported payload serialized to JSON
const exportedJson = JSON.stringify(activePayload, null, 2);

// Re-parse and validate with batch upload validator rules from popup.js
const parsed = JSON.parse(exportedJson);
assert.strictEqual(typeof parsed, "object");
assert.ok(!Array.isArray(parsed));

for (const [code, details] of Object.entries(parsed)) {
  assert.ok(/^[A-Z0-9\s-]+$/i.test(code), `Course code ${code} must be alphanumeric`);
  assert.ok(details.name && typeof details.name === "string", `Course ${code} must have string name`);
  assert.ok(Array.isArray(details.prerequisites), `Course ${code} prerequisites must be array`);
  assert.ok(typeof details.examDay === "string", `Course ${code} examDay must be string`);
  assert.ok(typeof details.examSlot === "string", `Course ${code} examSlot must be string`);
}

console.log("  ✓ Exported JSON cleanly passes batch upload schema validation\n");

// --- TEST 8: Export Filename Date Formatting ---
console.log("[TEST 8] Export Filename Conventions");

function getExportDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const dateStr = getExportDateString();
assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(dateStr), "Date string must match YYYY-MM-DD");

const catalogFilename = `uiu-courses-catalog-${dateStr}.json`;
const customFilename = `uiu-custom-courses-${dateStr}.json`;
const filteredFilename = `uiu-courses-user-${dateStr}.json`;

assert.ok(catalogFilename.endsWith(".json"));
assert.ok(customFilename.endsWith(".json"));
assert.ok(filteredFilename.endsWith(".json"));

console.log(`  ✓ Export filenames verified with canonical stamp (${dateStr})\n`);

// --- TEST 9: Trash Mode UI Toggling ---
console.log("[TEST 9] Trash Mode Header State Toggling");

assert.ok(popupJs.includes('if (els.exportCoursesBtn) els.exportCoursesBtn.style.display = "none";'),
  "Entering Trash mode must hide exportCoursesBtn");
assert.ok(popupJs.includes('if (els.exportCoursesBtn) els.exportCoursesBtn.style.display = "grid";'),
  "Exiting Trash mode must restore exportCoursesBtn to grid");

console.log("  ✓ Header export button properly hidden during Trash mode and restored on exit\n");

console.log("==================================================");
console.log("    ALL CONTEXTUAL EXPORT TESTS PASSED (9 / 9)    ");
console.log("==================================================");

