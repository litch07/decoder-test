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
  enabled: true, themePreference: 'dark',
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

// Render the actual inline and SVG builders, including long prerequisite text.
function domNode(tag) {
  return {
    tagName: tag, children: [], dataset: {}, attrs: {},
    appendChild(child) { this.children.push(child); return child; },
    removeChild(child) { this.children.splice(this.children.indexOf(child), 1); },
    get firstChild() { return this.children[0] || null; },
    setAttribute(key, value) { this.attrs[key] = value; },
    get textContent() { return this.value || this.children.map(child => child.textContent).join(''); },
    set textContent(value) { this.value = value; this.children = []; }
  };
}
const renderDoc = {
  createElement: domNode, createElementNS: (ns, tag) => domNode(tag),
  createTextNode: text => ({ textContent: text })
};
context.document = renderDoc;
vm.runInContext(source.slice(source.indexOf('  function buildInlineDom('), source.indexOf('  function buildExtendedData(')) +
  source.slice(source.indexOf('  function splitTextToLines('), source.indexOf('  function updateAllDecoratedElements(')), context);
const inline = domNode('span');
inline.dataset.cceSuffix = ' (E)';
context.buildInlineDom('CSE 3421', { name: 'Software Engineering', exam: 'Day 5, Slot T1',
  prereq: 'System Analysis and Design (CSE 3411)', inlinePrereq: 'CSE 3411' }, inline);
assert.ok(inline.children[0].textContent.endsWith(' (E)'), 'Section stays beside the course title');
assert.equal(inline.children[2].textContent, 'Prerequisites:CSE 3411', 'Routine rows use compact prerequisite codes');
assert.equal(inline.children.some(child => child.tagName === 'br'), false, 'Layout uses rows instead of forced breaks');
const svg = domNode('tspan'); svg.ownerDocument = renderDoc;
context.renderSvgTooltip(svg, '', 'CSE 3421', ' (E)', { name: 'Software Engineering',
  exam: 'Day 5, Slot T1', prereq: 'System Analysis and Design (CSE 3411), Structured Programming (CSE 1111)' });
assert.equal(svg.children[0].textContent.trim(), 'CSE 3421 (E)');
assert.equal(svg.children[1].textContent.trim(), 'Software Engineering');
assert.ok(svg.children.length > 4, 'Long prerequisites wrap across SVG lines');
assert.ok(svg.children.slice(1).every(child => child.attrs.dy), 'Added SVG lines have explicit spacing');
console.log('  Inline routine and chart detail rendering checks passed.');

const nativeChartTip = {};
const chart = { isConnected: true, querySelector: () => nativeChartTip };
const point = element();
point.closest = selector => selector.includes('highcharts-container') ? chart : point;
let hoverRefreshes = 0;
context.processNode = () => { hoverRefreshes++; };
context.requestAnimationFrame = fn => context.setTimeout(fn);
context.buildChartTooltipDom = (native, target) => {
  target.textContent = 'Chart attendance';
  return {details: {style: {}}, history: {style: {}, getBoundingClientRect: () => ({height: 70})}};
};
event('mousemove', point);
event('mousemove', point);
flush();
assert.equal(hoverRefreshes, 1, 'Hover refreshes course details once per frame');
assert.equal(visible(), true, 'Chart hover opens the shared HTML tooltip');
assert.equal(tip.classList.contains('cce-chart-popup'), true);
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
vm.runInContext(source.slice(source.indexOf('  function undecorateAll('),
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

const detailRow = svg.children.find(child => child.attrs.class === 'cce-chart-row');
assert.equal(detailRow.children[0].attrs.x, '8');
assert.equal(detailRow.children[1].attrs.x, '96', 'Chart values align in their own column');

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
