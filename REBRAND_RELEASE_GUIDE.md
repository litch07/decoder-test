# UIU Course Companion: repository rename and release guide

Prepared 6 November 2026 for the current 2.0.0 source. These are migration instructions, not a record of a completed repository rename or store deployment.

## Current state and agreed branding

- `litch07/decoder-test` is staging. This checkout's `origin` still points there.
- `litch07/uiu-course-decoder` is the release repository currently used by catalog updates and contribution links.
- Proposed release repository name: **`uiu-course-companion`**. Confirm GitHub accepts the name when renaming; availability has not been verified here.
- Visible branding has been updated locally. Release URLs intentionally remain at the current repository until the rename is complete.

| Placement | Value |
|---|---|
| Extension/store name | UIU Course Companion |
| Compact popup subtitle | Decode. Map. Plan. |
| Welcome, website and documentation tagline | Decode courses. Map prerequisites. Avoid exam clashes. |
| Store short description / manifest description | Decode UIU course codes on any webpage, explore prerequisite trees, and build clash-free exam routines. |
| GitHub repository name | `uiu-course-companion` |
| GitHub About description | A browser extension for UIU course decoding, prerequisite roadmaps, and personal exam planning. |
| Suggested GitHub topics | `uiu`, `browser-extension`, `course-catalog`, `prerequisites`, `exam-planner`, `javascript` |
| GitHub About website, after a successful default Pages deployment | `https://litch07.github.io/uiu-course-companion/` |
| New archive naming convention | `uiu-course-companion-v<VERSION>.zip` (substitute the actual manifest version) |

Use accurate detail in the longer store description: decoding applies to enabled, accessible page content; restricted pages/canvas documents are not universal targets. Exam planning uses saved day/slot data, so students must recheck UCAM dates/times. The approved short description does not replace these limitations.

## 1. Rename the existing release repository on GitHub

1. Open the **release repository**, currently `https://github.com/litch07/uiu-course-decoder`. Check the owner/name before changing settings. Leave `decoder-test` unchanged.
2. Open **Settings > General**. In **Repository name**, enter `uiu-course-companion`, then choose **Rename**.
3. Check the existing issues, releases and branches in the renamed repository. Rename the existing repository rather than creating an empty replacement.
4. In the repository's **About** panel, use the description/topics above. Set the website field only after Pages has deployed successfully, using its reported URL if different.

