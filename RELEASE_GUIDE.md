# UIU Course Code Decoder release guide

The 2.0.0 source is prepared as an update to **UIU Course Code Decoder**. The product name and existing store listings are the release identity.

**Decode courses. Map prerequisites. Avoid exam clashes.**

## Repositories

- [litch07/decoder-test](https://github.com/litch07/decoder-test) is the staging checkout.
- [litch07/uiu-course-companion](https://github.com/litch07/uiu-course-companion) is the current production repository. Its GitHub name is independent of the extension name. Transfer the reviewed source to a production branch or pull request.

If the production repository name changes, verify the new repository, raw catalog endpoint, contribution draft links, release URLs and deployed Pages URL before packaging. Check the catalog URL used by older releases as well. GitHub Pages project URLs require separate verification after a rename. [GitHub repository rename documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)

Production links are maintained in `background.js` (catalog endpoint), `popup.html` and `popup.js` (repository, export attribution and contributions), `docs/index.html` and `docs/app.js` (site links and issue drafts), and the corresponding documentation and tests.

## Package and submit

1. Compare the source version with the versions already offered in the stores.
2. Package the finalized source for each browser, with `manifest.json` at the archive root. Use the format accepted by the existing listing and test each package in its target browser.
3. Test an upgrade over the current release with saved custom courses, Trash entries, preferences and planner selections.
4. Submit the update under the existing listings. The Firefox manifest ID is `uiu-course-decoder@ssadidahmed01`. Use the existing Edge listing and preserve extension storage keys.
5. Use screenshots from the packaged version and link to the confirmed production site and privacy documentation. Confirm store approval before announcing availability.

Existing listings: [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/uiu-course-code-decoder/dnahpleadipkgknggmeeljcnmhcodpgk?hl=en-US) and [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/uiu-course-code-decoder/).

Suggested archive name: `uiu-course-code-decoder-v<VERSION>.zip`. Suggested release title: **UIU Course Code Decoder v<VERSION>**.

## Validate the production revision

```sh
node scripts/sync_catalog.js
node scripts/validate_catalog.js
node scripts/sync_catalog.js --check
node tests/run_all.js
```

Run the 25 suites and review catalog warnings. Test decoding, the UCAM routine hover card, prerequisite navigation, the exam planner, JSON import/export and catalog update previews in the package. Verify contribution draft links on GitHub.

For the public explorer, configure **Settings > Pages > GitHub Actions**. The workflow deploys `docs/`. Check the deployed catalog, course share links and store links before updating the repository's website field.

The exam planner uses saved day and slot data. Ask students to recheck the latest UCAM dates and times when sharing release notes.
