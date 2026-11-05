# UIU Course Code Decoder — Current State & Architectural Specification

> **Purpose**: This document provides a complete technical handover of the current state of the UIU Course Code Decoder browser extension. It details all architectural patterns, security guarantees, data models, and recent improvements across the extension for developers and AI assistants.

---

## 1. Project Overview & Core Philosophy

- **What it is**: A privacy-focused Manifest V3 Chrome extension designed for United International University (UIU) students. It automatically detects course codes (e.g. `CSE 3421`, `ACT 1111`) across webpages (UCAM, LMS, Google Docs, SVG charts) and decodes them into full course names, exam schedules, prerequisites, and degree notes.
- **Privacy First & Offline Operation**: Runs completely offline. Zero telemetry, zero analytics, zero external scripts. All database queries, user customizations, and storage occur locally in `chrome.storage.local`.
- **Zero-`innerHTML` Security**: Completely purged of `innerHTML` and `insertAdjacentHTML`. All DOM modifications use safe programmatic browser APIs (`createElement`, `createTextNode`, `textContent`), preventing DOM-based Cross-Site Scripting (XSS).
- **Per-Site Permissions Model**: Operates under least-privilege optional host permissions (`optional_host_permissions: ["*://*/*"]`), requesting permission only when the user explicitly enables a site. Content scripts are dynamically registered via `chrome.scripting.registerContentScripts` and persist across page reloads.
- **The Only Remote Request**: An optional, user-triggered "Sync Course Database" feature that fetches updates directly from the official GitHub repository (`raw.githubusercontent.com`) with an enforced 2 MB payload size limit.

---

## 2. Comprehensive Changelog of Recent Improvements

### A. Release 1: Trust & Ship (Current Release line 2.0.0+)
1. **Data Normalization & `prerequisiteNote`**:
   - Extracted non-course credit thresholds (e.g. `MINIMUM 85 credits`, `MINIMUM COMPLETED CREDIT 70`) from `prerequisites` arrays across all baseline catalog entries (`CSE 4000A`, `CSE 4451`, `DS 3120`, `DS 4000A`, `DS 4123`).
   - Preserved `prerequisites` strictly for valid course code strings.
   - Added dedicated `prerequisiteNote` inputs and display cards across `popup.html`, `popup.js`, and `content.js`.
2. **Zero-`innerHTML` Security Hardening**:
   - Refactored `content.js` and `popup.js` to build all DOM elements, tooltips, inline labels, and alert messages using programmatic node construction (`createElement`, `createTextNode`, `textContent`).
   - Zero occurrences of `innerHTML` or `insertAdjacentHTML` remain in active extension code.
   - Enforced a 2 MB payload size cap on both batch JSON imports and remote GitHub sync responses.
3. **Per-Site Dynamic Permissions & Reload Persistence**:
   - Replaced blanket `<all_urls>` with `optional_host_permissions: ["*://*/*"]` and `tabs` permission in `manifest.json`.
   - On site toggle, requests origin permission via `chrome.permissions.request({ origins: [origin] })`.
   - `background.js` dynamically registers content scripts for allowed sites (`chrome.scripting.registerContentScripts`) and handles tab reloads (`chrome.tabs.onUpdated`).
   - Added `window.__UIU_COURSE_DECODER_INJECTED__` duplication guard in `content.js`.
4. **1-Click "Report Wrong Data" Crowdsourcing Action**:
   - Added a "Report Wrong Data" button to the Course Details view (`details-view`).
   - Formats a student-friendly GitHub issue prefill with clean Markdown sections, emoji badges, and exact course metadata, without confusing HTML comment brackets.
5. **CI Validator & Repository Protection**:
   - Added `.github/workflows/validate-catalog.yml` for automated PR checking (JSON syntax, schema compliance, pure prerequisite arrays, and automated test execution).
   - Added `SECURITY.md` defining private vulnerability disclosure policies.
6. **Documentation & Visual Assets Modernization**:
   - Completely rewrote `README.md`, `PRIVACY.md`, `CONTRIBUTING.md`, and `SECURITY.md` in professional Project Voice.
   - Created `SCREENSHOTS_GUIDE.md` and pre-rendered dark-themed placeholder PNGs in `assets/` to ensure zero broken image links.
7. **Production Distribution Packaging**:
   - Built verified Chrome Web Store distribution package `dist/uiu-course-code-decoder-v2.0.0.zip`.

---

### B. Release 2 (Completed): Usability Polish
1. **Contextual Export in Course Manager (Task 2.1)**:
   - Added `#exportCoursesBtn` in Course Database header alongside Trash bin button.
   - Interactive modal (`#exportModal`) with Zero-`innerHTML` DOM node generation, backdrop blur, and Escape key dismissal.
   - Contextual intelligence: dynamically detects search query or active filter (User Added, Edited, Official) and offers single-click export of currently visible courses.
   - Active Database export: one-click clean JSON export of all merged active courses with 2-space indentation.
   - Custom Additions export: exports user-created and modified courses for backups or sharing.
   - Tactile feedback: animated checkmark on the header export button upon download.
   - Verified 100% round-trip compatibility with Batch Upload parser and zero `innerHTML` usage.

