# UIU Course Code Decoder — Current State & Recent Improvements

> **Purpose**: This document provides a complete technical handover of the current state of the UIU Course Code Decoder browser extension. It details all architectural patterns, UI refinements, data models, and recent improvements made across the extension, specifically formatted for AI assistants (like Claude) and developers to immediately understand the codebase.

---

## 1. Project Overview & Core Philosophy

- **What it is**: A privacy-focused Manifest V3 Chrome extension designed for United International University (UIU) students. It automatically detects course codes (e.g. `CSE 3421`) across webpages (UCAM, LMS, portals) and decodes them into full course names, exam schedules, and prerequisites.
- **Privacy First & Offline Operation**: Runs completely offline. Zero telemetry, zero analytics, zero external scripts. All database queries, user customizations, and storage occur locally in `chrome.storage.local`.
- **The Only Remote Request**: An optional, user-triggered "Sync Course Database" feature that fetches updates directly from the official GitHub repository (`raw.githubusercontent.com`).

---

## 2. Comprehensive Changelog of Recent Improvements

### A. View 4 (Add / Import Courses) Architecture & Design
Previously, course imports were limited to a single raw JSON input box without dedicated workflows for single course additions.

1. **Tabbed Navigation (`Single Course` vs `Batch Upload`)**:
   - Replaced fragmented buttons with a cohesive tab switcher (`.import-tab-nav` and `.import-tab-btn`).
   - Clean active states with smooth transitions and zero layout shifts.

2. **Single Course Addition Form**:
   - **Streamlined Inputs**:
     - `Course Code`: Auto-uppercases user input; validates format (e.g., `CSE 3715`).
     - `Course Name`: Required; primary identifier.
     - `Prerequisites`: Optional, entered as comma-separated values (e.g., `CSE 1111, MATH 1151`), automatically trimmed and normalized into an array.
     - `Exam Day` & `Exam Slot`: Normalized UI standards to UIU university terminology:
       - Exam Day placeholder: `D1`, `D2`, `D3`, `D4`... (e.g. `D4`)
       - Exam Slot placeholder: `T1`, `T2`, `T3` (e.g. `T2`)
   - **Removed Clutter**: Purged redundant live previews, complex chip editors, and banner disclaimers that bloated the layout, delivering a fast, focused, and intuitive form.
   - **Safe Controls**: Added `Save Course` (`#addCourseBtn`) and `Clear` (`#clearSingleBtn`) with keyboard `Enter` submission support.

3. **Batch Upload (JSON) Redesign**:
   - **Editor Header Bar & Real-Time Badge**:
     - Added `.editor-header-bar` directly above the JSON editor.
     - Features an interactive `#batchJsonBadge` status pill that analyzes input live:
       - `Ready` (neutral pill when empty)
       - `${count} courses detected` (emerald badge on valid JSON)
       - `Invalid JSON` / `Expected { ... }` (soft red alert badge on syntax errors)
   - **Standardized Sample Template & One-Click Copy**:
     - High-contrast, compact `Copy` button with SVG icon.
     - Provides a realistic 2-course template (`CSE 3715` with full schedule & `ACT 1111` minimal structure):
       ```json
       {
         "CSE 3715": {
           "name": "Digital System Design",
           "examDay": "D4",
           "examSlot": "T2",
           "prerequisites": ["CSE 2213"]
         },
         "ACT 1111": {
           "name": "Financial and Managerial Accounting",
           "examDay": "",
           "examSlot": "",
           "prerequisites": []
         }
       }
       ```
   - **Prevented Catalog Wiping Hazard**:
     - Replaced the previous dangerous secondary button (which cleared all 600+ courses from the entire database) with a safe editor `Clear` button (`#clearBtn`) that resets only the JSON input field.
   - **Symmetrical Guidance Box**:
     - Transformed the disclaimer into a clean `.import-hint`: full width (`width: 100%`), subtle background (`var(--surface2)`), and justified text alignment, with professional declarative copy: *"Import courses using a JSON object or click Copy for a sample template. Course code and title are required."*

4. **Professional SVG Status Messaging System**:
   - Upgraded `showImportMsg()` and `showSingleCourseMsg()` from raw emojis (`⚠️`, `❌`, `✅`) to modern, color-coded SVG alert cards:
     - **Success**: Emerald checkmark icon in `#f0fdf4` container with `#166534` text.
     - **Error**: Crimson alert icon in `#fef2f2` container with `#991b1b` text.
     - **Info**: Royal blue info icon in `#eff6ff` container with `#1e40af` text.
   - Added collision prevention with `clearTimeout()` to eliminate message flickering during rapid clicks.

---

### B. View 3 (Course Details) Visual Harmonization
- **Removed Inconsistent Left-Side Orange Stripe / Glow**:
  - The "Help Fellow UIU Students" callout card (`.contribution-card`) previously had an orange border (`border: 1px solid rgba(242, 101, 34, 0.22)`), peach background (`#fffaf7`), and a thick orange left bar (`border-left: 3.5px solid var(--accent)`).
  - Because the top card (`.details-card`) was clean white, the orange left border made the page look mismatched and caused an uneven "glow" perception.
- **Harmonized Design System**:
  - Aligned `.contribution-card` to match `.details-card`:
    - Background: `var(--surface)` (clean pure white)
    - Border: `1px solid var(--border-color)` (subtle neutral border on all 4 sides)
    - Border Radius: `12px` (matching the extension-wide card standard)
    - Padding: `12px 14px`
    - Shadow: `0 1px 3px rgba(0, 0, 0, 0.04)`
