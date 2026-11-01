# UIU Course Code Decoder — Feature Documentation

## Abstract
**UIU Course Code Decoder** is an offline-first, privacy-respecting Manifest V3 Chrome extension engineered for students and faculty of **United International University (UIU)**. It transforms cryptic academic course codes (e.g., `CSE 3421`, `ACT 1111`) across university web portals (UCAM, LMS/eLMS, course registration, exam routines) into readable course names, exam schedules, and recursive prerequisite trees in real time.

All core operations occur **100% locally** in the browser using `chrome.storage.local`. The extension collects zero telemetry, zero analytics, and makes zero background network requests, except for an optional user-initiated sync directly against the official GitHub course repository.

---

## 1. Detection & Decoding Engine (`content.js`)

### Flexible Code Matching
- **Intelligent Pattern Matching**: Dynamically builds regular expressions from the active database catalog using word boundaries and negative lookarounds (`(?<![\w-])...(?![\\w-])`) to avoid false positives inside identifiers or URLs.
- **Whitespace Tolerance**: Seamlessly detects both spaced and contiguous variations (e.g., `CSE 1111`, `CSE1111`, and `CSE   1111` resolve identically).

### Rich Academic Data Representation
- **Course Title Expansion**: Replaces or supplements raw codes with official course titles.
- **Exam Schedule Decoding**: Decodes university exam periods into normalized UIU formats:
  - **Exam Day**: Formatted as university exam days (`D1`, `D2`, `D3`, `D4`...).
  - **Exam Slot**: Formatted as standard time slots (`T1`, `T2`, `T3`...).
  - **In-Class Fallback**: Displays `"In-Class"` when an exam does not have a centralized routine slot.
- **Recursive Prerequisite Resolution**: Parses prerequisite codes and recursively decodes them to their full course titles (e.g., `CSE 2215` $\rightarrow$ *"Data Structures and Algorithms"* instead of just printing the code).

### Three Display Modes
Users can choose how decoded course data appears on university pages:
1. **Highlight Mode**: Subtly underlines course codes with brand accent colors. Hovering reveals an interactive tooltip with full course details, schedule, and prerequisites.
2. **Tooltip Mode**: Keeps webpage typography unaltered while presenting a styled hover card with all academic metadata.
3. **Inline Mode**: Inserts the full course title directly after the code in parentheses or tags, enabling at-a-glance reading without mouse interaction.

### Specialized Web Compatibility
- **Highcharts & SVG Graphic Support**: UIU student portals (UCAM) render grade distributions and schedule routines inside SVG `<text>` elements. The extension features dedicated SVG text node handlers to decode codes inside graphics without breaking chart rendering.
- **Dynamic Single-Page Application (SPA) Support**: Integrates a debounced `MutationObserver` that monitors DOM mutations, decoding dynamically rendered content, asynchronous grade loads, and tab changes without lag.
- **Exclusion Filters**: Automatically ignores non-relevant text nodes (e.g., `input`, `textarea`, `contenteditable`, `script`, `style`, and `.pdf` files).

---

## 2. Course Database & Catalog Management

### Bundled Baseline Catalog (`courses.json`)
- Ships with an offline catalog (~44 KB) containing hundreds of verified UIU undergraduate and graduate courses across CSE, EEE, BBA, and other departments.
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
- **Automatic Resurrection**: If a user manually re-adds or imports a course code previously in Trash or permanently deleted, the system automatically purges the code from both deletion registries.
- **Emergency Reset**: A dedicated "Reset Official Courses to Default" action allows users to purge all deletions and restore factory defaults while leaving custom user-added courses untouched.

---

## 3. Course Authoring & Batch Ingestion

### Single Course Form
- **Code Normalization**: Auto-uppercases inputs, trims stray whitespace, and validates code syntax.
- **Structured Fields**:
  - `Course Code`: Unique alphanumeric code (e.g., `CSE 3715`).
  - `Course Name`: Primary display title.
  - `Prerequisites`: Comma-separated list of codes, automatically parsed and trimmed into an array.
  - `Exam Day & Slot`: Normalized UIU inputs (`D1-D8`, `T1-T3`).
- **Safe Controls**: Keyboard `Enter` submission support and quick `Clear` button.

### Batch Upload (JSON Editor)
- **Live Syntax Badge**: Real-time validation badge above the editor indicates parsing status:
  - `Ready` (neutral when empty)
  - `X courses detected` (emerald badge on valid JSON)
  - `Invalid JSON / Expected { ... }` (alert badge on syntax errors)
- **Flexible Schema Support**: Accepts both minimal title strings and rich schedule/prerequisite objects:
  ```json
  {
    "CSE 3715": {
      "name": "Digital System Design",
      "examDay": "D4",
      "examSlot": "T2",
      "prerequisites": ["CSE 2213"]
    },
    "ACT 1111": "Financial Accounting"
  }
  ```
- **One-Click Template**: A `Copy` button immediately pastes a valid sample template into the user's clipboard.
- **Batch Error Handling**: Validates individual objects; imports valid courses while skipping malformed entries and reporting skipped counts.

---

## 4. Cloud Synchronization (`background.js`)

### Official GitHub Synchronization
- Fetches the latest community-maintained course mappings directly from the official repository via `raw.githubusercontent.com`.
- **Differential Sync**: Calculates and reports exact differences:
  - `+X new`: Courses newly introduced to the university catalog.
  - `~X updated`: Official changes to exam slots or prerequisites.
  - `-X removed`: Obsolete courses phased out by the university.
- **Interactive Inspection**: Clickable metric chips allow users to inspect updated or added courses directly in the Course Details view.
- **Overdue Update Warning**: A persistent notification banner appears on the Home view if the catalog has not been synchronized in over 2 months.

---

## 5. Domain Allowlist & Execution Control

### Granular Domain Targeting
- The extension runs exclusively on user-approved domains.
- **Wildcard Syntax Support**: Supports standard wildcards (e.g., `*.uiu.ac.bd`, `ucam.uiu.ac.bd`, `elms.uiu.ac.bd`).
- **Quick-Toggle Hero Card**: The popup home screen automatically detects the active tab's domain and provides a single-click switch to activate or pause decoding on that specific site.
- **Aligned Management View**: Settings view provides an aligned tag/table list of allowed domains with one-click removal and domain-level validation.

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
- **Tab Transitions**: Switching between Single Course and Batch Upload utilizes a 0.18s crossfade and vertical translation (`fadeInTab`), avoiding harsh layout pops.
- **Modal Dialogs**: Styled confirmation modals feature `backdrop-filter: blur(2px)`, deep elevation shadows, spring entry, and tactile confirm/cancel buttons.

---

## 7. Privacy, Security & Accessibility

| Category | Specification |
|---|---|
| **Manifest Version** | Chrome Manifest V3 |
| **Permissions** | `storage`, `activeTab`, `scripting` (least privilege) |
| **Data Collection** | **Zero**. No tracking, telemetry, user identifiers, or analytics |
| **Remote Connections** | Restricted to `raw.githubusercontent.com` (user-initiated sync only) |
| **Accessibility** | Complete `@media (prefers-reduced-motion: reduce)` support disabling motion for sensitive users |
| **Code Modularity** | Extracted styling (`popup.css`), semantic markup (`popup.html`), service worker (`background.js`), and isolated client logic (`popup.js`) |