2. **File Import with Pre-Commit Preview (Task 2.2)**:
   - Interactive drag-and-drop zone (`#fileDropZone`) and file browse button in Batch Upload.
   - Real-time pre-commit diff calculation (`computeImportDiff`) categorizing incoming entries into New, Updated (with Before/After comparison), Unchanged, and Invalid.
   - Pre-Commit Preview Modal (`#importPreviewModal`) with summary pill badges and scrollable field-level change cards.
   - 1-click "Confirm & Merge" applying verified updates to storage and auto-cleansing soft and hard trash.
   - Zero-`innerHTML` security throughout with 2 MB safety cap and strict `.json` extension enforcement.

3. **Allowed Domains Search & Bulk Management (Task 2.3)**:
   - Added real-time domain filtering input (`#domainSearchInput`) with instant substring matching and clear button.
   - Dynamic count badge (`#domainsCountBadge`) showing active filter status (e.g. `Showing 2 of 5` vs `5 domains`).
   - Bulk selection toolbar (`#domainBulkToolbar`) featuring indeterminate "Select All" / "Deselect All" checkbox and dynamic "Remove (N)" button.
   - Bulk remove confirmation modal integration (`#modalOverlay`) with automatic host permission revocation via `chrome.permissions.remove`.
   - Multi-select row checkboxes with active row highlighting (`.allowlist-item.is-selected`) and individual removal preservation.
   - Automated regression test suite `tests/test_allowed_domains_management.js` (6/6 passing).

4. **Prerequisite Tree & "Unlocks" Explorer with Code ↔ Name Toggle (Task 2.4)**:
   - Interactive dependency explorer embedded directly into Course Details (View 3).
   - Recursive BFS Prerequisite Chain (`#prereqChainCard`): Maps the complete ancestry tree with depth-level badges (Direct L1, transitive L2+), depth indicators, and missing catalog code indicators (amber warning badges).
   - Reverse "Unlocks" Tree (`#unlocksCard`): Reverse catalog lookup identifying every future course listing the active course as a prerequisite.
   - Interactive Segmented View Toggle (`#prereqViewToggle`): Allows students to toggle between "Code" and "Name" display modes with instant re-rendering, tooltip inversion (Code mode shows name on hover; Name mode shows code on hover), and automatic persistence in `chrome.storage.local` (`prereqShowNames`).
   - Click-to-Navigate: Every valid course badge in either view acts as a button seamlessly opening that course's details.
   - Cycle-safe traversal with visited Set and 100% Zero-`innerHTML` DOM node construction.
   - Automated regression test suite `tests/test_prereq_tree.js` (29/29 passing assertions).

5. **Content Script Context Resilience & Reload Defense**:
   - Added top-level extension context guards in content.js verifying chrome, chrome.runtime, chrome.runtime.id, chrome.storage, and chrome.storage.local before script execution.
   - Defensively wrapped chrome.storage.local.get and chrome.storage.onChanged.addListener with try/catch and runtime validity checks, completely eliminating `TypeError: Cannot read properties of undefined (reading 'local')` when reloading the extension in chrome://extensions or navigating pages with unprivileged/sandboxed iframes.
   - Refined background.js tab update listener to inject strictly on `changeInfo.status === "complete"`, preventing premature script execution in unready frame states.
   - Added automated verification test suite `tests/test_content_script_resilience.js` (5/5 passing).

6. **GitHub Pages Documentation & Public Course Explorer (Task 2.5)**:
   - Standalone, zero-dependency web catalog and interactive visual explorer hosted at `https://litch07.github.io/uiu-course-decoder/` under `docs/`.
   - Client-side real-time multi-field search and department pills (CSE, Data Science, EEE, Business, Math & Sciences, General/Humanities).
   - Deep course inspector modal with full exam routines, special credit prerequisites, and interactive recursive dependency trees.
   - Code ↔ Name view toggle with persistent local preferences.
   - Deep-linking URL hash routing (`#CSE-2215`) allowing 1-click course sharing via Messenger/Discord.
   - Fully automated deployment workflow via `.github/workflows/deploy-pages.yml`.
   - Strict Zero-`innerHTML` DOM construction throughout (`tests/test_github_pages_docs.js`, 36/36 passing).

---

### C. Release 3 (Completed 🎉): Daily Academic Value
1. **Course Credits Integration Across Schema & UI (Task 3.1)**:
   - Official undergraduate course credit counts (e.g. `3.0`, `1.5`, `1.0`, `2.0`) integrated directly into `courses.json` and `docs/courses.json` from departmental offerings.
   - View 1 (Course List Table): Displays course credit chips (`.course-credit-chip`, e.g. `3.0 Cr`) next to origin tags.
   - View 3 (Course Details): Added `#detailCredits` input in `.details-card`, allowing students to inspect and customize credits (with zero redundant header clutter).
   - View 4 (Add / Import Courses): Added `#singleCourseCredits` in `.form-row-3col`.
   - Pre-Commit Diff Engine: `computeImportDiff` detects, compares, and displays credit modifications (`oldVal` vs `newVal`).
   - Content Script Overlay (`content.js`): `buildTooltipDom` renders a dedicated `Credits: X Cr` detail row inside the hover card.
   - Public Web Explorer (`docs/`): Displays credit badges on course cards and in the course inspector modal.
   - Full automated test suite in `tests/test_course_credits.js` (31/31 passing).

