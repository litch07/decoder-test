# UIU Course Code Decoder — Feature Documentation

## Abstract
**UIU Course Code Decoder** is an offline-first, privacy-respecting Manifest V3 Chrome extension engineered for students and faculty of **United International University (UIU)**. It transforms cryptic academic course codes (e.g., `CSE 3421`, `ACT 1111`) across university web portals (UCAM, LMS/eLMS, course registration, exam routines) into readable course names, official exam schedules with exact slot times, and prerequisite chains in real time.

All core operations occur **100% locally** in the browser using `chrome.storage.local`. The extension collects zero telemetry, zero analytics, and makes zero background network requests, except for an optional user-initiated sync directly against the official GitHub course repository.

---

## 1. Detection & Decoding Engine (`content.js`)

### Flexible Code Matching
- **Intelligent Pattern Matching**: Dynamically builds regular expressions from the active database catalog using word boundaries and negative lookarounds (`(?<![\w-])...(?![\\w-])`) to avoid false positives inside identifiers or URLs.
- **Whitespace Tolerance**: Detects both spaced and contiguous variations (e.g., `CSE 1111`, `CSE1111`, and `CSE   1111` resolve identically).

### Rich Academic Data Representation
- **Course Title Expansion**: Replaces or supplements raw codes with official course titles.
- **Exam Schedule & Real-Time Slot Decoding**: Decodes university exam periods into normalized UIU formats:
  - **Exam Day**: Formatted as university exam days (`Day 1` - `Day 7` or shorthand `D1` - `D7`).
  - **Exam Slot**: Formatted as standard time slots (`T1`, `T2`, `T3`) with live time windows (`09:00 AM – 11:00 AM`, `11:30 AM – 01:30 PM`, `02:00 PM – 03:00 PM`).
  - **In-Class Fallback**: Displays `"In-Class"` when an exam does not have a centralized routine slot.
- **Course Credits Display**: Directly displays official credit counts (`3.0`, `1.5`, `1.0`, `2.0` Cr).
- **Direct Prerequisite Resolution**: Decodes direct prerequisite codes into their full course names (e.g. `CSE 2215` &rarr; *"Data Structures and Algorithms"*).
- **Special Degree Milestones (`prerequisiteNote`)**: Explicitly displays degree credit requirements (e.g., `MINIMUM 85 credits` for capstone projects) cleanly isolated from course dependency arrays.

### Three Display Modes
Users can choose how decoded course data appears on university pages:
1. **Highlight Mode**: Subtly underlines course codes with brand accent colors. Hovering reveals an interactive card with full course details, schedule, and prerequisites.
2. **Tooltip Mode**: Keeps webpage typography unaltered while presenting a styled hover card with all academic metadata.
3. **Inline Mode**: Inserts the full course title directly after the code in parentheses (e.g., `CSE 3715 (Software Engineering)`), enabling at-a-glance reading without mouse interaction.

### Specialized Web Compatibility
- **Highcharts & SVG Graphic Support**: UIU student portals (UCAM) render grade distributions and schedule routines inside SVG `<text>` elements. The extension features dedicated SVG text node handlers to decode codes inside graphics without breaking chart rendering.
- **Dynamic Single-Page Application (SPA) Support**: Integrates a debounced `MutationObserver` that monitors DOM mutations, decoding dynamically rendered content, asynchronous grade loads, and tab changes without lag.
- **Exclusion Filters**: Automatically ignores non-relevant text nodes (e.g., `input`, `textarea`, `contenteditable`, `script`, `style`, and `.pdf` files).
- **Duplication Guard**: Protects against multiple script initializations using `window.__UIU_COURSE_DECODER_INJECTED__`.

---

## 2. Course Database & Catalog Management

### Bundled Baseline Catalog (`courses.json`)
- Ships with an offline catalog (~44 KB) containing over 315 verified UIU undergraduate and graduate courses across CSE, EEE, BBA, Data Science, and General Education.
- Works out of the box with zero internet connectivity required.

### 3-Tier Layered Data Architecture
To allow students to customize schedules, rename courses, or add unlisted courses without losing official catalog updates, storage uses a 3-tier precedence model:
```
           Official Catalog (courses.json or synced repo)
                                  ↓
      + User Custom Courses & Overrides (userCourses)
                                  ↓
               - Soft Deleted (softDeletedCourses in Trash)
                                  ↓
              - Permanently Deleted (hardDeletedCourses)
                                  ↓
       = Final Active Catalog in chrome.storage.local
```
- **Edits Preserved**: Editing an official course saves the modifications in `userCourses`. When the official database is synced, official updates do not overwrite custom user edits.

