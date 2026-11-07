// Exercise the production tooltip controller without introducing a DOM dependency.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('content.js', 'utf8');
const handlers = new Map();
const timers = new Map();
let timerId = 0;
function element(key) {
  const attrs = new Map();
  const classes = new Set();
  return {
    dataset: key ? { cceKey: key } : {},
    style: { setProperty() {} },
    classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) },
    setAttribute: (k, v) => attrs.set(k, v),
    getAttribute: k => attrs.get(k) || null,
    removeAttribute: k => attrs.delete(k),
    isConnected: true,
    closest() { return key ? this : null; },
    contains(node) { return node === this; },
    getBoundingClientRect: () => ({ left: 5, top: 90, bottom: 110, width: 70, height: 20 })
  };
}
const tip = element();
tip.getBoundingClientRect = () => ({ width: 240, height: 80 });
const doc = {
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => tip,
  body: { appendChild() {} },
  addEventListener(type, handler) { handlers.set(type, handler); }
};
const win = {
  innerWidth: 360, innerHeight: 500,
  addEventListener(type, handler) { handlers.set(type, handler); }
};
const context = {
  enabled: true, themePreference: 'dark', refreshInlineTitles() {},
  resolve: key => key === 'unknown' ? null : ({ name: key }),
  buildExtendedData: data => data,
  buildTooltipDom(data, node) { node.firstChild = { style: {} }; node.textContent = data.name; },
  setTimeout(fn) { timers.set(++timerId, fn); return timerId; },
  clearTimeout(id) { timers.delete(id); }
};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('  function tooltipPosition('),
  source.indexOf('  function injectStylesIntoDoc(')), context);
const place = context.tooltipPosition;
for (const viewport of [280, 360, 1000]) {
  for (const left of [0, viewport / 2, viewport - 20]) {
    for (const top of [0, 100, 470]) {
      const p = place({ left, top, bottom: top + 20, width: 20 }, 240, 80, viewport, 500);
      assert.ok(p.left >= 12 && p.left + 240 <= viewport - 12);
      assert.ok(p.top >= 12 && p.top + 80 <= 488);
      assert.ok(p.arrow >= 12 && p.arrow <= 228);
    }
  }
}
assert.equal(place({ left: 50, top: 0, bottom: 20, width: 40 }, 240, 80, 360, 500).placement, 'below');
assert.equal(place({ left: 50, top: 470, bottom: 490, width: 40 }, 240, 80, 360, 500).placement, 'above');
assert.equal(place({ left: 50, top: 115, bottom: 135, width: 60 }, 240, 130, 800, 250).placement, 'above');
assert.equal(place({ left: 260, top: 97, bottom: 111, width: 55 }, 240, 80, 487, 142).placement, 'above');
assert.equal(place({ left: 500, top: 100, bottom: 120, width: 60 }, 240, 90, 1024, 142).placement, 'above');
context.attachTooltipListeners(doc, win);
const a = element('CSE 3411');
const b = element('CSE 3421');
a.setAttribute('aria-describedby', 'existing-description');
const event = (type, target, relatedTarget = null) => handlers.get(type)({ target, relatedTarget });
const flush = () => { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); };
const visible = () => tip.classList.contains('cce-visible');
event('mouseover', a);
assert.equal(visible(), false, 'Passing over a course must not instantly flash a tooltip');
event('mouseout', a);
flush();
assert.equal(visible(), false, 'Leaving before the hover delay cancels opening');
event('mouseover', a);
flush();
assert.equal(visible(), true);
assert.equal(tip.dataset.theme, 'dark');
assert.equal(tip.getAttribute('role'), 'tooltip');
assert.equal(a.getAttribute('aria-describedby'), 'existing-description cce-course-tooltip');
event('mouseout', a, tip);
event('mouseover', tip, a);
flush();
assert.equal(visible(), true, 'Moving onto the tooltip keeps it readable');
event('mouseout', tip);
flush();
assert.equal(visible(), false);
assert.equal(a.getAttribute('aria-describedby'), 'existing-description');
event('mouseover', a);
flush();
event('mouseover', b, a);
assert.equal(visible(), false, 'Old course details must disappear when changing course');
flush();
assert.equal(tip.textContent, 'CSE 3421');
event('focusin', a);
assert.equal(visible(), true, 'Keyboard focus opens immediately');
handlers.get('keydown')({ key: 'Escape' });
assert.equal(visible(), false);
event('focusout', a);
flush();
event('focusin', a);
event('scroll', doc);
assert.equal(visible(), false, 'Page scrolling dismisses a detached-looking tooltip');
event('focusin', a);
event('scroll', tip);
assert.equal(visible(), true, 'Scrolling long tooltip content keeps it open');
event('resize', win);
assert.equal(visible(), false);
const link = element();
link.querySelector = () => a;
event('focusout', a);
event('focusin', link);
assert.equal(link.getAttribute('aria-describedby'), tip.id, 'Describe the focused link itself');
event('blur', win);
assert.equal(link.getAttribute('aria-describedby'), null);
a.isConnected = false;
event('mouseover', a);
flush();
assert.equal(visible(), false, 'Removed course nodes cannot reopen a tooltip');
console.log('  Tooltip positioning, hover, focus, dismissal, and ARIA checks passed.');

