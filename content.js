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

  // Prevent duplicate injections in the same frame
  if (window.__UIU_COURSE_DECODER_INJECTED__) return;
  window.__UIU_COURSE_DECODER_INJECTED__ = true;

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
  let injectedStyles = false;

  // We tag processed elements so we don't end up checking them twice in a loop
  const PROCESSED_ATTR = "data-cce-done";

  // Build one big regex from all the course codes.
  // The flexible pattern makes sure "PHY1103" and "PHY  1103" both work!
  function buildRegex(courseMap) {
    const patterns = Object.keys(courseMap).map((code) => {
      const escaped = code.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const flexible = escaped.replace(/\\ /g, "[\\s]*");
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
    const content = document.createElement("div");
    content.className = "cce-tooltip-content";

    const nameDiv = document.createElement("div");
    nameDiv.className = "cce-tooltip-name";
    nameDiv.textContent = data.name;
    content.appendChild(nameDiv);

    if (data.exam || data.prereq) {
      const details = document.createElement("div");
      details.className = "cce-tooltip-details";

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
        label.textContent = "Prereq:";
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
  }

  // Builds the inline expansion DOM inside `wrapEl` using safe DOM APIs (no innerHTML).
  function buildInlineDom(matchText, data, wrapEl) {
    while (wrapEl.firstChild) wrapEl.removeChild(wrapEl.firstChild);

    const titleSpan = document.createElement("span");
    titleSpan.className = "cce-inline-title";
    titleSpan.textContent = `${matchText} (${data.name})`;
    wrapEl.appendChild(titleSpan);

    if (data.exam) {
      wrapEl.appendChild(document.createElement("br"));
      const row = document.createElement("span");
      row.className = "cce-inline-row";
      const label = document.createElement("span");
      label.className = "cce-inline-label cce-inline-exam";
      label.textContent = "Exam:";
      row.appendChild(label);
      row.appendChild(document.createTextNode(" " + data.exam));
      wrapEl.appendChild(row);
    }

    if (data.prereq) {
      wrapEl.appendChild(document.createElement("br"));
      const row = document.createElement("span");
      row.className = "cce-inline-row";
      const label = document.createElement("span");
      label.className = "cce-inline-label cce-inline-prereq";
      label.textContent = "Prereq:";
      row.appendChild(label);
      row.appendChild(document.createTextNode(" " + data.prereq));
      wrapEl.appendChild(row);
    }
  }

  function buildExtendedData(resolved) {
    let data = {
      name: resolved.name,
      exam: null,
      prereq: null
    };

    if (showExamInfo) {
      if (resolved.examDay || resolved.examSlot) {
        let examParts = [];
        if (resolved.examDay) examParts.push(resolved.examDay);
        if (resolved.examSlot) examParts.push("Slot " + resolved.examSlot);
        data.exam = examParts.join(", ");
      } else {
        data.exam = "In-Class";
      }
    }

    if (showPrerequisites) {
      let decodedPrereqs = [];
      if (resolved.prerequisites && resolved.prerequisites.length > 0) {
        for (const pCode of resolved.prerequisites) {
          const pResolved = resolve(pCode);
          if (pResolved && pResolved.name) {
            decodedPrereqs.push(pResolved.name);
          } else {
            decodedPrereqs.push(pCode);
          }
        }
      }
      let prereqText = decodedPrereqs.join(", ");
      if (resolved.prerequisiteNote) {
        prereqText = prereqText ? (prereqText + " (" + resolved.prerequisiteNote + ")") : resolved.prerequisiteNote;
      }
      data.prereq = prereqText || "None";
    }
    return data;
  }

  // buildTooltipHtml and buildInlineHtml removed — replaced by buildTooltipDom/buildInlineDom

  function splitTextToLines(text, maxChars = 26) {
    if (!text || text.length <= maxChars) return [text || ""];
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if ((currentLine + " " + word).length <= maxChars) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  function renderSvgTooltip(wrap, beforeText, matchText, afterText, data) {
    wrap.textContent = "";

    // Line 1: Header line with course code in bold accent orange
    const headerLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    headerLine.setAttribute("font-weight", "600");
    headerLine.setAttribute("fill", "#0f172a");
    headerLine.setAttribute("font-size", "12px");

    if (beforeText) {
      const beforeSpan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      beforeSpan.textContent = beforeText;
      headerLine.appendChild(beforeSpan);
    }

    const codeSpan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    codeSpan.setAttribute("fill", "#e67e22");
    codeSpan.setAttribute("font-weight", "700");
    codeSpan.textContent = matchText;
    headerLine.appendChild(codeSpan);

    if (afterText) {
      const afterSpan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      afterSpan.textContent = afterText;
      headerLine.appendChild(afterSpan);
    }

    const remainingNameLines = [];

    if (data.name) {
      const prefixLength = (beforeText || "").length + (matchText || "").length + (afterText || "").length;
      const maxLineChars = 38;
      const words = ("(" + data.name + ")").split(" ");

      let line1Name = "";
      let wordIdx = 0;

      // Fit initial word(s) on Line 1 alongside the course code
      while (wordIdx < words.length) {
        const word = words[wordIdx];
        const testLen = prefixLength + (line1Name ? line1Name.length + 1 : 1) + word.length;
        if (testLen <= maxLineChars || (!line1Name && words.length === 1 && testLen <= maxLineChars + 4)) {
          line1Name = line1Name ? line1Name + " " + word : word;
          wordIdx++;
        } else {
          break;
        }
      }

      if (line1Name) {
        const nameSpan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        nameSpan.setAttribute("fill", "#334155");
        nameSpan.setAttribute("font-weight", "600");
        nameSpan.textContent = " " + line1Name;
        headerLine.appendChild(nameSpan);
      }

      // If the name is long, let remaining words wrap across lines needed for the name using the same threshold
      if (wordIdx < words.length) {
        let currentLine = "";
        while (wordIdx < words.length) {
          const word = words[wordIdx];
          if (!currentLine) {
            currentLine = word;
          } else if ((currentLine + " " + word).length <= maxLineChars) {
            currentLine += " " + word;
          } else {
            remainingNameLines.push(currentLine);
            currentLine = word;
          }
          wordIdx++;
        }
        if (currentLine) {
          remainingNameLines.push(currentLine);
        }
      }
    }

    wrap.appendChild(headerLine);

    // Second line(s) for wrapped course name when needed
    remainingNameLines.forEach((line) => {
      const extraNameSpan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      extraNameSpan.setAttribute("x", "8");
      extraNameSpan.setAttribute("dy", "1.25em");
      extraNameSpan.setAttribute("fill", "#334155");
      extraNameSpan.setAttribute("font-weight", "600");
      extraNameSpan.setAttribute("font-size", "11px");
      extraNameSpan.textContent = line;
      wrap.appendChild(extraNameSpan);
    });

    // Exam Info (if present)
    if (data.exam) {
      const examLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      examLine.setAttribute("x", "8");
      examLine.setAttribute("dy", "1.4em");
      examLine.setAttribute("font-size", "11px");

      const examLabel = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      examLabel.setAttribute("fill", "#e67e22");
      examLabel.setAttribute("font-weight", "700");
      examLabel.textContent = "Exam: ";
      examLine.appendChild(examLabel);

      const examText = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      examText.setAttribute("fill", "#475569");
      examText.setAttribute("font-weight", "normal");
      examText.textContent = data.exam;
      examLine.appendChild(examText);

      wrap.appendChild(examLine);
    }

    // Prerequisites (if present)
    if (data.prereq) {
      const prereqLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      prereqLine.setAttribute("x", "8");
      prereqLine.setAttribute("dy", "1.35em");
      prereqLine.setAttribute("font-size", "11px");

      const prereqLabel = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      prereqLabel.setAttribute("fill", "#d35400");
      prereqLabel.setAttribute("font-weight", "700");
      prereqLabel.textContent = "Prereq: ";
      prereqLine.appendChild(prereqLabel);

      const prereqText = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      prereqText.setAttribute("fill", "#475569");
      prereqText.setAttribute("font-weight", "normal");
      prereqText.textContent = data.prereq;
      prereqLine.appendChild(prereqText);

      wrap.appendChild(prereqLine);
    }
  }

  function renderSvgInline(wrap, matchText, data) {
    wrap.textContent = "";

    const nameLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    nameLine.setAttribute("fill", "#0f172a");
    nameLine.setAttribute("font-weight", "600");
    nameLine.textContent = `${matchText} (${data.name})`;
    wrap.appendChild(nameLine);

    if (data.exam) {
      const examLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      examLine.setAttribute("x", "8");
      examLine.setAttribute("dy", "1.4em");

      const examLabel = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      examLabel.setAttribute("fill", "#e67e22");
      examLabel.setAttribute("font-weight", "600");
      examLabel.textContent = "Exam: ";
      examLine.appendChild(examLabel);

      const examText = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      examText.setAttribute("fill", "#475569");
      examText.setAttribute("font-weight", "normal");
      examText.textContent = data.exam;
      examLine.appendChild(examText);

      wrap.appendChild(examLine);
    }

    if (data.prereq) {
      const prereqLine = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      prereqLine.setAttribute("x", "8");
      prereqLine.setAttribute("dy", "1.4em");

      const prereqLabel = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      prereqLabel.setAttribute("fill", "#d35400");
      prereqLabel.setAttribute("font-weight", "600");
      prereqLabel.textContent = "Prereq: ";
      prereqLine.appendChild(prereqLabel);

      const prereqText = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      prereqText.setAttribute("fill", "#475569");
      prereqText.setAttribute("font-weight", "normal");
      prereqText.textContent = data.prereq;
      prereqLine.appendChild(prereqText);

      wrap.appendChild(prereqLine);
    }
  }

  function updateAllDecoratedElements() {
    document.querySelectorAll(`[${PROCESSED_ATTR}="1"]`).forEach(wrap => {
      const key = wrap.dataset.cceKey;
      if (!key) return;
      const resolved = resolve(key);
      if (!resolved) return;

      const data = buildExtendedData(resolved);
      const matchText = wrap.dataset.cceMatch;

      if (wrap.dataset.cceMatch !== undefined || wrap.classList.contains("cce-inline")) {
        wrap.title = `${matchText}: ${data.name}${data.exam ? ' | Exam: ' + data.exam : ''}${data.prereq ? ' | Prereq: ' + data.prereq : ''}`;
      }

      if (wrap.classList.contains("cce-inline")) {
        buildInlineDom(matchText, data, wrap);
        let cell = wrap.closest ? wrap.closest("td, th, [role='cell'], [role='gridcell'], .grid-cell") : null;
        if (cell) {
          cell.style.setProperty("white-space", "normal", "important");
          cell.style.setProperty("overflow", "visible", "important");
          cell.style.setProperty("word-break", "break-word", "important");
          cell.style.setProperty("overflow-wrap", "break-word", "important");
          cell.style.setProperty("height", "auto", "important");
          cell.style.setProperty("max-height", "none", "important");
          if (cell.hasAttribute("nowrap")) cell.removeAttribute("nowrap");
        }
      } else if (wrap.tagName.toUpperCase() === "TSPAN" && !wrap.classList.contains("cce-highlight") && !wrap.classList.contains("cce-tooltip-wrap") && !wrap.dataset.cceName) {
        renderSvgInline(wrap, matchText, data);
      }
    });
  }

  // Checks if the extension should run on this site.
  // We also check ancestor frames to make sure it works inside iframes (like embedded google sheets)!
  function isHostAllowed(host, allowedSites) {
    const matches = (h) =>
      allowedSites.some((pattern) => {
        const re = "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
        return new RegExp(re, "i").test(h);
      });

    if (matches(host)) return true;

    // Check ancestor frames for cross-origin iframes
    if (window.location.ancestorOrigins) {
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
      if (window !== window.top && window.top.location.hostname) {
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
        border-bottom: 1px dashed #ff8000;
        color: inherit;
      }
      .cce-highlight {
        position: relative;
        display: inline;
        cursor: help;
        background-color: #ffe6cc;
        color: #4a2500;
        padding: 0 2px;
        border-radius: 3px;
        font-weight: 500;
      }
      .cce-global-tooltip {
        visibility: hidden;
        opacity: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        color: #1e293b;
        font-size: 13px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        padding: 10px 16px 12px;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        border-top: 3px solid #e67e22; /* University branding orange accent */
        max-width: 360px;
        width: max-content;
        box-sizing: border-box;
        text-align: center;
        word-wrap: break-word;
        position: fixed;
        z-index: 2147483647;
        transform: translateX(-50%) translateY(8px) scale(0.96);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
        transition: opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.18s;
        pointer-events: none;
      }
      .cce-global-tooltip.cce-visible {
        visibility: visible;
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
      }
      .cce-tooltip-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
      }
      .cce-tooltip-name {
        font-weight: 600;
        font-size: 1.05em;
        line-height: 1.3;
        color: #0f172a;
      }
      .cce-tooltip-details {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        gap: 3px;
        margin-top: 4px;
        padding-top: 6px;
        border-top: 1px solid #f1f5f9;
      }
      .cce-detail-row {
        font-size: 0.92em;
        color: #475569;
        text-align: center;
        line-height: 1.35;
      }
      .cce-detail-label {
        font-weight: 600;
        color: #e67e22;
        margin-right: 3px;
      }
      .cce-inline {
        display: inline;
        white-space: normal !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        line-height: 1.35;
        cursor: help;
      }
      .cce-inline-title {
        font-weight: 600;
        white-space: normal !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }
      .cce-inline-row {
        white-space: normal !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
      }
      .cce-inline-sep {
        color: #cbd5e1;
        margin: 0 4px;
      }
      .cce-inline-label {
        font-weight: 600;
      }
      .cce-inline-exam {
        color: #e67e22;
      }
      .cce-inline-prereq {
        color: #d35400;
      }
      /* Prevent table cells, grid cells, and popup containers from clipping inline decoded courses */
      td:has(.cce-inline),
      th:has(.cce-inline),
      [role="cell"]:has(.cce-inline),
      [role="gridcell"]:has(.cce-inline),
      .grid-cell:has(.cce-inline) {
        white-space: normal !important;
        overflow: visible !important;
        word-break: break-word !important;
        overflow-wrap: break-word !important;
        height: auto !important;
        max-height: none !important;
      }
      /* Highcharts chart tooltip and container overflow fixes */
      .highcharts-container,
      .highcharts-container svg,
      svg.highcharts-root {
        overflow: visible !important;
      }
      .highcharts-tooltip .highcharts-label-box {
        display: none !important;
      }
      .highcharts-tooltip {
        pointer-events: none;
      }
      .cce-custom-tooltip-group {
        pointer-events: none;
      }
    `;
    (document.head || document.documentElement).appendChild(style);

    // One global tooltip element, repositioned on mouseover
    const globalTooltip = document.createElement("div");
    globalTooltip.className = "cce-global-tooltip";
    (document.body || document.documentElement).appendChild(globalTooltip);

    document.addEventListener("mouseover", (e) => {
      const target = e.target.closest
        ? e.target.closest(".cce-tooltip-wrap, .cce-highlight, .cce-inline")
        : null;
      if (target && target.dataset.cceKey) {
        const resolved = resolve(target.dataset.cceKey);
        if (!resolved) return;
        const data = buildExtendedData(resolved);
        globalTooltip.textContent = "";
        buildTooltipDom(data, globalTooltip);
        globalTooltip.classList.add("cce-visible");
        const rect = target.getBoundingClientRect();
        const tipRect = globalTooltip.getBoundingClientRect();
        const tipWidth = tipRect.width || 280;
        const tipHeight = tipRect.height || 100;

        let left = rect.left + rect.width / 2;
        const halfW = tipWidth / 2;
        if (left - halfW < 12) {
          left = halfW + 12;
        } else if (left + halfW > window.innerWidth - 12) {
          left = window.innerWidth - halfW - 12;
        }
        globalTooltip.style.left = left + "px";

        if (rect.top >= tipHeight + 16) {
          globalTooltip.style.top = "auto";
          globalTooltip.style.bottom = (window.innerHeight - rect.top + 8) + "px";
        } else {
          globalTooltip.style.bottom = "auto";
          globalTooltip.style.top = (rect.bottom + 8) + "px";
        }
      }
    });

    document.addEventListener("mouseout", (e) => {
      if (e.target.closest && e.target.closest(".cce-tooltip-wrap, .cce-highlight, .cce-inline")) {
        globalTooltip.classList.remove("cce-visible");
      }
    });

    document.addEventListener("mousemove", (e) => {
      if (!enabled) return;
      const chartContainer = e.target.closest ? e.target.closest(".highcharts-container") : null;
      if (chartContainer) {
        const tg = chartContainer.querySelector(".highcharts-tooltip");
        if (tg) {
          adjustHighchartsTooltipBackground(tg);
        }
      }
    }, { passive: true });
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
        if (shouldSkipElement(el)) continue;
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
        const titleEl = elForTitle.querySelector("title");
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

    // CSS tooltips don't work in SVGs, so we force highlight mode for charts
    let effectiveMode = mode;
    if (isSvg && !isTooltip) effectiveMode = "highlight";
    else if (isTooltip) effectiveMode = "inline";

    const frag = document.createDocumentFragment();
    let lastIndex = 0;
    let match;
    let replaced = false;
    let lastMatchHadDetails = false;

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
        wrap.classList.add("cce-highlight");
                wrap.style.cursor = "help";
        wrap.setAttribute("fill", "#ff8000");
        wrap.setAttribute("font-weight", "bold");
        wrap.textContent = text;
        frag.appendChild(wrap);
        break;
      }

      // Add the normal text before the matched course (for tooltips, beforeText is handled inside renderSvgTooltip)
      if (!isTooltip && match.index > lastIndex) {
        const interText = text.slice(lastIndex, match.index);
        if (effectiveMode === "inline" && lastMatchHadDetails) {
          frag.appendChild(document.createElement("br"));
          if (interText.trim()) {
            frag.appendChild(document.createTextNode(interText.trim() + " "));
          }
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
          wrap.setAttribute("font-weight", "bold");
          const beforeText = text.slice(lastIndex, match.index);
          const afterText = text.slice(match.index + match[0].length);
          renderSvgTooltip(wrap, beforeText, match[0], afterText, data);
          frag.appendChild(wrap);
          lastIndex = text.length;
          break;
        } else if (effectiveMode === "inline") {
          wrap.setAttribute("font-weight", "bold");
          renderSvgInline(wrap, match[0], data);
        } else {
          // Regular highlight in an SVG
          wrap.style.cursor = "help";
                    wrap.setAttribute("fill", "#ff8000");
          if (effectiveMode === "highlight") {
            wrap.classList.add("cce-highlight");
            wrap.setAttribute("font-weight", "bold");
          } else {
            wrap.classList.add("cce-tooltip-wrap");
            wrap.setAttribute("text-decoration", "underline");
          }
          wrap.textContent = match[0];
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
                    wrap.title = `${match[0]}: ${data.name}${data.exam ? ' | Exam: ' + data.exam : ''}${data.prereq ? ' | Prereq: ' + data.prereq : ''}`;
          buildInlineDom(match[0], data, wrap);
          lastMatchHadDetails = !!(data.exam || data.prereq);
        }
        frag.appendChild(wrap);
      }

      lastIndex = match.index + match[0].length;
    }

    if (!replaced) return null;

    if (!isTooltip && !isHighchartsTruncated && lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    // If inline courses were added inside a table cell, prevent clipping
    if (replaced && effectiveMode === "inline") {
      let cell = textNode.parentElement ? textNode.parentElement.closest("td, th, [role='cell'], [role='gridcell'], .grid-cell") : null;
      if (cell) {
        cell.style.setProperty("white-space", "normal", "important");
        cell.style.setProperty("overflow", "visible", "important");
        cell.style.setProperty("word-break", "break-word", "important");
        cell.style.setProperty("overflow-wrap", "break-word", "important");
        cell.style.setProperty("height", "auto", "important");
        cell.style.setProperty("max-height", "none", "important");
        if (cell.hasAttribute("nowrap")) cell.removeAttribute("nowrap");
      }
    }

    // Remove old <title> attributes so they don't block our custom tooltip
    if (titleElToRemove) titleElToRemove.remove();
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

        // If we just edited text inside a Highcharts tooltip, fix its background box immediately!
        let tg = parent;
        while (tg && tg !== document.documentElement) {
          if (tg.classList && tg.classList.contains("highcharts-tooltip")) break;
          tg = tg.parentNode;
        }
        if (tg && tg !== document.documentElement) {
          adjustHighchartsTooltipBackground(tg);
        }
      }
    }
  }

  // Highcharts draws its tooltips perfectly wrapped to the original short text.
  // Since we add the decoded course info, we stretch and reposition the background box manually!
  function adjustHighchartsTooltipBackground(tooltipGroup) {
    if (!tooltipGroup) return;

    const svgEl = tooltipGroup.ownerSVGElement;
    if (svgEl) {
      svgEl.style.overflow = "visible";
      let p = svgEl.parentElement;
      while (p && p !== document.body) {
        if (p.classList && p.classList.contains("highcharts-container")) {
          p.style.overflow = "visible";
          break;
        }
        p = p.parentElement;
      }
    }

    const origBox = tooltipGroup.querySelector(".highcharts-label-box");
    if (origBox) {
      origBox.style.display = "none";
    }

    const doAdjust = () => {
      if (!tooltipGroup.isConnected) return;
      const textEl = tooltipGroup.querySelector("text");
      if (!textEl) return;

      const bbox = textEl.getBBox();
      if (!bbox || bbox.width <= 0) return;

      let customBgGroup = tooltipGroup.querySelector(".cce-custom-tooltip-group");

      if (!customBgGroup) {
        customBgGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        customBgGroup.setAttribute("class", "cce-custom-tooltip-group");
        customBgGroup.style.pointerEvents = "none";

        let defs = svgEl ? svgEl.querySelector("defs") : null;
        if (svgEl && !defs) {
          defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
          svgEl.prepend(defs);
        }

        if (defs) {
          let filter = defs.querySelector("#cce-shadow");
          if (!filter) {
            filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
            filter.setAttribute("id", "cce-shadow");
            filter.setAttribute("x", "-20%");
            filter.setAttribute("y", "-20%");
            filter.setAttribute("width", "140%");
            filter.setAttribute("height", "140%");
            const feDropShadow = document.createElementNS("http://www.w3.org/2000/svg", "feDropShadow");
            feDropShadow.setAttribute("dx", "0");
            feDropShadow.setAttribute("dy", "6");
            feDropShadow.setAttribute("stdDeviation", "5");
            feDropShadow.setAttribute("flood-color", "#000000");
            feDropShadow.setAttribute("flood-opacity", "0.12");
            filter.appendChild(feDropShadow);
            defs.appendChild(filter);
          }
        }

        const customBg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        customBg.setAttribute("class", "cce-custom-tooltip-bg");
        customBg.setAttribute("fill", "rgba(255, 255, 255, 0.98)");
        customBg.setAttribute("stroke", "#e2e8f0");
        customBg.setAttribute("stroke-width", "1");
        customBg.setAttribute("rx", "8");
        customBg.setAttribute("filter", "url(#cce-shadow)");
        customBgGroup.appendChild(customBg);

        const customTopBorder = document.createElementNS("http://www.w3.org/2000/svg", "path");
        customTopBorder.setAttribute("class", "cce-custom-tooltip-border");
        customTopBorder.setAttribute("stroke", "#e67e22");
        customTopBorder.setAttribute("stroke-width", "3");
        customTopBorder.setAttribute("fill", "none");
        customBgGroup.appendChild(customTopBorder);

        tooltipGroup.insertBefore(customBgGroup, tooltipGroup.firstChild);
      }

      const padX = 14;
      const padY = 12;
      const boxX = bbox.x - padX;
      const boxY = bbox.y - padY;
      const boxW = Math.max(160, bbox.width + (padX * 2));
      const boxH = bbox.height + (padY * 2);

      const customBg = customBgGroup.querySelector(".cce-custom-tooltip-bg");
      if (customBg) {
        customBg.setAttribute("x", boxX);
        customBg.setAttribute("y", boxY);
        customBg.setAttribute("width", boxW);
        customBg.setAttribute("height", boxH);
      }

      const customTopBorder = customBgGroup.querySelector(".cce-custom-tooltip-border");
      if (customTopBorder) {
        const radius = 8;
        customTopBorder.setAttribute("d", `
          M ${boxX} ${boxY + radius} 
          Q ${boxX} ${boxY} ${boxX + radius} ${boxY} 
          L ${boxX + boxW - radius} ${boxY} 
          Q ${boxX + boxW} ${boxY} ${boxX + boxW} ${boxY + radius}
        `);
      }

      // Keep tooltip inside chart boundaries (prevent clipping on right or bottom edges)
      if (svgEl) {
        const currentTransform = tooltipGroup.getAttribute("transform") || "";
        const match = currentTransform.match(/translate\(([\d.-]+)[,\s]+([\d.-]+)\)/);
        if (match) {
          let tx = parseFloat(match[1]);
          let ty = parseFloat(match[2]);
          const svgW = svgEl.clientWidth || svgEl.getBoundingClientRect().width || 600;
          const svgH = svgEl.clientHeight || svgEl.getBoundingClientRect().height || 300;

          if (tx + boxX + boxW > svgW) {
            tx = Math.max(8, svgW - boxW - boxX - 8);
          }
          if (tx + boxX < 4) {
            tx = 4 - boxX;
          }
          if (ty + boxY + boxH > svgH) {
            ty = Math.max(8, svgH - boxH - boxY - 8);
          }
          if (ty + boxY < 4) {
            ty = 4 - boxY;
          }

          tooltipGroup.setAttribute("transform", `translate(${tx}, ${ty})`);
        }
      }
    };

    doAdjust();
    requestAnimationFrame(doAdjust);
  }

  // We queue up DOM changes and process them in batches every 100ms
  // so we don't lag the page when lots of nodes are added at once
  let scanTimeout = null;
  const nodesToProcess = new Set();

  function processQueuedNodes() {
    scanTimeout = null;
    if (!enabled || !courseRegex) return;

    for (const node of nodesToProcess) {
      if (!document.contains(node)) continue;

      if (node.nodeType === Node.ELEMENT_NODE) {
        normalizeCourseSplits(node);
        processNode(node);
      } else if (node.nodeType === Node.TEXT_NODE && !isInsideSkippedElement(node)) {
        if (node.parentNode) normalizeCourseSplits(node.parentNode);
        const frag = processTextNode(node);
        if (frag && node.parentNode) {
          const parent = node.parentNode;
          parent.replaceChild(frag, node);

          // If we just edited text inside a Highcharts tooltip, fix its background box
          let tg = parent;
          while (tg && tg !== document.documentElement) {
            if (tg.classList && tg.classList.contains("highcharts-tooltip")) break;
            tg = tg.parentNode;
          }
          if (tg && tg !== document.documentElement) {
            adjustHighchartsTooltipBackground(tg);
          }
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
              const isTooltip = (node.nodeType === Node.ELEMENT_NODE && node.classList && node.classList.contains("highcharts-tooltip")) ||
                (node.parentElement && node.parentElement.closest && node.parentElement.closest(".highcharts-tooltip"));
              if (isTooltip) {
                if (node.nodeType === Node.TEXT_NODE) {
                  const frag = processTextNode(node);
                  if (frag && node.parentNode) {
                    const parent = node.parentNode;
                    parent.replaceChild(frag, node);
                    let tg = parent;
                    while (tg && tg !== document.documentElement) {
                      if (tg.classList && tg.classList.contains("highcharts-tooltip")) break;
                      tg = tg.parentNode;
                    }
                    if (tg && tg !== document.documentElement) {
                      adjustHighchartsTooltipBackground(tg);
                    }
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
                let tg = parent;
                while (tg && tg !== document.documentElement) {
                  if (tg.classList && tg.classList.contains("highcharts-tooltip")) break;
                  tg = tg.parentNode;
                }
                if (tg && tg !== document.documentElement) {
                  adjustHighchartsTooltipBackground(tg);
                }
              }
            } else {
              scheduleProcess(target);
            }
          }
        }
      }
    });
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });
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
    startObserver();
  }

  function undecorateAll() {
    document.querySelectorAll(`[${PROCESSED_ATTR}="1"]`).forEach(wrap => {
      if (wrap.parentNode) {
        const textNode = document.createTextNode(wrap.dataset.cceMatch);
        wrap.parentNode.replaceChild(textNode, wrap);
      }
    });

    // Restore Highcharts backgrounds
    document.querySelectorAll(".cce-custom-tooltip-group").forEach(el => el.remove());
    document.querySelectorAll(".highcharts-label-box").forEach(el => {
      if (el.style.display === "none") el.style.display = "";
    });

    // Merge adjacent text nodes so re-matching doesn't break across fragments
    try {
      (document.body || document.documentElement).normalize();
    } catch (e) {}
  }

  if (chrome?.storage?.local?.get) {
    try {
      chrome.storage.local.get(
        ["courses", "mode", "allowedSites", "showExamInfo", "showPrerequisites"],
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
          let needsFullRedecoration = false;
          let needsDomUpdate = false;

          if (changes.allowedSites !== undefined) {
            const allowedSites = changes.allowedSites.newValue || [];
            const isNowEnabled = isHostAllowed(window.location.hostname, allowedSites);
            if (isNowEnabled !== enabled) {
              enabled = isNowEnabled;
              if (!enabled) {
                stopObserver();
                undecorateAll();
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
            if (courseRegex) {
              injectStyles();
              stopObserver();
              undecorateAll();
              const rootNode = document.body || document.documentElement;
              if (rootNode) {
                normalizeCourseSplits(rootNode);
                processNode(rootNode);
                startObserver();
              }
            }
          } else if (needsDomUpdate && enabled) {
            stopObserver();
            updateAllDecoratedElements();
            startObserver();
          }
        }
      });
    } catch (_) {
      // Listener registration failed or context invalidated
    }
  }
})();
