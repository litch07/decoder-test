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

### B. Release 2 (In Progress): Usability Polish
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

3. **Content Script Context Resilience & Reload Defense**:
   - Added top-level extension context guards in content.js verifying chrome, chrome.runtime, chrome.runtime.id, chrome.storage, and chrome.storage.local before script execution.
   - Defensively wrapped chrome.storage.local.get and chrome.storage.onChanged.addListener with try/catch and runtime validity checks, completely eliminating `TypeError: Cannot read properties of undefined (reading 'local')` when reloading the extension in chrome://extensions or navigating pages with unprivileged/sandboxed iframes.
   - Refined background.js tab update listener to inject strictly on `changeInfo.status === "complete"`, preventing premature script execution in unready frame states.
   - Added automated verification test suite `tests/test_content_script_resilience.js` (5/5 passing).

### B. View 4 (Add / Import Courses) Architecture & Design
1. **Tabbed Navigation (`Single Course` vs `Batch Upload`)**:
   - Tab switcher (`.import-tab-nav` and `.import-tab-btn`) with smooth crossfades and zero layout shifts.
2. **Single Course Addition Form**:
   - `Course Code`: Auto-uppercases user input; validates format (e.g., `CSE 3715`).
   - `Course Name`: Required primary title.
   - `Prerequisites`: Comma-separated list of course codes, trimmed into an array.
   - `Prerequisite Note`: Dedicated input for credit minimums (e.g. `MINIMUM 85 credits`).
   - `Exam Day` & `Exam Slot`: Normalized UI standards (`D1-D8`, `T1-T3`).
   - Safe controls: `Save Course` (`#addCourseBtn`) and `Clear` (`#clearSingleBtn`) with keyboard `Enter` support.
3. **Batch Upload (JSON) Redesign**:
   - Header bar with real-time validation status badge (`#batchJsonBadge`).
   - 2-course sample template with one-click `Copy` button.
   - Enforced 2 MB payload size limit.
   - Full-width symmetrical guidance box (`.import-hint`).
4. **Professional SVG Status Messaging System**:
   - Color-coded SVG alert cards for Success (emerald checkmark), Error (crimson alert), and Info (blue info icon) with collision prevention.

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
- `tests/` — Automated test suite (14 test files):
  - `tests/test_release1.js` (Release 1 verification suite)
  - `tests/test_single_and_batch_integration.js`
  - `tests/test_merge.js` / `tests/test_merge_v2.js`
  - `tests/test_migration.js`
  - `tests/test_official_hard_delete.js`
  - `tests/test_empty_trash_all.js`
  - `tests/test_restore_official.js`
  - `tests/test_single_course_add.js`
  - `tests/test_batch_upload.js`
  - `tests/test_sync_diff.js`
  - `tests/test_contextual_export.js`
  - `tests/test_file_import_preview.js`
  - `tests/test_content_script_resilience.js`

---

## 5. How to Verify Codebase Health

Run the entire automated test suite from the repository root:
```powershell
Get-ChildItem -Path tests/*.js | ForEach-Object { node $_.FullName }
```
**Expected Result**: All 14 test suites pass with zero failures.
