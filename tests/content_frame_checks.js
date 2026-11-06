// Exercise fallback ownership using the production frame lifecycle helpers.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('content.js', 'utf8');
const main = {};
const frames = new Map();
const processed = [];
const cleaned = [];
const observed = [];
let restarts = 0;
const context = vm.createContext({document: main, frameDocuments: frames, enabled: true, courseRegex: /CSE/g,
  observer: {observe: node => observed.push(node)},
  injectStylesIntoDoc() {}, attachTooltipListeners() {}, normalizeCourseSplits() {}, hookSameOriginIframes() {},
  processNode: node => processed.push(node), undecorateAll: doc => cleaned.push(doc), startObserver: () => restarts++});
vm.runInContext(source.slice(source.indexOf('  function managedDocuments('),
  source.indexOf('  function hookSameOriginIframes(')), context);
const first = {body: {}};
const frame = {isConnected: true, contentDocument: first, contentWindow: {}};
context.processSameOriginIframe(frame);
context.processSameOriginIframe(frame);
assert.deepEqual(processed, [first.body], 'Repeated fallback discovery processes a document once');
assert.deepEqual(observed, [first.body], 'Fallback uses the existing observer');
assert.deepEqual(Array.from(context.managedDocuments()), [main, first]);
let childReads = 0;
vm.runInNewContext(source, {document: first, window: frame.contentWindow, chrome: {
  runtime: {id: 'frame-test'}, storage: {local: {get: () => childReads++}}
}});
assert.equal(childReads, 0, 'A later independent injection does not initialize a fallback-owned frame');
const independent = {isConnected: true, contentDocument: {body: {}},
  contentWindow: {__UIU_COURSE_DECODER_INJECTED__: true}};
context.processSameOriginIframe(independent);
assert.equal(frames.has(independent), false, 'Already injected frames retain their own controller');
const second = {body: {}};
frame.contentDocument = second;
context.processSameOriginIframe(frame);
assert.deepEqual(cleaned, [first], 'Navigation retires the old document even when the Window is reused');
assert.equal(restarts, 1, 'Navigation disconnects the old observer root');
assert.deepEqual(processed, [first.body, second.body]);
frame.isConnected = false;
assert.deepEqual(Array.from(context.managedDocuments()), [main], 'Removed frames leave the owned-document registry');
assert.deepEqual(cleaned, [first, second]);
assert.equal(frame.contentWindow.__UIU_COURSE_DECODER_INJECTED__, undefined, 'Retiring a live document releases fallback ownership');
frame.isConnected = true;
context.processSameOriginIframe(frame);
assert.equal(frames.get(frame), second, 'Reattaching the same document can claim ownership again');
assert.deepEqual(processed, [first.body, second.body, second.body]);
// Rediscovery must process the current document even when the load listener already exists.
vm.runInContext(source.slice(source.indexOf('  function hookSameOriginIframes('),
  source.indexOf('  // Tags whose text')), context);
const loadListeners = [];
frame.dataset = {};
frame.addEventListener = (type, listener) => { assert.equal(type, 'load'); loadListeners.push(listener); };
context.setTimeout = callback => callback();
const root = {querySelectorAll: () => [frame]};
context.hookSameOriginIframes(root);
context.enabled = false;
const third = {body: {}};
frame.contentDocument = third;
loadListeners[0]();
assert.equal(frames.get(frame), second, 'Navigation while disabled does not claim the new document');
context.managedDocuments();
context.enabled = true;
context.hookSameOriginIframes(root);
context.hookSameOriginIframes(root);
assert.equal(frames.get(frame), third, 'Re-enabling discovers the current document of an already hooked frame');
assert.equal(processed.filter(node => node === third.body).length, 1, 'Rediscovery processes the replacement once');
assert.equal(loadListeners.length, 1, 'Rediscovery keeps one load listener');
console.log('  Frame ownership, repeated injection, navigation and removal checks passed.');