// Render Inline details and verify that chart source text is not a second presentation.
function domNode(tag) {
  return {
    tagName: tag, children: [], dataset: {}, attrs: {},
    appendChild(child) { this.children.push(child); return child; },
    removeChild(child) { this.children.splice(this.children.indexOf(child), 1); },
    get firstChild() { return this.children[0] || null; },
    setAttribute(key, value) { this.attrs[key] = value; },
    removeAttribute(key) { delete this.attrs[key]; },
    get textContent() { return this.value || this.children.map(child => child.textContent).join(''); },
    set textContent(value) { this.value = value; this.children = []; }
  };
}
const renderDoc = {
  createElement: domNode, createElementNS: (ns, tag) => domNode(tag),
  createTextNode: text => ({ textContent: text })
};
context.document = renderDoc;
vm.runInContext(source.slice(source.indexOf('  function buildInlineDom('), source.indexOf('  function buildExtendedData(')), context);
const inline = domNode('span');
inline.dataset.cceSuffix = ' (E)';
context.buildInlineDom('CSE 3421', { name: 'Software Engineering', exam: 'Day 5, Slot T1',
  prereq: 'System Analysis and Design (CSE 3411)', inlinePrereq: 'CSE 3411' }, inline);
assert.ok(inline.children[0].textContent.endsWith(' (E)'), 'Section stays beside the course title');
assert.equal(inline.children[2].textContent, 'Prerequisites:CSE 3411', 'Routine rows use compact prerequisite codes');
assert.equal(inline.children.some(child => child.tagName === 'br'), false, 'Layout uses rows instead of forced breaks');
const svgParent = {
  nodeType: 1, tagName: 'SVG', parentElement: null,
  classList: {contains: name => name === 'highcharts-tooltip'},
  closest: () => null, hasAttribute: () => false
};
const scanDoc = {...renderDoc, documentElement: {}, createDocumentFragment: () => domNode('fragment')};
const scanner = vm.createContext({document: scanDoc, Node: {ELEMENT_NODE: 1, TEXT_NODE: 3},
  PROCESSED_ATTR: 'data-cce-done', mode: 'tooltip', courseRegex: /CSE 3421|CSE 3411/g,
  resolve: code => ({key: code}), buildExtendedData: () => ({name: 'Do not render into native SVG'})});
vm.runInContext(source.slice(source.indexOf('  const SKIP_TAGS'), source.indexOf('  // Some sites are tricky')) +
  source.slice(source.indexOf('  function processTextNode('), source.indexOf('  // Walk through the DOM')), scanner);
for (const code of ['CSE 3421', 'CSE 3421', 'CSE 3411']) {
  const fragment = scanner.processTextNode({nodeValue: code + ' (E)', parentElement: svgParent});
  assert.equal(fragment.children.length, 1, 'Each chart source has one marker');
  const marker = fragment.children[0];
  assert.equal(marker.dataset.cceKey, code, 'Consecutive updates preserve distinct course identity');
  assert.equal(marker.textContent, code + ' (E)', 'Native source contains no extension detail rows');
  marker.parentElement = svgParent;
  marker.hasAttribute = key => key in marker.attrs;
  assert.equal(scanner.processTextNode({nodeValue: code, parentElement: marker}), null,
    'Extension-owned chart text is not decorated again by mutation callbacks');
}
console.log('  Single chart source marker, repeated SVG updates, and self-mutation checks passed.');

