/**
 * tests/test_schedule_prereq_github_prompt.js
 *
 * Verifies:
 * 1. Schedule & Prerequisites form additions in popup.html (In-Class & No-Prereq toggles)
 * 2. Community 1-Click GitHub issue contribution prompt in popup.html & popup.js
 * 3. Content script buildExtendedData discrimination between In-Class, Scheduled, and TBA
 * 4. Content script buildExtendedData discrimination between None and Prerequisites not listed prerequisites
 * 5. Course Details dynamic contribution card & post-edit save banner (User Added vs Edited vs Official)
 * 6. Zero innerHTML usage in new logic
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HTML = fs.readFileSync(path.join(ROOT, "popup.html"), "utf8");
const JS = fs.readFileSync(path.join(ROOT, "popup.js"), "utf8");
const CONTENT_JS = fs.readFileSync(path.join(ROOT, "content.js"), "utf8");
const CSS = fs.readFileSync(path.join(ROOT, "popup.css"), "utf8");

console.log("Running Schedule, Prerequisite & GitHub Prompt Tests...");

// ── 1. HTML Element Existence ────────────────────────────────────────────────
assert.ok(HTML.includes('id="singleCourseInClass"'), "HTML has #singleCourseInClass checkbox");
assert.ok(HTML.includes('id="singleCourseNoPrereq"'), "HTML has #singleCourseNoPrereq checkbox");
assert.ok(HTML.includes('id="singleCourseContribPrompt"'), "HTML has #singleCourseContribPrompt card");
assert.ok(HTML.includes('id="contribSubmitGithubBtn"'), "HTML has #contribSubmitGithubBtn button");
assert.ok(HTML.includes('id="contribDismissBtn"'), "HTML has #contribDismissBtn button");
assert.ok(HTML.includes('id="detailInClass"'), "HTML has #detailInClass in Details View");
assert.ok(HTML.includes('id="detailNoPrereq"'), "HTML has #detailNoPrereq in Details View");
assert.ok(HTML.includes('id="detailSaveContribPrompt"'), "HTML has #detailSaveContribPrompt in Details View");
assert.ok(HTML.includes('id="detailSaveContribGithubBtn"'), "HTML has #detailSaveContribGithubBtn");
assert.ok(HTML.includes('id="detailSaveContribDoneBtn"'), "HTML has #detailSaveContribDoneBtn");
assert.ok(HTML.includes('id="detailReportCard"'), "HTML has #detailReportCard");

// ── 2. CSS Styling Existence ─────────────────────────────────────────────────
assert.ok(CSS.includes(".form-checkbox-row"), "CSS has .form-checkbox-row");
assert.ok(CSS.includes(".form-checkbox-label"), "CSS has .form-checkbox-label");
assert.ok(CSS.includes(".contrib-prompt-card"), "CSS has .contrib-prompt-card");
assert.ok(CSS.includes(".btn-contrib-submit"), "CSS has .btn-contrib-submit");
assert.ok(CSS.includes(".routine-slot-badge.pending-slot"), "CSS has .routine-slot-badge.pending-slot");
assert.ok(CSS.includes(".detail-contrib-banner"), "CSS has .detail-contrib-banner");
assert.ok(CSS.includes(".report-card.is-user-added"), "CSS has .report-card.is-user-added");

// ── 3. Content Script Extended Data Behavior ─────────────────────────────────
// Extract buildExtendedData function from content.js for isolated unit testing
const buildExtMatch = CONTENT_JS.match(/function buildExtendedData\([\s\S]*?\n  \}/);
assert.ok(buildExtMatch, "content.js contains buildExtendedData");

// Create test sandbox for buildExtendedData
const showExamInfo = true;
const showPrerequisites = true;
function resolve(code) {
  if (code === "CSE 1111") return { name: "Structured Programming" };
  return null;
}

const testFn = new Function(
  "showExamInfo", "showPrerequisites", "resolve",
  `return ${buildExtMatch[0]};`
)(showExamInfo, showPrerequisites, resolve);

// Test A: Explicit In-Class exam
const resInClass = testFn({ name: "OOP Lab", examDay: "In-Class", examSlot: "", prerequisites: [] });
assert.strictEqual(resInClass.exam, "In-Class Evaluation", "In-Class must return 'In-Class Evaluation'");

// Test B: Empty / omitted exam schedule -> Routine Pending / TBA (NOT In-Class!)
const resEmptyExam = testFn({ name: "Algorithms", examDay: "", examSlot: "", prerequisites: [] });
assert.strictEqual(resEmptyExam.exam, "Schedule Pending / TBA", "Empty exam schedule must return 'Schedule Pending / TBA'");

// Test C: Standard scheduled exam
const resScheduled = testFn({ name: "Data Structures", examDay: "D1", examSlot: "T2", prerequisites: [] });
assert.strictEqual(resScheduled.exam, "D1, Slot T2", "Scheduled exam must return formatted parts");

// Test D: Explicit None prerequisites
const resNonePrereq = testFn({ name: "Intro to CS", examDay: "D2", examSlot: "T1", prerequisites: ["None"] });
assert.strictEqual(resNonePrereq.prereq, "No prerequisites", "Explicit 'None' must return 'No prerequisites'");

// Test E: Empty / omitted prerequisites -> Prerequisites not listed
const resEmptyPrereq = testFn({ name: "Senior Course", examDay: "D3", examSlot: "T3", prerequisites: [] });
assert.strictEqual(resEmptyPrereq.prereq, "Prerequisites not listed", "Empty prerequisites must return 'Prerequisites not listed'");

// ── 4. popup.js Zero-innerHTML and Event Wiring Check ────────────────────────
assert.ok(JS.includes("els.singleCourseInClass"), "popup.js references els.singleCourseInClass");
assert.ok(JS.includes("els.singleCourseNoPrereq"), "popup.js references els.singleCourseNoPrereq");
assert.ok(JS.includes("els.contribSubmitGithubBtn"), "popup.js references els.contribSubmitGithubBtn");
assert.ok(JS.includes("updateDetailReportCard("), "popup.js implements updateDetailReportCard");
assert.ok(JS.includes("Suggest this course"), "popup.js contains Suggest this course for user-added courses");
assert.ok(JS.includes("Suggest this update"), "popup.js contains Suggest this update for edited courses");
assert.ok(JS.includes("Report a course error"), "popup.js contains Report a course error for catalog courses");
assert.ok(JS.includes("els.detailSaveContribGithubBtn"), "popup.js references els.detailSaveContribGithubBtn");
assert.ok(JS.includes("https://github.com/litch07/uiu-course-decoder/issues/new"), "popup.js generates GitHub issue URL");

// Ensure no innerHTML was introduced in new handlers
const contribBlockIdx = JS.indexOf("els.contribSubmitGithubBtn?.addEventListener");
const contribBlockEnd = JS.indexOf("els.contribDismissBtn?.addEventListener");
assert.ok(contribBlockIdx !== -1 && contribBlockEnd !== -1, "Found GitHub contribution listener block");
const contribSnippet = JS.substring(contribBlockIdx, contribBlockEnd + 100);
assert.ok(!contribSnippet.includes(".innerHTML"), "Zero innerHTML in GitHub contribution handlers");

// ── 5. Header Settings Navigation Check (Courses & Import Headers) ─────────────
assert.ok(HTML.includes('id="coursesSettingsBtn"'), "HTML has #coursesSettingsBtn in Catalog header");
assert.ok(HTML.includes('id="importSettingsBtn"'), "HTML has #importSettingsBtn in Import header");
assert.ok(HTML.includes('id="detailsSettingsBtn"'), "HTML has #detailsSettingsBtn in Details header");
assert.ok(JS.includes("coursesSettingsBtn: document.getElementById(\"coursesSettingsBtn\")"), "popup.js references #coursesSettingsBtn");
assert.ok(JS.includes("importSettingsBtn: document.getElementById(\"importSettingsBtn\")"), "popup.js references #importSettingsBtn");
assert.ok(JS.includes("detailsSettingsBtn: document.getElementById(\"detailsSettingsBtn\")"), "popup.js references #detailsSettingsBtn");
assert.ok(JS.includes("settingsOriginView"), "popup.js tracks settingsOriginView for smart back-navigation");

// ── 6. Header Writing & Architectural Polish Checks ──────────────────────────
assert.ok(HTML.includes('<p class="brand-tagline">Decode. Map. Plan.</p>'), "Home uses the compact tagline");
assert.ok(HTML.includes('<p class="onboarding-tagline">Decode courses. Map prerequisites. Avoid exam clashes.</p>'), "Welcome retains the full tagline");
assert.ok(HTML.includes('id="coursesPanelTitle">Course catalog<'), "Catalog header title is updated");
assert.ok(HTML.includes("details-header-title-row"), "Details view features code-first header title row");
assert.ok(HTML.includes('id="detailsCourseSubtitle"'), "Details view has dynamic subtitle element");
assert.ok(HTML.includes("Add courses"), "Add / Import title is updated");
assert.ok(HTML.includes("Appearance, websites &amp; course data"), "Settings subtitle is updated");
assert.ok(CSS.includes(".details-header-title-row"), "CSS has .details-header-title-row");
assert.ok(JS.includes("detailsCourseSubtitle"), "popup.js references #detailsCourseSubtitle");

// ── 7. Single Border Focus on Text Inputs (No Double Border) ─────────────────
assert.ok(CSS.includes(".form-input:focus-visible") && CSS.includes("outline: none !important"), "CSS eliminates double-border on text inputs");

// ── 8. Warm Welcome & Orientation Card Checks ────────────────────────────────
assert.ok(HTML.includes('id="welcomeCard"'), "HTML has #welcomeCard");
assert.ok(HTML.includes('id="welcomeDismissBtn"'), "HTML has #welcomeDismissBtn");
assert.ok(HTML.includes('id="welcomeActionBtn"'), "HTML has #welcomeActionBtn");
assert.ok(CSS.includes(".welcome-card"), "CSS has .welcome-card styles");
assert.ok(CSS.includes(".btn-welcome-dismiss"), "CSS has .btn-welcome-dismiss styles");
assert.ok(JS.includes("welcomeCard: document.getElementById(\"welcomeCard\")"), "popup.js references #welcomeCard");
assert.ok(JS.includes("welcomeDismissed"), "popup.js checks and persists welcomeDismissed in storage");

console.log("All Schedule, Prerequisite & GitHub Prompt Tests Passed! 🎉");
