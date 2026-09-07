# UIU Course Code Decoder — Project Context

## What this is
A privacy-focused Manifest V3 browser extension that detects university course codes (e.g. `CSE 3421`) on webpages and decodes them to full course names, along with optional exam info and prerequisites. Built primarily for United International University (UIU) students, but supports custom course imports for other institutions.

Almost all state lives in `chrome.storage.local` and the extension runs fully offline. The ONE exception is the manual "Sync Course Database" feature (see below), which is opt-in only and clearly disclosed to the user — never add other remote fetches, analytics, or telemetry.

## Files
- `manifest.json` — MV3. Permissions: `storage`, `activeTab`, `scripting`. Host permissions `<all_urls>` (for content script matching) plus `https://raw.githubusercontent.com/*` (for the sync feature only). `content.js` only activates on hosts in the user's `allowedSites` list.
- `background.js` — service worker. Loads default `courses.json`, merges it with `remoteCourses` (if synced) and `userCourses`, excludes anything in `softDeletedCourses` and `hardDeletedCourses`, and saves the final result to `chrome.storage.local` under key `courses`. Also handles messages from popup/content script (course count, reload, sync).
- `content.js` — runs on all URLs but exits early unless the current host (or ancestor iframe) is in `allowedSites`. Builds a regex from all course code keys to match codes in page text, walks DOM text nodes (skips `<script>`, `<style>`, `textarea`, `.svg` — see SVG handling below), decorates matches per the active display mode, and re-scans on DOM mutations via `MutationObserver`.
- `popup.html` / `popup.js` — extension popup UI: site on/off toggle, display mode selector, exam-info/prerequisite toggles, Course Manager panel, Sync Course Database button, allowlist manager.
- `courses.json` — the bundled default course database (treated as a static baseline — never rewritten at runtime, to stay safe for future sync updates).
- `/tests` — merge-logic test files (kept for regression checks, not shipped as part of the loaded extension).
- `CONTRIBUTING.md` (in the GitHub repo) — being updated to reflect the new data format, a beginner-friendly web-UI contribution path, and batch/department submission guidelines.

## Data format
Every entry in `courses.json`, `remoteCourses`, and (usually) `userCourses` is an object:

```json
"CSE 3421": {
  "name": "Database Management Systems",
  "examDay": "",
  "examSlot": "",
  "prerequisites": ["CSE 2213"]
}
```

- `name` is required. `examDay`/`examSlot` are strings (empty string if unknown, keys never omitted). `prerequisites` is an array of course code strings (decoded to full names only at display time in `content.js`, never stored decoded).
- `userCourses` entries MAY still be plain strings (name only) — e.g. from a quick manual add or a legacy import. All merge logic must treat a plain string as `{ name: <string> }` and merge it field-by-field against whatever it's overriding, never fully replacing an object with a bare string (this is handled by a shared `mergeCourseEntry(baseValue, overrideValue)` helper in `background.js`, used consistently everywhere a merge happens, so behavior can't drift between layers).

## Storage keys (chrome.storage.local)
- `courses` — final merged dictionary used by content.js (all objects)
- `userCourses` — user's custom-added or edited courses (string or object per entry)
- `softDeletedCourses` — array of course codes in the user's Trash (soft-deleted tombstones); excluded from the merged result but can be restored
- `hardDeletedCourses` — array of course codes permanently deleted by the user; excluded from the merged result and removed from Trash
- `remoteCourses` — cached course data fetched from the GitHub repo via Sync; overwrites matching `courses.json` defaults but is itself overwritten by `userCourses`
- `lastSyncedAt` — timestamp of the last SUCCESSFUL sync only (never written on failure)
- `mode` — display mode: `"highlight"`, `"tooltip"`, or `"inline"`
- `allowedSites` — array of hostnames where `content.js` is permitted to run
- `showExamInfo` — boolean, default `false`
- `showPrerequisites` — boolean, default `false`

## Merge precedence (background.js)
Lowest to highest priority, using `mergeCourseEntry()` at every step so string/object mixing never corrupts data:
`bundled courses.json` → `remoteCourses` (if present) → `userCourses` (if present) → then any codes in `softDeletedCourses` and `hardDeletedCourses` are excluded from the final result.