GitHub redirects ordinary repository/Git traffic, but its project-site URLs are an exception. Do not assume an old Pages URL redirects. Do not reuse the old repository name for a different repository, because that replaces its redirect. See [GitHub's rename documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).

## 2. Update release links in the staging source after the rename

Replace the repository path `litch07/uiu-course-decoder` with `litch07/uiu-course-companion` in these files, preserving any trailing path, query and encoding:

| File | References to change |
|---|---|
| `background.js` | Raw catalog fetch URL |
| `popup.html` | Contribution guide, footer repository and About source links |
| `popup.js` | Export attribution and GitHub issue draft URL |
| `docs/index.html` | Navigation, report fallback, releases and footer documentation links |
| `docs/app.js` | GitHub correction draft URL |
| `PRIVACY.md` | Documented manual catalog endpoint |
| `tests/product_quality_checks.js` | Expected release repository link |
| `tests/test_schedule_prereq_github_prompt.js` | Expected GitHub draft URL |

The new targets will be:

```text
Repository: https://github.com/litch07/uiu-course-companion
Catalog: https://raw.githubusercontent.com/litch07/uiu-course-companion/main/courses.json
Issue draft base: https://github.com/litch07/uiu-course-companion/issues/new
Releases: https://github.com/litch07/uiu-course-companion/releases
Default Pages project URL: https://litch07.github.io/uiu-course-companion/
Privacy source: https://github.com/litch07/uiu-course-companion/blob/main/PRIVACY.md
```

`/releases/latest` works only when a qualifying release exists. Verify any existing latest-release link before announcing it. Test that the raw endpoint returns the expected catalog JSON. Test the old raw endpoint too: already-installed versions still request it until updated. Do not rely on redirects without testing the extension's actual request.

Search the source again for `litch07/uiu-course-decoder` and `github.io`. Update active links, including any additional ones introduced later. Historical migration notes such as this guide can retain the old name with clear context.

## 3. Keep staging and production remotes separate

In this existing staging checkout, keep `origin` pointing to `decoder-test`. Do not repoint it just to match product branding.

For a **separate existing production clone only**, update its remote after the rename:

```sh
git remote -v
git remote set-url origin https://github.com/litch07/uiu-course-companion.git
git remote -v
```

Alternatively, create a separate production checkout:

```sh
git clone https://github.com/litch07/uiu-course-companion.git
```

Transfer the finalized, reviewed changes from staging into a production branch/PR. If using commits, select them after checking both histories; do not force-push one repository's history over the other. If copying files, include the required runtime files, `course-data.js`, catalog, icons, public `docs/`, scripts, tests and relevant documentation/workflows. Review the diff for production-specific settings. Never copy the staging `.git` directory, browser profiles, credentials or an old ZIP as the release source.

## 4. Configure and verify Pages

In the renamed release repository, open **Settings > Pages** and select **GitHub Actions** as the source. This matches `.github/workflows/deploy-pages.yml`, which uploads `docs/`. Its repository checks already use `context.repo`; the workflow has no fixed old release-repository name to replace.

After publishing the finalized source to production, check the Pages job and its actual deployment URL. Test catalog loading, course deep links, correction drafts, navigation and both themes. Update About, store website/privacy fields and announcement links to the confirmed addresses. Existing saved share links using the old project path may stop working; republish important links or use a separately managed redirect if needed.

See [GitHub Pages publishing configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 5. Preserve installed-extension identity

Keep these compatibility identifiers even though they retain the old technical naming:

- `browser_specific_settings.gecko.id`: currently `uiu-course-decoder@ssadidahmed01`. Compare it with the published Firefox add-on ID before packaging. It identifies the add-on for updates and storage; it is not a display name.
- Existing Edge and Mozilla listing identities. Update the current listings instead of creating replacement products.
- `chrome.storage.local` keys, content-script registration identifiers, `__UIU_COURSE_DECODER_INJECTED__`, `cce-*` classes and website preference keys. They are internal identifiers, not stale visible branding.

Do not clear user storage to rebrand. Test an upgrade with saved custom courses, edits, Trash, hard exclusions, preferences and planner selections. See [Mozilla's add-on ID documentation](https://extensionworkshop.com/documentation/develop/extensions-and-the-add-on-id/).

## 6. Prepare the actual store release

The source manifest currently says 2.0.0. Check the versions already published in **both stores** before selecting the next version; the submitted update must be newer. If that changes the source version, update the popup fallback, current-snapshot documentation and archive name consistently. No version bump or store version comparison was performed by this guide.

For Edge Partner Center and Mozilla AMO, use the existing product and update the display name, short description, longer feature description, screenshots and website/support/privacy links as appropriate to each dashboard. Preserve listing IDs. Do not change the author attribution. Verify existing public listing links; this checkout's website currently has a Chrome listing link, and the actual Edge/Mozilla URLs have not been supplied or verified. Do not invent their slugs or IDs.

The project has legacy screenshots and an ignored `dist/` archive under the previous product name. Capture current UI before publishing new screenshots. Build any new package from the finalized source revision with `manifest.json` at the archive root; renaming the old ZIP does not update its contents. Check the browser-specific manifest/package that was previously accepted and test compatibility; a Chrome-oriented source package alone does not certify Firefox support.

See [Microsoft's existing-extension update instructions](https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/update-extension).

## 7. Final verification and announcement

Run in staging and again against the transferred production revision:

```sh
node scripts/sync_catalog.js
node scripts/validate_catalog.js
node scripts/sync_catalog.js --check
node tests/run_all.js
```

Keep all 24 suites passing. Review existing academic warnings rather than deleting legitimate requirements to suppress them. Inspect the packaged files, confirm upgrade data preservation, verify catalog-update preview, and open GitHub drafts without submitting test issues. Confirm store approval and deployed site/links before posting the announcement.

Suggested release title: **UIU Course Companion v<VERSION>**.

Suggested opening: **UIU Course Companion is the new name for UIU Course Code Decoder, with course decoding, prerequisite roadmaps and a personal exam planner.** Describe only features present in that release and include the UCAM recheck reminder. Do not announce store availability before approval.

## Not completed by this guide

GitHub rename, remote changes, production transfer, hosted deployment, published-store identity/version checks, screenshot refresh and package publication are manual follow-up steps. This document is not evidence that those actions succeeded.
