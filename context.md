# UIU Course Code Decoder — Project Context

## What this is
A privacy-focused Manifest V3 browser extension that detects university course codes (e.g. `CSE 3421`) on webpages and decodes them to full course names, exam info, and prerequisites. Built primarily for UIU students, supports custom course imports for other institutions.

Nearly all state lives in `chrome.storage.local`. The extension runs fully offline. The ONE exception is the manual "Sync Course Database" feature — opt-in only, clearly disclosed. Never add other remote fetches, analytics, or telemetry.

## Files
- `manifest.json` — MV3. Permissions: `storage`, `activeTab`, `scripting`. Host permissions `<all_urls>` (content script matching) + `https://raw.githubusercontent.com/*` (sync only).
- `background.js` — service worker. Merges `courses.json` (bundled) → `remoteCourses` → `userCourses`, excludes `softDeletedCourses` and `hardDeletedCourses`, saves result to `chrome.storage.local` as `courses`. Runs a one-time migration on startup from the old key names (`hiddenCourses` → `softDeletedCourses`, `permanentlyDeletedCourses` → `hardDeletedCourses`) with de-duplication, then removes the legacy keys. Handles Sync (with diff computation), Reload, and course-count messages.
- `content.js` — runs on all URLs, exits early unless current host is in `allowedSites` — but ALWAYS registers the `chrome.storage.onChanged` listener regardless of allowed state, so toggling a site on/off applies live without a page reload. Builds regex from course codes, decorates matches (highlight/tooltip/inline), handles SVG/Highcharts course codes via a floating HTML overlay (not injected into the SVG, to avoid breaking chart layout), uses `MutationObserver` (paused during any re-decoration cycle to avoid self-triggered loops), re-decorates in place via `undecorateAll()` + re-processing instead of `window.location.reload()` (to avoid wiping unsaved page state).
- `popup.html` / `popup.js` — popup UI: site toggle, display mode selector, exam/prereq toggles, Course Manager (3-column list + details page + Trash + dedicated Import page), Sync button with diff summary, "Reset Official Courses to Default" emergency-recovery button.
- `courses.json` — bundled default course database (~44KB). Static baseline, never rewritten at runtime. Kept bundled (not fetched on first load) deliberately, for zero-latency offline-first operation (e.g. usable in an exam hall with no signal).
- `CONTRIBUTING.md` — beginner-friendly (web-UI first) + CLI contribution guide, includes batch-submission guidance.
- `PRIVACY.md`, `README.md` — currently STALE, scheduled for a rewrite later (not yet done — do not assume these reflect the current feature set).
- `/tests` — automated regression suite: `test_merge.js`, `test_merge_v2.js`, `test_migration.js`, `test_official_hard_delete.js`, `test_empty_trash_all.js`, `test_restore_official.js` (legacy — the restore-official feature itself was reverted, but keep the test if it still validates hard-delete exclusion correctly; otherwise flag for removal), `test_sync_diff.js`. Run via `node tests/<file>.js`. Not shipped as part of the loaded extension.
- Two CSV files (`BSCSE_Fall_2026_Course_Offerings.csv`, `BSDS_Fall_2026_Course_Offerings.csv`) — reference data used to originally populate courses.json exam/prerequisite fields. Read-only unless explicitly re-syncing from them.

## Data format
Every entry in `courses.json`, `remoteCourses`, and (usually) `userCourses` is an object:
```json
"CSE 3421": { "name": "Database Management Systems", "examDay": "", "examSlot": "", "prerequisites": ["CSE 2213"] }
```
`name` required. `examDay`/`examSlot` always present (empty string if unknown). `prerequisites` always an array of course codes (decoded to names only at display time). `userCourses` entries MAY be plain strings (name only) — all merging uses a shared `mergeCourseEntry(baseValue, overrideValue)` helper in `background.js` so a string never corrupts an object via spread, and behavior can't drift between merge steps.

## Storage keys
- `courses` — final merged dictionary content.js actually uses
- `userCourses` — user additions/edits (string or object per entry)
- `softDeletedCourses` — SOFT delete (Trash). Reversible via Trash → Restore. Does NOT touch/remove the userCourses override — an edited course's edits survive a soft delete + restore cycle.
- `hardDeletedCourses` — HARD delete. Separate from softDeletedCourses. Removes the userCourses override permanently and excludes the code from the merge with the same certainty as softDeletedCourses. **Genuinely NOT restorable through normal UI or Sync** — the only way back is either manually re-adding via Import, or the deliberate "Reset Official Courses to Default" emergency action (see below). Works identically for official and user-added courses.
- `remoteCourses` — cached data from the last successful Sync
- `lastSyncedAt` — timestamp of last SUCCESSFUL sync only (never written on failure)
- `lastSyncResult` — diff summary of the last sync (added/updated/removed course codes and counts), shown in the popup
- `mode` — `"highlight"` / `"tooltip"` / `"inline"`
- `allowedSites` — array of hostnames where content.js is permitted to run
- `showExamInfo`, `showPrerequisites` — booleans, default `false`