const nativeChartTip = {textContent: 'Course A'};
const chart = { isConnected: true, querySelector: () => nativeChartTip };
const point = element();
point.closest = selector => selector.includes('highcharts-container') ? chart : point;
let hoverRefreshes = 0;
context.processNode = () => { hoverRefreshes++; };
context.requestAnimationFrame = fn => context.setTimeout(fn);
context.buildChartTooltipDom = (native, target) => {
  target.textContent = 'Chart attendance: ' + native.textContent;
  return {details: {style: {}}, history: {style: {}, getBoundingClientRect: () => ({height: 70})}};
};
event('mousemove', point);
event('mousemove', point);
flush();
assert.equal(hoverRefreshes, 1, 'Hover refreshes course details once per frame');
assert.equal(visible(), true, 'Chart hover opens the shared HTML tooltip');
assert.equal(tip.classList.contains('cce-chart-popup'), true);
event('mousemove', point);
flush();
assert.equal(hoverRefreshes, 1, 'Unchanged native content does not rebuild the visible card');
nativeChartTip.textContent = 'Course B';
event('mousemove', point);
flush();
assert.equal(hoverRefreshes, 2, 'An async update on the same point refreshes the authoritative card');
assert.ok(tip.textContent.includes('Course B'));

event('click', point);
flush();
event('mouseout', tip);
flush();
assert.equal(visible(), true, 'A pinned chart stays visible after pointer leave');
event('click', point);
event('mouseout', tip);
flush();
assert.equal(visible(), false, 'Unpinning restores normal hover dismissal');
event('click', point);
event('click', element());
flush();
assert.equal(visible(), false, 'An outside click cancels pending chart opening');
event('click', point);
flush();
handlers.get('keydown')({ key: 'Escape' });
assert.equal(visible(), false, 'Escape closes chart details');
console.log('  Chart hover, pinning, outside dismissal, and cancellation checks passed.');

let restoredTitle, restoredText;
const originalParent = {
  querySelector: () => null,
  appendChild(title) { restoredTitle = title.textContent; },
  replaceChild(text) { restoredText = text.textContent; }
};
context.document = {
  dispatchEvent() {}, createTextNode: renderDoc.createTextNode,
  body: { normalize() {} },
  querySelectorAll(selector) { return selector.includes('data-cce-done') ? [{
    dataset: { cceMatch: 'CSE…', cceOriginalTitle: 'CSE 3711 (A)' },
    parentNode: originalParent, ownerDocument: renderDoc
  }] : []; }
};
context.Event = class {};
context.PROCESSED_ATTR = 'data-cce-done';
vm.runInContext(source.slice(source.indexOf('  function clearInlineLayoutMarkers('), source.indexOf('  // Builds the inline expansion DOM')) + source.slice(source.indexOf('  function undecorateAll('),
  source.indexOf('  if (chrome?.storage?.local?.get)')), context);
context.undecorateAll();
assert.equal(restoredText, 'CSE…');
assert.equal(restoredTitle, 'CSE 3711 (A)', 'Restore native titles so truncated labels can be decoded after mode changes');
console.log('  Truncated chart label restoration checks passed.');

const unknownInline = domNode('span');
context.document = renderDoc;
context.buildInlineDom('CSE 1000', {name: 'Example', exam: 'Schedule Pending / TBA', prereq: 'Prerequisites not listed'}, unknownInline);
assert.equal(unknownInline.children[1].textContent, 'Exam:Not listed in catalog');
assert.equal(unknownInline.children[2].textContent, 'Prerequisites:Not listed in catalog');

vm.runInContext(source.slice(source.indexOf('  function chartHistoryLines('), source.indexOf('  function buildChartTooltipDom(')), context);
function historyText(value) { return {nodeType: 3, nodeValue: value}; }
function historySpan(attrs, children) { return {nodeType: 1, hasAttribute: key => key in attrs, childNodes: children}; }
const sourceText = historySpan({}, [
  historySpan({'data-cce-key': 'CSE 3421'}, [historyText('A very long expanded prerequisite list')]),
  historySpan({x: 8, dy: 16}, [historyText('Remaining: '), historySpan({}, [historyText('21 (88%)')])]),
  historySpan({x: 8, dy: 16}, [historyText('Absent: 0 (0%)')]),
  historySpan({x: 8, dy: 16}, [historyText('Present: 3 (13%)')])
]);
assert.deepEqual(Array.from(context.chartHistoryLines(sourceText)), ['Remaining: 21 (88%)', 'Absent: 0 (0%)', 'Present: 3 (13%)']);