### Soft & Hard Deletion (Trash Lifecycle)
- **Soft Delete**: Sending a course to Trash marks it in `softDeletedCourses`. It remains visible in the Trash tab with its original status and edits intact.
- **Restore Course**: Instantly restores the course and its edits back to the active catalog.
- **Hard Delete / Empty Trash**: Permanently purges items from active queries and records them in `hardDeletedCourses` to prevent remote sync from re-adding unwanted courses.
- **Automatic Cleansing**: If a user manually re-adds or imports a course code previously in Trash or permanently deleted, the system automatically purges the code from both deletion registries.
- **Emergency Reset**: A dedicated "Reset Official Courses to Default" action allows users to purge all deletions and restore factory defaults while leaving custom user-added courses untouched.

---

## 3. Course Authoring & Batch Ingestion

### Single Course Form
- **Code Normalization**: Auto-uppercases inputs, trims stray whitespace, and validates code syntax.
- **Structured Fields**:
  - `Course Code`: Unique alphanumeric code (e.g., `CSE 3715`).
  - `Course Name`: Primary display title.
  - `Credits`: Numeric credit value (e.g., `3.0`, `1.5`, `1.0`).
  - `Prerequisites`: Comma-separated list of course codes only (e.g., `CSE 1111, MATH 1151`).
  - `Prerequisite Note`: Dedicated input for credit thresholds or special requirements (e.g., `MINIMUM 85 credits`).
  - `Exam Day & Slot`: Normalized UIU inputs (`Day 1` - `Day 7`, `T1` - `T3`).
- **Safe Controls**: Keyboard `Enter` submission support and quick `Clear` button.

### Batch Upload (JSON Editor)
- **Live Syntax Badge**: Real-time validation badge above the editor indicates parsing status:
  - `Ready` (neutral when empty)
  - `X courses detected` (emerald badge on valid JSON)
  - `Invalid JSON / Expected { ... }` (alert badge on syntax errors)
- **Enforced Payload Safety Cap**: Enforces a strict **2 MB upload size cap** preventing browser thread freezing or memory exhaustion.
- **Flexible Schema Support**: Accepts both minimal title strings and rich schedule/prerequisite objects:
  ```json
  {
    "CSE 4000A": {
      "name": "Final Year Design Project - I",
      "examDay": "Day 4",
      "examSlot": "T2",
      "prerequisites": [],
      "prerequisiteNote": "MINIMUM 85 credits",
      "credits": 3
    },
    "ACT 1111": "Financial Accounting"
  }
  ```
- **One-Click Template**: A `Copy` button immediately pastes a valid sample template into the user's clipboard.
- **Batch Error Handling**: Validates individual objects; imports valid courses while skipping malformed entries and reporting skipped counts.

---

## 4. Cloud Synchronization & Crowdsourcing (`background.js`)

### Official GitHub Synchronization
- Fetches the latest community-maintained course mappings directly from the official repository via `raw.githubusercontent.com`.
- **Differential Sync**: Calculates and reports exact differences:
  - `+X new`: Courses newly introduced to the university catalog.
  - `~X updated`: Official changes to exam slots, credits, or prerequisites.
  - `-X removed`: Obsolete courses phased out by the university.
- **Interactive Inspection**: Metric chips allow users to inspect updated or added courses directly in the Course Details view.
- **Safety Controls**: Enforces strict schema validation and a **2 MB payload size limit** on remote responses.

### 1-Click "Report Wrong Data" & Community Contribution Prompts
- Located at the bottom of the Course Details view (`details-view`).
- Automatically formats an emoji-guided GitHub issue with the course's exact code, title, exam routine, prerequisites, credits, and prerequisite note.
- Post-save contribution prompt invites students who customize courses locally to submit their updates back to the official community catalog.

---

## 5. Domain Allowlist & Execution Control

### Granular Per-Site Permissions Model
- The extension runs exclusively on user-approved domains, adhering strictly to least privilege (`<all_urls>` is omitted).
- **Quick-Toggle Hero Card**: The popup home screen automatically detects the active tab's domain and provides a single-click switch to request host permission and activate decoding.
- **Dynamic Content Script Registration**: When permission is granted, `background.js` registers `content.js` via `chrome.scripting.registerContentScripts`, ensuring persistent injection across page reloads.
- **Aligned Management View**: Settings view provides an aligned table list of allowed domains with one-click removal, search filtering, bulk selection, and domain-level validation.