## Merge precedence (background.js)
`bundled courses.json` → `remoteCourses` → `userCourses` → then exclude any code in `softDeletedCourses` OR `hardDeletedCourses` (both win regardless of source, always).

## Deletion model — IMPORTANT, do not reintroduce reverted behavior
- **Soft delete** (normal Delete button) → adds to `softDeletedCourses` only, preserves any userCourses override. Restorable anytime via Trash → Restore (edits reappear intact).
- **Hard delete** (Permanently Delete, or Empty Trash) → purges any userCourses override, adds to `hardDeletedCourses`. This is genuinely final in normal use — **do not build any UI (modal, banner, button) that lets a user browse and restore hardDeletedCourses entries as part of Trash or Sync.** This was tried once and deliberately reverted, because it collapsed the soft/hard delete distinction back into being the same thing.
- Sync must **never** mention, suggest, or offer to restore anything in `softDeletedCourses` or `hardDeletedCourses`. This was also tried and deliberately reverted — a deliberate deletion should never be second-guessed by a sync.
- The **only** sanctioned way to undo a hard delete is the **"Reset Official Courses to Default"** button — a single, quiet, confirmation-gated button in the main settings area, explicitly separate from the Trash/Restore workflow, framed as an emergency/catastrophic-recovery action. It clears `softDeletedCourses` AND `hardDeletedCourses` entirely and reloads the default catalog, while leaving user-added/edited courses (`userCourses`) untouched. Keep this as a rare, deliberate, all-or-nothing action — not a per-course restore tool.

## Course Manager UI (popup.js/popup.html)
- Clicking a course row opens a course details page (Code, Name, Prerequisites, Exam Day/Slot, all editable). Save and Delete both require confirmation modals.
- Course list uses a 3-column layout: Code | Name | Type, with an origin label per course — **"User Added"** (userCourses-only), **"Edited"** (bundled/remote course with a userCourses override), or **"Official"** (untouched) — plus a filter (All / User Added / Edited / Official).
- **Trash view** lists everything in `softDeletedCourses`, with **Restore** and **Permanently Delete** (moves to `hardDeletedCourses`, purges the override, removed from Trash entirely — see deletion model above). **"Empty Trash"** bulk-hard-deletes everything currently in Trash.
- Add/Import JSON lives on its own dedicated page (opened via a bottom button), with a "Copy Sample" clipboard button as the primary input path (placeholder key `"COURSE CODE"`), a soft warning for name-only imports, full-format validation, and a contribution notice linking to CONTRIBUTING.md.
- Saving or re-importing a course code automatically removes it from `hardDeletedCourses` if present (re-adding is an intentional, explicit action, so it's allowed to "graduate" a course back out of hard-delete state).

## Sync feature (manual, opt-in only)
Never automatic. `syncCourses()` in background.js fetches `https://raw.githubusercontent.com/litch07/uiu-course-decoder/main/courses.json`, validates it's a well-formed course-object map, computes a diff against the prior catalog (added/updated/removed codes + counts), stores the result as `remoteCourses` + `lastSyncResult` + updates `lastSyncedAt` — only on success. Popup shows the diff summary (e.g. "Synced (+3 new, 2 updated)" or "Up to date"), a persistent human-readable "last synced" timestamp, a loading/success/failure button state, and a disclosure note that this is the only network-dependent feature. Sync is additive — it never touches userCourses, softDeletedCourses, or hardDeletedCourses, so local customizations and deletions always survive a sync (see deletion model above — this is enforced deliberately, not accidentally).

## Known open item (not yet built)
If a repo course is edited locally (userCourses override) and the official version later improves via someone else's GitHub contribution, there is currently no notice that the local copy has drifted from a better upstream version. Planned but not yet scoped/built (this is a display-only comparison feature for EDITED courses — do not confuse with the reverted delete-restore-via-sync behavior above, which is a different, rejected concept).

## Working conventions
- Keep tasks scoped to the files stated in the prompt — Antigravity has previously expanded scope beyond what was asked (see deletion model history above); when a prompt says "scope to X," flag any additional unscoped changes clearly in the response rather than silently including them.
- Never remove/rename existing course codes without being explicitly asked.
- Never silently drop data — report parsing/matching failures instead of skipping quietly.
- Preserve existing code style and variable names; don't refactor unrelated code.
- Keep visual styling consistent with the existing orange-based UI.
- After any change, report exactly which files changed, what changed, and any data-quality issues found.