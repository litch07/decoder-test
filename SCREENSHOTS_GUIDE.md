# Visual Assets & Screenshots Guide

This guide details every image and screenshot used across the **UIU Course Code Decoder** documentation (`README.md`, `CONTRIBUTING.md`, and `PRIVACY.md`).

All images are stored in the root [`assets/`](assets/) directory. Currently, pre-rendered placeholder cards exist for any pending screenshot. Whenever you take a real screenshot, simply overwrite the corresponding file in `assets/` and GitHub will render the new image automatically without requiring any documentation edits.

---

## Complete Screenshot Checklist

| # | File Name | Target Document | Status | Description |
|:---:|---|---|:---:|---|
| 1 | `assets/demo.png` | [`README.md`](README.md) | Existing (Can refresh) | **Hero Banner**: Live portal decoding on UCAM |
| 2 | `assets/demo-tooltip.png` | [`README.md`](README.md) | Existing (Can refresh) | **Display Modes**: Tooltip hover card with exam and prerequisites |
| 3 | `assets/mode-inline.png` | [`README.md`](README.md) | 🖼️ Placeholder | **Display Modes**: Inline mode showing title appended directly in text |
| 4 | `assets/pop-up-1.png` | [`README.md`](README.md) | Existing (Can refresh) | **Popup Interface**: Home view showing "Active on this page" toggle |
| 5 | `assets/pop-up-2.png` | [`README.md`](README.md) | Existing (Can refresh) | **Popup Interface**: Global display modes & exam/prereq switches |
| 6 | `assets/course-manager-pop-up.png` | [`README.md`](README.md) | Existing (Can refresh) | **Course Manager**: 3-column list with search and origin filter |
| 7 | `assets/course-details-view.png` | [`README.md`](README.md) | 🖼️ Placeholder | **Course Details**: Full view showing code, title, routine, prereqs, and note |
| 8 | `assets/course-manager-pop-up-success.png` | [`README.md`](README.md) | Existing (Can refresh) | **Batch Import**: JSON editor with live course detection badge |
| 9 | `assets/trash-view.png` | [`README.md`](README.md) | 🖼️ Placeholder | **Trash & Recovery**: Soft-deleted courses with Restore & Delete buttons |
| 10 | `assets/sync-diff-modal.png` | [`README.md`](README.md) | 🖼️ Placeholder | **Catalog Sync**: Diff inspection summary (`+X new`, `~X updated`) |
| 11 | `assets/architecture-diagram.png` | [`PRIVACY.md`](PRIVACY.md) | 🖼️ Placeholder | **Architecture**: Visual boundary showing offline storage isolation |
| 12 | `assets/report-issue-guide.png` | [`CONTRIBUTING.md`](CONTRIBUTING.md) | 🖼️ Placeholder | **Contributing**: "Report Wrong Data" button in Course Details view |
| 13 | `assets/github-edit-guide.png` | [`CONTRIBUTING.md`](CONTRIBUTING.md) | 🖼️ Placeholder | **Contributing**: GitHub pencil icon on `courses.json` |

---

## Detailed Capture Instructions for Each Asset

### 1. Hero Demonstration Banner
- **File:** `assets/demo.png`
- **Location in Docs:** Top of [`README.md`](README.md) directly below badges.
- **How to Capture:**
  1. Open a realistic UIU webpage (such as UCAM advising slip, registration table, or routine sheet).
  2. Ensure the extension is active in **Highlight** or **Tooltip** mode.
  3. Capture the page showing several decoded course codes with accent underlines or expanded text.
- **Recommended Size:** `1200 x 600 px` (or widescreen aspect ratio `16:9`).

---

### 2. Tooltip Mode Preview
- **File:** `assets/demo-tooltip.png`
- **Location in Docs:** [`README.md`](README.md) &rarr; "Display Modes" section.
- **How to Capture:**
  1. Set extension to **Tooltip** or **Highlight** mode.
  2. Hover your mouse over a prominent course code (such as `CSE 3421` or `CSE 4000A`) so the interactive card pops up.
  3. Capture the card showing the course title, scheduled exam day and time slot, and prerequisite notes.
- **Recommended Size:** `800 x 400 px` (focused crop around the code and card).

---

### 3. Inline Mode Preview
- **File:** `assets/mode-inline.png`
- **Location in Docs:** [`README.md`](README.md) &rarr; "Display Modes" section (side-by-side with Tooltip).
- **How to Capture:**
  1. Open the popup and select **Inline** mode.
  2. Refresh the university webpage.
  3. Capture text where the course title appears in parentheses right after the course code (e.g., `CSE 3715 (Digital System Design)`).
- **Recommended Size:** `800 x 400 px` (matching the aspect ratio of `demo-tooltip.png`).

---

### 4. Popup Home View (Site Toggle)
- **File:** `assets/pop-up-1.png`
- **Location in Docs:** [`README.md`](README.md) &rarr; "Enabling on University Websites" section.
- **How to Capture:**
  1. Open the browser popup while on an authorized domain (e.g., `ucam.uiu.ac.bd`).
  2. Show the emerald active dot with text `Active on this page` and the toggle switch in the ON position.
- **Recommended Size:** Popup natural dimensions (`360 x 500 px`).

---

