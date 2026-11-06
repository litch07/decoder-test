# Current state and architecture

Source snapshot: manifest **2.0.0**, reviewed **6 November 2026**. This is the implementation reference, not a published release history. [FEATURES.md](FEATURES.md) covers user-facing behavior; [ROADMAP.md](ROADMAP.md) separates deferred work.

## Runtime and files

The extension is Manifest V3, using vanilla JavaScript, HTML and CSS. No build tools, runtime packages or CDNs are needed for the extension. Node.js runs validation/tests. The independent static web explorer loads Google Fonts.

| File | Responsibility |
|---|---|
| `manifest.json` | Permissions, service worker, popup, icons and bundled catalog resource |
| `background.js` | Catalog loading/merging, legacy deletion migration, manual sync preview/apply, enabled-site injection |
| `course-data.js` | Shared full-code identity, parsing, validation, merges, diagnostics and graph construction/traversal |
| `courses.json` | Bundled catalog, currently 315 records |
| `popup.html`, `popup.css`, `popup.js` | Popup views, navigation, forms, planner, review/confirmation dialogs and contribution drafts |
| `content.js` | Dynamic page scanning, mode-specific rendering, tooltips, chart adaptation and cleanup |
| `docs/index.html`, `docs/styles.css`, `docs/app.js` | Independent public explorer |
| `docs/courses.json`, `docs/course-data.js` | Synchronized public copies of root data/module |
| `scripts/sync_catalog.js` | Copy both shared files, or verify equality with `--check` |
| `scripts/validate_catalog.js` | Validate root schema/graph and copies; print review warnings |
| `tests/run_all.js` | Master runner, 24 suites |
| `tests/fixtures/` | Browser fixtures for specific rendering/integration scenarios |
| `.github/workflows/` | Catalog validation and Pages deployment |
| `assets/`, `icons/`, `dist/` | Documentation images, extension icons and existing distribution artifacts |

The two Fall 2026 CSV files are reference inputs, not runtime data sources. Existing distribution ZIPs are not automatically rebuilt when source files change.

## Popup and user flows

The popup uses a 360px-wide, 500px-tall view stack with scrollable content. Seven regular views are Home, Course catalog, Course details, Course roadmap, Add/Import, My courses & exams and Settings. Welcome is separate; Trash is a catalog submode. Navigation maintains history/context for course links from roadmaps.

Home provides catalog/planner entry points, decoding status, display modes and exam/prerequisite switches. Course details shows the record, local edit/planner actions, roadmap counts and an origin-specific GitHub draft action. Save is disabled for unchanged edits. The roadmap places prerequisites before the selected course and shows reverse unlocks; the next-course section starts open and can be collapsed.

Add/Import supports individual entry plus reviewed JSON text/file/drop imports, with a 2 MiB limit. Export offers JSON for current results, full active catalog or custom courses. These are course exports, not full storage backups. Notifications, busy states, confirmations and unsaved-edit handling support mutation flows. Settings provides appearance, enabled sites, manual catalog updates, About and reviewed catalog reset.

The personal planner stores local selections, known-credit totals, exam conflicts and same-day workloads. It exports Markdown, not `.ics`. It performs no UCAM registration or transcript/completed-course eligibility checks. Exam records have day/slot only, with no calendar dates, term or recorded source. Current slot labels: T1 09:00-11:00, T2 11:30-13:30, T3 14:00-15:00. Students must recheck UCAM before finalizing a plan.

System, Light and Dark appearance are implemented; the dark base token is `#090d16`. Reduced-motion and focus handling exist, but full accessibility certification or measured OLED power savings are not established.

## Course identity and schema

`CourseData.code` standardizes case/spacing to a full code such as `CSE 3421` or `CSE 4000A`. Prefix, number and suffix all remain part of identity. Numeric-only/title matches never establish prerequisite equivalence. Search may match fragments/titles for discovery without changing identity. Alias grouping in content rendering is presentation only.

Catalog dictionaries accept title strings or structured records containing:

