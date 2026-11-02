# Privacy Policy — UIU Course Code Decoder

**Effective Date**: November 2026  
**Extension Version**: 2.0.0+  
**Publisher / Maintainer**: Sadid Ahmed ([@litch07](https://github.com/litch07))  
**Repository**: [https://github.com/litch07/uiu-course-decoder](https://github.com/litch07/uiu-course-decoder)

---

## 🔒 Summary & Core Philosophy

**UIU Course Code Decoder** is an **offline-first**, **privacy-respecting** browser extension built for students and faculty of United International University (UIU). It decodes academic course codes (e.g., `CSE 3421`, `ACT 1111`) into readable course names, exam schedules, and prerequisites across university web portals.

**The extension collects ZERO personal data, transmits zero analytics, and runs entirely within your local browser.**

---

## 📊 Data Collection & Telemetry

| Category | Status | Details |
|---|:---:|---|
| **Telemetry & Analytics** | ❌ None | No Google Analytics, Mixpanel, Sentry, or other tracking SDKs. |
| **User Identifiers / UUIDs** | ❌ None | No unique install IDs, browser fingerprints, or machine hashes. |
| **Browsing History** | ❌ None | Webpage URLs, navigation history, and tabs are never recorded or stored. |
| **Page Content** | ❌ None | Only text nodes matching UIU course code patterns are parsed for decoration. |
| **Form Data & Passwords** | ❌ None | Input elements, textareas, and passwords are unconditionally ignored. |
| **Crash Reports** | ❌ None | Errors stay strictly inside local browser console logs. |

---

## 💾 Local Storage Architecture

All extension configuration and course catalogs reside strictly in **`chrome.storage.local`** on your device. No data is stored on remote servers or cloud accounts:

| Storage Key | Type | Description |
|---|---|---|
| `courses` | Object | Active merged course catalog (combining bundled baseline, remote updates, and custom edits). |
| `userCourses` | Object | User-added courses or custom overrides created in the Course Manager. |
| `softDeletedCourses` | Object | Courses moved to Trash (can be restored at any time). |
| `hardDeletedCourses` | Object | Permanently purged course codes (prevents official sync from restoring unwanted items). |
| `allowedSites` | Array | User-approved domains where the content script is authorized to run. |
| `remoteCourses` | Object | Cached community course catalog fetched from GitHub (updated only upon manual sync). |
| `mode` | String | Active visual display mode: `"highlight"`, `"tooltip"`, or `"inline"`. |
| `showExamInfo` | Boolean | Whether exam routine slots (Day & Slot) are displayed. |
| `showPrerequisites` | Boolean | Whether prerequisite chains and credit notes are displayed. |
| `lastSyncedAt` | Number | Unix timestamp of the most recent catalog synchronization. |
| `lastSyncResult` | Object | Summary diff of the last sync (`added`, `updated`, `removed`) for user review. |

---

## 🌐 Network Communication

The extension performs **zero periodic background network requests**. There is only **one optional, user-initiated outbound request**:

- **"Sync Course Database"** button (located in the Settings panel):  
  Downloads the latest community-verified course catalog directly from GitHub:
  ```
  https://raw.githubusercontent.com/litch07/uiu-course-decoder/main/courses.json
  ```
  - **No cookies, authentication tokens, or personal identifiers** are transmitted.
  - The response payload is subject to strict schema validation and a **2 MB payload size cap** before processing.
  - This sync runs **only** when the user manually clicks the sync button.

---

## 🛡️ Host Permissions & Per-Site Security

In compliance with the Chrome Web Store Principle of Least Privilege, the extension uses an **optional host permissions model**:

- The extension does **not** hold blanket access to all websites (`<all_urls>` is omitted from the manifest).
- Execution is strictly restricted to domains you explicitly activate via the **"Active on this page"** toggle or manage in the **Settings** domain list.
- When an allowed domain is enabled, the extension dynamically registers content scripts (`chrome.scripting.registerContentScripts`) specifically for that origin, ensuring course codes decode smoothly across page refreshes without needing wide background privileges.
- You can revoke permission for any domain at any time through the extension's Settings panel or via `chrome://extensions`.

---

## 🔒 Content Script Behavior & Security Hardening

The content script (`content.js`):
1. **Zero-`innerHTML` Policy**: All DOM injections and visual cards are built using safe programmatic DOM APIs (`document.createElement`, `document.createTextNode`, `node.textContent`). Methods like `innerHTML` and `insertAdjacentHTML` are completely absent, eliminating DOM-based Cross-Site Scripting (XSS) risks.
2. **Ignored Elements**: Text matching automatically ignores:
   - `<input>`, `<textarea>`, `<select>`, and `[contenteditable]` elements
   - `<script>`, `<style>`, `<noscript>`, `<iframe>`, and `<canvas>` elements
   - PDF viewing tabs and embedded documents
3. **Duplication Guard**: An injection guard (`window.__UIU_COURSE_DECODER_INJECTED__`) prevents redundant script initialization.

---

## 🗑️ Data Erasure & Uninstallation

Because all data lives exclusively on your local device:
- **Resetting Data**: You can reset your course database to factory default anytime inside Settings using the **"Reset to Default"** option.
- **Complete Erasure**: Uninstalling the extension immediately and permanently removes all stored catalogs, preferences, and permissions from your browser.
- **Manual Clearing**: You can also clear stored data via `chrome://extensions` → **UIU Course Code Decoder** → **Details** → **Clear storage data**.

---

## 📬 Contact & Vulnerability Reporting

If you have questions about this privacy policy or would like to report a security concern:
- **GitHub Repository**: [https://github.com/litch07/uiu-course-decoder](https://github.com/litch07/uiu-course-decoder)
- **Private Security Advisories**: [https://github.com/litch07/uiu-course-decoder/security/advisories/new](https://github.com/litch07/uiu-course-decoder/security/advisories/new)
- **Security Policy**: See [`SECURITY.md`](SECURITY.md) for vulnerability disclosure details.
