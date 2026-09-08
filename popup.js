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
    displaySettingsCard: document.getElementById("displaySettingsCard"),
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
    courseTableCard: document.getElementById("courseTableCard"),
    courseList: document.getElementById("courseList"),
    courseListHeader: document.getElementById("courseListHeader"),
    colHeaderAction: document.getElementById("colHeaderAction"),
    courseSearch: document.getElementById("courseSearch"),
    searchClearBtn: document.getElementById("searchClearBtn"),
    courseFilterRow: document.getElementById("courseFilterRow"),
    filterBtns: document.querySelectorAll("#courseFilterRow .filter-btn"),
    jsonInput: document.getElementById("jsonInput"),
    importSection: document.getElementById("importSection"),
    importBtn: document.getElementById("importBtn"),
    clearBtn: document.getElementById("clearBtn"),
    importMsg: document.getElementById("importMsg"),
    copySampleBtn: document.getElementById("copySampleBtn"),
    tabSingleCourse: document.getElementById("tabSingleCourse"),
    tabBulkImport: document.getElementById("tabBulkImport"),
    singleCourseSection: document.getElementById("singleCourseSection"),
    bulkImportSection: document.getElementById("bulkImportSection"),
    singleCourseCode: document.getElementById("singleCourseCode"),
    singleCourseName: document.getElementById("singleCourseName"),
    singleCourseDay: document.getElementById("singleCourseDay"),
    singleCourseSlot: document.getElementById("singleCourseSlot"),
    singleCoursePrereq: document.getElementById("singleCoursePrereq"),
    addSingleCourseBtn: document.getElementById("addSingleCourseBtn"),
    clearSingleFormBtn: document.getElementById("clearSingleFormBtn"),
    singleCourseMsg: document.getElementById("singleCourseMsg"),
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
    resetResultBox: document.getElementById("resetResultBox"),
    resetResultDot: document.getElementById("resetResultDot"),
    resetResultTitle: document.getElementById("resetResultTitle"),
    resetResultTime: document.getElementById("resetResultTime"),
    resetResultDesc: document.getElementById("resetResultDesc"),
    resetResultBadges: document.getElementById("resetResultBadges"),
    resetResultDetails: document.getElementById("resetResultDetails"),
    resetResultDismissBtn: document.getElementById("resetResultDismissBtn"),
    syncResultBox: document.getElementById("syncResultBox"),
    syncResultDot: document.getElementById("syncResultDot"),
    syncResultTitle: document.getElementById("syncResultTitle"),
    syncResultTime: document.getElementById("syncResultTime"),
    syncResultDesc: document.getElementById("syncResultDesc"),
    syncResultBadges: document.getElementById("syncResultBadges"),
    syncResultDetails: document.getElementById("syncResultDetails"),
    syncResultDismissBtn: document.getElementById("syncResultDismissBtn"),
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

    // Prune any userCourses overrides that are identical to official data
    let cleanedUserCourses = false;
    for (const code in userCourses) {
      const official = remoteCourses[code] || bundledCourses[code];
      if (official && areCourseDataEqual(userCourses[code], official)) {
        delete userCourses[code];
        cleanedUserCourses = true;
      }
    }
    if (cleanedUserCourses) {
      await chrome.storage.local.set({ userCourses });
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
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return "Never synced";
    const rel = formatRelativeTime(timestamp);
    if (rel === "Just now") return "Just now";
    return `Last synced: ${rel}`;
  }

  function checkSyncReminder() {
    const SYNC_OVERDUE_MS = 60 * 24 * 60 * 60 * 1000; // 2 months (60 days)
    const isOverdue = !!(lastSyncedAt && (Date.now() - lastSyncedAt > SYNC_OVERDUE_MS));
    const banner = document.getElementById("syncReminderBanner");
    const homeAlert = document.getElementById("homeSyncAlert");
    const badge = document.getElementById("settingsBadge");
    if (banner) banner.style.display = isOverdue ? "flex" : "none";
    if (homeAlert) homeAlert.style.display = isOverdue ? "flex" : "none";
    if (badge) badge.style.display = isOverdue ? "block" : "none";
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
    if (lastSyncResult) {
      renderSyncResult(lastSyncResult);
      // Viewed once in this session; remove from persistent storage so next popup session starts clean
      chrome.storage.local.remove("lastSyncResult");
    } else {
      renderSyncResult(null);
    }
    checkSyncReminder();
    setInterval(checkSyncReminder, 1500);

    try {
      const manifest = chrome.runtime.getManifest();
      const versionEl = document.getElementById("extVersion");
      if (versionEl && manifest?.version) {
        versionEl.textContent = `v${manifest.version}`;
      }
    } catch (_) { }
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
      els.statusText.textContent = "Paused on this site";
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

  function normalizeCourseData(val) {
    if (!val) return { name: "", examDay: "", examSlot: "", prerequisites: [] };
    if (typeof val === "string") {
      return { name: val.trim(), examDay: "", examSlot: "", prerequisites: [] };
    }
    const name = (val.name || "").trim();
    const examDay = (val.examDay || "").trim();
    const examSlot = (val.examSlot || "").trim();
    const prerequisites = Array.isArray(val.prerequisites)
      ? val.prerequisites.map(p => String(p).trim()).filter(Boolean).sort()
      : [];
    return { name, examDay, examSlot, prerequisites };
  }

  function areCourseDataEqual(val1, val2) {
    const a = normalizeCourseData(val1);
    const b = normalizeCourseData(val2);
    if (a.name !== b.name) return false;
    if (a.examDay !== b.examDay) return false;
    if (a.examSlot !== b.examSlot) return false;
    if (a.prerequisites.length !== b.prerequisites.length) return false;
    for (let i = 0; i < a.prerequisites.length; i++) {
      if (a.prerequisites[i] !== b.prerequisites[i]) return false;
    }
    return true;
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

  function getCourseOrigin(code) {
    const inBundled = !!bundledCourses[code];
    const inRemote = !!remoteCourses[code];
    const inUser = !!userCourses[code];

    if (!inBundled && !inRemote && inUser) {
      return { class: "user-added", label: "User Added" };
    } else if ((inBundled || inRemote) && inUser) {
      return { class: "edited", label: "Edited" };
    } else {
      return { class: "official", label: "Official" };
    }
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
      if (els.courseListHeader) els.courseListHeader.style.display = "none";
      if (els.trashActionsRow && softDeletedCourses.length === 0) {
        els.trashActionsRow.style.display = "none";
      }

      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";

      const emptyIcon = document.createElement("div");
      emptyIcon.className = "empty-icon";
      emptyIcon.textContent = filter ? "🔍" : "🗑️";
      emptyState.appendChild(emptyIcon);

      const titleEl = document.createElement("div");
      titleEl.className = "empty-title";

      const subEl = document.createElement("div");
      subEl.className = "empty-subtitle";

      if (filter) {
        titleEl.textContent = "No courses found";
        subEl.textContent = `No courses in Trash matching "${filter}".`;
        emptyState.appendChild(titleEl);
        emptyState.appendChild(subEl);

        const clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.className = "empty-clear-btn";
        clearBtn.textContent = "Clear search";
        clearBtn.addEventListener("click", () => {
          if (els.courseSearch) {
            els.courseSearch.value = "";
            searchQuery = "";
            if (els.searchClearBtn) els.searchClearBtn.style.display = "none";
            renderTrashList("");
            els.courseSearch.focus();
          }
        });
        emptyState.appendChild(clearBtn);
      } else {
        titleEl.textContent = "Trash is Empty";
        subEl.textContent = "Courses you delete will appear here until permanently removed.";
        emptyState.appendChild(titleEl);
        emptyState.appendChild(subEl);
      }

      els.courseList.textContent = "";
      els.courseList.appendChild(emptyState);
      return;
    }

    if (els.courseTableCard) els.courseTableCard.classList.add("trash-mode");
    if (els.courseListHeader) {
      els.courseListHeader.style.display = "grid";
      if (els.colHeaderAction) els.colHeaderAction.textContent = "Action";
    }
    if (els.trashActionsRow && !filter) {
      els.trashActionsRow.style.display = "flex";
    }

    const frag = document.createDocumentFragment();
    entries.forEach(({ code, data }) => {
      const row = document.createElement("div");
      row.className = "course-grid-row";

      const name = typeof data === "object" && data !== null ? (data.name || "") : (data || "Unknown Course");

      const codeEl = document.createElement("div");
      codeEl.className = "course-row-code";
      codeEl.textContent = code;
      codeEl.title = code;

      const nameEl = document.createElement("div");
      nameEl.className = "course-row-name";
      nameEl.textContent = name;
      nameEl.title = name;

      const origin = getCourseOrigin(code);
      const typeEl = document.createElement("div");
      typeEl.className = "course-row-type";

      const badge = document.createElement("span");
      badge.className = `origin-badge ${origin.class}`;
      badge.textContent = origin.label;
      typeEl.appendChild(badge);

      const actionCol = document.createElement("div");
      actionCol.className = "trash-row-actions";

      const restoreBtn = document.createElement("button");
      restoreBtn.type = "button";
      restoreBtn.className = "btn-trash-action-item restore";
      restoreBtn.title = `Restore ${code} to catalog`;
      restoreBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.896 8.896 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg>';
      restoreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        pendingAction = "restore";
        pendingTarget = code;
        els.modalText.innerHTML = `
          <div style="font-weight:700; font-size:0.86rem; color:var(--text-main); margin-bottom:4px;">Restore ${escapeHtml(code)} to catalog?</div>
          <div style="font-size:0.72rem; color:var(--text-muted); line-height:1.4;">This course will be returned to your active course database and decoder immediately.</div>
        `;
        els.confirmModal.classList.add("show");
      });

      const permDelBtn = document.createElement("button");
      permDelBtn.type = "button";
      permDelBtn.className = "btn-trash-action-item delete";
      permDelBtn.title = `Permanently delete ${code}`;
      permDelBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
      permDelBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        pendingAction = "perm-delete";
        pendingTarget = code;
        els.modalText.innerHTML = `
          <div style="font-weight:700; font-size:0.86rem; color:var(--text-main); margin-bottom:4px;">Permanently delete ${escapeHtml(code)}?</div>
          <div style="font-size:0.72rem; color:var(--text-muted); line-height:1.4;">This course will be permanently removed from storage and cannot be restored.</div>
        `;
        els.confirmModal.classList.add("show");
      });

      actionCol.appendChild(restoreBtn);
      actionCol.appendChild(permDelBtn);

      row.appendChild(codeEl);
      row.appendChild(nameEl);
      row.appendChild(typeEl);
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

      const titleEl = document.createElement("div");
      titleEl.className = "empty-title";

      const subEl = document.createElement("div");
      subEl.className = "empty-subtitle";

      if (filter) {
        emptyIcon.textContent = "🔍";
        titleEl.textContent = "No courses found";

        let filterCategory = "";
        if (currentFilter === "user") filterCategory = " in User Added";
        else if (currentFilter === "edited") filterCategory = " in Edited";
        else if (currentFilter === "official") filterCategory = " in Official";

        subEl.textContent = `No results matching "${filter}"${filterCategory}.`;
        emptyState.appendChild(emptyIcon);
        emptyState.appendChild(titleEl);
        emptyState.appendChild(subEl);

        const clearBtn = document.createElement("button");
        clearBtn.type = "button";
        clearBtn.className = "empty-clear-btn";
        clearBtn.textContent = "Clear search";
        clearBtn.addEventListener("click", () => {
          if (els.courseSearch) {
            els.courseSearch.value = "";
            searchQuery = "";
            if (els.searchClearBtn) els.searchClearBtn.style.display = "none";
            renderCourseList("");
            els.courseSearch.focus();
          }
        });
        emptyState.appendChild(clearBtn);
      } else {
        if (currentFilter === "user") {
          emptyIcon.textContent = "📂";
          titleEl.textContent = "No User-Added Courses";
          subEl.textContent = "You haven't added any custom courses yet. Click \"Add / Import Courses\" below to create one.";
        } else if (currentFilter === "edited") {
          emptyIcon.textContent = "📝";
          titleEl.textContent = "No Edited Courses";
          subEl.textContent = "Official courses that you customize or modify will be tracked here.";
        } else if (currentFilter === "official") {
          emptyIcon.textContent = "🏛️";
          titleEl.textContent = "No Official Courses";
          subEl.textContent = "Official catalog courses will appear here once loaded or synced.";
        } else {
          emptyIcon.textContent = "📚";
          titleEl.textContent = "No Courses Available";
          subEl.textContent = "Import courses from JSON below or sync the catalog to get started.";
        }
        emptyState.appendChild(emptyIcon);
        emptyState.appendChild(titleEl);
        emptyState.appendChild(subEl);
      }

      if (els.courseListHeader) els.courseListHeader.style.display = "none";
      els.courseList.textContent = "";
      els.courseList.appendChild(emptyState);
      return;
    }

    if (els.courseTableCard) els.courseTableCard.classList.remove("trash-mode");
    if (els.courseListHeader) {
      els.courseListHeader.style.display = "grid";
      if (els.colHeaderAction) els.colHeaderAction.textContent = "";
    }
    els.courseList.textContent = "";

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

      const origin = getCourseOrigin(code);
      const typeEl = document.createElement("div");
      typeEl.className = "course-row-type";

      const badge = document.createElement("span");
      badge.className = `origin-badge ${origin.class}`;
      badge.textContent = origin.label;

      typeEl.appendChild(badge);

      const arrowEl = document.createElement("div");
      arrowEl.className = "course-row-arrow";
      arrowEl.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>';

      row.appendChild(codeEl);
      row.appendChild(nameEl);
      row.appendChild(typeEl);
      row.appendChild(arrowEl);

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

  let detailsOriginView = "courses";

  function openCourseDetails(code, courseData, originView = "courses") {
    detailsOriginView = originView;
    currentEditingCode = code;
    els.detailsCourseCode.textContent = code;

    const origin = getCourseOrigin(code);
    const badgeEl = document.getElementById("detailsOriginBadge");
    if (badgeEl) {
      badgeEl.className = `origin-badge ${origin.class}`;
      badgeEl.textContent = origin.label;
    }

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
    els.viewWrapper.classList.remove("show-courses", "show-settings", "show-trash", "show-import");
  }

  function exitCourseDetails() {
    els.viewWrapper.classList.remove("show-details");
    if (detailsOriginView === "settings") {
      els.viewWrapper.classList.add("show-settings");
    } else {
      els.viewWrapper.classList.add("show-courses");
    }
  }

  function commitCourseSave(code, newVal) {
    // This is the hook for the confirmation modal to call
    (async () => {
      const officialData = remoteCourses[code] || bundledCourses[code];
      if (officialData && areCourseDataEqual(newVal, officialData)) {
        delete userCourses[code];
      } else {
        userCourses[code] = newVal;
      }
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

      exitCourseDetails();
    })();
  }

  let importMsgTimer = null;
  function showImportMsg(type, text) {
    if (!els.importMsg) return;
    if (importMsgTimer) clearTimeout(importMsgTimer);

    const icons = {
      success: '<svg class="import-msg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      error: '<svg class="import-msg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
      info: '<svg class="import-msg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
    };
    const iconSvg = icons[type] || icons.info;
    els.importMsg.className = `import-msg ${type}`;
    els.importMsg.innerHTML = `${iconSvg}<span>${text}</span>`;
    els.importMsg.style.display = "flex";
    importMsgTimer = setTimeout(() => {
      if (els.importMsg) {
        els.importMsg.className = "import-msg";
        els.importMsg.style.display = "none";
        els.importMsg.innerHTML = "";
      }
    }, 4500);
  }

  let singleCourseMsgTimer = null;
  function showSingleCourseMsg(type, text) {
    if (!els.singleCourseMsg) return;
    if (singleCourseMsgTimer) clearTimeout(singleCourseMsgTimer);

    const icons = {
      success: '<svg class="import-msg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
      error: '<svg class="import-msg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>',
      info: '<svg class="import-msg-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>'
    };
    const iconSvg = icons[type] || icons.info;
    els.singleCourseMsg.className = `import-msg ${type}`;
    els.singleCourseMsg.innerHTML = `${iconSvg}<span>${text}</span>`;
    els.singleCourseMsg.style.display = "flex";
    singleCourseMsgTimer = setTimeout(() => {
      if (els.singleCourseMsg) {
        els.singleCourseMsg.className = "import-msg";
        els.singleCourseMsg.style.display = "none";
        els.singleCourseMsg.innerHTML = "";
      }
    }, 4500);
  }

  function updateJsonBadge() {
    const badge = document.getElementById("batchJsonBadge");
    if (!badge || !els.jsonInput) return;
    const text = els.jsonInput.value.trim();
    if (!text) {
      badge.textContent = "Ready";
      badge.className = "editor-badge";
      return;
    }
    try {
      const parsed = JSON.parse(text);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const count = Object.keys(parsed).length;
        badge.textContent = count === 1 ? "1 course detected" : `${count} courses detected`;
        badge.className = "editor-badge has-courses";
      } else {
        badge.textContent = "Expected { ... }";
        badge.className = "editor-badge has-error";
      }
    } catch {
      badge.textContent = "Invalid JSON";
      badge.className = "editor-badge has-error";
    }
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

  function renderDiffChip(code, detailsMap, type) {
    const isRemoved = type === "remove";
    let badgeHtml = "";
    if (detailsMap && detailsMap[code]) {
      const detailText = Array.isArray(detailsMap[code]) 
        ? detailsMap[code].join(" & ") 
        : detailsMap[code];
      const pillClass = type === "add" ? "add" : (type === "revert" ? "revert" : "");
      badgeHtml = `<span class="sync-field-pill ${pillClass}">${escapeHtml(detailText)}</span>`;
    } else if (type === "add") {
      badgeHtml = `<span class="sync-field-pill add">New</span>`;
    } else if (type === "remove") {
      badgeHtml = `<span class="sync-field-pill">Removed</span>`;
    } else if (type === "restore") {
      badgeHtml = `<span class="sync-field-pill add">Restored</span>`;
    } else if (type === "revert") {
      badgeHtml = `<span class="sync-field-pill revert">Reverted</span>`;
    }

    if (isRemoved) {
      return `<span class="sync-code-chip is-removed" title="Course removed from catalog"><span>${escapeHtml(code)}</span>${badgeHtml}</span>`;
    }

    return `<button type="button" class="sync-code-chip" data-code="${escapeHtml(code)}" title="Click to view details for ${escapeHtml(code)}"><span>${escapeHtml(code)}</span>${badgeHtml}<svg class="sync-chip-arrow" viewBox="0 0 24 24"><path d="M5 19L19 5M19 5H9M19 5V15" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></button>`;
  }

  function formatInteractiveDiffRow(label, codes, detailsMap, type) {
    if (!codes || codes.length === 0) return "";
    if (codes.length <= 6) {
      const chips = codes.map(c => renderDiffChip(c, detailsMap, type)).join("");
      return `<div class="sync-diff-row"><strong>${label}:</strong> <div class="sync-diff-chips">${chips}</div></div>`;
    }
    const preview = codes.slice(0, 6).map(c => renderDiffChip(c, detailsMap, type)).join("");
    const full = codes.map(c => renderDiffChip(c, detailsMap, type)).join("");
    const moreCount = codes.length - 6;
    return `<div class="sync-diff-row">
      <strong>${label}:</strong>
      <div class="sync-diff-chips sync-codes-preview">${preview}</div>
      <div class="sync-diff-chips sync-codes-full" style="display:none;">${full}</div>
      <button class="btn-more-codes" type="button" data-more-count="${moreCount}">+${moreCount} more</button>
    </div>`;
  }

  function bindDiffContainerEvents(container) {
    if (!container) return;

    // Expand / collapse "+N more" toggles
    container.querySelectorAll(".btn-more-codes").forEach(btn => {
      btn.addEventListener("click", () => {
        const row = btn.closest(".sync-diff-row");
        if (!row) return;
        const previewEl = row.querySelector(".sync-codes-preview");
        const fullEl = row.querySelector(".sync-codes-full");
        const moreCount = btn.getAttribute("data-more-count");

        if (fullEl && fullEl.style.display === "none") {
          if (previewEl) previewEl.style.display = "none";
          fullEl.style.display = "inline-flex";
          btn.textContent = "Show less";
          btn.classList.add("is-expanded");
        } else if (fullEl) {
          fullEl.style.display = "none";
          if (previewEl) previewEl.style.display = "inline-flex";
          btn.textContent = `+${moreCount} more`;
          btn.classList.remove("is-expanded");
        }
      });
    });

    // Click on a course chip to jump straight to Course Details
    container.querySelectorAll(".sync-code-chip[data-code]").forEach(chip => {
      chip.addEventListener("click", (e) => {
        e.preventDefault();
        const code = chip.getAttribute("data-code");
        if (code && courses && courses[code]) {
          openCourseDetails(code, courses[code], "settings");
        } else if (code) {
          showToast(`Course ${code} is not in active catalog`, "info");
        }
      });
    });
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

    const {
      added = 0,
      updated = 0,
      removed = 0,
      addedCodes = [],
      updatedCodes = [],
      removedCodes = [],
      updatedDetails = {},
      timestamp
    } = stats;
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

      const diffRows = [];
      if (addedCodes.length > 0) {
        diffRows.push(formatInteractiveDiffRow("Added", addedCodes, null, "add"));
      }
      if (updatedCodes.length > 0) {
        diffRows.push(formatInteractiveDiffRow("Updated", updatedCodes, updatedDetails, "update"));
      }
      if (removedCodes.length > 0) {
        diffRows.push(formatInteractiveDiffRow("Removed", removedCodes, null, "remove"));
      }

      if (els.syncResultDetails) {
        if (diffRows.length > 0) {
          els.syncResultDetails.style.display = "flex";
          els.syncResultDetails.innerHTML = diffRows.join("");
          bindDiffContainerEvents(els.syncResultDetails);
        } else {
          els.syncResultDetails.style.display = "none";
          els.syncResultDetails.innerHTML = "";
        }
      }
    }
  }

  function renderResetResult(stats) {
    if (!els.resetResultBox || !stats) {
      if (els.resetResultBox) {
        els.resetResultBox.classList.remove("show");
        els.resetResultBox.style.display = "none";
      }
      return;
    }

    const {
      totalChanges = 0,
      restoredCodes = [],
      revertedCodes = [],
      revertedDetails = {},
      timestamp = Date.now()
    } = stats;

    const hasChanges = totalChanges > 0;

    els.resetResultBox.classList.add("show");

    if (els.resetResultTime) {
      els.resetResultTime.textContent = formatRelativeTime(timestamp);
    }

    const dot = els.resetResultDot;
    const desc = els.resetResultDesc;

    if (!hasChanges) {
      if (dot) dot.className = "sync-card-dot";
      if (els.resetResultTitle) els.resetResultTitle.textContent = "Catalog is already at default";
      if (desc) {
        desc.style.display = "block";
        desc.textContent = "No deleted courses or local modifications found. All official courses and schedules match standard defaults.";
      }
      if (els.resetResultBadges) {
        els.resetResultBadges.style.display = "none";
        els.resetResultBadges.innerHTML = "";
      }
      if (els.resetResultDetails) {
        els.resetResultDetails.style.display = "none";
        els.resetResultDetails.innerHTML = "";
      }
    } else {
      if (dot) dot.className = "sync-card-dot has-updates";
      if (els.resetResultTitle) els.resetResultTitle.textContent = "Catalog Reset Complete";
      if (desc) {
        desc.style.display = "block";
        desc.textContent = "Successfully restored official course mappings and discarded local modifications:";
      }

      let badgesHtml = "";
      if (restoredCodes.length > 0) {
        badgesHtml += `<span class="sync-metric-chip add">+${restoredCodes.length} restored</span>`;
      }
      if (revertedCodes.length > 0) {
        badgesHtml += `<span class="sync-metric-chip update">${revertedCodes.length} reverted</span>`;
      }
      if (els.resetResultBadges) {
        els.resetResultBadges.style.display = "flex";
        els.resetResultBadges.innerHTML = badgesHtml;
      }

      const diffRows = [];
      if (restoredCodes.length > 0) {
        diffRows.push(formatInteractiveDiffRow("Restored", restoredCodes, null, "restore"));
      }
      if (revertedCodes.length > 0) {
        diffRows.push(formatInteractiveDiffRow("Reverted", revertedCodes, revertedDetails, "revert"));
      }

      if (els.resetResultDetails) {
        if (diffRows.length > 0) {
          els.resetResultDetails.style.display = "flex";
          els.resetResultDetails.innerHTML = diffRows.join("");
          bindDiffContainerEvents(els.resetResultDetails);
        } else {
          els.resetResultDetails.style.display = "none";
          els.resetResultDetails.innerHTML = "";
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
      updateSearchClearBtn();
      if (els.courseTableCard) els.courseTableCard.classList.remove("trash-mode");
      if (els.colHeaderAction) els.colHeaderAction.textContent = "";
      els.viewTrashBtn.style.display = "grid";
      els.courseFilterRow.style.display = "flex";
      els.openImportBtn.style.display = "flex";
      renderCourseList(searchQuery);
      els.viewWrapper.classList.add("show-courses");
    });

    const openSettings = () => {
      els.viewWrapper.classList.remove("show-courses", "show-details", "show-import");
      els.viewWrapper.classList.add("show-settings");
    };
    els.openSettingsBtn?.addEventListener("click", openSettings);
    document.getElementById("homeSyncAlert")?.addEventListener("click", openSettings);

    els.settingsBackBtn?.addEventListener("click", () => {
      els.viewWrapper.classList.remove("show-settings");
    });

    function activateSingleCourseTab() {
      els.tabSingleCourse?.classList.add("active");
      els.tabBulkImport?.classList.remove("active");
      if (els.singleCourseSection) els.singleCourseSection.style.display = "flex";
      if (els.bulkImportSection) els.bulkImportSection.style.display = "none";
      const subtitle = document.getElementById("importViewSubtitle");
      if (subtitle) subtitle.textContent = "Add a single course to catalog";
      setTimeout(() => {
        els.singleCourseCode?.focus({ preventScroll: true });
      }, 350);
    }

    function activateBatchUploadTab(showMessage = false) {
      els.tabBulkImport?.classList.add("active");
      els.tabSingleCourse?.classList.remove("active");
      if (els.singleCourseSection) els.singleCourseSection.style.display = "none";
      if (els.bulkImportSection) els.bulkImportSection.style.display = "flex";
      const subtitle = document.getElementById("importViewSubtitle");
      if (subtitle) subtitle.textContent = "Batch upload courses via JSON";
      updateJsonBadge();
      if (showMessage) {
        showImportMsg("info", "Click 'Copy' to copy the 2-course JSON template.");
      }
      setTimeout(() => {
        els.jsonInput?.focus({ preventScroll: true });
      }, 350);
    }

    els.openImportBtn?.addEventListener("click", (e) => {
      e?.preventDefault();
      document.body.scrollLeft = 0;
      document.documentElement.scrollLeft = 0;
      if (els.viewWrapper) els.viewWrapper.scrollLeft = 0;
      activateSingleCourseTab();
      els.viewWrapper.classList.remove("show-details", "show-settings");
      els.viewWrapper.classList.add("show-import");
    });

    els.importBackBtn?.addEventListener("click", (e) => {
      e?.preventDefault();
      document.body.scrollLeft = 0;
      document.documentElement.scrollLeft = 0;
      if (els.viewWrapper) els.viewWrapper.scrollLeft = 0;
      els.viewWrapper.classList.remove("show-import");
      els.viewWrapper.classList.add("show-courses");
    });

    els.viewTrashBtn?.addEventListener("click", () => {
      isTrashMode = !isTrashMode;
      if (isTrashMode) {
        els.coursesPanelTitle.textContent = "Trash Bin";
        els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''}`;
        els.viewTrashBtn.style.display = "none";
        els.courseFilterRow.style.display = "none";
        if (softDeletedCourses.length > 0) {
          els.trashActionsRow.style.display = "flex";
        } else {
          els.trashActionsRow.style.display = "none";
        }
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
      const count = softDeletedCourses.length;
      els.modalText.innerHTML = `
        <div style="font-weight:700; font-size:0.86rem; color:var(--text-main); margin-bottom:4px;">Restore ${count === 1 ? 'course' : `all ${count} courses`}?</div>
        <div style="font-size:0.72rem; color:var(--text-muted); line-height:1.4;">${count === 1 ? 'This course' : 'All courses in Trash'} will be returned to your active course catalog.</div>
      `;
      els.confirmModal.classList.add("show");
    });

    els.emptyTrashBtn?.addEventListener("click", () => {
      if (softDeletedCourses.length === 0) return;
      pendingAction = "empty-trash";
      const count = softDeletedCourses.length;
      els.modalText.innerHTML = `
        <div style="font-weight:700; font-size:0.86rem; color:var(--text-main); margin-bottom:4px;">Permanently delete ${count === 1 ? 'course' : `all ${count} courses`}?</div>
        <div style="font-size:0.72rem; color:var(--text-muted); line-height:1.4;">${count === 1 ? 'This course' : 'All courses in Trash'} will be permanently removed from storage and cannot be restored.</div>
      `;
      els.confirmModal.classList.add("show");
    });

    els.detailsBackBtn?.addEventListener("click", () => {
      exitCourseDetails();
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

      // If the values do not differ from the course's current state, do not mark as edited
      const currentData = courses[currentEditingCode];
      if (areCourseDataEqual(newVal, currentData)) {
        showToast("No changes made to course details.", "info");
        exitCourseDetails();
        return;
      }

      pendingSaveVal = newVal;
      pendingAction = "save";
      els.modalText.innerHTML = `
        <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); margin-bottom: 6px;">Save Changes to ${escapeHtml(currentEditingCode)}?</div>
        <div style="font-size: 0.73rem; color: var(--text-muted); line-height: 1.5; text-align: justify; text-justify: inter-word;">Updated course title, prerequisites, and exam schedules will be stored locally on this device and applied immediately across all active pages.</div>
      `;
      els.confirmModal.classList.add("show");
    });

    els.detailDelBtn?.addEventListener("click", () => {
      if (!currentEditingCode || els.detailDelBtn.disabled) return;

      pendingAction = "delete";
      els.modalText.innerHTML = `
        <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); margin-bottom: 6px;">Move ${escapeHtml(currentEditingCode)} to Trash?</div>
        <div style="font-size: 0.73rem; color: var(--text-muted); line-height: 1.5; text-align: justify; text-justify: inter-word;">This course will be excluded from active decoding. You can review or restore it from the Trash Bin at any time.</div>
      `;
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
        const target = currentEditingCode;

        if (!softDeletedCourses.includes(target)) {
          softDeletedCourses.push(target);
          await chrome.storage.local.set({ softDeletedCourses });
          changed = true;
        }

        if (changed) {
          await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
          await reloadLocalCoursesState();
          showToast(`${target} moved to Trash`, "info");

          if (isTrashMode) {
            els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''}`;
            renderTrashList(searchQuery);
          } else {
            renderCourseList(searchQuery);
          }
        }
        exitCourseDetails();
      } else if (pendingAction === "restore" && pendingTarget) {
        const target = pendingTarget;
        softDeletedCourses = softDeletedCourses.filter(c => c !== target);
        await chrome.storage.local.set({ softDeletedCourses });
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();
        showToast(`${target} restored to catalog`, "success");
        if (isTrashMode) {
          els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''}`;
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
        }
      } else if (pendingAction === "perm-delete" && pendingTarget) {
        const target = pendingTarget;
        if (userCourses[target] !== undefined) {
          delete userCourses[target];
        }
        softDeletedCourses = softDeletedCourses.filter(c => c !== target);
        if (!hardDeletedCourses.includes(target)) {
          hardDeletedCourses.push(target);
        }
        await chrome.storage.local.set({ userCourses, softDeletedCourses, hardDeletedCourses });
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();
        showToast(`${target} permanently deleted`, "info");
        if (isTrashMode) {
          els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''}`;
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
        }
      } else if (pendingAction === "restore-all") {
        const count = softDeletedCourses.length;
        softDeletedCourses = [];
        await chrome.storage.local.set({ softDeletedCourses });
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();
        showToast(count === 1 ? "Course restored to catalog" : `All ${count} courses restored to catalog`, "success");
        if (isTrashMode) {
          els.coursesPanelCount.textContent = `0 courses`;
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
        }
      } else if (pendingAction === "empty-trash") {
        const count = softDeletedCourses.length;
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
        showToast(count === 1 ? "Course permanently deleted" : `All ${count} courses permanently deleted`, "info");

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
          resetBtn.classList.remove("is-success", "is-error");
          resetBtn.classList.add("is-loading");
          if (resetText) resetText.textContent = "Restoring official catalog…";
          resetBtn.disabled = true;
        }

        try {
          // Track all unique course codes affected by resetting to repository defaults
          const restoredCodes = [...new Set([...(softDeletedCourses || []), ...(hardDeletedCourses || [])])].sort();
          const revertedCodes = Object.keys(userCourses || {}).filter(code => bundledCourses[code] || remoteCourses[code]).sort();
          const affectedCodes = new Set([...restoredCodes, ...revertedCodes]);
          const changeCount = affectedCodes.size;

          // Track what specific field modifications are being reverted to default
          const revertedDetails = {};
          for (const code of revertedCodes) {
            const userVal = userCourses[code];
            const officialBase = remoteCourses[code] || bundledCourses[code];
            const userObj = typeof userVal === "object" && userVal !== null ? userVal : { name: userVal || "" };
            const officialObj = typeof officialBase === "object" && officialBase !== null ? officialBase : { name: officialBase || "" };

            const changedFields = [];
            if ((userObj.name || "") !== (officialObj.name || "")) changedFields.push("Title");
            if ((userObj.examDay || "") !== (officialObj.examDay || "") || (userObj.examSlot || "") !== (officialObj.examSlot || "")) changedFields.push("Exam Schedule");
            const uPrereq = Array.isArray(userObj.prerequisites) ? userObj.prerequisites.slice().sort().join(",") : "";
            const oPrereq = Array.isArray(officialObj.prerequisites) ? officialObj.prerequisites.slice().sort().join(",") : "";
            if (uPrereq !== oPrereq) changedFields.push("Prerequisites");

            revertedDetails[code] = changedFields.length > 0 ? changedFields.join(" & ") + " Reverted" : "Reverted";
          }

          softDeletedCourses = [];
          hardDeletedCourses = [];

          // Overwrite and clear edits to official courses, preserving custom user-added courses
          const cleanedUserCourses = {};
          for (const [code, val] of Object.entries(userCourses || {})) {
            const isOfficial = !!(bundledCourses[code] || remoteCourses[code]);
            if (!isOfficial) {
              cleanedUserCourses[code] = val;
            }
          }
          userCourses = cleanedUserCourses;

          // Allow the loading animation and spinner to render smoothly
          await Promise.all([
            chrome.storage.local.set({ userCourses, softDeletedCourses, hardDeletedCourses }),
            new Promise(resolve => setTimeout(resolve, 600))
          ]);

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
            const btnMsg = changeCount === 0
              ? "Already at Default (0 changes)"
              : `Restored (${changeCount} ${changeCount === 1 ? "change" : "changes"} applied)`;
            if (resetText) resetText.textContent = btnMsg;
          }

          renderResetResult({
            totalChanges: changeCount,
            restoredCodes,
            revertedCodes,
            revertedDetails,
            timestamp: Date.now()
          });
        } catch (err) {
          console.error("Reset defaults failed:", err);
          if (resetBtn) {
            resetBtn.classList.remove("is-loading");
            resetBtn.classList.add("is-error");
            if (resetText) resetText.textContent = "Could not reset catalog";
          }
        } finally {
          setTimeout(() => {
            if (resetBtn) {
              resetBtn.classList.remove("is-loading", "is-success", "is-error");
              if (resetText) resetText.textContent = "Reset Official Catalog to Default";
              resetBtn.disabled = false;
            }
          }, 2600);
        }
      }

      pendingAction = null;
      pendingSaveVal = null;
      pendingTarget = null;
    });

    function updateSearchClearBtn() {
      if (els.searchClearBtn) {
        els.searchClearBtn.style.display = els.courseSearch?.value ? "flex" : "none";
      }
    }

    els.courseSearch?.addEventListener("input", () => {
      searchQuery = els.courseSearch.value;
      updateSearchClearBtn();
      if (isTrashMode) renderTrashList(searchQuery);
      else renderCourseList(searchQuery);
    });

    els.searchClearBtn?.addEventListener("click", () => {
      if (els.courseSearch) {
        els.courseSearch.value = "";
        searchQuery = "";
        updateSearchClearBtn();
        if (isTrashMode) renderTrashList("");
        else renderCourseList("");
        els.courseSearch.focus();
      }
    });

    els.filterBtns?.forEach(btn => {
      btn.addEventListener("click", () => {
        els.filterBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderCourseList(searchQuery);
      });
    });

    // 2-course sample JSON template matching the placeholder format
    const SAMPLE_TWO_COURSES = JSON.stringify({
      "CSE 3715": {
        "name": "Software Engineering",
        "examDay": "D1",
        "examSlot": "T1",
        "prerequisites": ["CSE 2215", "CSE 2216"]
      },
      "ACT 1111": {
        "name": "Financial Accounting",
        "examDay": "",
        "examSlot": "",
        "prerequisites": []
      }
    }, null, 2);

    // Copy Sample button
    els.copySampleBtn?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(SAMPLE_TWO_COURSES);
        const originalHtml = els.copySampleBtn.innerHTML;
        els.copySampleBtn.innerHTML = `
          <svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:currentColor;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          <span>Copied!</span>
        `;
        els.copySampleBtn.style.background = "var(--accent)";
        els.copySampleBtn.style.color = "#fff";
        showImportMsg("success", "2-course sample JSON copied to clipboard. Customize and click Import & Merge.");
        setTimeout(() => {
          if (els.copySampleBtn) {
            els.copySampleBtn.innerHTML = originalHtml;
            els.copySampleBtn.style.background = "";
            els.copySampleBtn.style.color = "";
          }
        }, 2200);
      } catch (err) {
        console.error("Failed to copy", err);
        if (els.jsonInput && !els.jsonInput.value.trim()) {
          els.jsonInput.value = SAMPLE_TWO_COURSES;
          updateJsonBadge();
          showImportMsg("info", "Sample template loaded directly into the editor.");
        } else {
          showImportMsg("error", "Clipboard access was blocked. Please copy the template from the placeholder.");
        }
      }
    });

    // Add / Import Tab Switching
    els.tabSingleCourse?.addEventListener("click", () => {
      activateSingleCourseTab();
    });

    els.tabBulkImport?.addEventListener("click", () => {
      activateBatchUploadTab(false);
    });

    // Real-time batch editor status update
    els.jsonInput?.addEventListener("input", updateJsonBadge);

    // Validation & auto-uppercase on single course form inputs
    els.singleCourseCode?.addEventListener("input", () => {
      els.singleCourseCode.classList.remove("input-error");
      const start = els.singleCourseCode.selectionStart;
      const end = els.singleCourseCode.selectionEnd;
      els.singleCourseCode.value = els.singleCourseCode.value.toUpperCase();
      if (start !== null && end !== null) {
        els.singleCourseCode.setSelectionRange(start, end);
      }
    });

    els.singleCourseName?.addEventListener("input", () => {
      els.singleCourseName.classList.remove("input-error");
    });

    // Keyboard navigation: Enter in any single course input triggers submit
    [
      els.singleCourseCode,
      els.singleCourseName,
      els.singleCourseDay,
      els.singleCourseSlot,
      els.singleCoursePrereq
    ].forEach(input => {
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          els.addSingleCourseBtn?.click();
        }
      });
    });

    // Add single course to database
    els.addSingleCourseBtn?.addEventListener("click", async () => {
      els.singleCourseCode?.classList.remove("input-error");
      els.singleCourseName?.classList.remove("input-error");

      const rawCode = els.singleCourseCode?.value.trim() || "";
      const rawName = els.singleCourseName?.value.trim() || "";
      const rawDay = els.singleCourseDay?.value.trim() || "";
      const rawSlot = els.singleCourseSlot?.value.trim() || "";
      const rawPrereq = els.singleCoursePrereq?.value.trim() || "";

      if (!rawCode && !rawName) {
        els.singleCourseCode?.classList.add("input-error");
        els.singleCourseName?.classList.add("input-error");
        showSingleCourseMsg("error", "Course code and course title are required.");
        els.singleCourseCode?.focus();
        return;
      }
      if (!rawCode) {
        els.singleCourseCode?.classList.add("input-error");
        showSingleCourseMsg("error", "Please enter a course code (e.g. CSE 3715).");
        els.singleCourseCode?.focus();
        return;
      }
      if (!rawName) {
        els.singleCourseName?.classList.add("input-error");
        showSingleCourseMsg("error", "Please enter a course title (e.g. Software Engineering).");
        els.singleCourseName?.focus();
        return;
      }

      const code = rawCode.toUpperCase();
      const prereqs = rawPrereq 
        ? rawPrereq.split(",").map(p => p.trim().toUpperCase()).filter(Boolean) 
        : [];

      // Construct course object JSON (empty schedule/prereqs if left blank)
      const courseObj = {
        name: rawName,
        examDay: rawDay || "",
        examSlot: rawSlot || "",
        prerequisites: prereqs
      };

      // Un-delete if this course was previously soft or hard deleted
      if (softDeletedCourses.includes(code)) {
        softDeletedCourses = softDeletedCourses.filter(c => c !== code);
      }
      if (hardDeletedCourses.includes(code)) {
        hardDeletedCourses = hardDeletedCourses.filter(c => c !== code);
      }

      userCourses[code] = courseObj;
      courses[code] = courseObj;

      try {
        await chrome.storage.local.set({ userCourses, softDeletedCourses, hardDeletedCourses });
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();
        updateCourseCount();

        if (isTrashMode) {
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
        }

        showSingleCourseMsg("success", `${code} added to course database!`);
        showToast(`${code} added to catalog`, "success");

        // Clear input form for next entry
        if (els.singleCourseCode) els.singleCourseCode.value = "";
        if (els.singleCourseName) els.singleCourseName.value = "";
        if (els.singleCourseDay) els.singleCourseDay.value = "";
        if (els.singleCourseSlot) els.singleCourseSlot.value = "";
        if (els.singleCoursePrereq) els.singleCoursePrereq.value = "";
        els.singleCourseCode?.focus();
      } catch (err) {
        console.error("Failed to add course:", err);
        showSingleCourseMsg("error", "Failed to save course. Please try again.");
      }
    });

    // Clear single course form
    els.clearSingleFormBtn?.addEventListener("click", () => {
      if (els.singleCourseCode) {
        els.singleCourseCode.value = "";
        els.singleCourseCode.classList.remove("input-error");
      }
      if (els.singleCourseName) {
        els.singleCourseName.value = "";
        els.singleCourseName.classList.remove("input-error");
      }
      if (els.singleCourseDay) els.singleCourseDay.value = "";
      if (els.singleCourseSlot) els.singleCourseSlot.value = "";
      if (els.singleCoursePrereq) els.singleCoursePrereq.value = "";
      if (els.singleCourseMsg) {
        els.singleCourseMsg.className = "import-msg";
        els.singleCourseMsg.style.display = "none";
        els.singleCourseMsg.innerHTML = "";
      }
      els.singleCourseCode?.focus();
    });

    // Handle user pasting in a new JSON course list
    els.importBtn?.addEventListener("click", async () => {
      const raw = els.jsonInput.value.trim();
      if (!raw) {
        showImportMsg("error", "Please paste or enter JSON course data before importing.");
        els.jsonInput.focus();
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        showImportMsg("error", `JSON Syntax Error: ${e.message}`);
        return;
      }

      if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
        showImportMsg("error", 'Invalid format: Root must be a JSON object with course codes as keys (e.g. { "CSE 3715": { ... } }).');
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
        const key = k.trim().toUpperCase();
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
        showImportMsg("error", `Found ${errors} invalid course entr${errors === 1 ? "y" : "ies"}. No courses were imported.`);
        return;
      } else if (added === 0) {
        showImportMsg("error", "No valid course entries detected in the provided JSON.");
        return;
      }

      await chrome.storage.local.set({ courses, userCourses, softDeletedCourses, hardDeletedCourses });
      updateCourseCount();
      renderCourseList(searchQuery);
      els.jsonInput.value = "";
      updateJsonBadge();

      let msg = "";
      if (errors > 0) {
        msg = `Successfully imported ${added} course${added !== 1 ? "s" : ""}; skipped ${errors} invalid entr${errors === 1 ? "y" : "ies"}.`;
      } else {
        msg = `Successfully imported and merged ${added} course${added !== 1 ? "s" : ""} into catalog.`;
      }

      if (nameOnlyCount > 0) {
        msg += ` (${nameOnlyCount} added with title only).`;
      }
      showImportMsg("success", msg);
      showToast(`Imported ${added} course${added !== 1 ? "s" : ""}`, "success");
    });

    // Clear JSON editor
    els.clearBtn?.addEventListener("click", () => {
      if (!els.jsonInput) return;
      if (!els.jsonInput.value.trim()) {
        showImportMsg("info", "Editor is already empty.");
        els.jsonInput.focus();
        return;
      }
      els.jsonInput.value = "";
      updateJsonBadge();
      els.jsonInput.focus();
      showImportMsg("info", "Editor cleared.");
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
            const added = stats?.added || 0;
            const updated = stats?.updated || 0;
            const removed = stats?.removed || 0;
            const totalChanges = added + updated + removed;

            let btnText = "Database is up to date";
            if (totalChanges > 0) {
              const parts = [];
              if (added > 0) parts.push(`+${added} new`);
              if (updated > 0) parts.push(`${updated} upd`);
              if (removed > 0) parts.push(`${removed} rem`);
              btnText = `Synced (${parts.join(", ")})`;
            }

            els.syncBtn.classList.remove("is-loading");
            els.syncBtn.classList.add("is-success");
            syncText.textContent = btnText;
            els.syncTime.textContent = formatTimeAgo(lastSyncedAt);

            renderSyncResult(lastSyncResult);
            // Session-only: clear from persistent storage so next popup launch starts clean
            chrome.storage.local.remove("lastSyncResult");
            checkSyncReminder();
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
            checkSyncReminder();
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

    // Dismiss buttons for sync and reset summary boxes
    els.syncResultDismissBtn?.addEventListener("click", () => {
      if (els.syncResultBox) {
        els.syncResultBox.classList.remove("show");
        els.syncResultBox.style.display = "none";
      }
      if (els.syncTime) els.syncTime.style.display = "block";
      lastSyncResult = null;
      chrome.storage.local.remove("lastSyncResult");
    });

    els.resetResultDismissBtn?.addEventListener("click", () => {
      if (els.resetResultBox) {
        els.resetResultBox.classList.remove("show");
        els.resetResultBox.style.display = "none";
      }
    });

    els.resetDefaultsBtn?.addEventListener("click", () => {
      pendingAction = "reset-defaults";
      els.modalText.innerHTML = `
        <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-main); margin-bottom: 6px;">Reset Official Catalog?</div>
        <div style="font-size: 0.73rem; color: var(--text-muted); line-height: 1.5; text-align: justify; text-justify: inter-word;">This will restore all official course mappings and exam schedules to standard repository defaults, discarding any local modifications. Custom user-added courses will remain unaffected.</div>
      `;
      els.confirmModal.classList.add("show");
    });
  }

  init();
})();