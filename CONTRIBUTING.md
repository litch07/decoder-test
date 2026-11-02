# Contributing to UIU Course Code Decoder

Thank you for considering contributing to **UIU Course Code Decoder**! This extension is built by students, for students, and keeping our university course database accurate and complete is a community effort.

Whether you want to fix a typo, add an exam slot, or contribute an entire department's curriculum, your help is welcome!

---

## 🚀 Two Ways to Contribute

### 1. ⚡ Quickest: Report Wrong Data (No GitHub experience needed)
If you spotted an incorrect course title, missing prerequisite, or outdated exam slot while using the extension:
1. Open the extension popup in your browser.
2. Go to **Course Database** and click on the course.
3. Scroll down and click **Report Wrong Data**.
4. A pre-filled GitHub issue will open with the course's exact information. Type what needs fixing and submit!

---

### 2. 🛠️ Direct: Add or Update Courses in `courses.json`
If you want to add missing courses or update existing ones, you can submit a Pull Request to `courses.json`.

Currently, the catalog includes **CSE, EEE, BBA, and Data Science** courses. Additional departments (Civil, Pharmacy, English, Economics, etc.) and new electives are always needed!

---

## 📋 Course Data Specification (`courses.json`)

The `courses.json` file is a dictionary where each key is an uppercase course code mapped to an object containing course details.

### Schema Fields

| Field | Type | Required? | Description & Rules |
|---|---|:---:|---|
| `name` | string | **Yes** | Full official course name (properly capitalized). |
| `examDay` | string | No | Exam routine day (e.g., `"Day A"`, `"Friday"`, or `""` if not scheduled). |
| `examSlot` | string | No | Exam routine slot (e.g., `"Slot 1"`, `"Morning"`, or `""` if not scheduled). |
| `prerequisites` | array | No | **Course codes only** (e.g., `["CSE 2213"]`). Empty array `[]` if none. **Never put credit counts here!** |
| `prerequisiteNote` | string | No | Non-course prerequisites or credit thresholds (e.g., `"MINIMUM 85 credits"`). Omit or set to `""` if none. |

### Formatting Rules

1. **Course Code**: Uppercase letters, exactly one space, then numbers (e.g., `"CSE 3421"`, not `"CSE3421"` or `"cse 3421"`).
2. **Alphabetical Ordering**: Entries in `courses.json` should be sorted alphabetically by course code.
3. **Prerequisites vs. Prerequisite Notes**:
   - `prerequisites` = List of other course codes only (e.g., `["CSE 1111", "CSE 1112"]`).
   - `prerequisiteNote` = Special requirements such as credit minimums (e.g., `"MINIMUM 85 credits"`).

### Schema Examples

#### Standard Course with Prerequisites:
```json
"CSE 3421": {
  "name": "Database Management Systems",
  "examDay": "",
  "examSlot": "",
  "prerequisites": ["CSE 2213"]
}
```

#### Senior Capstone / Project with Credit Requirement:
```json
"CSE 4000A": {
  "name": "Final Year Design Project - I",
  "examDay": "",
  "examSlot": "",
  "prerequisites": [],
  "prerequisiteNote": "MINIMUM 85 credits"
}
```

#### First-Year Course without Prerequisites:
```json
"EEE 1011": {
  "name": "Electrical Circuits I",
  "examDay": "Sunday",
  "examSlot": "Morning",
  "prerequisites": []
}
```

---

## 🛠️ How to Submit Your Changes

### Option 1: Editing Directly in Your Browser (Recommended for Beginners)
You do not need to install Git or use a terminal!

1. Open [`courses.json`](https://github.com/litch07/uiu-course-decoder/blob/main/courses.json) on GitHub.
2. Click the **pencil icon** (Edit this file) in the top-right corner. GitHub will automatically create a fork and branch for you.
3. Add or edit your course entries following the rules above.
4. Scroll down to **Commit changes**, enter a short description (e.g., `Add Pharmacy 1st year courses`), and click **Propose changes**.
5. Click **Create pull request** to submit your changes for review.

---

### Option 2: Using Git Locally (Recommended for Large Batches)
If you are adding an entire department or batch of courses:

1. **Fork & Clone**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/uiu-course-decoder.git
   cd uiu-course-decoder
   ```
2. **Create a branch**:
   ```bash
   git checkout -b add-pharmacy-courses
   ```
3. **Edit `courses.json`**: Add your courses in sorted order.
4. **Test your changes locally**:
   ```bash
   node tests/test_release1.js
   ```
5. **Commit & Push**:
   ```bash
   git add courses.json
   git commit -m "Add Pharmacy undergraduate course catalog"
   git push origin add-pharmacy-courses
   ```
6. **Open a Pull Request**: Visit the original repository on GitHub and click **Compare & pull request**.

---

## 🤖 Automated CI Verification

When you submit a Pull Request, our automated GitHub Actions workflow (`.github/workflows/validate-catalog.yml`) automatically checks:
- ✅ **JSON Syntax**: Confirms `courses.json` is valid JSON.
- ✅ **Schema Compliance**: Confirms all entries have valid `name` and proper types.
- ✅ **No Misplaced Notes**: Confirms credit thresholds are inside `prerequisiteNote`, not inside `prerequisites`.
- ✅ **Test Suite**: Runs the full suite of automated unit and integration tests.

If CI detects an issue, check the workflow summary for details. Feel free to ask for help on the PR—maintainers are happy to assist!

---

## 📖 Glossary for Beginners

- **Repository**: The main project folder on GitHub containing all code and assets.
- **Fork**: A personal copy of the repository on your GitHub account where you can safely test edits.
- **Branch**: An isolated workspace inside your fork for a specific set of changes.
- **Commit**: A snapshot of your changes with an explanatory message.
- **Pull Request (PR)**: A proposal asking maintainers to merge your changes into the main repository.

---

Pull requests and issue reports are reviewed promptly. Thank you for contributing and helping make university life a bit easier for all UIU students!