```text
name: required nonempty text
credits: finite positive number, null or omitted
examDay: empty, positive numbered day/accepted alias, or In-class
examSlot: empty or T1/T2/T3; empty for In-class
prerequisites: complete-code array, ["None"] for explicitly none, [] for unlisted
prerequisiteNote: free-text condition
prerequisiteVariants: curriculum ID -> { prerequisites: [...], source: nonempty text }
```

Canonical storage/import normalization is path-specific. A title-only JSON import preserves existing metadata. Full-object imports normalize omitted optional fields to empty/null. Partial stored overrides use field merging; an explicit changed prerequisite list without variants removes inherited variants for that edit. Do not treat a partial record as interchangeable with a full-object import.

Credits are known for 94 bundled courses and unknown for 221. Do not infer credits, curricula or exam schedules from course titles.

## Storage and merge pipeline

All extension persistence uses `chrome.storage.local`; there is no cloud account or `chrome.storage.sync` integration.

| Key | Shape/purpose |
|---|---|
| `courses` | Derived active map |
| `userCourses` | Map of custom additions/local edits |
| `remoteCourses` | Last applied remote catalog map |
| `softDeletedCourses` | Array of reversible Trash codes |
| `hardDeletedCourses` | Array of permanent-exclusion codes |
| `allowedSites` | Enabled hosts; UCAM/eLMS/Google Docs initially allowed |
| `mode` | `highlight`, `tooltip` or `inline` |
| `showExamInfo`, `showPrerequisites` | Website-detail switches |
| `themePreference` | `system`, `light` or `dark` |
| `enrolledCourses` | Local planner code array |
| `lastSyncedAt`, `lastSyncResult` | Update time, counts/change details and warnings |
| `catalogDiagnostics` | Structural/cross-program/override review issues |
| `welcomeDismissed`, `onboardingDone` | First-use state |
| `prereqShowNames` | Written by hidden popup toggle; not loaded as a visible startup option |

Effective catalog:

```text
bundled courses.json + remoteCourses + userCourses
    minus softDeletedCourses minus hardDeletedCourses
    = courses
```

Later layers override earlier fields under the shared merge rules. Full normalized codes index every layer. Background loading and popup reload rebuild the derived cache; a stale `courses` map alone cannot replace the current bundle. Intentional remote/user overrides can still override bundled corrections, and differing prerequisite overrides are flagged for review.

Legacy `hiddenCourses`/`permanentlyDeletedCourses` migrate to the current deletion arrays. Trash is reversible; hard exclusions prevent ordinary merge resurrection. Explicit re-add/import can revive a code. **Reset catalog changes** previews the bundled-plus-remote shared catalog, clears shared-record local edits/exclusions and preserves custom-only records/exclusions. It does not clear all settings, selections or remote data.

## Catalog update and import validation

Catalog updates are manual requests to the configured raw GitHub `main/courses.json`, not UIU/UCAM synchronization. Background fetches text, checks the 2 MiB size after reading, parses with duplicate-key detection, validates schema/graph, and returns a diff plus warnings for review. Apply checks the reviewed remote revision before saving `remoteCourses` and rebuilding the effective catalog. A response removed from remote does not remove the same code from the bundled layer.

Imports validate the prospective merged catalog. Existing broken references can remain while an unrelated repair is made; newly introduced structural errors are rejected. Export, comparisons and sync preserve supported prerequisite variant metadata. Sync/update/reset do not silently erase intentional local edits.

## Prerequisite graph and current curriculum boundary

`CourseData.graph` builds one forward prerequisite map and its reverse for the selected context. Traversal is cycle-safe and uses visited full codes. Popup/web adapters use the shared graph for direct requirements, chains, stages and reverse unlocks. Display labels cannot change graph identity.

Validation checks schema, normalized collisions, missing references, self-dependencies, duplicate edges, cycles and recorded variant graphs. CSE-to-DS/DS-to-CSE relationships are review warnings, not prohibited edges. Other subjects such as EEE, MATH and PHY remain legitimate graph nodes. Override diagnostics preserve edits while exposing differences.

