# Prerequisite integrity investigation

Checked: 6 November 2026. Relationship arrows below mean **course requires prerequisite**.

## Root cause

The repository stored BSDS prerequisites as the sole prerequisites for shared CSE-coded foundation courses. The previous popup and website traversals followed those records faithfully. The reproduced pre-fix path was:

`CSE 4813 → CSE 4889 → CSE 3811 → CSE 2217 → CSE 2215 → DS 1115`

The direct Deep Learning relationships were already correct: CSE 4813 requires CSE 4889, and DS 4211 requires DS 4889. The academic sources distinguish these records despite matching titles. See [UIU CSE course descriptions](https://cse.uiu.ac.bd/ug-program/course-description/) and [UIU DS course plan](https://datascience.uiu.ac.bd/ug-program/course-plan/).

No numeric-only or title-based identity merge was found in prerequisite traversal. Matching titles in the website decoder are a display-only alias feature; each marker retains its own full code and resolved record. There were separate risks: inconsistent normalization between loaders/imports, duplicated popup/web traversal code, a derived local `courses` cache used without rebuilding, and intentional remote/user overrides taking precedence over newly bundled data.

## Academic comparison and catalog changes

[UIU's current BSCSE course sequence](https://cse.uiu.ac.bd/ug-program/course-plan/) and [BSDS course plan](https://datascience.uiu.ac.bd/ug-program/course-plan/) give different requirements for the same shared codes:

| Shared code | Current BSCSE default | Preserved BSDS-233 variant |
|---|---|---|
| CSE 2215 | CSE 1111 | DS 1115, DS 1116 |
| CSE 2216 | CSE 1112 | DS 1115, DS 1116 |
| CSE 2217 | CSE 2215 | CSE 2215, CSE 2216 |
| CSE 2218 | CSE 2216 | CSE 2215, CSE 2216 |

Only these four prerequisite defaults were corrected. The prior BSDS arrays remain in `prerequisiteVariants.BSDS-233`, with an official source URL. Notes disclose the default and alternate curriculum. Names, credits, exam days, and exam slots were not changed.

Older BSCSE offerings list different prerequisites too; for example, [Summer 2024 offerings](https://cse.uiu.ac.bd/wp-content/uploads/sites/3/2024/03/Offered-Course-List-Summer-2024-Trimester-1.pdf) differ from the current sequence. Older requirements were not combined with current records or guessed. This change supports the current BSCSE default and the verified BSDS-233 context, not a universal model of every historic curriculum.

## Complete CSE ↔ DS edge audit

The original bundled catalog contained exactly six direct edges between these prefixes. All six remain represented, with program scope where verified:

| Edge | Finding and action |
|---|---|
| CSE 2215 → DS 1115 | Verified BSDS requirement; moved out of the universal default into BSDS-233. |
| CSE 2215 → DS 1116 | Verified BSDS requirement; retained in BSDS-233. |
| CSE 2216 → DS 1115 | Verified BSDS requirement; retained in BSDS-233. |
| CSE 2216 → DS 1116 | Verified BSDS requirement; retained in BSDS-233. |
| DS 4229 → CSE 3521 | Needs curriculum/source review. Retained and flagged. |
| DS 4817 → CSE 3521 | Needs curriculum/source review. Retained and flagged. |

The current [DS course plan](https://datascience.uiu.ac.bd/ug-program/course-plan/) lists “N/A” for the last two courses. That does not establish that an older requirement is false, so neither edge was deleted. A prefix difference is a review signal, not a prohibition. EEE, MATH, PHY and other cross-subject prerequisites remain valid edges.

After the correction, the base catalog has two CSE/DS cross-prefix edges; the BSDS-specific variants retain the other four. Validation reports six review warnings and zero structural errors across the 315-course catalog.

## File-level trace and identity inventory

| Stage | Location | Identity and relationship handling |
|---|---|---|
| Bundled records | [courses.json](</D:/New Works/uiu-course-code-decoder-extension/courses.json:283>) | Shared foundation defaults and source-backed variants; public copy is synchronized. |
| Identity and indexing | [course-data.js](</D:/New Works/uiu-course-code-decoder-extension/course-data.js:5>) | Complete prefix + numeric part + suffix; case/spacing normalization only. No numeric/title equivalence. Normalized-key collisions are rejected. |
| Catalog normalization | [course-data.js](</D:/New Works/uiu-course-code-decoder-extension/course-data.js:35>) | Canonical dictionary keys and prerequisite references. Partial overrides do not fabricate empty prerequisite arrays. |
| Graph construction/BFS/reverse | [course-data.js](</D:/New Works/uiu-course-code-decoder-extension/course-data.js:46>) | One forward map and its reverse, cycle-safe BFS, deduplicated edges, selected curriculum. Missing references remain missing nodes rather than resolving to another prefix. |
| Graph validation | [course-data.js](</D:/New Works/uiu-course-code-decoder-extension/course-data.js:90>) | Missing references, duplicate edges, self-dependencies, cycles and cross-program review warnings. Every recorded curriculum variant is checked. |
| Layer merging | [course-data.js](</D:/New Works/uiu-course-code-decoder-extension/course-data.js:140>) | Bundled + remote + user, then full-code soft/hard exclusions. Explicit prerequisite edits override inherited variants only when requirements actually differ. |
| Override review | [course-data.js](</D:/New Works/uiu-course-code-decoder-extension/course-data.js:157>) | Flags differing remote/user prerequisites or variants, without deleting intentional edits. |
| Service worker loading | [background.js](</D:/New Works/uiu-course-code-decoder-extension/background.js:9>) | Reads source layers, applies the shared merge, persists active records and `catalogDiagnostics`. Existing legacy deletion-key migration remains. |
| Catalog sync | [background.js](</D:/New Works/uiu-course-code-decoder-extension/background.js:60>) | Duplicate JSON-key/schema/whole-graph validation before preview/apply; warnings included in review; stale review revisions rejected. |
| Popup loading/cache | [popup.js](</D:/New Works/uiu-course-code-decoder-extension/popup.js:370>) | Normalizes source maps and selections, rebuilds the derived cache against the current bundle, preserves differing overrides and stores diagnostics. |
| Field comparisons/import/export | [popup.js](</D:/New Works/uiu-course-code-decoder-extension/popup.js:886>) and [import preview](</D:/New Works/uiu-course-code-decoder-extension/popup.js:1283>) | Full-code normalization, variant-aware comparisons, prospective-graph import checks, variant-preserving export and commit. Existing broken references do not block unrelated repairs; newly introduced structural errors do. |
| Popup roadmap | [popup.js](</D:/New Works/uiu-course-code-decoder-extension/popup.js:3222>) | Shared graph for direct prerequisites, stages and reverse unlocks. Per-node requirement text uses the same resolved records. Existing navigation history preserves the originating curriculum when opening shared courses. |
| Web explorer | [docs/app.js](</D:/New Works/uiu-course-code-decoder-extension/docs/app.js:104>) and [graph adapter](</D:/New Works/uiu-course-code-decoder-extension/docs/app.js:133>) | Shared identity/graph module; normalized loader and URL hash; retained curriculum when following badges. Review messages use the existing note area. |
| Website decoder | [content.js](</D:/New Works/uiu-course-code-decoder-extension/content.js:42>) | Regex and `resolve` match full-prefix codes, including compact spacing. Display alias grouping never merges catalog entries, prerequisite arrays or graph identities. |
| Search/departments/forms | [popup.js](</D:/New Works/uiu-course-code-decoder-extension/popup.js:2092>) | Search can match titles and code fragments for discovery; department prefixes are filters. Neither is used as graph identity. Add/edit validation uses CourseData; deletions and enrolled selections retain normalized full codes. |

The popup’s existing name/code badge toggle can show identical titles, but badges retain their original code for lookup, navigation and tooltips. Rendering was not the source of the cross-program paths.

## Saved records and effective catalog behavior

`remoteCourses` and `userCourses` can still override corrected bundled prerequisites, by design. A prior merged `courses` cache alone can no longer override the current bundle after the popup loads. Intentional overrides remain authoritative and are flagged when they differ from the current catalog; they are not reset automatically.

`catalogDiagnostics` is saved alongside the effective catalog. Roadmap notes show relevant structural/cross-program/override warnings for reachable courses; imports and synchronization expose review warnings too. An explicit prerequisite override is not silently replaced by a different program variant.

The actual installed browser storage was not accessed. Production-function tests used saved-state fixtures covering stale remote data, local edits, deletion lists and a stale derived cache. A user with old overrides must review the flagged course or the existing reset/update preview to adopt current official values. Publishing updated repository data does not silently erase personal edits.

## Tests and future updates

- [Production integration tests](</D:/New Works/uiu-course-code-decoder-extension/tests/prerequisite_integrity_checks.js:1>) run inside the existing prerequisite suite, keeping 24 master suites.
- Checks cover CSE 4813 → CSE 4889 and DS 4211 → DS 4889; full chains and reverse unlock separation; equal titles/numbers with different prefixes; missing references; self/cycles/duplicate edges; variant cycles; legitimate EEE/MATH/PHY edges; full-code deletions; stale override warnings; imports/exports; preview/apply sync; stale review rejection; and stale cache rebuilding.
- Both popup/web production helpers are exercised. [Browser fixture](</D:/New Works/uiu-course-code-decoder-extension/tests/fixtures/prerequisite_web.html:1>) runs 13 checks against the actual public explorer, including all 315 cards and curriculum-preserving navigation.
- `node scripts/sync_catalog.js --check` verifies byte-identical JSON and shared-module copies. `node scripts/validate_catalog.js` rejects structural errors in base and variant graphs and prints cross-program review warnings. CI runs both and `node tests/run_all.js`.
- Cross-program warnings do not delete edges or fail validation merely for using another subject prefix. Academic corrections still require source and curriculum review. New official snapshots are structurally validated before applying; partial local imports are checked against the prospective effective catalog.

Validation completed: all 24 suites passed; catalog/shared-module copies match; all 13 public-explorer browser checks passed. Actual installed-extension storage and live UCAM rendering were not checked.


## Deferred follow-up

Complete program/curriculum selection is not implemented. The four verified shared-course variants and preserved navigation context are an interim fix. The decision is to retain them and defer full academic coverage, explicit selection and override-scope migration to the next minor feature version. The next-work entry point is [CURRICULUM_PREREQUISITES_HANDOFF.md](</D:/New Works/uiu-course-code-decoder-extension/CURRICULUM_PREREQUISITES_HANDOFF.md>).