- **Header & Button Polish**:
  - Header title now uses `var(--text-main)` with the heart icon in `var(--accent)`.
  - Body text aligned with justified text distribution.
  - Action button (`.contribution-btn`) converted to a clean secondary button (`background: #f8fafc`, `border: 1px solid var(--border-color)`, `color: var(--text-main)`, and dark `#24292e` GitHub mark).

---

### C. Modal & Confirmation Message Consistency
- Standardized **Empty Trash / Permanent Delete All** to use the exact structure and professional tone of **Restore All**:
  - **Title**: `Permanently delete all ${count} courses?` (`color: var(--text-main)`)
  - **Subtitle**: `${count === 1 ? 'This course' : 'All courses in Trash'} will be permanently removed from storage and cannot be restored.`
- Standardized single course permanent delete:
  - **Title**: `Permanently delete ${code}?`
  - **Subtitle**: `This course will be permanently removed from storage and cannot be restored.`
- Toast feedback standardized: `${count === 1 ? 'Course' : `All ${count} courses`} permanently deleted`.

---

### D. Layout Spacing & Rhythm (Strict 10px / 8px System)
- **Eliminated Whitespace Gaps**: Harmonized margins and padding across View 4 (`.import-view .body`), tab switcher, form cards, and action rows.
- **Consistent Sizing**:
  - Form action buttons standardized to `min-height: 38px`.
  - Secondary / trash action buttons standardized to `min-height: 34px`.
  - Outer card containers standardized to `border-radius: 12px; padding: 14px;`.
  - All form controls set to `box-sizing: border-box` to prevent horizontal overflow.

---

### E. Navigation & Slide Animation Stability
- Fixed slide transitions between views (Main Settings -> Courses View -> Course Details -> Add/Import View).
- Resolved focus scroll conflicts where focusing off-screen textareas or inputs caused the browser popup container to violently shift or clip headers.

---

## 3. Current Data Architecture & Merge Precedence

### Storage Keys (`chrome.storage.local`)
| Key | Type | Description |
|---|---|---|
| `courses` | `Object` | The active, merged dictionary of courses used by `content.js` |
| `userCourses` | `Object` | User-created courses and user edits to official courses |
| `softDeletedCourses` | `Array<string>` | Soft-deleted course codes (Trash view). Reversible via Restore |
| `hardDeletedCourses` | `Array<string>` | Hard-deleted course codes. Purges overrides; non-restorable |
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
  "CSE 3421": {
    "name": "Database Management Systems",
    "examDay": "D1",
    "examSlot": "T2",
    "prerequisites": ["CSE 2213"]
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
3. **Intentional Re-creation**: If a user re-adds or imports a course code that was previously in `hardDeletedCourses` or `softDeletedCourses`, the system automatically cleanses the code from both delete arrays.
4. **Emergency Reset**: "Reset Official Courses to Default" purges `softDeletedCourses` and `hardDeletedCourses` completely while leaving custom `userCourses` intact.

---

## 4. Key Files & Structure

- `popup.html` — Popup user interface markup and styles. Contains 4 views (Main Settings, Course Manager, Course Details, Add/Import Courses) and confirmation modal overlays.
- `popup.js` — Client-side UI logic, view router, form validation, real-time JSON editor badge, message helpers, and storage listener integrations.
- `background.js` — Service worker. Handles catalog merging, storage migration, remote synchronization, and course count queries.
- `content.js` — Injected script. Builds regex matcher from `courses`, decorates DOM nodes (inline, tooltip, or highlight), manages Highcharts SVG overlays, and utilizes `MutationObserver` safely.
- `courses.json` — Bundled baseline catalog (~44KB) ensuring 100% offline functionality.
- `tests/` — Automated test suite:
  - `tests/test_single_and_batch_integration.js` (End-to-end single course + batch upload validation)
  - `tests/test_merge.js` / `tests/test_merge_v2.js`
  - `tests/test_migration.js`
  - `tests/test_official_hard_delete.js`
  - `tests/test_empty_trash_all.js`
  - `tests/test_sync_diff.js`

---

## 5. Recent Git Commits Reference

- `e3d9a39` — `refactor(ui): harmonize contribution card with details card styling and remove left border glow`
- `6d55a14` — `refactor(ui): align permanent delete modal messages and styling with restore all`
- `36e8b1c` — `style(ui): make batch upload guidance hint full width and justified`
- `c63da2b` — `refactor(ui): modernize batch upload page, live status badge, SVG messages, and safe editor controls`
- `dae0185` — `refactor(ui): harmonize layout gaps, margins, and card padding for Add and Import view`
- `0fb8a5a` — `refactor(ui): remove intro banner and standardize exam day placeholders to D1/D2/D3`
- `b488b41` — `refactor(ui): streamline single course form, remove redundant live preview, and align slot format to T1/T2/T3`
- `d2ad025` — `feat(ui): modernize single course add form with section groups, icons, live preview and prereq chips`
- `2bf2788` — `Add automated integration tests for single course add and batch upload flows`
- `600997f` — `Rename Copy Sample JSON button to Copy with icon and remove batch upload banner from single course view`
- `099c681` — `Fix View 4 slide navigation, resolve offscreen focus scroll conflict and enforce import transform precedence`
- `ad698c7` — `Restore single Add / Import Courses button on bottom of database with single and batch tab options`
- `baa3b6a` — `Add batch upload button, 2-course sample JSON template and feedback messaging`
- `06cb3af` — `feat(courses): add single course creation form with validation and tab switcher in View 4`

---

## 6. How to Verify Codebase Health

Run the entire automated test suite from the repository root:
```powershell
Get-ChildItem -Path tests/*.js | ForEach-Object { node $_.FullName }
```
**Expected Result**: All test suites pass with zero failures.
