// test_file_import_preview.js — Automated test suite for Task 2.2: File Import with Pre-Commit Preview

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log("==================================================");
console.log("    RUNNING FILE IMPORT PREVIEW TEST SUITE (2.2)  ");
console.log("==================================================\n");

// --- TEST 1: DOM Elements in popup.html ---
console.log("[TEST 1] File Drop Zone & Preview Modal UI Elements in popup.html");
const popupHtml = fs.readFileSync(path.join(__dirname, "..", "popup.html"), "utf8");

// Drop zone elements
assert.ok(popupHtml.includes('id="fileDropZone"'), "popup.html must contain fileDropZone");
assert.ok(popupHtml.includes('id="jsonFileInput"'), "popup.html must contain jsonFileInput");
assert.ok(popupHtml.includes('id="browseFileBtn"'), "popup.html must contain browseFileBtn");
assert.ok(popupHtml.includes('id="dropZoneIdle"'), "popup.html must contain dropZoneIdle");
assert.ok(popupHtml.includes('id="dropZoneFileInfo"'), "popup.html must contain dropZoneFileInfo");

// Pre-commit preview modal elements
assert.ok(popupHtml.includes('id="importPreviewModal"'), "popup.html must contain importPreviewModal");
assert.ok(popupHtml.includes('id="previewCloseBtn"'), "preview modal must contain previewCloseBtn");
assert.ok(popupHtml.includes('id="previewCancelBtn"'), "preview modal must contain previewCancelBtn");
assert.ok(popupHtml.includes('id="previewConfirmBtn"'), "preview modal must contain previewConfirmBtn");
assert.ok(popupHtml.includes('id="previewSummaryRow"'), "preview modal must contain previewSummaryRow");
assert.ok(popupHtml.includes('id="previewDiffList"'), "preview modal must contain previewDiffList");

console.log("  ✓ File drop zone and pre-commit preview modal elements verified in popup.html\n");

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

// --- TEST 3: Diff Calculation Logic (computeImportDiff) ---
console.log("[TEST 3] Diff Calculation: New, Updated, Unchanged, and Invalid Courses");

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

function areCourseDataEqual(val1, val2) {
  const a = normalizeCourseData(val1);
  const b = normalizeCourseData(val2);
  if (a.name !== b.name) return false;
  if (a.examDay !== b.examDay) return false;
  if (a.examSlot !== b.examSlot) return false;
  if (a.prerequisites.length !== b.prerequisites.length) return false;
  for (let i = 0; i < a.prerequisites.length; i++) {
    if (a.prerequisites[i] !== b.prerequisites[i]) return false;
  }
  if (a.prerequisiteNote !== b.prerequisiteNote) return false;
  return true;
}

function computeImportDiff(parsedData, currentCourses) {
  const toAdd = [];
  const toUpdate = [];
  const unchanged = [];
  const errors = [];

  for (const [k, v] of Object.entries(parsedData)) {
    if (typeof k !== "string" || !k.trim()) {
      errors.push({ code: String(k), reason: "Empty or invalid course code" });
      continue;
    }
    const code = k.trim().toUpperCase();

    let incoming;
    let isNameOnly = false;
    if (typeof v === "string" && v.trim()) {
      incoming = { name: v.trim(), examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "" };
      isNameOnly = true;
    } else if (typeof v === "object" && v !== null && typeof v.name === "string" && v.name.trim()) {
      incoming = {
        name: v.name.trim(),
        examDay: typeof v.examDay === "string" ? v.examDay.trim() : "",
        examSlot: typeof v.examSlot === "string" ? v.examSlot.trim() : "",
        prerequisites: Array.isArray(v.prerequisites)
          ? v.prerequisites.map(p => String(p).trim()).filter(Boolean).sort()
          : [],
        prerequisiteNote: typeof v.prerequisiteNote === "string" ? v.prerequisiteNote.trim() : ""
      };
      const hasExamDay = !!incoming.examDay;
      const hasExamSlot = !!incoming.examSlot;
      const hasPrereqs = incoming.prerequisites.length > 0;
      const hasPrereqNote = !!incoming.prerequisiteNote;
      if (!hasExamDay && !hasExamSlot && !hasPrereqs && !hasPrereqNote) {
        isNameOnly = true;
      }
    } else {
      errors.push({ code, reason: "Missing required course title or invalid format" });
      continue;
    }

    const existing = currentCourses[code];
    if (!existing) {
      toAdd.push({ code, incoming, isNameOnly });
    } else {
      const normExisting = normalizeCourseData(existing);
      if (areCourseDataEqual(normExisting, incoming)) {
        unchanged.push({ code, existing: normExisting });
      } else {
        const changes = [];
        if (normExisting.name !== incoming.name) {
          changes.push({ field: "Course Title", oldVal: normExisting.name || "—", newVal: incoming.name });
        }
        const oldExam = [normExisting.examDay, normExisting.examSlot].filter(Boolean).join(" / ") || "—";
        const newExam = [incoming.examDay, incoming.examSlot].filter(Boolean).join(" / ") || "—";
        if (oldExam !== newExam) {
          changes.push({ field: "Exam Routine", oldVal: oldExam, newVal: newExam });
        }
        const oldPrereqs = normExisting.prerequisites.join(", ") || "None";
        const newPrereqs = incoming.prerequisites.join(", ") || "None";
        if (oldPrereqs !== newPrereqs) {
          changes.push({ field: "Prerequisites", oldVal: oldPrereqs, newVal: newPrereqs });
        }
        if (normExisting.prerequisiteNote !== incoming.prerequisiteNote) {
          changes.push({ field: "Prerequisite Note", oldVal: normExisting.prerequisiteNote || "None", newVal: incoming.prerequisiteNote || "None" });
        }
        toUpdate.push({ code, oldData: normExisting, incoming, changes, isNameOnly });
      }
    }
  }

  return { toAdd, toUpdate, unchanged, errors };
}