2. **Dedicated "My Courses & Exam Routine" Screen & Clash Detector (Task 3.2)**:
   - Dedicated Feature View (`.mycourses-view`): Transformed "My Courses" from an overloaded table filter into a full-featured personal academic planner screen accessible directly from the clean Home Screen button (`#homeEnrolledCard`) and course details.
   - Interactive Course Catalog Hero Card: Converted static "Courses Indexed" pill into an interactive top card (`#openCoursesBtn`) with book icon, live catalog count, and right chevron arrow, eliminating the redundant bottom button and achieving zero vertical scrolling on the Home dashboard.
   - Cleaned Catalog Table: Removed star icons (`★`) and inline credit chips from the Course Database table rows in View 1, restoring over 100px of width for course titles and eliminating table overflow/cramming within the 360px viewport.
   - Quick Add Search with Autocomplete: Real-time search box (`#myCoursesSearchInput`) in the My Courses screen that suggests unenrolled courses on-the-fly with 1-click addition (`+ Add`).
   - Trimester Summary: Real-time summary card showing total enrolled courses and total credit hours.
   - Dual-Level Exam Routine Conflict & Workload Detector:
     * **Direct Collision Engine (`detectExamClashes`)**: Evaluates enrolled course routines, groups overlapping Day & Slot timings, and alerts students of critical exam clashes (same day & same slot) while intelligently filtering out labs and in-class evaluations.
     * **Same-Day Multiple Exam Warning Engine (`detectSameDayExams`)**: Alerts students whenever 2 or more enrolled courses share the same final exam date (even with different slots, e.g. T1 & T3), avoiding severe advising burnout and intense multi-exam stress.
     * **Multi-Surface Warnings**: Displays critical red badges (`🚨 N Clashes`) or high-workload amber alerts (`⚠️ 2 on Same Day`) on Home (`#homeClashBadge`), My Courses top alert box (`#clashAlertBox`), enrolled course cards (`.enrolled-card-sameday-banner`), and live in Course Details (`#detailClashWarning`).
   - Rich Enrolled Course Cards: Displays enrolled courses with day/slot badges, credit badges, same-day warnings, quick "Inspect" navigation into View 3, and individual "Drop" buttons (`btn-card-drop`).
   - Drop All Courses Safety Action: Allows clearing enrolled courses with confirmation (`#clearEnrolledBtn`).
   - Strict Zero-`innerHTML` DOM generation with 100% test coverage in `tests/test_my_courses_clash_detector.js` (39/39 passing).
3. **Community & Contribution Discovery System (Task 3.6)**:
   - Dedicated Contribution Modal (`#contributionModal`): Accessible via clean 32×32 Info buttons (`ℹ`) across Course Database (`#openContribModalBtn`), Course Details (`#detailsInfoBtn`), and Add/Import (`#importInfoBtn`), as well as a "Contribute" footer link on the Home dashboard (`#homeContributeBtn`).
   - 3-Pronged Action Paths:
     1. Direct link to official `CONTRIBUTING.md` guide for formatting rules and course schema.
     2. Pre-filled GitHub Issue link with intelligent markdown templates tailored for:
        - Specific course data corrections (when accessed from Course Details, capturing code, title, credits, exam day/slot, prerequisites, notes).
        - Missing course additions & department curriculum reports (when opened from catalog/home, providing prompts for course code, title, department, credits, routine, prerequisites, and syllabus/routine proof).
     3. 1-click "Export Custom Courses as JSON" action formatted for Pull Request submission.
   - Contextual Empty-Search Guidance: When course searches return 0 matches, displays a prompt inviting students to contribute missing courses to the official catalog.
   - Batch Upload Contribution Tip: Surfaces a gentle prompt in View 4 encouraging students with custom department curricula to share them repository-wide.

4. **Course Routine & Markdown (.md) Export with Real-Time Slot Timings (Task 3.3)**:
   - **Academic Routine Markdown Generator (`generateRoutineMarkdown`)**: Generates an elegant, fully structured `.md` document containing enrolled courses, credit load, complete exam routines, UIU standard time windows, in-class evaluations, and comprehensive conflict analysis.
   - **Exact UIU Slot Timing Engine (`getExamSlotTiming`)**: Standardizes official university exam time slots:
     * **Slot T1**: `09:00 AM – 11:00 AM`
     * **Slot T2**: `11:30 AM – 01:30 PM`
     * **Slot T3**: `02:00 PM – 03:00 PM`
   - **Inline Slot Timings on Enrolled Cards**: Directly presents the full time window in `.enrolled-course-card` (e.g., `Exam: Day 4 • T2 (11:30 AM – 01:30 PM)`), in same-day exam warning banners, and in collision alerts.
   - **1-Click Header Export Action (`#exportRoutineMdBtn`)**: Accessible via the header of `.mycourses-view`, downloading a clean Markdown routine file with automatic filename timestamp (`uiu-enrolled-routine-YYYY-MM-DD.md`) and tactile button animation.
   - **Obsolete ICS Calendar Purge**: Permanently purged unreliable continuous-day `.ics` assumptions that failed to account for Bangladesh off-days, Friday prayers, national events, and mid/final distinction.
   - **Comprehensive Automated Test Suite**: `tests/test_routine_markdown_export.js` (27/27 passing assertions) along with `tests/test_exam_calendar_export.js` delegation shim.

