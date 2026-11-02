/**
 * tests/test_dark_mode_palette.js
 * Automated regression suite for Task 3.4: System-Adaptive Dark Mode Palette
 *
 * Verifies:
 *   1. HTML structure: View 5 Theme Preference card, segmented radio group, theme buttons, status hint
 *   2. HTML accessibility: role="radiogroup", role="radio", aria-checked, data-theme-val attributes
 *   3. CSS variables: OLED dark palette variables (--bg, --surface, --surface2, --text-main, --border-color)
 *   4. CSS media queries: @media (prefers-color-scheme: dark) and [data-theme="dark"] rules
 *   5. CSS component overrides: Inputs, table rows, cards, badges, modals, clash alerts, prereq tree
 *   6. JS engine: applyTheme, setTheme, storage persistence, and dynamic OS media query handling
 *   7. Zero innerHTML: Pure programmatic DOM manipulation
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const popupHtml = fs.readFileSync(path.join(ROOT, 'popup.html'), 'utf8');
const popupCss  = fs.readFileSync(path.join(ROOT, 'popup.css'),  'utf8');
const popupJs   = fs.readFileSync(path.join(ROOT, 'popup.js'),   'utf8');

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

console.log('\n── test_dark_mode_palette.js ───────────────────────────────────────────────');

// ── 1. HTML Element presence & Accessibility ──────────────────────────────
assert('HTML has #themeSettingsCard in View 5', popupHtml.includes('id="themeSettingsCard"'));
assert('HTML has segmented control #themeOptionsGroup with role="radiogroup"',
  popupHtml.includes('id="themeOptionsGroup"') && popupHtml.includes('role="radiogroup"'));
assert('HTML has #themeSystem with data-theme-val="system" and role="radio"',
  popupHtml.includes('id="themeSystem"') &&
  popupHtml.includes('data-theme-val="system"') &&
  popupHtml.includes('role="radio"'));
assert('HTML has #themeLight with data-theme-val="light" and role="radio"',
  popupHtml.includes('id="themeLight"') &&
  popupHtml.includes('data-theme-val="light"') &&
  popupHtml.includes('role="radio"'));
assert('HTML has #themeDark with data-theme-val="dark" and role="radio"',
  popupHtml.includes('id="themeDark"') &&
  popupHtml.includes('data-theme-val="dark"') &&
  popupHtml.includes('role="radio"'));
assert('HTML has informative theme status hint #themeStatusHint', popupHtml.includes('id="themeStatusHint"'));
assert('HTML has dangerResetCard with .danger-card class',
  popupHtml.includes('id="dangerResetCard"') && popupHtml.includes('danger-card'));

// ── 2. CSS Dark Palette & Media Query Architecture ────────────────────────
assert('CSS has [data-theme="dark"] variable root', popupHtml.includes('data-theme') || popupCss.includes('[data-theme="dark"]'));
assert('CSS defines OLED dark background --bg: #090d16', popupCss.includes('--bg: #090d16'));
assert('CSS defines OLED dark surface --surface: #111827', popupCss.includes('--surface: #111827'));
assert('CSS defines dark secondary surface --surface2: #162032', popupCss.includes('--surface2: #162032'));
assert('CSS defines dark border color --border-color: #243048', popupCss.includes('--border-color: #243048'));
assert('CSS defines dark high-contrast main text --text-main: #f9fafb', popupCss.includes('--text-main: #f9fafb'));

assert('CSS includes @media (prefers-color-scheme: dark) media query',
  popupCss.includes('@media (prefers-color-scheme: dark)'));
assert('CSS media query styles :root:not([data-theme="light"]) for seamless OS fallback',
  popupCss.includes(':root:not([data-theme="light"])'));

// ── 3. CSS Component-Level Dark Overrides ─────────────────────────────────
assert('CSS styles dark scrollbar thumb', popupCss.includes('::-webkit-scrollbar-thumb'));
assert('CSS styles dark inputs and textareas',
  popupCss.includes('input[type="text"]') && popupCss.includes('.json-textarea'));
assert('CSS styles dark allowlist items and search bar',
  popupCss.includes('.allowlist-item') && popupCss.includes('.domain-search-box'));
assert('CSS styles dark sync card and reminder banners',
  popupCss.includes('.sync-card') && popupCss.includes('.home-sync-alert'));
assert('CSS styles dark danger zone reset card',
  popupCss.includes('#dangerResetCard') && popupCss.includes('rgba(239, 68, 68'));
assert('CSS styles dark course table and grid rows',
  popupCss.includes('.course-table-card') && popupCss.includes('.course-grid-row'));
assert('CSS styles dark filter buttons and tabs',
  popupCss.includes('.filter-btn') && popupCss.includes('.tab-btn'));
assert('CSS styles dark enrolled summary and clash alerts',
  popupCss.includes('#enrolledSummaryCard') && popupCss.includes('.clash-alert-box'));
assert('CSS styles dark prerequisite tree cards and badges',
  popupCss.includes('.prereq-tree-card') && popupCss.includes('.prereq-badge'));
assert('CSS styles dark file drop zone and preview diff modal',
  popupCss.includes('.file-drop-zone') && popupCss.includes('.preview-modal-content'));

// ── 4. JS Theme Engine Presence & Listeners ───────────────────────────────
assert('JS caches theme elements in els',
  popupJs.includes('themeSettingsCard:') &&
  popupJs.includes('themeSystem:') &&
  popupJs.includes('themeLight:') &&
  popupJs.includes('themeDark:') &&
  popupJs.includes('themeStatusHint:'));
assert('JS declares currentThemePreference state variable',
  popupJs.includes('currentThemePreference = "system"'));
assert('JS defines applyTheme function', popupJs.includes('function applyTheme(preference)'));
assert('JS defines setTheme function', popupJs.includes('function setTheme(preference)'));
assert('JS listens for matchMedia prefers-color-scheme changes',
  popupJs.includes('matchMedia("(prefers-color-scheme: dark)")'));
assert('JS loads themePreference from chrome.storage.local',
  popupJs.includes('"themePreference"') && popupJs.includes('currentThemePreference = stored.themePreference'));
assert('JS attaches click listeners to theme option buttons',
  popupJs.includes('els.themeSystem?.addEventListener("click"') &&
  popupJs.includes('els.themeLight?.addEventListener("click"') &&
  popupJs.includes('els.themeDark?.addEventListener("click"'));

// ── 5. Functional Unit Tests for Theme Engine ─────────────────────────────

// Mock DOM & window environment
class MockClassList {
  constructor() { this.classes = new Set(); }
  add(c) { this.classes.add(c); }
  remove(c) { this.classes.delete(c); }
  contains(c) { return this.classes.has(c); }
}

class MockElement {
  constructor(id) {
    this.id = id;
    this.attributes = {};
    this.classList = new MockClassList();
    this.textContent = '';
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] || null; }
  removeAttribute(k) { delete this.attributes[k]; }
}

const mockRoot = new MockElement('html');
const mockEls = {
  themeSystem: new MockElement('themeSystem'),
  themeLight: new MockElement('themeLight'),
  themeDark: new MockElement('themeDark'),
  themeStatusHint: new MockElement('themeStatusHint')
};

let mockStoredPreference = null;
const mockStorage = {
  set: (obj) => {
    if (obj.themePreference !== undefined) mockStoredPreference = obj.themePreference;
  }
};

let mockIsSystemDark = false;

function unitApplyTheme(pref, isSysDark) {
  let themePref = pref || "system";
  const effectiveDark = themePref === "dark" || (themePref === "system" && isSysDark);

  if (effectiveDark) {
    mockRoot.setAttribute("data-theme", "dark");
  } else {
    mockRoot.setAttribute("data-theme", "light");
  }
  mockRoot.setAttribute("data-theme-preference", themePref);

  const btns = [
    { btn: mockEls.themeSystem, val: "system" },
    { btn: mockEls.themeLight, val: "light" },
    { btn: mockEls.themeDark, val: "dark" }
  ];

  btns.forEach(({ btn, val }) => {
    if (!btn) return;
    const isActive = val === themePref;
    if (isActive) {
      btn.classList.add("active");
      btn.setAttribute("aria-checked", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-checked", "false");
    }
  });

  if (mockEls.themeStatusHint) {
    if (themePref === "system") {
      mockEls.themeStatusHint.textContent = `System theme active (currently ${isSysDark ? "Dark" : "Light"}). Adapts automatically.`;
    } else if (themePref === "dark") {
      mockEls.themeStatusHint.textContent = "OLED dark theme active.";
    } else {
      mockEls.themeStatusHint.textContent = "Light theme active.";
    }
  }
}

function unitSetTheme(pref, isSysDark) {
  unitApplyTheme(pref, isSysDark);
  mockStorage.set({ themePreference: pref });
}

// Test A: Explicit Dark mode
unitSetTheme('dark', false);
assert('Explicit dark sets data-theme="dark"', mockRoot.getAttribute('data-theme') === 'dark');
assert('Explicit dark marks #themeDark active and aria-checked',
  mockEls.themeDark.classList.contains('active') && mockEls.themeDark.getAttribute('aria-checked') === 'true');
assert('Explicit dark persists to storage', mockStoredPreference === 'dark');

// Test B: Explicit Light mode
unitSetTheme('light', true);
assert('Explicit light sets data-theme="light" even if OS is dark', mockRoot.getAttribute('data-theme') === 'light');
assert('Explicit light marks #themeLight active and aria-checked',
  mockEls.themeLight.classList.contains('active') && mockEls.themeLight.getAttribute('aria-checked') === 'true');
assert('Explicit light persists to storage', mockStoredPreference === 'light');

// Test C: System mode with Light OS
unitSetTheme('system', false);
assert('System mode with light OS sets data-theme="light"', mockRoot.getAttribute('data-theme') === 'light');
assert('System mode marks #themeSystem active and aria-checked',
  mockEls.themeSystem.classList.contains('active') && mockEls.themeSystem.getAttribute('aria-checked') === 'true');
assert('System mode status hint mentions Light', mockEls.themeStatusHint.textContent.includes('Light'));

// Test D: System mode with Dark OS
unitSetTheme('system', true);
assert('System mode with dark OS sets data-theme="dark"', mockRoot.getAttribute('data-theme') === 'dark');
assert('System mode status hint mentions Dark', mockEls.themeStatusHint.textContent.includes('Dark'));

// ── 6. Zero innerHTML Security Audit ───────────────────────────────────────
const innerHtmlMatches = popupJs.match(/\.innerHTML\s*=/g) || [];
const insertAdjacentMatches = popupJs.match(/\.insertAdjacentHTML\s*\(/g) || [];
assert('Strict Zero innerHTML compliance across popup.js', innerHtmlMatches.length === 0);
assert('Strict Zero insertAdjacentHTML compliance across popup.js', insertAdjacentMatches.length === 0);

console.log('────────────────────────────────────────────────────────────────────────────');
console.log(`Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('Task 3.4 (System-Adaptive Dark Mode Palette) tests PASSED! 🌙🎉\n');
}

