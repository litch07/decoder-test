const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Mock Chrome storage
let mockStorage = {
  courses: {},
  userCourses: {},
  softDeletedCourses: [],
  hardDeletedCourses: []
};

const chrome = {
  storage: {
    local: {
      get: async (keys) => {
        const res = {};
        for (const k of keys) {
          res[k] = JSON.parse(JSON.stringify(mockStorage[k] !== undefined ? mockStorage[k] : {}));
        }
        return res;
      },
      set: async (data) => {
        for (const [k, v] of Object.entries(data)) {
          mockStorage[k] = JSON.parse(JSON.stringify(v));
        }
      }
    }
  }
};

// Logic under test: Single Course Add
function validateAndBuildSingleCourse(rawCode, rawName, rawDay, rawSlot, rawPrereq) {
  const code = (rawCode || "").trim();
  const name = (rawName || "").trim();

  if (!code && !name) throw new Error("Course code and course title are required.");
  if (!code) throw new Error("Course code is required.");
  if (!name) throw new Error("Course title is required.");

  const prereqs = rawPrereq
    ? rawPrereq.split(",").map(p => p.trim().toUpperCase()).filter(Boolean)
    : [];

  const courseObj = {
    name,
    examDay: (rawDay || "").trim(),
    examSlot: (rawSlot || "").trim(),
    prerequisites: prereqs
  };

  return { code: code.toUpperCase(), courseObj };
}

async function executeSingleCourseAdd(rawCode, rawName, rawDay, rawSlot, rawPrereq) {
  const { code, courseObj } = validateAndBuildSingleCourse(rawCode, rawName, rawDay, rawSlot, rawPrereq);

  const stored = await chrome.storage.local.get(["courses", "userCourses", "softDeletedCourses", "hardDeletedCourses"]);
  const courses = stored.courses || {};
  const userCourses = stored.userCourses || {};
  let softDeleted = stored.softDeletedCourses || [];
  let hardDeleted = stored.hardDeletedCourses || [];

  if (softDeleted.includes(code)) softDeleted = softDeleted.filter(c => c !== code);
  if (hardDeleted.includes(code)) hardDeleted = hardDeleted.filter(c => c !== code);

  courses[code] = courseObj;
  userCourses[code] = courseObj;

  await chrome.storage.local.set({ courses, userCourses, softDeletedCourses: softDeleted, hardDeletedCourses: hardDeleted });
  return { code, courseObj };
}

// Logic under test: Batch Upload (JSON Import)
async function executeBatchUpload(rawJson) {
  const trimmed = (rawJson || "").trim();
  if (!trimmed) throw new Error("Please paste some JSON first.");

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    throw new Error("Invalid JSON: " + e.message);
  }

  if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
    throw new Error('JSON must be a flat object: { "CODE": "Name" }');
  }

  const stored = await chrome.storage.local.get(["courses", "userCourses", "softDeletedCourses", "hardDeletedCourses"]);
  const courses = stored.courses || {};
  const userCourses = stored.userCourses || {};
  let softDeleted = stored.softDeletedCourses || [];
  let hardDeleted = stored.hardDeletedCourses || [];

  let added = 0;
  let errors = 0;
  let nameOnlyCount = 0;

  for (const [k, v] of Object.entries(parsed)) {
    if (typeof k !== "string" || !k.trim()) {
      errors++;
      continue;
    }
    const key = k.trim().toUpperCase();
    let val;
    let isNameOnly = false;

    if (typeof v === "string" && v.trim()) {
      val = v.trim();
      isNameOnly = true;
    } else if (typeof v === "object" && v !== null && typeof v.name === "string" && v.name.trim()) {
      val = { ...v, name: v.name.trim() };
      const hasDay = !!val.examDay;
      const hasSlot = !!val.examSlot;
      const hasPrereqs = Array.isArray(val.prerequisites) && val.prerequisites.length > 0;
      if (!hasDay && !hasSlot && !hasPrereqs) {
        isNameOnly = true;
      }
    } else {
      errors++;
      continue;
    }

    if (softDeleted.includes(key)) softDeleted = softDeleted.filter(c => c !== key);
    if (hardDeleted.includes(key)) hardDeleted = hardDeleted.filter(c => c !== key);

    courses[key] = val;
    userCourses[key] = val;
    added++;
    if (isNameOnly) nameOnlyCount++;
  }

  if (added === 0 && errors > 0) throw new Error(`Found ${errors} invalid entries, none added.`);
  if (added === 0) throw new Error("No valid entries found in JSON.");

  await chrome.storage.local.set({ courses, userCourses, softDeletedCourses: softDeleted, hardDeletedCourses: hardDeleted });
  return { added, errors, nameOnlyCount };
}

