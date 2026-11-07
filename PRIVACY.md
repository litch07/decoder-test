# Privacy

Reviewed **6 November 2026** against source manifest **2.0.0**. The extension and the independent web explorer have different storage and network behavior.

## Website processing

The extension reads accessible page text to match course codes and inserts decoded information on enabled websites. It watches DOM changes and can inspect accessible same-origin frames. The code excludes editable/form areas and several non-content elements from scanning; this is not a guarantee that every page contains no personal information.

Active/permitted tab URLs are read to determine the website, enabled state and injection eligibility. Page text and browsing history are not uploaded by an extension analytics service: no telemetry or analytics service is implemented.

On UCAM's exam-routine page, a Sheet can request a hover card from its parent UCAM page. The browser passes the matched course code, its position and card display state between those frames. UCAM's extension script resolves the details from the local catalog.

## Local extension storage

`chrome.storage.local` stores:

| Key | Contents |
|---|---|
| `courses` | Derived active course map |
| `userCourses` | Custom courses and local edits |
| `remoteCourses` | Last applied remote catalog |
| `softDeletedCourses`, `hardDeletedCourses` | Arrays of excluded course codes |
| `allowedSites` | Enabled website hosts |
| `mode`, `showExamInfo`, `showPrerequisites` | Website display preferences |
| `themePreference` | System/Light/Dark preference |
| `enrolledCourses` | Personal planner course-code selections, not UCAM enrollment |
| `lastSyncedAt`, `lastSyncResult` | Catalog update time and change/review information |
| `catalogDiagnostics` | Validation and override review issues |
| `welcomeDismissed` | Current first-use interface state |
| `onboardingDone` | Legacy value that may remain in older profiles; no longer read/written |
| `prereqShowNames` | Legacy popup preference; retained in existing storage but no longer read/written |

There is no extension account or `chrome.storage.sync` integration. Legacy deletion keys are migrated to the current arrays. Storage is not an encrypted personal vault; access also depends on browser/profile and device security.

JSON downloads contain selected course records. Markdown downloads contain the personal exam plan. Neither is a complete extension backup. Clipboard writes occur when copying sample JSON; the web explorer can copy a share link. No clipboard-read feature is implemented.

## Network activity and external actions

- Bundled decoding data is loaded from the extension package and queried locally.
- **Manual catalog updates** fetch public JSON from `https://raw.githubusercontent.com/litch07/uiu-course-companion/main/courses.json`. No explicit student identifier or local course data is added to that request. The server still receives ordinary request/network information. The response is size-checked after it has been read; this is not a streaming download limit.
- **GitHub drafts** put course details and, for suggested edits, before/after values into a prefilled URL. Opening the draft sends that URL data to GitHub even before submission. Review local notes or custom course data before choosing this action. Submitting the issue is a separate user action on GitHub.
- About, profile, repository, release and store links open external websites with their own privacy policies.

There is no automatic live UCAM catalog or exam feed. Ordinary browsing to university sites is separate from extension data processing.

## Permissions

The manifest requests `storage`, `activeTab`, `scripting` and `tabs`. Declared host permissions cover GitHub raw content, `docs.google.com` and UIU subdomains. Additional websites use **optional host permissions** (`*://*/*`). Injection requires both an enabled site and applicable browser access; UCAM, eLMS and Google Docs are initially in the enabled list.

`web_accessible_resources` exposes the bundled `courses.json` with `<all_urls>` matching. This resource declaration is distinct from blanket host permission to read every website. Browser-restricted pages remain inaccessible.

## Independent public web explorer

The `docs/` app loads its own catalog and scripts, not extension storage. It saves theme and roadmap code/name preferences in website localStorage (`uiu_theme`, `uiu_prereq_names`). Its page loads Google Fonts from `fonts.googleapis.com`/`fonts.gstatic.com`; the hosting provider and external links also handle ordinary web requests. No analytics integration is implemented in the app. Extension offline/no-telemetry statements should not be interpreted as a promise that the hosted website makes no network requests.

## Removal and reset

Trash and permanent exclusion affect course visibility in the local catalog. **Reset catalog changes** restores shared catalog records against bundled plus remote data while preserving custom-only records; it does not erase all preferences or personal selections. Normal extension removal clears extension-owned storage through the browser, subject to browser/profile behavior. Downloaded exports, copied text and submitted GitHub issues are separate copies and are not removed by a catalog reset or uninstall. No secure-erasure guarantee is made.
