# UIU Course Code Decoder

Decode courses. Map prerequisites. Avoid exam clashes.

A browser extension for United International University students. Decode codes on enabled websites, follow prerequisite roadmaps, and check your personal exam plan for clashes.

This README describes the **2.0.0 source**. Check each browser store for the version it currently offers.

Production repository: [litch07/uiu-course-companion](https://github.com/litch07/uiu-course-companion). `litch07/decoder-test` remains the staging repository; production deployment is separate from local source changes.

## What is included

- **Website decoding:** Highlight, Tooltip and Inline modes; optional exam and prerequisite details; dynamic-page scanning and selected SVG/Highcharts support.
- **Course catalog:** search by code or name, result counts, filters, course details and local additions/edits.
- **Prerequisite roadmaps:** direct requirements, prerequisite chains, bottom-up stages and courses unlocked next. The graph keeps full course-code identities separate.
- **My courses & exams:** local selections, known-credit totals, same-slot conflicts and other exams on the same day, with course names and day/slot information.
- **Data management:** reviewed JSON imports, contextual JSON exports, Trash and restore, permanent exclusions, reviewed catalog updates and reviewed reset of catalog changes.
- **Interface:** first-use welcome, System/Light/Dark appearance, settings for enabled websites, search feedback, action notifications and confirmations for destructive actions.
- **Contributions:** GitHub drafts for missing courses, incorrect catalog details and suggested additions/updates. Edited-course drafts compare catalog details with local changes.

The bundled catalog contains **315 courses**. Credits are recorded for 94; the remaining 221 have unknown credits. Catalog presence does not establish academic verification for every admission batch.

## Display modes

| Mode | On the page | More information |
|---|---|---|
| Highlight | A background highlight around the original course code | Hover or keyboard focus opens a course card |
| Tooltip | A dotted underline; original text color and weight are preserved | Hover or keyboard focus opens a course card |
| Inline | Decoded name and enabled detail rows beside the original code | Hover/focus provides additional details, including credits |

For example, `CSE 3421` decodes to **Software Engineering**. Slash-separated codes with the same catalog name can share one inserted name while retaining their separate identities and details. Existing names are not repeated in supported contexts.

Normal HTML tables use compact inline formatting. Constrained grid cells may truncate inserted names, keeping full information available on hover/focus. These layout improvements deliberately exclude spreadsheet contexts. Canvas-only documents, inaccessible frames and arbitrary chart implementations are not universally supported. SVG chart labels do not expand inline; Inline uses a highlight treatment there.

On UCAM's exam routine, a hover card that needs more room can use the space above or below the embedded Sheet on the UCAM page.

## Install

- [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/uiu-course-code-decoder/dnahpleadipkgknggmeeljcnmhcodpgk?hl=en-US)
- [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/uiu-course-code-decoder/)

To try this source in Chrome or Edge, download or clone the repository. Open `chrome://extensions/` or `edge://extensions/`, enable **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`. The extension runs directly from that folder.

## Use the extension

1. Pin the extension, open a supported website and check its decoding switch. UCAM, eLMS and Google Docs are in the default allowlist. Browser access is also required.
2. Choose a display mode. Use **Course catalog** to look up courses or **My courses & exams** to build a personal plan.
3. Open **Settings** to review catalog updates, manage enabled websites or change appearance.

Additional websites use optional host permissions. Decoding is available on supported webpage content. Check the store version when using Firefox and test the 2.0.0 package for that browser before release.

## Academic and planner limits

Exam data consists of numbered days and slots, not calendar dates, academic terms or recorded sources. Current slot labels are T1 09:00–11:00, T2 11:30–13:30 and T3 14:00–15:00. **Recheck the latest exam dates and times in UCAM before finalizing a plan.** Local selections do not change UCAM registration.

The planner exports **Markdown**; course exports use **JSON**. Calendar `.ics` export is not implemented. JSON course exports are not complete backups of settings, planner selections or Trash.

Prerequisites can vary between programs and curriculum versions. Four shared CSE courses have verified BSDS-233 variants. DS-rooted roadmaps use that context; other roots default to BSCSE-current, with context retained while navigating the roadmap. There is **no explicit student program/curriculum selector**, and coverage is incomplete. Check requirements against your applicable official curriculum. See the [audit](PREREQUISITE_AUDIT.md) and [deferred curriculum work](CURRICULUM_PREREQUISITES_HANDOFF.md).

## Updates and privacy

Decoding uses locally stored data. Settings offers a **manual** catalog update from the configured GitHub source, with a review before applying changes. This is not an automatic feed from UIU or UCAM.

Custom edits and deletions are stored in `chrome.storage.local`. No telemetry or analytics is implemented in the extension. Network activity still occurs for requested catalog updates and external links; opening a GitHub contribution draft sends its prefilled course data in the URL. See [Privacy](PRIVACY.md) and [Security](SECURITY.md) for permissions, storage and network details.

## Web course explorer

The independent application in [docs/](docs/) provides catalog search, subject filters, sorting, course details, prerequisite graphs and share links. It uses its own catalog files and browser preferences; it does not access the extension's custom courses or exam selections. It loads Google Fonts and is not an offline-cached copy of the extension.

Serve the repository over HTTP and open `/docs/` for local development. GitHub Pages deployment requires Pages to be enabled with **GitHub Actions** as its source. See [Contributing](CONTRIBUTING.md).

## Development and documentation

Run from the repository root with Node.js (CI uses Node 20):

```sh
node scripts/sync_catalog.js
node scripts/validate_catalog.js
node scripts/sync_catalog.js --check
node tests/run_all.js
```

The master runner has **25 suites**. Catalog validation reports structural errors and flags cross-program relationships for review.

- [Feature reference](FEATURES.md)
- [Architecture and storage](EXTENSION_CURRENT_STATE.md)
- [Contribution and data workflow](CONTRIBUTING.md)
- [Implemented scope and future work](ROADMAP.md)
- [Release guide](RELEASE_GUIDE.md)
- [Screenshot maintenance](SCREENSHOTS_GUIDE.md)
- [Developer entry point](context.md)

Created and maintained by [Sadid Ahmed](https://github.com/litch07) for the UIU community. Licensed under [MIT](LICENSE).
