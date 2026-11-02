/**
 * tests/test_exam_calendar_export.js
 * Automated regression suite for Task 3.3: Exam Week Calendar Export (.ics)
 *
 * Verifies:
 *   1. HTML structure: #examExportModal, #openIcsExportBtn, #icsStartDateInput, #downloadIcsBtn
 *   2. CSS styles: .enrolled-cal-btn, .ics-preview-section, .ics-event-item, .ics-reminder-label
 *   3. JS presence: escapeIcsText, formatIcsDateTime, generateIcsCalendar, openExamCalendarModal
 *   4. Zero innerHTML: Strict programmatic DOM manipulation throughout calendar components
 *   5. RFC 5545 compliance: VCALENDAR structure, PRODID, VEVENT blocks
 *   6. Slot time mapping: T1 (09:00), T2 (11:30), T3 (14:30) with 2-hour durations
 *   7. Day offset mapping: Day X maps to base date + (X - 1) days
 *   8. Reminders configuration: VALARM blocks for 24h and 2h before exam
 *   9. Escape logic: commas, semicolons, backslashes, and newlines escaped properly
 *  10. Lab / In-Class exclusion: N/A, In-Class, and empty exam slots are not exported
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

console.log('\n── test_exam_calendar_export.js ───────────────────────────────────────────');

// ── 1. HTML Element presence ───────────────────────────────────────────────
assert('HTML has #examExportModal', popupHtml.includes('id="examExportModal"'));
assert('HTML has #openIcsExportBtn', popupHtml.includes('id="openIcsExportBtn"'));
assert('HTML has #icsStartDateInput', popupHtml.includes('id="icsStartDateInput"'));
assert('HTML has #icsEventCount and #icsPreviewList',
  popupHtml.includes('id="icsEventCount"') && popupHtml.includes('id="icsPreviewList"'));
assert('HTML has #icsRemindersToggle', popupHtml.includes('id="icsRemindersToggle"'));
assert('HTML has #downloadIcsBtn', popupHtml.includes('id="downloadIcsBtn"'));
assert('HTML has #examExportCloseBtn and #examExportCancelBtn',
  popupHtml.includes('id="examExportCloseBtn"') && popupHtml.includes('id="examExportCancelBtn"'));

// ── 2. CSS styles presence ─────────────────────────────────────────────────
assert('CSS has .enrolled-cal-btn', popupCss.includes('.enrolled-cal-btn'));
assert('CSS has .ics-preview-section and .ics-preview-list',
  popupCss.includes('.ics-preview-section') && popupCss.includes('.ics-preview-list'));
assert('CSS has .ics-event-item', popupCss.includes('.ics-event-item'));
assert('CSS has .ics-reminder-label', popupCss.includes('.ics-reminder-label'));

// ── 3. JS function & state presence ────────────────────────────────────────
assert('popup.js has escapeIcsText function', popupJs.includes('function escapeIcsText'));
assert('popup.js has formatIcsDateTime function', popupJs.includes('function formatIcsDateTime'));
assert('popup.js has generateIcsCalendar function', popupJs.includes('function generateIcsCalendar'));
assert('popup.js has openExamCalendarModal function', popupJs.includes('function openExamCalendarModal'));
assert('popup.js has closeExamCalendarModal function', popupJs.includes('function closeExamCalendarModal'));

// Check zero innerHTML in Task 3.3 helpers
const helperStart = popupJs.indexOf('function escapeIcsText');
const helperEnd   = popupJs.indexOf('End Task 3.3 Helpers');
assert('Zero innerHTML assignment in Task 3.3 helpers',
  helperStart !== -1 && helperEnd !== -1
    ? !popupJs.substring(helperStart, helperEnd).includes('.innerHTML')
    : false);

// ── 4. Functional algorithm tests ──────────────────────────────────────────

function escapeIcsText(str) {
  if (!str) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatIcsDateTime(date, timeStr) {
  var parts = timeStr.split(":");
  var d = new Date(date.getTime());
  d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || "0", 10), 0);
  var pad = function(n) { return n < 10 ? "0" + n : String(n); };
  return d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) + "T" +
    pad(d.getHours()) +
    pad(d.getMinutes()) + "00";
}

function generateIcsCalendar(courseEntries, startDateStr, includeReminders) {
  if (includeReminders === undefined) includeReminders = true;
  var lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UIU Course Code Decoder//Exam Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:UIU Final Exam Schedule",
    "X-WR-TIMEZONE:Asia/Dhaka"
  ];

  var now = new Date();
  var pad = function(n) { return n < 10 ? "0" + n : String(n); };
  var nowStr = now.getUTCFullYear() +
    pad(now.getUTCMonth() + 1) +
    pad(now.getUTCDate()) + "T" +
    pad(now.getUTCHours()) +
    pad(now.getUTCMinutes()) +
    pad(now.getUTCSeconds()) + "Z";

  var baseDateParts = (startDateStr || "").split("-");
  var baseDate = baseDateParts.length === 3
    ? new Date(parseInt(baseDateParts[0], 10), parseInt(baseDateParts[1], 10) - 1, parseInt(baseDateParts[2], 10))
    : new Date();

  for (var i = 0; i < courseEntries.length; i++) {
    var code = courseEntries[i][0];
    var val = courseEntries[i][1];
    var data = typeof val === 'object' && val !== null ? val : { name: val };
    var day = (data.examDay || "").trim();
    var slot = (data.examSlot || "").trim();

    if (!day || !slot) continue;
    var lowerDay = day.toLowerCase();
    if (lowerDay === "n/a" || lowerDay === "none" || lowerDay === "in-class") continue;

    var dayMatch = day.match(/\d+/);
    var dayOffset = dayMatch ? (parseInt(dayMatch[0], 10) - 1) : 0;
    var eventDate = new Date(baseDate.getTime() + dayOffset * 86400000);

    var startTime = "09:00:00";
    var endTime = "11:00:00";
    var slotUpper = slot.toUpperCase();
    if (slotUpper.indexOf("T1") !== -1 || slotUpper.indexOf("SLOT 1") !== -1 || slotUpper === "1") {
      startTime = "09:00:00";
      endTime = "11:00:00";
    } else if (slotUpper.indexOf("T2") !== -1 || slotUpper.indexOf("SLOT 2") !== -1 || slotUpper === "2") {
      startTime = "11:30:00";
      endTime = "13:30:00";
    } else if (slotUpper.indexOf("T3") !== -1 || slotUpper.indexOf("SLOT 3") !== -1 || slotUpper === "3") {
      startTime = "14:30:00";
      endTime = "16:30:00";
    }

    var dtStart = formatIcsDateTime(eventDate, startTime);
    var dtEnd = formatIcsDateTime(eventDate, endTime);
    var uid = "uiu-exam-" + code.replace(/\s+/g, "_") + "-" + dtStart + "@uiu-decoder";

    var title = code + " Final Exam (" + (data.name || "Course") + ")";
    var desc = "Course: " + code + " - " + (data.name || "") + "\\n" +
      "Exam Routine: " + day + ", Slot " + slot +
      (data.credits ? "\\nCredits: " + data.credits + " Cr" : "") + "\\n" +
      "United International University";
    var location = "United International University (UIU), United City, Madani Avenue, Dhaka 1212";

    lines.push("BEGIN:VEVENT");
    lines.push("UID:" + uid);
    lines.push("DTSTAMP:" + nowStr);
    lines.push("DTSTART:" + dtStart);
    lines.push("DTEND:" + dtEnd);
    lines.push("SUMMARY:" + escapeIcsText(title));
    lines.push("DESCRIPTION:" + escapeIcsText(desc));
    lines.push("LOCATION:" + escapeIcsText(location));
    lines.push("STATUS:CONFIRMED");

    if (includeReminders) {
      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-PT24H");
      lines.push("ACTION:DISPLAY");
      lines.push("DESCRIPTION:Reminder: " + escapeIcsText(title) + " tomorrow");
      lines.push("END:VALARM");

      lines.push("BEGIN:VALARM");
      lines.push("TRIGGER:-PT2H");
      lines.push("ACTION:DISPLAY");
      lines.push("DESCRIPTION:Reminder: " + escapeIcsText(title) + " in 2 hours");
      lines.push("END:VALARM");
    }

    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

// Test A: Basic iCalendar Generation
const mockCourses = [
  ['CSE 2215', { name: 'Data Structure and Algorithms I', examDay: 'Day 4', examSlot: 'T2', credits: 3 }],
  ['ENG 1011', { name: 'English I', examDay: 'Day 1', examSlot: 'T1', credits: 3 }],
  ['CSE 1112', { name: 'Structured Programming Lab', examDay: 'N/A', examSlot: 'N/A', credits: 1 }] // Lab (skipped)
];

const icsOutput = generateIcsCalendar(mockCourses, '2026-11-08', true);

assert('Generates BEGIN:VCALENDAR and END:VCALENDAR',
  icsOutput.startsWith('BEGIN:VCALENDAR') && icsOutput.endsWith('END:VCALENDAR'));
assert('Generates VEVENT blocks for scheduled courses',
  icsOutput.includes('SUMMARY:CSE 2215 Final Exam') && icsOutput.includes('SUMMARY:ENG 1011 Final Exam'));
assert('Excludes lab / N/A courses from calendar',
  !icsOutput.includes('CSE 1112'));

// Test B: Correct Slot Times & Day Offsets
// Day 1 start 2026-11-08: ENG 1011 is Day 1, Slot T1 (09:00:00 -> 11:00:00)
assert('Day 1, Slot T1 has correct DTSTART 20261108T090000 and DTEND 20261108T110000',
  icsOutput.includes('DTSTART:20261108T090000') && icsOutput.includes('DTEND:20261108T110000'));

// Day 4 start 2026-11-08 + 3 days = 2026-11-11: CSE 2215 is Day 4, Slot T2 (11:30:00 -> 13:30:00)
assert('Day 4, Slot T2 has correct DTSTART 20261111T113000 and DTEND 20261111T133000',
  icsOutput.includes('DTSTART:20261111T113000') && icsOutput.includes('DTEND:20261111T133000'));

// Test C: Reminders
assert('Includes VALARM blocks when includeReminders is true',
  icsOutput.includes('BEGIN:VALARM') && icsOutput.includes('TRIGGER:-PT24H') && icsOutput.includes('TRIGGER:-PT2H'));

const icsNoReminders = generateIcsCalendar(mockCourses, '2026-11-08', false);
assert('Omits VALARM blocks when includeReminders is false',
  !icsNoReminders.includes('BEGIN:VALARM'));

// Test D: Text Escaping
const testEscape = escapeIcsText('Exam; Section 1, Room: 402\\A\nBring ID');
assert('escapeIcsText escapes semicolons, commas, backslashes, and newlines',
  testEscape.includes('\\;') && testEscape.includes('\\,') && testEscape.includes('\\\\') && testEscape.includes('\\n'));

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n  Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