CSE 2215-2218 have current BSCSE base requirements plus four source-backed BSDS-233 variants. DS-rooted roadmaps select BSDS-233, other roots BSCSE-current; following a graph course preserves the originating context. There is no explicit student program/curriculum selector. Variant coverage is incomplete and unversioned records fall back to base requirements. Opening a shared CSE course directly can therefore choose the wrong context for a BSDS student.

The current bundled audit has zero structural errors and six cross-program review warnings, including four variant warnings. DS 4229 -> CSE 3521 and DS 4817 -> CSE 3521 remain unresolved evidence reviews. Do not silently delete these or other cross-subject relationships. Read [PREREQUISITE_AUDIT.md](PREREQUISITE_AUDIT.md) and [CURRICULUM_PREREQUISITES_HANDOFF.md](CURRICULUM_PREREQUISITES_HANDOFF.md) for evidence, exact locations and deferred acceptance criteria.

## Website injection and display

The manifest declares `storage`, `activeTab`, `scripting`, `tabs`, UIU/Google Docs/GitHub raw hosts, plus optional hosts for additional websites. Enabled-site state and browser access both gate dynamic injection. Content injection has a duplication guard; dynamic registration and tab handling preserve operation across supported reloads. Browser-internal pages are restricted. The bundled JSON's `<all_urls>` web-accessible-resource match is not blanket host permission.

`content.js` scans text and supported SVG structures, watches DOM mutations, and cleans up extension-owned changes when mode/settings change. It skips editable/form/script/style/code/preformatted and unsupported content. Accessible same-origin frames are supported; inaccessible frames and canvas-only document surfaces are not universal targets.

- Highlight adds a background while preserving the code's text color/weight. Hover/focus opens a card.
- Tooltip uses a dotted underline and hover/focus card.
- Inline inserts a name and enabled detail rows; its supplemental card avoids repeating the visible name/exam and provides other information.
- Supported slash aliases share an inserted name only when the catalog name agrees; original codes and distinct records remain accessible. Existing page names are not duplicated in supported contexts.
- Normal HTML table titles use compact bounded formatting and row separation. Constrained grid/clipped layouts can truncate inserted text with full hover/focus access. Spreadsheet contexts are excluded from the new alias/bounded-layout rules.
- SVG labels do not expand inline; Inline falls back to Highlight. Tooltip avoids highlight colors on chart labels.
- Recognized Highcharts cards adapt native course/attendance information, hide the overlapping native card and support hover plus click pinning. Remaining/Absent/Present use blue/red/green, with bounded prerequisite scrolling so attendance remains visible.

Tooltips have viewport-aware positioning, delayed hover/immediate focus, keyboard dismissal and outside/scroll/resize/blur cleanup. Scrolling inside a card preserves it. These paths are covered by targeted fixtures, not a guarantee for every third-party website.

## Independent public explorer

`docs/` serves its own catalog, course details and prerequisite graph with six subject filter groups, search/sort, code/name toggling, share-link copying and GitHub correction drafts. It uses the synchronized shared module. It cannot read extension custom records, Trash or planner state.

Website localStorage keys are `uiu_theme` and `uiu_prereq_names`. The visible name/code toggle is separate from the currently hidden popup toggle. Google Fonts loads externally. There is no offline service worker; serve over HTTP for reliable JSON fetches. Public links do not establish a student's selected curriculum.

## Security, privacy and verification

Runtime DOM construction uses safe node/text APIs, with no `.innerHTML` or `.insertAdjacentHTML`. This is a control, not proof that all XSS is impossible. No extension telemetry is implemented. Requested catalog updates and external URLs still use the network; GitHub draft data is transmitted in the URL on opening. See [PRIVACY.md](PRIVACY.md) and [SECURITY.md](SECURITY.md).

```sh
node scripts/sync_catalog.js
node scripts/validate_catalog.js
node scripts/sync_catalog.js --check
node tests/run_all.js
```

The master has 24 suites, with production prerequisite integration checks included in the prerequisite suite. Browser fixtures are additional targeted checks. CI validates copies/schema and runs tests. Pages deployment uploads `docs/` and requires repository Pages enabled with GitHub Actions as its source. Local passes do not verify live UCAM, installed profile storage, Firefox, store publication, hosted revision or existing ZIP contents.