const chartDoc = {
  createElement(tag) {
    const node = domNode(tag);
    node.ownerDocument = chartDoc;
    node.insertBefore = (child, before) => node.children.splice(node.children.indexOf(before), 0, child);
    return node;
  }
};
const chartContainer = chartDoc.createElement('div');
vm.runInContext(source.slice(source.indexOf('  function buildTooltipDom('), source.indexOf('  function buildInlineDom(')) +
  source.slice(source.indexOf('  function buildChartTooltipDom('), source.indexOf('  // Keep the tooltip inside the viewport')), context);
const marker = {dataset: {cceKey: 'CSE 3421', cceMatch: 'CSE 3421', cceAfter: ' (E)'}};
const chartContent = context.buildChartTooltipDom({querySelector: selector => selector === 'text' ? sourceText : marker}, chartContainer);
assert.notEqual(chartContent.details, chartContent.history, 'History is outside the scrollable course details');
assert.equal(chartContainer.children[1], chartContent.history);
assert.deepEqual(chartContent.history.children.map(row => row.dataset.status), ['remaining', 'absent', 'present']);
assert.deepEqual(chartContent.history.children.map(row => row.children[1].textContent), ['21 (88%)', '0 (0%)', '3 (13%)']);
assert.equal(chartContent.details.children[0].textContent, 'CSE 3421 (E)');
console.log('  Chart history colors and independent footer structure checks passed.');

const innerRow = domNode('tr');
const outerRow = domNode('tr');
const cell = domNode('td');
const cellStyle = {maxHeight: 'none', overflowY: 'visible'};
cell.ownerDocument = {defaultView: {getComputedStyle: () => cellStyle}};
cell.closest = () => innerRow;
const normalParent = {closest: selector => selector.startsWith('td, th') ? cell : null};
const normalWrap = domNode('span');
context.prepareInlineLayout(normalWrap, normalParent, {exam: 'Day 5'});
assert.equal(normalWrap.dataset.cceCompact, undefined);
assert.equal(innerRow.attrs['data-cce-inline-row'], '1');
assert.equal(outerRow.attrs['data-cce-inline-row'], undefined, 'Only the nearest course row gets routine spacing');
assert.equal(cell.attrs['data-cce-inline-cell'], '1');
const gridParent = {closest: selector => selector.includes("[role='gridcell']") ? cell : null};
const compactWrap = domNode('span');
compactWrap.setAttribute('title', 'Old native title');
context.prepareInlineLayout(compactWrap, gridParent, {exam: 'Day 5'});
context.document = renderDoc;
context.buildInlineDom('CSE 3421', {name: 'Software Engineering', exam: 'Day 5', prereq: 'CSE 3411'}, compactWrap);
assert.equal(compactWrap.dataset.cceCompact, '1');
assert.equal(compactWrap.children.length, 1, 'Fixed cells contain only the compact course title');
assert.ok(compactWrap.textContent.includes('Software Engineering'));
assert.equal(compactWrap.attrs.title, undefined, 'Compact cells use the full styled tooltip instead of duplicate native titles');
assert.equal(compactWrap.attrs.tabindex, '0', 'Compact content remains keyboard reachable');
cellStyle.maxHeight = '32px';
const boundedWrap = domNode('span');
context.prepareInlineLayout(boundedWrap, normalParent, {});
assert.equal(boundedWrap.dataset.cceCompact, '1', 'Bounded ordinary cells also use compact content');
context.clearInlineLayoutMarkers({querySelectorAll: () => [cell, innerRow]});
assert.equal(cell.attrs['data-cce-inline-cell'], undefined);
assert.equal(innerRow.attrs['data-cce-inline-row'], undefined);
console.log('  Compact fixed cells, nearest-row scoping, and layout cleanup checks passed.');