---

## 6. User Interface & Micro-Interactions (`popup.html` & `popup.css`)

### Native 7-View Stack-Based Navigation
- **Layered Screen Hierarchy**: iOS/Material-inspired sliding navigation stack (`position: absolute; inset: 0;`) supporting 7 dedicated views:
  1. **Home Dashboard** (`.main-view`)
  2. **Course Database** (`.courses-view`)
  3. **Course Details & Editor** (`.details-view`)
  4. **Add / Import Courses** (`.import-view`)
  5. **My Courses & Routine Planner** (`.mycourses-view`)
  6. **Prerequisite Tree & Curriculum Flow** (`.flow-view`)
  7. **Settings & Preferences** (`.settings-view`)
- **Depth Shadows & Parallax**: Active child screens slide in from the right (`translateX(100%) -> translateX(0)`) with realistic elevation shadows (`box-shadow: -4px 0 20px rgba(0, 0, 0, 0.12)`), while the underlying screen subtly parallax-shifts left (`-15%`) and dims (`opacity: 0.85`).
- **Zero Page Skipping**: Navigating to non-adjacent views never flashes intermediate pages across the screen.

### Tactile Micro-Interactions
- **Physical Button Press System (`:active`)**: Spring-eased compression feedback (`scale(0.95)` to `scale(0.98)`) on all primary buttons, segment toggles, mode pills, and course table rows.
- **Interactive Header Controls**:
  - Chevron back button with hover arrow nudge (`translateX(-2px)`) and tactile compression.
  - Settings gear with smooth 35° hover rotation and 45° click compression.
  - Header extension logo with pointer cursor and hover spring lift.

### Tab Crossfades & Dialog Polish
- **Tab Transitions**: Switching between Single Course and Batch Upload utilizes a 0.18s crossfade and vertical translation (`fadeInTab`), avoiding layout pops.
- **Modal Dialogs**: Styled confirmation modals feature `backdrop-filter: blur(2px)`, deep elevation shadows, spring entry, and tactile confirm/cancel buttons.

---

## 7. Advanced Usability & Exploration (Milestone 2)

### Contextual Export in Course Manager (Task 2.1)
- Dedicated `Export` button in the catalog header.
- Intelligently senses the active query or filter to offer single-click export of currently visible courses, full catalog, or custom additions.

### File Drag-and-Drop & Pre-Commit Preview (Task 2.2)
- Interactive drag-and-drop zone (`#fileDropZone`) supporting `.json` file uploads.
- Real-time pre-commit diff engine categorizing incoming items into `+New`, `~Updated` (field-level Before/After comparison), `=Unchanged`, and `!Skipped`.

### Allowed Domains Search & Bulk Management (Task 2.3)
- Instant domain filtering input with clear button and live count indicators.
- Bulk selection toolbar with select-all checkbox and batch removal confirmation modal.

### Prerequisite Tree & "Unlocks" Explorer (Task 2.4)
- **Ancestry Tree**: BFS recursive traversal mapping direct (L1) and transitive (L2+) dependencies.
- **Reverse Unlocks**: Instant discovery of all future courses unlocked by completing the active course.
- **Curriculum Roadmap Flow (`#prereqFlowView`)**: Dedicated full-screen roadmap viewing required prerequisites and unlocked future courses in an elegant 2-column card layout (`.unlock-course-card`) with click-to-inspect navigation.

### Standalone Web Course & Prerequisite Explorer (Task 2.5)
- Public web application hosted at `https://litch07.github.io/uiu-course-decoder/` under `docs/`.
- Search, department filters, deep modal inspection, URL hash routing (`#CSE-2215`), and automated CI deployment.

---

## 8. Daily Academic Assistant Utilities (Milestone 3)

### Course Credits in Schema & UI (Task 3.1)
- Official credit values integrated into course models (`3.0`, `1.5`, `1.0`, `2.0`).
- Visible credit chips in catalog table rows, detail inspection headers, add/edit forms, and webpage hover cards.
- Automated regression suite: `tests/test_course_credits.js` (31/31 passing).