5. **System-Adaptive OLED Dark Mode Palette (Task 3.4)**:
   - Deep OLED Dark Theme: Custom-engineered OLED palette with pure blacks (`--bg: #090d16`), dark surfaces (`--surface: #111827`, `--surface2: #162032`), high-contrast text (`--text-main: #f9fafb`, `--text-muted: #94a3b8`), and refined borders (`--border-color: #243048`).
   - Settings Preference Radiogroup (`#themeOptionsGroup`): Segmented 3-state control in View 5 supporting System Default (`#themeSystem`), Light (`#themeLight`), and Dark OLED (`#themeDark`).
   - Zero-Flash Pure CSS Fallback: Uses `@media (prefers-color-scheme: dark)` and `:root:not([data-theme="light"])` to guarantee zero white flash before storage initializes.
   - Dynamic OS Media Query Listener: Instantly switches theme when OS preference changes while on System mode.
   - Persistent Local Storage: Retains user preference across browser sessions in `chrome.storage.local` under `themePreference`.
   - Comprehensive test suite: `tests/test_dark_mode_palette.js` (45/45 passing).

6. **Keyboard Navigation & ARIA Accessibility (Task 3.5)**:
   - Full ARIA Landmarks: Added `role="region"` and `aria-label` to all 5 sliding panels; `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` across all confirmation and export modals.
   - Tabs & Controls Semantics: Implemented `role="tablist"`, `role="tab"`, `aria-selected`, and `aria-controls` on import tabs; `role="radiogroup"` and `role="radio"` on theme and prerequisite view controls.
   - Modal Focus-Trapping: Dependency-free engine cycling keyboard focus within open dialogs on `Tab` and `Shift+Tab`, with automatic restoration to trigger elements upon close.
   - Hierarchical Escape Retreat: `Escape` closes top-layer modals first, and progressively returns backward through sliding panels (Details &rarr; Import &rarr; Settings &rarr; Catalog &rarr; Home).
   - Arrow Key Traversal: Fluent keyboard navigation across tabs, theme options, filter buttons, and prerequisite view switches.
   - High-Contrast Visible Focus Ring: WCAG-compliant `:focus-visible` outline rings across light and OLED dark palettes.
   - Comprehensive test suite: `tests/test_keyboard_accessibility.js` (34/34 passing).

### B. View 4 (Add / Import Courses) Architecture & Design
1. **Tabbed Navigation (`Single Course` vs `Batch Upload`)**:
   - Clean segmented tab switcher (`.import-tab-nav` and `.import-tab-btn`) with smooth cubic-bezier transitions, theme-adaptive surfaces, and zero layout shift.
2. **Single Course Addition Form**:
   - `Course Code`: Auto-uppercases user input; validates non-empty format (e.g., `CSE 3715`).
   - `Course Name`: Required primary title.
   - `Schedule & Credits (3-Column Responsive Row)`: Exam Day (`D1-D8`), Exam Slot (`T1-T3`), and Credits (`0.5-15` step) fitting side-by-side in 360px viewport without label wrapping.
   - `Prerequisites`: Comma-separated list of course codes, automatically trimmed and upper-cased into an array.
   - `Prerequisite Note`: Dedicated input for credit minimums (e.g. `Minimum completed credit 70`).
   - Clean Typography & Spacing: Uncluttered labels with red asterisks for required fields; no distracting per-field SVG icons.
   - Safe controls: `Add Course to Catalog` (`#addSingleCourseBtn`) and `Clear` (`#clearSingleFormBtn`) with keyboard `Enter` support across all 7 fields and complete state reset.
3. **Batch Upload (JSON) Redesign**:
   - Header bar with real-time validation status badge (`#batchJsonBadge`).
   - 2-course sample template with one-click `Copy` button.
   - Drag-and-drop zone (`#fileDropZone`) with file card display, 2 MB payload size limit, and keyboard accessible file browse pill.
   - High-contrast, theme-adaptive guidance box (`.import-hint`) with left accent border.
4. **Pre-Commit Diff Modal (`#importPreviewModal`) & Feedback System**:
   - Complete theme adaptability: Modal content, title, subtitle, close button, diff cards, and before/after comparison tables dynamically adapt to light and OLED dark palettes.
   - Summary badges: `+N New`, `~N Modified`, `=N Identical`, `!N Skipped` with dark mode contrast overrides.
   - Clean empty state (`.preview-empty-state`) when imported file matches local database identically.
   - Color-coded SVG status messages for Success, Error, and Info with smooth fadeIn animations.

---

### C. View 3 (Course Details) Redesign & View 6 (Prerequisite Tree & Curriculum Flow)
- **Directly Accessible Form Card (`.details-card`)**: Form inputs (`Course Name *`, `Prerequisites`, `Prerequisite Note`, `Exam Day`, `Exam Slot`, `Credits`, and `In-Class` evaluation checkbox) are neatly encapsulated inside a clean card with an 11px border radius, `--surface` background, subtle elevation, and direct inline editing with immediate `Save Changes` (`#detailSaveBtn`) and `Delete Course` (`#detailDelBtn`).
- **Dedicated Curriculum Roadmap & Flow Screen (View 6: `.flow-view`)**: Shifted the interactive prerequisite chain and reverse unlocks trees into a dedicated, focused screen (`.flow-view`), opened via the prominent launcher card (`#detailPrereqLauncherCard` / `#btnOpenPrereqFlow`) in Course Details.
- **Unified 2-Column Prerequisite & Unlock Cards**: Displays required prerequisite courses and unlocked forward paths as clean 2-column cards featuring course code, credits pill (`X.X Cr`), and full course title.