### 5. Popup Preferences & Global Toggles
- **File:** `assets/pop-up-2.png`
- **Location in Docs:** [`README.md`](README.md) &rarr; "Enabling on University Websites" section.
- **How to Capture:**
  1. Open the browser popup home view.
  2. Capture the lower half highlighting the display mode selector (`Highlight`, `Tooltip`, `Inline`) and the two toggle switches for **Exam Schedules** and **Prerequisites**.
- **Recommended Size:** Popup natural dimensions (`360 x 500 px`).

---

### 6. Course Database List & Search
- **File:** `assets/course-manager-pop-up.png`
- **Location in Docs:** [`README.md`](README.md) &rarr; "Course Database Management" section.
- **How to Capture:**
  1. In the popup, click **Manage Course Database** (`.btn-courses`).
  2. Type a query in the search input (e.g., `CSE` or `Algorithms`) to show matching rows.
  3. Capture the 3-column list displaying Code, Name, and Type tags (`Official`, `User Added`, `Edited`).
- **Recommended Size:** Popup natural dimensions (`360 x 500 px`).

---

### 7. Course Details View
- **File:** `assets/course-details-view.png`
- **Location in Docs:** [`README.md`](README.md) &rarr; "Course Database Management" section.
- **How to Capture:**
  1. From the course list, click on any course (e.g., `CSE 4000A`).
  2. Capture the Course Details screen showing the Course Code, Course Name, Exam Day (`D4`), Exam Slot (`T2`), Prerequisites, and the `Prerequisite Note` field (`MINIMUM 85 credits`).
- **Recommended Size:** Popup natural dimensions (`360 x 500 px`).

---

### 8. Batch JSON Course Import
- **File:** `assets/course-manager-pop-up-success.png`
- **Location in Docs:** [`README.md`](README.md) &rarr; "Course Database Management" section.
- **How to Capture:**
  1. From the database view, click **Add / Import Courses**.
  2. Switch to the **Batch Upload** tab and click **Copy** to load the sample JSON.
  3. Capture the screen showing the emerald status pill (e.g. `2 courses detected`) and the JSON code editor.
- **Recommended Size:** Popup natural dimensions (`360 x 500 px`).

---

### 9. Trash & Safe Recovery View
- **File:** `assets/trash-view.png`
- **Location in Docs:** [`README.md`](README.md) &rarr; "Course Database Management" section.
- **How to Capture:**
  1. Soft-delete a course so it enters Trash.
  2. Click the **Trash** button in the course database header.
  3. Capture the Trash panel showing the soft-deleted course with the **Restore** and **Permanently Delete** buttons visible.
- **Recommended Size:** Popup natural dimensions (`360 x 500 px`).

---

### 10. Differential GitHub Sync Modal
- **File:** `assets/sync-diff-modal.png`
- **Location in Docs:** [`README.md`](README.md) &rarr; "Course Database Management" section.
- **How to Capture:**
  1. Open the popup, click the settings gear icon, and click **Sync Course Database**.
  2. Capture the resulting diff indicator or toast showing changes (e.g., `Synced (+3 new, ~2 updated)`).
- **Recommended Size:** `700 x 350 px` (or natural popup width).

---

### 11. Offline Architecture & Privacy Boundary Diagram
- **File:** `assets/architecture-diagram.png`
- **Location in Docs:** [`PRIVACY.md`](PRIVACY.md) &rarr; "Core Privacy Philosophy" section.
- **How to Capture / Create:**
  1. A clean graphic or diagram showing:
     - `Browser Webpage` &larr;&rarr; `content.js`
     - `chrome.storage.local` (Offline Boundary containing all catalogs and user edits)
     - `GitHub raw.githubusercontent.com` (Only optional outbound sync endpoint)
  2. Can be drawn via Excalidraw, Figma, or a rendered Mermaid flow.
- **Recommended Size:** `900 x 400 px`.

---

### 12. "Report Wrong Data" Button in Course Details
- **File:** `assets/report-issue-guide.png`
- **Location in Docs:** [`CONTRIBUTING.md`](CONTRIBUTING.md) &rarr; "1. Fast: Report an Issue via the Extension".
- **How to Capture:**
  1. Open any course in the extension's Course Details view.
  2. Scroll to the bottom of the card.
  3. Capture the **Report Wrong Data** button with its red warning icon.
- **Recommended Size:** `600 x 300 px` (focused crop).

---

### 13. GitHub In-Browser Edit Pencil Icon
- **File:** `assets/github-edit-guide.png`
- **Location in Docs:** [`CONTRIBUTING.md`](CONTRIBUTING.md) &rarr; "Option 1: Editing Directly on GitHub".
- **How to Capture:**
  1. Open [`courses.json`](courses.json) on GitHub.com in your browser.
  2. Capture the top-right toolbar of the file viewer with a highlight around the pencil icon (**Edit this file**).
- **Recommended Size:** `900 x 400 px`.

---

## Tips for High-Quality Screenshots

1. **Browser Zoom:** Set your browser zoom to `100%` so text and UI borders remain sharp.
2. **Window Cropping:** Use Windows Snipping Tool (`Win + Shift + S`) with the "Rectangular Snip" mode.
3. **Clean Environment:** Close personal bookmarks, browser extensions, or private notifications before capturing full-browser views.
4. **File Format:** Always save as standard `.png`. Overwriting the placeholder file in `assets/` preserves all Markdown links automatically.