### "My Courses" & Dual-Level Exam Routine Conflict Detector (Task 3.2)
- **Dedicated Personal Planner Screen (`.mycourses-view`)**: Accessible from the Home Screen button (`#homeEnrolledCard`), featuring real-time course search with autocomplete and 1-click addition.
- **Trimester Credit Load Tracker**: Real-time summary displaying enrolled course count and total credit hours.
- **Dual-Level Routine Conflict Detector**:
  - **Direct Collision Engine (`detectExamClashes`)**: Evaluates enrolled course routines, groups overlapping Day & Slot timings, and alerts students of critical exam clashes (same day & same slot) while intelligently filtering out labs and in-class evaluations.
  - **Same-Day Multiple Exam Warning Engine (`detectSameDayExams`)**: Alerts students whenever 2 or more enrolled courses share the same final exam date (even with different slots, e.g. T1 & T3), avoiding intense multi-exam stress.
- **Real-Time Exam Slot Timings Inline**: Enrolled cards display exact UIU slot time windows directly on the card routine badge:
  - **T1**: `09:00 AM – 11:00 AM`
  - **T2**: `11:30 AM – 01:30 PM`
  - **T3**: `02:00 PM – 03:00 PM`
- **Multi-Surface Warnings**: Displays critical red badges (`🚨 N Clashes`) or high-workload amber alerts (`⚠️ 2 on Same Day`) across Home, My Courses, and Course Details.
- **Automated Regression Suite**: `tests/test_my_courses_clash_detector.js` (41/41 passing).

### Enrolled Course Routine & Markdown (.md) Export (Task 3.3)
- **One-Click Markdown Exporter**: Generates a clean, portable `.md` document of enrolled course schedules, credit summaries, official slot times, prerequisites, and schedule conflict analysis.
- **Academic Reliability**: Replaces fragile `.ics` calendar generation (which risks placing exams on Friday off-days or national holiday gaps) with universal Markdown tables ideal for Notion, Obsidian, GitHub, Discord, or printing.
- **Single-Click Header Action**: `#exportRoutineMdBtn` in the My Courses header triggers immediate download of `uiu-course-routine-YYYY-MM-DD.md`.
- **Zero-`innerHTML` Security**: Programmatic string and DOM construction.
- **Automated Regression Suite**: `tests/test_routine_markdown_export.js` (27/27 passing).

### System-Adaptive OLED Dark Mode Palette (Task 3.4)
- Deep OLED dark theme with battery-saving black surfaces (`#090d16`, `#111827`), high-contrast text (`#f9fafb`, `#94a3b8`), and vibrant UIU orange accent (`#F26522`).
- Segmented 3-option preference control in Settings: **System Default**, **Light**, and **Dark (OLED)**.
- Pure CSS media query fallback guaranteeing zero white flash before storage hydration, and live OS change detection.
- Automated regression suite: `tests/test_dark_mode_palette.js` (45/45 passing).

### Keyboard Navigation & ARIA Accessibility (Task 3.5)
- Full ARIA landmarks across all sliding panels (`role="region"`) and active dialogs (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`).
- Modal focus-trapping engine keeping `Tab` and `Shift+Tab` cycled safely within active dialogs.
- Hierarchical `Escape` navigation closing top-layer modals first, then progressively navigating backward through panels.
- Arrow key navigation across tabs, theme controls, filter pills, and prerequisite view switches.
- High-contrast visible focus rings (`:focus-visible`) across light and dark palettes.
- Automated regression suite: `tests/test_keyboard_accessibility.js` (32/32 passing).

---

## 9. Privacy, Security & Accessibility

| Category | Specification |
|---|---|
| **Manifest Version** | Chrome Manifest V3 |
| **API Permissions** | `storage`, `activeTab`, `scripting`, `tabs` |
| **Host Permissions** | `optional_host_permissions: ["*://*/*"]` (per-site activation) + `https://raw.githubusercontent.com/*` (manual sync only) |
| **DOM Security** | **Zero-`innerHTML` Architecture**: 100% programmatic node creation (`createElement`, `createTextNode`, `textContent`), eliminating DOM-based XSS vectors. |
| **Data Collection** | **Zero**. No tracking, telemetry, user identifiers, or analytics |
| **Payload Security** | Enforced **2 MB safety cap** on batch JSON imports and remote sync responses |
| **Accessibility** | Complete ARIA landmarks, modal focus traps, hierarchical Escape navigation, and `@media (prefers-reduced-motion: reduce)` support |
| **Code Modularity** | Extracted styling (`popup.css`), semantic markup (`popup.html`), service worker (`background.js`), and isolated client logic (`popup.js`) |
| **Automated Testing** | **24 automated regression test suites** verified on every commit and pull request |