### D. Modal & Confirmation Message Consistency
- Standardized **Empty Trash / Permanent Delete All** and single course permanent delete dialogs with confirmation modals and backdrop blur (`backdrop-filter: blur(2px)`).

---

### E. Navigation & Tactile Micro-Interactions
- Layered stack view navigation (`position: absolute; inset: 0;`).
- Parallax shifts and elevation shadows during screen transitions.
- Tactile spring-eased compression feedback (`:active`) on buttons, inputs, and toggles.
- Accessibility support via `@media (prefers-reduced-motion: reduce)`.

---

## 3. Current Data Architecture & Merge Precedence

### Storage Keys (`chrome.storage.local`)
| Key | Type | Description |
|---|---|---|
| `courses` | `Object` | The active, merged dictionary of courses used by `content.js` |
| `userCourses` | `Object` | User-created courses and user edits to official courses |
| `softDeletedCourses` | `Array<string>` | Soft-deleted course codes (Trash view). Reversible via Restore |
| `hardDeletedCourses` | `Array<string>` | Hard-deleted course codes. Purges overrides; permanently excluded |
| `remoteCourses` | `Object` | Cached catalog fetched from the latest successful Sync |
| `lastSyncedAt` | `number` | Unix timestamp of last successful sync |
| `lastSyncResult` | `Object` | Diff summary (`added`, `updated`, `removed` counts and codes) |
| `mode` | `string` | `"highlight"` \| `"tooltip"` \| `"inline"` |
| `allowedSites` | `Array<string>` | Hostnames permitted to run `content.js` |
| `showExamInfo` | `boolean` | Display exam date & slot |
| `showPrerequisites`| `boolean` | Display prerequisite course codes |

### Canonical Course Object Schema
```json
{
  "CSE 4000A": {
    "name": "Final Year Design Project - I",
    "credits": 3,
    "examDay": "Day 4",
    "examSlot": "T2",
    "prerequisites": [],
    "prerequisiteNote": "MINIMUM 85 credits"
  }
}
```

### Merge Pipeline (`background.js`)
```
[bundled courses.json]
         ↓
  + [remoteCourses] (overwrites official if synced)
         ↓
  + [userCourses] (user additions & edits take highest precedence)
         ↓
  - [softDeletedCourses] (filtered out)
  - [hardDeletedCourses] (filtered out)
         ↓
= Final [courses] in chrome.storage.local
```

### Deletion Rules
1. **Soft Delete**: Adds course code to `softDeletedCourses`. Preserves any edit in `userCourses`. Appears in Trash view. Restoring moves it back to active courses with edits intact.
2. **Hard Delete**: Removes course from `userCourses` and adds code to `hardDeletedCourses`. Permanently excluded.
3. **Intentional Re-creation**: If a user re-adds or imports a course code previously in `hardDeletedCourses` or `softDeletedCourses`, the system automatically cleanses the code from both delete arrays.
4. **Emergency Reset**: "Reset Official Courses to Default" purges `softDeletedCourses` and `hardDeletedCourses` completely while leaving custom `userCourses` intact.

---

## 4. Key Files & Structure

- `manifest.json` — Manifest V3, optional host permissions (`*://*/*`), `tabs`, `scripting`, `storage`.
- `popup.html` — 7-view sliding stack UI (Home Dashboard, Course Database, Course Details & Editor, Add/Import Courses, My Courses & Routine, Prerequisite Flow View, Settings & Preferences) with zero `innerHTML`.
- `popup.css` — Dedicated stylesheet containing all design tokens, card styles, transitions, animations, and component layouts.
- `popup.js` — Client-side UI logic, view router, form validation, real-time JSON editor badge, message helpers, dynamic permission requests, and GitHub issue generator.
- `background.js` — Service worker. Handles catalog merging, storage migration, remote synchronization, dynamic content script registration, and tab update listeners.
- `content.js` — Injected script with Zero-`innerHTML` security. Builds regex matcher from `courses`, decorates DOM nodes (inline, tooltip, or highlight), manages Highcharts SVG overlays, and uses `MutationObserver` safely.
- `courses.json` — Bundled baseline catalog (~44KB, ~315 courses) ensuring 100% offline functionality.
- `assets/` — Visual screenshots and pre-rendered dark-themed placeholder PNGs for documentation.
- `SCREENSHOTS_GUIDE.md` — Complete visual capture instructions for all documentation assets.
- `SECURITY.md` — Vulnerability disclosure policy & security model.
- `PRIVACY.md` — Full transparent privacy documentation.
- `CONTRIBUTING.md` — Contribution guide and course schema specification.
- `.github/workflows/validate-catalog.yml` — Automated CI workflow validating catalog syntax and running regression tests.
- `tests/` — Comprehensive automated test suite (24 test suites):
  - `tests/test_batch_upload.js`
  - `tests/test_empty_trash_all.js`
  - `tests/test_merge.js`
  - `tests/test_merge_v2.js`
  - `tests/test_migration.js`
  - `tests/test_official_hard_delete.js`
  - `tests/test_restore_official.js`
  - `tests/test_single_and_batch_integration.js`
  - `tests/test_single_course_add.js`
  - `tests/test_sync_diff.js`
  - `tests/test_release1.js`
  - `tests/test_contextual_export.js`
  - `tests/test_file_import_preview.js`
  - `tests/test_content_script_resilience.js`
  - `tests/test_allowed_domains_management.js`
  - `tests/test_prereq_tree.js`
  - `tests/test_github_pages_docs.js`
  - `tests/test_course_credits.js`
  - `tests/test_my_courses_clash_detector.js`
  - `tests/test_routine_markdown_export.js` *(also delegating shim `tests/test_exam_calendar_export.js`)*
  - `tests/test_dark_mode_palette.js`
  - `tests/test_keyboard_accessibility.js`
  - `tests/test_google_sheets_pubhtml.js`
  - `tests/test_schedule_prereq_github_prompt.js`

