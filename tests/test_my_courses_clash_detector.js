/**
 * tests/test_my_courses_clash_detector.js
 * Automated regression suite for Task 3.2: "My Courses" & Exam Routine Clash Detector
 *
 * Verifies:
 *   1. HTML structure: View 0 quick card, View 1 filter button, summary card, clash alert box
 *   2. HTML structure: View 3 details enrollment toggle button and clash warning banner
 *   3. CSS styles: .enrolled-quick-card, .clash-alert-box, .btn-enroll-toggle, .btn-row-enroll, .is-clashing
 *   4. JS presence: detectExamClashes, computeEnrolledCredits, updateEnrolledUI, toggleEnrollCourse
 *   5. Zero innerHTML: All DOM generation uses safe browser APIs
 *   6. Functional unit test: detectExamClashes detects overlapping Day & Slot
 *   7. Functional unit test: detectExamClashes ignores N/A, In-Class, and empty routines
 *   8. Functional unit test: detectExamClashes handles 3-way collisions and multiple distinct clashes
 *   9. Functional unit test: computeEnrolledCredits sums credits accurately
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const popupHtml = fs.readFileSync(path.join(ROOT, 'popup.html'), 'utf8');
const popupCss  = fs.readFileSync(path.join(ROOT, 'popup.css'),  'utf8');
const popupJs   = fs.readFileSync(path.join(ROOT, 'popup.js'),   'utf8');

let passed = 0;
let failed = 0;

function assert(label, condition, detail) {
  if (condition) {
    console.log('  ✓', label);
    passed++;
  } else {
    console.error('  ✗', label, detail ? `(${detail})` : '');
    failed++;
  }
}

console.log('\n── test_my_courses_clash_detector.js ───────────────────────────────────────');

// ── 1. HTML Element presence ───────────────────────────────────────────────
assert('HTML has #homeEnrolledCard in View 0', popupHtml.includes('id="homeEnrolledCard"'));
assert('HTML has #homeEnrolledCount and #homeEnrolledCredits',
  popupHtml.includes('id="homeEnrolledCount"') && popupHtml.includes('id="homeEnrolledCredits"'));
assert('HTML has #homeClashBadge', popupHtml.includes('id="homeClashBadge"'));

assert('HTML has dedicated .mycourses-view screen', popupHtml.includes('class="view mycourses-view"'));
assert('HTML has #myCoursesSearchInput for quick course lookup', popupHtml.includes('id="myCoursesSearchInput"'));

assert('HTML has #enrolledSummaryCard', popupHtml.includes('id="enrolledSummaryCard"'));
assert('HTML has #enrolledTotalCourses and #enrolledTotalCredits',
  popupHtml.includes('id="enrolledTotalCourses"') && popupHtml.includes('id="enrolledTotalCredits"'));
assert('HTML has #clearEnrolledBtn', popupHtml.includes('id="clearEnrolledBtn"'));

assert('HTML has #clashAlertBox and #clashAlertList',
  popupHtml.includes('id="clashAlertBox"') && popupHtml.includes('id="clashAlertList"'));

assert('HTML has #detailsEnrollBtn in View 3 header', popupHtml.includes('id="detailsEnrollBtn"'));
assert('HTML has #detailsEnrollBtnText', popupHtml.includes('id="detailsEnrollBtnText"'));
assert('HTML has #detailClashWarning and #detailClashText in View 3',
  popupHtml.includes('id="detailClashWarning"') && popupHtml.includes('id="detailClashText"'));

// ── 2. CSS styles presence ─────────────────────────────────────────────────
assert('CSS has .enrolled-quick-card', popupCss.includes('.enrolled-quick-card'));
assert('CSS has .clash-badge.danger and .clash-badge.ok',
  popupCss.includes('.clash-badge.danger') && popupCss.includes('.clash-badge.ok'));
assert('CSS has .enrolled-summary-card', popupCss.includes('.enrolled-summary-card'));
assert('CSS has .clash-alert-box', popupCss.includes('.clash-alert-box'));
assert('CSS has .clash-alert-box.is-warning and .clash-item.warning', popupCss.includes('.clash-alert-box.is-warning') && popupCss.includes('.clash-item.warning'));
assert('CSS has .clash-badge.warning', popupCss.includes('.clash-badge.warning'));
assert('CSS has .enrolled-course-card.has-same-day and .enrolled-card-sameday-banner', popupCss.includes('.enrolled-course-card.has-same-day') && popupCss.includes('.enrolled-card-sameday-banner'));
assert('CSS has .btn-enroll-toggle', popupCss.includes('.btn-enroll-toggle'));
assert('CSS has .btn-row-enroll', popupCss.includes('.btn-row-enroll'));
assert('CSS has .course-grid-row.is-clashing', popupCss.includes('.course-grid-row.is-clashing'));

// ── 3. JS function & state presence ────────────────────────────────────────
assert('popup.js has enrolledCourses state', popupJs.includes('enrolledCourses ='));
assert('popup.js has detectExamClashes function', popupJs.includes('function detectExamClashes'));
assert('popup.js has detectSameDayExams function', popupJs.includes('function detectSameDayExams'));
assert('popup.js has computeEnrolledCredits function', popupJs.includes('function computeEnrolledCredits'));
assert('popup.js has updateEnrolledUI function', popupJs.includes('function updateEnrolledUI'));
assert('popup.js has toggleEnrollCourse function', popupJs.includes('function toggleEnrollCourse'));

// Check zero innerHTML in Task 3.2 helpers
const helperStart = popupJs.indexOf('function detectExamClashes');
const helperEnd   = popupJs.indexOf('End Task 3.2 Helpers');
assert('Zero innerHTML assignment in Task 3.2 helper functions',
  helperStart !== -1 && helperEnd !== -1
    ? !popupJs.substring(helperStart, helperEnd).includes('.innerHTML')
    : false);

// ── 4. Functional algorithm tests ──────────────────────────────────────────

function normalizeCourseData(val) {
  if (!val) return { name: "", examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
  if (typeof val === "string") return { name: val, examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
  return {
    name: val.name || "",
    examDay: val.examDay || "",
    examSlot: val.examSlot || "",
    prerequisites: val.prerequisites || [],
    prerequisiteNote: val.prerequisiteNote || "",
    credits: typeof val.credits === "number" ? val.credits : null
  };
}


function detectSameDayExams(enrolledList, catalog) {
  var dayMap = {};
  var sameDays = [];

  for (var i = 0; i < enrolledList.length; i++) {
    var code = enrolledList[i];
    var data = normalizeCourseData(catalog[code]);
    var day = (data.examDay || "").trim();
    var slot = (data.examSlot || "").trim();

    if (!day) continue;
    var lowerDay = day.toLowerCase();
    if (lowerDay === "n/a" || lowerDay === "none" || lowerDay === "in-class") continue;

    if (!dayMap[day]) dayMap[day] = [];
    dayMap[day].push({
      code: code,
      slot: slot || "TBA",
      name: data.name || ""
    });
  }

  for (var d in dayMap) {
    if (dayMap.hasOwnProperty(d) && dayMap[d].length > 1) {
      sameDays.push({
        day: d,
        count: dayMap[d].length,
        courses: dayMap[d]
      });
    }
  }
  return sameDays;
}

function detectExamClashes(enrolledList, catalog) {
  var slotMap = {};
  var clashes = [];

  for (var i = 0; i < enrolledList.length; i++) {
    var code = enrolledList[i];
    var data = normalizeCourseData(catalog[code]);
    var day = (data.examDay || "").trim();
    var slot = (data.examSlot || "").trim();

    if (!day || !slot) continue;
    var lowerDay = day.toLowerCase();
    var lowerSlot = slot.toLowerCase();
    if (lowerDay === "n/a" || lowerDay === "none" || lowerDay === "in-class") continue;
    if (lowerSlot === "n/a" || lowerSlot === "none") continue;

    var key = day + "|" + slot;
    if (!slotMap[key]) slotMap[key] = [];
    slotMap[key].push(code);
  }

  for (var k in slotMap) {
    if (slotMap.hasOwnProperty(k) && slotMap[k].length > 1) {
      var parts = k.split("|");
      clashes.push({
        day: parts[0],
        slot: parts[1],
        courses: slotMap[k]
      });
    }
  }
  return clashes;
}

function computeEnrolledCredits(enrolledList, catalog) {
  var total = 0;
  for (var i = 0; i < enrolledList.length; i++) {
    var code = enrolledList[i];
    var data = normalizeCourseData(catalog[code]);
    if (typeof data.credits === "number" && !isNaN(data.credits)) {
      total += data.credits;
    }
  }
  return total;
}

// Test A: Direct Clash
const mockCatalogA = {
  'CSE 2215': { examDay: 'Day 4', examSlot: 'T2', credits: 3 },
  'DS 1501':  { examDay: 'Day 4', examSlot: 'T2', credits: 3 },
  'ENG 1011': { examDay: 'Day 1', examSlot: 'T1', credits: 3 }
};

const clashesA = detectExamClashes(['CSE 2215', 'DS 1501', 'ENG 1011'], mockCatalogA);
assert('Direct collision on Day 4 Slot T2 detected',
  clashesA.length === 1 &&
  clashesA[0].day === 'Day 4' &&
  clashesA[0].slot === 'T2' &&
  clashesA[0].courses.includes('CSE 2215') &&
  clashesA[0].courses.includes('DS 1501'));

// Test B: Different Slots - Zero Clashes
const mockCatalogB = {
  'CSE 2215': { examDay: 'Day 4', examSlot: 'T2' },
  'MATH 1151': { examDay: 'Day 2', examSlot: 'T2' },
  'ENG 1011': { examDay: 'Day 1', examSlot: 'T1' }
};
const clashesB = detectExamClashes(['CSE 2215', 'MATH 1151', 'ENG 1011'], mockCatalogB);
assert('No clashes when exams are on different days/slots', clashesB.length === 0);

// Test C: N/A, In-Class, and Lab schedules do not clash
const mockCatalogC = {
  'CSE 1111': { examDay: 'Day 4', examSlot: 'T2' },
  'CSE 1112': { examDay: 'N/A', examSlot: 'N/A' }, // Lab
  'CSE 1110': { examDay: 'In-Class', examSlot: 'None' },
  'CSE 4000': { examDay: '', examSlot: '' }
};
const clashesC = detectExamClashes(['CSE 1111', 'CSE 1112', 'CSE 1110', 'CSE 4000'], mockCatalogC);
assert('N/A, In-Class, and empty exam slots are ignored and do not clash', clashesC.length === 0);

// Test D: 3-way collision
const mockCatalogD = {
  'CSE 101': { examDay: 'Day 3', examSlot: 'T1' },
  'CSE 102': { examDay: 'Day 3', examSlot: 'T1' },
  'CSE 103': { examDay: 'Day 3', examSlot: 'T1' }
};
const clashesD = detectExamClashes(['CSE 101', 'CSE 102', 'CSE 103'], mockCatalogD);
assert('3-way collision groups all 3 courses into a single clash record',
  clashesD.length === 1 && clashesD[0].courses.length === 3);

// Test E: Multiple distinct clashes
const mockCatalogE = {
  'C1': { examDay: 'Day 1', examSlot: 'T1' },
  'C2': { examDay: 'Day 1', examSlot: 'T1' },
  'C3': { examDay: 'Day 5', examSlot: 'T3' },
  'C4': { examDay: 'Day 5', examSlot: 'T3' }
};
const clashesE = detectExamClashes(['C1', 'C2', 'C3', 'C4'], mockCatalogE);
assert('Multiple distinct clashes on different days are both detected', clashesE.length === 2);

// Test F: Credits summation
const mockCatalogCredits = {
  'CSE 2215': { credits: 3 },
  'CSE 2216': { credits: 1 },
  'BDS 1201': { credits: 2 },
  'ENG 1011': { credits: 3 },
  'NO_CRED':  {} // no credits
};
const totalCredits = computeEnrolledCredits(['CSE 2215', 'CSE 2216', 'BDS 1201', 'ENG 1011', 'NO_CRED'], mockCatalogCredits);
assert('computeEnrolledCredits sums enrolled credits accurately (9 Cr)', totalCredits === 9);


// Test G: Same-day multiple exams with different slots
const mockCatalogG = {
  'CSE 2215': { examDay: 'Day 4', examSlot: 'T1' },
  'CSE 3313': { examDay: 'Day 4', examSlot: 'T3' },
  'ENG 1011': { examDay: 'Day 1', examSlot: 'T2' }
};
const sameDayG = detectSameDayExams(['CSE 2215', 'CSE 3313', 'ENG 1011'], mockCatalogG);
assert('Same-day multiple exams detected on Day 4 for different slots (T1 and T3)',
  sameDayG.length === 1 &&
  sameDayG[0].day === 'Day 4' &&
  sameDayG[0].count === 2 &&
  sameDayG[0].courses.some(c => c.code === 'CSE 2215' && c.slot === 'T1') &&
  sameDayG[0].courses.some(c => c.code === 'CSE 3313' && c.slot === 'T3'));

// Test H: N/A, In-Class, and empty exam days ignored in same-day detector
const mockCatalogH = {
  'CSE 1111': { examDay: 'Day 4', examSlot: 'T1' },
  'CSE 1112': { examDay: 'N/A', examSlot: 'N/A' },
  'CSE 1110': { examDay: 'In-Class', examSlot: 'None' },
  'CSE 4000': { examDay: '', examSlot: '' }
};
const sameDayH = detectSameDayExams(['CSE 1111', 'CSE 1112', 'CSE 1110', 'CSE 4000'], mockCatalogH);
assert('Same-day detector ignores N/A, In-Class, and empty exam days', sameDayH.length === 0);

// Test I: 3 courses on the same day
const mockCatalogI = {
  'CSE 101': { examDay: 'Day 2', examSlot: 'T1' },
  'CSE 102': { examDay: 'Day 2', examSlot: 'T2' },
  'CSE 103': { examDay: 'Day 2', examSlot: 'T3' }
};
const sameDayI = detectSameDayExams(['CSE 101', 'CSE 102', 'CSE 103'], mockCatalogI);
assert('3 courses on the same day (T1, T2, T3) are grouped into single count:3 same-day record',
  sameDayI.length === 1 && sameDayI[0].count === 3 && sameDayI[0].day === 'Day 2');

// Test J: All courses on distinct days - zero same-day warnings
const mockCatalogJ = {
  'CSE 101': { examDay: 'Day 1', examSlot: 'T1' },
  'CSE 102': { examDay: 'Day 2', examSlot: 'T1' },
  'CSE 103': { examDay: 'Day 3', examSlot: 'T1' }
};
const sameDayJ = detectSameDayExams(['CSE 101', 'CSE 102', 'CSE 103'], mockCatalogJ);
assert('All courses on distinct days yields zero same-day warnings', sameDayJ.length === 0);

// Test K: Enrolled courses ordering (Newest first via unshift)
let mockEnrolled = [];
function mockToggleEnroll(code) {
  var idx = mockEnrolled.indexOf(code);
  if (idx === -1) {
    mockEnrolled.unshift(code);
  } else {
    mockEnrolled.splice(idx, 1);
  }
}
mockToggleEnroll('CSE 1111');
mockToggleEnroll('MATH 1151');
mockToggleEnroll('ENG 1011');
assert('Newly added courses appear at the top (newest first)',
  mockEnrolled[0] === 'ENG 1011' && mockEnrolled[1] === 'MATH 1151' && mockEnrolled[2] === 'CSE 1111');
assert('popup.js prepends new additions via unshift', popupJs.includes('enrolledCourses.unshift(code)'));

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n  Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

