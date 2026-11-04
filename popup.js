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
    domainsCountBadge: document.getElementById("domainsCountBadge"),
    domainSearchRow: document.getElementById("domainSearchRow"),
    domainSearchInput: document.getElementById("domainSearchInput"),
    domainSearchClearBtn: document.getElementById("domainSearchClearBtn"),
    domainBulkToolbar: document.getElementById("domainBulkToolbar"),
    domainSelectAll: document.getElementById("domainSelectAll"),
    domainSelectAllText: document.getElementById("domainSelectAllText"),
    bulkRemoveDomainsBtn: document.getElementById("bulkRemoveDomainsBtn"),
    bulkRemoveDomainsBtnText: document.getElementById("bulkRemoveDomainsBtnText"),
    displaySettingsCard: document.getElementById("displaySettingsCard"),
    modeRadios: document.querySelectorAll('input[name="mode"]'),
    showExamInfoToggle: document.getElementById("showExamInfoToggle"),
    showPrerequisitesToggle: document.getElementById("showPrerequisitesToggle"),
    viewWrapper: document.getElementById("viewWrapper"),
    openSettingsBtn: document.getElementById("openSettingsBtn"),
    coursesSettingsBtn: document.getElementById("coursesSettingsBtn"),
    importSettingsBtn: document.getElementById("importSettingsBtn"),
    detailsSettingsBtn: document.getElementById("detailsSettingsBtn"),
    settingsBackBtn: document.getElementById("settingsBackBtn"),
    backBtn: document.getElementById("backBtn"),
    coursesPanelTitle: document.getElementById("coursesPanelTitle"),
    exportCoursesBtn: document.getElementById("exportCoursesBtn"),
    viewTrashBtn: document.getElementById("viewTrashBtn"),
    trashBadge: document.getElementById("trashBadge"),
    coursesPanelCount: document.getElementById("coursesPanelCount"),
    exportModal: document.getElementById("exportModal"),
    exportModalCloseBtn: document.getElementById("exportModalCloseBtn"),
    exportModalCancelBtn: document.getElementById("exportModalCancelBtn"),
    exportOptionsList: document.getElementById("exportOptionsList"),
    fileDropZone: document.getElementById("fileDropZone"),
    jsonFileInput: document.getElementById("jsonFileInput"),
    browseFileBtn: document.getElementById("browseFileBtn"),
    dropZoneIdle: document.getElementById("dropZoneIdle"),
    dropZoneFileInfo: document.getElementById("dropZoneFileInfo"),
    importPreviewModal: document.getElementById("importPreviewModal"),
    previewCloseBtn: document.getElementById("previewCloseBtn"),
    previewCancelBtn: document.getElementById("previewCancelBtn"),
    previewConfirmBtn: document.getElementById("previewConfirmBtn"),
    contributionModal: document.getElementById("contributionModal"),
    contribModalCloseBtn: document.getElementById("contribModalCloseBtn"),
    welcomeCard: document.getElementById("welcomeCard"),
    welcomeDismissBtn: document.getElementById("welcomeDismissBtn"),
    welcomeActionBtn: document.getElementById("welcomeActionBtn"),
    contribModalDoneBtn: document.getElementById("contribModalDoneBtn"),
    openContribModalBtn: document.getElementById("openContribModalBtn"),
    detailsInfoBtn: document.getElementById("detailsInfoBtn"),
    importInfoBtn: document.getElementById("importInfoBtn"),
    contribExportCustomBtn: document.getElementById("contribExportCustomBtn"),
    contribReportIssueBtn: document.getElementById("contribReportIssueBtn"),
    importContribLink: document.getElementById("importContribLink"),
    previewSummaryRow: document.getElementById("previewSummaryRow"),
    previewDiffList: document.getElementById("previewDiffList"),
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
    singleCoursePrereqNote: document.getElementById("singleCoursePrereqNote"),
    singleCourseFormState: document.getElementById("singleCourseFormState"),
    singleCourseSuccessState: document.getElementById("singleCourseSuccessState"),
    singleCourseAccordionToggle: document.getElementById("singleCourseAccordionToggle"),
    singleCourseAccordionBody: document.getElementById("singleCourseAccordionBody"),
    examModeRoutine: document.getElementById("examModeRoutine"),
    examModeInClass: document.getElementById("examModeInClass"),
    pillExamRoutine: document.getElementById("pillExamRoutine"),
    pillExamInClass: document.getElementById("pillExamInClass"),
    routineInputsRow: document.getElementById("routineInputsRow"),
    singleCourseInClass: document.getElementById("singleCourseInClass"),
    singleCourseNoPrereq: document.getElementById("singleCourseNoPrereq"),
    singleCourseContribPrompt: document.getElementById("singleCourseContribPrompt"),
    contribPromptDesc: document.getElementById("contribPromptDesc"),
    contribSubmitGithubBtn: document.getElementById("contribSubmitGithubBtn"),
    contribDismissBtn: document.getElementById("contribDismissBtn"),
    successCourseCode: document.getElementById("successCourseCode"),
    successCourseCredits: document.getElementById("successCourseCredits"),
    successCourseName: document.getElementById("successCourseName"),
    successCourseMeta: document.getElementById("successCourseMeta"),
    successCoursePrereq: document.getElementById("successCoursePrereq"),
    successAddAnotherBtn: document.getElementById("successAddAnotherBtn"),
    successViewCatalogBtn: document.getElementById("successViewCatalogBtn"),
    detailInClass: document.getElementById("detailInClass"),
    detailNoPrereq: document.getElementById("detailNoPrereq"),
    addSingleCourseBtn: document.getElementById("addSingleCourseBtn"),
    clearSingleFormBtn: document.getElementById("clearSingleFormBtn"),
    singleCourseMsg: document.getElementById("singleCourseMsg"),
    openImportBtn: document.getElementById("openImportBtn"),
    importBackBtn: document.getElementById("importBackBtn"),
    detailsBackBtn: document.getElementById("detailsBackBtn"),
    detailsCourseCode: document.getElementById("detailsCourseCode"),
    detailsCourseSubtitle: document.getElementById("detailsCourseSubtitle"),
    detailName: document.getElementById("detailName"),
    detailPrereq: document.getElementById("detailPrereq"),
    detailPrereqNote: document.getElementById("detailPrereqNote"),
    detailDay: document.getElementById("detailDay"),
    detailSlot: document.getElementById("detailSlot"),
    detailCredits: document.getElementById("detailCredits"),
    homeEnrolledCard: document.getElementById("homeEnrolledCard"),
    homeEnrolledCount: document.getElementById("homeEnrolledCount"),
    homeEnrolledCredits: document.getElementById("homeEnrolledCredits"),
    homeClashBadge: document.getElementById("homeClashBadge"),
    homeEnrolledStatusHint: document.getElementById("homeEnrolledStatusHint"),
    mycoursesView: document.querySelector(".mycourses-view"),
    myCoursesBackBtn: document.getElementById("myCoursesBackBtn"),
    myCoursesHeaderSubtitle: document.getElementById("myCoursesHeaderSubtitle"),
    myCoursesAddCard: document.getElementById("myCoursesAddCard"),
    myCoursesSearchInput: document.getElementById("myCoursesSearchInput"),
    myCoursesSearchClearBtn: document.getElementById("myCoursesSearchClearBtn"),
    myCoursesSuggestionsList: document.getElementById("myCoursesSuggestionsList"),
    myCoursesList: document.getElementById("myCoursesList"),
    myCoursesEmptyState: document.getElementById("myCoursesEmptyState"),
    browseCatalogFromMyCoursesBtn: document.getElementById("browseCatalogFromMyCoursesBtn"),
    filterEnrolledBtn: document.getElementById("filterEnrolledBtn"),
    enrolledCountBadge: document.getElementById("enrolledCountBadge"),
    enrolledSummaryCard: document.getElementById("enrolledSummaryCard"),
    enrolledTotalCourses: document.getElementById("enrolledTotalCourses"),
    enrolledTotalCredits: document.getElementById("enrolledTotalCredits"),
    clearEnrolledBtn: document.getElementById("clearEnrolledBtn"),
    clashAlertBox: document.getElementById("clashAlertBox"),
    clashAlertTitle: document.getElementById("clashAlertTitle"),
    clashAlertSubtitle: document.getElementById("clashAlertSubtitle"),
    clashAlertList: document.getElementById("clashAlertList"),
    detailsEnrollBtn: document.getElementById("detailsEnrollBtn"),
    detailsEnrollBtnText: document.getElementById("detailsEnrollBtnText"),
    detailClashWarning: document.getElementById("detailClashWarning"),
    detailClashText: document.getElementById("detailClashText"),
    examExportModal: document.getElementById("examExportModal"),
    examExportCloseBtn: document.getElementById("examExportCloseBtn"),
    examExportCancelBtn: document.getElementById("examExportCancelBtn"),
    openIcsExportBtn: document.getElementById("openIcsExportBtn"),
    icsStartDateInput: document.getElementById("icsStartDateInput"),
    icsEventCount: document.getElementById("icsEventCount"),
    icsPreviewList: document.getElementById("icsPreviewList"),
    icsRemindersToggle: document.getElementById("icsRemindersToggle"),
    downloadIcsBtn: document.getElementById("downloadIcsBtn"),
    themeSettingsCard: document.getElementById("themeSettingsCard"),
    themeSystem: document.getElementById("themeSystem"),
    themeLight: document.getElementById("themeLight"),
    themeDark: document.getElementById("themeDark"),
    themeStatusHint: document.getElementById("themeStatusHint"),
    detailsCreditsBadge: document.getElementById("detailsCreditsBadge"),
    singleCourseCredits: document.getElementById("singleCourseCredits"),
    detailSaveBtn: document.getElementById("detailSaveBtn"),
    detailDelBtn: document.getElementById("detailDelBtn"),
    reportIssueBtn: document.getElementById("reportIssueBtn"),
    detailReportCard: document.getElementById("detailReportCard"),
    detailReportTitle: document.getElementById("detailReportTitle"),
    detailReportBody: document.getElementById("detailReportBody"),
    detailReportBtnText: document.getElementById("detailReportBtnText"),
    detailReportFooterHint: document.getElementById("detailReportFooterHint"),
    detailSaveContribPrompt: document.getElementById("detailSaveContribPrompt"),
    detailSaveContribGithubBtn: document.getElementById("detailSaveContribGithubBtn"),
    detailSaveContribDoneBtn: document.getElementById("detailSaveContribDoneBtn"),
    detailSaveContribClose: document.getElementById("detailSaveContribClose"),
    detailPrereqLauncherCard: document.getElementById("detailPrereqLauncherCard"),
    detailPrereqReqChip: document.getElementById("detailPrereqReqChip"),
    detailPrereqUnlockChip: document.getElementById("detailPrereqUnlockChip"),
    detailPrereqLauncherDesc: document.getElementById("detailPrereqLauncherDesc"),
    btnOpenPrereqFlow: document.getElementById("btnOpenPrereqFlow"),
    btnOpenPrereqFlowText: document.getElementById("btnOpenPrereqFlowText"),
    prereqFlowView: document.getElementById("prereqFlowView"),
    flowBackBtn: document.getElementById("flowBackBtn"),
    flowCourseCode: document.getElementById("flowCourseCode"),
    flowOriginBadge: document.getElementById("flowOriginBadge"),
    flowCourseSubtitle: document.getElementById("flowCourseSubtitle"),
    flowSettingsBtn: document.getElementById("flowSettingsBtn"),
    flowHeroTitle: document.getElementById("flowHeroTitle"),
    flowHeroCredits: document.getElementById("flowHeroCredits"),
    flowHeroReqText: document.getElementById("flowHeroReqText"),
    flowHeroUnlockText: document.getElementById("flowHeroUnlockText"),
    flowPrereqNoteCard: document.getElementById("flowPrereqNoteCard"),
    flowPrereqNoteText: document.getElementById("flowPrereqNoteText"),
    prereqTreeSection: document.getElementById("prereqTreeSection"),
    prereqChainBody: document.getElementById("prereqChainBody"),
    prereqChainCount: document.getElementById("prereqChainCount"),
    unlocksBody: document.getElementById("unlocksBody"),
    unlocksCount: document.getElementById("unlocksCount"),
    prereqToggleCode: document.getElementById("prereqToggleCode"),
    prereqToggleName: document.getElementById("prereqToggleName"),
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
  let lastAddedCourseForContrib = null;
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
    } else if (type === 'restore') {
      svg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
      path.setAttribute("d", "M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.896 8.896 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z");
    } else if (type === 'delete') {
      svg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
      path.setAttribute("d", "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z");
    } else if (type === 'remove') {
      svg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
      path.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    } else if (type === 'export' || type === 'download') {
      svg.setAttribute("style", "width:16px;height:16px;fill:currentColor;");
      path.setAttribute("d", "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z");
    }

    svg.appendChild(path);
    return svg;
  }

  let currentHost = "";
  let courses = {};
  let currentThemePreference = "system"; // "system" | "light" | "dark"

  // ── Task 3.4: System-Adaptive Dark Mode Palette ──────────────────────────
  function applyTheme(preference) {
    currentThemePreference = preference || "system";
    const root = document.documentElement;

    const isSystemDark = !!(typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const effectiveDark = currentThemePreference === "dark" || (currentThemePreference === "system" && isSystemDark);

    if (effectiveDark) {
      root.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
    root.setAttribute("data-theme-preference", currentThemePreference);

    const themeButtons = [
      { btn: els.themeSystem, val: "system" },
      { btn: els.themeLight, val: "light" },
      { btn: els.themeDark, val: "dark" }
    ];

    themeButtons.forEach(({ btn, val }) => {
      if (!btn) return;
      const isActive = val === currentThemePreference;
      if (isActive) {
        btn.classList.add("active");
        btn.setAttribute("aria-checked", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-checked", "false");
      }
    });

    if (els.themeStatusHint) {
      if (currentThemePreference === "system") {
        els.themeStatusHint.textContent = `System theme active (currently ${isSystemDark ? "Dark" : "Light"}). Adapts automatically.`;
      } else if (currentThemePreference === "dark") {
        els.themeStatusHint.textContent = "Dark theme active.";
      } else {
        els.themeStatusHint.textContent = "Light theme active.";
      }
    }
  }

  function setTheme(preference) {
    applyTheme(preference);
    chrome.storage.local.set({ themePreference: preference });
  }

  // Monitor OS preference changes dynamically
  if (typeof window !== "undefined" && window.matchMedia) {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSchemeChange = () => {
      if (currentThemePreference === "system") {
        applyTheme("system");
      }
    };
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleSchemeChange);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleSchemeChange);
    }
  }
  // ── End Task 3.4 Theme Engine ───────────────────────────────────────────
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
  let enrolledCourses = []; // Task 3.2: Enrolled courses for current trimester
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
    const stored = await chrome.storage.local.get(["courses", "userCourses", "softDeletedCourses", "mode", "allowedSites", "showExamInfo", "showPrerequisites", "lastSyncedAt", "remoteCourses", "hardDeletedCourses", "lastSyncResult", "themePreference", "enrolledCourses", "welcomeDismissed"]);
    if (els.viewWrapper) {
      if (stored.welcomeDismissed) {
        els.viewWrapper.classList.remove("show-welcome");
      } else {
        els.viewWrapper.classList.add("show-welcome");
      }
    }
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
    currentThemePreference = stored.themePreference || "system";
    enrolledCourses = Array.isArray(stored.enrolledCourses) ? stored.enrolledCourses : [];
    applyTheme(currentThemePreference);

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

  const UIU_PORTALS = [
    { domain: "ucam.uiu.ac.bd", label: "UCAM Portal" },
    { domain: "elms.uiu.ac.bd", label: "eLMS / LMS" },
    { domain: "docs.google.com", label: "Google Docs (Optional)" }
  ];

  async function checkOnboarding() {
    const stored = await chrome.storage.local.get(["onboardingDone", "allowedSites"]);
    const isFirstRun = !stored.onboardingDone;
    const savedSites = stored.allowedSites || [];

    const regrantBanner = document.getElementById("regrantBanner");
    const onboardingCard = document.getElementById("onboardingCard");

    if (isFirstRun && savedSites.length === 0) {
      if (onboardingCard) {
        onboardingCard.style.display = "block";
        const grantBtns = document.getElementById("onboardingGrantBtns");
        if (grantBtns) {
          grantBtns.textContent = "";
          for (const portal of UIU_PORTALS) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.style.cssText = "display:flex; align-items:center; gap:6px; background:var(--accent-light); color:var(--accent); border:1px solid var(--accent); border-radius:8px; padding:6px 10px; font-size:0.72rem; cursor:pointer; width:100%; font-weight:600;";
            btn.textContent = `Enable on ${portal.label} (${portal.domain})`;
            btn.addEventListener("click", async () => {
              const origin = `*://${portal.domain}/*`;
              try {
                const granted = await chrome.permissions.request({ origins: [origin] });
                if (granted) {
                  if (!allowedSites.includes(portal.domain)) {
                    allowedSites.push(portal.domain);
                    await chrome.storage.local.set({ allowedSites });
                    renderAllowlist();
                    updateToggleAndStatus();
                  }
                  btn.textContent = `✓ ${portal.label} enabled`;
                  btn.disabled = true;
                  btn.style.opacity = "0.6";
                }
              } catch (e) {
                console.warn("Permission request failed:", e);
              }
            });
            grantBtns.appendChild(btn);
          }
        }
      }
    } else if (savedSites.length > 0) {
      const needsRegrant = [];
      for (const site of savedSites) {
        const origin = `*://${site.replace(/^\*\./, "")}/*`;
        try {
          const hasPermission = await chrome.permissions.contains({ origins: [origin] });
          if (!hasPermission) needsRegrant.push(site);
        } catch (_) {}
      }
      if (needsRegrant.length > 0 && regrantBanner) {
        regrantBanner.style.display = "flex";
        const regrantLink = document.getElementById("regrantLink");
        if (regrantLink) {
          regrantLink.addEventListener("click", async () => {
            for (const site of needsRegrant) {
              const origin = `*://${site.replace(/^\*\./, "")}/*`;
              try {
                await chrome.permissions.request({ origins: [origin] });
              } catch (_) {}
            }
            regrantBanner.style.display = "none";
          });
        }
      }
    }

    const dismissBtn = document.getElementById("onboardingDismissBtn");
    if (dismissBtn) {
      dismissBtn.addEventListener("click", async () => {
        if (onboardingCard) onboardingCard.style.display = "none";
        await chrome.storage.local.set({ onboardingDone: true });
      });
    }
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
    updateEnrolledUI();
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
    const h = host.toLowerCase().trim();
    return (sites || []).some((pattern) => {
      if (!pattern) return false;
      const p = pattern.toLowerCase().trim();
      if (h === p) return true;
      if (p.startsWith("*.")) {
        const baseDomain = p.slice(2);
        if (h === baseDomain || h.endsWith("." + baseDomain)) return true;
      }
      if (h.endsWith("." + p)) return true;
      const regex = "^" + p.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
      try {
        return new RegExp(regex, "i").test(h);
      } catch (_) {
        return false;
      }
    });
  }

  async function updateToggleAndStatus() {
    let enabled = isHostAllowed(currentHost, allowedSites);
    if (enabled && currentHost) {
      try {
        let hasPerm = await chrome.permissions.contains({ origins: [`*://${currentHost}/*`] });
        if (!hasPerm) {
          for (const pattern of allowedSites) {
            if (isHostAllowed(currentHost, [pattern])) {
              const originPattern = pattern.startsWith("*.") ? `*://${pattern}/*` : `*://${pattern}/*`;
              if (await chrome.permissions.contains({ origins: [originPattern] }).catch(() => false)) {
                hasPerm = true;
                break;
              }
            }
          }
        }
        if (!hasPerm) {
          enabled = false;
        }
      } catch (_) {}
    }
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

  let domainSearchQuery = "";
  const selectedDomainSet = new Set();

  function renderAllowlist() {
    if (!els.allowlistContainer) return;
    els.allowlistContainer.textContent = "";

    const totalCount = allowedSites.length;
    const filterQuery = domainSearchQuery.trim().toLowerCase();

    // Clean up selectedDomainSet to ensure it only contains currently existing domains
    selectedDomainSet.forEach(site => {
      if (!allowedSites.includes(site)) {
        selectedDomainSet.delete(site);
      }
    });

    // Update count badge
    if (els.domainsCountBadge) {
      if (!filterQuery) {
        els.domainsCountBadge.textContent = totalCount + " domain" + (totalCount !== 1 ? "s" : "");
      } else {
        const matching = allowedSites.filter(s => s.toLowerCase().includes(filterQuery)).length;
        els.domainsCountBadge.textContent = matching + " of " + totalCount;
      }
    }

    // Toggle search row and bulk toolbar visibility
    if (els.domainSearchRow) {
      els.domainSearchRow.style.display = totalCount >= 2 ? "flex" : "none";
    }
    if (els.domainBulkToolbar) {
      els.domainBulkToolbar.style.display = totalCount >= 1 ? "flex" : "none";
    }

    // Toggle search clear button
    if (els.domainSearchClearBtn) {
      els.domainSearchClearBtn.style.display = filterQuery ? "flex" : "none";
    }

    // If no domains at all
    if (totalCount === 0) {
      const msg = document.createElement("div");
      msg.style.padding = "8px 4px";
      msg.style.textAlign = "center";
      msg.style.color = "var(--text-muted)";
      msg.style.fontSize = "0.72rem";
      msg.textContent = "No domains allowed yet.";
      els.allowlistContainer.appendChild(msg);

      if (els.domainBulkToolbar) els.domainBulkToolbar.style.display = "none";
      if (els.domainSearchRow) els.domainSearchRow.style.display = "none";
      updateBulkToolbarState([]);
      return;
    }

    // Filtered list
    const visibleSites = filterQuery
      ? allowedSites.filter(site => site.toLowerCase().includes(filterQuery))
      : allowedSites;

    // Update "Select All" checkbox state
    updateBulkToolbarState(visibleSites);

    // If query returned no results
    if (visibleSites.length === 0) {
      const emptyDiv = document.createElement("div");
      emptyDiv.style.cssText = "padding:14px 6px; text-align:center; color:var(--text-muted); font-size:0.71rem; display:flex; flex-direction:column; align-items:center; gap:4px;";

      const emptyText = document.createElement("span");
      emptyText.textContent = 'No domains match "' + domainSearchQuery + '"';
      emptyDiv.appendChild(emptyText);

      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.style.cssText = "background:none; border:none; color:var(--accent); font-weight:600; font-size:0.68rem; cursor:pointer; text-decoration:underline; padding:0;";
      clearBtn.textContent = "Clear search";
      clearBtn.addEventListener("click", () => {
        domainSearchQuery = "";
        if (els.domainSearchInput) els.domainSearchInput.value = "";
        renderAllowlist();
      });
      emptyDiv.appendChild(clearBtn);

      els.allowlistContainer.appendChild(emptyDiv);
      return;
    }

    const frag = document.createDocumentFragment();
    visibleSites.forEach(site => {
      const row = document.createElement("div");
      const isSelected = selectedDomainSet.has(site);
      row.className = "allowlist-item" + (isSelected ? " is-selected" : "");

      const left = document.createElement("div");
      left.className = "allowlist-item-left";

      // Multi-select checkbox
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = isSelected;
      checkbox.title = "Select " + site;
      checkbox.setAttribute("aria-label", "Select " + site);
      checkbox.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleDomainSelection(site, checkbox.checked);
      });

      const iconSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      iconSvg.setAttribute("class", "allowlist-item-icon");
      iconSvg.setAttribute("viewBox", "0 0 24 24");
      const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      iconPath.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z");
      iconSvg.appendChild(iconPath);

      const span = document.createElement("span");
      span.className = "allowlist-item-text";
      span.textContent = site;

      left.appendChild(checkbox);
      left.appendChild(iconSvg);
      left.appendChild(span);

      // Single item remove button
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.appendChild(createIcon('remove'));
      removeBtn.title = "Remove " + site;
      removeBtn.setAttribute("aria-label", "Remove " + site);
      removeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const origin = site.startsWith("*") ? "*://" + site.replace(/^\*\./, "") + "/*" : "*://" + site + "/*";
        try {
          await chrome.permissions.remove({ origins: [origin] });
        } catch (_) {}

        allowedSites = allowedSites.filter(s => s !== site);
        selectedDomainSet.delete(site);
        await chrome.storage.local.set({ allowedSites });
        renderAllowlist();
        await updateToggleAndStatus();
        showToast("Removed " + site, "info");
      });

      // Tapping row toggles checkbox
      row.addEventListener("click", () => {
        const nextState = !selectedDomainSet.has(site);
        toggleDomainSelection(site, nextState);
      });

      row.appendChild(left);
      row.appendChild(removeBtn);
      frag.appendChild(row);
    });

    els.allowlistContainer.appendChild(frag);
  }

  function toggleDomainSelection(site, isSelected) {
    if (isSelected) {
      selectedDomainSet.add(site);
    } else {
      selectedDomainSet.delete(site);
    }
    renderAllowlist();
  }

  function updateBulkToolbarState(visibleSites) {
    if (!els.domainSelectAll || !els.bulkRemoveDomainsBtn) return;

    const visibleCount = visibleSites.length;
    const allVisibleSelected = visibleCount > 0 && visibleSites.every(s => selectedDomainSet.has(s));
    const someVisibleSelected = visibleSites.some(s => selectedDomainSet.has(s));

    els.domainSelectAll.checked = allVisibleSelected;
    els.domainSelectAll.indeterminate = !allVisibleSelected && someVisibleSelected;

    if (els.domainSelectAllText) {
      els.domainSelectAllText.textContent = allVisibleSelected ? "Deselect All" : "Select All";
    }

    const selectedCount = selectedDomainSet.size;
    if (selectedCount > 0) {
      els.bulkRemoveDomainsBtn.disabled = false;
      if (els.bulkRemoveDomainsBtnText) {
        els.bulkRemoveDomainsBtnText.textContent = "Remove (" + selectedCount + ")";
      }
    } else {
      els.bulkRemoveDomainsBtn.disabled = true;
      if (els.bulkRemoveDomainsBtnText) {
        els.bulkRemoveDomainsBtnText.textContent = "Remove Selected";
      }
    }
  }

    function setModalText(title, desc) {
    if (!els.modalText) return;
    els.modalText.textContent = "";
    const titleDiv = document.createElement("div");
    titleDiv.style.cssText = "font-weight:700; font-size:0.86rem; color:var(--text-main); margin-bottom:4px;";
    titleDiv.textContent = title;
    els.modalText.appendChild(titleDiv);
    if (desc) {
      const descDiv = document.createElement("div");
      descDiv.style.cssText = "font-size:0.72rem; color:var(--text-muted); line-height:1.4;";
      descDiv.textContent = desc;
      els.modalText.appendChild(descDiv);
    }
  }

  function normalizeCourseData(val) {
    if (!val) return { name: "", examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
    if (typeof val === "string") {
      return { name: val.trim(), examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
    }
    const name = (val.name || "").trim();
    const examDay = (val.examDay || "").trim();
    const examSlot = (val.examSlot || "").trim();
    const prerequisiteNote = (val.prerequisiteNote || "").trim();
    const prerequisites = Array.isArray(val.prerequisites)
      ? val.prerequisites.map(p => String(p).trim()).filter(Boolean).sort()
      : [];
    let credits = null;
    if (val.credits !== undefined && val.credits !== null && val.credits !== "") {
      const parsed = parseFloat(val.credits);
      if (!isNaN(parsed) && parsed > 0) credits = parsed;
    }
    return { name, examDay, examSlot, prerequisites, prerequisiteNote, credits };
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
    if (a.prerequisiteNote !== b.prerequisiteNote) return false;
    if (a.credits !== b.credits) return false;
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

  // ── EXPORT COURSE CATALOG ──
  function formatCourseForExport(courseData) {
    const norm = normalizeCourseData(courseData);
    const out = {
      name: norm.name,
      examDay: norm.examDay || "",
      examSlot: norm.examSlot || "",
      prerequisites: Array.isArray(norm.prerequisites) ? norm.prerequisites : []
    };
    if (norm.prerequisiteNote) {
      out.prerequisiteNote = norm.prerequisiteNote;
    }
    return out;
  }

  function getExportDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function downloadJsonFile(filename, dataObj) {
    try {
      const jsonStr = JSON.stringify(dataObj, null, 2);
      let url;
      try {
        const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
        url = URL.createObjectURL(blob);
      } catch (_) {
        url = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) {
          a.parentNode.removeChild(a);
        }
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          try { URL.revokeObjectURL(url); } catch (_) {}
        }
      }, 200);
      showToast(`Exported ${filename}`, "success");
    } catch (err) {
      console.error("Failed to export JSON file", err);
      showToast("Export failed: " + (err.message || "Unknown error"), "danger");
    }
  }

  function triggerExportSuccessFeedback() {
    if (!els.exportCoursesBtn) return;
    const successIcon = createIcon('success');
    successIcon.style.color = '#10b981';
    els.exportCoursesBtn.textContent = "";
    els.exportCoursesBtn.appendChild(successIcon);
    els.exportCoursesBtn.classList.add("export-success");
    els.exportCoursesBtn.title = "Export downloaded successfully!";

    setTimeout(() => {
      if (!els.exportCoursesBtn) return;
      els.exportCoursesBtn.textContent = "";
      els.exportCoursesBtn.appendChild(createIcon('export'));
      els.exportCoursesBtn.classList.remove("export-success");
      els.exportCoursesBtn.title = "Export Courses";
    }, 1800);
  }

  function createExportOptionCard({ badge, title, countText, desc, isContextual, isDisabled, onClick }) {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "export-option-card" + (isContextual ? " contextual" : "") + (isDisabled ? " disabled" : "");
    if (isDisabled) {
      card.disabled = true;
    }

    const topRow = document.createElement("div");
    topRow.className = "export-option-top";

    const titleEl = document.createElement("div");
    titleEl.className = "export-option-title";
    titleEl.textContent = title;

    if (badge) {
      const badgeEl = document.createElement("span");
      badgeEl.className = "export-option-badge";
      badgeEl.textContent = badge;
      titleEl.appendChild(badgeEl);
    }

    const countEl = document.createElement("span");
    countEl.className = "export-option-count";
    countEl.textContent = countText;

    topRow.appendChild(titleEl);
    topRow.appendChild(countEl);

    const descEl = document.createElement("div");
    descEl.className = "export-option-desc";
    descEl.textContent = desc;

    card.appendChild(topRow);
    card.appendChild(descEl);

    if (!isDisabled && typeof onClick === "function") {
      card.addEventListener("click", () => {
        onClick();
        closeExportModal();
        triggerExportSuccessFeedback();
      });
    }

    return card;
  }

  function renderExportOptions() {
    if (!els.exportOptionsList) return;
    els.exportOptionsList.textContent = "";
    const dateStr = getExportDateString();

    const lc = (searchQuery || "").toLowerCase().trim();
    const isFiltered = currentFilter !== "all" || lc.length > 0;

    // 1. Contextual Option (Visible when a filter or search is active)
    if (isFiltered) {
      const visibleEntries = Object.entries(courses).filter(([code, courseData]) => {
        const name = typeof courseData === "object" && courseData !== null ? (courseData.name || "") : (courseData || "");
        if (lc && !String(code).toLowerCase().includes(lc) && !String(name).toLowerCase().includes(lc)) {
          return false;
        }
        const inBundled = !!bundledCourses[code];
        const inRemote = !!remoteCourses[code];
        const inUser = !!userCourses[code];
        let origin = "";
        if (!inBundled && !inRemote && inUser) origin = "user";
        else if ((inBundled || inRemote) && inUser) origin = "edited";
        else origin = "official";
        if (currentFilter !== "all" && currentFilter !== origin) return false;
        return true;
      }).sort((a, b) => a[0].localeCompare(b[0]));

      let filterLabel = "";
      if (currentFilter === "user") filterLabel = "User Added";
      else if (currentFilter === "edited") filterLabel = "Edited";
      else if (currentFilter === "official") filterLabel = "Official";

      let contextualTitle = "Current View";
      let contextualDesc = "Export only the courses currently matched and visible in your list.";
      let filenamePart = "filtered";

      if (currentFilter !== "all" && lc) {
        contextualTitle = `Current View: "${lc}" in ${filterLabel}`;
        contextualDesc = `Export ${visibleEntries.length} course${visibleEntries.length !== 1 ? 's' : ''} matching "${lc}" in ${filterLabel}.`;
        filenamePart = `${currentFilter}-${lc.replace(/[^a-z0-9]/gi, "_")}`;
      } else if (lc) {
        contextualTitle = `Search Results: "${lc}"`;
        contextualDesc = `Export ${visibleEntries.length} course${visibleEntries.length !== 1 ? 's' : ''} matching search term "${lc}".`;
        filenamePart = `search-${lc.replace(/[^a-z0-9]/gi, "_")}`;
      } else if (currentFilter !== "all") {
        contextualTitle = `Filter: ${filterLabel}`;
        contextualDesc = `Export all ${visibleEntries.length} courses in the ${filterLabel} view.`;
        filenamePart = currentFilter;
      }

      const contextualCard = createExportOptionCard({
        badge: "CURRENT VIEW",
        title: contextualTitle,
        countText: `${visibleEntries.length} course${visibleEntries.length !== 1 ? 's' : ''}`,
        desc: contextualDesc,
        isContextual: true,
        isDisabled: visibleEntries.length === 0,
        onClick: () => {
          const payload = {};
          for (const [code, data] of visibleEntries) {
            payload[code] = formatCourseForExport(data);
          }
          downloadJsonFile(`uiu-courses-${filenamePart}-${dateStr}.json`, payload);
        }
      });
      els.exportOptionsList.appendChild(contextualCard);
    }

    // 2. Active Catalog (All Courses)
    const allEntries = Object.entries(courses).sort((a, b) => a[0].localeCompare(b[0]));
    const allCard = createExportOptionCard({
      title: "Active Catalog (All Courses)",
      countText: `${allEntries.length} course${allEntries.length !== 1 ? 's' : ''}`,
      desc: "Complete merged catalog including official baseline, remote sync updates, and your customizations.",
      isContextual: false,
      isDisabled: allEntries.length === 0,
      onClick: () => {
        const payload = {};
        for (const [code, data] of allEntries) {
          payload[code] = formatCourseForExport(data);
        }
        downloadJsonFile(`uiu-courses-catalog-${dateStr}.json`, payload);
      }
    });
    els.exportOptionsList.appendChild(allCard);

    // 3. Custom Additions & Edits
    const customEntries = Object.entries(userCourses)
      .filter(([code]) => !softDeletedCourses.includes(code) && !hardDeletedCourses.includes(code))
      .sort((a, b) => a[0].localeCompare(b[0]));
    const customCard = createExportOptionCard({
      title: "Custom Additions & Edits",
      countText: `${customEntries.length} course${customEntries.length !== 1 ? 's' : ''}`,
      desc: customEntries.length > 0
        ? "Only courses you created or modified locally. Ideal for personal backups or sharing with classmates."
        : "No custom courses or edits saved yet. Add courses to enable this export.",
      isContextual: false,
      isDisabled: customEntries.length === 0,
      onClick: () => {
        const payload = {};
        for (const [code, data] of customEntries) {
          const finalData = courses[code] || data;
          payload[code] = formatCourseForExport(finalData);
        }
        downloadJsonFile(`uiu-custom-courses-${dateStr}.json`, payload);
      }
    });
    els.exportOptionsList.appendChild(customCard);
  }

  /**
   * Contextual course exporter.
   * Exports custom courses if available, or opens the Course Catalog export options.
   * @param {string} [type="catalog"] - 'custom' or 'catalog'
   */
  function exportCoursesContextual(type) {
    const dateStr = getExportDateString();
    if (type === "custom") {
      const customEntries = Object.entries(userCourses)
        .filter(([code]) => !softDeletedCourses.includes(code) && !hardDeletedCourses.includes(code))
        .sort((a, b) => a[0].localeCompare(b[0]));

      if (customEntries.length > 0) {
        const payload = {};
        for (const [code, data] of customEntries) {
          const finalData = courses[code] || data;
          payload[code] = formatCourseForExport(finalData);
        }
        downloadJsonFile(`uiu-custom-courses-${dateStr}.json`, payload);
        showToast(`Exported ${customEntries.length} custom course(s) ready for contribution`, "success");
      } else {
        openExportModal();
        showToast("No custom edits found yet. Showing catalog export options...", "info");
      }
    } else {
      openExportModal();
    }
  }

  // ── Task 3.5: Keyboard Navigation & Focus Trap Engine ───────────────────
  let lastFocusedElementBeforeModal = null;

  function openModalSafely(modalEl, initialFocusEl) {
    if (!modalEl) return;
    lastFocusedElementBeforeModal = document.activeElement;
    modalEl.classList.add("show");
    setTimeout(() => {
      if (initialFocusEl && typeof initialFocusEl.focus === "function") {
        initialFocusEl.focus();
      } else {
        const first = modalEl.querySelector(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        first?.focus();
      }
    }, 50);
  }

  function closeModalSafely(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("show");
    if (lastFocusedElementBeforeModal && typeof lastFocusedElementBeforeModal.focus === "function") {
      try {
        lastFocusedElementBeforeModal.focus();
      } catch (e) {
        // Safe fallback
      }
      lastFocusedElementBeforeModal = null;
    }
  }

  function trapModalFocus(modalEl, e) {
    if (!modalEl || !modalEl.classList.contains("show")) return false;
    const focusables = Array.from(modalEl.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);

    if (!focusables.length) return false;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === first || !modalEl.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
          return true;
        }
      } else {
        if (document.activeElement === last || !modalEl.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
          return true;
        }
      }
    }
    return false;
  }

  function openExportModal() {
    renderExportOptions();
    openModalSafely(els.exportModal, els.exportModalCloseBtn);
  }

  function closeExportModal() {
    closeModalSafely(els.exportModal);
  }

  let pendingImportDiff = null;

  // ── PRE-COMMIT IMPORT DIFF & PREVIEW ──
  function computeImportDiff(parsedData, currentCourses) {
    const toAdd = [];
    const toUpdate = [];
    const unchanged = [];
    const errors = [];

    for (const [k, v] of Object.entries(parsedData)) {
      if (typeof k !== "string" || !k.trim()) {
        errors.push({ code: String(k), reason: "Empty or invalid course code" });
        continue;
      }
      const code = k.trim().toUpperCase();

      let incoming;
      let isNameOnly = false;
      if (typeof v === "string" && v.trim()) {
        incoming = { name: v.trim(), examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "" };
        isNameOnly = true;
      } else if (typeof v === "object" && v !== null && typeof v.name === "string" && v.name.trim()) {
        incoming = {
          name: v.name.trim(),
          examDay: typeof v.examDay === "string" ? v.examDay.trim() : "",
          examSlot: typeof v.examSlot === "string" ? v.examSlot.trim() : "",
          prerequisites: Array.isArray(v.prerequisites)
            ? v.prerequisites.map(p => String(p).trim()).filter(Boolean).sort()
            : [],
          prerequisiteNote: typeof v.prerequisiteNote === "string" ? v.prerequisiteNote.trim() : "",
          credits: (v.credits !== undefined && v.credits !== null && v.credits !== "" && !isNaN(parseFloat(v.credits)) && parseFloat(v.credits) > 0) ? parseFloat(v.credits) : null
        };
        const hasExamDay = !!incoming.examDay;
        const hasExamSlot = !!incoming.examSlot;
        const hasPrereqs = incoming.prerequisites.length > 0;
        const hasPrereqNote = !!incoming.prerequisiteNote;
        if (!hasExamDay && !hasExamSlot && !hasPrereqs && !hasPrereqNote) {
          isNameOnly = true;
        }
      } else {
        errors.push({ code, reason: "Missing required course title or invalid format" });
        continue;
      }

      const existing = currentCourses[code];
      if (!existing) {
        toAdd.push({ code, incoming, isNameOnly });
      } else {
        const normExisting = normalizeCourseData(existing);
        if (areCourseDataEqual(normExisting, incoming)) {
          unchanged.push({ code, existing: normExisting });
        } else {
          const changes = [];
          if (normExisting.name !== incoming.name) {
            changes.push({ field: "Course Title", oldVal: normExisting.name || "—", newVal: incoming.name });
          }
          const oldExam = [normExisting.examDay, normExisting.examSlot].filter(Boolean).join(" / ") || "—";
          const newExam = [incoming.examDay, incoming.examSlot].filter(Boolean).join(" / ") || "—";
          if (oldExam !== newExam) {
            changes.push({ field: "Exam Routine", oldVal: oldExam, newVal: newExam });
          }
          const oldPrereqs = normExisting.prerequisites.join(", ") || "None";
          const newPrereqs = incoming.prerequisites.join(", ") || "None";
          if (oldPrereqs !== newPrereqs) {
            changes.push({ field: "Prerequisites", oldVal: oldPrereqs, newVal: newPrereqs });
          }
          if (normExisting.prerequisiteNote !== incoming.prerequisiteNote) {
            changes.push({ field: "Prerequisite Note", oldVal: normExisting.prerequisiteNote || "None", newVal: incoming.prerequisiteNote || "None" });
          }
          toUpdate.push({ code, oldData: normExisting, incoming, changes, isNameOnly });
        }
      }
    }

    return { toAdd, toUpdate, unchanged, errors };
  }

  function renderImportPreview(diff) {
    if (!els.previewSummaryRow || !els.previewDiffList) return;
    els.previewSummaryRow.textContent = "";
    els.previewDiffList.textContent = "";

    function createSummaryPill(className, iconPathD, label) {
      const pill = document.createElement("span");
      pill.className = "summary-pill " + className;
      if (iconPathD) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 24 24");
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("d", iconPathD);
        svg.appendChild(p);
        pill.appendChild(svg);
      }
      pill.appendChild(document.createTextNode(label));
      return pill;
    }

    // Summary pills
    if (diff.toAdd.length > 0) {
      els.previewSummaryRow.appendChild(
        createSummaryPill("pill-new", "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z", "+" + diff.toAdd.length + " New")
      );
    }
    if (diff.toUpdate.length > 0) {
      els.previewSummaryRow.appendChild(
        createSummaryPill("pill-update", "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z", "~" + diff.toUpdate.length + " Modified")
      );
    }
    if (diff.unchanged.length > 0) {
      els.previewSummaryRow.appendChild(
        createSummaryPill("pill-unchanged", "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z", "=" + diff.unchanged.length + " Identical")
      );
    }
    if (diff.errors.length > 0) {
      els.previewSummaryRow.appendChild(
        createSummaryPill("pill-invalid", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z", "!" + diff.errors.length + " Skipped")
      );
    }

    // Dynamic confirm button updates
    const totalChanges = diff.toAdd.length + diff.toUpdate.length;
    if (els.previewConfirmBtn) {
      els.previewConfirmBtn.textContent = "";
      const checkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      checkSvg.setAttribute("viewBox", "0 0 24 24");
      checkSvg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
      const checkPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      checkPath.setAttribute("d", "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z");
      checkSvg.appendChild(checkPath);
      els.previewConfirmBtn.appendChild(checkSvg);

      if (totalChanges > 0) {
        els.previewConfirmBtn.disabled = false;
        els.previewConfirmBtn.style.opacity = "1";
        els.previewConfirmBtn.style.cursor = "pointer";
        els.previewConfirmBtn.appendChild(document.createTextNode("Confirm & Merge (" + totalChanges + ")"));
      } else {
        els.previewConfirmBtn.disabled = true;
        els.previewConfirmBtn.style.opacity = "0.55";
        els.previewConfirmBtn.style.cursor = "not-allowed";
        els.previewConfirmBtn.appendChild(document.createTextNode("No Changes to Merge"));
      }
    }

    // Render Updated Courses first (higher impact)
    diff.toUpdate.forEach(item => {
      const card = document.createElement("div");
      card.className = "diff-card is-update";

      const header = document.createElement("div");
      header.className = "diff-card-header";

      const codeEl = document.createElement("span");
      codeEl.className = "diff-card-code";
      codeEl.textContent = item.code;

      const badge = document.createElement("span");
      badge.className = "diff-badge badge-update";
      badge.textContent = "~ UPDATE";

      header.appendChild(codeEl);
      header.appendChild(badge);
      card.appendChild(header);

      const table = document.createElement("table");
      table.className = "diff-table";

      item.changes.forEach(ch => {
        const tr = document.createElement("tr");

        const tdField = document.createElement("td");
        tdField.className = "diff-field-name";
        tdField.textContent = ch.field;

        const tdVal = document.createElement("td");
        const valWrapper = document.createElement("div");
        valWrapper.className = "diff-values-col";

        const oldSpan = document.createElement("span");
        oldSpan.className = "diff-old-val";
        oldSpan.textContent = ch.oldVal;

        const arrow = document.createElement("span");
        arrow.className = "diff-arrow-icon";
        arrow.textContent = "\u2192";

        const newSpan = document.createElement("span");
        newSpan.className = "diff-new-val";
        newSpan.textContent = ch.newVal;

        valWrapper.appendChild(oldSpan);
        valWrapper.appendChild(arrow);
        valWrapper.appendChild(newSpan);
        tdVal.appendChild(valWrapper);

        tr.appendChild(tdField);
        tr.appendChild(tdVal);
        table.appendChild(tr);
      });

      card.appendChild(table);
      els.previewDiffList.appendChild(card);
    });

    // Render New Courses
    diff.toAdd.forEach(item => {
      const card = document.createElement("div");
      card.className = "diff-card is-new";

      const header = document.createElement("div");
      header.className = "diff-card-header";

      const codeEl = document.createElement("span");
      codeEl.className = "diff-card-code";
      codeEl.textContent = item.code;

      const badge = document.createElement("span");
      badge.className = "diff-badge badge-new";
      badge.textContent = "+ NEW";

      header.appendChild(codeEl);
      header.appendChild(badge);
      card.appendChild(header);

      const titleEl = document.createElement("div");
      titleEl.className = "diff-new-title";
      titleEl.textContent = item.incoming.name || item.code;
      card.appendChild(titleEl);

      const chipsRow = document.createElement("div");
      chipsRow.className = "diff-chips-row";

      const examDay = item.incoming.examDay;
      const examSlot = item.incoming.examSlot;
      if (examDay || examSlot) {
        const examChip = document.createElement("span");
        examChip.className = "diff-meta-chip";
        examChip.textContent = "Exam: " + [examDay, examSlot].filter(Boolean).join(" \u2022 ");
        chipsRow.appendChild(examChip);
      }

      if (item.incoming.prerequisites && item.incoming.prerequisites.length > 0) {
        const prereqChip = document.createElement("span");
        prereqChip.className = "diff-meta-chip";
        prereqChip.textContent = "Prereq: " + item.incoming.prerequisites.join(", ");
        chipsRow.appendChild(prereqChip);
      }

      if (item.incoming.prerequisiteNote) {
        const noteChip = document.createElement("span");
        noteChip.className = "diff-meta-chip note";
        noteChip.textContent = "Note: " + item.incoming.prerequisiteNote;
        chipsRow.appendChild(noteChip);
      }

      if (!chipsRow.hasChildNodes()) {
        const titleOnlyChip = document.createElement("span");
        titleOnlyChip.className = "diff-meta-chip";
        titleOnlyChip.textContent = "Title only";
        chipsRow.appendChild(titleOnlyChip);
      }

      card.appendChild(chipsRow);
      els.previewDiffList.appendChild(card);
    });

    if (totalChanges === 0) {
      const emptyBox = document.createElement("div");
      emptyBox.className = "preview-empty-state";

      const checkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      checkSvg.setAttribute("viewBox", "0 0 24 24");
      checkSvg.setAttribute("style", "width:26px; height:26px; fill:#10b981;");
      const checkPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      checkPath.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z");
      checkSvg.appendChild(checkPath);

      const emptyTitle = document.createElement("div");
      emptyTitle.className = "preview-empty-title";
      emptyTitle.textContent = "All Courses Up to Date";

      const emptySub = document.createElement("div");
      emptySub.className = "preview-empty-sub";
      emptySub.textContent = "All " + diff.unchanged.length + " courses in this file already match your database identically.";

      emptyBox.appendChild(checkSvg);
      emptyBox.appendChild(emptyTitle);
      emptyBox.appendChild(emptySub);
      els.previewDiffList.appendChild(emptyBox);
    }
  }

  function openImportPreviewModal(diff) {
    pendingImportDiff = diff;
    renderImportPreview(diff);
    openModalSafely(els.importPreviewModal, els.previewConfirmBtn);
  }

  function closeImportPreviewModal() {
    closeModalSafely(els.importPreviewModal);
  }

  async function executeCommitImportDiff(diff) {
    if (!diff) return;

    let addedCount = 0;
    let updatedCount = 0;
    let nameOnlyCount = 0;

    for (const item of diff.toAdd) {
      const key = item.code;
      const val = item.isNameOnly && typeof item.incoming === "object" && !item.incoming.examDay && !item.incoming.examSlot && item.incoming.prerequisites.length === 0 && !item.incoming.prerequisiteNote
        ? item.incoming.name
        : item.incoming;

      if (softDeletedCourses.includes(key)) {
        softDeletedCourses = softDeletedCourses.filter(c => c !== key);
      }
      if (hardDeletedCourses.includes(key)) {
        hardDeletedCourses = hardDeletedCourses.filter(c => c !== key);
      }
      courses[key] = val;
      userCourses[key] = val;
      addedCount++;
      if (item.isNameOnly) nameOnlyCount++;
    }

    for (const item of diff.toUpdate) {
      const key = item.code;
      const val = item.isNameOnly && typeof item.incoming === "object" && !item.incoming.examDay && !item.incoming.examSlot && item.incoming.prerequisites.length === 0 && !item.incoming.prerequisiteNote
        ? item.incoming.name
        : item.incoming;

      if (softDeletedCourses.includes(key)) {
        softDeletedCourses = softDeletedCourses.filter(c => c !== key);
      }
      if (hardDeletedCourses.includes(key)) {
        hardDeletedCourses = hardDeletedCourses.filter(c => c !== key);
      }
      courses[key] = val;
      userCourses[key] = val;
      updatedCount++;
      if (item.isNameOnly) nameOnlyCount++;
    }

    await chrome.storage.local.set({ courses, userCourses, softDeletedCourses, hardDeletedCourses });
    updateCourseCount();
    renderCourseList(searchQuery);
    if (els.jsonInput) els.jsonInput.value = "";
    updateJsonBadge();
    clearDropZoneFileInfo();
    closeImportPreviewModal();

    const totalMerged = addedCount + updatedCount;
    let summaryText = "";
    if (addedCount > 0 && updatedCount > 0) {
      summaryText = `Added ${addedCount} new, updated ${updatedCount} existing course${totalMerged !== 1 ? 's' : ''}.`;
    } else if (addedCount > 0) {
      summaryText = `Successfully imported ${addedCount} new course${addedCount !== 1 ? 's' : ''}.`;
    } else if (updatedCount > 0) {
      summaryText = `Successfully updated ${updatedCount} course${updatedCount !== 1 ? 's' : ''}.`;
    }

    if (diff.errors.length > 0) {
      summaryText += ` Skipped ${diff.errors.length} invalid entr${diff.errors.length === 1 ? 'y' : 'ies'}.`;
    }
    if (nameOnlyCount > 0) {
      summaryText += ` (${nameOnlyCount} saved as title-only).`;
    }

    showImportMsg("success", summaryText);
    showToast(`Merged ${totalMerged} course${totalMerged !== 1 ? 's' : ''}`, "success");
  }

  function triggerDropZoneError(msg) {
    if (els.fileDropZone) {
      els.fileDropZone.classList.add("has-error");
      setTimeout(() => {
        els.fileDropZone?.classList.remove("has-error");
      }, 3000);
    }
    showImportMsg("error", msg);
  }

  function showDropZoneFileInfo(fileName, fileSize, courseCount, parseError) {
    if (!els.dropZoneFileInfo) return;
    els.dropZoneFileInfo.textContent = "";

    if (els.dropZoneIdle) {
      els.dropZoneIdle.style.display = "none";
    }
    if (els.fileDropZone) {
      els.fileDropZone.classList.add("has-file");
      els.fileDropZone.classList.remove("has-error");
    }

    const card = document.createElement("div");
    card.className = "drop-file-card";

    // Main top row: Badge + Metadata + Close Button
    const mainRow = document.createElement("div");
    mainRow.className = "drop-file-main";

    // File type badge (JSON with icon)
    const badge = document.createElement("div");
    badge.className = "drop-file-badge";

    const docSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    docSvg.setAttribute("viewBox", "0 0 24 24");
    docSvg.setAttribute("class", "drop-file-badge-icon");
    const docPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    docPath.setAttribute("d", "M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z");
    docSvg.appendChild(docPath);
    badge.appendChild(docSvg);

    const tag = document.createElement("span");
    tag.className = "drop-file-badge-tag";
    tag.textContent = "JSON";
    badge.appendChild(tag);
    mainRow.appendChild(badge);

    // File metadata (Name + Size + Status Pill)
    const meta = document.createElement("div");
    meta.className = "drop-file-meta";

    const nameSpan = document.createElement("span");
    nameSpan.className = "drop-zone-file-name";
    nameSpan.textContent = fileName;
    nameSpan.title = fileName;
    meta.appendChild(nameSpan);

    const stats = document.createElement("div");
    stats.className = "drop-file-stats";

    const sizeSpan = document.createElement("span");
    sizeSpan.className = "drop-zone-file-size";
    const kb = (fileSize / 1024).toFixed(1);
    sizeSpan.textContent = kb + " KB";
    stats.appendChild(sizeSpan);

    const dot = document.createElement("span");
    dot.className = "drop-file-dot";
    dot.textContent = "\u2022";
    stats.appendChild(dot);

    const statusPill = document.createElement("span");
    if (parseError) {
      statusPill.className = "drop-status-pill danger";
      const errSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      errSvg.setAttribute("viewBox", "0 0 24 24");
      errSvg.setAttribute("style", "width:10px;height:10px;fill:currentColor;");
      const errPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      errPath.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z");
      errSvg.appendChild(errPath);
      statusPill.appendChild(errSvg);
      statusPill.appendChild(document.createTextNode("Syntax error"));
    } else if (courseCount !== undefined && courseCount > 0) {
      statusPill.className = "drop-status-pill success";
      const checkSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      checkSvg.setAttribute("viewBox", "0 0 24 24");
      checkSvg.setAttribute("style", "width:10px;height:10px;fill:currentColor;");
      const checkPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      checkPath.setAttribute("d", "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z");
      checkSvg.appendChild(checkPath);
      statusPill.appendChild(checkSvg);
      statusPill.appendChild(document.createTextNode(courseCount + " courses ready"));
    } else {
      statusPill.className = "drop-status-pill neutral";
      statusPill.textContent = "Ready";
    }
    stats.appendChild(statusPill);
    meta.appendChild(stats);
    mainRow.appendChild(meta);

    // Remove button on top-right
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "drop-zone-file-remove";
    removeBtn.title = "Remove loaded file";
    removeBtn.setAttribute("aria-label", "Remove loaded file");

    const removeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    removeSvg.setAttribute("viewBox", "0 0 24 24");
    removeSvg.setAttribute("style", "width:13px;height:13px;fill:currentColor;");
    const removePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    removePath.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
    removeSvg.appendChild(removePath);
    removeBtn.appendChild(removeSvg);

    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      clearDropZoneFileInfo();
      if (els.jsonInput) {
        els.jsonInput.value = "";
        updateJsonBadge();
        showImportMsg("info", "File unloaded.");
      }
    });
    mainRow.appendChild(removeBtn);

    card.appendChild(mainRow);

    // Action row: Dedicated Preview Changes Button (when diff exists)
    if (!parseError && pendingImportDiff && (pendingImportDiff.toAdd.length > 0 || pendingImportDiff.toUpdate.length > 0)) {
      const previewBtn = document.createElement("button");
      previewBtn.type = "button";
      previewBtn.className = "btn-card-preview";
      previewBtn.title = "Preview changes before committing";

      const eyeSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      eyeSvg.setAttribute("viewBox", "0 0 24 24");
      const eyePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      eyePath.setAttribute("d", "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z");
      eyeSvg.appendChild(eyePath);

      const totalChanges = pendingImportDiff.toAdd.length + pendingImportDiff.toUpdate.length;
      const previewTxt = document.createElement("span");
      previewTxt.textContent = "Preview Changes (" + totalChanges + " to import)";

      previewBtn.appendChild(eyeSvg);
      previewBtn.appendChild(previewTxt);
      previewBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!pendingImportDiff && els.jsonInput?.value) {
          try {
            const parsed = JSON.parse(els.jsonInput.value);
            pendingImportDiff = computeImportDiff(parsed, courses);
          } catch (err) {}
        }
        if (pendingImportDiff) {
          openImportPreviewModal(pendingImportDiff);
        }
      });
      card.appendChild(previewBtn);
    }

    els.dropZoneFileInfo.appendChild(card);
    els.dropZoneFileInfo.style.display = "flex";
  }

  function clearDropZoneFileInfo() {
    if (!els.dropZoneFileInfo) return;
    els.dropZoneFileInfo.textContent = "";
    els.dropZoneFileInfo.style.display = "none";
    if (els.dropZoneIdle) {
      els.dropZoneIdle.style.display = "flex";
    }
    if (els.fileDropZone) {
      els.fileDropZone.classList.remove("has-file");
      els.fileDropZone.classList.remove("has-error");
    }
    if (els.jsonFileInput) els.jsonFileInput.value = "";
    pendingImportDiff = null;
  }

  function processLoadedJsonFile(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".json") && file.type !== "application/json") {
      triggerDropZoneError("Invalid file \"" + file.name + "\". Only .json files are supported.");
      return;
    }
    const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
    if (file.size > MAX_IMPORT_BYTES) {
      triggerDropZoneError("File exceeds 2 MB limit. Please select a smaller file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (els.jsonInput) {
        els.jsonInput.value = content;
        updateJsonBadge();

        let courseCount = 0;
        let parseError = false;
        try {
          const parsed = JSON.parse(content);
          if (typeof parsed === "object" && !Array.isArray(parsed) && parsed !== null) {
            courseCount = Object.keys(parsed).length;
            pendingImportDiff = computeImportDiff(parsed, courses);
            showDropZoneFileInfo(file.name, file.size, courseCount, false);
            showImportMsg("info", "Loaded \"" + file.name + "\" (" + (file.size / 1024).toFixed(1) + " KB, " + courseCount + " courses).");

            // Stress the modal: bring it up smoothly so user can immediately verify before committing!
            openImportPreviewModal(pendingImportDiff);
          } else {
            parseError = true;
            showDropZoneFileInfo(file.name, file.size, 0, true);
            showImportMsg("error", "JSON file must contain an object map of courses.");
          }
        } catch (err) {
          parseError = true;
          showDropZoneFileInfo(file.name, file.size, 0, true);
          showImportMsg("error", "JSON syntax error in \"" + file.name + "\": " + err.message);
        }
      }
    };
    reader.onerror = () => {
      triggerDropZoneError("Could not read \"" + file.name + "\".");
    };
    reader.readAsText(file);
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

        const contribTip = document.createElement("div");
        contribTip.className = "empty-contrib-tip";
        contribTip.style.cssText = "margin-top: 8px; font-size: 0.65rem; color: var(--text-muted);";
        const contribLink = document.createElement("a");
        contribLink.href = "#";
        contribLink.textContent = "Contribute to the catalog \u2192";
        contribLink.style.cssText = "color: var(--accent); font-weight: 600; margin-left: 4px; cursor: pointer; text-decoration: none;";
        contribLink.addEventListener("click", (e) => {
          e.preventDefault();
          openContributionModal();
        });
        contribTip.appendChild(document.createTextNode("Missing a course?"));
        contribTip.appendChild(contribLink);
        emptyState.appendChild(contribTip);
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
      restoreBtn.appendChild(createIcon('restore'));
      restoreBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        pendingAction = "restore";
        pendingTarget = code;
        setModalText(`Restore ${code} to catalog?`, "This course will be returned to your active course database and decoder immediately.");
        els.confirmModal.classList.add("show");
      });

      const permDelBtn = document.createElement("button");
      permDelBtn.type = "button";
      permDelBtn.className = "btn-trash-action-item delete";
      permDelBtn.title = `Permanently delete ${code}`;
      permDelBtn.appendChild(createIcon('delete'));
      permDelBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        pendingAction = "perm-delete";
        pendingTarget = code;
        setModalText(`Permanently delete ${code}?`, "This course will be permanently removed from storage and cannot be restored.");
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

        if (currentFilter === "enrolled") {
          if (enrolledCourses.indexOf(code) === -1) return false;
        } else if (currentFilter !== "all" && currentFilter !== origin) {
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
        if (currentFilter === "enrolled") filterCategory = " in My Courses";
        else if (currentFilter === "user") filterCategory = " in User Added";
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
        if (currentFilter === "enrolled") {
          emptyIcon.textContent = "★";
          titleEl.textContent = "No Enrolled Courses";
          subEl.textContent = "You haven't pinned any courses for this trimester yet. Click the star icon on any course to add it to My Courses.";
        } else if (currentFilter === "user") {
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

      // Check for clashing status
      var activeClashes = detectExamClashes(enrolledCourses, courses);
      for (var ci = 0; ci < activeClashes.length; ci++) {
        if (activeClashes[ci].courses.indexOf(code) !== -1 && enrolledCourses.indexOf(code) !== -1) {
          row.classList.add("is-clashing");
          break;
        }
      }

      const arrowEl = document.createElement("div");
      arrowEl.className = "course-row-arrow";
      const arrowSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      arrowSvg.setAttribute("viewBox", "0 0 24 24");
      const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      arrowPath.setAttribute("d", "M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z");
      arrowSvg.appendChild(arrowPath);
      arrowEl.appendChild(arrowSvg);

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
  let showPrereqNames = false; // Task 2.4 Enhancement: Code/Name toggle preference

  // ── Task 3.3: Exam Week Calendar Export (.ics) Helpers ────────────────────

  /**
   * Escapes special characters for RFC 5545 iCalendar text values.
   * @param {string} str
   * @returns {string}
   */
  function escapeIcsText(str) {
    if (!str) return "";
    return String(str)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\r?\n/g, "\\n");
  }

  /**
   * Formats a Date object and time string ("HH:MM:SS") into an ICS timestamp (YYYYMMDDTHHMMSS).
   * @param {Date} date
   * @param {string} timeStr - "09:00:00"
   * @returns {string}
   */
  function formatIcsDateTime(date, timeStr) {
    var parts = timeStr.split(":");
    var d = new Date(date.getTime());
    d.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2] || "0", 10), 0);
    var pad = function(n) { return n < 10 ? "0" + n : String(n); };
    return d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) + "T" +
      pad(d.getHours()) +
      pad(d.getMinutes()) + "00";
  }

  /**
   * Generates a standard RFC 5545 iCalendar (.ics) string for scheduled exams.
   * @param {Array<[string, Object]>} courseEntries - Array of [code, courseData]
   * @param {string} startDateStr - YYYY-MM-DD string for Day 1
   * @param {boolean} includeReminders
   * @returns {string}
   */
  function generateIcsCalendar(courseEntries, startDateStr, includeReminders) {
    if (includeReminders === undefined) includeReminders = true;
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//UIU Course Code Decoder//Exam Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:UIU Final Exam Schedule",
      "X-WR-TIMEZONE:Asia/Dhaka"
    ];

    var now = new Date();
    var pad = function(n) { return n < 10 ? "0" + n : String(n); };
    var nowStr = now.getUTCFullYear() +
      pad(now.getUTCMonth() + 1) +
      pad(now.getUTCDate()) + "T" +
      pad(now.getUTCHours()) +
      pad(now.getUTCMinutes()) +
      pad(now.getUTCSeconds()) + "Z";

    var baseDateParts = (startDateStr || "").split("-");
    var baseDate = baseDateParts.length === 3
      ? new Date(parseInt(baseDateParts[0], 10), parseInt(baseDateParts[1], 10) - 1, parseInt(baseDateParts[2], 10))
      : new Date();

    for (var i = 0; i < courseEntries.length; i++) {
      var code = courseEntries[i][0];
      var val = courseEntries[i][1];
      var data = normalizeCourseData(val);
      var day = (data.examDay || "").trim();
      var slot = (data.examSlot || "").trim();

      if (!day || !slot) continue;
      var lowerDay = day.toLowerCase();
      if (lowerDay === "n/a" || lowerDay === "none" || lowerDay === "in-class") continue;

      // Extract day index (Day 1 -> 0, Day 2 -> 1, ...)
      var dayMatch = day.match(/\d+/);
      var dayOffset = dayMatch ? (parseInt(dayMatch[0], 10) - 1) : 0;
      var eventDate = new Date(baseDate.getTime() + dayOffset * 86400000);

      // Map slot to hours
      var startTime = "09:00:00";
      var endTime = "11:00:00";
      var slotUpper = slot.toUpperCase();
      if (slotUpper.indexOf("T1") !== -1 || slotUpper.indexOf("SLOT 1") !== -1 || slotUpper === "1") {
        startTime = "09:00:00";
        endTime = "11:00:00";
      } else if (slotUpper.indexOf("T2") !== -1 || slotUpper.indexOf("SLOT 2") !== -1 || slotUpper === "2") {
        startTime = "11:30:00";
        endTime = "13:30:00";
      } else if (slotUpper.indexOf("T3") !== -1 || slotUpper.indexOf("SLOT 3") !== -1 || slotUpper === "3") {
        startTime = "14:30:00";
        endTime = "16:30:00";
      }

      var dtStart = formatIcsDateTime(eventDate, startTime);
      var dtEnd = formatIcsDateTime(eventDate, endTime);
      var uid = "uiu-exam-" + code.replace(/\s+/g, "_") + "-" + dtStart + "@uiu-decoder";

      var title = code + " Final Exam (" + (data.name || "Course") + ")";
      var desc = "Course: " + code + " - " + (data.name || "") + "\n" +
        "Exam Routine: " + day + ", Slot " + slot +
        (data.credits ? "\nCredits: " + data.credits + " Cr" : "") + "\n" +
        "United International University";
      var location = "United International University (UIU), United City, Madani Avenue, Dhaka 1212";

      lines.push("BEGIN:VEVENT");
      lines.push("UID:" + uid);
      lines.push("DTSTAMP:" + nowStr);
      lines.push("DTSTART:" + dtStart);
      lines.push("DTEND:" + dtEnd);
      lines.push("SUMMARY:" + escapeIcsText(title));
      lines.push("DESCRIPTION:" + escapeIcsText(desc));
      lines.push("LOCATION:" + escapeIcsText(location));
      lines.push("STATUS:CONFIRMED");

      if (includeReminders) {
        lines.push("BEGIN:VALARM");
        lines.push("TRIGGER:-PT24H");
        lines.push("ACTION:DISPLAY");
        lines.push("DESCRIPTION:Reminder: " + escapeIcsText(title) + " tomorrow");
        lines.push("END:VALARM");

        lines.push("BEGIN:VALARM");
        lines.push("TRIGGER:-PT2H");
        lines.push("ACTION:DISPLAY");
        lines.push("DESCRIPTION:Reminder: " + escapeIcsText(title) + " in 2 hours");
        lines.push("END:VALARM");
      }

      lines.push("END:VEVENT");
    }

    lines.push("END:VCALENDAR");
    return lines.join("\r\n");
  }

  /**
   * Triggers a browser download of the generated .ics file.
   * @param {string} filename
   * @param {string} content
   */
  function downloadIcsBlob(filename, content) {
    try {
      var url;
      try {
        var blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
        url = URL.createObjectURL(blob);
      } catch (_) {
        url = "data:text/calendar;charset=utf-8," + encodeURIComponent(content);
      }
      var a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        if (a.parentNode) {
          a.parentNode.removeChild(a);
        }
        if (url && typeof url === "string" && url.startsWith("blob:")) {
          try { URL.revokeObjectURL(url); } catch (_) {}
        }
      }, 2000);
    } catch (e) {
      console.error("Failed to download .ics", e);
    }
  }

  /**
   * Retrieves scheduled courses for calendar export.
   * Prefers enrolled courses if any; falls back to current filter list.
   * @returns {Array<[string, Object]>}
   */
  function getCoursesForCalendar() {
    var targets = [];
    if (enrolledCourses.length > 0) {
      for (var i = 0; i < enrolledCourses.length; i++) {
        var c = enrolledCourses[i];
        if (courses[c]) targets.push([c, courses[c]]);
      }
    } else {
      for (var k in courses) {
        if (courses.hasOwnProperty(k)) {
          var data = normalizeCourseData(courses[k]);
          if (data.examDay && data.examSlot) {
            targets.push([k, courses[k]]);
          }
        }
      }
    }
    return targets;
  }

  /**
   * Renders the preview of courses that will be exported in the modal.
   */
  function renderIcsPreview() {
    if (!els.icsPreviewList) return;
    while (els.icsPreviewList.firstChild) {
      els.icsPreviewList.removeChild(els.icsPreviewList.firstChild);
    }

    var entries = getCoursesForCalendar();
    var scheduled = [];
    for (var i = 0; i < entries.length; i++) {
      var d = normalizeCourseData(entries[i][1]);
      if (d.examDay && d.examSlot && d.examDay.toLowerCase() !== "n/a") {
        scheduled.push({ code: entries[i][0], data: d });
      }
    }

    if (els.icsEventCount) els.icsEventCount.textContent = String(scheduled.length);

    if (scheduled.length === 0) {
      var emptyEl = document.createElement("div");
      emptyEl.className = "ics-event-item";
      emptyEl.style.color = "var(--text-muted)";
      emptyEl.textContent = "No scheduled exams found in selected courses.";
      els.icsPreviewList.appendChild(emptyEl);
      if (els.downloadIcsBtn) els.downloadIcsBtn.disabled = true;
      return;
    }

    if (els.downloadIcsBtn) els.downloadIcsBtn.disabled = false;

    scheduled.forEach(function(item) {
      var row = document.createElement("div");
      row.className = "ics-event-item";

      var codeSpan = document.createElement("span");
      codeSpan.className = "ics-event-code";
      codeSpan.textContent = item.code;

      var daySpan = document.createElement("span");
      daySpan.className = "ics-event-day";
      daySpan.textContent = item.data.examDay;

      var slotSpan = document.createElement("span");
      slotSpan.className = "ics-event-time";
      slotSpan.textContent = "Slot " + item.data.examSlot;

      row.appendChild(codeSpan);
      row.appendChild(daySpan);
      row.appendChild(slotSpan);
      els.icsPreviewList.appendChild(row);
    });
  }

  function openExamCalendarModal() {
    if (!els.examExportModal) return;

    // Set default start date to today (or upcoming Saturday)
    if (els.icsStartDateInput && !els.icsStartDateInput.value) {
      var today = new Date();
      var pad = function(n) { return n < 10 ? "0" + n : String(n); };
      els.icsStartDateInput.value = today.getFullYear() + "-" + pad(today.getMonth() + 1) + "-" + pad(today.getDate());
    }

    renderIcsPreview();
    openModalSafely(els.examExportModal, els.icsStartDateInput);
  }

  function closeExamCalendarModal() {
    closeModalSafely(els.examExportModal);
  }

  // ── End Task 3.3 Helpers ──────────────────────────────────────────────────

    // ── Task 3.2: "My Courses" & Exam Routine Clash Detector Helpers ─────────

  /**
   * Detects final exam routine collisions across enrolled courses.
   * A clash occurs when two or more courses share the exact same non-empty Day & Slot.
   * Lab / In-Class / N/A schedules are ignored.
   * @param {string[]} enrolledList - Array of course codes
   * @param {Object} catalog - Merged courses catalog
   * @returns {Array<{ day: string, slot: string, courses: string[] }>}
   */
  /**
   * Detects same-day exam routine occurrences across enrolled courses.
   * A same-day collision occurs when two or more courses share the exact same non-empty Day,
   * regardless of whether they are in the same or different slots.
   * Lab / In-Class / N/A schedules are ignored.
   * @param {string[]} enrolledList - Array of course codes
   * @param {Object} catalog - Merged courses catalog
   * @returns {Array<{ day: string, count: number, courses: Array<{ code: string, slot: string, name: string }> }>}
   */
  function detectSameDayExams(enrolledList, catalog) {
    var dayMap = {};
    var sameDays = [];

    for (var i = 0; i < enrolledList.length; i++) {
      var code = enrolledList[i];
      var data = normalizeCourseData(catalog[code]);
      var day = (data.examDay || "").trim();
      var slot = (data.examSlot || "").trim();

      if (!day) continue;
      var lowerDay = day.toLowerCase();
      if (lowerDay === "n/a" || lowerDay === "none" || lowerDay === "in-class") continue;

      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push({
        code: code,
        slot: slot || "TBA",
        name: data.name || ""
      });
    }

    for (var d in dayMap) {
      if (dayMap.hasOwnProperty(d) && dayMap[d].length > 1) {
        sameDays.push({
          day: d,
          count: dayMap[d].length,
          courses: dayMap[d]
        });
      }
    }
    return sameDays;
  }

  function detectExamClashes(enrolledList, catalog) {
    var slotMap = {};
    var clashes = [];

    for (var i = 0; i < enrolledList.length; i++) {
      var code = enrolledList[i];
      var data = normalizeCourseData(catalog[code]);
      var day = (data.examDay || "").trim();
      var slot = (data.examSlot || "").trim();

      if (!day || !slot) continue;
      var lowerDay = day.toLowerCase();
      var lowerSlot = slot.toLowerCase();
      if (lowerDay === "n/a" || lowerDay === "none" || lowerDay === "in-class") continue;
      if (lowerSlot === "n/a" || lowerSlot === "none") continue;

      var key = day + "|" + slot;
      if (!slotMap[key]) slotMap[key] = [];
      slotMap[key].push(code);
    }

    for (var k in slotMap) {
      if (slotMap.hasOwnProperty(k) && slotMap[k].length > 1) {
        var parts = k.split("|");
        clashes.push({
          day: parts[0],
          slot: parts[1],
          courses: slotMap[k]
        });
      }
    }
    return clashes;
  }

  /**
   * Calculates total credits enrolled in the trimester.
   * @param {string[]} enrolledList
   * @param {Object} catalog
   * @returns {number}
   */
  function computeEnrolledCredits(enrolledList, catalog) {
    var total = 0;
    for (var i = 0; i < enrolledList.length; i++) {
      var code = enrolledList[i];
      var data = normalizeCourseData(catalog[code]);
      if (typeof data.credits === "number" && !isNaN(data.credits)) {
        total += data.credits;
      }
    }
    return total;
  }

  /**
   * Synchronizes all "My Courses" UI elements across View 0 (Home),
   * View 1 (Course List), and View 3 (Course Details).
   */
  function updateEnrolledUI() {
    var totalEnrolled = enrolledCourses.length;
    var totalCredits = computeEnrolledCredits(enrolledCourses, courses);
    var clashes = detectExamClashes(enrolledCourses, courses);
    var hasClashes = clashes.length > 0;
    var sameDayExams = detectSameDayExams(enrolledCourses, courses);
    var hasSameDay = sameDayExams.length > 0;

    // 1. View 0 (Home) Button
    if (els.homeEnrolledCard) {
      if (els.homeEnrolledCount) els.homeEnrolledCount.textContent = String(totalEnrolled);
      if (els.homeEnrolledCredits) els.homeEnrolledCredits.textContent = totalCredits.toFixed(1) + " Cr";
      if (els.homeEnrolledStatusHint) {
        if (totalEnrolled === 0) {
          els.homeEnrolledStatusHint.textContent = "Plan exam routine";
        } else {
          els.homeEnrolledStatusHint.textContent = totalEnrolled === 1 ? "1 course enrolled" : (totalEnrolled + " courses enrolled");
        }
      }
      if (els.homeClashBadge) {
        if (totalEnrolled === 0) {
          els.homeClashBadge.style.display = "none";
          els.homeClashBadge.className = "clash-badge ok";
        } else if (hasClashes) {
          els.homeClashBadge.style.display = "flex";
          els.homeClashBadge.className = "clash-badge danger";
          els.homeClashBadge.textContent = "\u26A0\uFE0F " + clashes.length + " Exam Clash" + (clashes.length > 1 ? "es" : "") + " (Same slot)";
        } else if (hasSameDay) {
          els.homeClashBadge.style.display = "flex";
          els.homeClashBadge.className = "clash-badge warning";
          var daysCount = sameDayExams.length;
          els.homeClashBadge.textContent = "\u26A0\uFE0F " + (daysCount === 1 ? (sameDayExams[0].count + " Exams on Same Day (Check routine)") : (daysCount + " Days with Multiple Exams"));
        } else {
          els.homeClashBadge.style.display = "none";
          els.homeClashBadge.className = "clash-badge ok";
        }
      }
    }

    // 2. Dedicated My Courses View Header & Summary
    if (els.myCoursesHeaderSubtitle) {
      els.myCoursesHeaderSubtitle.textContent = totalEnrolled + " enrolled • " + totalCredits.toFixed(1) + " credits";
    }
    if (els.enrolledTotalCourses) els.enrolledTotalCourses.textContent = String(totalEnrolled);
    if (els.enrolledTotalCredits) els.enrolledTotalCredits.textContent = totalCredits.toFixed(1);
    if (els.clearEnrolledBtn) els.clearEnrolledBtn.style.display = totalEnrolled > 0 ? "inline-flex" : "none";

    // 3. Clash & Same-Day Alert Box in My Courses (Sleek Executive Redesign)
    if (els.clashAlertBox) {
      var shouldShowAlertBox = totalEnrolled > 0 && (hasClashes || hasSameDay);
      if (shouldShowAlertBox) {
        els.clashAlertBox.style.display = "flex";

        var iconWrap = document.getElementById("clashAlertIconWrap");
        if (iconWrap) {
          while (iconWrap.firstChild) iconWrap.removeChild(iconWrap.firstChild);
          var headSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          headSvg.setAttribute("viewBox", "0 0 24 24");
          var headPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          if (hasClashes) {
            headPath.setAttribute("d", "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z");
          } else {
            headPath.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z");
          }
          headSvg.appendChild(headPath);
          iconWrap.appendChild(headSvg);
        }

        if (hasClashes) {
          els.clashAlertBox.className = "clash-alert-box has-clash";
          if (els.clashAlertTitle) {
            els.clashAlertTitle.textContent = hasSameDay ? "Exam Routine Conflicts & Same-Day Warnings" : "Exam Schedule Conflict Detected";
          }
        } else {
          els.clashAlertBox.className = "clash-alert-box is-warning";
          if (els.clashAlertTitle) {
            els.clashAlertTitle.textContent = "Same-Day Final Exams Scheduled";
          }
        }

        if (els.clashAlertSubtitle) {
          els.clashAlertSubtitle.textContent = "";
        }

        if (els.clashAlertList) {
          while (els.clashAlertList.firstChild) els.clashAlertList.removeChild(els.clashAlertList.firstChild);

          // Direct slot collisions (Critical)
          clashes.forEach(function(c) {
            var item = document.createElement("div");
            item.className = "clash-item danger";

            var bullet = document.createElement("span");
            bullet.className = "clash-item-bullet";
            bullet.textContent = "•";

            var itemText = document.createElement("span");
            itemText.className = "clash-item-text";

            var dayLabel = document.createElement("strong");
            dayLabel.textContent = c.day + " (Slot " + c.slot + "): ";
            itemText.appendChild(dayLabel);

            var coursesSpan = document.createElement("span");
            coursesSpan.textContent = c.courses.join(" & ") + " — Direct Slot Clash";
            itemText.appendChild(coursesSpan);

            item.appendChild(bullet);
            item.appendChild(itemText);
            els.clashAlertList.appendChild(item);
          });

          // Same-day multiple exams (Warning)
          sameDayExams.forEach(function(sd) {
            var hasDistinctSlots = false;
            for (var a = 0; a < sd.courses.length; a++) {
              for (var b = a + 1; b < sd.courses.length; b++) {
                if (sd.courses[a].slot !== sd.courses[b].slot) {
                  hasDistinctSlots = true;
                  break;
                }
              }
              if (hasDistinctSlots) break;
            }

            if (hasDistinctSlots || clashes.length === 0) {
              var courseSummaries = sd.courses.map(function(c) {
                return c.code + " (" + (c.slot || "TBA") + ")";
              });
              var item = document.createElement("div");
              item.className = "clash-item warning";

              var bullet = document.createElement("span");
              bullet.className = "clash-item-bullet";
              bullet.textContent = "•";

              var itemText = document.createElement("span");
              itemText.className = "clash-item-text";

              var dayLabel = document.createElement("strong");
              dayLabel.textContent = sd.day + " (" + sd.count + " exams): ";
              itemText.appendChild(dayLabel);

              var coursesSpan = document.createElement("span");
              coursesSpan.textContent = courseSummaries.join(" & ");
              itemText.appendChild(coursesSpan);

              item.appendChild(bullet);
              item.appendChild(itemText);
              els.clashAlertList.appendChild(item);
            }
          });
        }
      } else {
        els.clashAlertBox.style.display = "none";
      }
    }

    // 4. Enrolled Cards List vs Empty State
    if (els.myCoursesEmptyState && els.myCoursesList && els.enrolledSummaryCard) {
      if (totalEnrolled === 0) {
        els.myCoursesEmptyState.style.display = "flex";
        els.myCoursesList.style.display = "none";
        els.enrolledSummaryCard.style.display = "none";
      } else {
        els.myCoursesEmptyState.style.display = "none";
        els.myCoursesList.style.display = "flex";
        els.enrolledSummaryCard.style.display = "flex";

        while (els.myCoursesList.firstChild) {
          els.myCoursesList.removeChild(els.myCoursesList.firstChild);
        }

        enrolledCourses.forEach(function(code) {
          var cData = courses[code];
          var name = typeof cData === "object" && cData !== null ? (cData.name || "") : (cData || "");
          var credits = typeof cData === "object" && cData !== null && cData.credits ? cData.credits : 3;
          var examDay = typeof cData === "object" && cData !== null && cData.examDay ? cData.examDay : "";
          var examSlot = typeof cData === "object" && cData !== null && cData.examSlot ? cData.examSlot : "";

          // Check for direct slot clash
          var isCourseClashing = false;
          var clashDetailsText = "";
          for (var ci = 0; ci < clashes.length; ci++) {
            if (clashes[ci].courses.indexOf(code) !== -1) {
              isCourseClashing = true;
              var others = clashes[ci].courses.filter(function(c) { return c !== code; });
              clashDetailsText = clashes[ci].day + " " + clashes[ci].slot + " with " + others.join(", ");
              break;
            }
          }

          // Check for same-day exam with another course
          var isCourseSameDay = false;
          var sameDayDetailsText = "";
          for (var sdi = 0; sdi < sameDayExams.length; sdi++) {
            var sde = sameDayExams[sdi];
            var match = sde.courses.find(function(c) { return c.code === code; });
            if (match) {
              var otherSameDayCourses = sde.courses.filter(function(c) { return c.code !== code; });
              if (otherSameDayCourses.length > 0) {
                isCourseSameDay = true;
                sameDayDetailsText = sde.day + " with " + otherSameDayCourses.map(function(o) {
                  return o.code + (o.slot ? " (" + o.slot + ")" : "");
                }).join(", ");
                break;
              }
            }
          }

          var card = document.createElement("div");
          var cardClass = "enrolled-course-card";
          if (isCourseClashing) {
            cardClass += " is-clashing";
          } else if (isCourseSameDay) {
            cardClass += " has-same-day";
          }
          card.className = cardClass;

          // Top Header: Code, Credit badge, and Drop button
          var header = document.createElement("div");
          header.className = "enrolled-card-header";

          var codeRow = document.createElement("div");
          codeRow.className = "enrolled-card-code-row";

          var codeDiv = document.createElement("div");
          codeDiv.className = "enrolled-card-code";
          codeDiv.textContent = code;

          var crChip = document.createElement("span");
          crChip.className = "course-credit-chip";
          crChip.textContent = credits.toFixed(1) + " Cr";

          codeRow.appendChild(codeDiv);
          codeRow.appendChild(crChip);

          var dropBtn = document.createElement("button");
          dropBtn.type = "button";
          dropBtn.className = "btn-card-drop";
          dropBtn.title = "Drop " + code + " from trimester";
          dropBtn.setAttribute("aria-label", "Drop " + code);

          var dropIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          dropIcon.setAttribute("viewBox", "0 0 24 24");
          var dropPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          dropPath.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
          dropIcon.appendChild(dropPath);

          var dropLabel = document.createElement("span");
          dropLabel.textContent = "Drop";

          dropBtn.appendChild(dropIcon);
          dropBtn.appendChild(dropLabel);

          dropBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            toggleEnrollCourse(code);
          });

          header.appendChild(codeRow);
          header.appendChild(dropBtn);

          // Course Name
          var nameDiv = document.createElement("div");
          nameDiv.className = "enrolled-card-name";
          nameDiv.textContent = name;
          nameDiv.title = name;

          // Routine Info Row
          var routineRow = document.createElement("div");
          routineRow.className = "enrolled-card-routine-row";

          var slotChip = document.createElement("span");
          var lowerDay = (examDay || "").trim().toLowerCase();
          if (lowerDay === "in-class") {
            slotChip.className = "routine-slot-badge lab-slot";
            var labText = document.createElement("span");
            labText.textContent = "📝 In-Class Evaluation";
            slotChip.appendChild(labText);
          } else if (examDay || examSlot) {
            slotChip.className = "routine-slot-badge";
            var calIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            calIcon.setAttribute("viewBox", "0 0 24 24");
            var calPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            calPath.setAttribute("d", "M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z");
            calIcon.appendChild(calPath);
            var slotText = document.createElement("span");
            slotText.textContent = "Exam: " + (examDay ? examDay : "") + (examDay && examSlot ? " • " : "") + (examSlot ? examSlot : "");
            slotChip.appendChild(calIcon);
            slotChip.appendChild(slotText);
          } else {
            slotChip.className = "routine-slot-badge pending-slot";
            var pendingText = document.createElement("span");
            pendingText.textContent = "🕒 Routine Pending / TBA";
            slotChip.appendChild(pendingText);
          }
          routineRow.appendChild(slotChip);

          // Direct slot clash banner inside card
          if (isCourseClashing) {
            var clashPill = document.createElement("div");
            clashPill.className = "enrolled-card-clash-banner";
            var warnIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            warnIcon.setAttribute("viewBox", "0 0 24 24");
            var warnPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            warnPath.setAttribute("d", "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z");
            warnIcon.appendChild(warnPath);
            var clashMsg = document.createElement("span");
            clashMsg.textContent = "Direct Clash: " + clashDetailsText;
            clashPill.appendChild(warnIcon);
            clashPill.appendChild(clashMsg);
            routineRow.appendChild(clashPill);
          } else if (isCourseSameDay) {
            // Same-day multiple exams banner
            var sameDayPill = document.createElement("div");
            sameDayPill.className = "enrolled-card-sameday-banner";
            var sameDayIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            sameDayIcon.setAttribute("viewBox", "0 0 24 24");
            var sameDayPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            sameDayPath.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z");
            sameDayIcon.appendChild(sameDayPath);
            var sameDayMsg = document.createElement("span");
            sameDayMsg.textContent = "Same-Day Exam: " + sameDayDetailsText;
            sameDayPill.appendChild(sameDayIcon);
            sameDayPill.appendChild(sameDayMsg);
            routineRow.appendChild(sameDayPill);
          }

          // Make card tap-to-inspect (excluding drop button)
          card.style.cursor = "pointer";
          card.addEventListener("click", function(e) {
            if (e.target.closest(".btn-card-drop")) return;
            openCourseDetails(code, cData, "mycourses");
          });

          // Footer: Inspect action
          var footerRow = document.createElement("div");
          footerRow.className = "enrolled-card-footer";

          var inspectBtn = document.createElement("button");
          inspectBtn.type = "button";
          inspectBtn.className = "btn-card-inspect";
          inspectBtn.textContent = "View Details & Prereqs →";
          inspectBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            openCourseDetails(code, cData, "mycourses");
          });

          footerRow.appendChild(inspectBtn);

          card.appendChild(header);
          card.appendChild(nameDiv);
          card.appendChild(routineRow);
          card.appendChild(footerRow);

          els.myCoursesList.appendChild(card);
        });
      }
    }

    // 5. View 3 Course Details Toggle & Live Clash Warning
    if (currentEditingCode) {
      var isEnrolledInDetails = enrolledCourses.indexOf(currentEditingCode) !== -1;
      if (els.detailsEnrollBtn) {
        els.detailsEnrollBtn.classList.toggle("is-enrolled", isEnrolledInDetails);
        if (els.detailsEnrollBtnText) {
          els.detailsEnrollBtnText.textContent = isEnrolledInDetails ? "Enrolled" : "Enroll";
        }
        els.detailsEnrollBtn.title = isEnrolledInDetails ? "Drop " + currentEditingCode + " from routine" : "Add " + currentEditingCode + " to routine";
      }

      var statusTextEl = document.getElementById("detailEnrollStatusText");
      if (statusTextEl) {
        statusTextEl.textContent = isEnrolledInDetails ? "Enrolled in Routine" : "Not in Trimester Routine";
      }
      var hintEl = document.getElementById("detailEnrollHint");
      if (hintEl) {
        hintEl.textContent = isEnrolledInDetails ? "Tap button to drop from routine" : "Add to track credits and detect exam clashes";
      }
      var indicatorEl = document.getElementById("detailEnrollIndicator");
      if (indicatorEl) {
        indicatorEl.className = "detail-enroll-indicator " + (isEnrolledInDetails ? "active" : "");
      }

      if (els.detailClashWarning) {
        var isInspectedClashing = false;
        var inspectedClashText = "";
        var isInspectedSameDay = false;
        var inspectedSameDayText = "";

        var curData = normalizeCourseData(courses[currentEditingCode]);
        var curDay = (curData.examDay || "").trim();
        var curSlot = (curData.examSlot || "").trim();
        var curDayLower = curDay.toLowerCase();
        var curSlotLower = curSlot.toLowerCase();
        var hasValidExam = curDay && curSlot && curDayLower !== "n/a" && curDayLower !== "none" && curDayLower !== "in-class" && curSlotLower !== "n/a" && curSlotLower !== "none";

        // Check direct clash against other enrolled courses
        for (var ci2 = 0; ci2 < enrolledCourses.length; ci2++) {
          var oCode = enrolledCourses[ci2];
          if (oCode === currentEditingCode) continue;
          var oData = normalizeCourseData(courses[oCode]);
          var oDay = (oData.examDay || "").trim();
          var oSlot = (oData.examSlot || "").trim();
          if (hasValidExam && oDay.toLowerCase() === curDayLower && oSlot.toLowerCase() === curSlotLower) {
            isInspectedClashing = true;
            inspectedClashText = curDay + " " + curSlot + " with " + oCode;
            break;
          }
        }

        // Check same-day exam against other enrolled courses (if no direct clash)
        if (!isInspectedClashing && curDay && curDayLower !== "n/a" && curDayLower !== "none" && curDayLower !== "in-class") {
          var sameDayMatches = [];
          for (var si = 0; si < enrolledCourses.length; si++) {
            var sCode = enrolledCourses[si];
            if (sCode === currentEditingCode) continue;
            var sData = normalizeCourseData(courses[sCode]);
            var sDay = (sData.examDay || "").trim();
            if (sDay && sDay.toLowerCase() === curDayLower) {
              var sSlot = (sData.examSlot || "").trim();
              sameDayMatches.push(sCode + (sSlot ? " (" + sSlot + ")" : ""));
            }
          }
          if (sameDayMatches.length > 0) {
            isInspectedSameDay = true;
            inspectedSameDayText = curDay + " with enrolled " + sameDayMatches.join(", ") + " (" + (sameDayMatches.length + 1) + " exams on this day)";
          }
        }

        if (isInspectedClashing) {
          els.detailClashWarning.className = "detail-clash-warning danger";
          els.detailClashWarning.style.display = "flex";
          if (els.detailClashText) {
            els.detailClashText.textContent = "Exam Routine Clash: " + inspectedClashText;
          }
        } else if (isInspectedSameDay) {
          els.detailClashWarning.className = "detail-clash-warning is-warning";
          els.detailClashWarning.style.display = "flex";
          if (els.detailClashText) {
            els.detailClashText.textContent = "⚠️ Same-Day Exam: " + inspectedSameDayText;
          }
        } else {
          els.detailClashWarning.style.display = "none";
        }
      }
    }
  }

  function toggleEnrollCourse(code) {
    if (!code) return;
    var idx = enrolledCourses.indexOf(code);
    if (idx === -1) {
      enrolledCourses.unshift(code);
    } else {
      enrolledCourses.splice(idx, 1);
    }

    chrome.storage.local.set({ enrolledCourses: enrolledCourses }, function() {
      updateEnrolledUI();
      if (els.viewWrapper.classList.contains("show-courses")) {
        renderCourseList();
      }
    });
  }

  // ── End Task 3.2 Helpers ──────────────────────────────────────────────────

    // ── Task 2.4: Prerequisite Tree helpers ────────────────────────────────────

  /**
   * Builds a levelled prerequisite chain for a given course code.
   * Returns an array of levels: [ { codes: ["CSE 1115"], depth: 1 }, ... ]
   * Cycle-safe via a visited Set.
   * @param {string} rootCode - Course code being viewed
   * @param {Object} catalog  - The merged courses catalog
   * @returns {{ directCodes: string[], levels: Array<{codes: string[], depth: number}> }}
   */
  function buildPrereqChain(rootCode, catalog) {
    var directCodes = [];
    var levels = [];
    var visited = new Set();
    visited.add(rootCode);

    var rootData = normalizeCourseData(catalog[rootCode]);
    var rootPrereqs = (Array.isArray(rootData.prerequisites) ? rootData.prerequisites : []).filter(function(c) {
      return c && c.toUpperCase() !== "NONE";
    });
    directCodes = rootPrereqs.slice();

    var currentLevel = rootPrereqs.filter(function(c) { return !visited.has(c); });
    currentLevel.forEach(function(c) { visited.add(c); });

    var depth = 1;
    while (currentLevel.length > 0) {
      levels.push({ codes: currentLevel.slice(), depth: depth });
      depth++;
      var nextLevel = [];
      for (var i = 0; i < currentLevel.length; i++) {
        var c = currentLevel[i];
        var cData = normalizeCourseData(catalog[c]);
        var cPrereqs = Array.isArray(cData.prerequisites) ? cData.prerequisites : [];
        for (var j = 0; j < cPrereqs.length; j++) {
          var p = cPrereqs[j];
          if (!visited.has(p)) {
            visited.add(p);
            nextLevel.push(p);
          }
        }
      }
      currentLevel = nextLevel;
    }
    return { directCodes: directCodes, levels: levels };
  }

  /**
   * Finds all courses in the catalog that list `code` as a direct prerequisite.
   * Returns a sorted array of course codes.
   * @param {string} code    - Course code to search for
   * @param {Object} catalog - The merged courses catalog
   * @returns {string[]}
   */
  function findUnlocks(code, catalog) {
    var result = [];
    var keys = Object.keys(catalog);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var data = normalizeCourseData(catalog[k]);
      if (Array.isArray(data.prerequisites) && data.prerequisites.indexOf(code) !== -1) {
        result.push(k);
      }
    }
    result.sort();
    return result;
  }

  /**
   * Renders the Prerequisite Chain and Unlocks sections in View 3.
   * Called at the end of openCourseDetails() and on toggle switch.
   * Zero innerHTML — uses only DOM APIs.
   * Respects showPrereqNames to display course name or code in each badge.
   * @param {string} code - The course code currently shown in View 3
   */
  function renderPrereqTree(code) {
    var section = els.prereqTreeSection;
    var chainBody = els.prereqChainBody;
    var chainCount = els.prereqChainCount;
    var unlocksBody = els.unlocksBody;
    var unlocksCountEl = els.unlocksCount;

    if (!section || !chainBody || !unlocksBody) return;

    // Sync toggle button visual state
    if (els.prereqToggleCode) {
      els.prereqToggleCode.classList.toggle("is-active", !showPrereqNames);
      els.prereqToggleCode.setAttribute("aria-pressed", String(!showPrereqNames));
    }
    if (els.prereqToggleName) {
      els.prereqToggleName.classList.toggle("is-active", showPrereqNames);
      els.prereqToggleName.setAttribute("aria-pressed", String(showPrereqNames));
    }

    // Clear existing content
    chainBody.textContent = "";
    unlocksBody.textContent = "";

    var chain = buildPrereqChain(code, courses);
    var unlocks = findUnlocks(code, courses);

    var hasChain = chain.levels.length > 0 || chain.directCodes.length > 0;
    var hasUnlocks = unlocks.length > 0;

    // Update count badges
    var totalChainCodes = 0;
    chain.levels.forEach(function(l) { totalChainCodes += l.codes.length; });
    if (chainCount) chainCount.textContent = hasChain ? String(totalChainCodes) : "0";
    if (unlocksCountEl) unlocksCountEl.textContent = String(unlocks.length);

    // ── Update Launcher Card on details-view ───────────────────────────────
    if (els.detailPrereqReqChip) {
      if (hasChain) {
        els.detailPrereqReqChip.className = "prereq-stat-chip req";
        els.detailPrereqReqChip.textContent = totalChainCodes + (totalChainCodes === 1 ? " Prereq" : " Prereqs");
      } else {
        els.detailPrereqReqChip.className = "prereq-stat-chip direct";
        els.detailPrereqReqChip.textContent = "Direct Entry";
      }
    }
    if (els.detailPrereqUnlockChip) {
      if (hasUnlocks) {
        els.detailPrereqUnlockChip.className = "prereq-stat-chip unlock";
        els.detailPrereqUnlockChip.textContent = unlocks.length + (unlocks.length === 1 ? " Unlock" : " Unlocks");
      } else {
        els.detailPrereqUnlockChip.className = "prereq-stat-chip terminal";
        els.detailPrereqUnlockChip.textContent = "Terminal Course";
      }
    }
    if (els.detailPrereqLauncherDesc) {
      if (hasChain && hasUnlocks) {
        els.detailPrereqLauncherDesc.textContent = "Requires " + totalChainCodes + (totalChainCodes === 1 ? " course" : " courses") + " • Unlocks " + unlocks.length + (unlocks.length === 1 ? " course" : " courses");
      } else if (hasChain) {
        els.detailPrereqLauncherDesc.textContent = "Requires " + totalChainCodes + (totalChainCodes === 1 ? " prerequisite course" : " prerequisite courses");
      } else if (hasUnlocks) {
        els.detailPrereqLauncherDesc.textContent = "Direct entry course • Unlocks " + unlocks.length + (unlocks.length === 1 ? " future course" : " future courses");
      } else {
        els.detailPrereqLauncherDesc.textContent = "Direct entry course • No prerequisite restrictions";
      }
    }
    if (els.btnOpenPrereqFlowText) {
      if (hasChain || hasUnlocks) {
        els.btnOpenPrereqFlowText.textContent = "Explore Prerequisite Tree & Unlocks";
      } else {
        els.btnOpenPrereqFlowText.textContent = "View Course Roadmap & Tree";
      }
    }

    // ── Populate Flow View Header & Hero Card ─────────────────────────────
    if (els.flowCourseCode) els.flowCourseCode.textContent = code;
    if (els.flowOriginBadge) {
      var origin = getCourseOrigin(code);
      els.flowOriginBadge.className = "origin-badge " + origin.class;
      els.flowOriginBadge.textContent = origin.label;
    }
    var cData = normalizeCourseData(courses[code]);
    if (els.flowCourseSubtitle) {
      els.flowCourseSubtitle.textContent = cData.name || "Course Roadmap & Dependencies";
    }
    if (els.flowHeroTitle) {
      els.flowHeroTitle.textContent = cData.name || code;
    }
    if (els.flowHeroCredits) {
      var numCr = parseFloat(cData.credits);
      els.flowHeroCredits.textContent = (!isNaN(numCr) && numCr > 0 ? numCr.toFixed(1) : "3.0") + " Cr";
    }
    if (els.flowHeroReqText) {
      els.flowHeroReqText.textContent = hasChain ? (totalChainCodes + (totalChainCodes === 1 ? " Required Prereq" : " Required Prereqs")) : "0 Required Prereqs (Direct)";
    }
    if (els.flowHeroUnlockText) {
      els.flowHeroUnlockText.textContent = hasUnlocks ? (unlocks.length + (unlocks.length === 1 ? " Course Unlocked" : " Courses Unlocked")) : "0 Courses Unlocked (Terminal)";
    }
    if (els.flowPrereqNoteCard && els.flowPrereqNoteText) {
      var note = (cData.prerequisiteNote || "").trim();
      if (note) {
        els.flowPrereqNoteText.textContent = note;
        els.flowPrereqNoteCard.style.display = "flex";
      } else {
        els.flowPrereqNoteCard.style.display = "none";
      }
    }

    /**
     * Returns the label and tooltip for a badge.
     * In Code mode:  label = code,  tooltip = name (if available)
     * In Name mode:  label = name,  tooltip = code
     * Missing codes: always label = code, tooltip indicates not in catalog
     */
    function badgeContent(courseCode) {
      var inCatalog = !!courses[courseCode];
      if (!inCatalog) {
        return { label: courseCode, tooltip: courseCode + " — not in catalog", nameMode: false };
      }
      var data = normalizeCourseData(courses[courseCode]);
      var name = data.name || "";
      if (showPrereqNames && name) {
        return { label: name, tooltip: courseCode, nameMode: true };
      }
      return { label: courseCode, tooltip: name ? name : ("Go to " + courseCode), nameMode: false };
    }

    // ── Render prerequisite chain ──────────────────────────────────────────
    if (!hasChain) {
      var emptyState = document.createElement("div");
      emptyState.className = "prereq-empty-state";
      var emptyIcon = document.createElement("div");
      emptyIcon.className = "prereq-empty-icon direct";
      emptyIcon.textContent = "✓";
      emptyState.appendChild(emptyIcon);
      var emptyTitle = document.createElement("strong");
      emptyTitle.textContent = "Direct Entry Course";
      emptyState.appendChild(emptyTitle);
      var emptyDesc = document.createElement("span");
      emptyDesc.textContent = "No prior coursework or prerequisites required. You can enroll directly.";
      emptyState.appendChild(emptyDesc);
      chainBody.appendChild(emptyState);
    } else {
      // Collect all prerequisite codes in order from deepest foundation to direct
      var allPrereqCodes = [];
      var seenCodes = new Set();
      // Reverse levels so base foundation comes first, direct prereqs lead into target
      for (var lIdx = chain.levels.length - 1; lIdx >= 0; lIdx--) {
        var lvl = chain.levels[lIdx];
        for (var cIdx = 0; cIdx < lvl.codes.length; cIdx++) {
          var pCode = lvl.codes[cIdx];
          if (!seenCodes.has(pCode)) {
            seenCodes.add(pCode);
            allPrereqCodes.push(pCode);
          }
        }
      }

      allPrereqCodes.forEach(function(prereqCode) {
        var inCatalog = !!courses[prereqCode];
        var pData = inCatalog ? normalizeCourseData(courses[prereqCode]) : null;
        var pName = pData ? (pData.name || "") : "";
        var numCr = pData && pData.credits ? parseFloat(pData.credits) : NaN;
        var pCr = (!isNaN(numCr) && numCr > 0 ? numCr.toFixed(1) : "3.0") + " Cr";

        var card = document.createElement("button");
        card.type = "button";
        card.className = "unlock-course-card prereq-course-card prereq-badge is-direct";
        card.title = inCatalog ? (prereqCode + " — " + (pName || "Course details")) : (prereqCode + " — not in catalog");

        var cardTop = document.createElement("div");
        cardTop.className = "unlock-card-top";

        var codeSpan = document.createElement("strong");
        codeSpan.className = "unlock-card-code";
        codeSpan.textContent = prereqCode;
        cardTop.appendChild(codeSpan);

        var crSpan = document.createElement("span");
        crSpan.className = "unlock-card-cr";
        crSpan.textContent = pCr;
        cardTop.appendChild(crSpan);

        card.appendChild(cardTop);

        var nameSpan = document.createElement("span");
        nameSpan.className = "unlock-card-name";
        nameSpan.textContent = pName || prereqCode;
        card.appendChild(nameSpan);

        if (inCatalog) {
          card.addEventListener("click", (function(c) {
            return function() { openCourseDetails(c, courses[c], "flow"); };
          })(prereqCode));
        } else {
          card.setAttribute("aria-disabled", "true");
        }
        chainBody.appendChild(card);
      });
    }

    // ── Render unlocks ─────────────────────────────────────────────────────
    if (!hasUnlocks) {
      var emptyUnlocks = document.createElement("div");
      emptyUnlocks.className = "prereq-empty-state";
      var termIcon = document.createElement("div");
      termIcon.className = "prereq-empty-icon terminal";
      termIcon.textContent = "🎓";
      emptyUnlocks.appendChild(termIcon);
      var termTitle = document.createElement("strong");
      termTitle.textContent = "Specialized / Capstone Course";
      emptyUnlocks.appendChild(termTitle);
      var termDesc = document.createElement("span");
      termDesc.textContent = "No subsequent courses list this as a prerequisite. Completes this curriculum branch.";
      emptyUnlocks.appendChild(termDesc);
      unlocksBody.appendChild(emptyUnlocks);
    } else {
      unlocks.forEach(function(unlockCode) {
        var inCatalog = !!courses[unlockCode];
        var uData = inCatalog ? normalizeCourseData(courses[unlockCode]) : null;
        var uName = uData ? (uData.name || "") : "";
        var numCr = uData && uData.credits ? parseFloat(uData.credits) : NaN;
        var uCr = (!isNaN(numCr) && numCr > 0 ? numCr.toFixed(1) : "3.0") + " Cr";

        var card = document.createElement("button");
        card.type = "button";
        card.className = "unlock-course-card prereq-badge is-direct";
        card.title = inCatalog ? (unlockCode + " — " + (uName || "Course details")) : (unlockCode + " — not in catalog");

        var cardTop = document.createElement("div");
        cardTop.className = "unlock-card-top";

        var codeSpan = document.createElement("strong");
        codeSpan.className = "unlock-card-code";
        codeSpan.textContent = unlockCode;
        cardTop.appendChild(codeSpan);

        var crSpan = document.createElement("span");
        crSpan.className = "unlock-card-cr";
        crSpan.textContent = uCr;
        cardTop.appendChild(crSpan);

        card.appendChild(cardTop);

        var nameSpan = document.createElement("span");
        nameSpan.className = "unlock-card-name";
        nameSpan.textContent = uName || unlockCode;
        card.appendChild(nameSpan);

        if (inCatalog) {
          card.addEventListener("click", (function(c) {
            return function() { openCourseDetails(c, courses[c], "flow"); };
          })(unlockCode));
        } else {
          card.setAttribute("aria-disabled", "true");
        }
        unlocksBody.appendChild(card);
      });
    }

    // Keep section visible in flow view
    section.style.display = "flex";
  }

  // ── End Task 2.4 helpers ─────────────────────────────────────────────────

  // Task 2.4 Enhancement: Code/Name toggle event listeners
  (function setupPrereqToggle() {
    function activateToggle(nameMode) {
      showPrereqNames = nameMode;
      // Persist preference
      try { chrome.storage.local.set({ prereqShowNames: nameMode }); } catch(e) {}
      // Re-render if we're currently on the details view
      if (currentEditingCode) renderPrereqTree(currentEditingCode);
    }

    if (els.prereqToggleCode) {
      els.prereqToggleCode.addEventListener("click", function() { activateToggle(false); });
    }
    if (els.prereqToggleName) {
      els.prereqToggleName.addEventListener("click", function() { activateToggle(true); });
    }
  })();

  function openPrereqFlowView(code) {
    if (!code) code = currentEditingCode;
    if (!code) return;
    renderPrereqTree(code);
    els.viewWrapper.classList.add("show-flow");
  }

  function exitPrereqFlowView() {
    els.viewWrapper.classList.remove("show-flow");
  }

  els.btnOpenPrereqFlow?.addEventListener("click", () => {
    openPrereqFlowView(currentEditingCode);
  });

  els.flowBackBtn?.addEventListener("click", (e) => {
    e?.preventDefault();
    exitPrereqFlowView();
  });

  els.flowSettingsBtn?.addEventListener("click", () => {
    openSettings("flow");
  });

      // Context-aware Course Details Contribution & Error Reporting Card
  function updateDetailReportCard(code, courseData) {
    if (!els.detailReportCard) return;
    const origin = getCourseOrigin(code);
    const isUserAdded = origin.class === "user-added" || origin.class === "user";
    const isEdited = origin.class === "edited";

    const titleEl = document.getElementById("detailReportTitle");
    const subTitleEl = document.getElementById("detailReportSubtitle");
    const bodyEl = document.getElementById("detailReportBody");
    const btnTextEl = document.getElementById("detailReportBtnText");
    const footerHintEl = document.getElementById("detailReportFooterHint");
    const iconPath = document.getElementById("detailReportIconPath");
    const btnIconPath = document.getElementById("detailReportBtnIconPath");
    const reportBtn = els.reportIssueBtn;

    const GITHUB_SVG = "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z";
    const SYNC_SVG = "M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z";
    const ALERT_SVG = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z";

    if (isUserAdded) {
      els.detailReportCard.classList.add("is-user-added");
      els.detailReportCard.classList.remove("is-edited");
      if (titleEl) titleEl.textContent = "Upload to Official Repository";
      if (subTitleEl) subTitleEl.textContent = "Saved locally on this device";
      if (bodyEl) bodyEl.textContent = "This course is stored only on your browser. Upload it to the community database so all UIU students can automatically decode it.";
      if (btnTextEl) btnTextEl.textContent = "Submit Course to GitHub";
      if (footerHintEl) footerHintEl.textContent = "Open-source community project";
      if (reportBtn) reportBtn.title = "Submit this user-added course to the official repository via GitHub";
      if (iconPath) iconPath.setAttribute("d", GITHUB_SVG);
      if (btnIconPath) btnIconPath.setAttribute("d", GITHUB_SVG);
    } else if (isEdited) {
      els.detailReportCard.classList.add("is-edited");
      els.detailReportCard.classList.remove("is-user-added");
      if (titleEl) titleEl.textContent = "Propose Changes to Official Catalog";
      if (subTitleEl) subTitleEl.textContent = "Modified locally on this device";
      if (bodyEl) bodyEl.textContent = "You have customized this course's routine or prerequisites. Submit your updates so the central catalog stays accurate for everyone.";
      if (btnTextEl) btnTextEl.textContent = "Propose Changes to GitHub";
      if (footerHintEl) footerHintEl.textContent = "Verified via pull request";
      if (reportBtn) reportBtn.title = "Propose your modifications to the official UIU catalog via GitHub";
      if (iconPath) iconPath.setAttribute("d", SYNC_SVG);
      if (btnIconPath) btnIconPath.setAttribute("d", SYNC_SVG);
    } else {
      els.detailReportCard.classList.remove("is-user-added", "is-edited");
      if (titleEl) titleEl.textContent = "Notice an error with this course?";
      if (subTitleEl) subTitleEl.textContent = "Official university catalog";
      if (bodyEl) bodyEl.textContent = "If the course title, exam routine, credits, or prerequisites are outdated or missing, report it so we can update it for all UIU students.";
      if (btnTextEl) btnTextEl.textContent = "Report Wrong Data on GitHub";
      if (footerHintEl) footerHintEl.textContent = "Want to contribute missing courses?";
      if (reportBtn) reportBtn.title = "Report incorrect course data via GitHub";
      if (iconPath) iconPath.setAttribute("d", ALERT_SVG);
      if (btnIconPath) btnIconPath.setAttribute("d", ALERT_SVG);
    }
  }

  function openCourseDetails(code, courseData, originView = "courses") {
    detailsOriginView = originView;
    currentEditingCode = code;
    els.detailsCourseCode.textContent = code;
    courseData = courseData || courses[code];

    const name = typeof courseData === "object" && courseData !== null ? (courseData.name || "") : (courseData || "");
    if (els.detailsCourseSubtitle) {
      els.detailsCourseSubtitle.textContent = name || "Course Details & Routine";
    }

    const origin = getCourseOrigin(code);
    const badgeEl = document.getElementById("detailsOriginBadge");
    if (badgeEl) {
      badgeEl.className = `origin-badge ${origin.class}`;
      badgeEl.textContent = origin.label;
    }

    const examDay = typeof courseData === "object" && courseData !== null ? (courseData.examDay || "") : "";
    const examSlot = typeof courseData === "object" && courseData !== null ? (courseData.examSlot || "") : "";
    const prerequisites = typeof courseData === "object" && courseData !== null && courseData.prerequisites ? courseData.prerequisites.join(", ") : "";

    els.detailName.value = name;
    const isLabOrInClass = (examDay || "").trim().toLowerCase() === "in-class";
    if (els.detailInClass) {
      els.detailInClass.checked = isLabOrInClass;
    }
    els.detailDay.value = examDay;
    els.detailDay.disabled = isLabOrInClass;
    els.detailSlot.value = examSlot;
    els.detailSlot.disabled = isLabOrInClass;

    const hasExplicitNonePrereq = (typeof courseData === "object" && courseData !== null && Array.isArray(courseData.prerequisites) && courseData.prerequisites.length === 1 && courseData.prerequisites[0].toLowerCase() === "none");
    if (els.detailNoPrereq) {
      els.detailNoPrereq.checked = hasExplicitNonePrereq;
    }
    els.detailPrereq.value = prerequisites;
    els.detailPrereq.disabled = hasExplicitNonePrereq;
    if (els.detailPrereqNote) els.detailPrereqNote.value = (typeof courseData === "object" && courseData !== null) ? (courseData.prerequisiteNote || "") : "";
    const creditsVal = (typeof courseData === "object" && courseData !== null && courseData.credits !== undefined && courseData.credits !== null) ? courseData.credits : "";
    if (els.detailCredits) els.detailCredits.value = creditsVal;
    if (els.detailsCreditsBadge) {
      var numCr = parseFloat(creditsVal);
      if (!isNaN(numCr) && numCr > 0) {
        els.detailsCreditsBadge.textContent = numCr.toFixed(1) + " Cr";
      } else {
        els.detailsCreditsBadge.textContent = "3.0 Cr";
      }
      els.detailsCreditsBadge.style.display = "inline-flex";
    }

    els.detailName.style.borderColor = "";

    els.detailDelBtn.disabled = false;
    els.detailDelBtn.title = "";

    // Populate Course Details Hero Card
    if (els.detailCourseTitle) {
      els.detailCourseTitle.textContent = name || "Untitled Course";
    }
    if (els.detailHeroCredits) {
      var numCr = parseFloat(creditsVal);
      els.detailHeroCredits.textContent = (!isNaN(numCr) && numCr > 0 ? numCr.toFixed(1) : "3.0") + " Credits";
    }
    if (els.detailHeroRoutine) {
      var lowerDay = (examDay || "").trim().toLowerCase();
      if (lowerDay === "in-class") {
        els.detailHeroRoutine.textContent = "📝 In-Class Evaluation (No central routine)";
        els.detailHeroRoutine.style.display = "inline-flex";
      } else if (examDay && examSlot && lowerDay !== "n/a" && lowerDay !== "none") {
        var slotTimes = { "T1": "09:00–11:00", "T2": "11:30–13:30", "T3": "14:30–16:30" };
        var timeLabel = slotTimes[examSlot] ? (" (" + slotTimes[examSlot] + ")") : "";
        els.detailHeroRoutine.textContent = examDay + " • Slot " + examSlot + timeLabel;
        els.detailHeroRoutine.style.display = "inline-flex";
      } else {
        els.detailHeroRoutine.textContent = "🕒 Routine Pending / TBA";
        els.detailHeroRoutine.style.display = "inline-flex";
      }
    }
    if (els.detailHeroDept) {
      var prefix = code.split(" ")[0] || code.substring(0, 3);
      var deptMap = {
        "CSE": "Computer Science & Eng.",
        "DS": "Data Science",
        "SE": "Software Engineering",
        "EEE": "Electrical & Electronic",
        "CE": "Civil Engineering",
        "BBA": "Business Administration",
        "ACT": "Accounting",
        "FIN": "Finance",
        "MKT": "Marketing",
        "HRM": "Human Resource Mgt.",
        "ECO": "Economics",
        "ENG": "English / Humanities",
        "MATH": "Mathematics",
        "PHY": "Physics",
        "CHEM": "Chemistry",
        "BIO": "Biology / Life Sciences",
        "URP": "Urban & Regional Planning"
      };
      els.detailHeroDept.textContent = deptMap[prefix] || prefix;
    }
    if (els.detailHeroPrereqNote) {
      var noteVal = (typeof courseData === "object" && courseData !== null) ? (courseData.prerequisiteNote || "").trim() : "";
      if (noteVal) {
        els.detailHeroPrereqNote.textContent = "📌 Prerequisite Note: " + noteVal;
        els.detailHeroPrereqNote.style.display = "flex";
      } else {
        els.detailHeroPrereqNote.style.display = "none";
      }
    }

    // Form is directly open and editable
    if (els.detailsFormContainer) {
      els.detailsFormContainer.style.display = "block";
    }

    els.viewWrapper.classList.add("show-details");
    els.viewWrapper.classList.remove("show-courses", "show-settings", "show-trash", "show-import", "show-flow");

    if (els.detailSaveContribPrompt) els.detailSaveContribPrompt.style.display = "none";
    updateDetailReportCard(code, courseData);

    // Task 2.4 — render prerequisite tree for this course
    renderPrereqTree(code);

    // Task 3.2 — update enrolled status and clash warning
    updateEnrolledUI();
  }

  function exitCourseDetails() {
    els.viewWrapper.classList.remove("show-details");
    if (detailsOriginView === "settings") {
      els.viewWrapper.classList.add("show-settings");
    } else if (detailsOriginView === "mycourses") {
      els.viewWrapper.classList.add("show-mycourses");
    } else if (detailsOriginView === "flow") {
      els.viewWrapper.classList.add("show-flow");
    } else {
      els.viewWrapper.classList.add("show-courses");
    }
  }

  function commitCourseSave(code, newVal) {
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

      // Update Course Details view in place
      const origin = getCourseOrigin(code);
      const badgeEl = document.getElementById("detailsOriginBadge");
      if (badgeEl) {
        badgeEl.className = `origin-badge ${origin.class}`;
        badgeEl.textContent = origin.label;
      }
      if (els.detailsCourseSubtitle) {
        els.detailsCourseSubtitle.textContent = newVal.name || "Course Details & Routine";
      }
      if (els.detailCourseTitle) els.detailCourseTitle.textContent = newVal.name || code;
      var numCr = parseFloat(newVal.credits);
      var crStr = (!isNaN(numCr) && numCr > 0 ? numCr.toFixed(1) : "3.0") + " Cr";
      if (els.detailHeroCreditsBadge) els.detailHeroCreditsBadge.textContent = crStr;
      if (els.detailMetricCreditsVal) els.detailMetricCreditsVal.textContent = crStr;

      var lowerD = (newVal.examDay || "").trim().toLowerCase();
      var slotTimes = { "T1": "09:00–11:00", "T2": "11:30–13:30", "T3": "14:30–16:30" };
      if (lowerD === "in-class") {
        if (els.detailMetricRoutineVal) els.detailMetricRoutineVal.textContent = "In-Class";
        if (els.detailMetricRoutineTime) els.detailMetricRoutineTime.textContent = "Lab / Viva";
      } else if (newVal.examDay && newVal.examSlot && lowerD !== "n/a" && lowerD !== "none") {
        if (els.detailMetricRoutineVal) els.detailMetricRoutineVal.textContent = newVal.examDay + " • " + newVal.examSlot;
        if (els.detailMetricRoutineTime) els.detailMetricRoutineTime.textContent = slotTimes[newVal.examSlot] || "Routine Slot";
      } else {
        if (els.detailMetricRoutineVal) els.detailMetricRoutineVal.textContent = "TBA";
        if (els.detailMetricRoutineTime) els.detailMetricRoutineTime.textContent = "Routine TBA";
      }

      var pList = Array.isArray(newVal.prerequisites) ? newVal.prerequisites.filter(function(p) { return p && p.toUpperCase() !== "NONE"; }) : [];
      if (els.detailMetricPrereqsVal) {
        els.detailMetricPrereqsVal.textContent = pList.length > 0 ? (pList.length + (pList.length === 1 ? " Prereq" : " Prereqs")) : "Direct Entry";
      }

      // Re-render prereq tree for updated course data
      renderPrereqTree(code);
      updateDetailReportCard(code, newVal);

      // Show Post-Save Contribution Prompt Banner smoothly
      if (els.detailSaveContribPrompt) {
        els.detailSaveContribPrompt.style.display = "flex";
        els.detailSaveContribPrompt.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      showToast("Changes saved locally", "success");
    })();
  }

  function renderMsgDom(container, type, text) {
    container.textContent = "";
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "import-msg-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (type === "success") {
      path.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z");
    } else if (type === "error") {
      path.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z");
    } else {
      path.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z");
    }
    svg.appendChild(path);
    container.appendChild(svg);
    const span = document.createElement("span");
    span.textContent = text;
    container.appendChild(span);
  }

  let importMsgTimer = null;
  function showImportMsg(type, text) {
    if (!els.importMsg) return;
    if (importMsgTimer) clearTimeout(importMsgTimer);
    els.importMsg.className = `import-msg ${type}`;
    renderMsgDom(els.importMsg, type, text);
    els.importMsg.style.display = "flex";
    importMsgTimer = setTimeout(() => {
      if (els.importMsg) {
        els.importMsg.className = "import-msg";
        els.importMsg.style.display = "none";
        els.importMsg.textContent = "";
      }
    }, 4500);
  }

  let singleCourseMsgTimer = null;
  function showSingleCourseMsg(type, text) {
    if (!els.singleCourseMsg) return;
    if (singleCourseMsgTimer) clearTimeout(singleCourseMsgTimer);
    els.singleCourseMsg.className = `import-msg ${type}`;
    renderMsgDom(els.singleCourseMsg, type, text);
    els.singleCourseMsg.style.display = "flex";
    singleCourseMsgTimer = setTimeout(() => {
      if (els.singleCourseMsg) {
        els.singleCourseMsg.className = "import-msg";
        els.singleCourseMsg.style.display = "none";
        els.singleCourseMsg.textContent = "";
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

    toast.textContent = "";
    const badgeSpan = document.createElement("span");
    badgeSpan.style.cssText = `display:inline-grid;place-items:center;width:17px;height:17px;border-radius:50%;color:#fff;font-size:10px;font-weight:700;flex-shrink:0;background:${type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#64748b')};`;
    badgeSpan.textContent = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
    toast.appendChild(badgeSpan);
    const msgSpan = document.createElement("span");
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);
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
    const el = document.createElement(isRemoved ? "span" : "button");
    el.className = "sync-code-chip" + (isRemoved ? " is-removed" : "");
    if (!isRemoved) {
      el.type = "button";
      el.setAttribute("data-code", code);
      el.title = `Click to view details for ${code}`;
    } else {
      el.title = "Course removed from catalog";
    }

    const codeSpan = document.createElement("span");
    codeSpan.textContent = code;
    el.appendChild(codeSpan);

    let badgeText = "";
    let pillClass = "";
    if (detailsMap && detailsMap[code]) {
      badgeText = Array.isArray(detailsMap[code]) ? detailsMap[code].join(" & ") : detailsMap[code];
      pillClass = type === "add" ? "add" : (type === "revert" ? "revert" : "");
    } else if (type === "add") {
      badgeText = "New";
      pillClass = "add";
    } else if (type === "remove") {
      badgeText = "Removed";
    } else if (type === "restore") {
      badgeText = "Restored";
      pillClass = "add";
    } else if (type === "revert") {
      badgeText = "Reverted";
      pillClass = "revert";
    }

    if (badgeText) {
      const pill = document.createElement("span");
      pill.className = "sync-field-pill" + (pillClass ? " " + pillClass : "");
      pill.textContent = badgeText;
      el.appendChild(pill);
    }

    if (!isRemoved) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "sync-chip-arrow");
      svg.setAttribute("viewBox", "0 0 24 24");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M5 19L19 5M19 5H9M19 5V15");
      path.setAttribute("stroke", "currentColor");
      path.setAttribute("stroke-width", "2.2");
      path.setAttribute("stroke-linecap", "round");
      path.setAttribute("stroke-linejoin", "round");
      path.setAttribute("fill", "none");
      svg.appendChild(path);
      el.appendChild(svg);
    }

    return el;
  }

  function formatInteractiveDiffRow(label, codes, detailsMap, type) {
    if (!codes || codes.length === 0) return null;
    const row = document.createElement("div");
    row.className = "sync-diff-row";

    const strong = document.createElement("strong");
    strong.textContent = label + ":";
    row.appendChild(strong);

    if (codes.length <= 6) {
      const chipsDiv = document.createElement("div");
      chipsDiv.className = "sync-diff-chips";
      codes.forEach(c => chipsDiv.appendChild(renderDiffChip(c, detailsMap, type)));
      row.appendChild(chipsDiv);
      return row;
    }

    const previewDiv = document.createElement("div");
    previewDiv.className = "sync-diff-chips sync-codes-preview";
    codes.slice(0, 6).forEach(c => previewDiv.appendChild(renderDiffChip(c, detailsMap, type)));
    row.appendChild(previewDiv);

    const fullDiv = document.createElement("div");
    fullDiv.className = "sync-diff-chips sync-codes-full";
    fullDiv.style.display = "none";
    codes.forEach(c => fullDiv.appendChild(renderDiffChip(c, detailsMap, type)));
    row.appendChild(fullDiv);

    const moreCount = codes.length - 6;
    const btn = document.createElement("button");
    btn.className = "btn-more-codes";
    btn.type = "button";
    btn.setAttribute("data-more-count", String(moreCount));
    btn.textContent = `+${moreCount} more`;
    row.appendChild(btn);

    return row;
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
        els.syncResultBadges.textContent = "";
      }
      if (els.syncResultDetails) {
        els.syncResultDetails.style.display = "none";
        els.syncResultDetails.textContent = "";
      }
    } else {
      if (dot) dot.className = "sync-card-dot has-updates";
      els.syncResultTitle.textContent = "Sync Complete";
      if (desc) {
        desc.style.display = "block";
        desc.textContent = "Successfully applied changes from the repository:";
      }

      if (els.syncResultBadges) {
        els.syncResultBadges.textContent = "";
        if (added > 0) {
          const chip = document.createElement("span");
          chip.className = "sync-metric-chip add";
          chip.textContent = `+${added} new`;
          els.syncResultBadges.appendChild(chip);
        }
        if (updated > 0) {
          const chip = document.createElement("span");
          chip.className = "sync-metric-chip update";
          chip.textContent = `${updated} updated`;
          els.syncResultBadges.appendChild(chip);
        }
        if (removed > 0) {
          const chip = document.createElement("span");
          chip.className = "sync-metric-chip remove";
          chip.textContent = `${removed} removed`;
          els.syncResultBadges.appendChild(chip);
        }
        els.syncResultBadges.style.display = (added > 0 || updated > 0 || removed > 0) ? "flex" : "none";
      }

      if (els.syncResultDetails) {
        els.syncResultDetails.textContent = "";
        let hasRows = false;
        if (addedCodes.length > 0) {
          const r = formatInteractiveDiffRow("Added", addedCodes, null, "add");
          if (r) { els.syncResultDetails.appendChild(r); hasRows = true; }
        }
        if (updatedCodes.length > 0) {
          const r = formatInteractiveDiffRow("Updated", updatedCodes, updatedDetails, "update");
          if (r) { els.syncResultDetails.appendChild(r); hasRows = true; }
        }
        if (removedCodes.length > 0) {
          const r = formatInteractiveDiffRow("Removed", removedCodes, null, "remove");
          if (r) { els.syncResultDetails.appendChild(r); hasRows = true; }
        }
        if (hasRows) {
          els.syncResultDetails.style.display = "flex";
          bindDiffContainerEvents(els.syncResultDetails);
        } else {
          els.syncResultDetails.style.display = "none";
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
        els.resetResultBadges.textContent = "";
      }
      if (els.resetResultDetails) {
        els.resetResultDetails.style.display = "none";
        els.resetResultDetails.textContent = "";
      }
    } else {
      if (dot) dot.className = "sync-card-dot has-updates";
      if (els.resetResultTitle) els.resetResultTitle.textContent = "Catalog Reset Complete";
      if (desc) {
        desc.style.display = "block";
        desc.textContent = "Successfully restored official course mappings and discarded local modifications:";
      }

      if (els.resetResultBadges) {
        els.resetResultBadges.textContent = "";
        if (restoredCodes.length > 0) {
          const chip = document.createElement("span");
          chip.className = "sync-metric-chip add";
          chip.textContent = `+${restoredCodes.length} restored`;
          els.resetResultBadges.appendChild(chip);
        }
        if (revertedCodes.length > 0) {
          const chip = document.createElement("span");
          chip.className = "sync-metric-chip update";
          chip.textContent = `${revertedCodes.length} reverted`;
          els.resetResultBadges.appendChild(chip);
        }
        els.resetResultBadges.style.display = (restoredCodes.length > 0 || revertedCodes.length > 0) ? "flex" : "none";
      }

      if (els.resetResultDetails) {
        els.resetResultDetails.textContent = "";
        let hasRows = false;
        if (restoredCodes.length > 0) {
          const r = formatInteractiveDiffRow("Restored", restoredCodes, null, "restore");
          if (r) { els.resetResultDetails.appendChild(r); hasRows = true; }
        }
        if (revertedCodes.length > 0) {
          const r = formatInteractiveDiffRow("Reverted", revertedCodes, revertedDetails, "revert");
          if (r) { els.resetResultDetails.appendChild(r); hasRows = true; }
        }
        if (hasRows) {
          els.resetResultDetails.style.display = "flex";
          bindDiffContainerEvents(els.resetResultDetails);
        } else {
          els.resetResultDetails.style.display = "none";
        }
      }
    }
  }

  function attachEventListeners() {
    // Export Course Catalog modal controls
    els.exportCoursesBtn?.addEventListener("click", openExportModal);
    els.exportModalCloseBtn?.addEventListener("click", closeExportModal);
    els.exportModalCancelBtn?.addEventListener("click", closeExportModal);

    const openContributionModal = () => {
      openModalSafely(els.contributionModal, els.contribModalCloseBtn);
    };
    const closeContributionModal = () => {
      closeModalSafely(els.contributionModal);
    };

    els.openContribModalBtn?.addEventListener("click", openContributionModal);
    els.detailsInfoBtn?.addEventListener("click", openContributionModal);
    els.importInfoBtn?.addEventListener("click", openContributionModal);
    els.importContribLink?.addEventListener("click", (e) => {
      e.preventDefault();
      openContributionModal();
    });

    els.contribModalCloseBtn?.addEventListener("click", closeContributionModal);
    els.contribModalDoneBtn?.addEventListener("click", closeContributionModal);

    const dismissWelcomeCard = () => {
      if (els.viewWrapper) {
        els.viewWrapper.classList.remove("show-welcome");
      }
      chrome.storage.local.set({ welcomeDismissed: true });
    };

    els.welcomeDismissBtn?.addEventListener("click", dismissWelcomeCard);
    els.welcomeActionBtn?.addEventListener("click", dismissWelcomeCard);

    els.contribExportCustomBtn?.addEventListener("click", () => {
      closeContributionModal();
      exportCoursesContextual("custom");
    });

    els.contribReportIssueBtn?.addEventListener("click", () => {
      closeContributionModal();

      let title = "";
      let body = "";

      if (currentEditingCode && els.viewWrapper.classList.contains("show-details")) {
        const courseData = courses[currentEditingCode];
        const name = typeof courseData === "object" && courseData !== null ? (courseData.name || "") : (courseData || "");
        const examDay = typeof courseData === "object" && courseData !== null ? (courseData.examDay || "") : "";
        const examSlot = typeof courseData === "object" && courseData !== null ? (courseData.examSlot || "") : "";
        const prereqs = typeof courseData === "object" && courseData !== null && Array.isArray(courseData.prerequisites)
          ? courseData.prerequisites.join(", ")
          : "";
        const note = typeof courseData === "object" && courseData !== null ? (courseData.prerequisiteNote || "") : "";
        const credits = typeof courseData === "object" && courseData !== null && courseData.credits ? courseData.credits : "";

        title = encodeURIComponent(`[Data Correction] ${currentEditingCode} - ${name || "Course Details"}`);
        let courseDetailsMd = `### 📚 Course Information\n` +
          `- **Course Code:** \`${currentEditingCode}\` — ${name || "Untitled"}\n` +
          `- **Credits:** ${credits ? credits + " Cr" : "—"}\n` +
          `- **Exam Routine:** Day ${examDay || "—"}, Slot ${examSlot || "—"}\n` +
          `- **Prerequisites:** ${prereqs || "None"}\n`;
        if (note) {
          courseDetailsMd += `- **Prerequisite Note:** ${note}\n`;
        }

        body = encodeURIComponent(
          courseDetailsMd +
          `\n---\n\n` +
          `### ✏️ What is missing or needs fixing?\n` +
          `*(Describe what is missing or incorrect, e.g. wrong course name, missing prerequisite, outdated exam slot)*\n\n\n\n` +
          `### 💡 Correct Information (if known)\n` +
          `*(Provide the correct details from UCAM, official routine, or syllabus)*\n\n\n\n` +
          `---\n` +
          `*Submitted via UIU Course Code Decoder extension. Thanks for keeping the catalog accurate!*`
        );
      } else {
        title = encodeURIComponent(`[Missing Course] New Course or Department Curriculum Report`);
        body = encodeURIComponent(
          `### 📋 Missing Course Information\n\n` +
          `- **Course Code:** \n` +
          `- **Course Title:** \n` +
          `- **Department / Program:** (e.g. BSCSE, BSSE, BBA, BSCIVIL, BSDS, MS)\n` +
          `- **Credit Hours:** (e.g. 3.0, 1.5, 4.0)\n\n` +
          `---\n\n` +
          `### ⏰ Exam Routine (if scheduled)\n` +
          `- **Exam Day:** (e.g. D1, D4, or Unscheduled)\n` +
          `- **Exam Slot:** (e.g. T1: 09:00–11:00, T2: 11:30–13:30, T3: 14:30–16:30)\n\n` +
          `---\n\n` +
          `### 🔗 Prerequisites\n` +
          `- **Prerequisite Courses:** (e.g. CSE 1111, MATH 1151, or None)\n` +
          `- **Prerequisite Note:** (e.g. Minimum 70 completed credits)\n\n` +
          `---\n\n` +
          `### 📌 Source / Evidence\n` +
          `*(e.g. UCAM course registration screenshot, official university routine PDF, syllabus link)*\n\n\n\n` +
          `---\n` +
          `*Submitted via UIU Course Code Decoder extension. Thank you for contributing to UIU's community catalog!*`
        );
      }

      const issueUrl = `https://github.com/litch07/uiu-course-decoder/issues/new?title=${title}&body=${body}&labels=data-correction,course-addition`;
      try {
        chrome.tabs.create({ url: issueUrl });
      } catch (_) {
        window.open(issueUrl, "_blank", "noopener,noreferrer");
      }
    });
    els.exportModal?.addEventListener("click", (e) => {
      if (e.target === els.exportModal) {
        closeExportModal();
      }
    });

    // Task 3.3: Exam Calendar Export Event Listeners
    els.openIcsExportBtn?.addEventListener("click", openExamCalendarModal);
    els.examExportCloseBtn?.addEventListener("click", closeExamCalendarModal);
    els.examExportCancelBtn?.addEventListener("click", closeExamCalendarModal);
    els.examExportModal?.addEventListener("click", (e) => {
      if (e.target === els.examExportModal) {
        closeExamCalendarModal();
      }
    });
    els.icsStartDateInput?.addEventListener("change", renderIcsPreview);
    els.downloadIcsBtn?.addEventListener("click", () => {
      var entries = getCoursesForCalendar();
      var startDate = els.icsStartDateInput ? els.icsStartDateInput.value : "";
      var includeReminders = els.icsRemindersToggle ? els.icsRemindersToggle.checked : true;
      var icsContent = generateIcsCalendar(entries, startDate, includeReminders);
      var filename = "uiu-final-exams-" + (startDate || "schedule") + ".ics";
      downloadIcsBlob(filename, icsContent);
      showToast("Downloaded exam schedule calendar (.ics)", "success");
      closeExamCalendarModal();
    });

    document.addEventListener("keydown", (e) => {
      // Focus trapping inside active modals (Task 3.5)
      if (e.key === "Tab") {
        if (els.confirmModal?.classList.contains("show")) {
          trapModalFocus(els.confirmModal, e);
        } else if (els.exportModal?.classList.contains("show")) {
          trapModalFocus(els.exportModal, e);
        } else if (els.examExportModal?.classList.contains("show")) {
          trapModalFocus(els.examExportModal, e);
        } else if (els.importPreviewModal?.classList.contains("show")) {
          trapModalFocus(els.importPreviewModal, e);
        }
      }

      // Hierarchical Escape key navigation (Task 3.5)
      if (e.key === "Escape") {
        if (els.importPreviewModal?.classList.contains("show")) {
          closeImportPreviewModal();
        } else if (els.exportModal?.classList.contains("show")) {
          closeExportModal();
        } else if (els.examExportModal?.classList.contains("show")) {
          closeExamCalendarModal();
        } else if (els.confirmModal?.classList.contains("show")) {
          closeModalSafely(els.confirmModal);
          pendingAction = null;
          pendingSaveVal = null;
        } else if (els.viewWrapper.classList.contains("show-flow")) {
          els.flowBackBtn?.click();
        } else if (els.viewWrapper.classList.contains("show-details")) {
          els.detailsBackBtn?.click();
        } else if (els.viewWrapper.classList.contains("show-import")) {
          els.importBackBtn?.click();
        } else if (els.viewWrapper.classList.contains("show-mycourses")) {
          if (els.myCoursesSuggestionsList && els.myCoursesSuggestionsList.style.display !== "none") {
            els.myCoursesSuggestionsList.style.display = "none";
            if (els.myCoursesSearchInput) els.myCoursesSearchInput.value = "";
            if (els.myCoursesSearchClearBtn) els.myCoursesSearchClearBtn.style.display = "none";
          } else {
            els.myCoursesBackBtn?.click();
          }
        } else if (els.viewWrapper.classList.contains("show-settings")) {
          els.settingsBackBtn?.click();
        } else if (els.viewWrapper.classList.contains("show-courses")) {
          els.backBtn?.click();
        }
      }
    });

    // Arrow navigation for tabs, theme options, filter row, and prereq toggle (Task 3.5)
    els.tabSingleCourse?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        activateBatchUploadTab();
        els.tabBulkImport?.focus();
      }
    });
    els.tabBulkImport?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        activateSingleCourseTab();
        els.tabSingleCourse?.focus();
      }
    });

    const themeOptionBtns = [els.themeSystem, els.themeLight, els.themeDark].filter(Boolean);
    themeOptionBtns.forEach((btn, idx) => {
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          const next = themeOptionBtns[(idx + 1) % themeOptionBtns.length];
          next.click();
          next.focus();
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
          e.preventDefault();
          const prev = themeOptionBtns[(idx - 1 + themeOptionBtns.length) % themeOptionBtns.length];
          prev.click();
          prev.focus();
        }
      });
    });

    els.prereqToggleCode?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        els.prereqToggleName?.click();
        els.prereqToggleName?.focus();
      }
    });
    els.prereqToggleName?.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        els.prereqToggleCode?.click();
        els.prereqToggleCode?.focus();
      }
    });

    const filterBtnsArr = Array.from(document.querySelectorAll("#courseFilterRow .filter-btn"));
    filterBtnsArr.forEach((btn, idx) => {
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          const next = filterBtnsArr[(idx + 1) % filterBtnsArr.length];
          next.click();
          next.focus();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          const prev = filterBtnsArr[(idx - 1 + filterBtnsArr.length) % filterBtnsArr.length];
          prev.click();
          prev.focus();
        }
      });
    });


    // Report Wrong Data button in Course Details view
    els.reportIssueBtn?.addEventListener("click", () => {
      if (!currentEditingCode) return;
      const courseData = courses[currentEditingCode];
      const name = typeof courseData === "object" && courseData !== null ? (courseData.name || "") : (courseData || "");
      const examDay = typeof courseData === "object" && courseData !== null ? (courseData.examDay || "") : "";
      const examSlot = typeof courseData === "object" && courseData !== null ? (courseData.examSlot || "") : "";
      const prereqs = typeof courseData === "object" && courseData !== null && Array.isArray(courseData.prerequisites)
        ? courseData.prerequisites.join(", ")
        : "";
      const note = typeof courseData === "object" && courseData !== null ? (courseData.prerequisiteNote || "") : "";
      const credits = typeof courseData === "object" && courseData !== null && courseData.credits ? courseData.credits : "";
      const origin = getCourseOrigin(currentEditingCode);
      const isUserAdded = origin.class === "user-added" || origin.class === "user";
      const isEdited = origin.class === "edited";
      const lowerDay = (examDay || "").trim().toLowerCase();

      let title = "";
      let body = "";
      let labels = "data-correction";

      if (isUserAdded) {
        title = encodeURIComponent(`[Course Addition] ${currentEditingCode} - ${name || "New Course"}`);
        labels = "course-addition,community-contribution";
        let routineDisplay = "Schedule Pending / TBA";
        if (lowerDay === "in-class") routineDisplay = "In-Class Evaluation (No central routine exam)";
        else if (examDay && examSlot) routineDisplay = `Day ${examDay}, Slot ${examSlot}`;
        else if (examDay) routineDisplay = `Day ${examDay}`;

        let md = `### 🚀 New Course Submission for Official Catalog\n` +
          `The following course was created locally and is submitted for inclusion in the official UIU extension database:\n\n` +
          `- **Course Code:** \`${currentEditingCode}\`\n` +
          `- **Course Title:** ${name || "Untitled"}\n` +
          `- **Credits:** ${credits ? credits + " Cr" : "3.0 Cr"}\n` +
          `- **Exam Routine:** ${routineDisplay}\n` +
          `- **Prerequisites:** ${prereqs || "None (Direct entry)"}\n`;
        if (note) md += `- **Prerequisite Note:** ${note}\n`;
        md += `\n---\n\n` +
          `### 📋 Course Department / Source\n` +
          `*(Please mention department, faculty syllabus, or UCAM portal notice)*\n\n\n` +
          `*Submitted via UIU Course Code Decoder extension. Thank you for contributing to UIU's community catalog!*`;
        body = encodeURIComponent(md);
      } else if (isEdited) {
        title = encodeURIComponent(`[Catalog Correction] ${currentEditingCode} - Proposed Updates`);
        labels = "data-correction,community-update";
        let routineDisplay = "Schedule Pending / TBA";
        if (lowerDay === "in-class") routineDisplay = "In-Class Evaluation";
        else if (examDay && examSlot) routineDisplay = `Day ${examDay}, Slot ${examSlot}`;
        else if (examDay) routineDisplay = `Day ${examDay}`;

        let md = `### 📝 Proposed Course Update for Official Catalog\n` +
          `The following local corrections are proposed for \`${currentEditingCode}\`:\n\n` +
          `- **Course Code:** \`${currentEditingCode}\`\n` +
          `- **Updated Title:** ${name || "Untitled"}\n` +
          `- **Updated Credits:** ${credits ? credits + " Cr" : "3.0 Cr"}\n` +
          `- **Updated Routine:** ${routineDisplay}\n` +
          `- **Updated Prerequisites:** ${prereqs || "None"}\n`;
        if (note) md += `- **Prerequisite Note:** ${note}\n`;
        md += `\n---\n\n` +
          `### 🔄 Reason for Change / Verification\n` +
          `*(Describe why this update is needed, e.g. routine updated for current trimester, prerequisite change, etc.)*\n\n\n` +
          `*Thanks for helping keep the UIU course catalog accurate for everyone!*`;
        body = encodeURIComponent(md);
      } else {
        title = encodeURIComponent(`[Data Correction] ${currentEditingCode} - ${name || "Course Details"}`);
        labels = "data-correction";
        let md = `### 📋 Course Information\n` +
          `- **Course:** \`${currentEditingCode}\` - ${name || "Untitled"}\n` +
          `- **Exam Routine:** Day ${examDay || "-"}, Slot ${examSlot || "-"}\n` +
          `- **Prerequisites:** ${prereqs || "None"}\n`;
        if (note) md += `- **Prerequisite Note:** ${note}\n`;
        md += `\n---\n\n` +
          `### ❓ What needs fixing?\n` +
          `*(Describe what is incorrect, e.g. wrong course name, missing prerequisite, outdated exam slot)*\n\n\n\n` +
          `### 💡 Correct Information (if known)\n` +
          `*(Provide the updated course details or official source)*\n\n\n` +
          `*Thanks for helping keep the UIU course catalog accurate for everyone!*`;
        body = encodeURIComponent(md);
      }

      const issueUrl = `https://github.com/litch07/uiu-course-decoder/issues/new?title=${title}&body=${body}&labels=${labels}`;
      try {
        chrome.tabs.create({ url: issueUrl });
      } catch (_) {
        window.open(issueUrl, "_blank", "noopener,noreferrer");
      }
    });

    // Panel sliding animations
    els.openCoursesBtn?.addEventListener("click", () => {
      isTrashMode = false;
      els.coursesPanelTitle.textContent = "Course Catalog";
      updateCourseCount();
      updateEnrolledUI();
      updateSearchClearBtn();
      if (els.courseTableCard) els.courseTableCard.classList.remove("trash-mode");
      if (els.colHeaderAction) els.colHeaderAction.textContent = "";
      if (els.exportCoursesBtn) els.exportCoursesBtn.style.display = "grid";
      els.viewTrashBtn.style.display = "grid";
      els.courseFilterRow.style.display = "flex";
      els.openImportBtn.style.display = "flex";
      renderCourseList(searchQuery);
      els.viewWrapper.classList.add("show-courses");
    });

    // ── My Courses View Routing & Quick Add (Release 3 Refinement) ────────
    const openMyCourses = () => {
      els.viewWrapper.classList.remove("show-courses", "show-details", "show-import", "show-settings");
      els.viewWrapper.classList.add("show-mycourses");
      updateEnrolledUI();
      setTimeout(() => {
        els.myCoursesSearchInput?.focus({ preventScroll: true });
      }, 250);
    };

    els.homeEnrolledCard?.addEventListener("click", openMyCourses);
    els.homeEnrolledCard?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openMyCourses();
      }
    });

    els.myCoursesBackBtn?.addEventListener("click", () => {
      els.viewWrapper.classList.remove("show-mycourses");
      setTimeout(() => {
        els.homeEnrolledCard?.focus({ preventScroll: true });
      }, 250);
    });

    els.browseCatalogFromMyCoursesBtn?.addEventListener("click", () => {
      els.viewWrapper.classList.remove("show-mycourses");
      els.openCoursesBtn?.click();
    });

    els.clearEnrolledBtn?.addEventListener("click", () => {
      if (enrolledCourses.length === 0) return;
      pendingAction = "clear-enrolled";
      setModalText("Drop all courses?", `Are you sure you want to remove all ${enrolledCourses.length} courses from your trimester routine?`);
      openModalSafely(els.confirmModal, els.modalConfirmBtn);
    });

    // Quick add search bar with autocomplete suggestions in My Courses
    function setupMyCoursesQuickAdd() {
      if (!els.myCoursesSearchInput || !els.myCoursesSuggestionsList) return;

      function renderSuggestions(query) {
        const q = (query || "").trim().toLowerCase();
        while (els.myCoursesSuggestionsList.firstChild) {
          els.myCoursesSuggestionsList.removeChild(els.myCoursesSuggestionsList.firstChild);
        }

        if (!q) {
          els.myCoursesSuggestionsList.style.display = "none";
          if (els.myCoursesSearchClearBtn) els.myCoursesSearchClearBtn.style.display = "none";
          return;
        }

        if (els.myCoursesSearchClearBtn) els.myCoursesSearchClearBtn.style.display = "block";

        const matchedCodes = Object.keys(courses).filter(code => {
          if (enrolledCourses.indexOf(code) !== -1) return false;
          const cData = courses[code];
          const name = typeof cData === "object" && cData !== null ? (cData.name || "") : (cData || "");
          return code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
        }).slice(0, 5);

        if (matchedCodes.length === 0) {
          els.myCoursesSuggestionsList.style.display = "flex";
          const emptyItem = document.createElement("div");
          emptyItem.style.padding = "6px 8px";
          emptyItem.style.fontSize = "0.68rem";
          emptyItem.style.color = "var(--text-muted)";
          emptyItem.textContent = `No un-enrolled courses matching "${query}".`;
          els.myCoursesSuggestionsList.appendChild(emptyItem);
          return;
        }

        els.myCoursesSuggestionsList.style.display = "flex";
        matchedCodes.forEach(code => {
          const cData = courses[code];
          const name = typeof cData === "object" && cData !== null ? (cData.name || "") : (cData || "");
          const credits = typeof cData === "object" && cData !== null && cData.credits ? cData.credits : 3;
          const examDay = typeof cData === "object" && cData !== null && cData.examDay ? cData.examDay : "";
          const examSlot = typeof cData === "object" && cData !== null && cData.examSlot ? cData.examSlot : "";

          const item = document.createElement("div");
          item.className = "mycourses-suggestion-item";

          const info = document.createElement("div");
          info.className = "suggestion-info";

          const codeRow = document.createElement("div");
          codeRow.className = "suggestion-code-row";

          const codeSpan = document.createElement("span");
          codeSpan.className = "suggestion-code";
          codeSpan.textContent = code;
          codeRow.appendChild(codeSpan);

          if (examDay || examSlot) {
            const slotSpan = document.createElement("span");
            slotSpan.className = "course-slot-chip";
            slotSpan.style.fontSize = "0.58rem";
            slotSpan.textContent = (examDay ? examDay : "") + (examDay && examSlot ? " " : "") + (examSlot ? examSlot : "");
            codeRow.appendChild(slotSpan);
          }

          const titleDiv = document.createElement("div");
          titleDiv.className = "suggestion-title";
          titleDiv.textContent = name;
          titleDiv.title = name;

          info.appendChild(codeRow);
          info.appendChild(titleDiv);

          const chipsDiv = document.createElement("div");
          chipsDiv.className = "suggestion-chips";

          const crSpan = document.createElement("span");
          crSpan.className = "course-credit-chip";
          crSpan.style.fontSize = "0.58rem";
          crSpan.textContent = credits.toFixed(1) + " Cr";
          chipsDiv.appendChild(crSpan);

          const addBtn = document.createElement("button");
          addBtn.type = "button";
          addBtn.className = "btn-suggestion-add";
          addBtn.textContent = "+ Add";

          chipsDiv.appendChild(addBtn);

          item.appendChild(info);
          item.appendChild(chipsDiv);

          const handleAdd = (e) => {
            e.stopPropagation();
            toggleEnrollCourse(code);
            els.myCoursesSearchInput.value = "";
            renderSuggestions("");
          };

          item.addEventListener("click", handleAdd);
          addBtn.addEventListener("click", handleAdd);

          els.myCoursesSuggestionsList.appendChild(item);
        });
      }

      els.myCoursesSearchInput.addEventListener("input", (e) => {
        renderSuggestions(e.target.value);
      });

      els.myCoursesSearchClearBtn?.addEventListener("click", () => {
        els.myCoursesSearchInput.value = "";
        renderSuggestions("");
        els.myCoursesSearchInput.focus();
      });

      els.myCoursesSearchInput.addEventListener("focus", () => {
        if (els.myCoursesSearchInput.value.trim()) {
          renderSuggestions(els.myCoursesSearchInput.value);
        }
      });

      els.myCoursesSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          els.myCoursesSearchInput.value = "";
          renderSuggestions("");
        }
      });

      document.addEventListener("click", (e) => {
        if (els.myCoursesSuggestionsList && !els.myCoursesAddCard?.contains(e.target)) {
          els.myCoursesSuggestionsList.style.display = "none";
        }
      });
    }

    setupMyCoursesQuickAdd();

    let settingsOriginView = "home";

    function openSettings(fromView = null) {
      if (fromView) {
        settingsOriginView = fromView;
      } else if (els.viewWrapper.classList.contains("show-flow")) {
        settingsOriginView = "flow";
      } else if (els.viewWrapper.classList.contains("show-details")) {
        settingsOriginView = "details";
      } else if (els.viewWrapper.classList.contains("show-courses")) {
        settingsOriginView = "courses";
      } else if (els.viewWrapper.classList.contains("show-import")) {
        settingsOriginView = "import";
      } else if (els.viewWrapper.classList.contains("show-mycourses")) {
        settingsOriginView = "mycourses";
      } else {
        settingsOriginView = "home";
      }
      els.viewWrapper.classList.remove("show-courses", "show-details", "show-import", "show-mycourses", "show-flow");
      els.viewWrapper.classList.add("show-settings");
    }
    els.openSettingsBtn?.addEventListener("click", () => openSettings("home"));
    els.coursesSettingsBtn?.addEventListener("click", () => openSettings("courses"));
    els.importSettingsBtn?.addEventListener("click", () => openSettings("import"));
    els.detailsSettingsBtn?.addEventListener("click", () => openSettings("details"));
    document.getElementById("homeSyncAlert")?.addEventListener("click", () => openSettings("home"));

    els.settingsBackBtn?.addEventListener("click", () => {
      els.viewWrapper.classList.remove("show-settings");
      if (settingsOriginView === "flow") {
        els.viewWrapper.classList.add("show-flow");
      } else if (settingsOriginView === "details") {
        els.viewWrapper.classList.add("show-details");
      } else if (settingsOriginView === "courses") {
        els.viewWrapper.classList.add("show-courses");
      } else if (settingsOriginView === "import") {
        els.viewWrapper.classList.add("show-import");
      } else if (settingsOriginView === "mycourses") {
        els.viewWrapper.classList.add("show-mycourses");
      }
      settingsOriginView = "home";
    });

    // Theme preference option buttons (Task 3.4)
    els.themeSystem?.addEventListener("click", () => setTheme("system"));
    els.themeLight?.addEventListener("click", () => setTheme("light"));
    els.themeDark?.addEventListener("click", () => setTheme("dark"));

    function activateSingleCourseTab() {
      els.tabSingleCourse?.classList.add("active");
      els.tabSingleCourse?.setAttribute("aria-selected", "true");
      els.tabBulkImport?.classList.remove("active");
      els.tabBulkImport?.setAttribute("aria-selected", "false");
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
      els.tabBulkImport?.setAttribute("aria-selected", "true");
      els.tabSingleCourse?.classList.remove("active");
      els.tabSingleCourse?.setAttribute("aria-selected", "false");
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
        if (els.exportCoursesBtn) els.exportCoursesBtn.style.display = "none";
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
        els.coursesPanelTitle.textContent = "Course Catalog";
        updateCourseCount();
        if (els.exportCoursesBtn) els.exportCoursesBtn.style.display = "grid";
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
        els.coursesPanelTitle.textContent = "Course Catalog";
        updateCourseCount();
        if (els.exportCoursesBtn) els.exportCoursesBtn.style.display = "grid";
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
      setModalText(`Restore ${count === 1 ? 'course' : `all ${count} courses`}?`, `${count === 1 ? 'This course' : 'All courses in Trash'} will be returned to your active course catalog.`);
      els.confirmModal.classList.add("show");
    });

    els.emptyTrashBtn?.addEventListener("click", () => {
      if (softDeletedCourses.length === 0) return;
      pendingAction = "empty-trash";
      const count = softDeletedCourses.length;
      setModalText(`Permanently delete ${count === 1 ? 'course' : `all ${count} courses`}?`, `${count === 1 ? 'This course' : 'All courses in Trash'} will be permanently removed from storage and cannot be restored.`);
      els.confirmModal.classList.add("show");
    });

    els.detailsBackBtn?.addEventListener("click", () => {
      exitCourseDetails();
    });

    
    // Post-Save Contribution Prompt Banner Event Listeners
    els.detailSaveContribGithubBtn?.addEventListener("click", () => {
      if (!currentEditingCode) return;
      if (els.reportIssueBtn) {
        els.reportIssueBtn.click();
      }
      const labelSpan = els.detailSaveContribGithubBtn.querySelector("span");
      if (labelSpan) {
        labelSpan.textContent = "Opening GitHub...";
        setTimeout(() => {
          if (labelSpan) labelSpan.textContent = "Submit to GitHub";
        }, 3000);
      } else {
        els.detailSaveContribGithubBtn.textContent = "Opening GitHub...";
        setTimeout(() => {
          els.detailSaveContribGithubBtn.textContent = "Submit to GitHub";
        }, 3000);
      }
    });

    els.detailSaveContribDoneBtn?.addEventListener("click", () => {
      if (els.detailSaveContribPrompt) els.detailSaveContribPrompt.style.display = "none";
      exitCourseDetails();
    });

    els.detailSaveContribClose?.addEventListener("click", () => {
      if (els.detailSaveContribPrompt) els.detailSaveContribPrompt.style.display = "none";
    });

    els.detailSaveBtn?.addEventListener("click", () => {
      if (!currentEditingCode) return;

      const newName = els.detailName.value.trim();
      if (!newName) {
        els.detailName.style.borderColor = "var(--danger)";
        return;
      }

      const isDetailInClass = !!els.detailInClass?.checked;
      const isDetailNoPrereq = !!els.detailNoPrereq?.checked;

      const newDay = isDetailInClass ? "In-Class" : els.detailDay.value.trim();
      const newSlot = isDetailInClass ? "" : els.detailSlot.value.trim();
      const newPrereqRaw = els.detailPrereq.value.trim();
      const newPrereqNote = els.detailPrereqNote ? els.detailPrereqNote.value.trim() : "";

      let newPrereqs = [];
      if (isDetailNoPrereq) {
        newPrereqs = ["None"];
      } else if (newPrereqRaw) {
        newPrereqs = newPrereqRaw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
      }

      const newCreditsRaw = els.detailCredits ? els.detailCredits.value.trim() : "";
      let newCredits = null;
      if (newCreditsRaw) {
        const parsed = parseFloat(newCreditsRaw);
        if (!isNaN(parsed) && parsed > 0) newCredits = parsed;
      }

      let newVal;
      if (newDay || newSlot || newPrereqs.length > 0 || newPrereqNote || newCredits !== null) {
        newVal = {
          name: newName,
          examDay: newDay,
          examSlot: newSlot,
          prerequisites: newPrereqs,
          prerequisiteNote: newPrereqNote
        };
        if (newCredits !== null) newVal.credits = newCredits;
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
      setModalText(`Save Changes to ${currentEditingCode}?`, "Updated course title, prerequisites, and exam schedules will be stored locally on this device and applied immediately across all active pages.");
      els.confirmModal.classList.add("show");
    });

    els.detailDelBtn?.addEventListener("click", () => {
      if (!currentEditingCode || els.detailDelBtn.disabled) return;

      pendingAction = "delete";
      setModalText(`Move ${currentEditingCode} to Trash?`, "This course will be excluded from active decoding. You can review or restore it from the Trash Bin at any time.");
      els.confirmModal.classList.add("show");
    });

    els.detailsEnrollBtn?.addEventListener("click", () => {
      if (!currentEditingCode) return;
      toggleEnrollCourse(currentEditingCode);
      const isNowEnrolled = enrolledCourses.indexOf(currentEditingCode) !== -1;
      showToast(
        isNowEnrolled ? `Added ${currentEditingCode} to My Courses` : `Removed ${currentEditingCode} from My Courses`,
        isNowEnrolled ? "success" : "info"
      );
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
      } else if (pendingAction === "bulk-remove-domains") {
        const toRemove = Array.from(selectedDomainSet);
        const count = toRemove.length;

        for (const site of toRemove) {
          try {
            const origin = site.startsWith("*") ? "*://" + site.replace(/^\*\./, "") + "/*" : "*://" + site + "/*";
            await chrome.permissions.remove({ origins: [origin] });
          } catch (_) {}
        }

        allowedSites = allowedSites.filter(s => !selectedDomainSet.has(s));
        selectedDomainSet.clear();
        await chrome.storage.local.set({ allowedSites });
        renderAllowlist();
        await updateToggleAndStatus();
        showToast(count === 1 ? "Removed 1 domain" : "Removed " + count + " domains", "info");
      } else if (pendingAction === "clear-enrolled") {
        enrolledCourses = [];
        await chrome.storage.local.set({ enrolledCourses: [] });
        updateEnrolledUI();
        showToast("Dropped all enrolled courses", "info");
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
        const textSpan = els.copySampleBtn.querySelector("span");
        if (textSpan) textSpan.textContent = "Copied!";
        els.copySampleBtn.style.background = "var(--accent)";
        els.copySampleBtn.style.color = "#fff";
        showImportMsg("success", "2-course sample JSON copied to clipboard. Customize and click Import & Merge.");
        setTimeout(() => {
          if (els.copySampleBtn) {
            const span = els.copySampleBtn.querySelector("span");
            if (span) span.textContent = "Copy";
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
    els.jsonInput?.addEventListener("input", () => {
      updateJsonBadge();
      if (!els.jsonInput.value.trim()) {
        clearDropZoneFileInfo();
      }
    });

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
      els.singleCourseCredits,
      els.singleCoursePrereq,
      els.singleCoursePrereqNote
    ].forEach(input => {
      input?.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          els.addSingleCourseBtn?.click();
        }
      });
    });

    // Collapsible Accordion: Schedule & Prerequisites
    els.singleCourseAccordionToggle?.addEventListener("click", () => {
      if (!els.singleCourseAccordionBody) return;
      const isOpen = els.singleCourseAccordionBody.style.display !== "none";
      els.singleCourseAccordionBody.style.display = isOpen ? "none" : "flex";
      els.singleCourseAccordionToggle.classList.toggle("is-open", !isOpen);
      els.singleCourseAccordionToggle.setAttribute("aria-expanded", String(!isOpen));
    });

    // Segmented Exam Mode: Central Routine vs In-Class
    function setExamMode(mode) {
      const isRoutine = mode === "routine";
      if (els.examModeRoutine) els.examModeRoutine.checked = isRoutine;
      if (els.examModeInClass) els.examModeInClass.checked = !isRoutine;
      if (els.pillExamRoutine) els.pillExamRoutine.classList.toggle("active", isRoutine);
      if (els.pillExamInClass) els.pillExamInClass.classList.toggle("active", !isRoutine);
      if (els.routineInputsRow) els.routineInputsRow.style.display = isRoutine ? "grid" : "none";
      if (els.singleCourseInClass) els.singleCourseInClass.checked = !isRoutine;
      if (!isRoutine) {
        if (els.singleCourseDay) els.singleCourseDay.value = "In-Class";
        if (els.singleCourseSlot) els.singleCourseSlot.value = "";
      } else {
        if (els.singleCourseDay && els.singleCourseDay.value === "In-Class") {
          els.singleCourseDay.value = "";
        }
      }
    }

    els.examModeRoutine?.addEventListener("change", () => setExamMode("routine"));
    els.examModeInClass?.addEventListener("change", () => setExamMode("inclass"));
    els.pillExamRoutine?.addEventListener("click", () => setExamMode("routine"));
    els.pillExamInClass?.addEventListener("click", () => setExamMode("inclass"));

    // Schedule & Prerequisite Toggles for Single Course Form
    els.singleCourseInClass?.addEventListener("change", () => {
      const isChecked = !!els.singleCourseInClass.checked;
      setExamMode(isChecked ? "inclass" : "routine");
    });

    els.singleCourseNoPrereq?.addEventListener("change", () => {
      const isChecked = !!els.singleCourseNoPrereq.checked;
      if (els.singleCoursePrereq) {
        els.singleCoursePrereq.disabled = isChecked;
        els.singleCoursePrereq.value = isChecked ? "None" : "";
      }
    });

    // Schedule & Prerequisite Toggles for Details View
    els.detailInClass?.addEventListener("change", () => {
      const isChecked = !!els.detailInClass.checked;
      if (els.detailDay) {
        els.detailDay.disabled = isChecked;
        els.detailDay.value = isChecked ? "In-Class" : "";
      }
      if (els.detailSlot) {
        els.detailSlot.disabled = isChecked;
        els.detailSlot.value = "";
      }
    });

    els.detailNoPrereq?.addEventListener("change", () => {
      const isChecked = !!els.detailNoPrereq.checked;
      if (els.detailPrereq) {
        els.detailPrereq.disabled = isChecked;
        els.detailPrereq.value = isChecked ? "None" : "";
      }
    });

    // GitHub 1-Click Contribution Handler
    els.contribSubmitGithubBtn?.addEventListener("click", () => {
      if (!lastAddedCourseForContrib) return;
      const c = lastAddedCourseForContrib;
      const title = encodeURIComponent("[Course Addition]: " + c.code + " - " + c.name);
      const body = encodeURIComponent(
        "### 📚 Course Addition Proposal\n\n" +
        "| Field | Value |\n" +
        "| :--- | :--- |\n" +
        "| **Course Code** | `" + c.code + "` |\n" +
        "| **Course Title** | " + c.name + " |\n" +
        "| **Credits** | " + c.credits + " |\n" +
        "| **Exam Schedule** | " + c.examSchedule + " |\n" +
        "| **Prerequisites** | " + c.prerequisites + " |\n" +
        "| **Prerequisite Note** | " + c.prerequisiteNote + " |\n\n" +
        "---\n\n" +
        "### 📌 Source / Verification\n" +
        "*(e.g. UCAM course registration screenshot, official routine, department syllabus)*\n\n\n" +
        "---\n" +
        "*Submitted via UIU Course Code Decoder extension. Thank you for contributing to UIU's community catalog!*"
      );

      const issueUrl = "https://github.com/litch07/uiu-course-decoder/issues/new?title=" + title + "&body=" + body + "&labels=course-addition";
      try {
        chrome.tabs.create({ url: issueUrl });
      } catch (_) {
        window.open(issueUrl, "_blank", "noopener,noreferrer");
      }

      // Update button state visually
      if (els.contribSubmitGithubBtn) {
        els.contribSubmitGithubBtn.style.opacity = "0.75";
        els.contribSubmitGithubBtn.textContent = "✓ Opening GitHub in New Tab...";
        setTimeout(() => {
          if (els.contribSubmitGithubBtn) {
            els.contribSubmitGithubBtn.textContent = "🚀 Reopen GitHub Issue";
            els.contribSubmitGithubBtn.style.opacity = "1";
          }
        }, 3000);
      }
      showToast("Opening GitHub issue in new tab...", "info");
    });

    els.contribDismissBtn?.addEventListener("click", () => {
      if (els.singleCourseContribPrompt) els.singleCourseContribPrompt.style.display = "none";
    });

    // Reset form and return to input state for adding another course
    function resetSingleCourseForm() {
      if (els.singleCourseCode) {
        els.singleCourseCode.value = "";
        els.singleCourseCode.classList.remove("input-error");
      }
      if (els.singleCourseName) {
        els.singleCourseName.value = "";
        els.singleCourseName.classList.remove("input-error");
      }
      if (els.singleCourseDay) {
        els.singleCourseDay.value = "";
        els.singleCourseDay.disabled = false;
      }
      if (els.singleCourseSlot) {
        els.singleCourseSlot.value = "";
        els.singleCourseSlot.disabled = false;
      }
      if (els.singleCourseCredits) els.singleCourseCredits.value = "";
      if (els.singleCoursePrereq) {
        els.singleCoursePrereq.value = "";
        els.singleCoursePrereq.disabled = false;
      }
      if (els.singleCourseNoPrereq) els.singleCourseNoPrereq.checked = false;
      if (els.singleCoursePrereqNote) els.singleCoursePrereqNote.value = "";
      if (els.singleCourseMsg) {
        els.singleCourseMsg.className = "import-msg";
        els.singleCourseMsg.style.display = "none";
        els.singleCourseMsg.textContent = "";
      }
      if (els.singleCourseAccordionBody) {
        els.singleCourseAccordionBody.style.display = "none";
      }
      if (els.singleCourseAccordionToggle) {
        els.singleCourseAccordionToggle.classList.remove("is-open");
        els.singleCourseAccordionToggle.setAttribute("aria-expanded", "false");
      }
      setExamMode("routine");
      lastAddedCourseForContrib = null;

      // Show form state, hide success state
      if (els.singleCourseFormState) els.singleCourseFormState.style.display = "flex";
      if (els.singleCourseSuccessState) els.singleCourseSuccessState.style.display = "none";
    }

    els.successAddAnotherBtn?.addEventListener("click", () => {
      resetSingleCourseForm();
      setTimeout(() => els.singleCourseCode?.focus(), 50);
    });

    els.successViewCatalogBtn?.addEventListener("click", () => {
      const codeToSearch = lastAddedCourseForContrib ? lastAddedCourseForContrib.code : "";
      resetSingleCourseForm();
      // Switch to Course Catalog View
      if (els.importBackBtn) {
        els.importBackBtn.click();
      }
      if (els.viewWrapper && !els.viewWrapper.classList.contains("show-courses")) {
        els.openCoursesBtn?.click();
      }

      // Auto-activate the "User Added" category filter tab
      const userFilterBtn = document.querySelector('#courseFilterRow .filter-btn[data-filter="user"]');
      if (userFilterBtn && els.filterBtns) {
        els.filterBtns.forEach(b => b.classList.remove("active"));
        userFilterBtn.classList.add("active");
        currentFilter = "user";
      }

      if (codeToSearch && els.courseSearch) {
        els.courseSearch.value = codeToSearch;
        searchQuery = codeToSearch;
        if (els.searchClearBtn) els.searchClearBtn.style.display = "inline-flex";
        renderCourseList(searchQuery);
      }
    });

    // Add single course keyboard shortcut (Enter to submit from text fields)
    els.addSingleCourseBtn?.addEventListener("click", async () => {
      els.singleCourseCode?.classList.remove("input-error");
      els.singleCourseName?.classList.remove("input-error");

      const rawCode = els.singleCourseCode?.value.trim() || "";
      const rawName = els.singleCourseName?.value.trim() || "";
      const isInClass = !!els.singleCourseInClass?.checked;
      const hasNoPrereqs = !!els.singleCourseNoPrereq?.checked;

      const rawDay = isInClass ? "In-Class" : (els.singleCourseDay?.value.trim() || "");
      const rawSlot = isInClass ? "" : (els.singleCourseSlot?.value.trim() || "");
      const rawPrereq = els.singleCoursePrereq?.value.trim() || "";
      const prereqNote = els.singleCoursePrereqNote ? els.singleCoursePrereqNote.value.trim() : "";
      const rawCredits = els.singleCourseCredits?.value.trim() || "";
      const singleCredits = rawCredits ? (parseFloat(rawCredits) || null) : null;

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
      const prereqs = hasNoPrereqs
        ? ["None"]
        : (rawPrereq ? rawPrereq.split(",").map(p => p.trim().toUpperCase()).filter(Boolean) : []);

      // Construct course object JSON (empty schedule/prereqs if left blank)
      const courseObj = {
        name: rawName,
        examDay: rawDay || "",
        examSlot: rawSlot || "",
        prerequisites: prereqs,
        prerequisiteNote: prereqNote
      };
      if (singleCredits !== null && singleCredits > 0) {
        courseObj.credits = singleCredits;
      }

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

        // Setup Community Contribution Action Card
        let examScheduleDesc = "Routine Pending / TBA";
        if (isInClass) {
          examScheduleDesc = "In-Class Assessment / Lab Viva";
        } else if (rawDay && rawSlot) {
          examScheduleDesc = "Day " + rawDay + " • Slot " + rawSlot;
        } else if (rawDay) {
          examScheduleDesc = "Day " + rawDay;
        }

        let prereqDesc = "Not specified";
        if (hasNoPrereqs) {
          prereqDesc = "None (Direct entry)";
        } else if (prereqs.length > 0) {
          prereqDesc = prereqs.join(", ");
        }

        lastAddedCourseForContrib = {
          code: code,
          name: rawName,
          credits: singleCredits !== null ? singleCredits.toFixed(1) : "3.0",
          examSchedule: examScheduleDesc,
          prerequisites: prereqDesc,
          prerequisiteNote: prereqNote || "None"
        };

        // Transition from Form State to Dedicated Success State
        if (els.successCourseCode) els.successCourseCode.textContent = code;
        if (els.successCourseCredits) els.successCourseCredits.textContent = (singleCredits !== null ? singleCredits.toFixed(1) : "3.0") + " Cr";
        if (els.successCourseName) els.successCourseName.textContent = rawName;
        if (els.successCourseMeta) els.successCourseMeta.textContent = examScheduleDesc;
        if (els.successCoursePrereq) els.successCoursePrereq.textContent = "Prerequisites: " + prereqDesc;

        if (els.singleCourseFormState) els.singleCourseFormState.style.display = "none";
        if (els.singleCourseSuccessState) els.singleCourseSuccessState.style.display = "flex";

        const importBody = document.querySelector(".import-view .body");
        if (importBody) importBody.scrollTo({ top: 0, behavior: "smooth" });
      } catch (err) {
        console.error("Failed to add course:", err);
        showSingleCourseMsg("error", "Failed to save course. Please try again.");
      }
    });

    // Clear single course form
    els.clearSingleFormBtn?.addEventListener("click", () => {
      resetSingleCourseForm();
      els.singleCourseCode?.focus();
    });

    // Handle user clicking Import & Merge (with Pre-Commit Preview)
    els.importBtn?.addEventListener("click", async () => {
      const raw = els.jsonInput.value.trim();
      if (!raw) {
        showImportMsg("error", "Please paste or enter JSON course data before importing.");
        els.jsonInput.focus();
        return;
      }

      const MAX_IMPORT_BYTES = 2 * 1024 * 1024;
      if (new Blob([raw]).size > MAX_IMPORT_BYTES) {
        showImportMsg("error", "Import payload too large (exceeds 2 MB limit). Please reduce the file size.");
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

      const diff = computeImportDiff(parsed, courses);

      if (diff.toAdd.length === 0 && diff.toUpdate.length === 0) {
        if (diff.errors.length > 0) {
          showImportMsg("error", `Found ${diff.errors.length} invalid course entr${diff.errors.length === 1 ? "y" : "ies"}. No valid changes detected.`);
        } else if (diff.unchanged.length > 0) {
          showImportMsg("info", `All ${diff.unchanged.length} course${diff.unchanged.length !== 1 ? "s" : ""} already match your database identically.`);
        } else {
          showImportMsg("error", "No valid course entries detected in the provided JSON.");
        }
        return;
      }

      // Open the Pre-Commit Preview Modal
      openImportPreviewModal(diff);
    });

    // Pre-Commit Preview action handlers
    els.previewCloseBtn?.addEventListener("click", closeImportPreviewModal);
    els.previewCancelBtn?.addEventListener("click", closeImportPreviewModal);
    els.previewConfirmBtn?.addEventListener("click", async () => {
      if (pendingImportDiff) {
        await executeCommitImportDiff(pendingImportDiff);
      }
    });

    // File Drag-and-Drop and Browse handlers
    els.browseFileBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      els.jsonFileInput?.click();
    });

    els.fileDropZone?.addEventListener("click", (e) => {
      if (!els.fileDropZone.classList.contains("has-file")) {
        els.jsonFileInput?.click();
      }
    });

    els.fileDropZone?.addEventListener("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && !els.fileDropZone.classList.contains("has-file")) {
        e.preventDefault();
        els.jsonFileInput?.click();
      }
    });

    els.jsonFileInput?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (file) processLoadedJsonFile(file);
    });

    // Anti-flicker drag handling
    let dropZoneDragCounter = 0;

    els.fileDropZone?.addEventListener("dragenter", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZoneDragCounter++;
      els.fileDropZone.classList.add("drag-over");
    });

    els.fileDropZone?.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      els.fileDropZone.classList.add("drag-over");
    });

    els.fileDropZone?.addEventListener("dragleave", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZoneDragCounter--;
      if (dropZoneDragCounter <= 0) {
        dropZoneDragCounter = 0;
        els.fileDropZone.classList.remove("drag-over");
      }
    });

    els.fileDropZone?.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZoneDragCounter = 0;
      els.fileDropZone.classList.remove("drag-over");
      const file = e.dataTransfer?.files?.[0];
      if (file) processLoadedJsonFile(file);
    });

    // Window-level drop protection to prevent navigating tab on accidental edge drops
    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", (e) => e.preventDefault());

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
      clearDropZoneFileInfo();
      els.jsonInput.focus();
      showImportMsg("info", "Editor cleared.");
    });

    // Adding sites to the allowlist with dynamic permissions
    const addSite = async () => {
      const val = els.allowlistInput.value.trim().toLowerCase();
      if (!val) return;
      if (!val.includes(".")) {
        showToast("Invalid domain format", "error");
        return;
      }
      if (!allowedSites.includes(val)) {
        const origin = val.startsWith("*.") ? `*://${val}/*` : (val.startsWith("*") ? `*://${val.replace(/^\*/, "")}/*` : `*://${val}/*`);
        allowedSites.push(val);
        await chrome.storage.local.set({ allowedSites });
        els.allowlistInput.value = "";
        renderAllowlist();
        await updateToggleAndStatus();
        try {
          await chrome.permissions.request({ origins: [origin] });
        } catch (_) {}
      }
    };
    els.allowlistBtn?.addEventListener("click", addSite);
    els.allowlistInput?.addEventListener("keypress", e => { if (e.key === "Enter") addSite(); });

    // Allowed Domains search and bulk management listeners
    els.domainSearchInput?.addEventListener("input", (e) => {
      domainSearchQuery = e.target.value;
      renderAllowlist();
    });

    els.domainSearchInput?.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        domainSearchQuery = "";
        els.domainSearchInput.value = "";
        renderAllowlist();
      }
    });

    els.domainSearchClearBtn?.addEventListener("click", () => {
      domainSearchQuery = "";
      if (els.domainSearchInput) els.domainSearchInput.value = "";
      renderAllowlist();
    });

    els.domainSelectAll?.addEventListener("change", () => {
      const filterQuery = domainSearchQuery.trim().toLowerCase();
      const visibleSites = filterQuery
        ? allowedSites.filter(site => site.toLowerCase().includes(filterQuery))
        : allowedSites;

      if (els.domainSelectAll.checked) {
        visibleSites.forEach(s => selectedDomainSet.add(s));
      } else {
        visibleSites.forEach(s => selectedDomainSet.delete(s));
      }
      renderAllowlist();
    });

    els.bulkRemoveDomainsBtn?.addEventListener("click", () => {
      if (selectedDomainSet.size === 0) return;
      pendingAction = "bulk-remove-domains";
      const count = selectedDomainSet.size;
      setModalText(
        "Remove " + count + " Allowed Domain" + (count !== 1 ? "s" : "") + "?",
        "The extension will no longer run or decode course codes on the " + count + " selected website" + (count !== 1 ? "s" : "") + "."
      );
      els.confirmModal?.classList.add("show");
    });

    // Enable/disable the extension on the current site with dynamic host permissions
    els.siteToggle?.addEventListener("change", async () => {
      const isNowEnabled = els.siteToggle.checked;
      if (!currentHost) {
        els.siteToggle.checked = false;
        return;
      }

      const origin = `*://${currentHost}/*`;

      if (isNowEnabled) {
        // Pre-save allowedSites so state is preserved even if Chrome closes popup on permission prompt
        if (!allowedSites.includes(currentHost)) {
          allowedSites.push(currentHost);
          await chrome.storage.local.set({ allowedSites });
        }
        await updateToggleAndStatus();
        renderAllowlist();

        let granted = false;
        try {
          granted = await chrome.permissions.request({ origins: [origin] });
        } catch (e) {
          granted = false;
        }

        if (!granted) {
          // If permission was denied or cancelled, revert state
          allowedSites = allowedSites.filter(s => s !== currentHost);
          await chrome.storage.local.set({ allowedSites });
          els.siteToggle.checked = false;
          await updateToggleAndStatus();
          renderAllowlist();
          return;
        }

        // Permission granted — inject immediately into active tab
        if (currentTabId) {
          try {
            await chrome.scripting.executeScript({
              target: { tabId: currentTabId, allFrames: true },
              files: ["content.js"]
            });
          } catch (_) {}
        }
      } else {
        allowedSites = allowedSites.filter(h => h !== currentHost);
        await chrome.storage.local.set({ allowedSites });
      }

      renderAllowlist();
      await updateToggleAndStatus();
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
      setModalText("Reset Official Catalog?", "This will restore all official course mappings and exam schedules to standard repository defaults, discarding any local modifications. Custom user-added courses will remain unaffected.");
      els.confirmModal.classList.add("show");
    });
  }

  init();
})();