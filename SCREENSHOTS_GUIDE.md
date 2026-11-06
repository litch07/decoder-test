# Documentation images and screenshot maintenance

Reviewed **6 November 2026** for source manifest **2.0.0**. All files below exist in `assets/`. File presence does not establish that an image shows the current interface. Existing images include legacy screenshots/placeholder artwork; none is certified here as a current-version capture.

## Asset inventory

| File | Intended subject |
|---|---|
| `demo.png` | Website decoding overview |
| `demo-tooltip.png` | Website hover card |
| `mode-inline.png` | Inline decoding |
| `pop-up-1.png` | Popup home |
| `pop-up-2.png` | Popup display controls |
| `course-manager-pop-up.png` | Course catalog |
| `course-manager-pop-up-success.png` | Add/import feedback |
| `course-details-view.png` | Course details |
| `trash-view.png` | Trash and recovery |
| `sync-diff-modal.png` | Catalog update review |
| `architecture-diagram.png` | Data/privacy architecture illustration |
| `report-issue-guide.png` | Contribution action |
| `github-edit-guide.png` | Repository editing workflow |

The current Markdown guides avoid using these images as evidence for current controls. Before embedding one, compare it with the source revision being documented. Replace outdated imagery with actual captures or clearly label an illustration; do not present placeholder cards as product screenshots.

## Capture checklist

1. Load the exact source revision being documented and record its manifest version/revision.
2. Capture the popup at its actual 360px width and 500px height. Check Light and Dark appearance; avoid clipping modal buttons or hiding relevant scrollable content.
3. Cover the three different website treatments: Highlight background, Tooltip dotted underline, and Inline inserted name/details. Use a known catalog example, such as `CSE 3421` (Software Engineering).
4. Capture representative HTML table and attendance-chart behavior, including a long prerequisite list. Do not imply universal canvas/Google Sheets support from a single fixture.
5. For planner examples, show both a same-slot conflict and other exams on the same day. Keep the UCAM recheck reminder visible where relevant; do not invent calendar dates or claim UCAM registration.
6. Show actual current contribution labels and reviewed import/update/reset actions. Do not submit GitHub issues or change live academic data merely to take a screenshot.
7. Remove student names, IDs, account details, private notes and unrelated browser tabs. Use sanitized fixture data when possible.
8. Record capture date, source revision, browser, theme and scenario alongside any newly published screenshot. Update captions/alt text when replacing it.

Architecture art should distinguish the bundled catalog, local overrides/exclusions, manual GitHub updates and independent web explorer. It must not imply no network activity, cloud synchronization or complete program/curriculum support.

See [FEATURES.md](FEATURES.md) for supported behavior and [PRIVACY.md](PRIVACY.md) before capturing real portal data.
