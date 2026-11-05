// Additional production-behavior checks run within the prerequisite suite.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

module.exports = async function productQualityChecks(assert) {
  const root = path.resolve(__dirname, '..');
  const CourseData = require('../course-data.js');
  const js = fs.readFileSync(path.join(root, 'popup.js'), 'utf8');
  const html = fs.readFileSync(path.join(root, 'popup.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'popup.css'), 'utf8');
  const reports = vm.createContext({});
  const reportBuilder = js.slice(js.indexOf('  function buildCourseReport('), js.indexOf('  function openCourseReport('));
  vm.runInContext(reportBuilder, reports);
  const current = { name: 'Cloud Computing', credits: 3, examDay: 'Day 5', examSlot: 'T3', prerequisites: [] };
  const correction = reports.buildCourseReport('correction', 'CSE 4587', current);
  assert('Correction drafts identify the course and include the correct issue label', correction.title === '[Course correction] CSE 4587 — Cloud Computing' && correction.labels === 'data-correction');
  assert('Reports normalize day labels and preserve unknown prerequisites', correction.body.includes('Day 5 · T3') && !correction.body.includes('Day Day') && correction.body.includes('**Prerequisites:** Not listed'));
  assert('Reports ask for a correction and dated official evidence', correction.body.includes('## What needs changing?') && correction.body.includes('## Proposed correction') && correction.body.includes('trimester/year'));
  const added = reports.buildCourseReport('addition', 'CSE 4587', { ...current, prerequisites: ['None'] });
  assert('Additions use their own label and preserve explicit no prerequisites', added.labels === 'course-addition' && added.body.includes('**Prerequisites:** None') && !added.body.includes('What needs changing'));
  assert('Missing-course requests do not pretend a correction is being reported', reports.buildCourseReport('missing').title === '[Missing course] Enter course code and name' && reports.buildCourseReport('missing').labels === 'course-addition');
  assert('Edited details are identified as proposed rather than current', reports.buildCourseReport('update', 'CSE 4587', current).body.includes('## Proposed changes'));
  assert('In-class evaluations do not show an obsolete exam slot', reports.buildCourseReport('addition', 'LAB', { examDay: 'In-Class', examSlot: 'T3' }).body.includes('**Exam routine:** In-class evaluation\n'));
  assert('Legacy D-style days are normalized', reports.buildCourseReport('correction', 'X', { examDay: 'D2' }).body.includes('**Exam routine:** Day 2'));
  const injected = reports.buildCourseReport('addition', 'X', { name: 'Title\n## Fake section', prerequisiteNote: '<script>bad</script>' });
  assert('Course input cannot insert Markdown sections or raw HTML', !injected.body.includes('\n## Fake') && injected.body.includes('\\<script\\>'));
  const docsReports = vm.createContext({});
  const docsJs = fs.readFileSync(path.join(root, 'docs/app.js'), 'utf8');
  vm.runInContext(docsJs.slice(docsJs.indexOf('  function buildCourseReport(')), docsReports);
  assert('Public explorer uses identical correction templates', JSON.stringify(docsReports.buildCourseReport('correction', 'CSE 4587', current)) === JSON.stringify(correction));
  assert('Reporting is visible without an extra disclosure and missing-course requests are separate', !/<details[^>]*id="detailReportCard"/.test(html) && html.includes('id="contribMissingCourseBtn"') && html.includes('A GitHub account is required.'));
  const catalogBase = { name: 'Cloud Computing', credits: 3, examDay: 'Day 5', examSlot: 'T2', prerequisites: ['CSE 2213', 'CSE 2215'], prerequisiteNote: 'Minimum 70 credits' };
  const edited = { ...catalogBase, examSlot: 'T3', prerequisites: ['CSE 2215', 'CSE 2213'], prerequisiteNote: '' };
  const compared = reports.buildCourseReport('update', 'CSE 4587', edited, catalogBase);
  assert('Edited reports compare changed fields in a marked Markdown table', compared.body.includes('| Field | Current catalog | Your proposed change |') && compared.body.includes('| Exam slot | T2 | T3 |'));
  assert('Unchanged fields and reordered prerequisite codes are omitted', !compared.body.includes('| Credits |') && !compared.body.includes('| Prerequisites |') && !compared.body.includes('| Course name |'));
  assert('Removed notes remain explicit in the comparison', compared.body.includes('| Prerequisite note | Minimum 70 credits | Not listed |'));
  const same = reports.buildCourseReport('update', 'CSE 4587', { ...catalogBase, credits: '3.0', examDay: 'D5', prerequisites: ['CSE 2215', 'CSE 2213'] }, catalogBase);
  assert('Equivalent values do not create misleading changes', same.body.includes('No field changes were found.') && !same.body.includes('| Field |'));
  const unknown = reports.buildCourseReport('update', 'CSE 4587', edited);
  assert('Missing baselines are labelled unavailable rather than inferred', unknown.body.includes('Current catalog details are not available') && unknown.body.includes('| Exam slot | Not available | T3 |'));
  const explicitNone = reports.buildCourseReport('update', 'X', { prerequisites: ['None'] }, { prerequisites: [] });
  assert('Unknown prerequisites and explicit no prerequisites remain distinct', explicitNone.body.includes('| Prerequisites | Not listed | No prerequisites |'));
  const baseline = reports.getCatalogReportBaseline('X', { X: catalogBase }, { X: { examSlot: 'T1' } });
  assert('Baseline merges downloaded fields over bundled details without local edits', baseline.examSlot === 'T1' && baseline.name === catalogBase.name && catalogBase.examSlot === 'T2');
  assert('Legacy catalog names and remote-only courses are supported', reports.getCatalogReportBaseline('X', { X: 'Original name' }, { X: { credits: 1.5 } }).name === 'Original name' && reports.getCatalogReportBaseline('X', {}, { X: 'Remote name' }).name === 'Remote name' && reports.getCatalogReportBaseline('X', {}, {}) === null);
  const hostile = reports.buildCourseReport('update', 'X', { name: 'New | name\n## Heading' }, { name: 'Old | name' });
  assert('Comparison cells escape pipes and prevent injected Markdown rows', hostile.body.includes('Old \\| name') && hostile.body.includes('New \\| name ## Heading') && !hostile.body.includes('\n## Heading'));
  const opened = [];
  const notices = [];
  const launcher = vm.createContext({ bundledCourses: { "CSE 4587": catalogBase }, remoteCourses: { "CSE 4587": { examSlot: "T1" } }, chrome: { tabs: { create: (options, cb) => { opened.push(options.url); cb(); } }, runtime: {} }, showToast: message => notices.push(message), setTimeout: fn => fn() });
  vm.runInContext(reportBuilder + js.slice(js.indexOf('  function openCourseReport('), js.indexOf('  // Context-aware course reporting action')), launcher);
  launcher.openCourseReport('addition', 'CSE 4587', current);
  const draft = new URL(opened[0]);
  assert('Draft opening preserves encoded fields and the correct category', draft.searchParams.get('title') === added.title && draft.searchParams.get('labels') === 'course-addition' && draft.searchParams.get('body').includes('Cloud Computing'));
  launcher.openCourseReport('update', 'CSE 4587', edited);
  const updateDraft = new URL(opened[1]);
  assert('Actual edited draft uses the latest shared catalog baseline', updateDraft.searchParams.get('body').includes('| Exam slot | T1 | T3 |') && updateDraft.searchParams.get('labels') === 'data-correction');
  const laterEdit = reports.buildCourseReport('update', 'CSE 4587', { ...edited, credits: 4 }, catalogBase);
  assert('Repeated edits retain the full comparison against the catalog', laterEdit.body.includes('| Credits | 3 | 4 |') && laterEdit.body.includes('| Exam slot | T2 | T3 |'));
  assert('Edited action explains the comparison without adding another control', js.includes('Compare catalog details and your changes on GitHub') && html.includes('Review your saved changes against the shared catalog in a GitHub draft.'));
  launcher.getCourseOrigin = code => ({ class: code });
  assert('All course-specific draft buttons distinguish additions, updates and reports', launcher.courseReportKind('user-added') === 'addition' && launcher.courseReportKind('edited') === 'update' && launcher.courseReportKind('official') === 'correction');
  launcher.chrome.runtime.lastError = { message: 'Tab failed' };
  launcher.openCourseReport('correction', 'CSE 4587', current);
  assert('Failed GitHub tab creation gives actionable feedback', notices[0] === 'Could not open GitHub. Try again.');
  // Exercise the real update action through failure and retry.
  const syncAttributes = {};
  let syncClick;
  let offline = true;
  const syncTimers = [];
  const syncClasses = new Set();
  const syncButton = { disabled: false, classList: { add: (...names) => names.forEach(n => syncClasses.add(n)), remove: (...names) => names.forEach(n => syncClasses.delete(n)) }, setAttribute: (key, value) => { syncAttributes[key] = value; }, removeAttribute: key => { delete syncAttributes[key]; }, addEventListener: (_, handler) => { syncClick = handler; } };
  const syncEls = { syncBtn: syncButton, syncBtnText: {}, syncTime: { style: {} } };
  const syncRuntime = vm.createContext({ els: syncEls, lastSyncedAt: 1, lastSyncResult: null, courses: {}, softDeletedCourses: [], hardDeletedCourses: [], remoteCourses: {}, console: { error() {} }, setTimeout: fn => syncTimers.push(fn), reviewCatalogUpdate() {}, renderSyncResult() {}, updateCourseCount() {}, checkSyncReminder() {}, formatTimeAgo: () => 'Last updated: Just now', chrome: { runtime: { sendMessage: async () => offline ? { success: false, error: 'Offline' } : { success: true, lastSyncedAt: 2, stats: { updated: 1 } } }, storage: { local: { get: async () => ({ courses: {} }), remove() {} } } } });
  vm.runInContext(js.slice(js.indexOf('    if (els.syncBtn) {'), js.indexOf('    // Dismiss buttons for sync and reset')), syncRuntime);
  await syncClick();
  assert('An update failure is visibly marked before retry', syncButton.disabled && syncAttributes['aria-busy'] === 'true' && syncEls.syncTime.textContent === 'Check your connection and try again.');
  syncTimers.shift()();
  assert('Update failures persist with an enabled retry action', !syncButton.disabled && !syncAttributes['aria-busy'] && syncEls.syncBtnText.textContent === 'Try again' && syncEls.syncTime.textContent === 'Check your connection and try again.');
  offline = false;
  await syncClick();
  syncTimers.shift()();
  assert('Successful retries restore the normal catalog action and clear the error', !syncClasses.has('is-error') && !syncButton.disabled && syncEls.syncBtnText.textContent === 'Check for updates' && syncRuntime.lastSyncedAt === 1);
  const trashClasses = new Set();
  const toggleAttributes = {};
  const trashNodes = { catalogMenu: { classList: { toggle: (name, on) => on ? trashClasses.add(name) : trashClasses.delete(name) } }, catalogMenuToggle: { setAttribute: (key, value) => { toggleAttributes[key] = value; } } };
  const trashEls = { trashBadge: { style: {} }, viewTrashBtn: { setAttribute() {} }, restoreAllBtn: {}, emptyTrashBtn: {} };
  const trashRuntime = vm.createContext({ document: { getElementById: id => trashNodes[id] }, els: trashEls });
  vm.runInContext(js.slice(js.indexOf('  function updateTrashIndicator('), js.indexOf('  // Matches domains')), trashRuntime);
  trashRuntime.updateTrashIndicator(3);
  assert('Nonempty Trash activates the menu glow and exposes its count accessibly', trashClasses.has('has-trash') && toggleAttributes['aria-label'] === 'More catalog options, 3 courses in Trash' && trashEls.trashBadge.textContent === '3');
  trashRuntime.updateTrashIndicator(1);
  assert('Trash indicator handles singular counts and keeps recovery actions available', toggleAttributes['aria-label'].includes('1 course in Trash') && !trashEls.restoreAllBtn.disabled);
  trashRuntime.updateTrashIndicator(120);
  assert('Large Trash counts stay compact while retaining the full accessible count', trashEls.trashBadge.textContent === '99+' && toggleAttributes['aria-label'].includes('120 courses'));
  trashRuntime.updateTrashIndicator(0);
  assert('Restoring or deleting the final course clears the glow, dot and badge state', !trashClasses.has('has-trash') && trashEls.trashBadge.style.display === 'none' && toggleAttributes['aria-label'] === 'More catalog options' && trashEls.restoreAllBtn.disabled && trashEls.emptyTrashBtn.disabled);
  const background = fs.readFileSync(path.join(root, 'background.js'), 'utf8');
  let catalogWrites = 0;
  let merges = 0;
  const previousRemote = { 'TST 1001': { name: 'Course A', credits: 3 }, 'TST 1002': { name: 'Old course' } };
  const downloaded = { 'TST 1001': { name: 'Course A', credits: 4 }, 'TST 1003': { name: 'New course' } };
  const catalogStore = { remoteCourses: previousRemote, lastSyncedAt: 123, userCourses: { 'TST 1001': { name: 'My title' } } };
  const service = vm.createContext({ CourseData, Blob, console: { warn() {} }, COURSES_URL: 'bundled', fetch: async url => url === 'bundled' ? { ok: true, json: async () => ({ 'TST 1001': { name: 'Course A', credits: 3 } }) } : { ok: true, text: async () => JSON.stringify(downloaded) }, chrome: { storage: { local: { get: async () => ({ remoteCourses: catalogStore.remoteCourses }), set: async value => { catalogWrites++; Object.assign(catalogStore, value); } } } }, loadAndStoreCourses: async () => { merges++; } });
  vm.runInContext(background.slice(background.indexOf('async function syncCourses('), background.indexOf('const DEFAULT_ALLOWED_SITES')), service);
  const reviewed = await service.syncCourses(true);
  assert('Checking catalog updates does not write storage, merge courses or advance the timestamp', reviewed.success && catalogWrites === 0 && merges === 0 && catalogStore.lastSyncedAt === 123);
  assert('Review includes additions, removals and credit-only changes', reviewed.stats.added === 1 && reviewed.stats.removed === 1 && reviewed.stats.updatedDetails['TST 1001'].includes('Credits'));
  catalogStore.remoteCourses = { ...previousRemote, 'TST 1004': { name: 'Concurrent update' } };
  const stale = await service.syncCourses(false, reviewed.catalog, reviewed.baselineRevision);
  assert('Applying a stale catalog preview is rejected without writes', !stale.success && catalogWrites === 0);
  catalogStore.remoteCourses = previousRemote;
  const applied = await service.syncCourses(false, reviewed.catalog, reviewed.baselineRevision);
  assert('Only explicit approval applies the reviewed data and updates the timestamp', applied.success && catalogWrites === 1 && merges === 1 && catalogStore.remoteCourses['TST 1001'].credits === 4 && catalogStore.lastSyncedAt !== 123);
  assert('Catalog application preserves local course overrides', catalogStore.userCourses['TST 1001'].name === 'My title');
  const normalization = js.slice(js.indexOf('  function normalizeCourseData('), js.indexOf('  function getSoftDeletedCourseData('));
  const totals = js.slice(js.indexOf('  function computeEnrolledCredits('), js.indexOf('  function examCourseLabel('));
  const data = vm.createContext({ CourseData });
  vm.runInContext(normalization + totals, data);
  const summary = data.summarizeCourseCredits(['A', 'B'], { A: { name: 'A', credits: 1.5 }, B: 'B' });
  assert('Credit totals count known values and explicitly report gaps',
    summary.total === 1.5 && summary.missing === 1 && summary.label === '1.5 known credits · 1 missing');
  assert('No remote font imports remain in the popup', !/@import\s+url\(/i.test(css));
  assert('Planner and catalog expose the approved names', html.includes('My courses &amp; exams') && html.includes('Course catalog'));
  assert('Secondary catalog actions remain accessible in a native disclosure',
    /<details[^>]*id="catalogMenu"/.test(html) && html.includes('More catalog options'));
  assert('Exam warnings announce updated content accessibly',
    /id="detailClashWarning"[^>]*role="status"[^>]*aria-live="polite"/.test(html));
  assert('Planning reminder clearly asks students to recheck UCAM', html.includes('Recheck the latest exam dates and times in UCAM before finalizing your plan.'));
  assert('Planning reminder follows the course list and starts hidden for an empty planner', html.indexOf('id="routinePlanningNote"') > html.indexOf('id="myCoursesList"') && /id="routinePlanningNote"[^>]*hidden/.test(html));

  vm.runInContext(js.slice(js.indexOf('  function formatCourseForExport('), js.indexOf('  function getExportDateString(')), data);
  data.getCatalogReportBaseline = reports.getCatalogReportBaseline;
  vm.runInContext(js.slice(js.indexOf('  function computeImportDiff('), js.indexOf('  function renderImportPreview(')) + js.slice(js.indexOf('  function buildCatalogResetPlan('), js.indexOf('  function currentCatalogResetPlan(')), data);
  const resetBundled = { 'TST 1001': { name: 'Original', credits: 3 }, 'TST 1002': { name: 'Restore B' } };
  const resetUser = { 'TST 1001': { name: 'My edit', credits: 4 }, CUSTOM: { name: 'Keep me' } };
  const plan = data.buildCatalogResetPlan(resetBundled, { 'TST 1001': { credits: 2 } }, resetUser, ['TST 1002', 'CUSTOM'], ['TST 1001', 'CUSTOM-HARD']);
  assert('Reset preview includes restored courses once and shows fields discarded against merged defaults', plan.count === 2 && plan.restoredCodes.length === 2 && plan.diff.toUpdate[0].changes.some(change => change.field === 'Credits' && change.newVal === '2'));
  assert('Reset preserves custom courses and their deleted/excluded states', plan.nextUser.CUSTOM.name === 'Keep me' && !plan.nextUser['TST 1001'] && plan.nextSoft.includes('CUSTOM') && plan.nextHard.includes('CUSTOM-HARD'));
  assert('Preparing a reset review does not mutate source storage objects', resetUser['TST 1001'].name === 'My edit' && resetBundled['TST 1001'].credits === 3);
  assert('Unmodified catalogs have no reset work', data.buildCatalogResetPlan(resetBundled, {}, { CUSTOM: 'Custom' }, ['CUSTOM'], []).count === 0);
  assert('Reset revisions detect edits made after opening the review', plan.revision !== data.buildCatalogResetPlan(resetBundled, { 'TST 1001': { credits: 2 } }, { ...resetUser, 'TST 1001': 'Later edit' }, ['TST 1002', 'CUSTOM'], ['TST 1001', 'CUSTOM-HARD']).revision);
  let duplicateRejected = false;
  try { CourseData.parse('{"CSE 1001":"First","CSE 1001":"Second"}'); } catch (_) { duplicateRejected = true; }
  assert('Duplicate raw JSON keys cannot disappear silently during parsing', duplicateRejected);
  assert('Duplicate-key parsing correctly handles escaped strings and nested objects', CourseData.parse('{"CSE 1001":{"name":"Text with \\"quotes\\" and {}"}}')['CSE 1001'].name.includes('quotes'));
  const canonical = 'CSE 1001';
  const previous = { [canonical]: { name: 'Original', credits: 3, examDay: 'Day 5', examSlot: 'T3', prerequisites: ['CSE 1002'] } };
  const renamed = data.computeImportDiff({ [canonical]: 'Renamed' }, previous);
  assert('Name-only import previews preserve inherited metadata exactly', renamed.toUpdate[0].changes.length === 1 && renamed.toUpdate[0].incoming.credits === 3 && renamed.toUpdate[0].incoming.examDay === 'Day 5');
  const cleared = data.computeImportDiff({ [canonical]: { name: 'Original', credits: null, examDay: '', examSlot: '', prerequisites: [] } }, previous);
  assert('Explicit object imports can clear metadata rather than behaving as name-only patches', cleared.toUpdate[0].incoming.credits === null && cleared.toUpdate[0].incoming.examDay === '');
  assert('Normalized duplicate import codes are reported instead of silently overwriting', data.computeImportDiff({ 'cse 1001': 'First', 'CSE 1001': 'Second' }, {}).errors.length === 1);
  for (const value of [{ name: 'A', credits: '3abc' }, { name: 'A', credits: Infinity }, { name: 'A', credits: -1 }, { name: 'A', examDay: 5 }, { name: 'A', prerequisites: 'CSE 1002' }, { name: 'A', prerequisites: [canonical] }]) {
    assert('Invalid records are rejected: ' + JSON.stringify(value), !!CourseData.validate(canonical, value));
  }
  assert('Reserved dictionary keys are rejected', !!CourseData.validate('__proto__', { name: 'Bad key' }));
  assert('Multi-course prerequisite cycles are detected', !!CourseData.cycle({ 'CSE 1001': { prerequisites: ['CSE 1002'] }, 'CSE 1002': { prerequisites: ['CSE 1001'] } }));
  const failedImport = vm.createContext({ courses: structuredClone(previous), userCourses: {}, softDeletedCourses: [canonical], hardDeletedCourses: [], chrome: { storage: { local: { set: async () => { throw Error('Quota'); } } } } });
  vm.runInContext(js.slice(js.indexOf('  async function executeCommitImportDiff('), js.indexOf('  function triggerDropZoneError(')), failedImport);
  try { await failedImport.executeCommitImportDiff(renamed); } catch (_) {}
  assert('Failed imports leave active data, overrides and Trash untouched', failedImport.courses[canonical].name === 'Original' && !Object.hasOwn(failedImport.userCourses, canonical) && failedImport.softDeletedCourses.includes(canonical));
  const examChecks = vm.createContext({});
  vm.runInContext(normalization + js.slice(js.indexOf('  function detectSameDayExams('), js.indexOf('  function computeEnrolledCredits(')), examChecks);
  const aliasCourses = { A: { name: 'A', examDay: 'Day 5', examSlot: 'T3' }, B: { name: 'B', examDay: 'D5', examSlot: 't3' } };
  assert('Exam aliases and letter case resolve to one actual conflict', examChecks.detectExamClashes(['A', 'B'], aliasCourses).length === 1);
  assert('Unknown times do not create time conflicts', examChecks.detectExamClashes(['A', 'B'], { A: { name: 'A', examDay: 'Day 5', examSlot: 'TBA' }, B: { name: 'B', examDay: 'Day 5', examSlot: 'TBA' } }).length === 0);
  assert('Duplicate selections cannot create a same-day warning', examChecks.detectSameDayExams(['A', 'A'], aliasCourses).length === 0);
  assert('Malformed stored field types do not crash normalization', examChecks.normalizeCourseData({ name: 2, examDay: 5, examSlot: [] }).examDay === '');
  const matcher = vm.createContext({});
  const content = fs.readFileSync(path.join(root, 'content.js'), 'utf8');
  vm.runInContext(content.slice(content.indexOf('  function buildRegex('), content.indexOf('  // Matches the text')), matcher);
  for (const text of ['CSE 3411', 'CSE3411', 'CSE  3411', 'CSE\t3411']) assert('Website scanner handles spacing: ' + text, matcher.buildRegex({ 'CSE 3411': 'Course' }).test(text));
  const exported = data.formatCourseForExport({ name: 'Lab', credits: '1.5', prerequisites: ['CSE 1111'], prerequisiteNote: 'Minimum 30 credits' });
  assert('Production export preserves credits and prerequisite notes', exported.credits === 1.5 && exported.prerequisiteNote === 'Minimum 30 credits' && exported.prerequisites[0] === 'CSE 1111');
  assert('Unknown credits remain absent from exported course data', !Object.hasOwn(data.formatCourseForExport('Legacy course'), 'credits'));
  assert('Export download is a separate explicit action', html.includes('id="exportDownloadBtn"') && js.includes('radio.name = "courseExportScope"'));

  assert('Catalog source labels are not hidden in course headers', !/#detailsOriginBadge\.official[^}]*display:\s*none/.test(css));
  assert('Contribution dialog keeps help and reporting without duplicate export', html.includes('Improve catalog') && html.includes('id="contribReportIssueBtn"') && !html.includes('id="contribExportCustomBtn"'));

  assert('Conflict guidance stays within the local planner', !/contact your department|contact your.*advisor/i.test(js) && js.includes('Remove or replace conflicting courses in My Courses'));
  assert('Planning reminder explains local-only changes without directing registration', html.includes('without changing your UCAM registration') && !html.includes('Register courses separately in UCAM'));

  // Search counts/ranking and highlighting use the production helpers.
  class SearchNode {
    constructor(tag, text = '') { this.tag = tag; this.children = []; this.value = text; }
    set textContent(text) { this.children = []; this.value = text; }
    get textContent() { return this.value + this.children.map(child => child.textContent).join(''); }
    appendChild(child) { this.children.push(child); }
  }
  const search = vm.createContext({ document: { createElement: tag => new SearchNode(tag), createTextNode: text => new SearchNode('#text', text) } });
  vm.runInContext(js.slice(js.indexOf('  function courseSearchRank('), js.indexOf('  function renderCourseList(')), search);
  const searchCatalog = {
    'CSE 3411': { name: 'Systems CSE 3411' },
    'CSE 34110': { name: 'Another course' },
    'AAA 1000': { name: 'CSE 3411 reference' },
    'TXT 1000': { name: 'Literal [x] and .* and <img>' }
  };
  const ranked = search.findCourseMatches(searchCatalog, 'cse 3411');
  assert('Search ranks an exact code first, then code prefixes, then course names',
    ranked.length === 3 && ranked[0][0] === 'CSE 3411' && ranked[1][0] === 'CSE 34110' && ranked[2][0] === 'AAA 1000');
  assert('A course matching both code and name is counted only once', ranked.filter(entry => entry[0] === 'CSE 3411').length === 1);
  assert('Search accepts course codes without spaces', search.findCourseMatches(searchCatalog, 'cse3411')[0][0] === 'CSE 3411');
  assert('Quick-add matching excludes selected courses before counting', search.findCourseMatches(searchCatalog, 'cse', ['CSE 3411']).length === 2);
  assert('Literal search treats regex characters as text', search.findCourseMatches(searchCatalog, '.*').length === 1);
  const compact = new SearchNode('div');
  search.appendSearchHighlightedText(compact, 'CSE 3411', 'cse3411', true);
  assert('Code highlighting preserves spaces while marking compact queries', compact.textContent === 'CSE 3411' && compact.children[0].tag === 'mark');
  for (const needle of ['[x]', '.*', '<img>', String.fromCharCode(92)]) {
    const value = 'Literal ' + needle + ' and ' + needle;
    const node = new SearchNode('div');
    search.appendSearchHighlightedText(node, value, needle);
    assert('Highlighting preserves literal text for ' + needle, node.textContent === value && node.children.filter(child => child.tag === 'mark').length === 2);
  }
  assert('Search updates have a polite accessible announcement region', html.includes('id="searchAnnouncements" role="status" aria-live="polite"'));

  const home = html.slice(html.indexOf('class="view main-view"'), html.indexOf('class="view courses-view"'));
  assert('Home places planner navigation before website preferences', home.indexOf('id="openCoursesBtn"') < home.indexOf('id="homeEnrolledCard"') && home.indexOf('id="homeEnrolledCard"') < home.indexOf('class="card site-card"'));
  assert('Home retains author credit and repository access without a duplicate notification dot', home.includes('class="footer"') && home.includes('Sadid Ahmed') && home.includes('https://github.com/litch07/uiu-course-decoder') && !home.includes('id="settingsBadge"'));
  assert('Catalog update action is a keyboard-accessible button within its card', /<button[^>]*id="homeSyncAlert"/.test(home) && home.indexOf('id="homeSyncAlert"') < home.indexOf('id="homeEnrolledCard"'));
  assert('Display switches have explicit visible labels', home.includes('for="showExamInfoToggle"') && home.includes('for="showPrerequisitesToggle"'));
  const siteAttributes = {};
  const site = vm.createContext({
    currentHost: '', allowedSites: ['lms.uiu.ac.bd'], chrome: { permissions: { contains: async () => true } },
    els: { siteToggle: { setAttribute: (key, value) => { siteAttributes[key] = value; } }, statusDot: {}, statusText: { style: {} } }
  });
  vm.runInContext(js.slice(js.indexOf('  function isHostAllowed('), js.indexOf('  let domainSearchQuery')), site);
  await site.updateToggleAndStatus();
  assert('Unsupported pages explain availability instead of reporting paused decoding', site.els.siteToggle.disabled && !site.els.siteToggle.checked && site.els.statusText.textContent === 'Open a website to enable decoding.');
  site.currentHost = 'lms.uiu.ac.bd';
  await site.updateToggleAndStatus();
  assert('Supported active sites use consistent scope and an accessible switch name', !site.els.siteToggle.disabled && site.els.siteToggle.checked && site.els.statusText.textContent === 'Enabled on this website' && siteAttributes['aria-label'].includes('lms.uiu.ac.bd'));
  site.allowedSites = [];
  await site.updateToggleAndStatus();
  assert('Disabled supported sites do not appear unavailable', !site.els.siteToggle.disabled && !site.els.siteToggle.checked && site.els.statusText.textContent === 'Disabled on this website');

  const syncNodes = Object.fromEntries(['syncReminderBanner', 'homeSyncAlert', 'homeSyncAge'].map(key => [key, { style: {}, textContent: '' }]));
  const sync = vm.createContext({ lastSyncedAt: Date.now() - 80 * 24 * 60 * 60 * 1000, document: { getElementById: id => syncNodes[id] } });
  vm.runInContext(js.slice(js.indexOf('  function checkSyncReminder('), js.indexOf('  const UIU_PORTALS')), sync);
  sync.checkSyncReminder();
  assert('Compact catalog reminder describes the real download age', syncNodes.homeSyncAlert.style.display === 'flex' && syncNodes.homeSyncAge.textContent === 'Last synced 80 days ago');
  sync.lastSyncedAt = Date.now();
  sync.checkSyncReminder();
  assert('Fresh catalogs hide the update reminder', syncNodes.homeSyncAlert.style.display === 'none');
  assert('Attribution remains available in Settings About', html.slice(html.indexOf('class="view settings-view"')).includes('Sadid Ahmed') && html.slice(html.indexOf('class="view settings-view"')).includes('GitHub project'));

  const homeSummary = vm.createContext({});
  vm.runInContext(js.slice(js.indexOf('  function buildHomeExamSummary('), js.indexOf('  function updateHomeExamBadge(')), homeSummary);
  const simultaneous = homeSummary.buildHomeExamSummary(
    [{ day: 'Day 5', slot: 'T3', courses: ['A', 'B'] }],
    [{ day: 'Day 5', count: 3, courses: [] }, { day: 'Day 2', count: 2, courses: [] }]
  );
  assert('Home reports overlaps and same-day workload simultaneously', simultaneous.conflicts.label === 'Time conflict: Day 5 (T3)' && simultaneous.sameDay.label === '2 exams on Day 2; 3 exams on Day 5');
  const sameOnly = homeSummary.buildHomeExamSummary([], [{ day: 'Day 4', count: 2 }]);
  assert('Same-day exams without overlap remain a separate warning', sameOnly.conflicts === null && sameOnly.sameDay.label === '2 exams on Day 4');
  const grouped = homeSummary.buildHomeExamSummary([{ day: 'Day 5', slot: 'T3' }, { day: 'Day 5', slot: 'T1' }], [{ day: 'Day 5', count: 4 }]);
  assert('Multiple conflicting slots on one day are grouped without duplicate days', grouped.conflicts.label === 'Time conflicts: Day 5 (T1, T3)' && grouped.sameDay.label === '4 exams on Day 5');
  const longSummary = homeSummary.buildHomeExamSummary([{ day: 'Day 10', slot: 'T1' }, { day: 'Day 2', slot: 'T2' }, { day: 'Day 5', slot: 'T3' }], []);
  assert('Many affected days remain compact with full accessible detail', longSummary.conflicts.label.includes('Day 2 (T2); Day 5 (T3)') && longSummary.conflicts.label.includes('+1 more day') && longSummary.conflicts.full.includes('Day 10 (T1)'));
  const clearSummary = homeSummary.buildHomeExamSummary([], []);
  assert('No exam warnings are invented for a clear or empty plan', clearSummary.conflicts === null && clearSummary.sameDay === null);
  assert('Home includes independent accessible status rows', html.includes('id="homeSameDayBadge"') && html.includes('id="homeExamSummary" role="status"'));

  vm.runInContext(js.slice(js.indexOf('  function updateHomeExamBadge('), js.indexOf('  function updateEnrolledUI(')), homeSummary);
  const badgeAttributes = {};
  const badge = { style: {}, setAttribute: (key, value) => { badgeAttributes[key] = value; }, removeAttribute: key => { delete badgeAttributes[key]; } };
  homeSummary.updateHomeExamBadge(badge, simultaneous.conflicts, 'danger');
  assert('Home conflict badges expose full day and slot details accessibly', badge.style.display === 'flex' && badgeAttributes['aria-label'].includes('Day 5 (T3)'));
  homeSummary.updateHomeExamBadge(badge, null, 'danger');
  assert('Resolved home warnings are hidden and stale details are cleared', badge.style.display === 'none' && badge.textContent === '' && !badgeAttributes['aria-label']);

  const fields = ['detailName', 'detailDay', 'detailSlot', 'detailPrereq', 'detailPrereqNote', 'detailCredits'];
  const els = Object.fromEntries(fields.map(key => [key, { value: '' }]));
  const saveAttributes = {};
  els.detailSaveBtn = { disabled: false, getAttribute: key => saveAttributes[key], setAttribute: (key, value) => { saveAttributes[key] = value; }, removeAttribute: key => { delete saveAttributes[key]; } };
  els.modalCancelBtn = {};
  let confirmations = 0;
  let navigationCount = 0;
  const dirty = vm.createContext({
    els, currentEditingCode: null, pendingAction: null, pendingDetailsNavigation: null,
    openCourseDetails: function() {},
    showToast() {}, setModalText() {}, openModalSafely() { confirmations++; }
  });
  vm.runInContext(js.slice(js.indexOf('  function detailsFormSnapshot('), js.indexOf('  function exitCourseDetails(')), dirty);
  dirty.openCourseDetails.formSnapshot = dirty.detailsFormSnapshot();
  dirty.requestDetailsNavigation(() => navigationCount++);
  assert('Unchanged forms navigate without a confirmation', navigationCount === 1 && confirmations === 0);
  els.detailName.value = 'Unsaved title';
  dirty.requestDetailsNavigation(() => navigationCount++);
  assert('Unsaved edits pause navigation and keep the entered values',
    confirmations === 1 && navigationCount === 1 && els.detailName.value === 'Unsaved title' && dirty.pendingAction === 'discard-changes');
  els.detailSaveBtn.setAttribute('aria-busy', 'true');
  dirty.requestDetailsNavigation(() => navigationCount++);
  assert('Navigation waits while a save is in progress', navigationCount === 1 && confirmations === 1);

  els.detailSaveBtn.removeAttribute('aria-busy');
  els.detailName.value = '';
  dirty.updateDetailsSaveState();
  assert('Unchanged course forms disable Save without claiming to be saving', els.detailSaveBtn.disabled && els.detailSaveBtn.title === 'No changes to save');
  dirty.requestDetailsNavigation(() => navigationCount++);
  assert('A disabled unchanged Save button never blocks back navigation', navigationCount === 2);
  els.detailName.value = 'Edited';
  dirty.updateDetailsSaveState();
  assert('Editing enables Save', !els.detailSaveBtn.disabled);
  els.detailName.value = '   ';
  dirty.updateDetailsSaveState();
  assert('Reverting edits including insignificant whitespace disables Save', els.detailSaveBtn.disabled);
  els.detailName.value = 'Course'; els.detailCredits.value = '3'; els.detailPrereq.value = 'CSE 1111, CSE 2213';
  dirty.openCourseDetails.formSnapshot = dirty.detailsFormSnapshot();
  els.detailCredits.value = '3.0'; els.detailPrereq.value = 'cse 2213, CSE 1111';
  dirty.updateDetailsSaveState();
  assert('Equivalent credit formatting and prerequisite ordering do not enable Save', els.detailSaveBtn.disabled);
  els.detailInClass = { checked: true };
  dirty.updateDetailsSaveState();
  assert('Mode toggles count as edits', !els.detailSaveBtn.disabled);
  els.detailSaveBtn.setAttribute('aria-busy', 'true');
  dirty.updateDetailsSaveState();
  assert('Pending saves disable repeated saves', els.detailSaveBtn.disabled);
  els.detailSaveBtn.removeAttribute('aria-busy');
  dirty.updateDetailsSaveState();
  assert('Failed saves leave edits available to retry', !els.detailSaveBtn.disabled);
  dirty.openCourseDetails.formSnapshot = dirty.detailsFormSnapshot();
  dirty.updateDetailsSaveState();
  assert('Successful saves disable Save until another edit', els.detailSaveBtn.disabled);
  let failStorage = true;
  const persisted = {};
  const save = vm.createContext({ getCatalogReportBaseline: reports.getCatalogReportBaseline,
    bundledCourses: { A: { name: 'Original title', credits: 3 } }, remoteCourses: {}, userCourses: {},
    softDeletedCourses: [], hardDeletedCourses: [], courses: { A: { name: 'Original title', credits: 3 } },
    currentEditingCode: null, isTrashMode: false, searchQuery: '',
    console, chrome: {
      storage: { local: { set: async value => {
        if (failStorage) throw new Error('Simulated storage failure');
        Object.assign(persisted, value);
      } } },
      runtime: { sendMessage: async () => ({ success: true }) }
    },
    reloadLocalCoursesState: async () => {}, renderCourseList() {}, renderTrashList() {}, showToast() {}
  });
  vm.runInContext(normalization + js.slice(js.indexOf('  function commitCourseSave('), js.indexOf('  function renderMsgDom(')), save);
  let rejected = false;
  try { await save.commitCourseSave('A', { name: 'Edited title', credits: 1.5 }); }
  catch (_) { rejected = true; }
  assert('Failed storage writes reject without changing the active catalog',
    rejected && save.courses.A.name === 'Original title' && save.userCourses.A === undefined);
  failStorage = false;
  await save.commitCourseSave('A', { name: 'Edited title', credits: 1.5 });
  assert('A successful direct save persists edits before updating the active catalog',
    persisted.userCourses.A.name === 'Edited title' && save.courses.A.name === 'Edited title' && save.courses.A.credits === 1.5);
  await save.commitCourseSave('A', { name: 'Original title', credits: 3 });
  assert('Saving catalog defaults removes the custom override',
    save.userCourses.A === undefined && save.courses.A.name === 'Original title');
  save.currentEditingCode = 'A';
  save.els = {};
  save.document = { getElementById: () => null };
  save.getCourseOrigin = () => ({ class: 'edited', label: 'Edited' });
  save.renderPrereqTree = () => {};
  save.updateDetailReportCard = () => {};
  save.updateEnrolledUI = () => {};
  save.updateDetailsSaveState = () => {};
  save.openCourseDetails = function() {};
  save.detailsFormSnapshot = () => 'newer unsaved edit';
  await save.commitCourseSave('A', { name: 'Submitted title', credits: 3 }, 'submitted form');
  assert('Edits made during a pending save are not incorrectly marked as saved', save.openCourseDetails.formSnapshot === 'submitted form' && save.detailsFormSnapshot() !== save.openCourseDetails.formSnapshot);

  await save.commitCourseSave('A', { name: 'Original title', credits: null, examDay: '', examSlot: '', prerequisites: [], prerequisiteNote: '' });
  assert('Cleared fields override bundled defaults explicitly', save.courses.A.credits === null && save.courses.A.examDay === '' && save.courses.A.prerequisites.length === 0);

};
