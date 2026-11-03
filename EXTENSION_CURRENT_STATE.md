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
   - View 3 (Course Details): Added `#detailCredits` input and `#detailsCreditsBadge` in header, allowing students to inspect and customize credits.
   - View 4 (Add / Import Courses): Added `#singleCourseCredits` in `.form-row-3col`.
   - Pre-Commit Diff Engine: `computeImportDiff` detects, compares, and displays credit modifications (`oldVal` vs `newVal`).
   - Content Script Overlay (`content.js`): `buildTooltipDom` renders a dedicated `Credits: X Cr` detail row inside the hover card.
   - Public Web Explorer (`docs/`): Displays credit badges on course cards and in the course inspector modal.
   - Full automated test suite in `tests/test_course_credits.js` (31/31 passing).

2. **Dedicated "My Courses & Exam Routine" Screen & Clash Detector (Task 3.2)**:
   - Dedicated Feature View (`.mycourses-view`): Transformed "My Courses" from an overloaded table filter into a full-featured personal academic planner screen accessible directly from the clean Home Screen button (`#homeEnrolledCard`) and course details.
   - Cleaned Catalog Table: Removed star icons (`★`) and inline credit chips from the Course Database table rows in View 1, restoring over 100px of width for course titles and eliminating table overflow/cramming within the 360px viewport.
   - Quick Add Search with Autocomplete: Real-time search box (`#myCoursesSearchInput`) in the My Courses screen that suggests unenrolled courses on-the-fly with 1-click addition (`+ Add`).
   - Trimester Summary & Load Indicator: Real-time summary card showing total enrolled courses, total credit hours, and academic load indicator badge (`#enrolledLoadBadge`, e.g. `12.0 / 15.0 Cr`).
   - Exam Schedule Collision Engine (`detectExamClashes`): Evaluates enrolled course routines, groups overlapping Day & Slot timings, and alerts students of exam conflicts while intelligently filtering out labs and in-class evaluations.
   - Rich Enrolled Course Cards: Displays enrolled courses with day/slot badges, credit badges, quick "Inspect" navigation into View 3, and individual "Drop" buttons (`btn-card-drop`).
   - Drop All Courses Safety Action: Allows clearing enrolled courses with confirmation (`#clearEnrolledBtn`).
   - Strict Zero-`innerHTML` DOM generation with 100% test coverage in `tests/test_my_courses_clash_detector.js` (31/31 passing).
3. **Exam Week Calendar Export (.ics / RFC 5545) (Task 3.3)**:
   - iCalendar Serialization Engine: Formats scheduled course exams into standard `.ics` events compatible with Google Calendar, Apple Calendar, and Microsoft Outlook.
   - Intelligent Slot Mapping: Automatically maps exam slots (`T1` &rarr; 09:00–11:00, `T2` &rarr; 11:30–13:30, `T3` &rarr; 14:30–16:30) and calculates calendar dates based on user-chosen exam week start dates.
   - Interactive Export Modal (`#examExportModal`): Accessible via `#openIcsExportBtn` in the My Courses summary bar; includes live scheduled exam preview, date picker, and dual `VALARM` reminder configuration (24 hours and 2 hours prior to exams).
   - Zero-`innerHTML` Security: Fully safe programmatic DOM creation with comprehensive coverage in `tests/test_exam_calendar_export.js` (25/25 passing).

4. **System-Adaptive OLED Dark Mode Palette (Task 3.4)**:
   - Deep OLED Dark Theme: Custom-engineered OLED palette with pure blacks (`--bg: #090d16`), dark surfaces (`--surface: #111827`, `--surface2: #162032`), high-contrast text (`--text-main: #f9fafb`, `--text-muted: #94a3b8`), and refined borders (`--border-color: #243048`).
   - Settings Preference Radiogroup (`#themeOptionsGroup`): Segmented 3-state control in View 5 supporting System Default (`#themeSystem`), Light (`#themeLight`), and Dark OLED (`#themeDark`).
   - Zero-Flash Pure CSS Fallback: Uses `@media (prefers-color-scheme: dark)` and `:root:not([data-theme="light"])` to guarantee zero white flash before storage initializes.
   - Dynamic OS Media Query Listener: Instantly switches theme when OS preference changes while on System mode.
   - Persistent Local Storage: Retains user preference across browser sessions in `chrome.storage.local` under `themePreference`.
   - Comprehensive test suite: `tests/test_dark_mode_palette.js` (45/45 passing).

5. **Keyboard Navigation & ARIA Accessibility (Task 3.5)**:
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

### C. View 3 (Course Details) Visual Harmonization
- Aligned `.contribution-card` to match `.details-card`: pure white surface, subtle neutral border, standard 12px radius, and dark GitHub mark.
- Clean layout spacing with Code, Name, Exam Routine, Prerequisites, and Prerequisite Note fields.

---

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
    "examDay": "D4",
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
- `popup.html` — 5-view sliding stack UI (Home, Courses, Details, Import, Settings) with zero `innerHTML`.
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
- `tests/` — Comprehensive automated test suite (22 test suites):
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
  - `tests/test_exam_calendar_export.js`
  - `tests/test_dark_mode_palette.js`
  - `tests/test_keyboard_accessibility.js`

---

## 5. How to Verify Codebase Health

Run the entire automated test suite sequentially from the repository root:
```powershell
node tests/run_all.js
```
**Expected Result**: All 22 test suites pass with zero failures.
