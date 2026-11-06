# Developer entry point

Source snapshot: manifest **2.0.0**, reviewed **6 November 2026**.

Read [EXTENSION_CURRENT_STATE.md](EXTENSION_CURRENT_STATE.md) for architecture, storage and data flow; [FEATURES.md](FEATURES.md) for implemented behavior; [CONTRIBUTING.md](CONTRIBUTING.md) for data validation and checks.

The project is a Manifest V3 extension written in vanilla JavaScript, HTML and CSS, with a separate public explorer under `docs/`. No extension build step, CDN or package install is required. The master Node runner contains 24 suites.

For branding and release-repository migration, read [REBRAND_RELEASE_GUIDE.md](REBRAND_RELEASE_GUIDE.md). `decoder-test` remains staging; production links stay at their existing addresses until the main repository is renamed.

## Working boundaries

- Preserve full normalized course codes as identity, including prefix and suffix. Titles and numeric portions do not identify graph nodes.
- Merge bundled + remote + user courses, then apply soft/hard exclusions. `courses` is a derived cache, not the authoritative source layer.
- Keep runtime DOM manipulation free of `.innerHTML` and `.insertAdjacentHTML`.
- Keep the popup within its 360px width and validate Light/Dark behavior for UI changes.
- Preserve user edits, planner selections, reversible Trash and permanent-exclusion semantics.
- Synchronize root `courses.json` and `course-data.js` to their `docs/` copies using `scripts/sync_catalog.js`.
- Run `node scripts/validate_catalog.js`, `node scripts/sync_catalog.js --check` and `node tests/run_all.js` after relevant changes.

## Limits that must not be advertised as features

Exam data has numbered days/slots, with no recorded term/source or calendar dates. No `.ics` export, UCAM registration, automatic schedule feed or transcript eligibility integration exists. The personal planner exports Markdown; course exports are JSON.

Website decoding is best-effort DOM processing, not universal canvas/document/chart support. The public explorer does not access extension storage and loads Google Fonts.

Program/curriculum selection is inferred from roadmap roots, not explicitly chosen by the student. Only four shared CSE courses have source-backed BSDS-233 variants. Read [PREREQUISITE_AUDIT.md](PREREQUISITE_AUDIT.md) and [CURRICULUM_PREREQUISITES_HANDOFF.md](CURRICULUM_PREREQUISITES_HANDOFF.md) before prerequisite work. The deferred plan is not implemented functionality.

A manifest version or existing distribution archive does not establish store/ZIP/hosted-site parity with the current working tree.
