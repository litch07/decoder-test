# UIU Course Code Decoder

> **Never guess a course code again.** Instantly decode UIU academic course codes into readable course titles, exam schedules, and prerequisites on any university webpage.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Telemetry](https://img.shields.io/badge/Telemetry-Zero-brightgreen.svg)](PRIVACY.md)
[![Security Hardened](https://img.shields.io/badge/Security-Zero--innerHTML-success.svg)](SECURITY.md)

---

## What It Does

**UIU Course Code Decoder** is an offline-first, privacy-respecting Manifest V3 Chrome & Firefox extension built for students and faculty of **United International University (UIU)**. It transforms cryptic academic course codes (e.g., `CSE 3421`, `ACT 1111`) across university web portals into clear course titles, exam routines (`Day` & `Slot`), and direct prerequisite chains in real time.

Works seamlessly across:
- **UCAM Student Portal** (`ucam.uiu.ac.bd`)
- **eLMS Learning Management System** (`elms.uiu.ac.bd`)
- **Highcharts & SVG graphics** (grade distribution charts, schedule routines)
- **Google Docs & Sheets** (exam schedules, advising rosters)
- Any custom domain you authorize

---

## Key Highlights

- ⚡ **Offline-Ready**: Ships with a pre-indexed catalog of ~315 UIU courses. Zero internet connection required.
- 🔒 **Zero Telemetry & 100% Private**: Zero analytics, zero cookies, zero user tracking. All data is kept strictly inside `chrome.storage.local`.
- 🛡️ **Zero-`innerHTML` Security**: Completely purged of `innerHTML` / `insertAdjacentHTML` across content and popup scripts. All DOM operations use safe programmatic nodes (`textContent`, `createElement`).
- 🌐 **Per-Site Permissions**: Follows least-privilege principles with optional host permissions. Only activates on sites you explicitly approve.
- 🔄 **Differential Cloud Sync**: Sync official updates directly from the community-maintained GitHub repository with 1-click diff inspection (`+X new`, `~X updated`, `-X removed`).
- ✏️ **Layered Data Architecture**: Add unlisted courses or customize exam slots. Your custom edits and additions are preserved across official catalog updates.
- 🗑️ **Trash & Soft-Delete**: Safely move unwanted courses to Trash, restore them anytime, or permanently purge them.

---

## Display Modes

Choose how decoded course details appear on your university pages:

| Mode | Visual Experience | Ideal For |
|---|---|---|
| ✨ **Highlight** | Subtle university-branded accent underline; hover reveals interactive card with exam schedule and prerequisites. | Daily browsing & registration |
| 💬 **Tooltip** | Leaves webpage typography 100% unaltered; interactive tooltip card opens on hover. | Routine inspection & reading |
| ✏️ **Inline** | Inserts full course name in parentheses directly following the code (`CSE 3715 (Software Engineering)`). | Fast glance reading without mouse interaction |

---

## Installation & Setup

### Developer Mode (Local Installation)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/litch07/uiu-course-decoder.git
   ```
2. Open Google Chrome (or Edge / Brave) and navigate to `chrome://extensions`.
3. Enable the **Developer mode** toggle in the top-right corner.
4. Click **Load unpacked** and select the extension directory.
5. The extension icon will appear in your browser toolbar!

### Firefox Installation

1. Navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**
3. Select `manifest.json` from this repository.

---

## Enabling on University Portals

To respect user privacy, the extension uses an optional per-site permission model:
1. Navigate to your university portal (e.g., `ucam.uiu.ac.bd`, `elms.uiu.ac.bd`, or Google Docs routine sheets).
2. Open the extension popup from your browser toolbar.
3. Turn on the **Active on this page** toggle.
4. The browser will ask you to confirm access for that site once — course codes are detected and decoded immediately!
5. You can view, add, or revoke authorized domains anytime from the **Settings** panel.

---

## Project Structure

```
├── manifest.json              # Extension manifest (MV3, optional host permissions)
├── content.js                 # DOM scanning, Highcharts/SVG handling, zero-innerHTML renderer
├── background.js              # Service worker: layered course merging, GitHub sync
├── popup.html                 # 5-view sliding stack UI (Home, Courses, Details, Import, Settings)
├── popup.js                   # UI state controller, search filtering, dynamic permissions
├── popup.css                  # UI styling, iOS/Material slide transitions, reduced motion
├── courses.json               # Baseline university catalog (~315 courses)
├── tests/                     # Automated test suite (merging, imports, trash, sync diffs)
├── .github/workflows/         # CI: automated catalog validation & test suite
├── SECURITY.md                # Vulnerability disclosure policy
├── PRIVACY.md                 # Complete transparent privacy documentation
└── CONTRIBUTING.md            # Community contribution guide
```

---

## Contributing & Reporting Data Errors

- **Report Data Errors in 1-Click**: Open any course in the extension's **Course Details** panel and click **Report Wrong Data**. This opens a pre-filled GitHub issue containing the course's exact metadata for community maintainers to review.
- **Pull Requests**: Pull requests must pass the catalog validator (`.github/workflows/validate-catalog.yml`) and automated test suite. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## License

This project is open-source under the [MIT License](LICENSE).  
Developed with ❤️ by [Sadid Ahmed](https://github.com/litch07) for the UIU community.