---

## 5. How to Verify Codebase Health

Run the entire automated test suite sequentially from the repository root:
```powershell
node tests/run_all.js
```
**Expected Result**: All 24 test suites pass with zero failures.


## Product quality and interface conventions (November 2026)

- Headers use Course catalog, Course roadmap, Add courses, My courses & exams, and Settings. Secondary catalog actions share a keyboard-accessible native disclosure. The roadmap button has a title and counts on separate lines.
- My Courses is a local personal planner, not UCAM registration. Display labels use Add/Remove, Catalog/Custom/Edited, and explicit missing-data states. No unknown credit value is replaced with three credits; totals state missing credit values.
- Empty prerequisite data means prerequisites are not listed. Only an explicit None value means no prerequisite courses. No reverse dependencies means no next courses listed, not a capstone designation.
- Course edits save directly after validation. Failed storage writes preserve the form and active catalog. Leaving a modified form prompts Keep editing or Discard changes. Reversible individual deletion offers Undo; individual restore has no extra confirmation. Permanent/bulk actions retain explicit confirmations.
- Source and exam-term metadata are not invented. The planner/export explains the current metadata gap and directs students to UCAM for the latest routine. Last synced records a download, not verification.
- Contributions open GitHub drafts for review and submission. They do not publish on click. Project links point to the same shared catalog repository.
- Popup fonts are local/system fonts. Status messages have live-region semantics, errors persist, and the existing reduced-motion support is retained.
- `tests/product_quality_checks.js` extends the prerequisite suite with production-code persistence, dirty-form, missing-credit, accessibility, and offline-style checks. The master runner remains 24 suites.

- Export uses labelled header actions and a scope-selection dialog with a separate Download JSON action. All export scopes preserve known credits and prerequisite notes. Failed downloads retain the dialog and selection; feedback reports initiation, not file-save completion.
- Course headers always display Catalog, Custom, or Edited in a stable nonshrinking badge. Legacy source-color overrides were removed for readable theme-adaptive labels.
- Improve catalog replaces the generic information/contribution entry. Its dialog offers correction reporting and a contribution guide; custom backups are available only through Export.

- Catalog search displays a matching-course count; quick-add search displays the full count of courses available to add before limiting suggestions to five. Both searches share case-insensitive matching, compact-code support (CSE3411), and deterministic ranking of exact codes, code prefixes, other code matches, then name matches.
- Matching code/name text is marked using escaped literal patterns and safe DOM nodes. Result announcements are polite and debounced; quick-add clearly states when only the first five matches are shown. Current-results JSON export uses the same matching rules as the catalog.

- Home presents Catalog, My courses & exams, current website, then Website display. Empty planners show an invitation instead of zero totals. The optional catalog update action is inside the Catalog card and reports last-sync age; the duplicated Settings notification dot and Home attribution footer are removed. Developer/repository links remain in Settings About.
- Home website states distinguish enabled, disabled, and unsupported pages. All display switches have explicit labels. Empty, active, overdue-sync, and unsupported-page variants fit 360 × 500px, including simultaneous sync and exam notices.

- Home retains the developer attribution and GitHub link in a compact footer, restored at the author’s request. Settings About retains the same project details.

- Home uses the tagline Decode. Map. Plan.; Welcome expands it to Decode courses. Map prerequisites. Plan exams.
- Home exam summaries display time conflicts and same-day exam counts independently. Conflict rows include day and slot; workload rows include counts for each affected day. Long summaries show two days plus the remaining-day count, while titles and accessible labels retain full detail. Cleared plans hide both rows.

- Catalog reporting uses visible contextual actions and separate correction/missing-course choices. All popup paths and the public explorer use matching Markdown drafts with accurate unknown prerequisites, normalized day labels, official-source prompts and exam trimester/year. Opening GitHub never submits automatically.

- Edited-course GitHub drafts compare saved local details with bundled + downloaded catalog data, listing only changed fields in a Markdown table. Repeated edits preserve the catalog baseline; unavailable baselines, removed values and no remaining differences are explicit. The edited-course action explains this comparison.

