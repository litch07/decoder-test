# Feature reference

Source snapshot: manifest **2.0.0**, reviewed **6 November 2026**. This describes implemented behavior, including its limits; proposed work is in [ROADMAP.md](ROADMAP.md).

## Popup and navigation

The popup is 360px wide and 500px tall, with scrolling content. Its regular views are Home, Course catalog, Course details, Course roadmap, Add/Import, My courses & exams, and Settings. First-use welcome is separate; Trash reuses the catalog view. Back navigation retains the previous roadmap context when following a prerequisite course.

System, Light and Dark appearance are available. Focus styles, reduced-motion handling, action notifications, busy states, unsaved-edit confirmations and destructive-action confirmations are implemented. Keyboard support includes Tab focus trapping in review/confirmation/export dialogs, Escape dismissal/back navigation, arrow navigation for supported tabs/theme/filter controls and live status announcements. These are not a claim of a full accessibility certification.

## Website decoding

| Mode | Visible treatment | Interaction |
|---|---|---|
| Highlight | Background highlight around code | Hover/focus course card |
| Tooltip | Dotted underline, original text color/weight | Hover/focus course card |
| Inline | Inserted name, with optional exam/prerequisite rows | Additional hover/focus details |

- Matches full course codes, including compact spacing, without merging different prefixes or suffixes.
- Watches DOM changes and processes accessible same-origin frames, with one controller per owned document and shared settings/cleanup for fallback frames. Form/editable areas, scripts, styles, code/preformatted text and unsupported rendering surfaces are excluded.
- Exam and prerequisite switches control added details. Unknown schedules and unlisted requirements remain distinguishable from known values.
- Shared names in supported slash-separated alias groups are inserted once. Original codes and links remain; each course retains its credits, exams and prerequisites.
- Normal HTML tables use compact inline names and course-row separation. Bounded grid/clipped cells can shorten inserted names with full details on hover/focus. Spreadsheet contexts are excluded from these new alias/layout rules to preserve their existing rendering.
- SVG labels do not receive inline expansion. Inline falls back to Highlight for these labels; Tooltip keeps labels visually neutral apart from its mode treatment where supported.
- Recognized Highcharts attendance popups use one structured HTML extension card, opened on hover and pinnable by click. Native SVG text is a data source rather than a second extension renderer; unmatched chart items retain their native popup. Remaining, absent and present counts use distinct colors. Long prerequisite details scroll without pushing the attendance summary out of the card.
- Tooltips are positioned within the viewport and support focus, Escape and dismissal on outside interaction, page scrolling, resize or loss of focus. Scrolling inside the card preserves it.

DOM-based university pages and some published document/table layouts are supported on a best-effort basis. Canvas-only Google Sheets/Docs content, inaccessible frames and every third-party chart are not guaranteed to decode.

## Course catalog and details

- Bundled catalog of 315 courses; 94 have known numeric credits, 221 have unknown credits.
- Search by code/name, ranked results and match counts in the catalog and personal course list; catalog filters and sorting.
- Course name, code, origin/type, known credits, saved exam day/slot, prerequisites and prerequisite notes.
- Local additions/edits with validation. Save remains disabled when no meaningful change has been made.
- A roadmap entry at the bottom of the details section, showing prerequisite and unlock counts.
- Course contribution actions depend on origin: **Report a course error**, **Suggest this course**, or **Suggest this update**. They open GitHub drafts; edited-course drafts include before/after details. Submission on GitHub is separate.

## Prerequisite roadmap

Shared graph data supplies direct prerequisites, complete chains, bottom-up stages and reverse unlocks. The next-course section opens by default and can be collapsed. Full normalized course codes are identities; matching titles or numbers do not establish equivalence.

Missing references, self-dependencies, duplicate edges and cycles are checked. CSE/DS relationships can trigger review warnings, without deleting potentially valid academic requirements. EEE, MATH, PHY and other cross-subject requirements are preserved.

CSE 2215–2218 include source-backed BSDS-233 variants alongside current BSCSE defaults. A DS root selects BSDS-233; other roots select BSCSE-current. Navigation retains the originating context. This is limited coverage, not a student program/batch selection feature. Unversioned records can still fall back to base requirements. Popup roadmap cards show both code and name; the public explorer has a code/name toggle. See [curriculum limitations](CURRICULUM_PREREQUISITES_HANDOFF.md).

## My courses & exams

- Personal course selection, searchable by code/name, with known-credit totals and unknown-credit feedback.
- Same-day/same-slot conflict messages and separate same-day exam workload messages, including course names and day/slot information.
- Markdown exam-plan download. No calendar `.ics` export.
- Planning reminder to recheck UCAM's latest dates/times. The extension stores no exam term, calendar dates or schedule-source metadata and does not register/remove UCAM courses.

Current slot labels: T1 09:00–11:00, T2 11:30–13:30, T3 14:00–15:00. These labels do not prove the latest official routine.

## Imports, exports, Trash and catalog maintenance

- Add a course individually or import JSON by paste, file selection or drag/drop, with a 2 MiB input limit.
- Preview additions/changes and validation warnings before import. Duplicate JSON keys and normalized-code collisions are rejected.
- A title-only string import preserves existing metadata. Full-object imports normalize omitted optional fields to empty/null; they are not partial field patches.
- Export JSON for current results, the full active catalog or custom courses. Exports contain course records, not complete extension storage.
- Move courses to Trash, restore them, permanently exclude them, and review confirmations for bulk/permanent operations.
- Manual catalog update fetches the configured GitHub JSON, validates it, and presents changes for review. Local overrides continue to take precedence.
- **Reset catalog changes** previews restoration against the bundled plus remote catalog. It clears edits/deletions for shared catalog codes while preserving custom-only records/exclusions. It is not a full settings/planner reset or a return to the bundle alone.

## Settings and independent web explorer

Settings includes Appearance, Enabled websites, Catalog updates, About and Reset catalog changes. UCAM, eLMS and Google Docs are in the default allowlist; actual injection also depends on browser access. Additional sites use optional grants. The enabled-site list supports search, wildcard/subdomain patterns, selection and bulk removal.

The public app in `docs/` has six filter groups (CSE, DS, EEE, BBA, SCI, GEN), search/sort, course details, prerequisites/unlocks, a code/name toggle, copyable share links and GitHub correction drafts. It uses its own files and localStorage preferences. Extension custom data, Trash and personal planner selections are not shared with it. Google Fonts requires network access; no offline service worker is implemented.