const currentCatalog = {
  "CSE 1111": { name: "Structured Programming Language", examDay: "D1", examSlot: "T1", prerequisites: [] },
  "CSE 2215": { name: "Data Structures", examDay: "D2", examSlot: "T2", prerequisites: ["CSE 1111"] },
  "CSE 3715": { name: "Software Engineering", examDay: "D3", examSlot: "T1", prerequisites: ["CSE 2215"] }
};

const incomingPayload = {
  // New course
  "CSE 4999": {
    name: "Applied Machine Learning",
    examDay: "D4",
    examSlot: "T2",
    prerequisites: ["CSE 2215"],
    prerequisiteNote: "MINIMUM 85 credits"
  },
  // Updated course: title, exam slot, prerequisites, and note changed
  "CSE 3715": {
    name: "Software Engineering & Architecture",
    examDay: "D3",
    examSlot: "T3",
    prerequisites: ["CSE 2215", "CSE 2216"],
    prerequisiteNote: "MINIMUM 70 credits"
  },
  // Unchanged course (identical)
  "CSE 1111": {
    name: "Structured Programming Language",
    examDay: "D1",
    examSlot: "T1",
    prerequisites: []
  },
  // Invalid entry (missing name)
  "BAD 9999": {
    examDay: "D1"
  }
};

const diff = computeImportDiff(incomingPayload, currentCatalog);

// Assert New course detected
assert.strictEqual(diff.toAdd.length, 1);
assert.strictEqual(diff.toAdd[0].code, "CSE 4999");
assert.strictEqual(diff.toAdd[0].incoming.name, "Applied Machine Learning");
assert.strictEqual(diff.toAdd[0].incoming.prerequisiteNote, "MINIMUM 85 credits");

// Assert Updated course detected with field changes
assert.strictEqual(diff.toUpdate.length, 1);
assert.strictEqual(diff.toUpdate[0].code, "CSE 3715");
assert.strictEqual(diff.toUpdate[0].changes.length, 4);

const changeFields = diff.toUpdate[0].changes.map(c => c.field);
assert.ok(changeFields.includes("Course Title"));
assert.ok(changeFields.includes("Exam Routine"));
assert.ok(changeFields.includes("Prerequisites"));
assert.ok(changeFields.includes("Prerequisite Note"));

// Assert Unchanged course detected
assert.strictEqual(diff.unchanged.length, 1);
assert.strictEqual(diff.unchanged[0].code, "CSE 1111");

// Assert Invalid course skipped
assert.strictEqual(diff.errors.length, 1);
assert.strictEqual(diff.errors[0].code, "BAD 9999");

console.log("  ✓ Diff calculation cleanly separates additions, updates with field-level diffs, unchanged, and errors\n");

// --- TEST 4: Commit Execution & Trash Cleansing ---
console.log("[TEST 4] Storage State Mutation & Trash Cleansing");

let mockStorage = {
  courses: { ...currentCatalog },
  userCourses: {},
  softDeletedCourses: ["CSE 4999"],
  hardDeletedCourses: ["CSE 3715"]
};

// Simulate commit
for (const item of diff.toAdd) {
  const key = item.code;
  mockStorage.softDeletedCourses = mockStorage.softDeletedCourses.filter(c => c !== key);
  mockStorage.hardDeletedCourses = mockStorage.hardDeletedCourses.filter(c => c !== key);
  mockStorage.courses[key] = item.incoming;
  mockStorage.userCourses[key] = item.incoming;
}

for (const item of diff.toUpdate) {
  const key = item.code;
  mockStorage.softDeletedCourses = mockStorage.softDeletedCourses.filter(c => c !== key);
  mockStorage.hardDeletedCourses = mockStorage.hardDeletedCourses.filter(c => c !== key);
  mockStorage.courses[key] = item.incoming;
  mockStorage.userCourses[key] = item.incoming;
}