## Course Manager UI (popup.js/popup.html)
- Clicking a course row (not a separate button) opens a **course details page** within the popup, replacing the list view.
- Details page shows editable fields: Course Code, Name, Prerequisites (comma-separated codes), Exam Day, Exam Slot.
- **Save**: requires a confirmation modal before committing. Saves as a `userCourses` override (object or string format, matching existing add-course logic) using `mergeCourseEntry()`.
- **Delete**: requires a confirmation modal before committing. Works for ALL courses (not just user-added ones) — moves the course to Trash by adding its code to `softDeletedCourses` (and removing any `userCourses` override). Soft-deleted courses can be viewed and restored from the Trash tab, or permanently deleted (which moves them to `hardDeletedCourses`). Re-adding or editing a previously-deleted course also automatically restores it.
- The details page includes a contribution notice with a link to `CONTRIBUTING.md` on GitHub, encouraging users to submit local corrections upstream.
- Add/Import JSON panel has a **"Copy Sample" button** that copies a ready-to-edit object-format template to the clipboard (placeholder key `"COURSE CODE"`) — this is the primary encouraged input path. The parser still accepts legacy plain-string values for backward compatibility, but a soft (non-blocking) warning is shown after import if any imported entries are name-only, encouraging users to add exam/prerequisite details later.

## Sync feature (manual, opt-in only)
- Triggered only by the user clicking "Sync Course Database" in the popup — **never automatic** on install/startup, to preserve the offline-first design.
- `background.js`'s `syncCourses()` fetches `https://raw.githubusercontent.com/litch07/uiu-course-decoder/main/courses.json`, validates it's a well-formed object of course entries (rejects and aborts on malformed data, leaving existing `remoteCourses` untouched), then stores it as `remoteCourses` plus updates `lastSyncedAt` — only on success.
- Popup shows a persistent "last synced" timestamp (human-readable, e.g. "2 minutes ago") loaded on popup open, plus a loading/success/failure state on the Sync button itself, and a disclosure note explaining this is the only feature that makes a network request.
- On successful sync, the popup broadcasts a refresh to ALL open tabs (via a shared `broadcastToAllTabs()` helper) so decorated pages update immediately — this same helper is also used by the display-mode toggle and "Reload Courses from File," so there is exactly one tab-refresh mechanism in the codebase, not several inconsistent ones.
- The GitHub repo's `courses.json` is treated as the community-maintained source of truth; local edits/deletes always take precedence over it via the merge order above.

## Display modes (content.js)
Three modes: `highlight`, `tooltip`, `inline`. When `showExamInfo`/`showPrerequisites` are enabled, all three modes show color-coded sections using an orange palette (matching UIU branding) to visually distinguish course name vs. exam info vs. prerequisites, consistently across all three modes.

### SVG / chart handling (e.g. Highcharts)
Course codes inside `<svg>` elements (chart tooltips, axis labels, titles) are still highlighted in-place using native SVG `tspan` elements (since HTML elements can't be injected into SVG safely). However, the FULL info display (name + exam + prerequisites) is shown via a **floating HTML overlay** appended to `document.body` (outside the SVG's DOM), positioned near the hovered element using `getBoundingClientRect()`. This avoids the earlier bug where injecting full text directly into the SVG pushed other page elements (e.g. attendance boxes) out of place — the overlay lives outside the chart's layout entirely, so it can never affect it. Truncated course codes (shortened by charting libraries) are still read from the hidden `<title>` attribute and fed into this same overlay.

## Working conventions for this project
- Keep tasks scoped to the files stated in the prompt — don't touch files outside that scope even if related.
- Never remove or rename existing course codes/keys without being explicitly asked to.
- Never silently drop data — if something can't be parsed or matched, report it instead of skipping quietly.
- Preserve existing code style and variable names; don't refactor unrelated code while implementing a feature.
- Keep visual styling consistent with the existing orange-based UI — flag it rather than introducing a different color family for new features.
- After any change, report exactly which files changed and what changed in each, plus any data-quality issues found (mismatched codes, empty fields, malformed rows, broken assumptions, etc.) so they can be reviewed rather than auto-resolved.