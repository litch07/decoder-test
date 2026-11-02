# Privacy Policy — UIU Course Code Decoder

**Effective Date**: November 2026  
**Extension Version**: 2.0.0+  
**Publisher**: Sadid Ahmed ([@litch07](https://github.com/litch07))

---

## Summary

**UIU Course Code Decoder** is an **offline-first**, **privacy-respecting** browser extension engineered for students and faculty of United International University (UIU). It decodes cryptic academic course codes (e.g., `CSE 3421`, `ACT 1111`) into readable course names, exam schedules, and prerequisites on university web portals.

**The extension collects ZERO personal data, transmits zero analytics, and runs entirely in your local browser.**

---

## Data Collection & Telemetry

| Category | Status |
|----------|--------|
| Telemetry / Usage Tracking | ❌ None collected |
| User Identifiers / UUIDs | ❌ Never generated or collected |
| Browsing History | ❌ Not accessed or collected |
| Page Content (beyond course codes) | ❌ Never read, stored, or transmitted |
| Personal Credentials / Form Data | ❌ Never accessed |
| Crash Reporting Services | ❌ None used |

---

## Local Storage Architecture

All extension state is stored strictly in **`chrome.storage.local`** on your device:

| Storage Key | Purpose |
|-------------|---------|
| `courses` | Merged active course catalog (bundled + remote sync + user edits) |
| `userCourses` | User-added courses or local custom overrides |
| `softDeletedCourses` | Courses sent to Trash (restorable) |
| `hardDeletedCourses` | Permanently deleted course codes (prevents sync resurrection) |
| `allowedSites` | Allowlist of user-approved domains where the extension executes |
| `remoteCourses` | Cached official catalog fetched from GitHub (user-initiated only) |
| `mode` | Visual presentation mode (`highlight`, `tooltip`, `inline`) |
| `showExamInfo` | Exam routine display toggle preference |
| `showPrerequisites` | Prerequisite display toggle preference |
| `lastSyncedAt` | Timestamp of last successful catalog synchronization |
| `lastSyncResult` | Summary diff of last catalog update (cleared automatically after viewing) |
| `onboardingDone` | State flag tracking first-run welcome card dismissal |

No data leaves your local device except for voluntary catalog sync requests described below.

---

## Network Communication

The extension makes **one optional, user-initiated outbound request**:

- **"Sync Course Database"** button in Settings:  
  Downloads the community-maintained course catalog from the official GitHub repository:
  ```
  https://raw.githubusercontent.com/litch07/uiu-course-decoder/main/courses.json
  ```
  - **No user identifiers, tokens, or cookies** are transmitted with this request.
  - Payloads are subject to strict schema validation and a **2 MB payload size cap**.
  - No background periodic network polling occurs; sync happens only when manually clicked by the user.

No other network connections are initiated. The extension never contacts analytics providers, ad networks, or external telemetry endpoints.

---

## Host Permissions (Per-Site Model)

In compliance with Chrome Web Store least-privilege standards, the extension operates under an **optional host permissions model**:

- The extension does **not** possess blanket access to all websites (`<all_urls>` is omitted).
- Execution is strictly restricted to domains you explicitly grant access to via the popup toggle or Settings allowlist.
- You can revoke permission for any site at any time via the extension popup or browser settings (`chrome://extensions`).

**Default UIU portals suggested on first launch:**
- `ucam.uiu.ac.bd` (UCAM Student Portal)
- `elms.uiu.ac.bd` (eLMS / LMS)
- `docs.google.com` (Google Docs, optional for routine sheets)

---

## Content Script Behavior & Security

The content script (`content.js`):
1. Traverses text nodes solely looking for valid UIU course code patterns.
2. Decorates matched codes with course titles, exam routines, and prerequisites.
3. Operates with a **Zero-`innerHTML` policy**: all DOM modifications are performed via programmatic nodes (`createElement`, `createTextNode`, `textContent`), preventing DOM-based Cross-Site Scripting (XSS).
4. **Explicitly ignores** input elements (`<input>`, `<textarea>`, `contenteditable`), passwords, script tags, styles, and PDF documents.

---

## Third-Party Services

This extension integrates zero third-party SDKs, tracking libraries, advertising networks, or analytics frameworks.

---

## Your Rights & Data Erasure

Because no user data is collected or sent to remote servers, there are no remote accounts or server-side records to delete. To completely erase all local data:
- Go to `chrome://extensions` → **UIU Course Code Decoder** → **Details** → **Clear storage**.
- Or uninstalling the extension instantly purges all local storage data from your device.

---

## Contact & Security Inquiries

For privacy concerns, questions, or bug reports, please open an issue or private advisory:
- GitHub: [https://github.com/litch07/uiu-course-decoder](https://github.com/litch07/uiu-course-decoder)
- Security Advisories: [https://github.com/litch07/uiu-course-decoder/security/advisories/new](https://github.com/litch07/uiu-course-decoder/security/advisories/new)