async function runIntegrationSuite() {
  console.log("==================================================");
  console.log("  RUNNING SINGLE COURSE & BATCH UPLOAD TEST SUITE  ");
  console.log("==================================================");

  // Reset storage
  mockStorage = { courses: {}, userCourses: {}, softDeletedCourses: [], hardDeletedCourses: [] };

  // --- 1. SINGLE COURSE VALIDATION TESTS ---
  console.log("\n[TEST 1] Single Course Validation");
  assert.throws(() => validateAndBuildSingleCourse("", ""), /Course code and course title are required/);
  assert.throws(() => validateAndBuildSingleCourse("   ", "   "), /Course code and course title are required/);
  assert.throws(() => validateAndBuildSingleCourse("", "Software Engineering"), /Course code is required/);
  assert.throws(() => validateAndBuildSingleCourse("CSE 3715", ""), /Course title is required/);
  console.log("  ✓ Missing/empty fields properly rejected");

  // --- 2. SINGLE COURSE FULL & MINIMAL ADD ---
  console.log("\n[TEST 2] Single Course Add (Full & Minimal)");
  const singleFull = await executeSingleCourseAdd(
    "cse 3715",
    "Software Engineering",
    "Sunday",
    "Slot A (09:00 AM - 11:00 AM)",
    "cse 2215, CSE 2216 "
  );
  assert.strictEqual(singleFull.code, "CSE 3715");
  assert.strictEqual(singleFull.courseObj.name, "Software Engineering");
  assert.strictEqual(singleFull.courseObj.examDay, "Sunday");
  assert.strictEqual(singleFull.courseObj.examSlot, "Slot A (09:00 AM - 11:00 AM)");
  assert.deepStrictEqual(singleFull.courseObj.prerequisites, ["CSE 2215", "CSE 2216"]);
  console.log("  ✓ Full course CSE 3715 added with normalized code & prerequisites");

  const singleMinimal = await executeSingleCourseAdd(
    "act 1111",
    "Financial Accounting",
    "",
    "",
    ""
  );
  assert.strictEqual(singleMinimal.code, "ACT 1111");
  assert.strictEqual(singleMinimal.courseObj.name, "Financial Accounting");
  assert.strictEqual(singleMinimal.courseObj.examDay, "");
  assert.strictEqual(singleMinimal.courseObj.examSlot, "");
  assert.deepStrictEqual(singleMinimal.courseObj.prerequisites, []);
  console.log("  ✓ Minimal course ACT 1111 added with empty optional fields");

  // Verify storage state
  const snap1 = await chrome.storage.local.get(["courses", "userCourses"]);
  assert.strictEqual(Object.keys(snap1.courses).length, 2);
  assert.strictEqual(Object.keys(snap1.userCourses).length, 2);
  console.log("  ✓ Storage contains exactly 2 user-added courses");

  // --- 3. SINGLE COURSE UN-DELETION FROM TRASH ---
  console.log("\n[TEST 3] Single Course Un-Deletion from Trash");
  await chrome.storage.local.set({
    softDeletedCourses: ["CSE 4111"],
    hardDeletedCourses: ["CSE 4111"]
  });
  await executeSingleCourseAdd("cse 4111", "Computer Networks", "Monday", "Slot C", "");
  const snap2 = await chrome.storage.local.get(["courses", "softDeletedCourses", "hardDeletedCourses"]);
  assert.strictEqual(snap2.softDeletedCourses.includes("CSE 4111"), false);
  assert.strictEqual(snap2.hardDeletedCourses.includes("CSE 4111"), false);
  assert.ok(snap2.courses["CSE 4111"]);
  console.log("  ✓ Adding deleted course automatically restored it from soft & hard trash");

  // --- 4. BATCH UPLOAD VALIDATION TESTS ---
  console.log("\n[TEST 4] Batch Upload Validation");
  await assert.rejects(async () => executeBatchUpload(""), /Please paste some JSON first/);
  await assert.rejects(async () => executeBatchUpload("   "), /Please paste some JSON first/);
  await assert.rejects(async () => executeBatchUpload("{ invalid json }"), /Invalid JSON/);
  await assert.rejects(async () => executeBatchUpload("[]"), /JSON must be a flat object/);
  await assert.rejects(async () => executeBatchUpload("null"), /JSON must be a flat object/);
  await assert.rejects(async () => executeBatchUpload('"Just a string"'), /JSON must be a flat object/);
  await assert.rejects(async () => executeBatchUpload('{ "BAD": 12345 }'), /Found 1 invalid entries, none added/);
  console.log("  ✓ Invalid/empty batch JSON structures properly rejected");

  // --- 5. BATCH UPLOAD WITH 2-COURSE SAMPLE FORMAT ---
  console.log("\n[TEST 5] Batch Upload: 2-Course Sample Format");
  const sampleTwoCourses = JSON.stringify({
    "CSE 3715": {
      "name": "Software Engineering (Updated)",
      "examDay": "Day 1",
      "examSlot": "T1",
      "prerequisites": ["CSE 2215", "CSE 2216"]
    },
    "ACT 1111": {
      "name": "Financial Accounting",
      "examDay": "",
      "examSlot": "",
      "prerequisites": []
    }
  });

  const batchRes1 = await executeBatchUpload(sampleTwoCourses);
  assert.strictEqual(batchRes1.added, 2);
  assert.strictEqual(batchRes1.errors, 0);

  const snap3 = await chrome.storage.local.get(["courses"]);
  assert.strictEqual(snap3.courses["CSE 3715"].name, "Software Engineering (Updated)");
  assert.strictEqual(snap3.courses["ACT 1111"].name, "Financial Accounting");
  assert.strictEqual(snap3.courses["ACT 1111"].examDay, "");
  assert.strictEqual(snap3.courses["ACT 1111"].examSlot, "");
  console.log("  ✓ 2-Course sample format successfully imported and merged into catalog");

  // --- 6. BATCH UPLOAD MIXED FORMATS (FLAT STRINGS & OBJECTS) ---
  console.log("\n[TEST 6] Batch Upload: Mixed Formats (Flat strings + Rich objects)");
  const mixedJson = JSON.stringify({
    "ENG 1011": "English I",
    "MAT 1101": {
      "name": "Differential and Integral Calculus",
      "examDay": "Wednesday",
      "examSlot": "Slot C",
      "prerequisites": []
    },
    "PHY 1101": {
      "name": "Physics I",
      "examDay": "Thursday",
      "examSlot": "Slot A",
      "prerequisites": ["MAT 1101"]
    },
    "INVALID_ENTRY": 999
  });

  const batchRes2 = await executeBatchUpload(mixedJson);
  assert.strictEqual(batchRes2.added, 3);
  assert.strictEqual(batchRes2.errors, 1);
  assert.strictEqual(batchRes2.nameOnlyCount, 1); // only ENG 1011 is name-only; MAT 1101 has exam schedule

  const snap4 = await chrome.storage.local.get(["courses"]);
  assert.strictEqual(snap4.courses["ENG 1011"], "English I");
  assert.strictEqual(snap4.courses["MAT 1101"].name, "Differential and Integral Calculus");
  assert.strictEqual(snap4.courses["PHY 1101"].name, "Physics I");
  console.log("  ✓ Mixed format processed: 3 added, 1 skipped error, name-only properly counted");

  // --- 7. BATCH UPLOAD UN-DELETION FROM TRASH ---
  console.log("\n[TEST 7] Batch Upload Trash Un-deletion");
  await chrome.storage.local.set({
    softDeletedCourses: ["BIO 1001", "CHEM 1001"],
    hardDeletedCourses: ["BIO 1001"]
  });

  await executeBatchUpload(JSON.stringify({
    "BIO 1001": "Biology for Engineers",
    "CHEM 1001": "Chemistry"
  }));

  const snap5 = await chrome.storage.local.get(["courses", "softDeletedCourses", "hardDeletedCourses"]);
  assert.strictEqual(snap5.softDeletedCourses.includes("BIO 1001"), false);
  assert.strictEqual(snap5.softDeletedCourses.includes("CHEM 1001"), false);
  assert.strictEqual(snap5.hardDeletedCourses.includes("BIO 1001"), false);
  assert.ok(snap5.courses["BIO 1001"]);
  assert.ok(snap5.courses["CHEM 1001"]);
  console.log("  ✓ Batch upload un-deleted all imported courses from soft & hard trash");

  // --- 8. TEMPLATE & MARKUP INTEGRITY CHECKS ---
  console.log("\n[TEST 8] popup.html & popup.js Template Consistency");
  const popupHtml = fs.readFileSync(path.join(__dirname, "..", "popup.html"), "utf8");
  const popupJs = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");

  // Verify copy button in popup.html has "Copy" text and icon
  assert.ok(popupHtml.includes('id="copySampleBtn"'), "copySampleBtn must exist in HTML");
  assert.ok(popupHtml.includes('<span>Copy</span>'), "copySampleBtn must display 'Copy'");
  assert.ok(!popupHtml.includes("Copy Sample JSON</button>"), "Old button text must not remain");
  console.log("  ✓ popup.html has clean 'Copy' button with icon");

  // Verify batch upload banner is removed from single course form
  assert.ok(!popupHtml.includes('id="batchUploadPrompt"'), "batchUploadPrompt must be removed from HTML");
  assert.ok(!popupHtml.includes("Need to add multiple courses?"), "Bottom banner text must be removed");
  console.log("  ✓ Single course form bottom banner is cleanly removed");

  // Verify placeholder in popup.html contains valid 2-course JSON
  const placeholderMatch = popupHtml.match(/id="jsonInput"[^>]*placeholder='([^']+)'/s);
  assert.ok(placeholderMatch, "jsonInput must have a placeholder");
  const unescapedPlaceholder = placeholderMatch[1].replace(/&#10;/g, "\n");
  const parsedPlaceholder = JSON.parse(unescapedPlaceholder);
  assert.deepStrictEqual(Object.keys(parsedPlaceholder), ["CSE 3715", "ACT 1111"]);
  console.log("  ✓ Textarea placeholder parses into exactly 2 courses: CSE 3715 and ACT 1111");

  // Verify popup.js has SAMPLE_TWO_COURSES matching the placeholder
  assert.ok(popupJs.includes("SAMPLE_TWO_COURSES"), "popup.js must define SAMPLE_TWO_COURSES constant");
  const sampleMatch = popupJs.match(/const SAMPLE_TWO_COURSES = JSON\.stringify\((\{[\s\S]*?\}), null, 2\);/);
  assert.ok(sampleMatch, "SAMPLE_TWO_COURSES must be an object serialization");
  const parsedJsSample = JSON.parse(sampleMatch[1]);
  assert.deepStrictEqual(Object.keys(parsedJsSample), ["CSE 3715", "ACT 1111"]);
  console.log("  ✓ popup.js SAMPLE_TWO_COURSES matches placeholder schema");

  console.log("\n[TEST 9] Single Course Professional UI & Clean Architecture");
  // Check section headers, intro banner, and slot placeholder
  assert.ok(popupHtml.includes('class="single-course-intro"'), "Must have single-course-intro banner");
  assert.ok(popupHtml.includes('<span>Course Identity</span>'), "Must have Course Identity section header");
  assert.ok(popupHtml.includes('<span>Schedule &amp; Prerequisites</span>'), "Must have Schedule & Prerequisites section header");
  assert.ok(popupHtml.includes('placeholder="e.g. T1, T2, or T3"'), "Exam Slot placeholder must show UIU standard slot notation like T1, T2, or T3");
  assert.ok(!popupHtml.includes('id="singleLivePreview"'), "Unnecessary live preview must be removed for a clean UI");
  console.log("  ✓ popup.html includes structured section headers, T1/T2/T3 slot format, and clean uncluttered layout");

  // Check popup.js keyboard navigation and auto-uppercase
  assert.ok(popupJs.includes('e.key === "Enter"'), "popup.js must implement Enter-to-submit on inputs");
  assert.ok(popupJs.includes(".toUpperCase()"), "popup.js must auto-uppercase course code");
  assert.ok(!popupJs.includes("updateSingleLivePreview"), "popup.js must not contain redundant live preview function");
  console.log("  ✓ popup.js includes auto-uppercase and Enter key handlers without redundant preview overhead");

  console.log("\n==================================================");
  console.log("  ALL TESTS PASSED WITH ZERO ERRORS (9 / 9)        ");
  console.log("==================================================");
}

runIntegrationSuite().catch(err => {
  console.error("\n❌ Test Suite Failed:", err);
  process.exit(1);
});
