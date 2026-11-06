# Deferred issue: explicit program and curriculum prerequisites

Status: documented and deferred; implementation is not authorized by this handoff alone.
Recorded: 6 November 2026.
Target: next minor feature version, not another isolated data patch. Exact version/date is not assigned.
Priority: academic data correctness. Existing decoding and planner features remain available.

## Decision and current boundary

Keep the current implementation and the completed integrity fixes. Do not revert them, reset user data, remove verified cross-program edges, or start additional runtime changes as part of this documentation task.

Defer complete program/curriculum selection because it requires verified datasets, a deliberate selection flow, and compatible handling of overrides, imports, synchronization, navigation and the public explorer. Correcting a handful of edges cannot establish a complete curriculum model. Code prefixes are not a reliable proxy for a student's program: BSDS students also take CSE-coded courses.

This is an interim state, not a claim that every prerequisite roadmap is correct for every student or admission batch. Retain the current curriculum notes and review warnings. Prerequisite information remains a reference to check against the student's applicable official curriculum and UCAM.

## Read first

- [Investigation and academic evidence](</D:/New Works/uiu-course-code-decoder-extension/PREREQUISITE_AUDIT.md>)
- [Current architecture](</D:/New Works/uiu-course-code-decoder-extension/EXTENSION_CURRENT_STATE.md>)
- [Shared data and graph module](</D:/New Works/uiu-course-code-decoder-extension/course-data.js>)
- [Production regression coverage](</D:/New Works/uiu-course-code-decoder-extension/tests/prerequisite_integrity_checks.js>)
- [Public explorer browser fixture](</D:/New Works/uiu-course-code-decoder-extension/tests/fixtures/prerequisite_web.html>)

## What is already implemented

- Course identity uses the complete normalized code, preserving prefix, number and suffix. Matching names or numbers do not merge graph nodes.
- Popup and public explorer use the shared forward/reverse graph and cycle-safe traversal.
- CSE 2215–2218 use verified current BSCSE defaults and retain verified BSDS-233 arrays in source-backed `prerequisiteVariants`.
- DS-rooted roadmaps select BSDS-233; other roots default to BSCSE-current. Navigation into shared courses retains the originating context.
- Structural validation covers missing references, self-dependencies, duplicate edges and cycles. Cross-program relationships are review signals, not forbidden edges.
- Derived catalog caches are rebuilt. Intentional remote/local overrides remain authoritative and are flagged when they differ from the catalog.
- JSON and shared-module copies are synchronized for the public explorer.

Baseline verification from the completed investigation: 315 courses; 24/24 automated suites; 13 public-explorer browser checks; catalog/module copy checks passed. These checks verify implemented behavior, not the completeness of every academic curriculum. Installed browser storage and live UCAM were not inspected.

## Remaining issues

| ID | Issue | Concrete failure case | Required outcome |
|---|---|---|---|
| CUR-01 | Program selection is inferred from a root code | A BSDS student opens CSE 2215 directly from the catalog. The root has a CSE prefix, so the default is BSCSE even though the student needs BSDS rules. | Use an explicit saved program/curriculum choice. A prefix must not choose the student's program. |
| CUR-02 | Curriculum coverage is incomplete | Four shared courses have verified variants; other shared courses or older curriculum versions may differ too. | Audit the complete prerequisite data for each supported curriculum before calling that curriculum supported. |
| CUR-03 | Missing variants fall back to base requirements | Selecting a curriculum in the graph API does not establish that an unversioned base record is verified for that curriculum. | Distinguish verified common requirements from unverified coverage. Show an unknown state rather than silently substituting another curriculum. |
| CUR-04 | Labels are not immutable academic versions | `BSCSE-current` can describe a changing plan, while an admission batch is not automatically a curriculum identifier. | Define stable, evidence-backed version IDs and verified applicability. Use batch mapping only when officially established. |
| CUR-05 | Overrides do not have explicit curriculum scope | A custom prerequisite edit to a shared course can affect multiple program views. An old remote snapshot can override a corrected bundle. | Define scope and migration for overrides. Preserve existing edits and require review before assigning or resetting their academic scope. |
| CUR-06 | Context is incomplete across entry points | Existing roadmap navigation retains context, but fresh catalog entries, deep links, web decoding and standalone course details do not have an explicit student-selected curriculum. | Apply one resolved context consistently across direct prerequisites, chains, stages, unlocks and every supported entry point. |
| CUR-07 | Two saved DS edges still need evidence review | DS 4229 → CSE 3521 and DS 4817 → CSE 3521 remain saved. The current DS course-plan page lists N/A. | Verify the applicable source/version. Keep them flagged until resolved; N/A is not sufficient proof that an older relationship is invalid. |

