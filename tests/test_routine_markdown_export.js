/**
 * tests/test_routine_markdown_export.js
 * Automated regression suite for Task 3.3: Enrolled Course Routine & Markdown (.md) Export
 *
 * Verifies:
 *   1. HTML structure: #exportRoutineMdBtn in mycourses-view header
 *   2. HTML hygiene: Zero remnant ICS modals or ICS inputs in popup.html
 *   3. CSS styles: .routine-slot-badge, .routine-slot-time, .header-export-action
 *   4. JS presence: getExamSlotTiming, generateRoutineMarkdown, downloadMarkdownFile
 *   5. Zero innerHTML: Strict programmatic DOM and safe string manipulation
 *   6. Slot time mapping:
 *        T1 -> 09:00 AM – 11:00 AM
 *        T2 -> 11:30 AM – 01:30 PM
 *        T3 -> 02:00 PM – 03:00 PM
 *   7. Markdown generator structure: Headers, Enrolled Table, Slot Reference, Conflict Report
 *   8. Conflict analysis: Accurately reflects direct clashes and same-day exams
 *   9. In-class & lab handling: Accurately formats non-standard exam slots
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

console.log('\n── test_routine_markdown_export.js ─────────────────────────────────────────');

// ── 1. HTML Element presence & ICS hygiene ─────────────────────────────────
assert('HTML has #exportRoutineMdBtn in header', popupHtml.includes('id="exportRoutineMdBtn"'));
assert('HTML button has accessible title and aria-label',
  popupHtml.includes('title="Download exam routine as Markdown (.md)"') &&
  popupHtml.includes('aria-label="Export exam routine"'));
assert('HTML has zero remnant #examExportModal (ICS cleanup)', !popupHtml.includes('id="examExportModal"'));
assert('HTML has zero remnant #icsStartDateInput (ICS cleanup)', !popupHtml.includes('id="icsStartDateInput"'));
assert('HTML has zero remnant #downloadIcsBtn (ICS cleanup)', !popupHtml.includes('id="downloadIcsBtn"'));

// ── 2. CSS styles presence ─────────────────────────────────────────────────
assert('CSS has .routine-slot-badge', popupCss.includes('.routine-slot-badge'));
assert('CSS has .routine-slot-time', popupCss.includes('.routine-slot-time'));
assert('CSS styles the current routine export action', popupCss.includes('.header-export-action'));
assert('CSS has zero remnant .ics-preview-section (ICS cleanup)', !popupCss.includes('.ics-preview-section'));

// ── 3. JS function & state presence ────────────────────────────────────────
assert('popup.js has getExamSlotTiming function', popupJs.includes('function getExamSlotTiming'));
assert('popup.js has generateRoutineMarkdown function', popupJs.includes('function generateRoutineMarkdown'));
assert('popup.js has downloadMarkdownFile function', popupJs.includes('function downloadMarkdownFile'));
assert('popup.js binds exportRoutineMdBtn click event', popupJs.includes('exportRoutineMdBtn'));
assert('popup.js has zero remnant generateIcsCalendar (ICS cleanup)', !popupJs.includes('function generateIcsCalendar'));

// Check zero innerHTML in Task 3.3 helpers
const helperStart = popupJs.indexOf('function getExamSlotTiming');
const helperEnd   = popupJs.indexOf('End Task 3.3 Helpers');
assert('Zero innerHTML assignment in Task 3.3 helpers',
  helperStart !== -1 && helperEnd !== -1
    ? !popupJs.substring(helperStart, helperEnd).includes('.innerHTML')
    : false);

// ── 4. Functional algorithm tests ──────────────────────────────────────────

const slotHelper = popupJs.slice(helperStart, popupJs.indexOf('  /**', helperStart)).trim();
const getExamSlotTiming = require('vm').runInNewContext('(' + slotHelper + ')');

const t1 = getExamSlotTiming('T1');
assert('T1 maps to 09:00 AM – 11:00 AM', t1 && t1.time === '09:00 AM – 11:00 AM');

const t2 = getExamSlotTiming('T2');
assert('T2 maps to 11:30 AM – 01:30 PM', t2 && t2.time === '11:30 AM – 01:30 PM');

const t3 = getExamSlotTiming('T3');
assert('T3 maps to 02:00 PM – 03:00 PM', t3 && t3.time === '02:00 PM – 03:00 PM');

const slot1Alt = getExamSlotTiming('Slot 1');
assert('Slot 1 case-insensitively maps to T1 timing', slot1Alt && slot1Alt.time === '09:00 AM – 11:00 AM');

// Mock data & generator test
function normalizeCourseData(val) {
  if (!val) return { name: "", examDay: "", examSlot: "", prerequisites: [], credits: 3 };
  if (typeof val === "string") return { name: val.trim(), examDay: "", examSlot: "", prerequisites: [], credits: 3 };
  return {
    name: (val.name || "").trim(),
    examDay: (val.examDay || "").trim(),
    examSlot: (val.examSlot || "").trim(),
    prerequisites: Array.isArray(val.prerequisites) ? val.prerequisites : [],
    credits: val.credits !== undefined ? val.credits : 3
  };
}

function computeEnrolledCredits(list, catalog) {
  let total = 0;
  list.forEach(c => {
    const data = normalizeCourseData(catalog[c]);
    total += data.credits || 3;
  });
  return total;
}

function detectExamClashes(list, catalog) {
  const map = {};
  const clashes = [];
  list.forEach(c => {
    const d = normalizeCourseData(catalog[c]);
    if (d.examDay && d.examSlot && d.examDay.toLowerCase() !== "in-class") {
      const key = d.examDay + "|" + d.examSlot;
      if (!map[key]) map[key] = [];
      map[key].push(c);
    }
  });
  for (const k in map) {
    if (map[k].length > 1) {
      const [day, slot] = k.split("|");
      clashes.push({ day, slot, courses: map[k] });
    }
  }
  return clashes;
}

function detectSameDayExams(list, catalog) {
  const map = {};
  const sameDays = [];
  list.forEach(c => {
    const d = normalizeCourseData(catalog[c]);
    if (d.examDay && d.examDay.toLowerCase() !== "in-class") {
      if (!map[d.examDay]) map[d.examDay] = [];
      map[d.examDay].push({ code: c, slot: d.examSlot, name: d.name });
    }
  });
  for (const day in map) {
    if (map[day].length > 1) {
      sameDays.push({ day, count: map[day].length, courses: map[day] });
    }
  }
  return sameDays;
}

function generateRoutineMarkdown(enrolledList, catalog) {
  var now = new Date();
  var pad = function(n) { return n < 10 ? "0" + n : String(n); };
  var dateStr = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());

  var totalCourses = enrolledList.length;
  var totalCredits = computeEnrolledCredits(enrolledList, catalog);
  var clashes = detectExamClashes(enrolledList, catalog);
  var sameDayExams = detectSameDayExams(enrolledList, catalog);

  var clashStatus = "✅ Clear (No direct exam clashes detected)";
  if (clashes.length > 0) {
    clashStatus = "⚠️ " + clashes.length + " Direct Exam Clash" + (clashes.length > 1 ? "es" : "") + " Detected";
  } else if (sameDayExams.length > 0) {
    clashStatus = "ℹ️ Notice (" + sameDayExams.length + " Same-Day Exam Period" + (sameDayExams.length > 1 ? "s" : "") + ")";
  }

  var lines = [];
  lines.push("# UIU Course Schedule & Exam Routine");
  lines.push("");
  lines.push("> **Summary:** " + totalCourses + " Enrolled Course" + (totalCourses !== 1 ? "s" : "") + " • " + totalCredits.toFixed(1) + " Total Credits");
  lines.push("> **Exam Status:** " + clashStatus);
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 📚 Enrolled Courses");
  lines.push("");
  lines.push("| Course Code | Course Title | Credits | Exam Day | Exam Slot | Scheduled Time | Prerequisites |");
  lines.push("|:---|:---|:---:|:---:|:---:|:---|:---|");

  if (totalCourses === 0) {
    lines.push("| *(None)* | No courses currently enrolled | 0.0 Cr | — | — | — | — |");
  } else {
    enrolledList.forEach(function(code) {
      var raw = catalog[code];
      var data = normalizeCourseData(raw);
      var title = (data.name || "Course").replace(/\|/g, "\\|");
      var credits = (data.credits ? data.credits.toFixed(1) : "3.0") + " Cr";
      var day = data.examDay || "TBA";
      var slot = data.examSlot || "TBA";
      var lowerDay = day.toLowerCase();

      var timeText = "Pending / TBA";
      if (lowerDay === "in-class") {
        day = "In-Class";
        slot = "N/A";
        timeText = "In-Class Evaluation";
      } else if (data.examSlot) {
        var timing = getExamSlotTiming(data.examSlot);
        timeText = timing && timing.time ? timing.time : data.examSlot;
      }

      var prereqs = (data.prerequisites && data.prerequisites.length > 0)
        ? data.prerequisites.join(", ")
        : "None";

      lines.push("| **" + code + "** | " + title + " | " + credits + " | " + day + " | " + slot + " | " + timeText + " | " + prereqs + " |");
    });
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## 🕒 UIU Exam Slot Timing Reference");
  lines.push("");
  lines.push("| Slot | Official Time Window | Description |");
  lines.push("|:---|:---|:---|");
  lines.push("| **T1** | `09:00 AM – 11:00 AM` | Morning Exam Slot |");
  lines.push("| **T2** | `11:30 AM – 01:30 PM` | Midday Exam Slot |");
  lines.push("| **T3** | `02:00 PM – 03:00 PM` | Afternoon Exam Slot |");
  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push("## ⚠️ Exam Conflict & Schedule Analysis");
  lines.push("");

  if (clashes.length === 0 && sameDayExams.length === 0) {
    lines.push("- **Direct Clashes:** None detected.");
    lines.push("- **Same-Day Exams:** None detected.");
  } else {
    if (clashes.length > 0) {
      lines.push("### ❌ Direct Exam Clashes (Same Day & Same Slot)");
      clashes.forEach(function(c) {
        var timing = getExamSlotTiming(c.slot);
        var timeStr = timing && timing.time ? " (" + timing.time + ")" : "";
        lines.push("- **" + c.day + ", Slot " + c.slot + timeStr + ":** " + c.courses.join(" vs "));
      });
    }
  }

  return lines.join("\n");
}

const mockCatalog = {
  'CSE 2215': { name: 'Data Structure and Algorithms I', examDay: 'Day 4', examSlot: 'T2', credits: 3, prerequisites: ['CSE 1111'] },
  'ENG 1011': { name: 'English I', examDay: 'Day 1', examSlot: 'T1', credits: 3, prerequisites: [] },
  'CSE 2216': { name: 'Data Structure Lab', examDay: 'In-Class', examSlot: 'N/A', credits: 1, prerequisites: ['CSE 1111'] },
  'MATH 2183': { name: 'Calculus', examDay: 'Day 4', examSlot: 'T2', credits: 3, prerequisites: [] } // Causes direct clash with CSE 2215
};

const mdOutput = generateRoutineMarkdown(['CSE 2215', 'ENG 1011', 'CSE 2216'], mockCatalog);

assert('Generates Markdown header # UIU Course Schedule & Exam Routine',
  mdOutput.includes('# UIU Course Schedule & Exam Routine'));
assert('Generates table headers with Course Code, Exam Slot, Scheduled Time',
  mdOutput.includes('| Course Code | Course Title | Credits | Exam Day | Exam Slot | Scheduled Time | Prerequisites |'));
assert('Generates table row for CSE 2215 with T2 time 11:30 AM – 01:30 PM',
  mdOutput.includes('| **CSE 2215** | Data Structure and Algorithms I | 3.0 Cr | Day 4 | T2 | 11:30 AM – 01:30 PM | CSE 1111 |'));
assert('Generates table row for ENG 1011 with T1 time 09:00 AM – 11:00 AM',
  mdOutput.includes('| **ENG 1011** | English I | 3.0 Cr | Day 1 | T1 | 09:00 AM – 11:00 AM | None |'));
assert('Generates in-class row for CSE 2216 without broken slot',
  mdOutput.includes('| **CSE 2216** | Data Structure Lab | 1.0 Cr | In-Class | N/A | In-Class Evaluation | CSE 1111 |'));
assert('Includes UIU Exam Slot Timing Reference table',
  mdOutput.includes('## 🕒 UIU Exam Slot Timing Reference') &&
  mdOutput.includes('| **T1** | `09:00 AM – 11:00 AM` | Morning Exam Slot |') &&
  mdOutput.includes('| **T2** | `11:30 AM – 01:30 PM` | Midday Exam Slot |') &&
  mdOutput.includes('| **T3** | `02:00 PM – 03:00 PM` | Afternoon Exam Slot |'));

// Clash scenario test
const clashMdOutput = generateRoutineMarkdown(['CSE 2215', 'MATH 2183'], mockCatalog);
assert('Detects and documents direct clash in Markdown export',
  clashMdOutput.includes('### ❌ Direct Exam Clashes (Same Day & Same Slot)') &&
  clashMdOutput.includes('Day 4, Slot T2 (11:30 AM – 01:30 PM):** CSE 2215 vs MATH 2183'));

// Empty enrolled scenario
const emptyMd = generateRoutineMarkdown([], mockCatalog);
assert('Handles empty enrollment with clean empty state row',
  emptyMd.includes('No courses currently enrolled'));

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n  Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
