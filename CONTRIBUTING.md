# Contributing to UIU Course Code Decoder

First off, thank you for considering contributing to this project! This tool is built by students, for students, and keeping our course database up to date is a community effort.

## 📚 Adding Missing Courses

Currently, the extension is pre-loaded with **CSE, EEE, BBA, and Data Science** courses. However, there are many other department courses that we haven't been able to extract yet!

The single most helpful way to contribute is by adding these missing course codes to our database (`courses.json`). Whether you want to add your entire department's curriculum or just a few electives, every bit helps! 

### How to format `courses.json`
The `courses.json` file is a dictionary where every entry is an object containing the course details.

**Rules for adding a course:**
1. Keep the course code uppercase.
2. Ensure there is a single space between the department prefix and the number (e.g., `CSE 3421`, not `CSE3421`).
3. Capitalize the course name properly.
4. The `"name"` field is required. The `"examDay"`, `"examSlot"`, and `"prerequisites"` fields are optional, but should be included as empty strings (`""`) or empty arrays (`[]`) if unknown (rather than omitting the fields), to keep the format consistent across the file.
5. Prerequisites are listed as course codes (e.g., `"CSE 2213"`), not full names.

**Example:**
```json
{
  "CSE 3421": {
    "name": "Database Management Systems",
    "examDay": "",
    "examSlot": "",
    "prerequisites": ["CSE 2213"]
  },
  "EEE 1011": {
    "name": "Electrical Circuits I",
    "examDay": "Sunday",
    "examSlot": "Morning",
    "prerequisites": []
  }
}
```

## 📖 Glossary for Beginners
If you have genuinely never used GitHub before, don't worry! Here are a few terms you will see:
- **Repository:** The project's main folder on GitHub where all the files and code live.
- **Fork:** A personal copy of the repository made under your own account where you can safely experiment and make changes.
- **Branch:** A separate workspace inside your fork where you group your specific edits without affecting anything else.
- **Commit:** Saving your text changes with a short message describing what you did.
- **Pull Request:** Asking the project maintainers to review your changes and officially merge them into the main project.

## 🛠️ How to Submit Your Changes

### Option 1: Editing directly in your browser (Recommended for beginners)
This is the default and easiest way to contribute. You do not need to download anything, install any software, use a command line, or set anything up beforehand!

1. Navigate to the `courses.json` file in this repository on GitHub.com.
2. Click the small **pencil icon** (Edit this file) near the top right of the file view to edit the file directly in your browser. 
3. *Don't worry!* GitHub will automatically create a fork and a branch for you behind the scenes. You cannot break anything, and you cannot delete the original project's files!
4. You will see a text box where you can type your changes. Make your text edits directly in the browser's text box following the formatting rules above.
5. Once you are done, scroll down to find and click the green **Propose changes** button.
6. You will be taken to a new screen. Click the green **Create pull request** button, optionally leave a comment, and click **Create pull request** again to open it.

Mistakes are completely fine! Mistakes in a pull request can always be fixed or pointed out by a reviewer before anything is actually merged.

### Option 2: Using Git on your computer (Recommended if you're comfortable with it, or adding a large batch of courses)
If you prefer using the command line or need to use local text editors to find-and-replace many entries at once, follow these steps:

1. **Fork the Repository**: Click the "Fork" button in the top right corner of this repository to create your own copy.
2. **Clone your Fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/uiu-course-decoder.git
   cd uiu-course-decoder
   ```
3. **Create a Branch**: Create a new branch for your changes.
   ```bash
   git checkout -b add-new-courses
   ```
4. **Make your Changes**: Open `courses.json` (or any other file) and make your additions.
5. **Commit your Changes**:
   ```bash
   git add courses.json
   git commit -m "Add new CSE and EEE courses"
   ```
6. **Push to your Fork**:
   ```bash
   git push origin add-new-courses
   ```
7. **Submit a Pull Request**: Go to the original repository on GitHub, and you'll see a green button to "Compare & pull request". Click it, describe your changes, and submit!

### 📦 Submitting a Batch of Courses (e.g. a Whole Department)
If you are adding many courses at once, here are a few tips:
- Please add all your new courses as one large JSON block to make review easier, rather than submitting many tiny separate pull requests.
- For a large batch, Option 2 (local Git/CLI) is usually easier than editing directly in the browser, since local text editors make it simpler to search for duplicates and format many entries at once. However, the web-UI path in Option 1 still works fine for smaller batches too!
- Try to name your branch after the department or batch being added (e.g., `add-bba-courses`, `add-pharmacy-courses`) so maintainers can identify what a pull request contains at a glance.
- In your pull request description, mention which department/trimester the courses are from and roughly how many courses are included.
- Before adding duplicates, do a quick search (`Ctrl+F` or `Cmd+F`) in `courses.json` to check for course codes that might already exist. This reduces merge conflicts and review back-and-forth.
- If two contributors work on different departments at the same time, this is usually fine since edits to different course code keys rarely conflict. If GitHub does show a merge conflict, just mention it in the pull request and a maintainer will help you resolve it.

We will review your PR as soon as possible. Thank you for making UIU student life a bit easier!
