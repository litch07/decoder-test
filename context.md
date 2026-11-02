# UIU Course Code Decoder — Project Context

## What this is
A privacy-focused Manifest V3 browser extension that detects university course codes (e.g. `CSE 3421`) on webpages and decodes them to full course names, exam info, and prerequisites. Built primarily for UIU students, with support for custom course imports for other institutions.

Nearly all state lives in `chrome.storage.local`. The extension runs fully offline. The ONE exception is the manual "Sync Course Database" feature — opt-in only, clearly disclosed. Never add other remote fetches, analytics, or telemetry.

## Files
- `manifest.json` — MV3. Permissions: `storage`, `activeTab`, `scripting`, `tabs`. Uses `optional_host_permissions: ["*://*/*"]` (least-privilege per-site model, no blanket `<all_urls>`) + `https://raw.githubusercontent.com/*` (sync only).
- `background.js` — service worker. Merges `courses.json` (bundled) → `remoteCourses` → `userCourses`, excludes `softDeletedCourses` and `hardDeletedCourses`, saves result to `chrome.storage.local` as `courses`. Handles dynamic content script registration (`chrome.scripting.registerContentScripts`), tab update listeners (`chrome.tabs.onUpdated`), permissions change listeners (`chrome.permissions.onAdded`), and 2 MB sync payload cap. Handles Sync (with diff computation), Reload, and course-count messages.
- `content.js` — dynamically injected on authorized domains only. Hardened with Zero-`innerHTML` security: all decorations, overlays, and tooltips are constructed using safe DOM APIs (`createElement`, `createTextNode`, `textContent`). Includes `window.__UIU_COURSE_DECODER_INJECTED__` duplication guard. Builds regex from course codes, decorates matches (highlight/tooltip/inline), handles SVG/Highcharts course codes via a floating HTML overlay (not injected into the SVG, to avoid breaking chart layout), uses `MutationObserver` (paused during re-decoration cycles to avoid loops), re-decorates in place via `undecorateAll()` + re-processing instead of reloading the page.
- `popup.html` / `popup.js` — popup UI: site toggle with per-site host permission requests, display mode selector, exam/prereq toggles, Course Manager (3-column list + details page + Trash + dedicated Import page), 1-click "Report Wrong Data" issue generator, Sync button with diff summary, and "Reset Official Courses to Default" emergency-recovery button. Zero `innerHTML` throughout. 2 MB import payload safety cap.
- `popup.css` — external stylesheet with iOS/Material sliding navigation stack, dark-mode tokens, and `@media (prefers-reduced-motion: reduce)` accessibility queries.
- `courses.json` — bundled default course database (~44KB). Static baseline, never rewritten at runtime. Kept bundled for zero-latency offline-first operation. All degree credit requirements are normalized into `prerequisiteNote`.
- `CONTRIBUTING.md` — contribution guide detailing the `prerequisiteNote` schema, automated CI validation, and step-by-step browser/CLI pull request workflows.
- `PRIVACY.md`, `README.md`, `SECURITY.md` — complete, fully synchronized documentation disclosing per-site permissions, local-only storage, zero telemetry, and vulnerability disclosure terms.
- `SCREENSHOTS_GUIDE.md` — visual assets checklist and screenshot capture instructions for all documentation graphics.
- `/tests` — automated regression suite (11 test files): `test_release1.js` (Release 1 verification suite), `test_single_and_batch_integration.js`, `test_merge.js`, `test_merge_v2.js`, `test_migration.js`, `test_official_hard_delete.js`, `test_empty_trash_all.js`, `test_restore_official.js`, `test_single_course_add.js`, `test_batch_upload.js`, and `test_sync_diff.js`. Run via `node tests/<file>.js`.
- `.github/workflows/validate-catalog.yml` — automated CI GitHub Actions workflow validating JSON syntax, schema compliance, pure prerequisite arrays, and running the test suite on every PR.

