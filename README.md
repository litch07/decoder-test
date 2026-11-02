# UIU Course Code Decoder

> **Never guess a course code again.** Instantly decode cryptic UIU academic course codes into readable course titles, exam routines, and prerequisite chains across university web portals.

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-green.svg)](manifest.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Telemetry](https://img.shields.io/badge/Telemetry-Zero-brightgreen.svg)](PRIVACY.md)
[![Security Hardened](https://img.shields.io/badge/Security-Zero--innerHTML-success.svg)](SECURITY.md)

---

## 🎓 What It Does

**UIU Course Code Decoder** is an offline-first, privacy-respecting Manifest V3 browser extension built specifically for students and faculty of **United International University (UIU)**.

During course registration, advising, and exam season, university portals frequently display course codes (such as `CSE 3421`, `ACT 1111`, `DS 3120`) without course titles or schedule details. This extension scans the webpage in real time and automatically reveals:
- **Full Course Name** (e.g., `Database Management Systems`)
- **Exam Routine Schedule** (e.g., `Day A`, `Slot 1`)
- **Prerequisite Chains** (e.g., `CSE 2213`)
- **Special Degree Requirements** (e.g., `MINIMUM 85 credits`)

### Supported Web Environments
- 🏛️ **UCAM Student Portal** (`ucam.uiu.ac.bd`) — Registration, advising slips, grade sheets
- 📚 **eLMS Platform** (`elms.uiu.ac.bd`) — Course pages, assignments, syllabus notices
- 📊 **Highcharts & SVG Graphics** — Interactive grade distribution and routine charts
- 📑 **Google Docs & Sheets** — Official department routine sheets and advising spreadsheets
- 🌐 **Any Authorized Domain** — Turn it on for any webpage via the popup toggle

---

## ✨ Key Features

- ⚡ **Offline-Ready by Default**: Bundles a pre-indexed catalog of **~315 UIU courses** (CSE, EEE, BBA, Data Science, and General Education). Works 100% offline with zero initial network requirements.
- 🔒 **Zero Telemetry & Absolute Privacy**: Zero analytics, zero cookies, zero user tracking. All catalog overrides and preferences remain strictly inside your browser's `chrome.storage.local`.
- 🛡️ **Zero-`innerHTML` Security**: Fully hardened against DOM-based XSS. All DOM manipulations and interactive cards are built strictly using safe browser DOM APIs (`createElement`, `createTextNode`, `textContent`).
- 🌐 **Per-Site Permissions Model**: Adheres strictly to the principle of least privilege. The extension only executes on websites you explicitly enable. Content scripts register dynamically (`chrome.scripting.registerContentScripts`) and persist smoothly across page reloads.
- 🎓 **Accurate Prerequisite & Credit Chains**: Clear distinction between course prerequisites (e.g., `CSE 2213`) and special credit milestones (e.g., `MINIMUM 85 credits` for capstone projects).
- 🔄 **Differential Catalog Synchronization**: Sync updates from the official community GitHub catalog anytime with a single click. Inspect the exact changes (`+X new`, `~X updated`, `-X removed`) before applying them.
- ✏️ **Layered Course Database**: Add unlisted courses, edit exam schedules, or import batch course lists via JSON (with a built-in 2 MB safety cap). Your custom additions are safely preserved across catalog syncs.
- 🗑️ **Trash & Safe Recovery**: Accidental deletions go to a dedicated Trash panel where they can be restored at any time or permanently purged.
- 🚩 **1-Click "Report Wrong Data"**: Spot outdated info? Click one button in Course Details to open an emoji-guided, pre-filled GitHub issue ready for maintainer review.

---

## 🎨 Display Modes

Customize how course information is presented to match your workflow:

| Mode | Visual Appearance | Best For |
|---|---|---|
| ✨ **Highlight** | Elegant colored accent underline under course codes; hovering reveals an interactive details card. | Daily advising, routine browsing, and portal navigation. |
| 💬 **Tooltip** | Leaves webpage typography 100% untouched; hovering over course codes reveals the details card. | Strict document reading where you prefer no visual changes. |
| ✏️ **Inline** | Directly inserts the course title in parentheses into the text (e.g., `CSE 3715 (Software Engineering)`). | Fast glance reading and printable advising sheets without mouse hovering. |

*You can also independently toggle Exam Schedules and Prerequisites on or off from the home view.*

---

## 🚀 How to Enable on University Portals

To respect student privacy, the extension does not automatically run on every website:

1. Navigate to your university portal (such as [UCAM](https://ucam.uiu.ac.bd), [eLMS](https://elms.uiu.ac.bd), or an advising Google Doc).
2. Click the **UIU Course Code Decoder** icon in your browser toolbar.
3. Switch the **"Active on this page"** toggle to **ON**.
4. Your browser will prompt you once to allow access to that specific domain.
5. All course codes on the page will decode immediately, and decoding will persist across page refreshes!
6. You can review, add, or remove authorized domains anytime in the **Settings** panel.

---

## 📥 Installation

### Developer Mode (Chrome / Edge / Brave / Opera)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/litch07/uiu-course-decoder.git
   ```
2. Open your browser and navigate to `chrome://extensions`.
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** and select the extension folder.
5. Pin the extension icon to your browser toolbar for quick access!

### Firefox Installation

1. Navigate to `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on...**
3. Select `manifest.json` from this repository.

---

## 📁 Project Architecture

```
├── manifest.json              # Manifest V3 configuration & optional host permissions
├── content.js                 # DOM scanner, Highcharts/SVG decoder, zero-innerHTML renderer
├── background.js              # Service worker: dynamic script registration, layered catalog merge, GitHub sync
├── popup.html                 # 5-view sliding stack UI (Home, Courses, Details, Import, Settings)
├── popup.js                   # UI controller, search engine, dynamic permissions, GitHub issue generator
├── popup.css                  # UI styling, iOS/Material slide transitions, reduced-motion support
├── courses.json               # Baseline university catalog (~315 courses)
├── tests/                     # Automated unit and integration test suite
│   ├── test_release1.js       # Release 1 verification suite (Security, permissions, schema)
│   ├── test_merge.js          # Layered catalog merge tests
│   ├── test_sync_diff.js      # GitHub differential sync tests
│   └── ...                    # Additional unit and regression test scripts
├── .github/workflows/         # CI: automated catalog validation & test runner
├── SECURITY.md                # Vulnerability disclosure policy
├── PRIVACY.md                 # Full transparent privacy policy
└── CONTRIBUTING.md            # Course contribution guide and schema specification
```

---

## 🧪 Testing

The repository contains an automated test suite verifying data integrity, security constraints, and storage operations:

```bash
# Run the Release 1 verification suite
node tests/test_release1.js

# Run all test suites
Get-ChildItem tests/test_*.js | ForEach-Object { node $_.FullName }
```

Every Pull Request is automatically verified by GitHub Actions (`.github/workflows/validate-catalog.yml`).

---

## 🤝 Contributing

Contributions to expand department course catalogs or improve the extension are warmly welcomed!

- **Quick Fixes**: Click **"Report Wrong Data"** inside the extension popup under any course.
- **Adding Courses**: Check out [`CONTRIBUTING.md`](CONTRIBUTING.md) for the data schema specification, examples, and step-by-step instructions.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).  
Built with ❤️ by [Sadid Ahmed](https://github.com/litch07) for the UIU community.
