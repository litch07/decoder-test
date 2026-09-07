// popup.js — The logic behind the extension's popup UI

(async function () {
  "use strict";

  // Grab all our UI elements upfront
  const els = {
    courseCount: document.getElementById("courseCount"),
    currentSite: document.getElementById("currentSite"),
    siteToggle: document.getElementById("siteToggle"),
    toggleLabel: document.getElementById("toggleLabel"),
    statusDot: document.getElementById("statusDot"),
    statusText: document.getElementById("statusText"),
    syncBtn: document.getElementById("syncBtn"),
    syncBtnText: document.getElementById("syncBtnText"),
    syncTime: document.getElementById("syncTime"),
    openCoursesBtn: document.getElementById("openCoursesBtn"),
    allowlistInput: document.getElementById("allowlistInput"),
    allowlistBtn: document.getElementById("allowlistBtn"),
    allowlistContainer: document.getElementById("allowlistContainer"),
    modeRadios: document.querySelectorAll('input[name="mode"]'),
    showExamInfoToggle: document.getElementById("showExamInfoToggle"),
    showPrerequisitesToggle: document.getElementById("showPrerequisitesToggle"),
    viewWrapper: document.getElementById("viewWrapper"),
    openSettingsBtn: document.getElementById("openSettingsBtn"),
    settingsBackBtn: document.getElementById("settingsBackBtn"),
    backBtn: document.getElementById("backBtn"),
    coursesPanelTitle: document.getElementById("coursesPanelTitle"),
    viewTrashBtn: document.getElementById("viewTrashBtn"),
    trashBadge: document.getElementById("trashBadge"),
    coursesPanelCount: document.getElementById("coursesPanelCount"),
    trashActionsRow: document.getElementById("trashActionsRow"),
    restoreAllBtn: document.getElementById("restoreAllBtn"),
    emptyTrashBtn: document.getElementById("emptyTrashBtn"),
    courseList: document.getElementById("courseList"),
    courseSearch: document.getElementById("courseSearch"),
    courseFilterRow: document.getElementById("courseFilterRow"),
    filterBtns: document.querySelectorAll("#courseFilterRow .filter-btn"),
    jsonInput: document.getElementById("jsonInput"),
    importSection: document.getElementById("importSection"),
    importBtn: document.getElementById("importBtn"),
    clearBtn: document.getElementById("clearBtn"),
    importMsg: document.getElementById("importMsg"),
    copySampleBtn: document.getElementById("copySampleBtn"),
    openImportBtn: document.getElementById("openImportBtn"),
    importBackBtn: document.getElementById("importBackBtn"),
    detailsBackBtn: document.getElementById("detailsBackBtn"),
    detailsCourseCode: document.getElementById("detailsCourseCode"),
    detailName: document.getElementById("detailName"),
    detailPrereq: document.getElementById("detailPrereq"),
    detailDay: document.getElementById("detailDay"),
    detailSlot: document.getElementById("detailSlot"),
    detailSaveBtn: document.getElementById("detailSaveBtn"),
    detailDelBtn: document.getElementById("detailDelBtn"),
    confirmModal: document.getElementById("confirmModal"),
    modalText: document.getElementById("modalText"),
    modalCancelBtn: document.getElementById("modalCancelBtn"),
    modalConfirmBtn: document.getElementById("modalConfirmBtn"),
    resetDefaultsBtn: document.getElementById("resetDefaultsBtn"),
    resetDefaultsBtnText: document.getElementById("resetDefaultsBtnText"),
    syncResultBox: document.getElementById("syncResultBox"),
    syncResultDot: document.getElementById("syncResultDot"),
    syncResultTitle: document.getElementById("syncResultTitle"),
    syncResultTime: document.getElementById("syncResultTime"),
    syncResultDesc: document.getElementById("syncResultDesc"),
    syncResultBadges: document.getElementById("syncResultBadges"),
    syncResultDetails: document.getElementById("syncResultDetails"),
  };

  let currentEditingCode = null;
  let pendingAction = null;
  let pendingSaveVal = null;
  let pendingTarget = null;
  let isTrashMode = false;
  let bundledCourses = {};
  let remoteCourses = {};

  // Helper to create SVG icons safely
  function createIcon(type) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    if (type === 'default') {
      svg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
      path.setAttribute("d", "M12 2v4c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8V2zm1.88 3.88L17.76 9.76l-1.41 1.41L12.46 7.29 8.59 11.17l-1.41-1.41 5.29-5.29 1.41 1.41z");
    } else if (type === 'spinner') {
      svg.setAttribute("style", "width:13px;height:13px;fill:currentColor;animation:spin 1s linear infinite;");
      path.setAttribute("d", "M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8z");
      if (!document.getElementById('spin-style')) {
        const style = document.createElement('style');
        style.id = 'spin-style';
        style.textContent = "@keyframes spin{100%{transform:rotate(360deg);}}";
        document.head.appendChild(style);
      }
    } else if (type === 'success') {
      svg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
      path.setAttribute("d", "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z");
    } else if (type === 'error') {
      svg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
      path.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    } else if (type === 'delete') {
      svg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
      path.setAttribute("d", "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z");
    } else if (type === 'remove') {
      svg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
      path.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    }

    svg.appendChild(path);
    return svg;
  }

  let currentHost = "";
  let courses = {};
  let userCourses = {};
  let softDeletedCourses = [];
  let hardDeletedCourses = [];
  let currentMode = "highlight";
  let showExamInfo = false;
  let showPrerequisites = false;
  let allowedSites = [];
  let currentTabId = null;
  let searchQuery = "";
  let currentFilter = "all";
  let lastSyncedAt = null;
  let lastSyncResult = null;

  async function init() {
    await fetchTabInfo();
    await loadStorageData();
    setupUI();
    attachEventListeners();
  }

  async function fetchTabInfo() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      currentTabId = tab.id;
      try {
        const url = new URL(tab.url);
        if (url.protocol.startsWith("http")) currentHost = url.hostname;
      } catch (_) {
        currentHost = "";
      }
    }
  }

  async function loadStorageData() {
    const stored = await chrome.storage.local.get(["courses", "userCourses", "softDeletedCourses", "mode", "allowedSites", "showExamInfo", "showPrerequisites", "lastSyncedAt", "remoteCourses", "hardDeletedCourses", "lastSyncResult"]);
    courses = stored.courses || {};
    userCourses = stored.userCourses || {};
    softDeletedCourses = stored.softDeletedCourses || [];
    hardDeletedCourses = stored.hardDeletedCourses || [];
    currentMode = stored.mode || "highlight";
    allowedSites = stored.allowedSites || [];
    showExamInfo = stored.showExamInfo || false;
    showPrerequisites = stored.showPrerequisites || false;
    lastSyncedAt = stored.lastSyncedAt || null;
    remoteCourses = stored.remoteCourses || {};
    lastSyncResult = stored.lastSyncResult || null;

    try {
      const res = await fetch(chrome.runtime.getURL("courses.json"));
      if (res.ok) {
        bundledCourses = await res.json();
      }
    } catch (e) {
      console.warn("Failed to load bundled courses", e);
    }
  }

  function formatRelativeTime(timestamp) {
    if (!timestamp) return "Never";
    const seconds = Math.floor((new Date() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return "Never synced";
    const rel = formatRelativeTime(timestamp);
    if (rel === "Just now") return "Just now";
    return `Last synced: ${rel}`;
  }

  function setupUI() {
    els.currentSite.textContent = currentHost || "Unsupported page";

    // Disable the site toggle if we're on a non-web page (like chrome://)
    if (!currentHost) {
      els.siteToggle.disabled = true;
      els.toggleLabel.style.opacity = "0.5";
      els.toggleLabel.style.cursor = "not-allowed";
    }

    updateCourseCount();
    updateToggleAndStatus();
    renderAllowlist();

    const activeRadio = Array.from(els.modeRadios).find(r => r.value === currentMode);
    if (activeRadio) activeRadio.checked = true;

    els.showExamInfoToggle.checked = showExamInfo;
    els.showPrerequisitesToggle.checked = showPrerequisites;
    els.syncTime.textContent = formatTimeAgo(lastSyncedAt);
    renderSyncResult(lastSyncResult);
  }

  function updateCourseCount() {
    const count = Object.keys(courses).length;
    els.courseCount.textContent = count.toLocaleString();
    els.coursesPanelCount.textContent = `${count.toLocaleString()} courses loaded`;

    if (els.trashBadge) {
      if (softDeletedCourses.length > 0) {
        els.trashBadge.style.display = "flex";
        els.trashBadge.textContent = softDeletedCourses.length > 99 ? "99+" : softDeletedCourses.length;
      } else {
        els.trashBadge.style.display = "none";
      }
    }

    if (els.restoreAllBtn) {
      if (softDeletedCourses.length > 0) {
        els.restoreAllBtn.style.opacity = "1";
        els.restoreAllBtn.style.cursor = "pointer";
        els.emptyTrashBtn.style.opacity = "1";
        els.emptyTrashBtn.style.cursor = "pointer";
      } else {
        els.restoreAllBtn.style.opacity = "0.5";
        els.restoreAllBtn.style.cursor = "not-allowed";
        els.emptyTrashBtn.style.opacity = "0.5";
        els.emptyTrashBtn.style.cursor = "not-allowed";
      }
    }
  }

  // Matches domains with wildcards. Duplicated from content.js so the popup
  // can show the correct active/inactive status instantly!
  function isHostAllowed(host, sites) {
    if (!host) return false;
    return sites.some(pattern => {
      const regex = "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
      return new RegExp(regex, "i").test(host);
    });
  }

  function updateToggleAndStatus() {
    const enabled = isHostAllowed(currentHost, allowedSites);
    els.siteToggle.checked = enabled;

    if (enabled) {
      els.statusDot.className = "status-dot active";
      els.statusText.textContent = "Active on this page";
      els.statusText.style.color = "var(--success)";
    } else {
      els.statusDot.className = "status-dot inactive";
      els.statusText.textContent = "Disabled on this site";
      els.statusText.style.color = "var(--text-muted)";
    }
  }

  function renderAllowlist() {
    els.allowlistContainer.textContent = "";

    if (allowedSites.length === 0) {
      const msg = document.createElement("div");
      msg.style.padding = "7px";
      msg.style.textAlign = "center";
      msg.style.color = "var(--text-muted)";
      msg.style.fontSize = "0.7rem";
      msg.textContent = "No domains allowed yet.";
      els.allowlistContainer.appendChild(msg);
      return;
    }

    const frag = document.createDocumentFragment();
    allowedSites.forEach(site => {
      const div = document.createElement("div");
      div.className = "allowlist-item";

      const span = document.createElement("span");
      span.textContent = site;

      const btn = document.createElement("button");
      btn.appendChild(createIcon('remove'));
      btn.title = `Remove ${site}`;
      btn.addEventListener("click", async () => {
        allowedSites = allowedSites.filter(s => s !== site);
        await chrome.storage.local.set({ allowedSites });
        renderAllowlist();
        updateToggleAndStatus();
      });

      div.appendChild(span);
      div.appendChild(btn);
      frag.appendChild(div);
    });

    els.allowlistContainer.appendChild(frag);
  }

  function mergeCourseEntry(baseValue, overrideValue) {
    let bVal = baseValue || { examDay: "", examSlot: "", prerequisites: [] };
    if (typeof bVal === "string") {
      bVal = { examDay: "", examSlot: "", prerequisites: [], name: bVal };
    }
    if (overrideValue && typeof overrideValue === "object") {
      return { ...bVal, ...overrideValue };
    } else if (typeof overrideValue === "string") {
      return { ...bVal, name: overrideValue };
    }
    return bVal;
  }

  function getSoftDeletedCourseData(code) {
    let val = bundledCourses[code];
    if (remoteCourses[code]) val = mergeCourseEntry(val, remoteCourses[code]);
    if (userCourses[code]) val = mergeCourseEntry(val, userCourses[code]);
    return val;
  }

  async function reloadLocalCoursesState() {
    const data = await chrome.storage.local.get(["courses", "softDeletedCourses", "userCourses", "remoteCourses", "hardDeletedCourses"]);
    courses = data.courses || {};
    softDeletedCourses = data.softDeletedCourses || [];
    userCourses = data.userCourses || {};
    remoteCourses = data.remoteCourses || {};
    hardDeletedCourses = data.hardDeletedCourses || [];
    updateCourseCount();
  }

  function renderTrashList(filter = "") {
    const lc = filter.toLowerCase().trim();
    const entries = softDeletedCourses
      .map(code => ({ code, data: getSoftDeletedCourseData(code) }))
      .filter(({ code, data }) => {
        const name = typeof data === "object" && data !== null ? (data.name || "") : (data || "");
        return !lc || String(code).toLowerCase().includes(lc) || String(name).toLowerCase().includes(lc);
      })
      .sort((a, b) => a.code.localeCompare(b.code));

    if (entries.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";

      const emptyIcon = document.createElement("div");
      emptyIcon.className = "empty-icon";
      emptyIcon.textContent = filter ? "🔍" : "🗑️";
      emptyState.appendChild(emptyIcon);

      if (filter) {
        emptyState.appendChild(document.createTextNode('No results for "'));
        const strong = document.createElement("strong");
        strong.textContent = filter;
        emptyState.appendChild(strong);
        emptyState.appendChild(document.createTextNode('"'));
      } else {
        emptyState.appendChild(document.createTextNode("No courses in the trash."));
      }

      els.courseList.textContent = "";
      els.courseList.appendChild(emptyState);
      return;
    }

    const frag = document.createDocumentFragment();
    entries.forEach(({ code, data }) => {
      const row = document.createElement("div");
      row.className = "course-row";
      row.style.cursor = "default";

      const name = typeof data === "object" && data !== null ? (data.name || "") : (data || "Unknown Course");

      const textCol = document.createElement("div");
      textCol.style.flex = "1";
      textCol.style.display = "flex";
      textCol.style.flexDirection = "column";

      const codeEl = document.createElement("span");
      codeEl.className = "course-row-code";
      codeEl.textContent = code;

      const nameEl = document.createElement("span");
      nameEl.className = "course-row-name";
      nameEl.textContent = name;

      textCol.appendChild(codeEl);
      textCol.appendChild(nameEl);

      const actionCol = document.createElement("div");
      actionCol.style.display = "flex";
      actionCol.style.gap = "4px";

      const restoreBtn = document.createElement("button");
      restoreBtn.className = "btn-icon restore";
      restoreBtn.title = "Restore";
      restoreBtn.innerHTML = '<svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.896 8.896 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>';
      restoreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        pendingAction = "restore";
        pendingTarget = code;
        els.modalText.textContent = `Are you sure you want to restore ${code}? It will become visible again.`;
        els.confirmModal.classList.add("show");
      });

      const permDelBtn = document.createElement("button");
      permDelBtn.className = "btn-icon delete";
      permDelBtn.title = "Permanently Delete";
      permDelBtn.innerHTML = '<svg style="width:14px;height:14px;fill:currentColor;" viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
      permDelBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        pendingAction = "perm-delete";
        pendingTarget = code;
        els.modalText.textContent = `This will permanently remove this course. It will no longer appear anywhere in the extension, including Trash, unless manually re-added through Import.`;
        els.confirmModal.classList.add("show");
      });

      actionCol.appendChild(restoreBtn);
      actionCol.appendChild(permDelBtn);

      row.appendChild(textCol);
      row.appendChild(actionCol);
      frag.appendChild(row);
    });

    els.courseList.textContent = "";
    els.courseList.appendChild(frag);
  }

  function renderCourseList(filter = "") {
    const lc = filter.toLowerCase().trim();
    const entries = Object.entries(courses)
      .filter(([code, courseData]) => {
        const name = typeof courseData === "object" && courseData !== null ? (courseData.name || "") : (courseData || "");

        if (lc && !String(code).toLowerCase().includes(lc) && !String(name).toLowerCase().includes(lc)) {
          return false;
        }

        const inBundled = !!bundledCourses[code];
        const inRemote = !!remoteCourses[code];
        const inUser = !!userCourses[code];

        let origin = "";
        if (!inBundled && !inRemote && inUser) {
          origin = "user";
        } else if ((inBundled || inRemote) && inUser) {
          origin = "edited";
        } else {
          origin = "official";
        }

        if (currentFilter !== "all" && currentFilter !== origin) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a[0].localeCompare(b[0]));

    if (entries.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";

      const emptyIcon = document.createElement("div");
      emptyIcon.className = "empty-icon";
      emptyIcon.textContent = filter ? "🔍" : "📚";
      emptyState.appendChild(emptyIcon);

      if (filter) {
        emptyState.appendChild(document.createTextNode('No results for "'));
        const strong = document.createElement("strong");
        strong.textContent = filter;
        emptyState.appendChild(strong);
        emptyState.appendChild(document.createTextNode('"'));
      } else {
        emptyState.appendChild(document.createTextNode("No courses loaded yet. Import from JSON below."));
      }

      els.courseList.textContent = "";
      els.courseList.appendChild(emptyState);
      return;
    }

    els.courseList.textContent = "";

    const headerRow = document.createElement("div");
    headerRow.className = "course-grid-header";
    headerRow.innerHTML = `
      <div>Code</div>
      <div>Name</div>
      <div style="text-align: right;">Type</div>
    `;
    els.courseList.appendChild(headerRow);

    const frag = document.createDocumentFragment();
    entries.forEach(([code, courseData]) => {
      const row = document.createElement("div");
      row.className = "course-grid-row";

      const name = typeof courseData === "object" && courseData !== null ? (courseData.name || "") : (courseData || "");

      const codeEl = document.createElement("div");
      codeEl.className = "course-row-code";
      codeEl.textContent = code;
      codeEl.title = code;

      const nameEl = document.createElement("div");
      nameEl.className = "course-row-name";
      nameEl.textContent = name;
      nameEl.title = name;

      const inBundled = !!bundledCourses[code];
      const inRemote = !!remoteCourses[code];
      const inUser = !!userCourses[code];

      let originClass = "";
      let originLabel = "";
      if (!inBundled && !inRemote && inUser) {
        originClass = "user-added";
        originLabel = "User Added";
      } else if ((inBundled || inRemote) && inUser) {
        originClass = "edited";
        originLabel = "Edited";
      } else {
        originClass = "official";
        originLabel = "Official";
      }

      const typeEl = document.createElement("div");
      typeEl.className = "course-row-type";

      const badge = document.createElement("span");
      badge.className = `origin-badge ${originClass}`;
      badge.textContent = originLabel;

      typeEl.appendChild(badge);

      row.appendChild(codeEl);
      row.appendChild(nameEl);
      row.appendChild(typeEl);

      row.addEventListener("click", () => {
        openCourseDetails(code, courseData);
      });

      frag.appendChild(row);
    });

    els.courseList.appendChild(frag);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function openCourseDetails(code, courseData) {
    currentEditingCode = code;
    els.detailsCourseCode.textContent = code;

    const name = typeof courseData === "object" && courseData !== null ? (courseData.name || "") : (courseData || "");
    const examDay = typeof courseData === "object" && courseData !== null ? (courseData.examDay || "") : "";
    const examSlot = typeof courseData === "object" && courseData !== null ? (courseData.examSlot || "") : "";
    const prerequisites = typeof courseData === "object" && courseData !== null && courseData.prerequisites ? courseData.prerequisites.join(", ") : "";

    els.detailName.value = name;
    els.detailDay.value = examDay;
    els.detailSlot.value = examSlot;
    els.detailPrereq.value = prerequisites;

    els.detailName.style.borderColor = "";

    els.detailDelBtn.disabled = false;
    els.detailDelBtn.title = "";

    els.viewWrapper.classList.add("show-details");
    els.viewWrapper.classList.remove("show-courses");
  }

  function commitCourseSave(code, newVal) {
    // This is the hook for the confirmation modal to call
    (async () => {
      userCourses[code] = newVal;
      if (softDeletedCourses.includes(code)) {
        softDeletedCourses = softDeletedCourses.filter(c => c !== code);
      }
      if (hardDeletedCourses.includes(code)) {
        hardDeletedCourses = hardDeletedCourses.filter(c => c !== code);
      }
      await chrome.storage.local.set({ userCourses, softDeletedCourses, hardDeletedCourses });

      // Trigger a reload so the background script applies this as an override
      await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
      await reloadLocalCoursesState();

      if (isTrashMode) renderTrashList(searchQuery);
      else renderCourseList(searchQuery);

      els.viewWrapper.classList.remove("show-details");
      els.viewWrapper.classList.add("show-courses");
    })();
  }

  function showImportMsg(type, text) {
    els.importMsg.className = `import-msg ${type}`;
    els.importMsg.textContent = text;
    setTimeout(() => { els.importMsg.className = "import-msg"; }, 4000);
  }

  function showToast(message, type = "info") {
    let toast = document.getElementById("globalToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "globalToast";
      toast.style.position = "fixed";
      toast.style.bottom = "16px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%) translateY(100px)";
      toast.style.padding = "8px 16px";
      toast.style.borderRadius = "99px";
      toast.style.fontSize = "0.72rem";
      toast.style.fontWeight = "600";
      toast.style.zIndex = "9999";
      toast.style.transition = "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease";
      toast.style.opacity = "0";
      toast.style.pointerEvents = "none";
      toast.style.whiteSpace = "nowrap";
      toast.style.display = "flex";
      toast.style.alignItems = "center";
      toast.style.gap = "8px";
      toast.style.boxShadow = "0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
      document.body.appendChild(toast);
    }

    let badgeHtml = "";
    if (type === "success") {
      toast.style.background = "#0f172a";
      toast.style.color = "#ffffff";
      toast.style.border = "1px solid rgba(16, 185, 129, 0.35)";
      badgeHtml = '<span style="display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#10b981;color:#fff;font-size:10px;font-weight:700;flex-shrink:0;">✓</span>';
    } else if (type === "error") {
      toast.style.background = "#0f172a";
      toast.style.color = "#ffffff";
      toast.style.border = "1px solid rgba(239, 68, 68, 0.35)";
      badgeHtml = '<span style="display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#ef4444;color:#fff;font-size:10px;font-weight:700;flex-shrink:0;">✕</span>';
    } else {
      toast.style.background = "#0f172a";
      toast.style.color = "#ffffff";
      toast.style.border = "1px solid rgba(255, 255, 255, 0.15)";
      badgeHtml = '<span style="display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;background:#64748b;color:#fff;font-size:10px;font-weight:700;flex-shrink:0;">ℹ</span>';
    }

    toast.innerHTML = `${badgeHtml}<span>${escapeHtml(message)}</span>`;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(100px)";
    }, 2800);
  }

  function renderSyncResult(stats) {
    if (!els.syncResultBox || !stats) {
      if (els.syncResultBox) {
        els.syncResultBox.classList.remove("show");
        els.syncResultBox.style.display = "none";
      }
      if (els.syncTime) els.syncTime.style.display = "block";
      return;
    }

    const { added = 0, updated = 0, removed = 0, addedCodes = [], updatedCodes = [], removedCodes = [], timestamp } = stats;
    const hasChanges = added > 0 || updated > 0 || removed > 0;

    els.syncResultBox.classList.add("show");
    if (els.syncTime) els.syncTime.style.display = "none";

    if (els.syncResultTime && timestamp) {
      els.syncResultTime.textContent = formatRelativeTime(timestamp);
    }

    const dot = els.syncResultDot || document.getElementById("syncResultDot");
    const desc = els.syncResultDesc || document.getElementById("syncResultDesc");

    if (!hasChanges) {
      if (dot) dot.className = "sync-card-dot";
      els.syncResultTitle.textContent = "Database is up to date";
      if (desc) {
        desc.style.display = "block";
        desc.textContent = "Your local catalog matches the latest official GitHub repository.";
      }
      if (els.syncResultBadges) {
        els.syncResultBadges.style.display = "none";
        els.syncResultBadges.innerHTML = "";
      }
      if (els.syncResultDetails) {
        els.syncResultDetails.style.display = "none";
        els.syncResultDetails.innerHTML = "";
      }
    } else {
      if (dot) dot.className = "sync-card-dot has-updates";
      els.syncResultTitle.textContent = "Sync Complete";
      if (desc) {
        desc.style.display = "block";
        desc.textContent = "Successfully applied changes from the repository:";
      }

      let badgesHtml = "";
      if (added > 0) {
        badgesHtml += `<span class="sync-metric-chip add">+${added} new</span>`;
      }
      if (updated > 0) {
        badgesHtml += `<span class="sync-metric-chip update">${updated} updated</span>`;
      }
      if (removed > 0) {
        badgesHtml += `<span class="sync-metric-chip remove">${removed} removed</span>`;
      }
      if (els.syncResultBadges) {
        els.syncResultBadges.style.display = "flex";
        els.syncResultBadges.innerHTML = badgesHtml;
      }

      function formatDiffRow(label, codes) {
        if (!codes || codes.length === 0) return "";
        if (codes.length <= 6) {
          return `<div class="sync-diff-row"><strong>${label}:</strong> ${escapeHtml(codes.join(", "))}</div>`;
        }
        const preview = escapeHtml(codes.slice(0, 6).join(", "));
        const full = escapeHtml(codes.join(", "));
        const moreCount = codes.length - 6;
        return `<div class="sync-diff-row"><strong>${label}:</strong> <span class="sync-codes-preview">${preview}</span><span class="sync-codes-full" style="display:none;">${full}</span><button class="btn-more-codes" type="button" data-more-count="${moreCount}">+${moreCount} more</button></div>`;
      }

      const diffRows = [];
      if (addedCodes.length > 0) {
        diffRows.push(formatDiffRow("Added", addedCodes));
      }
      if (updatedCodes.length > 0) {
        diffRows.push(formatDiffRow("Updated", updatedCodes));
      }
      if (removedCodes.length > 0) {
        diffRows.push(formatDiffRow("Removed", removedCodes));
      }

      if (els.syncResultDetails) {
        if (diffRows.length > 0) {
          els.syncResultDetails.style.display = "flex";
          els.syncResultDetails.innerHTML = diffRows.join("");

          els.syncResultDetails.querySelectorAll(".btn-more-codes").forEach(btn => {
            btn.addEventListener("click", () => {
              const row = btn.closest(".sync-diff-row");
              if (!row) return;
              const previewSpan = row.querySelector(".sync-codes-preview");
              const fullSpan = row.querySelector(".sync-codes-full");
              const moreCount = btn.getAttribute("data-more-count");

              if (fullSpan && fullSpan.style.display === "none") {
                if (previewSpan) previewSpan.style.display = "none";
                fullSpan.style.display = "inline";
                btn.textContent = "Show less";
                btn.classList.add("is-expanded");
              } else if (fullSpan) {
                fullSpan.style.display = "none";
                if (previewSpan) previewSpan.style.display = "inline";
                btn.textContent = `+${moreCount} more`;
                btn.classList.remove("is-expanded");
              }
            });
          });
        } else {
          els.syncResultDetails.style.display = "none";
          els.syncResultDetails.innerHTML = "";
        }
      }
    }
  }

  function attachEventListeners() {

    // Panel sliding animations
    els.openCoursesBtn?.addEventListener("click", () => {
      isTrashMode = false;
      els.coursesPanelTitle.textContent = "Course Database";
      updateCourseCount();
      els.viewTrashBtn.style.display = "grid";
      els.courseFilterRow.style.display = "flex";
      els.openImportBtn.style.display = "flex";
      renderCourseList(searchQuery);
      els.viewWrapper.classList.add("show-courses");
    });

    els.openSettingsBtn?.addEventListener("click", () => {
      els.viewWrapper.classList.remove("show-courses", "show-details", "show-import");
      els.viewWrapper.classList.add("show-settings");
    });

    els.settingsBackBtn?.addEventListener("click", () => {
      els.viewWrapper.classList.remove("show-settings");
    });

    els.openImportBtn?.addEventListener("click", () => {
      els.viewWrapper.classList.add("show-import");
    });

    els.importBackBtn?.addEventListener("click", () => {
      els.viewWrapper.classList.remove("show-import");
    });

    els.viewTrashBtn?.addEventListener("click", () => {
      isTrashMode = !isTrashMode;
      if (isTrashMode) {
        els.coursesPanelTitle.textContent = "Trash Bin";
        els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''}`;
        els.viewTrashBtn.style.display = "none";
        els.courseFilterRow.style.display = "none";
        els.trashActionsRow.style.display = "flex";
        els.openImportBtn.style.display = "none";
        renderTrashList(searchQuery);
      } else {
        els.coursesPanelTitle.textContent = "Course Database";
        updateCourseCount();
        els.viewTrashBtn.style.display = "grid";
        els.courseFilterRow.style.display = "flex";
        els.trashActionsRow.style.display = "none";
        els.openImportBtn.style.display = "flex";
        renderCourseList(searchQuery);
      }
    });

    els.backBtn?.addEventListener("click", () => {
      if (isTrashMode) {
        isTrashMode = false;
        els.coursesPanelTitle.textContent = "Course Database";
        updateCourseCount();
        els.viewTrashBtn.style.display = "grid";
        els.courseFilterRow.style.display = "flex";
        els.trashActionsRow.style.display = "none";
        els.openImportBtn.style.display = "flex";
        renderCourseList(searchQuery);
      } else {
        els.viewWrapper.classList.remove("show-courses");
      }
    });

    els.restoreAllBtn?.addEventListener("click", () => {
      if (softDeletedCourses.length === 0) return;
      pendingAction = "restore-all";
      els.modalText.textContent = `Are you sure you want to restore all ${softDeletedCourses.length} courses?`;
      els.confirmModal.classList.add("show");
    });

    els.emptyTrashBtn?.addEventListener("click", () => {
      if (softDeletedCourses.length === 0) return;
      pendingAction = "empty-trash";
      els.modalText.textContent = `Are you sure you want to permanently delete all ${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''} in the Trash? This cannot be undone.`;
      els.confirmModal.classList.add("show");
    });

    els.detailsBackBtn?.addEventListener("click", () => {
      els.viewWrapper.classList.remove("show-details");
      els.viewWrapper.classList.add("show-courses");
    });

    els.detailSaveBtn?.addEventListener("click", () => {
      if (!currentEditingCode) return;

      const newName = els.detailName.value.trim();
      if (!newName) {
        els.detailName.style.borderColor = "var(--danger)";
        return;
      }

      const newDay = els.detailDay.value.trim();
      const newSlot = els.detailSlot.value.trim();
      const newPrereqRaw = els.detailPrereq.value.trim();

      let newPrereqs = [];
      if (newPrereqRaw) {
        newPrereqs = newPrereqRaw.split(",").map(s => s.trim()).filter(Boolean);
      }

      let newVal;
      if (newDay || newSlot || newPrereqs.length > 0) {
        newVal = { name: newName, examDay: newDay, examSlot: newSlot, prerequisites: newPrereqs };
      } else {
        newVal = newName;
      }

      pendingSaveVal = newVal;
      pendingAction = "save";
      els.modalText.textContent = "Are you sure you want to save these changes? This will update the course locally on your device.";
      els.confirmModal.classList.add("show");
    });

    els.detailDelBtn?.addEventListener("click", () => {
      if (!currentEditingCode || els.detailDelBtn.disabled) return;

      pendingAction = "delete";
      els.modalText.textContent = "Are you sure you want to delete this course? This will soft-delete it locally on your device and move it to Trash. It can be restored at any time.";
      els.confirmModal.classList.add("show");
    });

    els.modalCancelBtn?.addEventListener("click", () => {
      els.confirmModal.classList.remove("show");
      pendingAction = null;
      pendingSaveVal = null;
    });

    els.modalConfirmBtn?.addEventListener("click", async () => {
      els.confirmModal.classList.remove("show");

      if (pendingAction === "save" && currentEditingCode) {
        commitCourseSave(currentEditingCode, pendingSaveVal);
      } else if (pendingAction === "delete" && currentEditingCode) {
        let changed = false;

        if (!softDeletedCourses.includes(currentEditingCode)) {
          softDeletedCourses.push(currentEditingCode);
          await chrome.storage.local.set({ softDeletedCourses });
          changed = true;
        }

        if (changed) {
          await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
          await reloadLocalCoursesState();

          if (isTrashMode) {
            els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''}`;
            renderTrashList(searchQuery);
          } else {
            renderCourseList(searchQuery);
          }
        }
        els.viewWrapper.classList.remove("show-details");
        els.viewWrapper.classList.add("show-courses");
      } else if (pendingAction === "restore" && pendingTarget) {
        softDeletedCourses = softDeletedCourses.filter(c => c !== pendingTarget);
        await chrome.storage.local.set({ softDeletedCourses });
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();
        if (isTrashMode) {
          els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''}`;
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
        }
      } else if (pendingAction === "perm-delete" && pendingTarget) {
        if (userCourses[pendingTarget] !== undefined) {
          delete userCourses[pendingTarget];
        }
        softDeletedCourses = softDeletedCourses.filter(c => c !== pendingTarget);
        if (!hardDeletedCourses.includes(pendingTarget)) {
          hardDeletedCourses.push(pendingTarget);
        }
        await chrome.storage.local.set({ userCourses, softDeletedCourses, hardDeletedCourses });
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();
        if (isTrashMode) {
          els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''}`;
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
        }
      } else if (pendingAction === "restore-all") {
        softDeletedCourses = [];
        await chrome.storage.local.set({ softDeletedCourses });
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();
        if (isTrashMode) {
          els.coursesPanelCount.textContent = `0 courses`;
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
        }
      } else if (pendingAction === "empty-trash") {
        softDeletedCourses.forEach(c => {
          if (userCourses[c] !== undefined) {
            delete userCourses[c];
          }
          if (!hardDeletedCourses.includes(c)) {
            hardDeletedCourses.push(c);
          }
        });
        softDeletedCourses = [];

        await chrome.storage.local.set({ userCourses, softDeletedCourses, hardDeletedCourses });
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();

        if (isTrashMode) {
          els.coursesPanelCount.textContent = `0 courses`;
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
        }
      } else if (pendingAction === "reset-defaults") {
        const resetBtn = els.resetDefaultsBtn;
        const resetText = els.resetDefaultsBtnText || resetBtn;

        if (resetBtn) {
          resetBtn.classList.remove("is-success");
          resetBtn.classList.add("is-loading");
          if (resetText) resetText.textContent = "Restoring official catalog…";
          resetBtn.disabled = true;
        }

        try {
          softDeletedCourses = [];
          hardDeletedCourses = [];
          await chrome.storage.local.set({ softDeletedCourses, hardDeletedCourses });
          await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
          await reloadLocalCoursesState();
          updateCourseCount();
          if (isTrashMode) {
            els.coursesPanelCount.textContent = `0 courses`;
            renderTrashList(searchQuery);
          } else {
            renderCourseList(searchQuery);
          }

          if (resetBtn) {
            resetBtn.classList.remove("is-loading");
            resetBtn.classList.add("is-success");
            if (resetText) resetText.textContent = "Official Catalog Restored";
          }
        } catch (err) {
          console.error("Reset defaults failed:", err);
          if (resetBtn) {
            resetBtn.classList.remove("is-loading");
            if (resetText) resetText.textContent = "Could not reset catalog";
          }
        } finally {
          setTimeout(() => {
            if (resetBtn) {
              resetBtn.classList.remove("is-loading", "is-success");
              if (resetText) resetText.textContent = "Reset Official Catalog to Default";
              resetBtn.disabled = false;
            }
          }, 2400);
        }
      }

      pendingAction = null;
      pendingSaveVal = null;
      pendingTarget = null;
    });

    els.courseSearch?.addEventListener("input", () => {
      searchQuery = els.courseSearch.value;
      if (isTrashMode) renderTrashList(searchQuery);
      else renderCourseList(searchQuery);
    });

    els.filterBtns?.forEach(btn => {
      btn.addEventListener("click", () => {
        els.filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderCourseList(searchQuery);
      });
    });

    // Copy Sample button
    els.copySampleBtn?.addEventListener("click", async () => {
      const sample = `{
  "COURSE CODE": {
    "name": "Full Name of The Course",
    "examDay": "Day",
    "examSlot": "Slot",
    "prerequisites": ["PREREQ1", "PREREQ2"]
  }
}`;
      try {
        await navigator.clipboard.writeText(sample);
        els.copySampleBtn.textContent = "Copied!";
        els.copySampleBtn.style.background = "var(--accent)";
        els.copySampleBtn.style.color = "#fff";
        setTimeout(() => {
          els.copySampleBtn.textContent = "Copy Sample";
          els.copySampleBtn.style.background = "";
          els.copySampleBtn.style.color = "";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy", err);
      }
    });

    // Handle user pasting in a new JSON course list
    els.importBtn?.addEventListener("click", async () => {
      const raw = els.jsonInput.value.trim();
      if (!raw) {
        showImportMsg("error", "⚠️ Please paste some JSON first.");
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        showImportMsg("error", "❌ Invalid JSON: " + e.message);
        return;
      }

      if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
        showImportMsg("error", '❌ JSON must be a flat object: { "CODE": "Name" }');
        return;
      }

      let added = 0;
      let errors = 0;
      let nameOnlyCount = 0;
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof k !== "string" || !k.trim()) {
          errors++;
          continue;
        }
        const key = k.trim();
        let val;
        let isNameOnly = false;

        if (typeof v === "string" && v.trim()) {
          val = v.trim();
          isNameOnly = true;
        } else if (typeof v === "object" && v !== null && typeof v.name === "string" && v.name.trim()) {
          val = { ...v, name: v.name.trim() };
          const hasExamDay = !!val.examDay;
          const hasExamSlot = !!val.examSlot;
          const hasPrereqs = Array.isArray(val.prerequisites) && val.prerequisites.length > 0;
          if (!hasExamDay && !hasExamSlot && !hasPrereqs) {
            isNameOnly = true;
          }
        } else {
          errors++;
          continue;
        }

        if (softDeletedCourses.includes(key)) {
          softDeletedCourses = softDeletedCourses.filter(c => c !== key);
        }
        if (hardDeletedCourses.includes(key)) {
          hardDeletedCourses = hardDeletedCourses.filter(c => c !== key);
        }
        courses[key] = val;
        userCourses[key] = val;
        added++;
        if (isNameOnly) nameOnlyCount++;
      }

      if (added === 0 && errors > 0) {
        showImportMsg("error", `❌ Found ${errors} invalid entries, none added.`);
        return;
      } else if (added === 0) {
        showImportMsg("error", "⚠️ No valid entries found in JSON.");
        return;
      }

      await chrome.storage.local.set({ courses, userCourses, softDeletedCourses, hardDeletedCourses });
      updateCourseCount();
      renderCourseList(searchQuery);
      els.jsonInput.value = "";

      let msg = "";
      if (errors > 0) {
        msg = `✅ Imported ${added}. Skipped ${errors} invalid.`;
      } else {
        msg = `✅ Imported ${added} course${added !== 1 ? "s" : ""}. Saved permanently!`;
      }

      if (nameOnlyCount > 0) {
        msg += ` ℹ️ ${nameOnlyCount} course(s) were added with name only — consider editing them later to add exam/prerequisite details.`;
      }
      showImportMsg("success", msg);
    });

    // Wipe all courses clean
    els.clearBtn?.addEventListener("click", async () => {
      if (!confirm(`Delete ALL ${Object.keys(courses).length} courses from the database? This cannot be undone.`)) return;
      courses = {};
      userCourses = {};
      softDeletedCourses = [];
      const allOfficial = Object.keys({ ...bundledCourses, ...remoteCourses });
      hardDeletedCourses = [...new Set([...hardDeletedCourses, ...allOfficial])];
      await chrome.storage.local.set({ courses, userCourses, softDeletedCourses, hardDeletedCourses });
      await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
      await reloadLocalCoursesState();
      updateCourseCount();
      renderCourseList(searchQuery);
      showImportMsg("success", "🗑️ All courses cleared.");
    });

    // Adding sites to the allowlist
    const addSite = async () => {
      const val = els.allowlistInput.value.trim().toLowerCase();
      if (val && !allowedSites.includes(val)) {
        allowedSites.push(val);
        await chrome.storage.local.set({ allowedSites });
        els.allowlistInput.value = "";
        renderAllowlist();
        updateToggleAndStatus();
      }
    };
    els.allowlistBtn?.addEventListener("click", addSite);
    els.allowlistInput?.addEventListener("keypress", e => { if (e.key === "Enter") addSite(); });

    // Enable/disable the extension on the current site
    els.siteToggle?.addEventListener("change", async () => {
      if (els.siteToggle.checked) {
        if (currentHost && !allowedSites.includes(currentHost)) allowedSites.push(currentHost);
      } else {
        allowedSites = allowedSites.filter(h => h !== currentHost);
      }
      await chrome.storage.local.set({ allowedSites });
      renderAllowlist();
      updateToggleAndStatus();
    });

    els.modeRadios?.forEach(radio => {
      radio.addEventListener("change", async () => {
        await chrome.storage.local.set({ mode: radio.value });
      });
    });

    els.showExamInfoToggle?.addEventListener("change", async () => {
      await chrome.storage.local.set({ showExamInfo: els.showExamInfoToggle.checked });
      // content.js has a storage.onChanged listener that will dynamically update the DOM!
    });

    els.showPrerequisitesToggle?.addEventListener("change", async () => {
      await chrome.storage.local.set({ showPrerequisites: els.showPrerequisitesToggle.checked });
      // content.js has a storage.onChanged listener that will dynamically update the DOM!
    });

    if (els.syncBtn) {
      els.syncBtn.addEventListener("click", async () => {
        const syncText = els.syncBtnText || els.syncBtn;

        els.syncBtn.classList.remove("is-success", "is-error");
        els.syncBtn.classList.add("is-loading");
        syncText.textContent = "Syncing with GitHub…";
        els.syncBtn.disabled = true;
        els.syncTime.textContent = "Fetching latest course data…";

        try {
          const response = await chrome.runtime.sendMessage({ type: "SYNC_COURSES" });
          if (response.success) {
            lastSyncedAt = response.lastSyncedAt;
            lastSyncResult = response.stats || null;

            // Re-fetch courses locally
            const data = await chrome.storage.local.get(["courses", "softDeletedCourses", "hardDeletedCourses", "remoteCourses"]);
            courses = data.courses || {};
            softDeletedCourses = data.softDeletedCourses || [];
            hardDeletedCourses = data.hardDeletedCourses || [];
            remoteCourses = data.remoteCourses || {};
            updateCourseCount();

            const stats = response.stats;
            let btnText = "Database is up to date";
            if (stats) {
              if (stats.added > 0 && stats.updated > 0) {
                btnText = `Synced (+${stats.added}, ${stats.updated} upd)`;
              } else if (stats.added > 0) {
                btnText = `Synced (+${stats.added} new)`;
              } else if (stats.updated > 0) {
                btnText = `Synced (${stats.updated} updated)`;
              } else if (stats.removed > 0) {
                btnText = `Synced (${stats.removed} removed)`;
              }
            }

            els.syncBtn.classList.remove("is-loading");
            els.syncBtn.classList.add("is-success");
            syncText.textContent = btnText;
            els.syncTime.textContent = formatTimeAgo(lastSyncedAt);

            renderSyncResult(lastSyncResult);
          } else {
            throw new Error(response.error || "Unknown error");
          }
        } catch (err) {
          console.error("Course sync failed:", err);
          els.syncBtn.classList.remove("is-loading");
          els.syncBtn.classList.add("is-error");
          syncText.textContent = "Sync failed — Retry";
          els.syncTime.textContent = "Check your connection and try again.";
        } finally {
          setTimeout(() => {
            els.syncBtn.classList.remove("is-loading", "is-success", "is-error");
            syncText.textContent = "Sync Course Database";
            els.syncBtn.disabled = false;
            if (lastSyncedAt) {
              els.syncTime.textContent = formatTimeAgo(lastSyncedAt);
            } else {
              els.syncTime.textContent = "Never synced";
            }
            if (els.syncResultBox && els.syncResultBox.classList.contains("show")) {
              els.syncTime.style.display = "none";
            }
          }, 2600);
        }
      });
    }

    els.resetDefaultsBtn?.addEventListener("click", () => {
      pendingAction = "reset-defaults";
      els.modalText.textContent = "Are you sure you want to restore the official catalog to default? All official course mappings will be un-deleted, while your custom user-added courses remain intact.";
      els.confirmModal.classList.add("show");
    });
  }

  init();
})();