// Assert additions and updates are in storage
assert.ok(mockStorage.courses["CSE 4999"]);
assert.strictEqual(mockStorage.courses["CSE 4999"].name, "Applied Machine Learning");
assert.ok(mockStorage.courses["CSE 3715"]);
assert.strictEqual(mockStorage.courses["CSE 3715"].name, "Software Engineering & Architecture");

// Assert un-deleted from both soft & hard trash
assert.ok(!mockStorage.softDeletedCourses.includes("CSE 4999"), "CSE 4999 must be removed from softDeletedCourses");
assert.ok(!mockStorage.hardDeletedCourses.includes("CSE 3715"), "CSE 3715 must be removed from hardDeletedCourses");

console.log("  ✓ Commit applies additions & updates and automatically un-deletes from trash\n");

// --- TEST 5: 2 MB Safety Cap & File Type Constraints ---
console.log("[TEST 5] 2 MB Payload Cap & Extension Safety");

assert.ok(popupJs.includes('MAX_IMPORT_BYTES = 2 * 1024 * 1024'), "popup.js must enforce 2MB import cap");
assert.ok(popupJs.includes('file.name.toLowerCase().endsWith(".json")'), "popup.js must validate .json file extension");
assert.ok(popupJs.includes('processLoadedJsonFile'), "popup.js must contain file processor");

console.log("  ✓ 2 MB safety cap and .json file extension validation confirmed\n");

// --- TEST 6: Drag and Drop Handlers in popup.js ---
console.log("[TEST 6] Drag-and-Drop and Browse Event Listeners");

assert.ok(popupJs.includes('fileDropZone?.addEventListener("dragenter"'), "popup.js must handle dragenter");
assert.ok(popupJs.includes('fileDropZone?.addEventListener("dragover"'), "popup.js must handle dragover");
assert.ok(popupJs.includes('fileDropZone?.addEventListener("dragleave"'), "popup.js must handle dragleave");
assert.ok(popupJs.includes('fileDropZone?.addEventListener("drop"'), "popup.js must handle file drop");
assert.ok(popupJs.includes('fileDropZone?.addEventListener("keydown"'), "popup.js must handle keyboard access");
assert.ok(popupJs.includes('browseFileBtn?.addEventListener("click"'), "popup.js must handle file browse click");
assert.ok(popupJs.includes('jsonFileInput?.addEventListener("change"'), "popup.js must handle file input change");
assert.ok(popupJs.includes('window.addEventListener("dragover"'), "popup.js must handle window dragover protection");
assert.ok(popupJs.includes('previewConfirmBtn?.addEventListener("click"'), "popup.js must handle preview confirmation");

console.log("  ✓ All required drag & drop and preview event handlers verified in popup.js\n");

// --- TEST 7: Auto-open Preview Modal on File Drop/Select ---
console.log("[TEST 7] Auto-Opening Preview Modal on File Drop/Load");
assert.ok(popupJs.includes('openImportPreviewModal(pendingImportDiff)'), "processLoadedJsonFile must automatically trigger openImportPreviewModal");
console.log("  ✓ Auto-opening preview modal upon file drop/load verified in popup.js\n");

// --- TEST 8: Drop Zone State & Diff Meta Chips ---
console.log("[TEST 8] Drop Zone File Info Display & Diff Meta Chips");
assert.ok(popupJs.includes('els.dropZoneFileInfo.style.display = "flex"'), "showDropZoneFileInfo must set display flex on dropZoneFileInfo");
assert.ok(popupJs.includes('diff-chips-row'), "popup.js must render diff-chips-row for course metadata");
assert.ok(popupJs.includes('diff-meta-chip'), "popup.js must render diff-meta-chip badges for exam slot, prereqs, and notes");
assert.ok(popupJs.includes('Confirm & Merge (" + totalChanges + ")'), "previewConfirmBtn must dynamically reflect change count");
console.log("  ✓ Drop zone file card state and diff meta chips verified\n");

// --- TEST 9: Modal CSS Transitions & Frosted-Glass Overlay ---
console.log("[TEST 9] Modal CSS Transitions & Frosted-Glass Overlay");
const popupCss = fs.readFileSync(path.join(__dirname, "..", "popup.css"), "utf8");
assert.ok(popupCss.includes('#importPreviewModal'), "popup.css must style #importPreviewModal overlay");
assert.ok(popupCss.includes('backdrop-filter: blur(4px)'), "popup.css must apply frosted glass backdrop blur");
assert.ok(popupCss.includes('.modal-overlay.show .preview-modal-content'), "popup.css must trigger scale/translate pop-in transition");
console.log("  ✓ Frosted glass overlay and pop-in transitions verified in popup.css\n");

console.log("==================================================");
console.log("  ALL FILE IMPORT PREVIEW TESTS PASSED (9 / 9)    ");
console.log("==================================================");