- Details Save is disabled until meaningful form changes exist, disables again after save/revert, and permits retry after failure. Saving is tracked separately from unchanged state so Back remains available. Draft actions wait for local edits to be saved; add/edit/report buttons classify actual course origin consistently. Changes made during an in-flight save remain unsaved.

- Settings uses five consistent sections: Appearance, Enabled websites, Catalog updates, About, then Reset catalog changes. Controls have readable labels, outlined icons, theme-aware native checkboxes and restrained destructive styling. Home’s update reminder opens the catalog section directly; update failures persist with an enabled retry action. Developer attribution remains in About and on Home.

- Trash uses readable course cards with labelled Restore and Delete permanently actions, course-specific confirmation text, clear empty/search states, and code/name matching shared with Catalog. The three-line catalog menu has a steady glow and dot while Trash contains courses, a count inside its menu, and an accessible count label; all indicators clear automatically when Trash empties.

- Temporary notifications use the available popup width with themed surfaces, outlined status icons, readable wrapping and a separate Undo action. Errors remain visible longer; expired actions are inert. Confirmation dialogs use semantic titles/descriptions, left-aligned copy, action-specific labels and destructive styling only for destructive actions, with cancel focused by default.

- Catalog updates now fetch without storage writes, show a review of shared additions/changed fields/removals, and apply only after approval. Cancel preserves timestamps and data; unchanged catalogs need no dialog. Local overrides remain in use. Apply revalidates the reviewed payload and rejects stale shared-catalog revisions.

- Reset opens one review listing catalog courses restored from Trash/exclusions and changed local fields discarded against merged catalog defaults. Custom courses and their deletion states are preserved. Cancel performs no reset writes; apply rechecks the reviewed state, stages storage before updating memory, and leaves a reset summary. With no work, Review reset is disabled with an explanatory hint.

- First-run welcome uses a compact branded introduction, three task-focused rows, website-enabling guidance, local-planning/UCAM reminder and privacy note. Get started remains visible at 360×500; both dismissal controls preserve the one-time preference and return keyboard focus to Home.

- Interaction polish standardizes short color/border feedback, focus rings, selected filter announcements and disabled/loading cursors. Enlarging hover effects are restrained; positional search controls keep their centering. Navigation and dialogs retain their short transitions, and reduced-motion preferences suppress transitions and animations throughout.

- Buttons now share one hover/press feedback system with semantic primary, destructive and neutral colors. Selected controls retain their selection language; tabs and cards stay stationary. Disabled controls suppress hover responses, busy controls use a progress cursor, and reduced motion removes press movement while preserving feedback colors.

- SVG audit corrected disconnected sync arrows, replaced shared action icons with consistent single-path outlines, and prevented legacy solid-fill rules from filling outline icons. Spinner rotation uses the view-box center and respects reduced motion. Browser checks found no invalid paths or incorrectly filled outline SVGs in the popup.

- Data integrity fixes introduce course-data.js validation/parsing for ingress, including finite credits, canonical code collisions, reserved/invalid keys, duplicate JSON keys and prerequisite cycles. Name-only imports preview their effective merged result; complete objects can explicitly clear fields. Imports and adds stage storage before updating memory. Exam aliases and selection duplicates are normalized, unknown times do not clash, and website matching accepts compact/multiple-space codes. Both catalogs remove the CSE 4327 self-reference with an explicit verification note. No missing academic facts were guessed. CI additionally runs scripts/validate_catalog.js.

- Dark mode retains OLED #090d16 and uses unified #141b27 cards, #1c2534 secondary surfaces, #101722 inputs, #e6ebf2 primary text and #b0bdce secondary text. Headers use quiet separators; primary actions have warm peach fills and dark text. Warnings, destructive actions and diff badges use restrained semantic colors. Legacy dark literals now use shared tokens. Browser review covered nine page states plus import/export/reset dialogs and a light-mode check; visible text samples on the nine page states met 4.5:1 contrast.

- Dark buttons now use muted warm surfaces, pale readable labels and restrained borders instead of bright peach fills. Hover and press deepen the same palette. Destructive controls use subdued rose surfaces; final destructive confirmations remain emphasized. Icons no longer shift or switch to bright filled backgrounds on hover, while loading rotation remains available.


### Website tooltip interaction
- Highlight keeps a persistent background; Tooltip uses a subtle dotted underline. Both reveal the same course facts on hover or keyboard focus. Inline keeps its visible expansion and opens the shared tooltip only for additional facts such as credits or full prerequisite names. Compact cells expose full details.
- One tooltip per document uses safe DOM construction, an anchored pointer, viewport-aware placement, light/dark/system appearance, and reduced-motion support. Long prerequisite content scrolls within the available space.
- Hover opens after 220 ms; a 140 ms leave delay allows moving onto the tooltip. Focus opens immediately. Escape, page scroll, resize, window blur, and local setting changes dismiss it.
- HTML course markers are keyboard reachable without adding tab stops inside existing controls. Descriptions attach to the focused marker or its enclosing link and preserve existing `aria-describedby` references.
- Production controller and positioning checks run within the content-script resilience suite (`tests/tooltip_interaction_checks.js`).