const fullInlineData = {name: 'Software Engineering', credits: 3, exam: 'Day 5', prereq: 'System Analysis and Design (CSE 3411)', inlinePrereq: 'CSE 3411'};
const extraInline = context.inlineTooltipData(fullInlineData, false);
assert.equal(extraInline.credits, 3);
assert.equal(extraInline.prereq, fullInlineData.prereq);
assert.equal(extraInline.name, undefined, 'Ordinary Inline popups do not repeat the visible name');
assert.equal(extraInline.exam, undefined, 'Ordinary Inline popups do not repeat visible exam details');
assert.equal(context.inlineTooltipData(fullInlineData, true), fullInlineData, 'Compact cells retain full tooltip details');
const noExtra = context.inlineTooltipData({name: 'Example', prereq: 'No prerequisites', inlinePrereq: ''}, false);
assert.ok(!noExtra.credits && !noExtra.prereq, 'No additional facts means no redundant popup');
cellStyle.maxHeight = 'none';
const expandedWithDetails = domNode('span');
context.prepareInlineLayout(expandedWithDetails, normalParent, fullInlineData);
assert.equal(expandedWithDetails.dataset.cceInlineDetails, '1');
assert.equal(expandedWithDetails.attrs.tabindex, '0');
context.prepareInlineLayout(expandedWithDetails, normalParent, {name: 'Example'});
assert.equal(expandedWithDetails.dataset.cceInlineDetails, undefined);
assert.equal(expandedWithDetails.attrs.tabindex, undefined, 'Removing extra facts removes the unused tab stop');
expandedWithDetails.setAttribute('title', 'Old native tooltip');
context.document = renderDoc;
context.buildInlineDom('CSE 3421', fullInlineData, expandedWithDetails);
assert.equal(expandedWithDetails.attrs.title, undefined, 'Expanded Inline removes the old native tooltip too');
console.log('  Additional-only Inline tooltip checks passed.');

const aliasCourses = {'CSE 3712': {key: 'CSE 3712', name: 'Computer Networks Laboratory'}, 'EEE 4414': {key: 'EEE 4414', name: 'Computer Networks Laboratory'}, 'CSE 1000': {key: 'CSE 1000', name: 'Introduction'}};
context.courseRegex = /CSE 3712|EEE 4414|CSE 1000/g;
context.resolve = code => aliasCourses[code] || null;
function presentationFor(text, sheet = false) {
  const root = {nodeType: 1, hasAttribute: () => false, ownerDocument: {location: {hostname: 'example.test', pathname: '/courses'}}, closest: selector => selector.startsWith('.waffle') ? (sheet ? root : null) : root};
  const node = {nodeType: 3, nodeValue: text, parentElement: root};
  root.childNodes = [node];
  return context.inlinePresentations(node);
}
let aliases = presentationFor('CSE 3712 / EEE 4414');
assert.equal(aliases.get(0).alias, true);
assert.equal(aliases.get(0).omitName, true, 'Earlier slash aliases do not repeat the name');
assert.equal(aliases.get(11).alias, true);
assert.equal(aliases.get(11).omitName, false, 'Last alias retains the shared name');
aliases = presentationFor('CSE 3712 / CSE 1000');
assert.equal(aliases.get(0).alias, false, 'Different course names remain separate');
aliases = presentationFor('CSE 3712 / EEE 4414: Computer Networks Laboratory');
assert.equal(aliases.get(0).omitName, true);
assert.equal(aliases.get(11).omitName, true, 'Existing native names are not inserted again');
assert.equal(presentationFor('CSE 3712 / EEE 4414', true).size, 0, 'Sheet-type markup is excluded');
const sheetParent = {ownerDocument: {location: {hostname: 'docs.google.com', pathname: '/spreadsheets/d/example/pubhtml'}}, closest: () => null};
assert.equal(context.isSheetContext(sheetParent), true);
const aliasWrap = domNode('span');
aliasWrap.dataset.cceAlias = '1'; aliasWrap.dataset.cceOmitName = '1';
context.buildInlineDom('CSE 3712', {name: 'Computer Networks Laboratory', exam: 'Day 5'}, aliasWrap);
assert.equal(aliasWrap.textContent.trim(), 'CSE 3712', 'Alias labels retain their own codes without repeated metadata');
console.log('  Slash aliases, existing names, and Sheets exclusion checks passed.');

assert.equal(presentationFor('CSE 3712: Computer Networks LaboratoryII').get(0).omitName, false, 'A name prefix is not mistaken for the full existing course name');