## Recommended implementation scope for the next version

1. Inventory official curricula first. Record program, stable version ID, applicability, source URL/document and verification date. Review every shared course in each supported context. Resolve conflicting sources by applicability, not by title similarity or an assumed newest date.
2. Keep full course-code identity and shared descriptive metadata. Store prerequisite rules with their program/curriculum scope. Reuse the existing variant mechanism if it can represent the verified data without a larger rewrite.
3. Introduce an explicit program and curriculum choice in the popup and public explorer. Save it locally using compatible IDs; Chrome storage and website localStorage remain separate. Do not choose a student's program from a course prefix. Do not claim a batch-to-curriculum mapping without evidence.
4. Resolve that choice once and pass the same context through details, direct prerequisites, full chains, bottom-up stages and reverse unlocks. Preserve it through back navigation and supported deep links.
5. Make coverage explicit. Unknown requirements are not the same as verified no prerequisites. An unsupported curriculum must not silently borrow the base or another program's edges. Another curriculum may be offered as a clearly labelled reference if useful.
6. Extend import/export, sync previews and validation to preserve source/version metadata and selection. Detect version conflicts before applying data. Avoid adding source-specific requirements as universal defaults.
7. Design a reversible, reviewable migration for existing unscoped user/remote records. Preserve course edits and selection data. Explain legacy scope rather than silently guessing the intended program or deleting overrides.
8. Retain academic cross-subject relationships. A DS student may legitimately require CSE, EEE, MATH, PHY or other courses. Select the applicable requirements; do not filter graph edges by prefix.

The selector placement, schema version IDs and legacy-override migration need a concrete design review before implementation. This file is a work plan, not a decision to add mandatory onboarding, remove current features or introduce a new data service.

## Acceptance tests

- The same CSE 2215 identity resolves to CSE 1111 in the verified BSCSE context and DS 1115/DS 1116 in verified BSDS-233.
- A BSDS student opening CSE 2215 directly gets the selected BSDS context, without relying on a preceding DS-rooted roadmap.
- CSE 4813 → CSE 4889 and DS 4211 → DS 4889 remain distinct, including full chains and reverse unlocks.
- Each graph's forward edges, direct prerequisites, stages and reverse edges agree under the selected curriculum.
- Verified CSE/EEE/MATH/PHY and other cross-subject prerequisites remain accessible in BSDS views.
- Same titles or numeric portions never establish course identity or prerequisite equivalence.
- Missing curriculum coverage is shown as unverified. Verified foundational courses remain distinguishable from unknown requirements.
- Context survives popup back navigation, new catalog entry points, web explorer badges, supported deep links and reloads.
- Selecting a different curriculum does not alter exam plans, enrollment selections, custom courses or deletion lists.
- Legacy overrides survive migration; the user can review scope and changes before applying them.
- Imports and synchronized catalogs preserve version/source metadata and block new structural errors. Cross-program warnings never automatically delete verified relationships.
- Supported historical curricula are tested with internally consistent fixtures. Do not combine a prerequisite from one version with the remaining edges of another version.
- Keep all 24 existing suites passing and extend the production integration tests and browser fixture. Add visual checks for the selector and unknown/review states within the 360px popup in both themes.

## Start-of-work checklist

- Read the audit, this handoff and current code; inspect working-tree changes before editing.
- Recheck source applicability and data coverage. Do not assume the currently recorded four variants exhaust the differences.
- Propose the selector, stable context IDs and migration behavior in plain language before changing the schema or UI.
- Confirm the supported program/version inventory; record unresolved courses separately.
- Implement incrementally using the current shared module and safe DOM APIs. No external build tools, CDNs, telemetry or runtime HTML injection.
- Run `node scripts/sync_catalog.js`, `node scripts/validate_catalog.js`, `node scripts/sync_catalog.js --check`, and `node tests/run_all.js` after relevant changes.

Suggested restart prompt:

> Read CURRICULUM_PREREQUISITES_HANDOFF.md, PREREQUISITE_AUDIT.md and EXTENSION_CURRENT_STATE.md. Resume the explicit curriculum-selection work. First verify the supported academic datasets and propose the smallest compatible selector/schema/migration design. Preserve full-code identities, legitimate cross-subject prerequisites, user overrides and existing decoder/planner behavior. Do not infer program from course prefixes or fill unknown requirements with guesses.
