// content.js — Finds UIU course codes on the page and adds their full names!

(function () {
  "use strict";

  // Guard against missing, restricted, or invalidated extension context.
  // In orphaned frames, restricted/sandboxed frames, or during extension reload,
  // extension APIs (chrome.runtime, chrome.storage) may be undefined.
  if (
    typeof chrome === "undefined" ||
    !chrome.runtime ||
    !chrome.runtime.id ||
    !chrome.storage ||
    !chrome.storage.local
  ) {
    return;
  }

  // Track the document: an iframe can replace its document while retaining its Window.
  if (window.__UIU_COURSE_DECODER_INJECTED__ === true || window.__UIU_COURSE_DECODER_INJECTED__ === document) return;
  window.__UIU_COURSE_DECODER_INJECTED__ = document;

  // Skip PDFs, our DOM scripts won't work there anyway
  if (document.contentType === "application/pdf") return;
  if (window.location.pathname.toLowerCase().endsWith(".pdf")) return;

  let courses = {};
  let courseRegex = null;
  let mode = "highlight";
  let showExamInfo = false;
  let showPrerequisites = false;
  let enabled = false;
  let observer = null;
  const frameDocuments = new Map();
  let injectedStyles = false;
  let themePreference = "system";

  // We tag processed elements so we don't end up checking them twice in a loop
  const PROCESSED_ATTR = "data-cce-done";

  // Build one big regex from all the course codes.
  // The flexible pattern makes sure "PHY1103" and "PHY  1103" both work!
  function buildRegex(courseMap) {
    const patterns = Object.keys(courseMap).map((code) => {
      const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const flexible = escaped.replace(/\s+/g, "[\\s]*");
      return `(?<![\\w-])${flexible}(?![\\w-])`;
    });
    return new RegExp(patterns.join("|"), "gi");
  }

  // Matches the text to a course, ignoring extra spaces
  function resolve(matched) {
    const upper = matched.toUpperCase().replace(/\s+/g, " ").trim();
    let courseData = courses[upper];
    let key = upper;

    if (!courseData) {
      const noSpace = upper.replace(/\s/g, "");
      for (const k of Object.keys(courses)) {
        if (k.replace(/\s/g, "") === noSpace) {
          courseData = courses[k];
          key = k;
          break;
        }
      }
    }

    if (!courseData) return null;

    const isObj = typeof courseData === "object" && courseData !== null;
    return {
      key: key,
      name: isObj ? courseData.name : courseData,
      credits: (isObj && courseData.credits) ? courseData.credits : null,
      examDay: (isObj && courseData.examDay) ? courseData.examDay : "",
      examSlot: (isObj && courseData.examSlot) ? courseData.examSlot : "",
      prerequisites: (isObj && courseData.prerequisites) ? courseData.prerequisites : [],
      prerequisiteNote: (isObj && courseData.prerequisiteNote) ? courseData.prerequisiteNote : ""
    };
  }

  // NOTE: escapeHtml, buildTooltipHtml, and buildInlineHtml have been removed.
  // Tooltip and inline content are now built with safe DOM APIs (buildTooltipDom / buildInlineDom).

  // Builds the tooltip DOM inside `container` using safe DOM APIs (no innerHTML).
  function buildTooltipDom(data, container) {
    const document = container.ownerDocument;
    const content = document.createElement("div");
    content.className = "cce-tooltip-content";

    if (data.name) {
      const nameDiv = document.createElement("div");
      nameDiv.className = "cce-tooltip-name";
      nameDiv.textContent = data.name;
      content.appendChild(nameDiv);
    }

    if (data.exam || data.prereq || data.credits) {
      const details = document.createElement("div");
      details.className = "cce-tooltip-details";

      if (data.credits) {
        const row = document.createElement("div");
        row.className = "cce-detail-row";
        const label = document.createElement("span");
        label.className = "cce-detail-label";
        label.textContent = "Credits:";
        const text = document.createElement("span");
        text.className = "cce-detail-text";
        text.textContent = String(data.credits) + " Cr";
        row.appendChild(label);
        row.appendChild(text);
        details.appendChild(row);
      }

      if (data.exam) {
        const row = document.createElement("div");
        row.className = "cce-detail-row";
        const label = document.createElement("span");
        label.className = "cce-detail-label";
        label.textContent = "Exam:";
        const text = document.createElement("span");
        text.className = "cce-detail-text";
        text.textContent = data.exam;
        row.appendChild(label);
        row.appendChild(text);
        details.appendChild(row);
      }

      if (data.prereq) {
        const row = document.createElement("div");
        row.className = "cce-detail-row";
        const label = document.createElement("span");
        label.className = "cce-detail-label";
        label.textContent = "Prerequisites:";
        const text = document.createElement("span");
        text.className = "cce-detail-text";
        text.textContent = data.prereq;
        row.appendChild(label);
        row.appendChild(text);
        details.appendChild(row);
      }

      content.appendChild(details);
    }

    container.appendChild(content);
    return content;
  }

  function clearInlineLayoutMarkers(doc) {
    doc.querySelectorAll("[data-cce-inline-cell], [data-cce-inline-row]").forEach(el => {
      el.removeAttribute("data-cce-inline-cell");
      el.removeAttribute("data-cce-inline-row");
    });
  }

  function inlineTooltipData(data, compact) {
    if (compact) return data;
    return {
      credits: data.credits || null,
      prereq: data.inlinePrereq && data.prereq !== data.inlinePrereq ? data.prereq : null
    };
  }

  function isSheetContext(parent) {
    const location = parent.ownerDocument && parent.ownerDocument.location;
    return !!(location && location.hostname === "docs.google.com" && location.pathname.startsWith("/spreadsheets/")) ||
      !!parent.closest(".waffle, .ritz, .docs-sheet-container");
  }

  function inlinePresentations(textNode) {
    const parent = textNode.parentElement;
    if (isSheetContext(parent)) return new Map();
    const root = parent.closest("h1, h2, h3, h4, h5, h6, td, th, p, li") || parent.closest("a") || parent;
    let original = "";
    let offset = 0;
    function visit(node) {
      if (node === textNode) offset = original.length;
      if (node.nodeType === 3) { original += node.nodeValue; return; }
      if (node.hasAttribute && node.hasAttribute(PROCESSED_ATTR)) {
        original += node.dataset.cceOriginal || node.dataset.cceMatch || "";
        return;
      }
      for (const child of node.childNodes || []) visit(child);
    }
    visit(root);
    const normalize = value => value.replace(/\s+/g, " ").trim().toLowerCase();
    const matches = [...original.matchAll(new RegExp(courseRegex.source, courseRegex.flags))]
      .map(match => ({index: match.index, end: match.index + match[0].length, course: resolve(match[0])}));
    const result = new Map();
    for (let i = 0; i < matches.length; i++) {
      const item = matches[i];
      if (!item.course) continue;
      const linked = other => other && other.course && normalize(other.course.name) === normalize(item.course.name) &&
        /^\s*\/\s*$/.test(original.slice(Math.min(item.end, other.end), Math.max(item.index, other.index)));
      const previous = linked(matches[i - 1]);
      const next = linked(matches[i + 1]);
      const escapedName = normalize(item.course.name).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const namePresent = new RegExp("(^|[^a-z0-9])" + escapedName + "($|[^a-z0-9])", "i").test(normalize(original));
      result.set(item.index - offset, {
        alias: !!(previous || next),
        omitName: !!next || namePresent
      });
    }
    return result;
  }

  function prepareInlineLayout(wrap, parent, data) {
    const cell = parent.closest("td, th, [role='cell'], [role='gridcell'], .grid-cell");
    const gridCell = parent.closest("[role='cell'], [role='gridcell'], .grid-cell");
    let compact = !!gridCell;
    if (cell && !compact) {
      const style = cell.ownerDocument.defaultView.getComputedStyle(cell);
      compact = (style.maxHeight !== "none" && Number.isFinite(parseFloat(style.maxHeight))) ||
        ["hidden", "clip", "scroll", "auto"].includes(style.overflowY);
    }
    if (compact) {
      wrap.dataset.cceCompact = "1";
    } else {
      delete wrap.dataset.cceCompact;
      if (cell) {
        cell.setAttribute("data-cce-inline-cell", "1");
        const row = cell.closest("tr");
        if (row && (data.exam || data.prereq)) row.setAttribute("data-cce-inline-row", "1");
      }
    }
    const bounded = !!cell && !compact && !isSheetContext(parent);
    if (bounded) wrap.dataset.cceBounded = "1";
    else delete wrap.dataset.cceBounded;
    const fullDetails = compact || wrap.dataset.cceAlias === "1";
    updateInlineTooltipAccess(wrap, parent, data, fullDetails);
  }

  function updateInlineTooltipAccess(wrap, parent, data, fullDetails) {
    const extra = inlineTooltipData(data, fullDetails);
    if (fullDetails || extra.credits || extra.prereq) {
      wrap.dataset.cceInlineDetails = "1";
      if (!parent.closest("a, button, input, select, textarea, [tabindex]")) wrap.setAttribute("tabindex", "0");
    } else {
      delete wrap.dataset.cceInlineDetails;
      wrap.removeAttribute("tabindex");
    }
  }

  function refreshBoundedInline(wrap, data) {
    if (wrap.dataset.cceBounded !== "1") return;
    const title = wrap.querySelector(".cce-inline-title");
    const clipped = title && title.scrollHeight > title.clientHeight + 1;
    updateInlineTooltipAccess(wrap, wrap.parentElement, data, !!clipped || wrap.dataset.cceAlias === "1");
  }

  function refreshInlineTitles(root) {
    for (const wrap of root.querySelectorAll('.cce-inline[data-cce-bounded="1"]')) {
      const resolved = resolve(wrap.dataset.cceKey);
      if (resolved) refreshBoundedInline(wrap, buildExtendedData(resolved));
    }
  }

  // Builds the inline expansion DOM inside `wrapEl` using safe DOM APIs (no innerHTML).
  function buildInlineDom(matchText, data, wrapEl) {
    wrapEl.removeAttribute("title");
    while (wrapEl.firstChild) wrapEl.removeChild(wrapEl.firstChild);

    const titleSpan = document.createElement("span");
    titleSpan.className = "cce-inline-title";

    const codeSpan = document.createElement("span");
    codeSpan.className = "cce-inline-code";
    codeSpan.textContent = matchText;
    titleSpan.appendChild(codeSpan);

    titleSpan.appendChild(document.createTextNode(" "));

    const nameSpan = document.createElement("span");
    nameSpan.className = "cce-inline-name";
    nameSpan.textContent = `(${data.name})`;
    if (wrapEl.dataset.cceOmitName !== "1") titleSpan.appendChild(nameSpan);

    wrapEl.appendChild(titleSpan);

    if (wrapEl.dataset.cceSuffix) {
      const section = document.createElement("span");
      section.className = "cce-inline-section";
      section.textContent = wrapEl.dataset.cceSuffix;
      titleSpan.appendChild(section);
    }
    if (wrapEl.dataset.cceCompact === "1" || wrapEl.dataset.cceAlias === "1") {
      return;
    }
    const rows = [["Exam", data.exam], ["Prerequisites", data.inlinePrereq || data.prereq]];
    for (const [labelText, value] of rows) {
      if (!value) continue;
      const row = document.createElement("span");
      row.className = "cce-inline-row";
      const label = document.createElement("span");
      label.className = "cce-inline-label";
      label.textContent = labelText + ":";
      const text = document.createElement("span");
      text.className = "cce-inline-value";
      text.textContent = value === "Prerequisites not listed" || value === "Schedule Pending / TBA"
        ? "Not listed in catalog" : value;
      row.appendChild(label);
      row.appendChild(text);
      wrapEl.appendChild(row);
    }
  }

  function buildExtendedData(resolved) {
    let data = {
      name: resolved.name,
      credits: resolved.credits || null,
      exam: null,
      prereq: null
    };

    if (showExamInfo) {
      const lowerDay = (resolved.examDay || "").trim().toLowerCase();
      if (lowerDay === "in-class") {
        data.exam = "In-Class Evaluation";
      } else if (resolved.examDay || resolved.examSlot) {
        let examParts = [];
        if (resolved.examDay) examParts.push(resolved.examDay);
        if (resolved.examSlot) examParts.push("Slot " + resolved.examSlot);
        data.exam = examParts.join(", ");
      } else {
        data.exam = "Schedule Pending / TBA";
      }
    }

    if (showPrerequisites) {
      let decodedPrereqs = [];
      const hasExplicitNone = (resolved.prerequisites && resolved.prerequisites.length === 1 && resolved.prerequisites[0].toLowerCase() === "none");
      if (resolved.prerequisites && resolved.prerequisites.length > 0 && !hasExplicitNone) {
        for (const pCode of resolved.prerequisites) {
          if (pCode.toLowerCase() === "none") continue;
          const pResolved = resolve(pCode);
          if (pResolved && pResolved.name) {
            decodedPrereqs.push(pResolved.name + " (" + pCode + ")");
          } else {
            decodedPrereqs.push(pCode);
          }
        }
      }
      data.inlinePrereq = (resolved.prerequisites || []).filter(code => code.toLowerCase() !== "none").join(", ");
      if (resolved.prerequisiteNote) {
        data.inlinePrereq += (data.inlinePrereq ? " · " : "") + resolved.prerequisiteNote;
      }
      let prereqText = decodedPrereqs.join(", ");
      if (resolved.prerequisiteNote) {
        prereqText = prereqText ? (prereqText + " (" + resolved.prerequisiteNote + ")") : resolved.prerequisiteNote;
      }

      if (hasExplicitNone) {
        data.prereq = "No prerequisites";
      } else if (prereqText) {
        data.prereq = prereqText;
      } else {
        data.prereq = "Prerequisites not listed";
      }
    }
    return data;
  }

  // buildTooltipHtml and buildInlineHtml removed — replaced by buildTooltipDom/buildInlineDom

  function updateAllDecoratedElements(doc = document) {
    clearInlineLayoutMarkers(doc);
    doc.querySelectorAll(`[${PROCESSED_ATTR}="1"]`).forEach(wrap => {
      const key = wrap.dataset.cceKey;
      if (!key) return;
      const resolved = resolve(key);
      if (!resolved) return;

      const data = buildExtendedData(resolved);
      const matchText = wrap.dataset.cceMatch;

      if (wrap.classList.contains("cce-inline")) {
        prepareInlineLayout(wrap, wrap.parentElement, data);
        buildInlineDom(matchText, data, wrap);
        refreshBoundedInline(wrap, data);
      }
    });
  }

  // Checks if the extension should run on this site.
  // We also check ancestor frames to make sure it works inside iframes (like embedded google sheets)!
  function isHostAllowed(host, allowedSites) {
    const matches = (h) => {
      if (!h) return false;
      const target = h.toLowerCase().trim();
      return (allowedSites || []).some((pattern) => {
        if (!pattern) return false;
        const p = pattern.toLowerCase().trim();
        if (target === p) return true;
        if (p.startsWith("*.")) {
          const baseDomain = p.slice(2);
          if (target === baseDomain || target.endsWith("." + baseDomain)) return true;
        }
        if (target.endsWith("." + p)) return true;
        const re = "^" + p.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
        try {
          return new RegExp(re, "i").test(target);
        } catch (_) {
          return false;
        }
      });
    };

    if (matches(host)) return true;

    // Check ancestor frames for cross-origin iframes
    if (typeof window !== "undefined" && window.location && window.location.ancestorOrigins) {
      for (let i = 0; i < window.location.ancestorOrigins.length; i++) {
        try {
          const origin = window.location.ancestorOrigins[i];
          if (origin && origin !== "null") {
            if (matches(new URL(origin).hostname)) return true;
          }
        } catch (e) { }
      }
    }

    // Same-origin fallback
    try {
      if (typeof window !== "undefined" && window !== window.top && window.top.location && window.top.location.hostname) {
        if (matches(window.top.location.hostname)) return true;
      }
    } catch (e) { }

    return false;
  }

  // Inject CSS once per page. We use one shared tooltip <div> that we move
  // around with JS instead of creating one tooltip per element (much faster!)
  function injectStyles() {
    if (injectedStyles) return;
    injectedStyles = true;

    const style = document.createElement("style");
    style.id = "cce-custom-styles";
    style.textContent = `
      .cce-tooltip-wrap {
        position: relative;
        display: inline;
        cursor: help;
        border-bottom: 1px dotted #b96a30;
        color: inherit;
      }
      .cce-highlight {
        position: relative;
        display: inline;
        cursor: help;
        background-color: rgba(217, 119, 6, 0.16);
        color: inherit;
        padding: 0;
        border-radius: 3px;
        font: inherit;
        letter-spacing: inherit;
        box-decoration-break: clone;
        -webkit-box-decoration-break: clone;
      }
      .cce-highlight:hover, .cce-highlight:focus-visible { background-color: rgba(217, 119, 6, 0.24); }
      svg .cce-highlight { background: none; }
      .cce-tooltip-wrap:hover, .cce-tooltip-wrap:focus-visible {
        border-bottom-style: solid;
      }
      .cce-tooltip-wrap:focus-visible, .cce-highlight:focus-visible {
        outline: 2px solid #bc713d;
        outline-offset: 3px;
        border-radius: 2px;
      }
      .cce-global-tooltip {
        all: initial;
        --cce-tip-bg: #ffffff;
        --cce-tip-text: #182334;
        --cce-tip-muted: #526174;
        --cce-tip-border: #d7dfe9;
        --cce-tip-accent: #945021;
        --cce-status-remaining: #245cb8;
        --cce-status-absent: #b4233a;
        --cce-status-present: #16744b;
        visibility: hidden;
        opacity: 0;
        position: fixed;
        z-index: 2147483647;
        box-sizing: border-box;
        width: max-content;
        max-width: min(300px, calc(100vw - 24px));
        padding: 12px 14px;
        border: 1px solid var(--cce-tip-border);
        border-radius: 9px;
        background: var(--cce-tip-bg);
        color: var(--cce-tip-text);
        font: 13px/1.5 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        text-align: left;
        overflow-wrap: anywhere;
        box-shadow: 0 3px 8px #0000000d, 0 8px 24px #00000014;
        transition: opacity 120ms ease, visibility 120ms ease;
        pointer-events: none;
      }
      .cce-global-tooltip[data-theme="dark"] {
        --cce-tip-bg: #1c2534;
        --cce-tip-text: #e6ebf2;
        --cce-tip-muted: #b0bdce;
        --cce-tip-border: #45536a;
        --cce-tip-accent: #edb48b;
        --cce-status-remaining: #9fc2ff;
        --cce-status-absent: #ffadb5;
        --cce-status-present: #8dd8b0;
      }
      @media (prefers-color-scheme: dark) {
        .cce-global-tooltip[data-theme="system"] {
          --cce-tip-bg: #1c2534;
          --cce-tip-text: #e6ebf2;
          --cce-tip-muted: #b0bdce;
          --cce-tip-border: #45536a;
          --cce-tip-accent: #edb48b;
        --cce-status-remaining: #9fc2ff;
        --cce-status-absent: #ffadb5;
        --cce-status-present: #8dd8b0;
        }
      }
      .cce-global-tooltip.cce-visible {
        visibility: visible;
        opacity: 1;
        pointer-events: auto;
      }
      .cce-global-tooltip::after {
        content: "";
        position: absolute;
        left: var(--cce-arrow-left, 50%);
        width: 6px;
        height: 6px;
        background: var(--cce-tip-bg);
        transform: translateX(-50%) rotate(45deg);
      }
      .cce-global-tooltip[data-placement="above"]::after {
        bottom: -4px;
        border-right: 1px solid var(--cce-tip-border);
        border-bottom: 1px solid var(--cce-tip-border);
      }
      .cce-global-tooltip[data-placement="below"]::after {
        top: -4px;
        border-left: 1px solid var(--cce-tip-border);
        border-top: 1px solid var(--cce-tip-border);
      }
      .cce-tooltip-content { display: grid; gap: 9px; }
      .cce-tooltip-name { font-size: 14px; font-weight: 600; line-height: 1.4; color: var(--cce-tip-text); }
      .cce-tooltip-details { display: grid; gap: 6px; }
      .cce-detail-row {
        display: grid;
        grid-template-columns: 84px minmax(0, 1fr);
        align-items: baseline;
        gap: 8px;
        font-size: 12px;
        line-height: 1.5;
      }
      .cce-detail-label { font-weight: 500; color: var(--cce-tip-accent); }
      .cce-detail-text { min-width: 0; font-weight: 400; color: var(--cce-tip-muted); }
      @media (prefers-reduced-motion: reduce) {
        .cce-global-tooltip { transition: none; }
      }
      .cce-chart-popup { width: 300px; }
      .cce-chart-popup .cce-tooltip-content { overflow-y: auto; }
      .cce-chart-popup .cce-tooltip-content, .cce-chart-history {
        scrollbar-width: thin;
        scrollbar-color: var(--cce-tip-border) var(--cce-tip-bg);
      }
      .cce-tooltip-code { font-size: 11px; color: var(--cce-tip-muted); }
      .cce-chart-history {
        display: grid;
        gap: 6px;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--cce-tip-border);
        overflow-y: auto;
        font-size: 12px;
        font-variant-numeric: tabular-nums;
      }
      .cce-chart-history-row { display: flex; justify-content: space-between; gap: 16px; color: var(--cce-tip-text); }
      .cce-chart-history-row strong { font-weight: 600; white-space: nowrap; color: inherit; }
      .cce-chart-history-row[data-status="remaining"] { color: var(--cce-status-remaining); }
      .cce-chart-history-row[data-status="absent"] { color: var(--cce-status-absent); }
      .cce-chart-history-row[data-status="present"] { color: var(--cce-status-present); }
      .cce-inline {
        display: inline-flex;
        flex-direction: column;
        gap: 3px;
        max-width: 100%;
        min-width: 0;
        vertical-align: top;
        white-space: normal !important;
        overflow-wrap: anywhere;
        line-height: 1.45;
      }
      .cce-inline:has(.cce-inline-row) {
        box-sizing: border-box;
        border-left: 2px solid #94a3b880;
        padding-left: 9px;
      }
      .cce-inline-title { font-weight: 600; margin-bottom: 3px; }
      .cce-inline-code { font-weight: 700; }
      .cce-inline-name { font-weight: 500; }
      .cce-inline-section { font-weight: 400; }
      .cce-inline-row {
        display: grid;
        grid-template-columns: 84px minmax(0, 1fr);
        gap: 8px;
        font-size: 0.88em;
        line-height: 1.45;
      }
      .cce-inline-label { font-weight: 500; }
      .cce-inline-value { min-width: 0; font-weight: 400; }
      .cce-inline[data-cce-bounded="1"] .cce-inline-title {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      .cce-inline[data-cce-alias="1"] { display: inline; vertical-align: baseline; }
      .cce-inline[data-cce-alias="1"] .cce-inline-title { display: inline; margin: 0; }
      .cce-inline[data-cce-compact="1"] {
        display: inline-flex;
        flex-direction: row;
        vertical-align: baseline;
        line-height: inherit;
        max-height: 100%;
        overflow: hidden;
        white-space: nowrap !important;
      }
      .cce-inline[data-cce-compact="1"] .cce-inline-title {
        display: inline-flex;
        align-items: baseline;
        gap: 4px;
        min-width: 0;
        max-width: 100%;
        margin-bottom: 0;
        white-space: nowrap;
      }
      .cce-inline[data-cce-compact="1"] :is(.cce-inline-code, .cce-inline-section) { flex-shrink: 0; }
      .cce-inline[data-cce-compact="1"] .cce-inline-name {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .cce-inline[data-cce-inline-details="1"] { cursor: help; }
      .cce-inline[data-cce-inline-details="1"]:focus-visible { outline: 2px solid #bc713d; outline-offset: 2px; }
      tr[data-cce-inline-row] > td {
        padding-top: 10px !important;
        padding-bottom: 10px !important;
        vertical-align: top;
        border-bottom: 1px solid #94a3b840;
      }
      [data-cce-inline-cell] {
        white-space: normal !important;
        overflow-wrap: break-word !important;
      }
      /* Highcharts supplies native attendance data; only the HTML card adds course details. */
      [data-cce-course-chart] .highcharts-tooltip:has([data-cce-key]) { visibility: hidden !important; pointer-events: none; }
      [data-cce-course-chart] .highcharts-point { cursor: pointer; }
    `;
    (document.head || document.documentElement).appendChild(style);

    attachTooltipListeners(document, window);
  }

  function chartHistoryLines(root) {
    const lines = [];
    let current = "";
    const flush = () => { if (current.trim()) lines.push(current.trim()); current = ""; };
    function visit(node) {
      if (node.nodeType === 3) { current += node.nodeValue; return; }
      if (node.hasAttribute && node.hasAttribute("data-cce-key")) return;
      if (node.hasAttribute && node.hasAttribute("x") && node.hasAttribute("dy")) flush();
      for (const child of node.childNodes || []) visit(child);
    }
    visit(root);
    flush();
    return lines;
  }

  function buildChartTooltipDom(nativeTooltip, container) {
    const marker = nativeTooltip.querySelector("[data-cce-key]");
    const resolved = marker && resolve(marker.dataset.cceKey);
    if (!resolved) return null;
    const doc = container.ownerDocument;
    container.textContent = "";
    buildTooltipDom(buildExtendedData(resolved), container);
    const details = container.firstChild;
    const code = doc.createElement("div");
    code.className = "cce-tooltip-code";
    code.textContent = (marker.dataset.cceBefore || "") + marker.dataset.cceMatch + (marker.dataset.cceAfter || "");
    details.insertBefore(code, details.firstChild);
    const history = doc.createElement("div");
    history.className = "cce-chart-history";
    for (const line of chartHistoryLines(nativeTooltip.querySelector("text") || nativeTooltip)) {
      const row = doc.createElement("div");
      row.className = "cce-chart-history-row";
      const status = line.match(/^(remaining|absent|present)\s*:/i);
      row.dataset.status = status ? status[1].toLowerCase() : "other";
      const colon = line.indexOf(":");
      const label = doc.createElement("span");
      label.textContent = colon < 0 ? line : line.slice(0, colon);
      row.appendChild(label);
      if (colon >= 0) {
        const value = doc.createElement("strong");
        value.textContent = line.slice(colon + 1).trim();
        row.appendChild(value);
      }
      history.appendChild(row);
    }
    if (history.firstChild) container.appendChild(history);
    return { details, history };
  }

  // Keep the tooltip inside the viewport and its pointer aligned with the course.
  function tooltipViewport(win, frameBounds) {
    const viewport = win.visualViewport;
    const left = viewport?.offsetLeft || 0;
    const top = viewport?.offsetTop || 0;
    const bounds = { left, top, right: left + (viewport?.width || win.innerWidth),
      bottom: top + (viewport?.height || win.innerHeight) };
    if (frameBounds) {
      bounds.left = Math.max(bounds.left, frameBounds.left);
      bounds.top = Math.max(bounds.top, frameBounds.top);
      bounds.right = Math.min(bounds.right, frameBounds.right);
      bounds.bottom = Math.min(bounds.bottom, frameBounds.bottom);
    }
    return bounds;
  }

  function readVisibleFrame(doc, win, callback) {
    // The browser can measure clipping even when the embedding page is cross-origin.
    const probe = doc.createElement("div");
    probe.style.cssText = "all:initial;position:fixed;inset:0;visibility:hidden;pointer-events:none";
    const observer = new win.IntersectionObserver(([entry]) => {
      if (!probe.isConnected) return;
      cancel();
      callback(entry.intersectionRect);
    });
    function cancel() {
      observer.disconnect();
      probe.remove();
    }
    (doc.documentElement || doc.body).appendChild(probe);
    observer.observe(probe);
    return cancel;
  }

  function tooltipPosition(rect, width, height, viewport) {
    const margin = 12;
    const gap = 9;
    const center = rect.left + rect.width / 2;
    const left = Math.max(viewport.left + margin, Math.min(center - width / 2, viewport.right - width - margin));
    const spaceAbove = rect.top - viewport.top - gap - margin;
    const spaceBelow = viewport.bottom - rect.bottom - gap - margin;
    const above = spaceAbove >= spaceBelow;
    const top = Math.max(viewport.top + margin, Math.min(above ? rect.top - height - gap : rect.bottom + gap,
      viewport.bottom - height - margin));
    return { left, top, placement: above ? "above" : "below",
      availableHeight: Math.max(spaceAbove, spaceBelow),
      arrow: Math.max(12, Math.min(width - 12, center - left)) };
  }

  function attachTooltipListeners(doc, win) {
    if (!doc || doc.querySelector(".cce-global-tooltip")) return;
    const globalTooltip = doc.createElement("div");
    globalTooltip.className = "cce-global-tooltip";
    globalTooltip.id = "cce-course-tooltip";
    globalTooltip.setAttribute("role", "tooltip");
    globalTooltip.setAttribute("aria-hidden", "true");
    // A fixed popover uses the viewport even when the host page transforms its layout.
    if (globalTooltip.showPopover) globalTooltip.setAttribute("popover", "manual");
    (doc.documentElement || doc.body).appendChild(globalTooltip);
    const selector = '.cce-tooltip-wrap, .cce-highlight, .cce-inline[data-cce-inline-details="1"]';
    let active = null;
    let hovered = null;
    let focused = null;
    let focusOwner = null;
    let descriptionTarget = null;
    let showTimer;
    let hideTimer;
    let cancelFrameRead;
    let routineRequest;
    let sheetTooltip;
    const routineOrigin = "https://ucam.uiu.ac.bd";
    const sheetOrigin = "https://docs.google.com";
    const isRoutine = win.location?.origin === routineOrigin &&
      /^\/Student\/ExamRoutineViewer\.aspx$/i.test(win.location.pathname);
    const isPublishedSheet = win.location?.origin === sheetOrigin &&
      /^\/spreadsheets\/.*\/pubhtml(?:\/sheet)?\/?$/.test(win.location.pathname);
    let sheetRoot = win;
    if (isPublishedSheet) {
      while (sheetRoot.frameElement && sheetRoot.parent.location.origin === sheetOrigin) sheetRoot = sheetRoot.parent;
    }
    const routineHost = isPublishedSheet && sheetRoot.parent !== sheetRoot &&
      sheetRoot.document.referrer.startsWith(routineOrigin + "/") ? sheetRoot.parent : null;
    let chartClickVersion = 0;
    let activePoint = null;
    let chartPoint = null;
    let chartSource = "";
    const courseTarget = node => node && node.closest ? node.closest(selector) : null;

    function dismissRoutineTooltip(keepHovered) {
      if (!routineRequest) return;
      clearTimeout(routineRequest.timer);
      window.removeEventListener("message", routineRequest.ready);
      routineHost.postMessage({ type: "cce-routine-tooltip-hide", id: routineRequest.id, keepHovered }, routineOrigin);
      routineRequest = null;
    }

    function hide(keepHovered) {
      cancelFrameRead?.();
      cancelFrameRead = null;
      dismissRoutineTooltip(keepHovered === true);
      sheetTooltip = null;
      chartClickVersion++;
      activePoint = null;
      chartPoint = null;
      chartSource = "";
      globalTooltip.classList.remove("cce-chart-popup");
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      globalTooltip.classList.remove("cce-visible");
      globalTooltip.setAttribute("aria-hidden", "true");
      if (globalTooltip.hidePopover && globalTooltip.matches(":popover-open")) globalTooltip.hidePopover();
      if (descriptionTarget) {
        const ids = (descriptionTarget.getAttribute("aria-describedby") || "").split(/\s+/)
          .filter(id => id && id !== globalTooltip.id);
        if (ids.length) descriptionTarget.setAttribute("aria-describedby", ids.join(" "));
        else descriptionTarget.removeAttribute("aria-describedby");
      }
      active = null;
      descriptionTarget = null;
    }
    function show(target) {
      hide();
      const resolved = resolve(target.dataset.cceKey);
      if (!enabled || !target.isConnected || !resolved) return;
      const data = buildExtendedData(resolved);
      const title = target.querySelector ? target.querySelector(".cce-inline-title") : null;
      const clipped = target.dataset.cceBounded === "1" && title && title.scrollHeight > title.clientHeight + 1;
      const fullDetails = target.dataset.cceCompact === "1" || target.dataset.cceAlias === "1" || !!clipped;
      const tooltipData = target.classList.contains("cce-inline") ? inlineTooltipData(data, fullDetails) : data;
      if (!tooltipData.name && !tooltipData.credits && !tooltipData.exam && !tooltipData.prereq) return;
      active = target;
      if (win.top !== win && win.IntersectionObserver) {
        cancelFrameRead = readVisibleFrame(doc, win, bounds => {
          cancelFrameRead = null;
          displayCourseTooltip(target, tooltipData, bounds, fullDetails);
        });
      } else {
        displayCourseTooltip(target, tooltipData);
      }
    }
    function displayCourseTooltip(target, tooltipData, frameBounds, fullDetails) {
      if (!target.isConnected) return;
      const anchor = target.querySelector(".cce-inline-code") || target;
      const rect = anchor.getBoundingClientRect();
      const viewport = tooltipViewport(win, frameBounds);
      const useRoutine = routineHost && focused !== target && fullDetails !== undefined;
      const handoff = useRoutine ? () => {
        const id = crypto.randomUUID();
        const ready = event => {
          if (routineRequest?.id === id && event.isTrusted && event.origin === routineOrigin && event.source === routineHost &&
            event.data?.type === "cce-routine-tooltip-ready" && event.data.id === id) {
            clearTimeout(routineRequest.timer);
            window.removeEventListener("message", ready);
          }
        };
        // The enclosing Sheet script can also manage an inner frame's tooltip.
        window.addEventListener("message", ready);
        routineRequest = { id, ready, timer: setTimeout(() => {
          dismissRoutineTooltip(false);
          if (active === target) displayCourseTooltip(target, tooltipData, frameBounds);
        }, 120) };
        let left = rect.left;
        let top = rect.top;
        for (let child = win; child !== sheetRoot; child = child.parent) {
          const frame = child.frameElement;
          if (!frame) return;
          const box = frame.getBoundingClientRect();
          left += box.left + frame.clientLeft;
          top += box.top + frame.clientTop;
        }
        routineHost.postMessage({ type: "cce-routine-tooltip-show", id, code: target.dataset.cceKey, fullDetails,
          left, top, width: rect.width, height: rect.height }, routineOrigin);
      } : null;
      if (!renderCourseTooltip(tooltipData, rect, viewport, handoff)) return;
      descriptionTarget = focused === target && focusOwner ? focusOwner : target;
      const ids = new Set((descriptionTarget.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      ids.add(globalTooltip.id);
      descriptionTarget.setAttribute("aria-describedby", [...ids].join(" "));
    }
    function renderCourseTooltip(tooltipData, rect, viewport, handoff) {
      if (viewport.right <= viewport.left || viewport.bottom <= viewport.top) return false;
      globalTooltip.textContent = "";
      globalTooltip.dataset.theme = themePreference;
      globalTooltip.style.maxWidth = Math.min(300, Math.max(0, viewport.right - viewport.left - 24)) + "px";
      const content = buildTooltipDom(tooltipData, globalTooltip);
      globalTooltip.showPopover?.();
      const tipRect = globalTooltip.getBoundingClientRect();
      let position = tooltipPosition(rect, tipRect.width, tipRect.height, viewport);
      if (tipRect.height > position.availableHeight) {
        if (handoff) {
          globalTooltip.hidePopover?.();
          handoff();
          return false;
        }
        const chromeHeight = tipRect.height - content.getBoundingClientRect().height;
        // Use the visible viewport if neither side can show even one line of details.
        const available = position.availableHeight >= chromeHeight + 20
          ? position.availableHeight : viewport.bottom - viewport.top - 24;
        content.style.maxHeight = Math.max(0, available - chromeHeight) + "px";
        content.style.overflowY = "auto";
        const adjustedRect = globalTooltip.getBoundingClientRect();
        position = tooltipPosition(rect, adjustedRect.width, adjustedRect.height, viewport);
      }
      globalTooltip.style.left = position.left + "px";
      globalTooltip.style.top = position.top + "px";
      globalTooltip.style.setProperty("--cce-arrow-left", position.arrow + "px");
      globalTooltip.dataset.placement = position.placement;
      globalTooltip.setAttribute("aria-hidden", "false");
      globalTooltip.classList.add("cce-visible");
      return true;
    }
    if (routineHost) win.addEventListener("pagehide", hide);
    if (isRoutine) win.addEventListener("message", event => {
      const message = event.data;
      if (!event.isTrusted || event.origin !== sheetOrigin || !message || typeof message.id !== "string" || message.id.length !== 36) return;
      if (message.type === "cce-routine-tooltip-hide") {
        if (sheetTooltip?.source === event.source && sheetTooltip.id === message.id &&
          !(message.keepHovered && globalTooltip.matches(":hover"))) hide();
        return;
      }
      if (!enabled || message.type !== "cce-routine-tooltip-show" || typeof message.code !== "string") return;
      let source = event.source;
      while (source && source.parent !== win && source.parent !== source) source = source.parent;
      const frame = [...doc.querySelectorAll("iframe")].find(el => el.contentWindow === source);
      if (!frame || !Object.hasOwn(courses, message.code)) return;
      const { left, top, width, height } = message;
      if (![left, top, width, height].every(Number.isFinite) || width <= 0 || height <= 0 ||
        left < 0 || top < 0 || left + width > frame.clientWidth + 1 || top + height > frame.clientHeight + 1) return;
      const box = frame.getBoundingClientRect();
      const x = box.left + frame.clientLeft + left;
      const y = box.top + frame.clientTop + top;
      const rect = { left: x, top: y, width, bottom: y + height };
      const viewport = tooltipViewport(win);
      if (x + width <= viewport.left || x >= viewport.right || rect.bottom <= viewport.top || y >= viewport.bottom) return;
      const resolved = resolve(message.code);
      if (!resolved) return;
      const data = buildExtendedData(resolved);
      hide();
      if (renderCourseTooltip(mode === "inline" ? inlineTooltipData(data, message.fullDetails === true) : data, rect, viewport)) {
        sheetTooltip = { source: event.source, id: message.id, frame };
        event.source.postMessage({ type: "cce-routine-tooltip-ready", id: message.id }, sheetOrigin);
      }
    });
    function scheduleHide() {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      if (activePoint) return;
      hideTimer = setTimeout(() => {
        if (focused) show(focused);
        else hide(true);
      }, 140);
    }
    doc.addEventListener("mouseover", e => {
      if (globalTooltip.contains(e.target)) { clearTimeout(hideTimer); return; }
      const target = courseTarget(e.target);
      if (!target || target.contains(e.relatedTarget)) return;
      hovered = target;
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      if (sheetTooltip || (active && active !== target)) hide();
      showTimer = setTimeout(() => show(target), 220);
    });
    doc.addEventListener("mouseout", e => {
      const target = courseTarget(e.target);
      if (target && target.contains(e.relatedTarget)) return;
      if (target) hovered = null;
      if (globalTooltip.contains(e.relatedTarget)) { clearTimeout(showTimer); return; }
      const point = e.target.closest ? e.target.closest(".highcharts-point, .highcharts-tracker, .highcharts-series") : null;
      if (point && point.contains(e.relatedTarget)) return;
      if (point && !activePoint) chartClickVersion++;
      if (target || point || globalTooltip.contains(e.target)) scheduleHide();
    });
    doc.addEventListener("focusin", e => {
      focused = courseTarget(e.target) || (e.target.querySelector && e.target.querySelector(selector));
      focusOwner = focused ? e.target : null;
      if (focused) show(focused);
    });
    doc.addEventListener("focusout", e => {
      if (focused) {
        focused = null;
        focusOwner = null;
        if (hovered) show(hovered);
        else scheduleHide();
      }
    });
    doc.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
    doc.addEventListener("scroll", e => {
      if (!globalTooltip.contains(e.target)) hide();
    }, true);
    doc.addEventListener("cce-dismiss-tooltip", hide);
    win.addEventListener("resize", () => { hide(); refreshInlineTitles(doc); });
    win.addEventListener("blur", hide);

    function showChart(point, chart, pin) {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
      const nativeTooltip = chart.querySelector(".highcharts-tooltip");
      if (!nativeTooltip) return;
      if (chartPoint === point && chartSource === nativeTooltip.textContent && globalTooltip.classList.contains("cce-visible")) {
        if (pin) activePoint = point;
        return;
      }
      processNode(nativeTooltip);
      hide();
      const content = buildChartTooltipDom(nativeTooltip, globalTooltip);
      if (!content) return;
      chartPoint = point;
      chartSource = nativeTooltip.textContent;
      if (pin) activePoint = point;
      globalTooltip.classList.add("cce-chart-popup");
      globalTooltip.dataset.theme = themePreference;
      globalTooltip.style.maxWidth = "";
      globalTooltip.showPopover?.();
      content.history.style.maxHeight = Math.max(40, Math.floor(win.innerHeight * 0.35)) + "px";
      const historyHeight = content.history.getBoundingClientRect().height;
      content.details.style.maxHeight = Math.max(40, Math.min(280, win.innerHeight - historyHeight - 64)) + "px";
      const bounds = globalTooltip.getBoundingClientRect();
      const position = tooltipPosition(point.getBoundingClientRect(), bounds.width, bounds.height,
        { left: 0, top: 0, right: win.innerWidth, bottom: win.innerHeight });
      globalTooltip.style.left = position.left + "px";
      globalTooltip.style.top = position.top + "px";
      globalTooltip.style.setProperty("--cce-arrow-left", position.arrow + "px");
      globalTooltip.dataset.placement = position.placement;
      descriptionTarget = point;
      const ids = new Set((point.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
      ids.add(globalTooltip.id);
      point.setAttribute("aria-describedby", [...ids].join(" "));
      globalTooltip.setAttribute("aria-hidden", "false");
      globalTooltip.classList.add("cce-visible");
    }
    let chartHoverQueued = false;
    doc.addEventListener("mousemove", e => {
      if (sheetTooltip && e.target !== sheetTooltip.frame && !globalTooltip.contains(e.target)) hide();
      const point = e.target.closest ? e.target.closest(".highcharts-point, .highcharts-tracker, .highcharts-series") : null;
      const chart = point && point.closest(".highcharts-container[data-cce-course-chart]");
      if (!enabled || !chart || activePoint || chartHoverQueued) return;
      clearTimeout(hideTimer);
      chartHoverQueued = true;
      const version = chartClickVersion;
      requestAnimationFrame(() => {
        chartHoverQueued = false;
        if (version !== chartClickVersion || !enabled || activePoint || !point.isConnected) return;
        showChart(point, chart, false);
      });
    }, { passive: true });

    doc.addEventListener("click", e => {
      if (globalTooltip.contains(e.target)) return;
      const point = e.target.closest ? e.target.closest(".highcharts-point, .highcharts-tracker, .highcharts-series") : null;
      const chart = point && point.closest(".highcharts-container[data-cce-course-chart]");
      if (activePoint === point && point) { activePoint = null; return; }
      if (!enabled || !chart) { hide(); return; }
      const version = chartClickVersion;
      setTimeout(() => {
        if (version === chartClickVersion && enabled && point.isConnected) showChart(point, chart, true);
      }, 0);
    }, true);
  }

  function injectStylesIntoDoc(doc) {
    if (!doc || doc.getElementById("cce-custom-styles")) return;
    const style = doc.createElement("style");
    style.id = "cce-custom-styles";
    const mainStyle = document.getElementById("cce-custom-styles");
    if (mainStyle) {
      style.textContent = mainStyle.textContent;
    }
    (doc.head || doc.documentElement).appendChild(style);
  }

  function managedDocuments() {
    const previousCount = frameDocuments.size;
    for (const [iframe, doc] of frameDocuments) {
      if (!iframe.isConnected || iframe.contentDocument !== doc) {
        if (iframe.contentDocument === doc && iframe.contentWindow?.__UIU_COURSE_DECODER_INJECTED__ === doc) {
          delete iframe.contentWindow.__UIU_COURSE_DECODER_INJECTED__;
        }
        undecorateAll(doc);
        frameDocuments.delete(iframe);
      }
    }
    if (observer && frameDocuments.size !== previousCount) startObserver();
    return [document, ...frameDocuments.values()];
  }

  // A fallback frame belongs to this controller, or to its own injected script, never both.
  function processSameOriginIframe(iframe) {
    if (!iframe || !enabled || !courseRegex) return;
    try {
      const doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
      if (!doc || frameDocuments.get(iframe) === doc) return;
      const previous = frameDocuments.get(iframe);
      if (previous) {
        undecorateAll(previous);
        frameDocuments.delete(iframe);
        if (observer) startObserver();
      }
      const frameWin = iframe.contentWindow;
      if (!frameWin || frameWin.__UIU_COURSE_DECODER_INJECTED__ === true || frameWin.__UIU_COURSE_DECODER_INJECTED__ === doc) return;
      const frameBody = doc.body || doc.documentElement;
      if (!frameBody) return;
      frameWin.__UIU_COURSE_DECODER_INJECTED__ = doc;
      frameDocuments.set(iframe, doc);
      injectStylesIntoDoc(doc);
      attachTooltipListeners(doc, frameWin);
      normalizeCourseSplits(frameBody);
      processNode(frameBody);
      hookSameOriginIframes(frameBody);
      observer?.observe(frameBody, {childList: true, subtree: true, characterData: true});
    } catch (_) {
      // Cross-origin iframe or restricted sandbox - handled safely.
    }
  }

  function hookSameOriginIframes(root) {
    if (!root || !root.querySelectorAll) return;
    try {
      const iframes = root.querySelectorAll("iframe");
      for (const iframe of iframes) {
        if (!iframe.dataset?.cceHooked) {
          if (iframe.dataset) iframe.dataset.cceHooked = "1";
          iframe.addEventListener("load", () => {
            setTimeout(() => processSameOriginIframe(iframe), 100);
          });
        }
        processSameOriginIframe(iframe);
      }
    } catch (_) {}
  }

  // Tags whose text we shouldn't mess with
  const SKIP_TAGS = new Set([
    "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT",
    "SELECT", "OPTION", "CODE", "PRE", "KBD", "SAMP",
    "MATH", "CANVAS", "IFRAME", "OBJECT", "EMBED",
    "HEAD", "META", "LINK", "TITLE",
  ]);

  function shouldSkipElement(el) {
    if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
    if (el.classList && el.classList.contains("cce-global-tooltip")) return true;
    if (SKIP_TAGS.has(el.tagName.toUpperCase())) return true;
    if (el.isContentEditable) return true;
    if (el.getAttribute && el.getAttribute("contenteditable") === "true") return true;
    return false;
  }

  // Check if a node is inside a skipped element or one we already processed
  function isInsideSkippedElement(node) {
    let el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    while (el) {
      if (shouldSkipElement(el)) return true;
      if (el.hasAttribute && el.hasAttribute(PROCESSED_ATTR)) return true;
      el = el.parentElement;
    }
    return false;
  }

  // Some sites are tricky and split course codes with HTML (like <span> or <br>).
  // We try to merge them back into a single plain text node before scanning.
  function normalizeCourseSplits(root) {
    if (!root || !root.querySelectorAll) return;

    // Fix 1: Flatten inline elements containing only a course code
    try {
      const elements = root.querySelectorAll(
        "td, th, span, p, a, b, strong, i, em, label, div, li, h1, h2, h3, h4, h5, h6"
      );
      for (const el of elements) {
        if (isInsideSkippedElement(el) || el.querySelector(`[${PROCESSED_ATTR}]`)) continue;
        if (el.children.length === 0) continue;

        // Skip anything with block elements inside to avoid messing up the page layout
        if (el.querySelector("div, p, table, ul, ol, li, section, article, tr, td")) continue;
        const text = el.textContent.replace(/\s+/g, " ").trim();
        if (resolve(text)) el.textContent = text;
      }
    } catch (e) { }

    // Fix 2: Remove <br> tags splitting the letter prefix and digit suffix
    try {
      const brs = root.querySelectorAll("br");
      for (const br of brs) {
        if (!br.parentNode) continue;

        let prev = br.previousSibling;
        let next = br.nextSibling;

        // Ignore empty text nodes
        while (prev && prev.nodeType === Node.TEXT_NODE && !prev.nodeValue.trim())
          prev = prev.previousSibling;
        while (next && next.nodeType === Node.TEXT_NODE && !next.nodeValue.trim())
          next = next.nextSibling;

        // If the <br> sits right between "letters" and "numbers", remove it
        if (
          prev && next &&
          prev.nodeType === Node.TEXT_NODE &&
          next.nodeType === Node.TEXT_NODE &&
          /[a-zA-Z]{2,4}\s*-?\s*$/.test(prev.nodeValue) &&
          /^\s*\d{3,4}/.test(next.nodeValue)
        ) {
          prev.nodeValue = prev.nodeValue.replace(/\s*$/, "") + " " + next.nodeValue.replace(/^\s*/, "");
          next.parentNode.removeChild(next);
          br.parentNode.removeChild(br);
        }
      }
    } catch (e) { }
  }

  // Scans a single text node for courses and replaces matches with styled spans/tspans.
  // We handle SVG text (like in Highcharts) carefully so we don't break charts!
  function processTextNode(textNode) {
    if (isInsideSkippedElement(textNode)) return null;
    let text = textNode.nodeValue;
    let matchText = text;
    let isHighchartsTruncated = false;
    let titleElToRemove = null;

    // Highcharts truncates long labels with "…" and puts the real value in a <title>.
    // Let's grab the real value from the <title> so we can decode it!
    let elForTitle = textNode.parentElement;
    while (elForTitle && elForTitle !== document.documentElement) {
      const tag = elForTitle.tagName && elForTitle.tagName.toUpperCase();
      if (tag === "SVG") break;
      if (tag === "TEXT" || tag === "G") {
        const titleEl = elForTitle.querySelector(tag === "G" ? ":scope > title" : "title");
        if (titleEl) {
          titleElToRemove = titleEl;
          if (text.includes("…") || text.endsWith("...")) {
            matchText = titleEl.textContent;
            isHighchartsTruncated = true;
          }
          break;
        }
      }
      elForTitle = elForTitle.parentElement;
    }

    courseRegex.lastIndex = 0;
    if (!courseRegex.test(matchText)) return null;
    courseRegex.lastIndex = 0;

    // Check if we're inside an SVG chart or its tooltip
    let isSvg = false;
    let isTooltip = false;
    let curr = textNode.parentElement;
    while (curr && curr !== document.documentElement) {
      if (curr.tagName && curr.tagName.toUpperCase() === "SVG") isSvg = true;
      if (curr.classList && curr.classList.contains("highcharts-tooltip")) isTooltip = true;
      curr = curr.parentElement;
    }

    // Axis labels must keep their original dimensions, even in Inline mode.
    let effectiveMode = mode;
    if (isSvg && !isTooltip && mode === "inline") effectiveMode = "highlight";
    else if (isTooltip) effectiveMode = "inline";
    const chart = textNode.parentElement.closest(".highcharts-container");
    if (chart) {
      chart.setAttribute("data-cce-course-chart", "1");
    }

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    let replaced = false;
    let lastMatchHadDetails = false;
    const presentations = !isSvg && effectiveMode === "inline" ? inlinePresentations(textNode) : new Map();

    courseRegex.lastIndex = 0;
    while ((match = courseRegex.exec(matchText)) !== null) {
      const resolved = resolve(match[0]);
      if (!resolved) continue;
      replaced = true;

      // For truncated chart labels ("CSE …"), just highlight the whole thing
      if (isHighchartsTruncated) {
        const data = buildExtendedData(resolved);
        const wrap = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        wrap.setAttribute(PROCESSED_ATTR, "1");
        wrap.dataset.cceKey = resolved.key;
        wrap.dataset.cceMatch = text;
        wrap.classList.add(effectiveMode === "tooltip" ? "cce-tooltip-wrap" : "cce-highlight");
        wrap.style.cursor = "help";
        if (effectiveMode === "highlight") wrap.setAttribute("fill", "#b96a30");
        wrap.setAttribute("tabindex", "0");
        wrap.textContent = text;
        frag.appendChild(wrap);
        break;
      }

      // Native chart text stays intact; its marker is used only to build the HTML card.
      if ((!isTooltip || !isSvg) && match.index > lastIndex) {
        const interText = text.slice(lastIndex, match.index);
        if (effectiveMode === "inline" && lastMatchHadDetails) {
          const lineBreak = document.createElement("br");
          lineBreak.setAttribute("data-cce-break", "1");
          frag.appendChild(lineBreak);
          frag.appendChild(document.createTextNode(interText));
        } else {
          frag.appendChild(document.createTextNode(interText));
        }
      }

      if (isSvg) {
        const wrap = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        wrap.setAttribute(PROCESSED_ATTR, "1");
        wrap.dataset.cceKey = resolved.key;
        wrap.dataset.cceMatch = match[0];
        const data = buildExtendedData(resolved);

        if (isTooltip) {
          const beforeText = text.slice(lastIndex, match.index);
          const afterText = text.slice(match.index + match[0].length);
          wrap.dataset.cceBefore = beforeText;
          wrap.dataset.cceAfter = afterText;
          wrap.dataset.cceOriginal = text;
          wrap.textContent = text;
          frag.appendChild(wrap);
          lastIndex = text.length;
          break;
        } else {
          // Regular highlight in an SVG
          wrap.style.cursor = "help";
          if (effectiveMode === "highlight") {
            wrap.setAttribute("fill", "#b96a30");
            wrap.classList.add("cce-highlight");
          } else {
            wrap.classList.add("cce-tooltip-wrap");
            wrap.setAttribute("text-decoration", "underline");
          }
          wrap.textContent = match[0];
          wrap.setAttribute("tabindex", "0");
        }

        frag.appendChild(wrap);
      } else {
        // Normal HTML text
        const wrap = document.createElement("span");
        wrap.setAttribute(PROCESSED_ATTR, "1");
        wrap.dataset.cceKey = resolved.key;
        wrap.dataset.cceMatch = match[0];
        const data = buildExtendedData(resolved);
        if (effectiveMode === "tooltip") {
          wrap.className = "cce-tooltip-wrap";
                    wrap.textContent = match[0];
        } else if (effectiveMode === "highlight") {
          wrap.className = "cce-highlight";
                    wrap.textContent = match[0];
        } else {
          wrap.className = "cce-inline";
          const presentation = presentations.get(match.index);
          if (presentation && presentation.alias) wrap.dataset.cceAlias = "1";
          if (presentation && presentation.omitName) wrap.dataset.cceOmitName = "1";
          const suffix = text.slice(match.index + match[0].length).match(/^\s*\([A-Z0-9]{1,5}\)/);
          if (suffix) {
            wrap.dataset.cceSuffix = suffix[0];
            wrap.dataset.cceOriginal = match[0] + suffix[0];
          }
          prepareInlineLayout(wrap, textNode.parentElement, data);
          buildInlineDom(match[0], data, wrap);
          lastMatchHadDetails = wrap.dataset.cceCompact !== "1" && wrap.dataset.cceAlias !== "1" && !!(data.exam || data.prereq);
        }
        if (effectiveMode !== "inline" && !textNode.parentElement.closest("a, button, input, select, textarea, [tabindex]")) {
          wrap.setAttribute("tabindex", "0");
        }
        frag.appendChild(wrap);
      }

      lastIndex = match.index + match[0].length;
      if (!isSvg && effectiveMode === "inline") {
        const suffix = text.slice(lastIndex).match(/^\s*\([A-Z0-9]{1,5}\)/);
        if (suffix) { lastIndex += suffix[0].length; courseRegex.lastIndex = lastIndex; }
      }
    }

    if (!replaced) return null;

    if ((!isTooltip || !isSvg) && !isHighchartsTruncated && lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    // Remove old <title> attributes so they don't block our custom tooltip
    if (titleElToRemove) {
      const marker = frag.querySelector("[data-cce-key]");
      if (marker) marker.dataset.cceOriginalTitle = titleElToRemove.textContent;
      titleElToRemove.remove();
    }
    let pNode = textNode.parentElement;
    while (pNode && pNode !== document.documentElement) {
      if (pNode.hasAttribute && pNode.hasAttribute("title")) pNode.removeAttribute("title");
      pNode = pNode.parentElement;
    }

    return frag;
  }

  // Walk through the DOM looking for text nodes to process
  function processNode(root) {
    if (!courseRegex || !enabled) return;
    if (isInsideSkippedElement(root)) return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (shouldSkipElement(node)) return NodeFilter.FILTER_REJECT;
            if (node.hasAttribute && node.hasAttribute(PROCESSED_ATTR)) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_SKIP;
          }
          return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        },
      }
    );

    const replacements = [];
    let node;
    while ((node = walker.nextNode())) {
      const frag = processTextNode(node);
      if (frag) replacements.push({ node, frag });
    }

    for (const { node: textNode, frag } of replacements) {
      if (textNode.parentNode) {
        const parent = textNode.parentNode;
        parent.replaceChild(frag, textNode);
        refreshInlineTitles(parent);
      }
    }
  }

  // We queue up DOM changes and process them in batches every 100ms
  // so we don't lag the page when lots of nodes are added at once
  let scanTimeout = null;
  const nodesToProcess = new Set();

  function processQueuedNodes() {
    scanTimeout = null;
    if (!enabled || !courseRegex) return;

    for (const node of nodesToProcess) {
      if (!node.isConnected || !managedDocuments().includes(node.ownerDocument)) continue;

      if (node.nodeType === Node.ELEMENT_NODE) {
        normalizeCourseSplits(node);
        processNode(node);
      } else if (node.nodeType === Node.TEXT_NODE && !isInsideSkippedElement(node)) {
        if (node.parentNode) normalizeCourseSplits(node.parentNode);
        const frag = processTextNode(node);
        if (frag && node.parentNode) {
          const parent = node.parentNode;
          parent.replaceChild(frag, node);
          refreshInlineTitles(parent);
        }
      }
    }
    nodesToProcess.clear();
  }

  function scheduleProcess(node) {
    nodesToProcess.add(node);
    if (!scanTimeout) scanTimeout = setTimeout(processQueuedNodes, 100);
  }

  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
              if (node.nodeType === Node.ELEMENT_NODE && (node.tagName === "IFRAME" || (node.querySelector && node.querySelector("iframe")))) {
                hookSameOriginIframes(node.tagName === "IFRAME" ? node.parentElement || document.body : node);
              }
              const isTooltip = (node.nodeType === Node.ELEMENT_NODE && node.classList && node.classList.contains("highcharts-tooltip")) ||
                (node.parentElement && node.parentElement.closest && node.parentElement.closest(".highcharts-tooltip"));
              if (isTooltip) {
                if (node.nodeType === Node.TEXT_NODE) {
                  const frag = processTextNode(node);
                  if (frag && node.parentNode) {
                    const parent = node.parentNode;
                    parent.replaceChild(frag, node);
          refreshInlineTitles(parent);
                  }
                } else {
                  processNode(node);
                }
              } else {
                scheduleProcess(node);
              }
            }
          }
        } else if (mutation.type === "characterData") {
          const target = mutation.target;
          if (target && target.nodeType === Node.TEXT_NODE) {
            const isTooltip = target.parentElement && target.parentElement.closest && target.parentElement.closest(".highcharts-tooltip");
            if (isTooltip) {
              const frag = processTextNode(target);
              if (frag && target.parentNode) {
                const parent = target.parentNode;
                parent.replaceChild(frag, target);
              }
            } else {
              scheduleProcess(target);
            }
          }
        }
      }
      managedDocuments();
    });
    for (const doc of managedDocuments()) {
      observer.observe(doc.body || doc.documentElement, {
        childList: true, subtree: true, characterData: true
      });
    }
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (scanTimeout) {
      clearTimeout(scanTimeout);
      scanTimeout = null;
    }
    nodesToProcess.clear();
  }

  // Load everything up once we have our settings from storage
  function init(storageData) {
    if (!storageData || typeof storageData !== "object") return;
    themePreference = storageData.themePreference || "system";
    courses = storageData.courses || {};
    mode = storageData.mode || "highlight";
    showExamInfo = storageData.showExamInfo || false;
    showPrerequisites = storageData.showPrerequisites || false;
    const allowedSites = storageData.allowedSites || [];
    enabled = isHostAllowed(window.location.hostname, allowedSites);

    if (!enabled || Object.keys(courses).length === 0) return;

    courseRegex = buildRegex(courses);
    injectStyles();

    const rootNode = document.body || document.documentElement;
    if (!rootNode) return;
    normalizeCourseSplits(rootNode);
    processNode(rootNode);
    hookSameOriginIframes(rootNode);
    startObserver();
  }

  function undecorateAll(doc = document) {
    clearInlineLayoutMarkers(doc);
    doc.dispatchEvent(new Event("cce-dismiss-tooltip"));
    doc.querySelectorAll("[data-cce-break]").forEach(lineBreak => lineBreak.remove());
    doc.querySelectorAll(`[${PROCESSED_ATTR}="1"]`).forEach(wrap => {
      if (wrap.parentNode) {
        if (wrap.dataset.cceOriginalTitle && !wrap.parentNode.querySelector("title")) {
          const title = wrap.ownerDocument.createElementNS("http://www.w3.org/2000/svg", "title");
          title.textContent = wrap.dataset.cceOriginalTitle;
          wrap.parentNode.appendChild(title);
        }
        const textNode = doc.createTextNode(wrap.dataset.cceOriginal || wrap.dataset.cceMatch);
        wrap.parentNode.replaceChild(textNode, wrap);
      }
    });

    doc.querySelectorAll("[data-cce-course-chart]").forEach(chart => {
      chart.removeAttribute("data-cce-course-chart");
    });
    // Merge adjacent text nodes so re-matching doesn't break across fragments
    try {
      (doc.body || doc.documentElement).normalize();
    } catch (e) {}
  }

  if (chrome?.storage?.local?.get) {
    try {
      chrome.storage.local.get(
        ["courses", "mode", "allowedSites", "showExamInfo", "showPrerequisites", "themePreference"],
        (data) => {
          if (chrome.runtime?.lastError || !chrome.runtime?.id) return;
          if (data) {
            init(data);
          }
        }
      );
    } catch (_) {
      // Context invalidated or storage unavailable during reload
    }
  }

  if (chrome?.storage?.onChanged?.addListener) {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (!chrome.runtime?.id) return;
        if (area === "local") {
          for (const doc of managedDocuments()) doc.dispatchEvent(new Event("cce-dismiss-tooltip"));
          if (changes.themePreference !== undefined) {
            themePreference = changes.themePreference.newValue || "system";
          }
          let needsFullRedecoration = false;
          let needsDomUpdate = false;

          if (changes.allowedSites !== undefined) {
            const allowedSites = changes.allowedSites.newValue || [];
            const isNowEnabled = isHostAllowed(window.location.hostname, allowedSites);
            if (isNowEnabled !== enabled) {
              enabled = isNowEnabled;
              if (!enabled) {
                stopObserver();
                for (const doc of managedDocuments()) undecorateAll(doc);
              } else {
                if (Object.keys(courses).length > 0) {
                  needsFullRedecoration = true;
                }
              }
            }
          }
          
          if (changes.mode !== undefined) {
            mode = changes.mode.newValue || "highlight";
            if (enabled) needsFullRedecoration = true;
          }
          
          if (changes.courses !== undefined) {
            courses = changes.courses.newValue || {};
            courseRegex = Object.keys(courses).length > 0 ? buildRegex(courses) : null;
            if (enabled) needsFullRedecoration = true;
          }

          if (changes.showExamInfo !== undefined) {
            showExamInfo = changes.showExamInfo.newValue || false;
            needsDomUpdate = true;
          }
          if (changes.showPrerequisites !== undefined) {
            showPrerequisites = changes.showPrerequisites.newValue || false;
            needsDomUpdate = true;
          }

          if (needsFullRedecoration && enabled) {
            if (!courseRegex && Object.keys(courses).length > 0) {
              courseRegex = buildRegex(courses);
            }
            stopObserver();
            for (const doc of managedDocuments()) undecorateAll(doc);
            if (courseRegex) {
              injectStyles();
              for (const doc of managedDocuments()) {
                const rootNode = doc.body || doc.documentElement;
                normalizeCourseSplits(rootNode);
                processNode(rootNode);
                hookSameOriginIframes(rootNode);
              }
              startObserver();
            }
          } else if (needsDomUpdate && enabled) {
            stopObserver();
            for (const doc of managedDocuments()) updateAllDecoratedElements(doc);
            startObserver();
          }
        }
      });
    } catch (_) {
      // Listener registration failed or context invalidated
    }
  }
})();
