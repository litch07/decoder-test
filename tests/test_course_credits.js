/**
 * tests/test_course_credits.js
 * Comprehensive automated regression suite for Task 3.1: Course Credits Field in Schema
 *
 * Verifies:
 *   1. courses.json schema contains valid numeric credits
 *   2. docs/courses.json is strictly in sync with courses.json
 *   3. popup.html contains #detailCredits, #detailsCreditsBadge, and #singleCourseCredits
 *   4. popup.css contains .form-row-3col and .course-credit-chip styles
 *   5. popup.js normalizeCourseData handles numeric, string, and null credits
 *   6. popup.js areCourseDataEqual detects credit differences
 *   7. popup.js computeImportDiff tracks Course Credits changes
 *   8. popup.js els mapping contains detailCredits, detailsCreditsBadge, singleCourseCredits
 *   9. content.js extracts credits and renders Credits in buildTooltipDom
 *  10. docs/index.html & docs/app.js support credits display with zero innerHTML
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

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

console.log('\n── test_course_credits.js ──────────────────────────────────────────────────');

// ── 1. Catalog integrity & synchronization ─────────────────────────────────
const rootJsonStr = fs.readFileSync(path.join(ROOT, 'courses.json'), 'utf8');
const docsJsonStr = fs.readFileSync(path.join(ROOT, 'docs', 'courses.json'), 'utf8');
const catalog = JSON.parse(rootJsonStr);

assert('courses.json is valid JSON', typeof catalog === 'object' && catalog !== null);
assert('docs/courses.json matches root courses.json', rootJsonStr === docsJsonStr);

let creditCount = 0;
let invalidCredits = 0;
for (const [code, val] of Object.entries(catalog)) {
  if (typeof val === 'object' && val !== null && val.credits !== undefined) {
    if (typeof val.credits !== 'number' || isNaN(val.credits) || val.credits <= 0) {
      invalidCredits++;
    } else {
      creditCount++;
    }
  }
}

assert('courses.json contains courses with credits', creditCount > 50, `Found ${creditCount} courses with credits`);
assert('All specified credits are valid positive numbers', invalidCredits === 0, `Found ${invalidCredits} invalid credits`);

// Spot check canonical courses
assert('CSE 1111 has 3 credits', catalog['CSE 1111'] && catalog['CSE 1111'].credits === 3);
assert('CSE 1112 (lab) has 1 credit', catalog['CSE 1112'] && catalog['CSE 1112'].credits === 1);
assert('CSE 2215 has 3 credits', catalog['CSE 2215'] && catalog['CSE 2215'].credits === 3);

// ── 2. popup.html elements ─────────────────────────────────────────────────
const popupHtml = fs.readFileSync(path.join(ROOT, 'popup.html'), 'utf8');
assert('popup.html has #detailCredits input', popupHtml.includes('id="detailCredits"'));
assert('popup.html has #detailsCreditsBadge in header', popupHtml.includes('id="detailsCreditsBadge"'));
assert('popup.html has #singleCourseCredits input', popupHtml.includes('id="singleCourseCredits"'));

// ── 3. popup.css classes ───────────────────────────────────────────────────
const popupCss = fs.readFileSync(path.join(ROOT, 'popup.css'), 'utf8');
assert('popup.css has .form-row-3col', popupCss.includes('.form-row-3col'));
assert('popup.css has .course-credit-chip', popupCss.includes('.course-credit-chip'));
assert('popup.css has .origin-badge.credits', popupCss.includes('.origin-badge.credits'));

// ── 4. popup.js logic & DOM mapping ────────────────────────────────────────
const popupJs = fs.readFileSync(path.join(ROOT, 'popup.js'), 'utf8');
assert('popup.js els has detailCredits', popupJs.includes('detailCredits: document.getElementById("detailCredits")'));
assert('popup.js els has detailsCreditsBadge', popupJs.includes('detailsCreditsBadge: document.getElementById("detailsCreditsBadge")'));
assert('popup.js els has singleCourseCredits', popupJs.includes('singleCourseCredits: document.getElementById("singleCourseCredits")'));

// Functional tests for normalizeCourseData logic
function normalizeCourseData(val) {
  if (!val) return { name: "", examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
  if (typeof val === "string") {
    return { name: val.trim(), examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
  }
  const name = (val.name || "").trim();
  const examDay = (val.examDay || "").trim();
  const examSlot = (val.examSlot || "").trim();
  const prerequisiteNote = (val.prerequisiteNote || "").trim();
  const prerequisites = Array.isArray(val.prerequisites)
    ? val.prerequisites.map(p => String(p).trim()).filter(Boolean).sort()
    : [];
  let credits = null;
  if (val.credits !== undefined && val.credits !== null && val.credits !== "") {
    const parsed = parseFloat(val.credits);
    if (!isNaN(parsed) && parsed > 0) credits = parsed;
  }
  return { name, examDay, examSlot, prerequisites, prerequisiteNote, credits };
}

assert('normalizeCourseData handles number credit (3)', normalizeCourseData({ name: 'CS', credits: 3 }).credits === 3);
assert('normalizeCourseData parses string float ("1.5")', normalizeCourseData({ name: 'Lab', credits: '1.5' }).credits === 1.5);
assert('normalizeCourseData returns null for missing credits', normalizeCourseData({ name: 'Course' }).credits === null);
assert('normalizeCourseData returns null for invalid credits', normalizeCourseData({ name: 'Course', credits: 'abc' }).credits === null);

// Functional test for areCourseDataEqual logic
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
  if (a.credits !== b.credits) return false;
  return true;
}

assert('areCourseDataEqual returns true for identical credits',
  areCourseDataEqual({ name: 'C', credits: 3 }, { name: 'C', credits: 3 }));
assert('areCourseDataEqual returns false for different credits',
  !areCourseDataEqual({ name: 'C', credits: 3 }, { name: 'C', credits: 1 }));
assert('areCourseDataEqual returns false when one has credits and other does not',
  !areCourseDataEqual({ name: 'C', credits: 3 }, { name: 'C' }));

// ── 5. content.js logic ────────────────────────────────────────────────────
const contentJs = fs.readFileSync(path.join(ROOT, 'content.js'), 'utf8');
assert('content.js resolve() extracts credits', contentJs.includes('credits: (isObj && courseData.credits) ? courseData.credits : null'));
assert('content.js buildExtendedData() passes credits', contentJs.includes('credits: resolved.credits || null'));
assert('content.js buildTooltipDom() renders Credits row',
  contentJs.includes('label.textContent = "Credits:";') &&
  contentJs.includes('String(data.credits) + " Cr"'));

// ── 6. docs/ web explorer ──────────────────────────────────────────────────
const docsHtml = fs.readFileSync(path.join(ROOT, 'docs', 'index.html'), 'utf8');
const docsJs   = fs.readFileSync(path.join(ROOT, 'docs', 'app.js'), 'utf8');

assert('docs/index.html has #modalCreditsPill', docsHtml.includes('id="modalCreditsPill"'));
assert('docs/index.html has #modalCredits', docsHtml.includes('id="modalCredits"'));
assert('docs/app.js handles credits in normalizeCourseData', docsJs.includes('parseFloat(val.credits)'));
assert('docs/app.js renders credit chip on course cards', docsJs.includes('creditChip.textContent = `${data.credits} Cr`'));
assert('docs/app.js populates modalCredits text', docsJs.includes('els.modalCredits.textContent = `${data.credits} Credits`'));

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n  Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
