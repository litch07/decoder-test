/**
 * tests/test_prereq_tree.js
 * Task 2.4 — Prerequisite Tree & "Unlocks" Explorer
 *
 * Tests:
 *   1. HTML: #prereqTreeSection present in popup.html
 *   2. HTML: #prereqChainBody present in popup.html
 *   3. HTML: #unlocksBody present in popup.html
 *   4. HTML: #prereqChainCount and #unlocksCount present
 *   5. popup.js contains buildPrereqChain function
 *   6. popup.js contains findUnlocks function
 *   7. popup.js contains renderPrereqTree function
 *   8. renderPrereqTree is called inside openCourseDetails
 *   9. Zero innerHTML usage in the new tree helpers
 *  10. Prerequisite chain algorithm — direct prereqs
 *  11. Prerequisite chain algorithm — transitive (depth-2) prereqs
 *  12. Cycle detection — no infinite loop
 *  13. Unlocks reverse lookup
 *  14. Missing prereq codes (not in catalog) handled
 *  15. els object has prereqTreeSection, prereqChainBody, unlocksBody entries
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML = fs.readFileSync(path.join(ROOT, 'popup.html'), 'utf8');
const JS   = fs.readFileSync(path.join(ROOT, 'popup.js'),   'utf8');

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

console.log('\n── test_prereq_tree.js ─────────────────────────────────────────────────────');

// ── 1–4: HTML structure ────────────────────────────────────────────────────
assert('HTML has #prereqTreeSection',  HTML.includes('id="prereqTreeSection"'));
assert('HTML has #prereqChainBody',    HTML.includes('id="prereqChainBody"'));
assert('HTML has #unlocksBody',        HTML.includes('id="unlocksBody"'));
assert('HTML has #prereqChainCount and #unlocksCount',
  HTML.includes('id="prereqChainCount"') && HTML.includes('id="unlocksCount"'));

// ── 5–8: JS function presence ──────────────────────────────────────────────
assert('popup.js has buildPrereqChain function', JS.includes('function buildPrereqChain'));
assert('popup.js has findUnlocks function',      JS.includes('function findUnlocks'));
assert('popup.js has renderPrereqTree function', JS.includes('function renderPrereqTree'));
assert('renderPrereqTree called in openCourseDetails',
  JS.includes('renderPrereqTree(code)'));

// ── 9: Zero innerHTML in tree helpers ─────────────────────────────────────
// Extract the section between buildPrereqChain and End Task 2.4 comment.
// Check that innerHTML is not ASSIGNED (i.e., no `.innerHTML =` or `.innerHTML +=`)
// JSDoc comments mentioning innerHTML are acceptable.
const treeStart = JS.indexOf('function buildPrereqChain');
const treeEnd   = JS.indexOf('End Task 2.4');
const treeSection = (treeStart !== -1 && treeEnd !== -1) ? JS.substring(treeStart, treeEnd) : '';
const innerHTMLAssigned = /\.innerHTML\s*[+]?=/.test(treeSection);
assert('Zero innerHTML assignment in prereq tree helpers',
  treeSection.length > 0 && !innerHTMLAssigned,
  treeSection.length === 0 ? 'Section not found' : 'Found .innerHTML assignment');

// ── 10–14: Algorithm unit tests (extract and run helpers in isolation) ─────

// Minimal stubs for normalizeCourseData
function normalizeCourseData(val) {
  if (!val) return { name: '', prerequisites: [], examDay: '', examSlot: '' };
  if (typeof val === 'string') return { name: val, prerequisites: [], examDay: '', examSlot: '' };
  return Object.assign({ name: '', prerequisites: [], examDay: '', examSlot: '' }, val);
}

// Re-implement buildPrereqChain locally (mirrors the popup.js version)
function buildPrereqChain(rootCode, catalog) {
  var directCodes = [];
  var levels = [];
  var visited = new Set();
  visited.add(rootCode);
  var rootData = normalizeCourseData(catalog[rootCode]);
  var rootPrereqs = Array.isArray(rootData.prerequisites) ? rootData.prerequisites : [];
  directCodes = rootPrereqs.slice();
  var currentLevel = rootPrereqs.filter(function(c) { return !visited.has(c); });
  currentLevel.forEach(function(c) { visited.add(c); });
  var depth = 1;
  while (currentLevel.length > 0) {
    levels.push({ codes: currentLevel.slice(), depth: depth });
    depth++;
    var nextLevel = [];
    for (var i = 0; i < currentLevel.length; i++) {
      var c = currentLevel[i];
      var cData = normalizeCourseData(catalog[c]);
      var cPrereqs = Array.isArray(cData.prerequisites) ? cData.prerequisites : [];
      for (var j = 0; j < cPrereqs.length; j++) {
        var p = cPrereqs[j];
        if (!visited.has(p)) {
          visited.add(p);
          nextLevel.push(p);
        }
      }
    }
    currentLevel = nextLevel;
  }
  return { directCodes: directCodes, levels: levels };
}

// Re-implement findUnlocks locally
function findUnlocks(code, catalog) {
  var result = [];
  Object.keys(catalog).forEach(function(k) {
    var data = normalizeCourseData(catalog[k]);
    if (Array.isArray(data.prerequisites) && data.prerequisites.indexOf(code) !== -1) {
      result.push(k);
    }
  });
  result.sort();
  return result;
}

// Test 10 — Direct prereqs
var catalog10 = {
  'CSE 2215': { prerequisites: ['CSE 1115', 'MATH 2101'] },
  'CSE 1115': { prerequisites: [] },
  'MATH 2101': { prerequisites: [] }
};
var r10 = buildPrereqChain('CSE 2215', catalog10);
assert('Direct prereqs returned correctly',
  r10.levels.length === 1 &&
  r10.levels[0].codes.includes('CSE 1115') &&
  r10.levels[0].codes.includes('MATH 2101'));

// Test 11 — Transitive (depth-2) prereqs
var catalog11 = {
  'CSE 2215': { prerequisites: ['CSE 1115'] },
  'CSE 1115': { prerequisites: ['CSE 1111'] },
  'CSE 1111': { prerequisites: [] }
};
var r11 = buildPrereqChain('CSE 2215', catalog11);
assert('Transitive (depth-2) prereqs included',
  r11.levels.length === 2 &&
  r11.levels[0].codes.includes('CSE 1115') &&
  r11.levels[1].codes.includes('CSE 1111'));

// Test 12 — Cycle detection (A requires B, B requires A)
var catalog12 = {
  'CSE A': { prerequisites: ['CSE B'] },
  'CSE B': { prerequisites: ['CSE A'] }
};
var r12;
var threw = false;
try {
  r12 = buildPrereqChain('CSE A', catalog12);
} catch(e) {
  threw = true;
}
assert('Cycle detection — no infinite loop, returns cleanly',
  !threw && r12 !== undefined && r12.levels.length <= 2);

// Test 13 — Unlocks reverse lookup
var catalog13 = {
  'CSE 1111': { prerequisites: [] },
  'CSE 1115': { prerequisites: ['CSE 1111'] },
  'MATH 1151': { prerequisites: ['CSE 1111'] },
  'CSE 2215': { prerequisites: ['CSE 1115'] }
};
var unlocks13 = findUnlocks('CSE 1111', catalog13);
assert('Unlocks finds courses that require the current course',
  unlocks13.length === 2 &&
  unlocks13.includes('CSE 1115') &&
  unlocks13.includes('MATH 1151'));

// Test 14 — Missing prereq codes (not in catalog) handled gracefully
var catalog14 = {
  'CSE 9000': { prerequisites: ['MISSING 1234'] }
};
var r14;
var threw14 = false;
try {
  r14 = buildPrereqChain('CSE 9000', catalog14);
} catch(e) {
  threw14 = true;
}
assert('Missing prereq codes handled without error',
  !threw14 && r14 !== undefined &&
  r14.levels[0].codes.includes('MISSING 1234'));

// ── 15: els entries ────────────────────────────────────────────────────────
assert('els has prereqTreeSection entry',  JS.includes('prereqTreeSection: document.getElementById("prereqTreeSection")'));
assert('els has prereqChainBody entry',    JS.includes('prereqChainBody: document.getElementById("prereqChainBody")'));
assert('els has unlocksBody entry',        JS.includes('unlocksBody: document.getElementById("unlocksBody")'));

// ── 16–18: Code/Name toggle ──────────────────────────────────────────────
assert('HTML has #prereqViewToggle', HTML.includes('id="prereqViewToggle"'));
assert('HTML has #prereqToggleCode', HTML.includes('id="prereqToggleCode"'));
assert('HTML has #prereqToggleName', HTML.includes('id="prereqToggleName"'));

assert('popup.js has showPrereqNames state variable', JS.includes('showPrereqNames'));
assert('popup.js has badgeContent helper inside renderPrereqTree', JS.includes('function badgeContent'));
assert('popup.js has setupPrereqToggle IIFE', JS.includes('setupPrereqToggle'));
assert('popup.js persists toggle preference via prereqShowNames',
  JS.includes('prereqShowNames'));

// Functional test — badgeContent equivalent
(function() {
  function normalizeCourseData(val) {
    if (!val) return { name: '', prerequisites: [] };
    if (typeof val === 'string') return { name: val, prerequisites: [] };
    return Object.assign({ name: '', prerequisites: [] }, val);
  }
  var catalog = {
    'CSE 1111': { name: 'Introduction to CS', prerequisites: [] },
    'CSE 1115': { name: 'Structured Programming', prerequisites: ['CSE 1111'] }
  };
  function badgeContent(courseCode, nameMode) {
    var inCatalog = !!catalog[courseCode];
    if (!inCatalog) return { label: courseCode, tooltip: courseCode + ' — not in catalog', nameMode: false };
    var data = normalizeCourseData(catalog[courseCode]);
    var name = data.name || '';
    if (nameMode && name) return { label: name, tooltip: courseCode, nameMode: true };
    return { label: courseCode, tooltip: name || ('Go to ' + courseCode), nameMode: false };
  }
  var codeMode = badgeContent('CSE 1111', false);
  assert('Code mode: badge label is code', codeMode.label === 'CSE 1111');
  assert('Code mode: tooltip is name', codeMode.tooltip === 'Introduction to CS');
  var nameMode = badgeContent('CSE 1111', true);
  assert('Name mode: badge label is name', nameMode.label === 'Introduction to CS');
  assert('Name mode: tooltip is code', nameMode.tooltip === 'CSE 1111');
  var missing = badgeContent('BIO 9999', false);
  assert('Missing code: label is always the code', missing.label === 'BIO 9999');
})();

// ── 19–24: Dedicated Flow View & Launcher Card Tests ──────────────────────
const CSS = fs.readFileSync(path.join(ROOT, 'popup.css'), 'utf8');

assert('HTML has #detailPrereqLauncherCard on details-view',
  HTML.includes('id="detailPrereqLauncherCard"'));
assert('HTML has #btnOpenPrereqFlow on details-view',
  HTML.includes('id="btnOpenPrereqFlow"'));
assert('HTML has dedicated #prereqFlowView',
  HTML.includes('id="prereqFlowView"') && HTML.includes('class="view flow-view"'));
assert('HTML has flow view navigation controls (#flowBackBtn, #flowSettingsBtn)',
  HTML.includes('id="flowBackBtn"') && HTML.includes('id="flowSettingsBtn"'));
assert('HTML has a compact selected course with code, title and credits',
  HTML.includes('id="flowHeroTitle"') && HTML.includes('id="flowAnchorCode"') && HTML.includes('id="flowHeroCredits"'));
assert('HTML has flow prerequisite note card #flowPrereqNoteCard',
  HTML.includes('id="flowPrereqNoteCard"') && HTML.includes('id="flowPrereqNoteText"'));

assert('CSS defines .view-wrapper.show-flow .flow-view transition',
  CSS.includes('.view-wrapper.show-flow .flow-view'));
assert('CSS styles .prereq-launcher-card and .btn-open-prereq-flow',
  CSS.includes('.prereq-launcher-card') && CSS.includes('.btn-open-prereq-flow'));
assert('CSS styles .flow-hero-card and .flow-hero-pill',
  CSS.includes('.flow-hero-card') && CSS.includes('.flow-hero-pill'));

assert('popup.js has openPrereqFlowView and exitPrereqFlowView functions',
  JS.includes('function openPrereqFlowView') && JS.includes('function exitPrereqFlowView'));
assert('popup.js caches launcher card & flow view elements in els',
  JS.includes('detailPrereqLauncherCard:') && JS.includes('btnOpenPrereqFlow:') && JS.includes('prereqFlowView:'));
assert('popup.js handles flow origin in openSettings and exitCourseDetails',
  JS.includes('settingsOriginView = "flow"') && JS.includes('detailsOriginView === "flow"'));

// Exercise the production traversal and renderer, rather than a copied algorithm.
const runtime = new Function('normalizeCourseData', 'document', 'els', 'courses',
  'showPrereqNames', 'openCourseDetails',
  JS.slice(JS.indexOf('  function buildPrereqChain('), JS.indexOf('  // ── End Task 2.4 helpers')) +
  '\nreturn { buildPrereqChain, buildPrereqStages, renderPrereqTree };');
class TreeNode {
  constructor(tag) { this.tag = tag; this.children = []; this.attributes = {}; this.style = {}; this.classList = { toggle() {} }; }
  appendChild(node) { this.children.push(node); }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key] ?? null; }
  addEventListener(event, handler) { this[event] = handler; }
  set textContent(value) { this.text = value; this.children = []; }
  get textContent() { return this.text || ''; }
}
const treeEls = Object.fromEntries(['prereqTreeSection', 'prereqChainBody', 'prereqChainCount',
  'unlocksBody', 'unlocksCount', 'flowHeroCredits'].map(key => [key, new TreeNode('div')]));
const targetCode = new TreeNode('span');
const treeDocument = { createElement: tag => new TreeNode(tag), getElementById: () => targetCode };
const sharedCatalog = {
  TARGET: { prerequisites: ['ADVANCED', 'BASE', 'ADVANCED'] },
  ADVANCED: { name: 'A long course title with <literal> markup', prerequisites: ['BASE'], credits: 1.5 },
  BASE: { prerequisites: ['None'] },
  NEXT: { prerequisites: ['TARGET', 'OTHER'] }
};
let navigated;
const production = runtime(normalizeCourseData, treeDocument, treeEls, sharedCatalog, false,
  code => { navigated = code; });
const stages = production.buildPrereqStages('TARGET', sharedCatalog);
assert('Production stages put shared foundation before its dependents',
  JSON.stringify(stages.map(stage => stage.codes)) === JSON.stringify([['BASE'], ['ADVANCED']]));
assert('Production traversal deduplicates direct prerequisites and excludes None',
  production.buildPrereqChain('TARGET', sharedCatalog).levels.flatMap(level => level.codes).length === 2);
const cyclicStages = production.buildPrereqStages('A', {
  A: { prerequisites: ['B'] }, B: { prerequisites: ['C'] }, C: { prerequisites: ['B'] }
});
assert('Production stages flag cycles instead of suggesting an enrollment order',
  cyclicStages.length === 1 && cyclicStages[0].unresolved && cyclicStages[0].codes.length === 2);
assert('Production stages flag a self prerequisite',
  production.buildPrereqStages('SELF', { SELF: { prerequisites: ['SELF'] } })[0].unresolved);
assert('Production stages preserve missing catalog references',
  production.buildPrereqStages('A', { A: { prerequisites: ['UNKNOWN'] } })[0].codes[0] === 'UNKNOWN');
production.renderPrereqTree('TARGET');
assert('Renderer creates separate ordered stages', treeEls.prereqChainBody.children.length === 2);
const advancedCard = treeEls.prereqChainBody.children[1].children[1];
assert('Renderer displays exact requirements and direct relationship',
  advancedCard.children[2].textContent.includes('Requires: BASE') &&
  advancedCard.children[2].textContent.includes('Required for TARGET'));
assert('Course titles remain literal text',
  advancedCard.children[1].textContent === sharedCatalog.ADVANCED.name);
advancedCard.click();
assert('Prerequisite cards retain course navigation', navigated === 'ADVANCED');
assert('Renderer shows additional requirements on future courses',
  treeEls.unlocksBody.children[0].children[2].textContent === 'Requires: TARGET + OTHER');
assert('Renderer updates target code and avoids fabricated credits',
  targetCode.textContent === 'TARGET' && treeEls.flowHeroCredits.textContent === 'Credits unlisted');
assert('HTML reading order is prerequisites, requirements, target, future courses',
  HTML.indexOf('id="prereqChainCard"') < HTML.indexOf('id="flowPrereqNoteCard"') &&
  HTML.indexOf('id="flowPrereqNoteCard"') < HTML.indexOf('id="flowAnchorCard"') &&
  HTML.indexOf('id="flowAnchorCard"') < HTML.indexOf('id="unlocksCard"'));

// Keep disclosures at section level, without nested stage controls.
const firstStage = treeEls.prereqChainBody.children[0];
assert('Stages use plain headings instead of nested collapse controls',
  firstStage.tag === 'section' && firstStage.children[0].tag === 'h3');
assert('Roadmap has only the prerequisite and future-course disclosures',
  (HTML.slice(HTML.indexOf('id="prereqFlowView"'), HTML.indexOf('<!-- View 4:')).match(/<details\b/g) || []).length === 2);
assert('Roadmap removes the bulk collapse toolbar',
  !HTML.includes('id="roadmapExpandAll"') && !HTML.includes('id="roadmapCollapseAll"'));
assert('Course editor and roadmap entry have no unnecessary collapse',
  /<div[^>]*id="detailsFormContainer"/.test(HTML) && /<div[^>]*id="detailPrereqLauncherCard"/.test(HTML));
assert('Details omit the redundant overview and target explanations',
  !HTML.includes('detailOverviewName') && !HTML.includes('Prerequisites lead to this course') && !HTML.includes('flowHeroReqText') && !HTML.includes('flowHeroUnlockText'));

// Run the actual navigation functions against a small DOM surface.
const navNodes = {};
function navNode(key) {
  if (!navNodes[key]) navNodes[key] = new TreeNode('div');
  return navNodes[key];
}
const classes = new Set();
const navEls = new Proxy({}, { get: (_, key) => navNode(key) });
navEls.viewWrapper.classList = {
  add: (...names) => names.forEach(name => classes.add(name)),
  remove: (...names) => names.forEach(name => classes.delete(name))
};
const flowBody = navNode('flowBody');
const detailsBody = navNode('detailsBody');
navEls.prereqFlowView.querySelector = () => flowBody;
let focusedCourse;
navEls.prereqTreeSection.querySelectorAll = () => ['A', 'B', 'C'].map(code => ({
  getAttribute: () => code,
  focus: () => { focusedCourse = code; }
}));
const navDocument = { getElementById: navNode, querySelector: () => detailsBody };
const navCatalog = { A: { name: 'Course A' }, B: { name: 'Course B' }, C: { name: 'Course C' } };
let renderedCourse;
const createNavigation = new Function('els', 'document', 'courses', 'normalizeCourseData',
  'getCourseOrigin', 'updateDetailReportCard', 'updateEnrolledUI', 'renderPrereqTree',
  'let currentEditingCode = null; let detailsOriginView = "courses"; const roadmapNavigationStack = [];\n' +
  JS.slice(JS.indexOf('  function openPrereqFlowView('), JS.indexOf('  els.btnOpenPrereqFlow?.addEventListener')) +
  JS.slice(JS.indexOf('  function openCourseDetails('), JS.indexOf('  function commitCourseSave(')) +
  '\nreturn { openCourseDetails, exitCourseDetails, openPrereqFlowView, exitPrereqFlowView, state: () => ({ code: currentEditingCode, origin: detailsOriginView, depth: roadmapNavigationStack.length }) };');
const navigation = createNavigation(navEls, navDocument, navCatalog,
  value => Object.assign({ name: '', credits: null, prerequisites: [] }, value),
  () => ({ class: 'official', label: 'Official' }), () => {}, () => {}, code => { renderedCourse = code; });
navigation.openCourseDetails('A', navCatalog.A, 'mycourses');
navigation.openPrereqFlowView('A');
flowBody.scrollTop = 223;
detailsBody.scrollTop = 112;
navNode('prereqChainCard').open = true;
navNode('unlocksCard').open = false;
navigation.openCourseDetails('B', navCatalog.B, 'flow');
assert('Child details back button identifies the source roadmap', navEls.detailsBackBtn.title === 'Back to A roadmap');
navNode('prereqChainCard').open = false;
navNode('unlocksCard').open = true;
flowBody.scrollTop = 0;
navigation.exitCourseDetails();
assert('Back restores the original course and its roadmap',
  navigation.state().code === 'A' && renderedCourse === 'A' && classes.has('show-flow') && navEls.detailName.value === 'Course A');
assert('Back restores scroll positions, section state and source-card focus',
  flowBody.scrollTop === 223 && detailsBody.scrollTop === 112 &&
  navNode('prereqChainCard').open && !navNode('unlocksCard').open && focusedCourse === 'B');
navigation.exitPrereqFlowView();
navigation.exitCourseDetails();
assert('Leaving the restored course preserves its My Courses origin', classes.has('show-mycourses'));
navigation.openCourseDetails('A', navCatalog.A);
navigation.openPrereqFlowView('A');
navigation.openCourseDetails('B', navCatalog.B, 'flow');
navigation.openPrereqFlowView('B');
navigation.openCourseDetails('C', navCatalog.C, 'flow');
navigation.exitCourseDetails();
assert('Nested exploration returns from C to the B roadmap',
  navigation.state().code === 'B' && navigation.state().depth === 1 && classes.has('show-flow'));
navigation.exitPrereqFlowView();
navigation.exitCourseDetails();
assert('Nested exploration then returns from B to the A roadmap',
  navigation.state().code === 'A' && navigation.state().depth === 0 && classes.has('show-flow'));
navigation.exitPrereqFlowView();
navigation.exitCourseDetails();
assert('Leaving the root course returns to the catalog', classes.has('show-courses'));
navigation.openCourseDetails('A', navCatalog.A);
navigation.openPrereqFlowView('A');
navigation.openCourseDetails('B', navCatalog.B, 'flow');
delete navCatalog.A;
navigation.exitCourseDetails();
assert('A removed source course falls back safely to the catalog',
  classes.has('show-courses') && navigation.state().depth === 0);

// Run asynchronous persistence checks before reporting the suite result.
require('./product_quality_checks')(assert).then(() => {
  console.log(`\n  Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
