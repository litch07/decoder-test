# Implemented scope and deferred work

This is a source-status record for manifest **2.0.0**, reviewed **6 November 2026**. It is not a history of published releases or a promise of delivery dates.

## Implemented

- Three website decoding modes, dynamic DOM scanning, compact HTML table layouts, supported alias grouping and chart attendance cards.
- Catalog search, course details, local additions/edits, reviewed JSON import/export, Trash and permanent exclusions.
- Personal exam planning with conflict and same-day workload messages, credit totals and Markdown export.
- Shared prerequisite graph, integrity validation, review warnings and four verified BSDS-233 variants for shared CSE courses.
- System/Light/Dark appearance, welcome, enabled-site settings, reviewed catalog update/reset and GitHub contribution drafts.
- Independent web explorer and GitHub Pages workflow; synchronized catalog/module copies and 24 master test suites.

See [FEATURES.md](FEATURES.md) for behavior and limits. Availability of a store release or hosted revision is not established by this list.

## Deferred: explicit program/curriculum support

The next curriculum feature needs verified datasets and an explicit selection model. Root-code inference is an interim behavior and can choose the wrong requirements for a BSDS student opening a shared CSE course directly.

[CURRICULUM_PREREQUISITES_HANDOFF.md](CURRICULUM_PREREQUISITES_HANDOFF.md) records the unresolved issues, evidence requirements, migration plan and acceptance tests. No target version number or delivery date is assigned. Outstanding work includes:

1. Explicit program/curriculum choice across entry points.
2. Complete, source-backed coverage with stable curriculum identifiers.
3. Unknown/unverified coverage states instead of implicit fallback.
4. Scoped local/remote overrides and reviewable legacy migration.
5. Consistent context in details, chains, unlocks and public links.
6. Evidence review for DS 4229 → CSE 3521 and DS 4817 → CSE 3521.

Do not remove cross-subject requirements by prefix or infer equivalence from titles/numbers. Current fixes and intentional user edits should be preserved.

## Not implemented

Calendar `.ics` export, automatic live UCAM schedule synchronization, university course registration, transcript/completed-course eligibility checks, complete curriculum-version support, cloud account synchronization and an offline-cached web explorer are not current features. No delivery commitment is assigned here.
