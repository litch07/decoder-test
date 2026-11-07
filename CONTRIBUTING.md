# Contributing

This guide applies to repository source with manifest **2.0.0**, reviewed **6 November 2026**. Academic changes need an applicable official source; schema validity alone does not prove a requirement is correct.

## Report or suggest a course

From course details, use **Report a course error** for a catalog record, **Suggest this course** for a custom course, or **Suggest this update** for an edited course. Edited-course drafts compare catalog details with saved changes. **Improve catalog** also provides a missing-course request.

These actions open prefilled GitHub drafts. Opening sends the included data in the URL to GitHub; review sensitive custom notes first. A GitHub account is needed to submit. Saving locally does not submit anything or update the shared catalog.

Include the complete course code, applicable program/curriculum, source URL/document and relevant term for exam corrections. Avoid student IDs and personal information in screenshots. Do not interpret a different prefix as an invalid prerequisite: BSDS students can legitimately take CSE-coded courses.

## Edit the catalog

Edit root `courses.json`, then synchronize the public copy with `node scripts/sync_catalog.js`. Do not edit `docs/courses.json` separately. The same command copies `course-data.js` to `docs/course-data.js`.

Current record example copied from the bundled catalog:

```json
{
  "CSE 3421": {
    "name": "Software Engineering",
    "examDay": "Day 5",
    "examSlot": "T3",
    "prerequisites": [
      "CSE 3411"
    ],
    "credits": 3
  }
}
```

| Field | Accepted meaning |
|---|---|
| Dictionary key | Full course code: letters, number and optional letter suffix; canonical example `CSE 4000A` |
| `name` | Required nonempty title |
| `credits` | Finite positive number or null/omitted when unknown; not a numeric string |
| `examDay` | Empty/unknown, a positive numbered day (including accepted `Day`/`D` aliases), or `In-class` |
| `examSlot` | Empty/unknown or T1/T2/T3; no slot with `In-class` |
| `prerequisites` | Array of complete course codes; `["None"]` explicitly means none; `[]` means not listed/unknown |
| `prerequisiteNote` | Free-text requirement notes, such as a minimum completed-credit condition |
| `prerequisiteVariants` | Optional map of curriculum IDs to `{ "prerequisites": [...], "source": "..." }` |

Title-only string records are accepted for compatibility. Use structured records when metadata is known. UI standard exam-day options are 1-7, but the shared validator accepts any positive numbered day. This does not make a day/slot a calendar date or a verified current exam schedule.

Normalization standardizes case and spacing while preserving prefix, numeric part and suffix. Duplicate JSON keys and codes colliding after normalization are rejected. Never infer equivalence from titles or numeric portions. Keep alphabetical order as a maintenance convention; it is not an enforced CI condition.

## Prerequisite evidence and validation

- Check the applicable official UIU program/curriculum version. Record source-backed variants where requirements differ; do not replace one program's rules with another's universal defaults.
- Keep credit thresholds in `prerequisiteNote`, not in the course-code array.
- Missing references, self-dependencies, duplicate edges and cycles must be resolved. Variant graphs are also validated.
- CSE/DS cross-prefix relationships and differing saved overrides are review warnings. Review and document them rather than deleting them automatically. Preserve legitimate EEE/MATH/PHY and other cross-subject requirements.
- Current coverage includes four BSDS-233 variants; explicit program selection and complete historical coverage are deferred. Read [the audit](PREREQUISITE_AUDIT.md) and [handoff](CURRICULUM_PREREQUISITES_HANDOFF.md) before changing this model.

Bundled updates do not silently replace intentional `remoteCourses` or `userCourses` overrides. Test the effective merged catalog, not only the root JSON. A title-only import preserves existing metadata; full-object JSON import normalizes missing optional fields to empty/null. Storage-layer partial overrides use field merging, so these paths are not interchangeable.

## Development checks

No extension build step or package installation is required. Use Node.js; CI uses Node 20. From the repository root:

```sh
node scripts/sync_catalog.js
node scripts/validate_catalog.js
node scripts/sync_catalog.js --check
node tests/run_all.js
```

The master runner has 25 suites, including prerequisite integration and popup regression checks. Browser fixtures in `tests/fixtures/` cover additional cases such as viewport placement and the nested UCAM Sheet hover card.

For UI/content changes, inspect relevant fixtures and actual supported page layouts in Light/Dark themes, at the 360px popup width where applicable. Keep runtime DOM construction free of `.innerHTML`/`.insertAdjacentHTML`, preserve keyboard/focus behavior and avoid adding external runtime dependencies.

A pull request should describe the changed behavior, source evidence for academic edits, checks run, and known limits. Do not certify a packaged ZIP, hosted deployment or store release without checking that artifact.

## Public explorer and deployment

The independent static app is in `docs/`. Serve the repository over HTTP and open `/docs/`; for example, if Python is installed, `python -m http.server 8000`. Opening files directly can fail JSON fetches. The app uses synchronized catalog/module copies and loads Google Fonts; it does not read extension storage.

The catalog workflow checks copy equality, validates the catalog and runs the master tests. The Pages workflow prepares synchronized copies, validates and uploads `docs/`. Repository Settings > Pages must enable Pages and select **GitHub Actions** as the build source; a workflow cannot assume a Pages site already exists. Deployment success is separate from local tests.