## Data format
Every entry in `courses.json`, `remoteCourses`, and (usually) `userCourses` is an object:
```json
"CSE 4000A": {
  "name": "Final Year Design Project - I",
  "examDay": "",
  "examSlot": "",
  "prerequisites": [],
  "prerequisiteNote": "MINIMUM 85 credits"
}
```
- `name` required.
- `examDay`/`examSlot` always present (empty string if unknown).
- `prerequisites` strictly an array of course codes only (e.g. `["CSE 2213"]`).
- `prerequisiteNote` optional string for credit thresholds or special requirements (e.g. `"MINIMUM 85 credits"`).
- `userCourses` entries MAY be plain strings (name only) — all merging uses a shared `mergeCourseEntry(baseValue, overrideValue)` helper in `background.js` so a string never corrupts an object via spread.

## Storage keys
- `courses` — final merged dictionary content.js actually uses
- `userCourses` — user additions/edits (string or object per entry)
- `softDeletedCourses` — SOFT delete (Trash). Reversible via Trash → Restore. Does NOT touch/remove the userCourses override.
- `hardDeletedCourses` — HARD delete. Separate from softDeletedCourses. Purges any userCourses override permanently. Excluded from merge. Genuinely non-restorable through normal UI or Sync.
- `remoteCourses` — cached data from the last successful Sync
- `lastSyncedAt` — timestamp of last SUCCESSFUL sync only (never written on failure)
- `lastSyncResult` — diff summary of the last sync (added/updated/removed course codes and counts)
- `mode` — `"highlight"` / `"tooltip"` / `"inline"`
- `allowedSites` — array of hostnames where content.js is permitted to run
- `showExamInfo`, `showPrerequisites` — booleans, default `false`

## Merge precedence (background.js)
`bundled courses.json` → `remoteCourses` → `userCourses` → then exclude any code in `softDeletedCourses` OR `hardDeletedCourses` (both win regardless of source, always).

## Deletion model — IMPORTANT, do not reintroduce reverted behavior
- **Soft delete** (normal Delete button) → adds to `softDeletedCourses` only, preserves any userCourses override. Restorable anytime via Trash → Restore.
- **Hard delete** (Permanently Delete, or Empty Trash) → purges any userCourses override, adds to `hardDeletedCourses`. Genuinely final in normal use — do not build any UI that lets a user browse and restore hardDeletedCourses entries as part of Trash or Sync.
- Sync must **never** mention, suggest, or offer to restore anything in `softDeletedCourses` or `hardDeletedCourses`.
- The **only** sanctioned way to undo a hard delete is the **"Reset Official Courses to Default"** button — an emergency/catastrophic-recovery action in Settings that clears `softDeletedCourses` and `hardDeletedCourses` while leaving custom `userCourses` untouched.

## Course Manager UI (popup.js/popup.html)
- 3-column list layout: Code | Name | Type, with an origin label per course — **"User Added"**, **"Edited"**, or **"Official"** — plus filters.
- Course details page (Code, Name, Prerequisites, Exam Day/Slot, Prerequisite Note). Includes the 1-click **"Report Wrong Data"** button constructing an automated GitHub issue prefill.
- Trash view lists soft-deleted courses with **Restore** and **Permanently Delete**.
- Add / Import view with dedicated **Single Course** form and **Batch Upload** JSON editor (featuring real-time validation badge, sample copying, and safe editor clear).
- Saving or re-importing a course code automatically cleanses it from `hardDeletedCourses` and `softDeletedCourses`.

## Permissions & Dynamic Registration Model
- The extension starts with no broad host permissions (`<all_urls>` is omitted).
- When a user flips the site toggle on a webpage, `chrome.permissions.request({ origins: [origin] })` prompts for permission for that specific origin.
- `background.js` dynamically registers the content script for authorized domains using `chrome.scripting.registerContentScripts`, and handles page refreshes via `chrome.tabs.onUpdated`.

## Working conventions
- Zero `innerHTML` or `insertAdjacentHTML` across all scripts.
- Keep tasks scoped strictly to the files requested.
- Never remove/rename existing course codes without being explicitly asked.
- Never silently drop data — report parsing/matching failures instead of skipping quietly.
- Preserve existing code style and variable names; don't refactor unrelated code.
- Keep visual styling consistent with the existing orange-based UI.