### Course charts and inline routines
- SVG axis labels retain short course codes and their original font weight. Tooltip-mode labels inherit their original fill; accent fills are applied only in Highlight mode, including truncated labels. Inline mode falls back to Highlight for these labels; Tooltip mode remains available. Removed native SVG titles are restored when changing modes or disabling decoding, including truncated labels.
- Recognized Highcharts course charts show expanded details on hover. Click/tap pins a stable copy, preserving attendance figures while other points are hovered; the native hover surface is hidden while a copy is pinned. Clicking the same point releases the pin and restores normal hover behavior. Outside clicks, Escape, scroll, resize, or settings changes also release the pin. Unrecognized charts retain their native tooltips.
- Chart details use a consistent system sans-serif font, a 14px semibold course name, aligned label/value columns, neutral attendance text, wrapped prerequisites, and themed surfaces with a subtle border and shadow. Native direct path/rect background variants are suppressed after the custom background exists, preventing overlapping boxes; a small gap separates course facts from attendance figures. Hover enrichment runs once per animation frame after the chart updates. Inline HTML routines use aligned Exam/Prerequisites rows, prerequisite codes, and keep short section suffixes on the course title line. Full prerequisite names remain in hover/chart details. Routine entries use a subtle left marker, stronger course codes, and evenly spaced table rows so the time remains aligned. Unknown routine metadata reads “Not listed in catalog” rather than repeating the field label.
- Table wrapping is applied through CSS while inline markers exist; host cell styles and `nowrap` attributes are no longer overwritten. Original course text and section suffixes are restored on disabling decoding.
- Controller, rendering, and truncated-label restoration regression checks run within the existing content-script resilience suite.


### Bounded chart cards and attendance colors
- Visible chart popups use the shared HTML tooltip surface, rather than a cloned SVG group. Course facts have a bounded scroll area; attendance rows remain in a separate footer. Both areas adapt to the viewport height without dropping prerequisite text or changing source attendance figures.
- Attendance status labels and values use readable blue (Remaining), red (Absent), and green (Present), with separate dark-theme tokens. Other history rows retain neutral text. Source SVG tooltip content is hidden and used only to resolve course information and read the chart's existing history rows.
- Hover opens the card; moving onto it permits reading/scrolling. Click pins it, another click releases the pin, and Escape/outside clicks dismiss it. Scrolls inside the card keep it open; page scrolling dismisses it.
- Regression checks cover source history extraction, semantic status mapping, independent details/footer DOM, hover/pinning, and preserving exact attendance values. Long-list browser fixtures verify viewport bounds and footer visibility at normal and short window heights in both themes.


### Inline layout boundaries
- ARIA/grid cells and bounded or clipped table cells use compact Inline titles. Long names truncate within the cell; the code and section remain in the title, and the shared tooltip exposes full facts on hover or keyboard focus. All Inline wrappers omit the native browser title. Ordinary Inline titles expose only additional facts in the shared tooltip; compact titles retain full tooltip details.
- Expanded table-cell wrapping and routine spacing use explicit `data-cce-inline-cell` and `data-cce-inline-row` markers. Only the nearest course cell/row is marked. Enclosing table rows and unrelated grid cells no longer match descendant-based layout overrides.
- Markers are cleared before metadata updates and when decoding is disabled or the mode changes. Host style and `nowrap` attributes remain untouched.
- Unit regressions run in the content-script resilience suite. `tests/fixtures/inline_layout.html` loads the real content script and runs 35 browser checks: serve the project root on localhost, open the fixture, and inspect its JSON result. It covers geometry, nested rows, keyboard details, metadata toggles, mode switches, and restoring original text.


### Inline supplementary tooltips and adaptive Highlight
- Ordinary Inline entries expose the shared styled tooltip only when credits or expanded prerequisite names add information. The popup omits the already-visible name and exam schedule. Entries without additional facts get no tooltip or extra tab stop. Compact entries retain full details on hover/focus.
- Highlight uses translucent amber, inherited text color/font/letter spacing, and zero horizontal padding. This adapts to light/dark website surfaces while retaining the original text width, weight, and line height. Hover/focus slightly strengthens the amber without moving content.
- The browser fixture checks supplementary-only content on focus/hover, no redundant popup without extra facts, and Highlight metrics/colors on dark and bold samples. Optional `?preview=highlight` and `?preview=details` show the final visual states after its assertions pass.


### HTML-only bounded names and slash aliases
- Ordinary HTML table titles are capped at two lines without assigning wider columns or changing table layout. Clipped names expose full course facts on hover/focus; short titles retain supplementary-only tooltips. Existing constrained-grid behavior stays compact.
- Google Sheets URLs and sheet-style `.waffle`, `.ritz`, and `.docs-sheet-container` markup are excluded from the new name bounding and alias presentation rules.
- Adjacent slash-separated catalog codes with matching normalized names retain independent markers, links, and course identities, while the last marker shows the shared name once. Alias details remain accessible per code, including differing credits and exam schedules. Different names are not grouped.
- Original surrounding text is inspected without decoder-added text. A complete course name already present on the page is not inserted again. Source text, section suffixes, and unknown codes are preserved; extension-inserted line breaks are tagged and removed on mode changes/disable.
- `tests/fixtures/inline_alias_tables.html` adds 25 browser checks for linked aliases, native names, differing metadata, bounded HTML widths/heights, Sheets exclusion, and exact mode-switch restoration. Existing 35 layout/tooltip/Highlight browser checks remain passing.
