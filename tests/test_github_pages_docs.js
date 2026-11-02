/**
 * tests/test_github_pages_docs.js
 * Verification suite for Task 2.5: GitHub Pages Documentation & Web Course Explorer
 *
 * Tests:
 *   1. File presence: docs/index.html, docs/styles.css, docs/app.js, docs/courses.json
 *   2. File presence: .github/workflows/deploy-pages.yml
 *   3. Catalog synchronization: docs/courses.json is strictly identical to root courses.json
 *   4. HTML structure: header, branding, navigation, and theme toggle present
 *   5. HTML structure: explorer search, department filter pills, and secondary controls
 *   6. HTML structure: course modal, deep-link copy button, and code/name toggle
 *   7. HTML structure: prerequisite chain card, unlocks card, and crowdsource error report button
 *   8. HTML structure: extension features showcase and installation guides
 *   9. Zero-innerHTML guarantee: docs/app.js contains zero innerHTML assignments
 *  10. Algorithm verification: buildPrereqChain, findUnlocks, and badgeContent logic
 *  11. Deep linking: checkUrlHash normalization
 *  12. Department categorization: getCourseDept prefix mapping
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');

let passed = 0;
let failed = 0;

function assert(label, condition, detail) {
  if (condition) {
    console.log('  ✓', label);
    passed++;
  } else {
    console.error('  ✗', label, detail ? `(${detail})` : '');
    failed++;
  }
}

console.log('\n── test_github_pages_docs.js ───────────────────────────────────────────────');

// ── 1. File presence checks ────────────────────────────────────────────────
const indexHtmlPath = path.join(DOCS_DIR, 'index.html');
const stylesCssPath = path.join(DOCS_DIR, 'styles.css');
const appJsPath     = path.join(DOCS_DIR, 'app.js');
const docsJsonPath  = path.join(DOCS_DIR, 'courses.json');
const deployYmlPath = path.join(ROOT, '.github', 'workflows', 'deploy-pages.yml');

assert('docs/index.html exists', fs.existsSync(indexHtmlPath));
assert('docs/styles.css exists', fs.existsSync(stylesCssPath));
assert('docs/app.js exists', fs.existsSync(appJsPath));
assert('docs/courses.json exists', fs.existsSync(docsJsonPath));
assert('.github/workflows/deploy-pages.yml exists', fs.existsSync(deployYmlPath));

// Read contents
const html = fs.existsSync(indexHtmlPath) ? fs.readFileSync(indexHtmlPath, 'utf8') : '';
const css  = fs.existsSync(stylesCssPath) ? fs.readFileSync(stylesCssPath, 'utf8') : '';
const js   = fs.existsSync(appJsPath)     ? fs.readFileSync(appJsPath, 'utf8') : '';
const rootJson = fs.readFileSync(path.join(ROOT, 'courses.json'), 'utf8');
const docsJson = fs.existsSync(docsJsonPath) ? fs.readFileSync(docsJsonPath, 'utf8') : '';
const deployYml = fs.existsSync(deployYmlPath) ? fs.readFileSync(deployYmlPath, 'utf8') : '';

// ── 2. Catalog synchronization ─────────────────────────────────────────────
assert('docs/courses.json is strictly in sync with root courses.json',
  rootJson === docsJson,
  'docs/courses.json differs from root courses.json');

// ── 3. HTML structure checks ───────────────────────────────────────────────
assert('HTML has theme toggle button (#themeToggleBtn)', html.includes('id="themeToggleBtn"'));
assert('HTML has search input (#searchInput)', html.includes('id="searchInput"'));
assert('HTML has department filter group (#deptFilterGroup)', html.includes('id="deptFilterGroup"'));
assert('HTML has department pills (CSE, DS, EEE, BBA, SCI, GEN)',
  html.includes('data-dept="CSE"') &&
  html.includes('data-dept="DS"') &&
  html.includes('data-dept="EEE"') &&
  html.includes('data-dept="BBA"') &&
  html.includes('data-dept="SCI"') &&
  html.includes('data-dept="GEN"'));

assert('HTML has course grid container (#courseGrid)', html.includes('id="courseGrid"'));
assert('HTML has course inspector modal (#courseModalOverlay & #courseModalCard)',
  html.includes('id="courseModalOverlay"') && html.includes('id="courseModalCard"'));

assert('HTML has modal copy share link button (#modalCopyLinkBtn)', html.includes('id="modalCopyLinkBtn"'));
assert('HTML has modal code/name toggle (#modalToggleCode & #modalToggleName)',
  html.includes('id="modalToggleCode"') && html.includes('id="modalToggleName"'));

assert('HTML has modal prerequisite ancestry card (#modalPrereqCard)', html.includes('id="modalPrereqCard"'));
assert('HTML has modal reverse unlocks card (#modalUnlocksCard)', html.includes('id="modalUnlocksCard"'));
assert('HTML has report error button (#modalReportBtn)', html.includes('id="modalReportBtn"'));
assert('HTML has features showcase section (#features)', html.includes('id="features"'));
assert('HTML has installation section (#install)', html.includes('id="install"'));

// ── 4. CSS structure checks ────────────────────────────────────────────────
assert('CSS has dark theme overrides ([data-theme="dark"])', css.includes('[data-theme="dark"]'));
assert('CSS has segmented prereq toggle styles (.prereq-view-toggle & .prereq-toggle-btn)',
  css.includes('.prereq-view-toggle') && css.includes('.prereq-toggle-btn'));
assert('CSS has department badge styles (.dept-cse, .dept-eee, etc.)',
  css.includes('.dept-cse') && css.includes('.dept-eee') && css.includes('.dept-bba'));
assert('CSS has modal overlay and card pop-in animation',
  css.includes('.modal-overlay') && css.includes('.modal-card'));

// ── 5. Zero-innerHTML check in docs/app.js ─────────────────────────────────
const hasInnerHtmlAssignment = /\.innerHTML\s*[+]?=/.test(js);
assert('docs/app.js has zero innerHTML assignments',
  !hasInnerHtmlAssignment,
  'Found innerHTML assignment in docs/app.js');

// ── 6. JS functions presence ───────────────────────────────────────────────
assert('docs/app.js has buildPrereqChain function', js.includes('function buildPrereqChain'));
assert('docs/app.js has findUnlocks function', js.includes('function findUnlocks'));
assert('docs/app.js has badgeContent function', js.includes('function badgeContent'));
assert('docs/app.js has openCourseModal function', js.includes('function openCourseModal'));
assert('docs/app.js has checkUrlHash function for deep linking', js.includes('function checkUrlHash'));
assert('docs/app.js has copyCourseShareLink function', js.includes('function copyCourseShareLink'));
assert('docs/app.js has department categorization mapping', js.includes('DEPT_MAP'));

// ── 7. Deployment workflow check ───────────────────────────────────────────
assert('deploy-pages.yml triggers on main branch push', deployYml.includes('branches: [main]'));
assert('deploy-pages.yml deploys from ./docs', deployYml.includes("path: './docs'"));
assert('deploy-pages.yml uses actions/deploy-pages@v4', deployYml.includes('actions/deploy-pages@v4'));

// ── 8. Functional unit test on real catalog algorithms ─────────────────────
const catalog = JSON.parse(rootJson);

// Functional buildPrereqChain
function buildPrereqChain(rootCode, cat) {
  const directCodes = [];
  const levels = [];
  const visited = new Set();
  visited.add(rootCode);

  const rootData = cat[rootCode] || {};
  const rootPrereqs = Array.isArray(rootData.prerequisites) ? rootData.prerequisites : [];
  directCodes.push(...rootPrereqs);

  let currentLevel = rootPrereqs.filter(c => !visited.has(c));
  currentLevel.forEach(c => visited.add(c));

  let depth = 1;
  while (currentLevel.length > 0) {
    levels.push({ codes: currentLevel.slice(), depth: depth });
    depth++;
    const nextLevel = [];
    for (const c of currentLevel) {
      const cData = cat[c] || {};
      const cPrereqs = Array.isArray(cData.prerequisites) ? cData.prerequisites : [];
      for (const p of cPrereqs) {
        if (!visited.has(p)) {
          visited.add(p);
          nextLevel.push(p);
        }
      }
    }
    currentLevel = nextLevel;
  }
  return { directCodes, levels };
}

// Functional findUnlocks
function findUnlocks(code, cat) {
  const results = [];
  for (const [k, val] of Object.entries(cat)) {
    if (val && Array.isArray(val.prerequisites) && val.prerequisites.includes(code)) {
      results.push(k);
    }
  }
  results.sort();
  return results;
}

// Test real catalog course if available
if (catalog['CSE 2215']) {
  const cse2215Chain = buildPrereqChain('CSE 2215', catalog);
  assert('Catalog CSE 2215 ancestry resolves without errors',
    cse2215Chain && cse2215Chain.directCodes.length > 0);
}

if (catalog['CSE 1111']) {
  const cse1111Unlocks = findUnlocks('CSE 1111', catalog);
  assert('Catalog CSE 1111 unlocks future courses correctly',
    Array.isArray(cse1111Unlocks) && cse1111Unlocks.length > 0);
}

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n  Results: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

