# UIU Course Code Decoder — Feature Documentation

## Abstract
**UIU Course Code Decoder** is an offline-first, privacy-respecting Manifest V3 Chrome extension engineered for students and faculty of **United International University (UIU)**. It transforms cryptic academic course codes (e.g., `CSE 3421`, `ACT 1111`) across university web portals (UCAM, LMS/eLMS, course registration, exam routines) into readable course names, exam schedules, and prerequisite chains in real time.

All core operations occur **100% locally** in the browser using `chrome.storage.local`. The extension collects zero telemetry, zero analytics, and makes zero background network requests, except for an optional user-initiated sync directly against the official GitHub course repository.

---

## 1. Detection & Decoding Engine (`content.js`)

### Flexible Code Matching
- **Intelligent Pattern Matching**: Dynamically builds regular expressions from the active database catalog using word boundaries and negative lookarounds (`(?<![\w-])...(?![\\w-])`) to avoid false positives inside identifiers or URLs.
- **Whitespace Tolerance**: Detects both spaced and contiguous variations (e.g., `CSE 1111`, `CSE1111`, and `CSE   1111` resolve identically).

### Rich Academic Data Representation
- **Course Title Expansion**: Replaces or supplements raw codes with official course titles.
- **Exam Schedule Decoding**: Decodes university exam periods into normalized UIU formats:
  - **Exam Day**: Formatted as university exam days (`Day 1` - `Day 8` or shorthand `D1` - `D8`).
  - **Exam Slot**: Formatted as standard time slots (`T1`, `T2`, `T3`).
  - **In-Class Fallback**: Displays `"In-Class"` when an exam does not have a centralized routine slot.
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
  - `Prerequisites`: Comma-separated list of course codes only (e.g., `CSE 1111, MATH 1151`).
  - `Prerequisite Note`: Dedicated input for credit thresholds or special requirements (e.g., `MINIMUM 85 credits`).
  - `Exam Day & Slot`: Normalized UIU inputs (`D1-D8`, `T1-T3`).
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
      "examDay": "D4",
      "examSlot": "T2",
      "prerequisites": [],
      "prerequisiteNote": "MINIMUM 85 credits"
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
  - `~X updated`: Official changes to exam slots or prerequisites.
  - `-X removed`: Obsolete courses phased out by the university.
- **Interactive Inspection**: Metric chips allow users to inspect updated or added courses directly in the Course Details view.
- **Safety Controls**: Enforces strict schema validation and a **2 MB payload size limit** on remote responses.

### 1-Click "Report Wrong Data" Action
- Located at the bottom of the Course Details view (`details-view`).
- Automatically formats an emoji-guided GitHub issue with the course's exact code, title, exam routine, prerequisites, and prerequisite note.
- Enables any student to submit data corrections without coding or Git experience.

---

## 5. Domain Allowlist & Execution Control

### Granular Per-Site Permissions Model
- The extension runs exclusively on user-approved domains, adhering strictly to least privilege (`<all_urls>` is omitted).
- **Quick-Toggle Hero Card**: The popup home screen automatically detects the active tab's domain and provides a single-click switch to request host permission and activate decoding.
- **Dynamic Content Script Registration**: When permission is granted, `background.js` registers `content.js` via `chrome.scripting.registerContentScripts`, ensuring persistent injection across page reloads.
- **Aligned Management View**: Settings view provides an aligned table list of allowed domains with one-click removal and domain-level validation.

---

## 6. User Interface & Micro-Interactions (`popup.html` & `popup.css`)

### Native Stack-Based Navigation
- **Layered Screen Hierarchy**: Replaced rigid horizontal carousel strips with an iOS/Material-inspired layered navigation stack (`position: absolute; inset: 0;`).
- **Depth Shadows & Parallax**: Active child screens slide in from the right (`translateX(100%) -> translateX(0)`) with realistic elevation shadows (`box-shadow: -4px 0 20px rgba(0, 0, 0, 0.12)`), while the underlying screen subtly parallax-shifts left (`-15%`) and dims (`opacity: 0.85`).
- **Zero Page Skipping**: Navigating to non-adjacent views (e.g., Home to Settings, or Courses to Batch Upload) never flashes intermediate pages across the screen.

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

## 7. Privacy, Security & Accessibility

| Category | Specification |
|---|---|
| **Manifest Version** | Chrome Manifest V3 |
| **API Permissions** | `storage`, `activeTab`, `scripting`, `tabs` |
| **Host Permissions** | `optional_host_permissions: ["*://*/*"]` (per-site activation) + `https://raw.githubusercontent.com/*` (manual sync only) |
| **DOM Security** | **Zero-`innerHTML` Architecture**: 100% programmatic node creation (`createElement`, `createTextNode`, `textContent`), eliminating DOM-based XSS vectors. |
| **Data Collection** | **Zero**. No tracking, telemetry, user identifiers, or analytics |
| **Payload Security** | Enforced **2 MB safety cap** on batch JSON imports and remote sync responses |
| **Accessibility** | Complete `@media (prefers-reduced-motion: reduce)` support disabling motion for sensitive users |
| **Code Modularity** | Extracted styling (`popup.css`), semantic markup (`popup.html`), service worker (`background.js`), and isolated client logic (`popup.js`) |
