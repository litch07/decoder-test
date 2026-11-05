// test_content_script_resilience.js — Verification test suite for content script context resilience & reload safety

const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log("==================================================");
console.log("  RUNNING CONTENT SCRIPT RESILIENCE TEST SUITE    ");
console.log("==================================================\n");

// 1. Static Verification: Top-Level Defensive Guards
console.log("[TEST 1] Static Verification: Top-Level Context Guard");
const contentJsCode = fs.readFileSync('content.js', 'utf8');

assert.ok(
  contentJsCode.includes('typeof chrome === "undefined"') ||
  contentJsCode.includes("typeof chrome === 'undefined'"),
  "content.js must check if chrome is undefined at top level"
);
assert.ok(
  contentJsCode.includes('!chrome.runtime') && contentJsCode.includes('!chrome.runtime.id'),
  "content.js must check chrome.runtime and chrome.runtime.id at top level"
);
assert.ok(
  contentJsCode.includes('!chrome.storage') && contentJsCode.includes('!chrome.storage.local'),
  "content.js must check chrome.storage and chrome.storage.local at top level"
);
console.log("  ✓ content.js includes comprehensive top-level context guard\n");

// 2. Static Verification: Safe Storage Access
console.log("[TEST 2] Static Verification: Safe Storage Invocation & Event Binding");
assert.ok(
  contentJsCode.includes('chrome?.storage?.local?.get') ||
  contentJsCode.includes('chrome.storage && chrome.storage.local'),
  "content.js must defensively verify chrome.storage.local.get before calling"
);
assert.ok(
  contentJsCode.includes('chrome?.storage?.onChanged?.addListener') ||
  contentJsCode.includes('chrome.storage && chrome.storage.onChanged'),
  "content.js must defensively verify chrome.storage.onChanged.addListener before calling"
);
assert.ok(
  contentJsCode.includes('chrome.runtime?.lastError') ||
  contentJsCode.includes('chrome.runtime.lastError'),
  "content.js must check chrome.runtime.lastError in storage callback"
);
console.log("  ✓ content.js guards storage get and onChanged bindings against undefined errors\n");

// 3. Static Verification: Background Tab Update Timing
console.log("[TEST 3] Static Verification: Background Injection Timing");
const backgroundJsCode = fs.readFileSync('background.js', 'utf8');

assert.ok(
  backgroundJsCode.includes('if (changeInfo.status !== "complete") return;') ||
  backgroundJsCode.includes("if (changeInfo.status !== 'complete') return;"),
  "background.js must only inject on complete status to prevent unready iframe crashes"
);
console.log("  ✓ background.js tab update listener injects strictly on complete status\n");

// 4. Runtime Simulation: Undefined Storage Resilience
console.log("[TEST 4] Runtime Simulation: Execution with Undefined / Invalid Storage");

function createMockWindow() {
  const doc = {
    contentType: 'text/html',
    location: { pathname: '/Security/StudentHome.aspx' },
    body: {
      querySelectorAll: () => [],
      normalize: () => {},
      childNodes: []
    },
    documentElement: {
      querySelectorAll: () => [],
      normalize: () => {}
    },
    querySelectorAll: () => [],
    createElement: () => ({ style: {}, setAttribute: () => {}, dataset: {} }),
    createTextNode: (t) => ({ textContent: t })
  };

  return {
    document: doc,
    window: {
      location: { hostname: 'ucam.uiu.ac.bd', pathname: '/Security/StudentHome.aspx' },
      __UIU_COURSE_DECODER_INJECTED__: undefined
    },
    location: { hostname: 'ucam.uiu.ac.bd', pathname: '/Security/StudentHome.aspx' },
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    Node: { ELEMENT_NODE: 1, TEXT_NODE: 3 },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: (id) => clearTimeout(id)
  };
}

// Scenario A: chrome is completely undefined
assert.doesNotThrow(() => {
  const sandbox = createMockWindow();
  vm.createContext(sandbox);
  vm.runInContext(contentJsCode, sandbox);
}, "content.js must not throw when chrome is undefined");
console.log("  ✓ Scenario A: Passed without error when chrome is undefined");

// Scenario B: chrome exists but chrome.storage is undefined (the reported crash)
assert.doesNotThrow(() => {
  const sandbox = createMockWindow();
  sandbox.chrome = {
    runtime: { id: "test-extension-id" }
    // chrome.storage is intentionally undefined
  };
  vm.createContext(sandbox);
  vm.runInContext(contentJsCode, sandbox);
}, "content.js must not throw when chrome.storage is undefined");
console.log("  ✓ Scenario B: Passed without error when chrome.storage is undefined");

// Scenario C: chrome.runtime.id is undefined (extension context invalidated upon reload)
assert.doesNotThrow(() => {
  const sandbox = createMockWindow();
  sandbox.chrome = {
    runtime: {}, // id is undefined
    storage: { local: {} }
  };
  vm.createContext(sandbox);
  vm.runInContext(contentJsCode, sandbox);
}, "content.js must not throw when chrome.runtime.id is undefined");
console.log("  ✓ Scenario C: Passed without error when extension context is invalidated");

// Scenario D: Valid environment executes init successfully
let getCalled = false;
let listenerAdded = false;
assert.doesNotThrow(() => {
  const sandbox = createMockWindow();
  sandbox.chrome = {
    runtime: { id: "test-extension-id", lastError: null },
    storage: {
      local: {
        get: (keys, cb) => {
          getCalled = true;
          cb({
            courses: { "CSE 1111": { name: "Structured Programming" } },
            mode: "highlight",
            allowedSites: ["ucam.uiu.ac.bd"]
          });
        }
      },
      onChanged: {
        addListener: () => {
          listenerAdded = true;
        }
      }
    }
  };
  vm.createContext(sandbox);
  vm.runInContext(contentJsCode, sandbox);
}, "content.js must execute cleanly in valid environment");
assert.ok(getCalled, "chrome.storage.local.get must be called in valid environment");
assert.ok(listenerAdded, "chrome.storage.onChanged.addListener must be registered in valid environment");
console.log("  ✓ Scenario D: Passed and correctly initialized in valid environment\n");

// 5. Zero-innerHTML Security Verification
console.log("[TEST 5] Zero-innerHTML Security Verification");
function getNonCommentLinesWithPattern(filepath, pattern) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split(/\r?\n/);
  return lines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return false;
    return pattern.test(line);
  });
}

const contentInnerHtml = getNonCommentLinesWithPattern('content.js', /innerHTML|insertAdjacentHTML/);
assert.strictEqual(contentInnerHtml.length, 0, `content.js must have 0 innerHTML calls, found: ${contentInnerHtml.length}`);
console.log("  ✓ content.js verified 100% compliant with Zero-innerHTML security guarantee\n");

console.log("==================================================");
console.log("  ALL RESILIENCE TESTS PASSED (5 / 5)            ");
console.log("==================================================");


require('./tooltip_interaction_checks');
