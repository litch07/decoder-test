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
    exportDownloadBtn: document.getElementById("exportDownloadBtn"),
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
    homeSameDayBadge: document.getElementById("homeSameDayBadge"),
    homeExamSummary: document.getElementById("homeExamSummary"),
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
    exportRoutineMdBtn: document.getElementById("exportRoutineMdBtn"),
    themeSettingsCard: document.getElementById("themeSettingsCard"),
    themeSystem: document.getElementById("themeSystem"),
    themeLight: document.getElementById("themeLight"),
    themeDark: document.getElementById("themeDark"),
    themeStatusHint: document.getElementById("themeStatusHint"),
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
    btnOpenPrereqFlow: document.getElementById("btnOpenPrereqFlow"),
    btnOpenPrereqFlowText: document.getElementById("btnOpenPrereqFlowText"),
    roadmapButtonCounts: document.getElementById("roadmapButtonCounts"),
    prereqFlowView: document.getElementById("prereqFlowView"),
    flowBackBtn: document.getElementById("flowBackBtn"),
    flowCourseCode: document.getElementById("flowCourseCode"),
    flowOriginBadge: document.getElementById("flowOriginBadge"),
    flowCourseSubtitle: document.getElementById("flowCourseSubtitle"),
    flowSettingsBtn: document.getElementById("flowSettingsBtn"),
    flowHeroTitle: document.getElementById("flowHeroTitle"),
    flowHeroCredits: document.getElementById("flowHeroCredits"),
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
  let pendingDetailsNavigation = null;
  let lastAddedCourseForContrib = null;
  let pendingSaveVal = null;
  let pendingTarget = null;
  let isTrashMode = false;
  let bundledCourses = {};
  let remoteCourses = {};

  // Helper to create SVG icons safely
  function createIcon(type) {
    const paths = {
      default: "M3 12a9 9 0 0 1 15.36-6.36L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.36 6.36L3 16M3 21v-5h5",
      spinner: "M21 12a9 9 0 1 1-9-9",
      success: "M20 6 9 17l-5-5",
      error: "M6 6l12 12M6 18 18 6",
      restore: "M3 10a9 9 0 1 1 2 8M3 4v6h6",
      delete: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
      remove: "M6 6l12 12M6 18 18 6",
      export: "M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4",
      download: "M12 3v12m-4-4 4 4 4-4M5 16v4h14v-4"
    };
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "action-icon" + (type === "spinner" ? " action-icon-spinner" : ""));
    const size = type === "export" || type === "download" ? "16" : "14";
    svg.setAttribute("width", size); svg.setAttribute("height", size);
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", paths[type] || paths.default);
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
      els.themeStatusHint.hidden = currentThemePreference !== "system";
      els.themeStatusHint.textContent = `Follows your device: ${isSystemDark ? "Dark" : "Light"}.`;
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
    enrolledCourses = Array.isArray(stored.enrolledCourses) ? [...new Set(stored.enrolledCourses.filter(code => typeof code === "string"))] : [];
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
    if (!timestamp) return "Not updated yet";
    const rel = formatRelativeTime(timestamp);
    if (rel === "Just now") return "Just now";
    return `Last updated: ${rel}`;
  }

  function checkSyncReminder() {
    const SYNC_OVERDUE_MS = 60 * 24 * 60 * 60 * 1000; // 2 months (60 days)
    const isOverdue = !!(lastSyncedAt && (Date.now() - lastSyncedAt > SYNC_OVERDUE_MS));
    const banner = document.getElementById("syncReminderBanner");
    const homeAlert = document.getElementById("homeSyncAlert");
    const ageLabel = document.getElementById("homeSyncAge");
    if (banner) banner.style.display = isOverdue ? "flex" : "none";
    if (homeAlert) homeAlert.style.display = isOverdue ? "flex" : "none";
    if (ageLabel && isOverdue) {
      const days = Math.floor((Date.now() - lastSyncedAt) / (24 * 60 * 60 * 1000));
      ageLabel.textContent = "Last synced " + days + " days ago";
    }
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
    els.currentSite.textContent = currentHost || "Decoding unavailable on this page";

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
    els.coursesPanelCount.textContent = isTrashMode ? softDeletedCourses.length + (softDeletedCourses.length === 1 ? " course available to restore" : " courses available to restore") : `${count.toLocaleString()} courses available`;

    updateTrashIndicator(softDeletedCourses.length);
    updateResetAvailability();
  }

  function updateTrashIndicator(count) {
    const menu = document.getElementById("catalogMenu");
    const toggle = document.getElementById("catalogMenuToggle");
    const description = count + (count === 1 ? " course in Trash" : " courses in Trash");
    menu?.classList.toggle("has-trash", count > 0);
    if (toggle) {
      toggle.setAttribute("aria-label", count ? "More catalog options, " + description : "More catalog options");
      toggle.title = count ? description : "More catalog options";
    }
    if (els.trashBadge) {
      els.trashBadge.style.display = count ? "inline-flex" : "none";
      els.trashBadge.textContent = count > 99 ? "99+" : String(count);
    }
    if (els.viewTrashBtn) els.viewTrashBtn.setAttribute("aria-label", count ? "Trash, " + count + (count === 1 ? " course" : " courses") : "Trash, empty");
    if (els.restoreAllBtn) els.restoreAllBtn.disabled = count === 0;
    if (els.emptyTrashBtn) els.emptyTrashBtn.disabled = count === 0;
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
    els.siteToggle.setAttribute("aria-label", currentHost ? "Enable course decoding on " + currentHost : "Course decoding unavailable on this page");
    if (!currentHost) {
      els.siteToggle.checked = false;
      els.siteToggle.disabled = true;
      els.statusDot.className = "status-dot inactive";
      els.statusText.textContent = "Open a website to enable decoding.";
      els.statusText.style.color = "var(--text-muted)";
      return;
    }
    els.siteToggle.disabled = false;
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
      els.statusText.textContent = "Enabled on this website";
      els.statusText.style.color = "var(--success)";
    } else {
      els.statusDot.className = "status-dot inactive";
      els.statusText.textContent = "Disabled on this website";
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
        els.domainsCountBadge.textContent = totalCount + " website" + (totalCount !== 1 ? "s" : "");
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
      msg.textContent = "No websites enabled. Add a website above to start decoding.";
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
      emptyText.textContent = 'No websites match "' + domainSearchQuery + '"';
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
        showToast(site + " removed from enabled websites", "info");
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
      els.domainSelectAllText.textContent = allVisibleSelected ? "Deselect all" : "Select all";
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
        els.bulkRemoveDomainsBtnText.textContent = "Remove selected";
      }
    }
  }

  function setModalText(title, desc) {
    const labels = { "perm-delete": "Delete permanently", "empty-trash": "Delete permanently", "reset-defaults": "Reset changes", "restore-all": "Restore all", "bulk-remove-domains": "Remove websites", "clear-enrolled": "Remove all", "discard-changes": "Discard changes", "delete": "Move to Trash", "restore": "Restore" };
    const destructive = ["perm-delete", "empty-trash", "reset-defaults", "discard-changes"].includes(pendingAction);
    els.confirmModal?.setAttribute("data-tone", destructive ? "danger" : "default");
    if (els.modalConfirmBtn) els.modalConfirmBtn.textContent = labels[pendingAction] || "Continue";
    if (els.modalCancelBtn) els.modalCancelBtn.textContent = pendingAction === "discard-changes" ? "Keep editing" : "Cancel";
    if (!els.modalText) return;
    els.modalText.textContent = "";
    const titleEl = document.createElement("h2");
    titleEl.id = "modalTitle"; titleEl.className = "confirmation-title"; titleEl.textContent = title;
    const description = document.createElement("p");
    description.id = "modalDescription"; description.className = "confirmation-description";
    description.textContent = desc || ""; description.hidden = !desc;
    els.modalText.appendChild(titleEl); els.modalText.appendChild(description);
  }

  function normalizeCourseData(val) {
    if (!val) return { name: "", examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
    if (typeof val === "string") {
      return { name: val.trim(), examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", credits: null };
    }
    const name = typeof val.name === "string" ? val.name.trim() : "";
    let examDay = typeof val.examDay === "string" ? val.examDay.trim() : "";
    const dayMatch = examDay.match(/^(?:day\s*|d)?([1-9]\d*)$/i);
    examDay = dayMatch ? "Day " + Number(dayMatch[1]) : /^in-class$/i.test(examDay) ? "In-Class" : "";
    const rawSlot = typeof val.examSlot === "string" ? val.examSlot.trim().toUpperCase() : "";
    const examSlot = /^T[123]$/.test(rawSlot) && examDay !== "In-Class" ? rawSlot : "";
    const prerequisiteNote = typeof val.prerequisiteNote === "string" ? val.prerequisiteNote.trim() : "";
    const prerequisites = Array.isArray(val.prerequisites)
      ? [...new Set(val.prerequisites.filter(p => typeof p === "string").map(p => /^none$/i.test(p.trim()) ? "None" : p.trim().toUpperCase().replace(/\s+/g, " ")).filter(Boolean))].sort()
      : [];
    let credits = null;
    if (val.credits !== undefined && val.credits !== null && val.credits !== "") {
      const parsed = Number(val.credits);
      if (typeof val.credits !== "boolean" && Number.isFinite(parsed) && parsed > 0) credits = parsed;
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
      return { class: "user-added", label: "Custom" };
    } else if ((inBundled || inRemote) && inUser) {
      return { class: "edited", label: "Edited" };
    } else {
      return { class: "official", label: "Catalog" };
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
    if (norm.credits !== null) out.credits = norm.credits;
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
    let url;
    let a;
    try {
      const jsonStr = JSON.stringify(dataObj, null, 2);
      try {
        const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
        url = URL.createObjectURL(blob);
      } catch (_) {
        url = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
      }
      a = document.createElement("a");
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
      showToast(`Download started: ${filename}`, "success");
      return true;
    } catch (err) {
      if (a?.parentNode) a.parentNode.removeChild(a);
      if (url?.startsWith("blob:")) { try { URL.revokeObjectURL(url); } catch (_) {} }
      console.error("Failed to export JSON file", err);
      showToast("Could not start the download. Try exporting again.", "error");
      return false;
    }
  }

  function triggerExportSuccessFeedback(button = els.exportCoursesBtn) {
    if (!button) return;
    button.classList.add("export-success");
    clearTimeout(button.exportFeedbackTimer);
    button.exportFeedbackTimer = setTimeout(() => button.classList.remove("export-success"), 1200);
  }

  function createExportOptionCard({ title, countText, desc, isDisabled, onClick, value }) {
    const card = document.createElement("label");
    card.className = "export-option-card" + (isDisabled ? " disabled" : "");
    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "courseExportScope";
    radio.value = value;
    radio.disabled = !!isDisabled;
    const copy = document.createElement("span");
    copy.className = "export-option-copy";
    const topRow = document.createElement("span");
    topRow.className = "export-option-top";
    const titleEl = document.createElement("span");
    titleEl.className = "export-option-title";
    titleEl.id = "export-title-" + value;
    titleEl.textContent = title;
    const count = document.createElement("span");
    count.className = "export-option-count";
    count.id = "export-count-" + value;
    count.textContent = countText;
    topRow.appendChild(titleEl);
    topRow.appendChild(count);
    const description = document.createElement("span");
    description.className = "export-option-desc";
    description.id = "export-desc-" + value;
    description.textContent = desc;
    radio.setAttribute("aria-labelledby", titleEl.id + " " + count.id);
    radio.setAttribute("aria-describedby", description.id);
    copy.appendChild(topRow);
    copy.appendChild(description);
    card.appendChild(radio);
    card.appendChild(copy);
    function select() {
      renderExportOptions.downloadAction = onClick;
      if (els.exportDownloadBtn) els.exportDownloadBtn.disabled = false;
    }
    if (!isDisabled) {
      radio.addEventListener("change", function() { if (radio.checked) select(); });
      if (!renderExportOptions.downloadAction) { radio.checked = true; select(); }
    }
    return card;
  }

  function renderExportOptions() {
    if (!els.exportOptionsList) return;
    els.exportOptionsList.textContent = "";
    renderExportOptions.downloadAction = null;
    if (els.exportDownloadBtn) els.exportDownloadBtn.disabled = true;
    const dateStr = getExportDateString();

    const lc = (searchQuery || "").toLowerCase().trim();
    const queryLabel = (searchQuery || "").trim().length > 64 ? searchQuery.trim().slice(0, 64) + "…" : (searchQuery || "").trim();
    const isFiltered = currentFilter !== "all" || lc.length > 0;

    // 1. Contextual Option (Visible when a filter or search is active)
    if (isFiltered) {
      const visibleEntries = findCourseMatches(courses, searchQuery).filter(([code]) => {
        const inCatalog = !!bundledCourses[code] || !!remoteCourses[code];
        const inUser = !!userCourses[code];
        const origin = !inCatalog && inUser ? "user" : inCatalog && inUser ? "edited" : "official";
        if (currentFilter === "enrolled") return enrolledCourses.includes(code);
        return currentFilter === "all" || currentFilter === origin;
      });

      let filterLabel = "";
      if (currentFilter === "user") filterLabel = "Custom";
      else if (currentFilter === "edited") filterLabel = "Edited";
      else if (currentFilter === "official") filterLabel = "Catalog";

      let contextualDesc = "Export only the courses currently matched and visible in your list.";
      let filenamePart = "filtered";

      if (currentFilter !== "all" && lc) {
        contextualDesc = `Matches “${queryLabel}” in ${filterLabel}.`;
        filenamePart = `${currentFilter}-${lc.replace(/[^a-z0-9]/gi, "_").slice(0, 64)}`;
      } else if (lc) {
        contextualDesc = `Matches “${queryLabel}”.`;
        filenamePart = `search-${lc.replace(/[^a-z0-9]/gi, "_").slice(0, 64)}`;
      } else if (currentFilter !== "all") {
        contextualDesc = `${filterLabel} courses in your current filter.`;
        filenamePart = currentFilter;
      }

      const contextualCard = createExportOptionCard({
        value: "view",
        title: "Current results",
        countText: `${visibleEntries.length} course${visibleEntries.length !== 1 ? 's' : ''}`,
        desc: visibleEntries.length ? contextualDesc : "No courses match the current search and filter.",
        isDisabled: visibleEntries.length === 0,
        onClick: () => {
          const payload = {};
          for (const [code, data] of visibleEntries) {
            payload[code] = formatCourseForExport(data);
          }
          return downloadJsonFile(`uiu-courses-${filenamePart}-${dateStr}.json`, payload);
        }
      });
      els.exportOptionsList.appendChild(contextualCard);
    }

    // 2. Active Catalog (All Courses)
    const allEntries = Object.entries(courses).sort((a, b) => a[0].localeCompare(b[0]));
    const allCard = createExportOptionCard({
      value: "catalog",
      title: "Full catalog",
      countText: `${allEntries.length} course${allEntries.length !== 1 ? 's' : ''}`,
      desc: "All active courses, including your changes. Excludes Trash.",
      isDisabled: allEntries.length === 0,
      onClick: () => {
        const payload = {};
        for (const [code, data] of allEntries) {
          payload[code] = formatCourseForExport(data);
        }
        return downloadJsonFile(`uiu-courses-catalog-${dateStr}.json`, payload);
      }
    });
    els.exportOptionsList.appendChild(allCard);

    // 3. Custom Additions & Edits
    const customEntries = Object.entries(userCourses)
      .filter(([code]) => !softDeletedCourses.includes(code) && !hardDeletedCourses.includes(code))
      .sort((a, b) => a[0].localeCompare(b[0]));
    const customCard = createExportOptionCard({
      value: "custom",
      title: "My additions & edits",
      countText: `${customEntries.length} course${customEntries.length !== 1 ? 's' : ''}`,
      desc: customEntries.length > 0
        ? "Courses you added or changed on this device."
        : "No additions or edits to export yet.",
      isDisabled: customEntries.length === 0,
      onClick: () => {
        const payload = {};
        for (const [code, data] of customEntries) {
          const finalData = courses[code] || data;
          payload[code] = formatCourseForExport(finalData);
        }
        return downloadJsonFile(`uiu-custom-courses-${dateStr}.json`, payload);
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
        return downloadJsonFile(`uiu-custom-courses-${dateStr}.json`, payload);

      } else {
        openExportModal();
        showToast("No custom courses or edits to export.", "info");
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
    if (modalEl === els.confirmModal && modalEl.getAttribute?.("data-tone") === "danger") initialFocusEl = els.modalCancelBtn;
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

  function openContributionModal() {
    openModalSafely(els.contributionModal, els.contribReportIssueBtn);
  }

  function closeContributionModal() {
    closeModalSafely(els.contributionModal);
  }

  function openExportModal(event) {
    const opener = event?.currentTarget || document.activeElement;
    renderExportOptions();
    openModalSafely(els.exportModal, els.exportOptionsList?.querySelector("input:checked") || els.exportModalCloseBtn);
    if (opener && opener !== document.body && typeof opener.focus === "function") lastFocusedElementBeforeModal = opener;
  }

  function closeExportModal() {
    closeModalSafely(els.exportModal);
  }

  let pendingImportDiff = null;
  let pendingCatalogUpdate = null;
  let pendingCatalogReset = null;

  // ── PRE-COMMIT IMPORT DIFF & PREVIEW ──
  function computeImportDiff(parsedData, currentCourses) {
    const toAdd = [];
    const toUpdate = [];
    const unchanged = [];
    const errors = [];

    const seenCodes = new Set();
    for (const [k, v] of Object.entries(parsedData)) {
      const validationError = CourseData.validate(k, v);
      const normalizedCode = CourseData.code(k);
      if (validationError || seenCodes.has(normalizedCode)) {
        errors.push({ code: normalizedCode, reason: validationError || "Duplicate normalized course code" }); continue;
      }
      seenCodes.add(normalizedCode);
      if (typeof k !== "string" || !k.trim()) {
        errors.push({ code: String(k), reason: "Enter a valid course code" });
        continue;
      }
      const code = normalizedCode;

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
          credits: typeof v.credits === "number" ? v.credits : null
        };
      } else {
        errors.push({ code, reason: "Course name missing or course details invalid" });
        continue;
      }

      const existing = Object.hasOwn(currentCourses, code) ? currentCourses[code] : null;
      if (isNameOnly && existing) incoming = normalizeCourseData(mergeCourseEntry(existing, incoming.name));
      else incoming = normalizeCourseData(incoming);
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
          if (normExisting.credits !== (incoming.credits ?? null)) {
            changes.push({ field: "Credits", oldVal: normExisting.credits === null ? "Not listed" : String(normExisting.credits), newVal: incoming.credits == null ? "Not listed" : String(incoming.credits) });
          }
          const oldExam = [normExisting.examDay, normExisting.examSlot].filter(Boolean).join(" / ") || "—";
          const newExam = [incoming.examDay, incoming.examSlot].filter(Boolean).join(" / ") || "—";
          if (oldExam !== newExam) {
            changes.push({ field: "Exam Routine", oldVal: oldExam, newVal: newExam });
          }
          const oldPrereqs = normExisting.prerequisites.join(", ") || "Not listed";
          const newPrereqs = incoming.prerequisites.join(", ") || "Not listed";
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

    const prospective = { ...currentCourses };
    for (const item of [...toAdd, ...toUpdate]) prospective[item.code] = item.incoming;
    const cycle = CourseData.cycle(prospective);
    if (cycle && (toAdd.length || toUpdate.length)) return { toAdd: [], toUpdate: [], unchanged, errors: [...errors, { code: cycle, reason: "Prerequisite cycle detected" }] };
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
        createSummaryPill("pill-new", "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z", diff.toAdd.length + " new")
      );
    }
    if (diff.toUpdate.length > 0) {
      els.previewSummaryRow.appendChild(
        createSummaryPill("pill-update", "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z", diff.toUpdate.length + " changed")
      );
    }
    if (diff.unchanged.length > 0) {
      els.previewSummaryRow.appendChild(
        createSummaryPill("pill-unchanged", "M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z", diff.unchanged.length + " unchanged")
      );
    }
    if (diff.errors.length > 0) {
      els.previewSummaryRow.appendChild(
        createSummaryPill("pill-invalid", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z", diff.errors.length + " skipped")
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
        els.previewConfirmBtn.appendChild(document.createTextNode("Apply changes (" + totalChanges + ")"));
      } else {
        els.previewConfirmBtn.disabled = true;
        els.previewConfirmBtn.appendChild(document.createTextNode("No changes to apply"));
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
      badge.textContent = "Existing course";

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
        oldSpan.textContent = "Current: " + ch.oldVal;

        const arrow = document.createElement("span");
        arrow.className = "diff-arrow-icon";
        arrow.textContent = "\u2192";

        const newSpan = document.createElement("span");
        newSpan.className = "diff-new-val";
        newSpan.textContent = "Imported: " + ch.newVal;

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
      badge.textContent = "New course";

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

    for (const error of diff.errors) {
      const card = document.createElement("div"); card.className = "diff-card";
      const title = document.createElement("strong"); title.textContent = error.code + " — skipped";
      const reason = document.createElement("p"); reason.className = "catalog-review-note"; reason.textContent = error.reason;
      card.appendChild(title); card.appendChild(reason); els.previewDiffList.appendChild(card);
    }

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
      emptyTitle.textContent = diff.errors.length ? "No valid changes to apply" : "No changes to apply";

      const emptySub = document.createElement("div");
      emptySub.className = "preview-empty-sub";
      emptySub.textContent = diff.errors.length ? "Correct the skipped entries and review the file again." : "All " + diff.unchanged.length + " courses in this file already match your catalog.";

      emptyBox.appendChild(checkSvg);
      emptyBox.appendChild(emptyTitle);
      emptyBox.appendChild(emptySub);
      els.previewDiffList.appendChild(emptyBox);
    }
  }

  function openImportPreviewModal(diff) {
    pendingCatalogUpdate = null;
    pendingCatalogReset = null;
    els.importPreviewModal.removeAttribute("data-review");
    pendingImportDiff = diff;
    document.getElementById("previewModalTitle").textContent = "Review import";
    document.getElementById("previewModalDescription").textContent = "Review additions and changes to existing courses.";
    renderImportPreview(diff);
    openModalSafely(els.importPreviewModal, els.previewCancelBtn);
  }

  function closeImportPreviewModal() {
    if (els.previewConfirmBtn?.getAttribute("aria-busy") === "true") return;
    const wasReset = !!pendingCatalogReset;
    pendingCatalogUpdate = null;
    pendingCatalogReset = null;
    pendingImportDiff = null;
    closeModalSafely(els.importPreviewModal);
    if (wasReset) {
      const target = els.resetDefaultsBtn?.disabled ? document.getElementById("resetSettingsTitle") : els.resetDefaultsBtn;
      target?.setAttribute("tabindex", "-1");
      target?.focus({ preventScroll: true });
      if (target === els.resetDefaultsBtn) target.removeAttribute("tabindex");
    }
  }

  function reviewCatalogUpdate(response) {
    const before = {}, after = {};
    for (const code of new Set([...Object.keys(bundledCourses), ...Object.keys(remoteCourses)])) before[code] = getCatalogReportBaseline(code, bundledCourses, remoteCourses);
    for (const code of new Set([...Object.keys(bundledCourses), ...Object.keys(response.catalog)])) after[code] = getCatalogReportBaseline(code, bundledCourses, response.catalog);
    const diff = computeImportDiff(after, before);
    const removed = Object.keys(before).filter(code => !after[code]);
    if (!diff.toAdd.length && !diff.toUpdate.length && !removed.length) {
      showToast("Your catalog is up to date", "success");
      return;
    }
    openImportPreviewModal(diff);
    pendingImportDiff = null;
    pendingCatalogUpdate = response;
    els.previewSummaryRow.querySelector(".pill-unchanged")?.remove();
    if (removed.length) els.previewDiffList.querySelector(".preview-empty-state")?.remove();
    document.getElementById("previewModalTitle").textContent = "Review catalog update";
    document.getElementById("previewModalDescription").textContent = "Review shared catalog changes. Your custom courses and local edits stay saved.";
    els.previewConfirmBtn.disabled = false;
    els.previewConfirmBtn.textContent = "Apply update";
    for (const card of els.previewDiffList.querySelectorAll(".diff-card")) {
      const code = card.querySelector(".diff-card-code")?.textContent;
      if (code && userCourses[code]) {
        const note = document.createElement("p"); note.className = "catalog-review-note";
        note.textContent = "Your local edits will remain in use."; card.appendChild(note);
      }
    }
    if (removed.length) {
      const pill = document.createElement("span"); pill.className = "summary-pill pill-invalid";
      pill.textContent = removed.length + " removed"; els.previewSummaryRow.appendChild(pill);
      for (const code of removed) {
        const card = document.createElement("div"); card.className = "diff-card";
        const title = document.createElement("strong"); title.textContent = code;
        const note = document.createElement("p"); note.className = "catalog-review-note";
        note.textContent = normalizeCourseData(before[code]).name + (userCourses[code] ? " — removed from the shared catalog; your local course stays saved." : " — removed from the shared catalog.");
        card.appendChild(title); card.appendChild(note); els.previewDiffList.appendChild(card);
      }
    }
  }

  function buildCatalogResetPlan(bundled, remote, user, soft, hard) {
    const baseline = {}, current = {};
    const catalogCodes = new Set([...Object.keys(bundled), ...Object.keys(remote)]);
    for (const code of catalogCodes) {
      baseline[code] = getCatalogReportBaseline(code, bundled, remote);
      current[code] = mergeCourseEntry(baseline[code], user[code]);
    }
    const diff = computeImportDiff(baseline, current);
    const restoredCodes = [...new Set([...soft, ...hard])].filter(code => catalogCodes.has(code)).sort();
    const revertedCodes = diff.toUpdate.map(item => item.code).sort();
    const affected = [...new Set([...restoredCodes, ...revertedCodes])];
    const nextUser = { ...user };
    for (const code of affected) delete nextUser[code];
    return { diff, restoredCodes, revertedCodes, count: affected.length,
      nextUser, nextSoft: soft.filter(code => !catalogCodes.has(code)), nextHard: hard.filter(code => !catalogCodes.has(code)),
      revision: JSON.stringify([bundled, remote, user, soft, hard]) };
  }

  function currentCatalogResetPlan() {
    return buildCatalogResetPlan(bundledCourses, remoteCourses, userCourses, softDeletedCourses, hardDeletedCourses);
  }

  function updateResetAvailability() {
    if (!els.resetDefaultsBtn) return;
    const available = currentCatalogResetPlan().count > 0;
    els.resetDefaultsBtn.disabled = !available;
    els.resetDefaultsBtn.title = available ? "Review courses and edits affected by reset" : "No catalog changes to reset";
    const hint = document.getElementById("resetAvailabilityHint");
    if (hint) hint.hidden = available;
  }

  function reviewCatalogReset() {
    const plan = currentCatalogResetPlan();
    if (!plan.count) { updateResetAvailability(); return; }
    openImportPreviewModal(plan.diff);
    pendingImportDiff = null;
    pendingCatalogReset = plan;
    els.importPreviewModal.setAttribute("data-review", "reset");
    document.getElementById("previewModalTitle").textContent = "Review catalog reset";
    document.getElementById("previewModalDescription").textContent = "Review courses to restore and edits to discard. Custom courses will stay saved.";
    els.previewSummaryRow.textContent = "";
    for (const [count, label] of [[plan.restoredCodes.length, "to restore"], [plan.revertedCodes.length, "with edits to discard"]]) {
      if (!count) continue;
      const pill = document.createElement("span"); pill.className = "summary-pill";
      pill.textContent = count + " " + label; els.previewSummaryRow.appendChild(pill);
    }
    els.previewDiffList.querySelector(".preview-empty-state")?.remove();
    for (const old of els.previewDiffList.querySelectorAll(".diff-old-val")) old.textContent = old.textContent.replace(/^Current: /, "Your details: ");
    for (const next of els.previewDiffList.querySelectorAll(".diff-new-val")) next.textContent = next.textContent.replace(/^Imported: /, "Catalog default: ");
    for (const card of els.previewDiffList.querySelectorAll(".diff-card")) {
      card.querySelector(".diff-badge").textContent = "Discard edits";
      const code = card.querySelector(".diff-card-code").textContent;
      if (plan.restoredCodes.includes(code)) {
        const note = document.createElement("p"); note.className = "catalog-review-note";
        note.textContent = "This course will also return to your catalog."; card.appendChild(note);
      }
    }
    for (const code of plan.restoredCodes.filter(code => !plan.revertedCodes.includes(code))) {
      const card = document.createElement("div"); card.className = "diff-card";
      const title = document.createElement("strong"); title.textContent = code;
      const note = document.createElement("p"); note.className = "catalog-review-note";
      note.textContent = normalizeCourseData(getCatalogReportBaseline(code, bundledCourses, remoteCourses)).name + " — restore to catalog.";
      card.appendChild(title); card.appendChild(note); els.previewDiffList.appendChild(card);
    }
    els.previewConfirmBtn.disabled = false;
    els.previewConfirmBtn.textContent = "Reset changes";
    els.previewCancelBtn.focus();
  }

  async function applyCatalogReset() {
    const plan = pendingCatalogReset;
    if (!plan || els.previewConfirmBtn.disabled) return;
    els.previewConfirmBtn.disabled = true;
    els.previewConfirmBtn.setAttribute("aria-busy", "true");
    els.previewConfirmBtn.textContent = "Resetting…";
    try {
      await reloadLocalCoursesState();
      if (currentCatalogResetPlan().revision !== plan.revision) throw new Error("Catalog changed since review. Review the reset again.");
      await chrome.storage.local.set({ userCourses: plan.nextUser, softDeletedCourses: plan.nextSoft, hardDeletedCourses: plan.nextHard });
      await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
      await reloadLocalCoursesState();
      renderResetResult({ totalChanges: plan.count, restoredCodes: plan.restoredCodes, revertedCodes: plan.revertedCodes, timestamp: Date.now() });
      els.previewConfirmBtn.removeAttribute("aria-busy");
      closeImportPreviewModal();
      showToast("Catalog changes reset", "success");
    } catch (error) {
      showToast(error.message === "Catalog changed since review. Review the reset again." ? error.message : "Could not reset catalog changes. Try again.", "error");
    } finally {
      els.previewConfirmBtn.disabled = false;
      els.previewConfirmBtn.removeAttribute("aria-busy");
      els.previewConfirmBtn.textContent = "Reset changes";
      updateResetAvailability();
    }
  }

  async function applyCatalogUpdate() {
    if (!pendingCatalogUpdate || els.previewConfirmBtn.disabled) return;
    els.previewConfirmBtn.disabled = true;
    els.previewConfirmBtn.setAttribute("aria-busy", "true");
    els.previewConfirmBtn.textContent = "Applying…";
    try {
      const response = await chrome.runtime.sendMessage({ type: "APPLY_CATALOG_UPDATE", catalog: pendingCatalogUpdate.catalog, baselineRevision: pendingCatalogUpdate.baselineRevision });
      if (!response?.success) throw new Error(response?.error || "Update failed");
      lastSyncedAt = response.lastSyncedAt;
      lastSyncResult = response.stats;
      await reloadLocalCoursesState();
      renderSyncResult(lastSyncResult);
      checkSyncReminder();
      pendingCatalogUpdate = null;
      els.previewConfirmBtn.removeAttribute("aria-busy");
      closeImportPreviewModal();
      showToast("Catalog update applied", "success");
    } catch (error) {
      showToast(error.message === "Catalog changed since review. Check for updates again." ? error.message : "Could not apply the update. Try again.", "error");
    } finally {
      els.previewConfirmBtn.removeAttribute("aria-busy");
      els.previewConfirmBtn.disabled = false;
      els.previewConfirmBtn.textContent = pendingCatalogUpdate ? "Apply update" : "Apply changes";
    }
  }

  async function executeCommitImportDiff(diff) {
    if (!diff) return;

    const nextCourses = { ...courses }, nextUser = { ...userCourses };
    let nextSoft = softDeletedCourses.slice(), nextHard = hardDeletedCourses.slice();
    let addedCount = 0;
    let updatedCount = 0;
    let nameOnlyCount = 0;

    for (const item of diff.toAdd) {
      const key = item.code;
      const val = item.incoming;

      if (nextSoft.includes(key)) {
        nextSoft = nextSoft.filter(c => c !== key);
      }
      if (nextHard.includes(key)) {
        nextHard = nextHard.filter(c => c !== key);
      }
      nextCourses[key] = val;
      nextUser[key] = val;
      addedCount++;
      if (item.isNameOnly) nameOnlyCount++;
    }

    for (const item of diff.toUpdate) {
      const key = item.code;
      const val = item.incoming;

      if (nextSoft.includes(key)) {
        nextSoft = nextSoft.filter(c => c !== key);
      }
      if (nextHard.includes(key)) {
        nextHard = nextHard.filter(c => c !== key);
      }
      nextCourses[key] = val;
      nextUser[key] = val;
      updatedCount++;
      if (item.isNameOnly) nameOnlyCount++;
    }

    await chrome.storage.local.set({ courses: nextCourses, userCourses: nextUser, softDeletedCourses: nextSoft, hardDeletedCourses: nextHard });
    courses = nextCourses; userCourses = nextUser; softDeletedCourses = nextSoft; hardDeletedCourses = nextHard;

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
    showToast(`Import complete: ${totalMerged} course${totalMerged !== 1 ? 's' : ''}`, "success");
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
      statusPill.appendChild(document.createTextNode("Invalid JSON"));
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
        showImportMsg("info", "File removed. Choose another JSON file to import.");
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
            const parsed = CourseData.parse(els.jsonInput.value);
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
          const parsed = CourseData.parse(content);
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
            showImportMsg("error", "The JSON file must list course codes with their course details. Check the sample format.");
          }
        } catch (err) {
          parseError = true;
          showDropZoneFileInfo(file.name, file.size, 0, true);
          showImportMsg("error", "Could not import this file. Check its JSON format against the sample and try again.");
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
    const query = String(filter).trim();
    const entries = softDeletedCourses.map(code => ({ code, data: getSoftDeletedCourseData(code) }))
      .filter(({ code, data }) => Number.isFinite(courseSearchRank(code, data, query)))
      .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
    updateTrashIndicator(softDeletedCourses.length);
    if (els.courseTableCard) els.courseTableCard.classList.add("trash-mode");
    if (els.courseListHeader) els.courseListHeader.style.display = "none";
    if (els.trashActionsRow) els.trashActionsRow.style.display = softDeletedCourses.length && !query ? "flex" : "none";
    const notice = document.getElementById("trashNotice");
    if (notice) notice.style.display = entries.length && !query ? "block" : "none";
    if (els.coursesPanelCount) els.coursesPanelCount.textContent = query
      ? entries.length + (entries.length === 1 ? " match" : " matches") + " · " + softDeletedCourses.length + " in Trash"
      : softDeletedCourses.length + (softDeletedCourses.length === 1 ? " course available to restore" : " courses available to restore");
    if (els.courseSearch) {
      els.courseSearch.placeholder = "Search Trash by code or name…";
      els.courseSearch.setAttribute("aria-label", "Search Trash by course code or name");
    }
    if (els.backBtn) { els.backBtn.title = "Back to course catalog"; els.backBtn.setAttribute("aria-label", "Back to course catalog"); }
    const icon = type => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute("fill", "none"); svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-width", "1.8"); svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round"); svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", type === "restore" ? "M3 10a9 9 0 1 1 2 8M3 4v6h6"
        : type === "search" ? "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0"
        : "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7");
      svg.appendChild(path); return svg;
    };
    els.courseList.textContent = "";
    if (!entries.length) {
      const empty = document.createElement("div"); empty.className = "empty-state trash-empty-state";
      const image = document.createElement("div"); image.className = "trash-empty-icon"; image.appendChild(icon(query ? "search" : "delete"));
      const title = document.createElement("div"); title.className = "empty-title"; title.textContent = query ? "No matching courses" : "Trash is empty";
      const description = document.createElement("div"); description.className = "empty-subtitle";
      description.textContent = query ? "Try another course code or name, or clear your search."
        : "Courses moved to Trash stay here until you restore or permanently delete them.";
      empty.appendChild(image); empty.appendChild(title); empty.appendChild(description);
      if (query) {
        const clear = document.createElement("button"); clear.type = "button"; clear.className = "empty-clear-btn"; clear.textContent = "Clear search";
        clear.addEventListener("click", () => {
          searchQuery = ""; els.courseSearch.value = "";
          if (els.searchClearBtn) els.searchClearBtn.style.display = "none";
          renderTrashList(); els.courseSearch.focus();
        }); empty.appendChild(clear);
      }
      els.courseList.appendChild(empty); return;
    }
    const fragment = document.createDocumentFragment();
    entries.forEach(({ code, data }) => {
      const name = typeof data === "object" && data !== null ? data.name || "Course name not listed" : data || "Course name not listed";
      const row = document.createElement("article"); row.className = "trash-course-card";
      const header = document.createElement("div"); header.className = "trash-course-heading";
      const codeEl = document.createElement("span"); codeEl.className = "trash-course-code"; codeEl.textContent = code;
      const origin = getCourseOrigin(code);
      const badge = document.createElement("span"); badge.className = "origin-badge " + origin.class; badge.textContent = origin.label;
      header.appendChild(codeEl); header.appendChild(badge);
      const nameEl = document.createElement("p"); nameEl.className = "trash-course-name"; nameEl.textContent = name;
      const actions = document.createElement("div"); actions.className = "trash-course-actions";
      const restore = document.createElement("button"); restore.type = "button"; restore.className = "trash-restore-button";
      restore.appendChild(icon("restore")); restore.appendChild(document.createTextNode("Restore"));
      restore.setAttribute("aria-label", "Restore " + code + " — " + name + " to the catalog");
      restore.addEventListener("click", async () => {
        restore.disabled = true;
        try { await restoreCourseFromTrash(code); }
        catch (_) { restore.disabled = false; showToast("Could not restore this course. Try again.", "error"); }
      });
      const remove = document.createElement("button"); remove.type = "button"; remove.className = "trash-delete-button";
      remove.appendChild(icon("delete")); remove.appendChild(document.createTextNode("Delete permanently"));
      remove.setAttribute("aria-label", "Permanently delete " + code + " — " + name);
      remove.addEventListener("click", () => {
        pendingAction = "perm-delete"; pendingTarget = code;
        setModalText("Permanently delete " + code + "?", name + " will be removed from your catalog and Trash. You cannot undo this action.");
        openModalSafely(els.confirmModal, els.modalConfirmBtn);
      });
      actions.appendChild(restore); actions.appendChild(remove);
      row.appendChild(header); row.appendChild(nameEl); row.appendChild(actions); fragment.appendChild(row);
    });
    els.courseList.appendChild(fragment);
  }

  function courseSearchRank(code, data, query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return 0;
    const compactQuery = q.replace(/\s+/g, "");
    const compactCode = String(code).toLowerCase().replace(/\s+/g, "");
    const name = typeof data === "object" && data !== null ? (data.name || "") : (data || "");
    if (compactCode === compactQuery) return 0;
    if (compactCode.startsWith(compactQuery)) return 1;
    if (compactCode.includes(compactQuery)) return 2;
    return String(name).toLowerCase().includes(q) ? 3 : Infinity;
  }

  function findCourseMatches(catalog, query, excludedCodes = []) {
    const excluded = new Set(excludedCodes);
    return Object.entries(catalog).filter(([code, data]) =>
      !excluded.has(code) && Number.isFinite(courseSearchRank(code, data, query))
    ).sort((a, b) => courseSearchRank(a[0], a[1], query) - courseSearchRank(b[0], b[1], query) || a[0].localeCompare(b[0]));
  }

  function appendSearchHighlightedText(element, value, query, compactCode = false) {
    const text = String(value || "");
    const q = String(query || "").trim();
    element.textContent = "";
    const needle = compactCode ? q.replace(/\s+/g, "") : q;
    if (!needle || needle.length > text.length) { element.textContent = text; return; }
    const escape = part => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = compactCode ? Array.from(needle).map(escape).join("\\s*") : escape(needle);
    const matches = text.matchAll(new RegExp(pattern, "gi"));
    let offset = 0;
    for (const match of matches) {
      if (match.index > offset) element.appendChild(document.createTextNode(text.slice(offset, match.index)));
      const mark = document.createElement("mark");
      mark.className = "search-match";
      mark.textContent = match[0];
      element.appendChild(mark);
      offset = match.index + match[0].length;
    }
    element.appendChild(document.createTextNode(text.slice(offset)));
  }

  function announceSearchMatches(message) {
    clearTimeout(announceSearchMatches.timer);
    announceSearchMatches.timer = setTimeout(() => {
      const region = document.getElementById("searchAnnouncements");
      if (region) region.textContent = message;
    }, 250);
  }

  function renderCourseList(filter = "") {
    els.filterBtns?.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.filter === currentFilter)));

    const trashNotice = document.getElementById("trashNotice");
    if (trashNotice) trashNotice.style.display = "none";
    if (els.courseSearch) {
      els.courseSearch.placeholder = "Search by course code or name…";
      els.courseSearch.setAttribute("aria-label", "Search courses by code or name");
    }
    if (els.backBtn) { els.backBtn.title = "Back to home"; els.backBtn.setAttribute("aria-label", "Back to home"); }
    const lc = filter.toLowerCase().trim();
    const entries = findCourseMatches(courses, filter).filter(([code]) => {
      const inCatalog = !!bundledCourses[code] || !!remoteCourses[code];
      const inUser = !!userCourses[code];
      const origin = !inCatalog && inUser ? "user" : inCatalog && inUser ? "edited" : "official";
      if (currentFilter === "enrolled") return enrolledCourses.includes(code);
      return currentFilter === "all" || currentFilter === origin;
    });

    if (els.coursesPanelCount && !isTrashMode) {
      els.coursesPanelCount.textContent = lc ?
        entries.length + (entries.length === 1 ? " matching course" : " matching courses") :
        currentFilter !== "all" ? entries.length + (entries.length === 1 ? " course in this filter" : " courses in this filter") :
        Object.keys(courses).length + " courses available";
      announceSearchMatches(lc ? els.coursesPanelCount.textContent : "");
    }

    if (entries.length === 0) {
      const emptyState = document.createElement("div");
      emptyState.className = "empty-state";

      const emptyIcon = document.createElement("div");
      emptyIcon.className = "empty-icon";

      const titleEl = document.createElement("div");
      titleEl.className = "empty-title";

      const subEl = document.createElement("div");
      subEl.className = "empty-subtitle";

      if (lc) {
        emptyIcon.textContent = "🔍";
        titleEl.textContent = "No matching courses";

        let filterCategory = "";
        if (currentFilter === "enrolled") filterCategory = " in My Courses";
        else if (currentFilter === "user") filterCategory = " in User Added";
        else if (currentFilter === "edited") filterCategory = " in Edited";
        else if (currentFilter === "official") filterCategory = " in Catalog";

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
          titleEl.textContent = "No courses added yet";
          subEl.textContent = "Find a course and add it to My Courses to build your exam routine.";
        } else if (currentFilter === "user") {
          emptyIcon.textContent = "📂";
          titleEl.textContent = "No custom courses";
          subEl.textContent = "You haven't added any custom courses yet. Click \"Add / Import Courses\" below to create one.";
        } else if (currentFilter === "edited") {
          emptyIcon.textContent = "📝";
          titleEl.textContent = "No Edited Courses";
          subEl.textContent = "Catalog courses you customize will appear here.";
        } else if (currentFilter === "official") {
          emptyIcon.textContent = "🏛️";
          titleEl.textContent = "No catalog courses";
          subEl.textContent = "Update the catalog in Settings or import courses to get started.";
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
      appendSearchHighlightedText(codeEl, code, filter, true);
      codeEl.title = code;

      const nameEl = document.createElement("div");
      nameEl.className = "course-row-name";
      appendSearchHighlightedText(nameEl, name, filter);
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
  const roadmapNavigationStack = [];
  let showPrereqNames = false; // Task 2.4 Enhancement: Code/Name toggle preference

  // ── Task 3.3: Course Routine & Markdown (.md) Export Helpers ──────────────

  /**
   * UIU Exam Slot Timing Information
   * T1: 09:00 AM – 11:00 AM
   * T2: 11:30 AM – 01:30 PM
   * T3: 02:00 PM – 03:00 PM
   * @param {string} slot - e.g. "T1", "T2", "T3", "Slot 1"
   * @returns {{ label: string, time: string, start: string, end: string } | null}
   */
  function getExamSlotTiming(slot) {
    if (!slot) return null;
    var s = String(slot).trim().toUpperCase();
    if (s.indexOf("T1") !== -1 || s.indexOf("SLOT 1") !== -1 || s === "1") {
      return {
        label: "T1",
        time: "09:00 AM – 11:00 AM",
        start: "09:00 AM",
        end: "11:00 AM"
      };
    }
    if (s.indexOf("T2") !== -1 || s.indexOf("SLOT 2") !== -1 || s === "2") {
      return {
        label: "T2",
        time: "11:30 AM – 01:30 PM",
        start: "11:30 AM",
        end: "01:30 PM"
      };
    }
    if (s.indexOf("T3") !== -1 || s.indexOf("SLOT 3") !== -1 || s === "3") {
      return {
        label: "T3",
        time: "02:00 PM – 03:00 PM",
        start: "02:00 PM",
        end: "03:00 PM"
      };
    }
    return {
      label: slot,
      time: slot,
      start: "",
      end: ""
    };
  }

  /**
   * Generates a beautifully formatted Markdown (.md) summary of enrolled courses,
   * exam schedule, slot timings, and conflict analysis.
   * @param {string[]} enrolledList - Array of course codes
   * @param {Object} catalog - Merged courses catalog
   * @returns {string} Markdown document content
   */
  function generateRoutineMarkdown(enrolledList, catalog) {
    var now = new Date();
    var pad = function(n) { return n < 10 ? "0" + n : String(n); };
    var dateStr = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
    var timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    var totalCourses = enrolledList.length;
    var totalCredits = computeEnrolledCredits(enrolledList, catalog);
    var clashes = detectExamClashes(enrolledList, catalog);
    var sameDayExams = detectSameDayExams(enrolledList, catalog);

    var clashStatus = "No time conflicts found in the available routine";
    if (clashes.length > 0) {
      clashStatus = clashes.length + " exam time conflict" + (clashes.length > 1 ? "s" : "") + " detected";
    } else if (sameDayExams.length > 0) {
      clashStatus = sameDayExams.length + " day" + (sameDayExams.length > 1 ? "s" : "") + " with multiple exams";
    }

    var lines = [];
    lines.push("# UIU Course Schedule & Exam Routine");
    lines.push("");
    lines.push("> **Generated:** " + dateStr + " at " + timeStr);
    lines.push("> **Summary:** " + totalCourses + " selected course" + (totalCourses !== 1 ? "s" : "") + " • " + summarizeCourseCredits(enrolledList, catalog).label);
    lines.push("> **Exam Status:** " + clashStatus);
    lines.push("> Recheck the latest exam dates and times in UCAM before finalizing your plan. Your selections are saved only on this device. You can remove or replace courses here without changing your UCAM registration.");
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## My courses");
    lines.push("");
    lines.push("| Course Code | Course Title | Credits | Exam Day | Exam Slot | Scheduled Time | Prerequisites |");
    lines.push("|:---|:---|:---:|:---:|:---:|:---|:---|");

    if (totalCourses === 0) {
      lines.push("| — | No courses added | — | — | — | — | — |");
    } else {
      enrolledList.forEach(function(code) {
        var raw = catalog[code];
        var data = normalizeCourseData(raw);
        var title = (data.name || "Course").replace(/\|/g, "\\|");
        var credits = data.credits !== null ? data.credits.toFixed(1) + " Cr" : "Not listed";
        var day = data.examDay || "TBA";
        var slot = data.examSlot || "TBA";
        var lowerDay = day.toLowerCase();

        var timeText = "Pending / TBA";
        if (lowerDay === "in-class") {
          day = "In-Class";
          slot = "N/A";
          timeText = "In-Class Evaluation";
        } else if (data.examSlot) {
          var timing = getExamSlotTiming(data.examSlot);
          timeText = timing && timing.time ? timing.time : data.examSlot;
        }

        var prereqs = (data.prerequisites && data.prerequisites.length > 0)
          ? data.prerequisites.join(", ")
          : "Not listed";

        lines.push("| **" + code + "** | " + title + " | " + credits + " | " + day + " | " + slot + " | " + timeText + " | " + prereqs + " |");
      });
    }

    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## 🕒 UIU Exam Slot Timing Reference");
    lines.push("");
    lines.push("| Slot | Reference time window | Description |");
    lines.push("|:---|:---|:---|");
    lines.push("| **T1** | `09:00 AM – 11:00 AM` | Morning Exam Slot |");
    lines.push("| **T2** | `11:30 AM – 01:30 PM` | Midday Exam Slot |");
    lines.push("| **T3** | `02:00 PM – 03:00 PM` | Afternoon Exam Slot |");
    lines.push("");
    lines.push("---");
    lines.push("");
    lines.push("## ⚠️ Exam Conflict & Schedule Analysis");
    lines.push("");

    if (clashes.length === 0 && sameDayExams.length === 0) {
      lines.push("- **Direct Clashes:** None detected.");
      lines.push("- **Same-Day Exams:** None detected.");
      lines.push("");
      lines.push("No conflicts were found in the available exam routine. Exams with missing times or in-class evaluations are not checked for time conflicts.");
    } else {
      if (clashes.length > 0) {
        lines.push("### ❌ Direct Exam Clashes (Same Day & Same Slot)");
        clashes.forEach(function(c) {
          var timing = getExamSlotTiming(c.slot);
          var timeStr = timing && timing.time ? " (" + timing.time + ")" : "";
          lines.push("- **" + c.day + ", Slot " + c.slot + timeStr + ":** " + c.courses.map(function(code) { return examCourseLabel(code, catalog); }).join("; "));
        });
        lines.push("");
        lines.push("> **Planning suggestion:** Remove or replace conflicting courses in My Courses, then check your plan again.");
        lines.push("");
      }

      if (sameDayExams.length > 0) {
        lines.push("### ⚠️ Multiple Exams on the Same Day");
        sameDayExams.forEach(function(sde) {
          var courseListStr = sde.courses.map(function(c) {
            var timing = getExamSlotTiming(c.slot);
            var t = timing && timing.time ? " (" + c.slot + ": " + timing.time + ")" : (c.slot ? " (" + c.slot + ")" : "");
            return "**" + examCourseLabel(c.code, catalog) + "**" + t;
          }).join(", ");
          lines.push("- **" + sde.day + ":** " + sde.count + " exams scheduled (" + courseListStr + ")");
        });
        lines.push("");
      }
    }

    lines.push("");
    lines.push("---");
    lines.push("*Exported via [UIU Course Code Decoder](https://github.com/litch07/uiu-course-decoder)*");
    lines.push("");

    return lines.join("\n");
  }

  /**
   * Triggers a browser download of the generated Markdown file.
   * @param {string} filename
   * @param {string} content
   */
  function downloadMarkdownFile(filename, content) {
    try {
      var url;
      try {
        var blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
        url = URL.createObjectURL(blob);
      } catch (_) {
        url = "data:text/markdown;charset=utf-8," + encodeURIComponent(content);
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
      return true;
    } catch (e) {
      console.error("Failed to download Markdown file", e);
      showToast("Could not start the download. Try exporting again.", "error");
      return false;
    }
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
    enrolledList = [...new Set(enrolledList)].filter(code => Object.hasOwn(catalog, code));
    var dayMap = Object.create(null);
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
      if (Object.hasOwn(dayMap, d) && dayMap[d].length > 1) {
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
    enrolledList = [...new Set(enrolledList)].filter(code => Object.hasOwn(catalog, code));
    var slotMap = Object.create(null);
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
      if (Object.hasOwn(slotMap, k) && slotMap[k].length > 1) {
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
    enrolledList = [...new Set(enrolledList)];
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
  function summarizeCourseCredits(list, catalog) {
    var missing = list.filter(function(code) { return normalizeCourseData(catalog[code]).credits === null; }).length;
    var total = computeEnrolledCredits(list, catalog);
    return { total: total, missing: missing, label: total.toFixed(1) + (missing ? " known credits · " + missing + " missing" : " credits") };
  }

  function examCourseLabel(code, catalog) {
    var name = normalizeCourseData(catalog[code]).name;
    return name ? name + " (" + code + ")" : code;
  }

  function examSlotLabel(slot) {
    var value = (slot || "").trim();
    if (!value || /^(n\/a|none|tba)$/i.test(value)) return "time not listed";
    var timing = getExamSlotTiming(value);
    return value + (timing && timing.start && timing.time ? " (" + timing.time + ")" : "");
  }

  // Shared wording for course details and enrolled-course cards. A course
  // being inspected is a proposed addition until it is in My Courses.
  function buildCourseExamNotice(code, enrolledList, catalog) {
    var data = normalizeCourseData(catalog[code]);
    var day = (data.examDay || "").trim();
    if (!day || /^(n\/a|none|in-class)$/i.test(day)) return null;
    var slot = (data.examSlot || "").trim();
    var others = Array.from(new Set(enrolledList)).filter(function(other) {
      return other !== code && (normalizeCourseData(catalog[other]).examDay || "").trim().toLowerCase() === day.toLowerCase();
    });
    if (!others.length) return null;
    var conflicts = others.filter(function(other) {
      return slot && !/^(n\/a|none|tba)$/i.test(slot) &&
        (normalizeCourseData(catalog[other]).examSlot || "").trim().toLowerCase() === slot.toLowerCase();
    });
    if (conflicts.length) {
      return { kind: "danger", text: "Exam time conflict on " + day + ", " + examSlotLabel(slot) +
        ". This exam is scheduled at the same time as " + conflicts.map(function(other) {
          return examCourseLabel(other, catalog);
        }).join("; ") + ". Remove or replace conflicting courses in My Courses, then check your plan again." };
    }
    var enrolled = enrolledList.indexOf(code) !== -1;
    return { kind: "warning", text: (enrolled ? "You have " : "Adding this course would give you ") +
      (others.length + 1) + " exams on " + day + ". " + (others.length === 1 ? "Other exam: " : "Other exams: ") +
      others.map(function(other) {
        return examCourseLabel(other, catalog) + " — " + examSlotLabel(normalizeCourseData(catalog[other]).examSlot);
      }).join("; ") + ". " + (enrolled ? "Plan your preparation for this day." : "Review the exam times before adding this course.") };
  }

  function buildHomeExamSummary(clashes, sameDayExams) {
    const compareDays = (a, b) => a.localeCompare(b, undefined, { numeric: true });
    const byDay = new Map();
    clashes.forEach(function(clash) {
      if (!byDay.has(clash.day)) byDay.set(clash.day, new Set());
      byDay.get(clash.day).add(clash.slot);
    });
    const conflictParts = Array.from(byDay).sort((a, b) => compareDays(a[0], b[0])).map(function([day, slots]) {
      return day + " (" + Array.from(slots).sort(compareDays).join(", ") + ")";
    });
    const dailyParts = sameDayExams.slice().sort((a, b) => compareDays(a.day, b.day)).map(function(day) {
      return day.count + " exams on " + day.day;
    });
    function compact(parts, prefix) {
      if (!parts.length) return null;
      return {
        label: prefix + parts.slice(0, 2).join("; ") + (parts.length > 2 ? " · +" + (parts.length - 2) + (parts.length === 3 ? " more day" : " more days") : ""),
        full: prefix + parts.join("; ")
      };
    }
    return {
      conflicts: compact(conflictParts, clashes.length === 1 ? "Time conflict: " : "Time conflicts: "),
      sameDay: compact(dailyParts, "")
    };
  }

  function updateHomeExamBadge(element, summary, kind) {
    if (!element) return;
    element.className = "clash-badge " + kind;
    element.style.display = summary ? "flex" : "none";
    element.textContent = summary ? summary.label : "";
    if (summary) {
      element.title = summary.full + ". Open My courses & exams to review your plan.";
      element.setAttribute("aria-label", summary.full);
    } else {
      element.removeAttribute("title");
      element.removeAttribute("aria-label");
    }
  }

  function updateEnrolledUI() {
    var totalEnrolled = enrolledCourses.length;
    var planningNote = document.getElementById("routinePlanningNote");
    if (planningNote) planningNote.hidden = totalEnrolled === 0;
    var totalCredits = computeEnrolledCredits(enrolledCourses, courses);
    var creditSummary = summarizeCourseCredits(enrolledCourses, courses);
    var clashes = detectExamClashes(enrolledCourses, courses);
    var hasClashes = clashes.length > 0;
    var sameDayExams = detectSameDayExams(enrolledCourses, courses);
    var hasSameDay = sameDayExams.length > 0;

    // 1. View 0 (Home) Button
    if (els.homeEnrolledCard) {
      if (els.homeEnrolledCount) els.homeEnrolledCount.textContent = String(totalEnrolled);
      if (els.homeEnrolledCredits) els.homeEnrolledCredits.textContent = totalEnrolled ? creditSummary.label : "Add courses to plan your exams";
      const homeCountBadge = document.getElementById("homeEnrolledCountBadge");
      if (homeCountBadge) homeCountBadge.style.display = totalEnrolled ? "inline-flex" : "none";
      if (els.homeEnrolledStatusHint) {
        if (totalEnrolled === 0) {
          els.homeEnrolledStatusHint.textContent = "Plan your exams";
        } else {
          els.homeEnrolledStatusHint.textContent = totalEnrolled === 1 ? "1 course selected" : (totalEnrolled + " courses selected");
        }
      }
      const summary = buildHomeExamSummary(totalEnrolled ? clashes : [], totalEnrolled ? sameDayExams : []);
      updateHomeExamBadge(els.homeClashBadge, summary.conflicts, "danger");
      updateHomeExamBadge(els.homeSameDayBadge, summary.sameDay, "warning");
      if (els.homeExamSummary) els.homeExamSummary.style.display = summary.conflicts || summary.sameDay ? "flex" : "none";
    }

    // 2. Dedicated My Courses View Header & Summary
    if (els.myCoursesHeaderSubtitle) {
      els.myCoursesHeaderSubtitle.textContent = totalEnrolled + (totalEnrolled === 1 ? " course · " : " courses · ") + creditSummary.label;
    }
    if (els.enrolledTotalCourses) els.enrolledTotalCourses.textContent = String(totalEnrolled);
    if (els.enrolledTotalCredits) els.enrolledTotalCredits.textContent = creditSummary.label;
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
            els.clashAlertTitle.textContent = "Exam time conflicts";
          }
        } else {
          els.clashAlertBox.className = "clash-alert-box is-warning";
          if (els.clashAlertTitle) {
            els.clashAlertTitle.textContent = "Multiple exams on the same day";
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
            dayLabel.textContent = c.day + " · " + examSlotLabel(c.slot) + ". ";
            itemText.appendChild(dayLabel);

            var coursesSpan = document.createElement("span");
            coursesSpan.textContent = c.courses.map(function(code) { return examCourseLabel(code, courses); }).join("; ") + ". These exams are scheduled at the same time. Remove or replace conflicting courses in My Courses, then check your plan again.";
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
                return examCourseLabel(c.code, courses) + " — " + examSlotLabel(c.slot);
              });
              var item = document.createElement("div");
              item.className = "clash-item warning";

              var bullet = document.createElement("span");
              bullet.className = "clash-item-bullet";
              bullet.textContent = "•";

              var itemText = document.createElement("span");
              itemText.className = "clash-item-text";

              var dayLabel = document.createElement("strong");
              dayLabel.textContent = sd.count + " exams on " + sd.day + ". ";
              itemText.appendChild(dayLabel);

              var coursesSpan = document.createElement("span");
              coursesSpan.textContent = courseSummaries.join("; ") + ". Review the exam times and plan your preparation.";
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
          var credits = normalizeCourseData(cData).credits;
          var examDay = typeof cData === "object" && cData !== null && cData.examDay ? cData.examDay : "";
          var examSlot = typeof cData === "object" && cData !== null && cData.examSlot ? cData.examSlot : "";

          var notice = buildCourseExamNotice(code, enrolledCourses, courses);
          var isCourseClashing = !!notice && notice.kind === "danger";
          var isCourseSameDay = !!notice && notice.kind === "warning";
          var clashDetailsText = notice ? notice.text : "";
          var sameDayDetailsText = clashDetailsText;

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
          crChip.textContent = credits !== null ? credits.toFixed(1) + " Cr" : "Credits not listed";

          codeRow.appendChild(codeDiv);
          codeRow.appendChild(crChip);

          var dropBtn = document.createElement("button");
          dropBtn.type = "button";
          dropBtn.className = "btn-card-drop";
          dropBtn.title = "Remove " + code + " from trimester";
          dropBtn.setAttribute("aria-label", "Remove " + code);

          var dropIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          dropIcon.setAttribute("viewBox", "0 0 24 24");
          var dropPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          dropPath.setAttribute("d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z");
          dropIcon.appendChild(dropPath);

          var dropLabel = document.createElement("span");
          dropLabel.textContent = "Remove";

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
            slotChip.appendChild(calIcon);

            var timing = getExamSlotTiming(examSlot);
            var slotLabel = document.createElement("span");
            slotLabel.className = "routine-slot-label";
            slotLabel.textContent = "Exam: " + (examDay ? examDay : "") + (examDay && examSlot ? " • " : "") + (examSlot ? examSlot : "");
            slotChip.appendChild(slotLabel);

            if (timing && timing.time && timing.time !== examSlot) {
              var timeSpan = document.createElement("span");
              timeSpan.className = "routine-slot-time";
              timeSpan.textContent = "(" + timing.time + ")";
              slotChip.appendChild(timeSpan);
            }
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
            clashMsg.textContent = clashDetailsText;
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
            sameDayMsg.textContent = sameDayDetailsText;
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
          inspectBtn.textContent = "View course details";
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
          els.detailsEnrollBtnText.textContent = isEnrolledInDetails ? "Remove" : "Add";
        }
        els.detailsEnrollBtn.title = isEnrolledInDetails ? "Remove " + currentEditingCode + " from routine" : "Add " + currentEditingCode + " to routine";
      }

      var statusTextEl = document.getElementById("detailEnrollStatusText");
      if (statusTextEl) {
        statusTextEl.textContent = isEnrolledInDetails ? "In My Courses" : "Not in My Courses";
      }
      var hintEl = document.getElementById("detailEnrollHint");
      if (hintEl) {
        hintEl.textContent = isEnrolledInDetails ? "Remove it from your personal planner" : "Add to plan exams and check conflicts";
      }
      var indicatorEl = document.getElementById("detailEnrollIndicator");
      if (indicatorEl) {
        indicatorEl.className = "detail-enroll-indicator " + (isEnrolledInDetails ? "active" : "");
      }

      if (els.detailClashWarning) {
        var inspectedNotice = buildCourseExamNotice(currentEditingCode, enrolledCourses, courses);
        els.detailClashWarning.style.display = inspectedNotice ? "flex" : "none";
        if (inspectedNotice) {
          els.detailClashWarning.className = "detail-clash-warning " +
            (inspectedNotice.kind === "danger" ? "danger" : "is-warning");
          if (els.detailClashText) els.detailClashText.textContent = inspectedNotice.text;
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

    var currentLevel = rootPrereqs.filter(function(c) {
      if (visited.has(c)) return false;
      visited.add(c);
      return true;
    });

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
          if (p && p.toUpperCase() !== "NONE" && !visited.has(p)) {
            visited.add(p);
            nextLevel.push(p);
          }
        }
      }
      currentLevel = nextLevel;
    }
    return { directCodes: directCodes, levels: levels };
  }

  // Topological stages preserve shared dependencies even when a foundation is
  // also a direct prerequisite. Reversing BFS levels cannot guarantee this.
  function buildPrereqStages(rootCode, catalog) {
    var chain = buildPrereqChain(rootCode, catalog);
    var pending = new Set(chain.levels.flatMap(function(level) { return level.codes; }));
    var completed = new Set();
    var stages = [];
    if (!pending.size && chain.directCodes.includes(rootCode)) {
      return [{ codes: [], unresolved: true }];
    }
    while (pending.size) {
      var ready = Array.from(pending).filter(function(code) {
        var data = normalizeCourseData(catalog[code]);
        return (data.prerequisites || []).every(function(p) {
          return !p || p.toUpperCase() === "NONE" || completed.has(p);
        });
      }).sort();
      if (!ready.length) {
        stages.push({ codes: Array.from(pending).sort(), unresolved: true });
        break;
      }
      stages.push({ codes: ready, unresolved: false });
      ready.forEach(function(code) { pending.delete(code); completed.add(code); });
    }
    return stages;
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
    var roadmapSummary = totalChainCodes + (totalChainCodes === 1 ? " prerequisite" : " prerequisites") +
      " · Required by " + unlocks.length + (unlocks.length === 1 ? " course" : " courses");
    if (els.roadmapButtonCounts) els.roadmapButtonCounts.textContent = roadmapSummary;
    if (els.btnOpenPrereqFlow) {
      els.btnOpenPrereqFlow.setAttribute("aria-label", "View course roadmap: " + roadmapSummary);
      els.btnOpenPrereqFlow.title = "View prerequisites and courses that require this course";
    }
    // ── Populate Flow View Header & Hero Card ─────────────────────────────
    if (els.flowCourseCode) els.flowCourseCode.textContent = "Course roadmap";
    var anchorCode = document.getElementById("flowAnchorCode");
    if (anchorCode) anchorCode.textContent = code;
    if (els.flowOriginBadge) {
      var origin = getCourseOrigin(code);
      els.flowOriginBadge.className = "origin-badge " + origin.class;
      els.flowOriginBadge.textContent = origin.label;
      els.flowOriginBadge.setAttribute("aria-label", "Course type: " + origin.label);
    }
    var cData = normalizeCourseData(courses[code]);
    if (els.flowCourseSubtitle) {
      els.flowCourseSubtitle.textContent = code + (cData.name ? " · " + cData.name : "");
    }
    if (els.flowHeroTitle) {
      els.flowHeroTitle.textContent = cData.name || code;
    }
    if (els.flowHeroCredits) {
      var numCr = parseFloat(cData.credits);
      els.flowHeroCredits.textContent = !isNaN(numCr) && numCr > 0 ? numCr.toFixed(1) + " Cr" : "Credits unlisted";
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
      emptyTitle.textContent = normalizeCourseData(courses[code]).prerequisites.some(function(p) { return p.toLowerCase() === "none"; }) ? "No prerequisites" : "Prerequisites not listed";
      emptyState.appendChild(emptyTitle);
      var emptyDesc = document.createElement("span");
      emptyDesc.textContent = "Check any additional enrollment requirements below.";
      emptyState.appendChild(emptyDesc);
      chainBody.appendChild(emptyState);
    } else {
      buildPrereqStages(code, courses).forEach(function(stage, stageIndex) {
        var tier = document.createElement("section");
        tier.className = "roadmap-stage";
        var heading = document.createElement("h3");
        heading.className = "roadmap-stage-title";
        heading.textContent = stage.unresolved ? "Review dependency cycle" :
          "Stage " + (stageIndex + 1) + (stageIndex === 0 ? " · Foundation" : " · Next requirements");
        var stageCount = document.createElement("span");
        stageCount.className = "roadmap-stage-count";
        stageCount.textContent = stage.codes.length + (stage.codes.length === 1 ? " course" : " courses");
        heading.appendChild(stageCount);
        tier.appendChild(heading);
        if (stage.unresolved) {
          var warning = document.createElement("p");
          warning.className = "roadmap-requirements";
          warning.textContent = "A circular requirement prevents ordering these courses. Review their requirements before planning.";
          tier.appendChild(warning);
        }
        stage.codes.forEach(function(prereqCode) {
          var inCatalog = !!courses[prereqCode];
          var pData = inCatalog ? normalizeCourseData(courses[prereqCode]) : null;
          var pName = pData ? (pData.name || "") : "";
          var numCr = pData && pData.credits ? parseFloat(pData.credits) : NaN;
          var pCr = !isNaN(numCr) && numCr > 0 ? numCr.toFixed(1) + " Cr" : "Credits unlisted";

          var card = document.createElement("button");
          card.type = "button";
          card.setAttribute("data-course-code", prereqCode);
          card.className = "unlock-course-card prereq-course-card" + (inCatalog ? "" : " is-missing");
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

          var requirements = document.createElement("span");
          requirements.className = "roadmap-requirements";
          var requiredCodes = pData ? (pData.prerequisites || []).filter(function(p) {
            return p && p.toUpperCase() !== "NONE";
          }) : [];
          requirements.textContent = !inCatalog ? "Not in catalog · requirements unknown" :
            (requiredCodes.length ? "Requires: " + requiredCodes.join(" + ") : "Prerequisites not listed");
          if (chain.directCodes.includes(prereqCode)) requirements.textContent += " · Required for " + code;
          if (pData && pData.prerequisiteNote) requirements.textContent += " · " + pData.prerequisiteNote;
          card.appendChild(requirements);

          if (inCatalog) {
            card.addEventListener("click", (function(c) {
              return function() { openCourseDetails(c, courses[c], "flow"); };
            })(prereqCode));
          } else {
            card.setAttribute("aria-disabled", "true");
          }
          tier.appendChild(card);
        });
        chainBody.appendChild(tier);
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
      termTitle.textContent = "No next courses listed";
      emptyUnlocks.appendChild(termTitle);
      var termDesc = document.createElement("span");
      termDesc.textContent = "No courses in this catalog list this course as a prerequisite.";
      emptyUnlocks.appendChild(termDesc);
      unlocksBody.appendChild(emptyUnlocks);
    } else {
      unlocks.forEach(function(unlockCode) {
        var inCatalog = !!courses[unlockCode];
        var uData = inCatalog ? normalizeCourseData(courses[unlockCode]) : null;
        var uName = uData ? (uData.name || "") : "";
        var numCr = uData && uData.credits ? parseFloat(uData.credits) : NaN;
        var uCr = !isNaN(numCr) && numCr > 0 ? numCr.toFixed(1) + " Cr" : "Credits unlisted";

        var card = document.createElement("button");
        card.type = "button";
        card.setAttribute("data-course-code", unlockCode);
        card.className = "unlock-course-card";
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

        var unlockRequirements = document.createElement("span");
        unlockRequirements.className = "roadmap-requirements";
        unlockRequirements.textContent = "Requires: " + (uData.prerequisites || []).filter(function(p) {
          return p && p.toUpperCase() !== "NONE";
        }).join(" + ");
        if (uData.prerequisiteNote) unlockRequirements.textContent += " · " + uData.prerequisiteNote;
        card.appendChild(unlockRequirements);

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
    var flowBody = els.prereqFlowView.querySelector(".flow-body");
    if (flowBody) flowBody.scrollTop = 0;
  }

  function exitPrereqFlowView() {
    els.viewWrapper.classList.remove("show-flow");
  }

  els.btnOpenPrereqFlow?.addEventListener("click", () => {
    requestDetailsNavigation(() => openPrereqFlowView(currentEditingCode));
  });

  els.flowBackBtn?.addEventListener("click", (e) => {
    e?.preventDefault();
    exitPrereqFlowView();
  });

  els.flowSettingsBtn?.addEventListener("click", () => {
    openSettings("flow");
  });

  // Pure report builder shared by all popup submission paths.
  function buildCourseReport(kind, code = "", course = null, baseline = null) {
    const addition = kind === "addition" || kind === "missing";
    const proposed = kind === "update";
    const record = typeof course === "string" ? { name: course } : (course || {});
    // Keep course text on one Markdown line; do not let user input create sections.
    const clean = value => String(value ?? "").replace(/[\r\n]+/g, " ")
      .replace(/([\\`*_{}\[\]<>|])/g, "\\$1").trim();
    const titleCode = String(code).replace(/[\r\n]+/g, " ").trim();
    const titleName = String(record.name || "").replace(/[\r\n]+/g, " ").trim();
    const prefix = addition ? "Course addition" : "Course correction";
    const title = kind === "missing" ? "[Missing course] Enter course code and name"
      : `[${prefix}] ${titleCode || "Enter course code"}${titleName ? " — " + titleName : ""}`;
    let routine = "Not listed";
    const day = String(record.examDay || "").trim();
    const slot = String(record.examSlot || "").trim();
    if (/^in-class$/i.test(day)) routine = "In-class evaluation";
    else if (day || slot) {
      const dayNumber = day.match(/^(?:day\s*|d)(\d+)$/i);
      routine = [dayNumber ? "Day " + dayNumber[1] : day, slot].filter(Boolean).join(" · ");
    }
    const prereqs = Array.isArray(record.prerequisites) ? record.prerequisites.filter(Boolean) : [];
    const prerequisiteText = prereqs.length ? prereqs.join(", ") : "Not listed";
    const lines = [];
    if (proposed) {
      const asRecord = value => typeof value === "string" ? { name: value } : (value || {});
      const fields = value => {
        const item = asRecord(value);
        const dayText = String(item.examDay || "").trim();
        const dayMatch = dayText.match(/^(?:day\s*|d)?(\d+)$/i);
        const dayValue = dayMatch ? "Day " + Number(dayMatch[1]) : /^in-class$/i.test(dayText) ? "In-class evaluation" : dayText;
        const codes = Array.isArray(item.prerequisites) ? [...new Set(item.prerequisites.map(v => String(v).trim().toUpperCase()).filter(Boolean))].sort() : [];
        const credits = Number(item.credits);
        return [
          ["Course name", String(item.name || "").trim()],
          ["Credits", Number.isFinite(credits) && credits > 0 ? String(credits) : ""],
          ["Exam day", dayValue],
          ["Exam slot", /^in-class$/i.test(dayText) ? "" : String(item.examSlot || "").trim().toUpperCase()],
          ["Prerequisites", codes.length === 1 && codes[0] === "NONE" ? "No prerequisites" : codes.join(", ")],
          ["Prerequisite note", String(item.prerequisiteNote || "").trim()]
        ];
      };
      const before = fields(baseline);
      const after = fields(record);
      const changes = after.filter((field, index) => baseline === null || field[1] !== before[index][1]);
      lines.push("## Course", "", "- **Course code:** " + (clean(code) || "Enter course code"),
        "- **Course name:** " + (clean(record.name) || "Not listed"), "", "## Proposed changes", "");
      if (baseline === null) lines.push("Current catalog details are not available for comparison.", "");
      if (changes.length) {
        lines.push("| Field | Current catalog | Your proposed change |", "| --- | --- | --- |");
        for (const [label, value] of changes) {
          const previous = before.find(field => field[0] === label)[1];
          lines.push("| " + label + " | " + (baseline === null ? "Not available" : clean(previous) || "Not listed")
            + " | " + (clean(value) || "Not listed") + " |");
        }
      } else {
        lines.push("Your saved details already match the current shared catalog. No field changes were found.");
      }
      lines.push("", "## Reason for change", "", "Explain why these changes are needed.");
    } else {
      lines.push("## Course details", "",
        "- **Course code:** " + (clean(code) || "Enter course code"),
        "- **Course name:** " + (clean(record.name) || "Enter course name"),
        "- **Credits:** " + (clean(record.credits) || "Not listed"),
        "- **Exam routine:** " + clean(routine),
        "- **Prerequisites:** " + clean(prerequisiteText));
      if (record.prerequisiteNote) lines.push("- **Prerequisite note:** " + clean(record.prerequisiteNote));
      if (addition) lines.push("- **Department / program:** Enter department or program");
      if (!addition) lines.push("", "## What needs changing?", "", "Describe the incorrect or missing information.",
        "", "## Proposed correction", "", "Enter the correct details, if known.");
    }
    lines.push("", "## Source", "", "Add an official syllabus, routine, or UCAM reference. For exam updates, include the trimester/year and routine date.",
      "", "Remove student IDs and other personal information from any screenshots before attaching them.",
      "", "---", "Prepared with UIU Course Code Decoder for the community-maintained catalog.");
    return { title, body: lines.join("\n"), labels: addition ? "course-addition" : "data-correction" };
  }

  // Resolve the shared catalog before local edits, following storage merge precedence.
  function getCatalogReportBaseline(code, bundled, remote) {
    const base = bundled[code];
    const update = remote[code];
    if (!base && !update) return null;
    const record = typeof base === "string" ? { name: base } : (base || {});
    return typeof update === "string" ? { ...record, name: update }
      : { ...record, ...(update || {}) };
  }

  function openCourseReport(kind, code, course, button) {
    const baseline = kind === "update" ? getCatalogReportBaseline(code, bundledCourses, remoteCourses) : null;
    const report = buildCourseReport(kind, code, course, baseline);
    const url = "https://github.com/litch07/uiu-course-decoder/issues/new?title=" + encodeURIComponent(report.title)
      + "&body=" + encodeURIComponent(report.body) + "&labels=" + encodeURIComponent(report.labels);
    const failed = () => showToast("Could not open GitHub. Try again.", "error");
    try {
      if (typeof chrome !== "undefined" && typeof chrome.tabs?.create === "function") {
        chrome.tabs.create({ url }, () => { if (chrome.runtime.lastError) failed(); });
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch (_) { failed(); return; }
    if (button) {
      const label = button.querySelector("span");
      if (label) {
        const original = label.textContent;
        label.textContent = "Opening GitHub…";
        button.disabled = true;
        setTimeout(() => { label.textContent = original; button.disabled = false; }, 1500);
      }
    }
  }

  function courseReportKind(code) {
    const origin = getCourseOrigin(code);
    return origin.class === "user-added" || origin.class === "user" ? "addition"
      : origin.class === "edited" ? "update" : "correction";
  }

  // Context-aware course reporting action
  function updateDetailReportCard(code, courseData) {
    if (!els.detailReportCard) return;
    const origin = getCourseOrigin(code);
    const isUserAdded = origin.class === "user-added" || origin.class === "user";
    const isEdited = origin.class === "edited";

    const titleEl = document.getElementById("detailReportTitle");
    const subTitleEl = document.getElementById("detailReportSubtitle");
    const reportBtn = els.reportIssueBtn;

    const action = isUserAdded ? "Suggest this course" : isEdited ? "Suggest this update" : "Report a course error";
    els.detailReportCard.classList.toggle("is-user-added", isUserAdded);
    els.detailReportCard.classList.toggle("is-edited", isEdited);
    if (titleEl) titleEl.textContent = action;
    if (subTitleEl) subTitleEl.textContent = isUserAdded ? "Propose adding this course to the shared catalog on GitHub"
      : isEdited ? "Compare catalog details and your changes on GitHub"
      : "Suggest corrections to course or exam details on GitHub";
    if (reportBtn) reportBtn.title = isEdited ? "Open a GitHub draft comparing current catalog details with your saved changes" : action + " — opens a GitHub draft for you to review and submit";
    if (reportBtn) reportBtn.disabled = detailsSaveInProgress() || detailsFormHasChanges();
    if (subTitleEl && reportBtn?.disabled) subTitleEl.textContent = detailsSaveInProgress()
      ? "Your changes are being saved" : "Save your changes before opening a GitHub draft";
  }

  function openCourseDetails(code, courseData, originView = "courses", restoringRoadmap = false) {
    if (originView === "flow" && currentEditingCode && !restoringRoadmap) {
      const flowBody = els.prereqFlowView?.querySelector(".flow-body");
      const detailsBody = document.querySelector(".details-view .body");
      roadmapNavigationStack.push({
        code: currentEditingCode,
        origin: detailsOriginView,
        scrollTop: flowBody?.scrollTop || 0,
        detailsScrollTop: detailsBody?.scrollTop || 0,
        prerequisitesOpen: document.getElementById("prereqChainCard")?.open,
        unlocksOpen: document.getElementById("unlocksCard")?.open,
        focusCode: code
      });
    } else if (!restoringRoadmap && originView !== "flow") {
      roadmapNavigationStack.length = 0;
    }
    detailsOriginView = originView;
    currentEditingCode = code;
    if (els.detailsBackBtn) {
      const parent = roadmapNavigationStack[roadmapNavigationStack.length - 1];
      const label = originView === "flow" && parent ? "Back to " + parent.code + " roadmap" :
        (originView === "mycourses" ? "Back to My Courses" : originView === "settings" ? "Back to Settings" : "Back to Courses");
      els.detailsBackBtn.title = label;
      els.detailsBackBtn.setAttribute("aria-label", label);
    }
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
      badgeEl.setAttribute("aria-label", "Course type: " + origin.label);
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

    els.detailName.style.borderColor = "";

    els.detailDelBtn.disabled = false;
    els.detailDelBtn.title = "";

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
    openCourseDetails.formSnapshot = detailsFormSnapshot();
    updateDetailsSaveState();
  }

  function detailsFormSnapshot() {
    const value = key => String(els[key]?.value || "").trim();
    const credits = value("detailCredits");
    const numericCredits = Number(credits);
    const day = els.detailInClass?.checked ? "In-Class" : value("detailDay");
    const prerequisites = els.detailNoPrereq?.checked ? ["NONE"]
      : [...new Set(value("detailPrereq").split(",").map(code => code.trim().toUpperCase()).filter(Boolean))].sort();
    return JSON.stringify([value("detailName"), day, els.detailInClass?.checked ? "" : value("detailSlot"),
      prerequisites, value("detailPrereqNote"), credits && Number.isFinite(numericCredits) ? String(numericCredits) : credits]);
  }

  function detailsFormHasChanges() {
    return !!openCourseDetails.formSnapshot && detailsFormSnapshot() !== openCourseDetails.formSnapshot;
  }

  function detailsSaveInProgress() {
    return els.detailSaveBtn?.getAttribute("aria-busy") === "true";
  }

  function updateDetailsSaveState() {
    if (!els.detailSaveBtn) return;
    const busy = detailsSaveInProgress();
    const changed = detailsFormHasChanges();
    els.detailSaveBtn.disabled = busy || !changed;
    els.detailSaveBtn.title = busy ? "Saving changes…" : changed ? "Save your changes on this device" : "No changes to save";
    if (currentEditingCode) updateDetailReportCard(currentEditingCode, courses[currentEditingCode]);
    if (els.detailSaveContribGithubBtn) els.detailSaveContribGithubBtn.disabled = busy || changed;
  }

  function requestDetailsNavigation(navigate) {
    if (detailsSaveInProgress()) {
      showToast("Saving changes. Please wait.", "info");
      return;
    }
    if (detailsFormHasChanges()) {
      pendingDetailsNavigation = navigate;
      pendingAction = "discard-changes";
      setModalText("Discard unsaved changes?", "Leave this course without saving your edits? Your saved course details will stay unchanged.");
      if (els.modalCancelBtn) els.modalCancelBtn.textContent = "Keep editing";
      openModalSafely(els.confirmModal, els.modalCancelBtn);
      return;
    }
    navigate();
  }

  function exitCourseDetails() {
    els.viewWrapper.classList.remove("show-details");
    if (detailsOriginView === "settings") {
      els.viewWrapper.classList.add("show-settings");
    } else if (detailsOriginView === "mycourses") {
      els.viewWrapper.classList.add("show-mycourses");
    } else if (detailsOriginView === "flow") {
      const previous = roadmapNavigationStack.pop();
      if (previous && courses[previous.code]) {
        openCourseDetails(previous.code, courses[previous.code], previous.origin, true);
        els.viewWrapper.classList.add("show-flow");
        const prerequisites = document.getElementById("prereqChainCard");
        const unlocks = document.getElementById("unlocksCard");
        if (prerequisites) prerequisites.open = previous.prerequisitesOpen;
        if (unlocks) unlocks.open = previous.unlocksOpen;
        const flowBody = els.prereqFlowView?.querySelector(".flow-body");
        const detailsBody = document.querySelector(".details-view .body");
        if (flowBody) flowBody.scrollTop = previous.scrollTop;
        if (detailsBody) detailsBody.scrollTop = previous.detailsScrollTop;
        const sourceCard = Array.from(els.prereqTreeSection.querySelectorAll("[data-course-code]")).find(function(card) {
          return card.getAttribute("data-course-code") === previous.focusCode;
        });
        sourceCard?.focus({ preventScroll: true });
      } else {
        roadmapNavigationStack.length = 0;
        els.viewWrapper.classList.add("show-courses");
      }
    } else {
      els.viewWrapper.classList.add("show-courses");
    }
  }

  function commitCourseSave(code, newVal, savedSnapshot) {
    return (async () => {
      const catalogData = getCatalogReportBaseline(code, bundledCourses, remoteCourses);
      const nextUserCourses = { ...userCourses };
      if (catalogData && areCourseDataEqual(newVal, catalogData)) delete nextUserCourses[code];
      else nextUserCourses[code] = newVal;
      const nextSoftDeleted = softDeletedCourses.filter(c => c !== code);
      const nextHardDeleted = hardDeletedCourses.filter(c => c !== code);
      await chrome.storage.local.set({ userCourses: nextUserCourses, softDeletedCourses: nextSoftDeleted, hardDeletedCourses: nextHardDeleted });
      userCourses = nextUserCourses;
      softDeletedCourses = nextSoftDeleted;
      hardDeletedCourses = nextHardDeleted;
      // Rebuild using the same merge rules as the background worker.
      let saved = bundledCourses[code];
      if (remoteCourses[code]) saved = mergeCourseEntry(saved, remoteCourses[code]);
      if (userCourses[code]) saved = mergeCourseEntry(saved, userCourses[code]);
      courses[code] = saved;
      try {
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();
      } catch (error) {
        console.warn("Course saved; active-page refresh could not finish", error);
      }
      if (isTrashMode) renderTrashList(searchQuery);
      else renderCourseList(searchQuery);
      if (currentEditingCode === code) {
        const origin = getCourseOrigin(code);
        const badge = document.getElementById("detailsOriginBadge");
        if (badge) { badge.className = "origin-badge " + origin.class; badge.textContent = origin.label; badge.setAttribute("aria-label", "Course type: " + origin.label); }
        if (els.detailsCourseSubtitle) els.detailsCourseSubtitle.textContent = normalizeCourseData(courses[code]).name || code;
        renderPrereqTree(code);
        updateDetailReportCard(code, newVal);
        updateEnrolledUI();
        openCourseDetails.formSnapshot = savedSnapshot || detailsFormSnapshot();
        updateDetailsSaveState();
      }
      showToast("Changes saved on this device", "success");
    })();
  }

  async function restoreCourseFromTrash(code) {
    if (!softDeletedCourses.includes(code)) return;
    const next = softDeletedCourses.filter(c => c !== code);
    await chrome.storage.local.set({ softDeletedCourses: next });
    softDeletedCourses = next;
    await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
    await reloadLocalCoursesState();
    updateCourseCount();
    if (isTrashMode) renderTrashList(searchQuery); else renderCourseList(searchQuery);
    showToast(code + " restored to the catalog", "success");
  }

  async function moveCourseToTrash(code) {
    if (!softDeletedCourses.includes(code)) {
      const next = softDeletedCourses.concat(code);
      await chrome.storage.local.set({ softDeletedCourses: next });
      softDeletedCourses = next;
      await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
      await reloadLocalCoursesState();
    }
    updateCourseCount();
    if (isTrashMode) renderTrashList(searchQuery); else renderCourseList(searchQuery);
    exitCourseDetails();
    showToast(code + " moved to Trash", "info", { label: "Undo", run: () => restoreCourseFromTrash(code) });
  }

  function renderMsgDom(container, type, text) {
    container.setAttribute("role", type === "error" ? "alert" : "status");
    container.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
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
    if (type === "error") return;
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
    if (type === "error") return;
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
      const parsed = CourseData.parse(text);
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

  function showToast(message, type = "info", action = null) {
    let toast = document.getElementById("globalToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "globalToast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      toast.setAttribute("aria-atomic", "true");
      toast.addEventListener("focusin", () => clearTimeout(toast._timeout));
      toast.addEventListener("focusout", () => {
        toast._timeout = setTimeout(() => { toast.style.opacity = "0"; toast.inert = true; toast.style.pointerEvents = "none"; toast.style.transform = "translateX(-50%) translateY(16px)"; }, 4500);
      });
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(16px)";
      document.body.appendChild(toast);
    }

    toast.inert = false;
    toast.setAttribute("data-type", type);
    toast.textContent = "";
    const badgeSpan = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    badgeSpan.setAttribute("class", "toast-icon");
    badgeSpan.setAttribute("viewBox", "0 0 24 24");
    badgeSpan.setAttribute("fill", "none");
    badgeSpan.setAttribute("stroke", "currentColor");
    badgeSpan.setAttribute("stroke-width", "1.8");
    badgeSpan.setAttribute("stroke-linecap", "round");
    badgeSpan.setAttribute("stroke-linejoin", "round");
    badgeSpan.setAttribute("aria-hidden", "true");
    const badgePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    badgePath.setAttribute("d", type === "success" ? "M20 6 9 17l-5-5" : type === "error"
      ? "M12 3 2 21h20L12 3zM12 9v5m0 3h.01" : "M12 8h.01M11 12h1v4m9-4a9 9 0 1 1-18 0 9 9 0 0 1 18 0");
    badgeSpan.appendChild(badgePath);
    toast.appendChild(badgeSpan);
    const msgSpan = document.createElement("span");
    msgSpan.className = "toast-message";
    msgSpan.textContent = message;
    toast.appendChild(msgSpan);
    toast.style.pointerEvents = action ? "auto" : "none";
    if (action) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = action.label;
      button.addEventListener("click", async () => {
        button.disabled = true;
        try { await action.run(); } catch (_) { showToast("Could not restore the course. Open Trash and try again.", "error"); }
      });
      toast.appendChild(button);
    }
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(0)";
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast.inert = true;
      toast.style.pointerEvents = "none";
      toast.style.transform = "translateX(-50%) translateY(16px)";
    }, action ? 9000 : type === "error" ? 6500 : 4500);
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
          showToast(`${code} is no longer in your catalog`, "info");
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
      els.syncResultTitle.textContent = "Catalog is up to date";
      if (desc) {
        desc.style.display = "block";
        desc.textContent = "Your catalog matches the latest downloaded catalog. This does not verify the current exam routine.";
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
      els.syncResultTitle.textContent = "Catalog updated";
      if (desc) {
        desc.style.display = "block";
        desc.textContent = "Changes applied to your local catalog:";
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
        desc.textContent = "No catalog changes to reset.";
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
        desc.textContent = "Catalog courses restored and local changes removed:";
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
    const catalogMenu = document.getElementById("catalogMenu");
    catalogMenu?.addEventListener("click", function(event) {
      if (event.target.closest("button")) {
        catalogMenu.open = false;
        catalogMenu.querySelector("summary")?.focus({ preventScroll: true });
      }
    }, true);
    document.addEventListener("click", function(event) {
      if (catalogMenu?.open && !catalogMenu.contains(event.target)) catalogMenu.open = false;
    });
    // Export Course Catalog modal controls
    els.exportCoursesBtn?.addEventListener("click", openExportModal);
    els.exportModalCloseBtn?.addEventListener("click", closeExportModal);
    els.exportModalCancelBtn?.addEventListener("click", closeExportModal);
    els.exportDownloadBtn?.addEventListener("click", () => {
      if (!renderExportOptions.downloadAction || els.exportDownloadBtn.disabled) return;
      els.exportDownloadBtn.disabled = true;
      try {
        if (renderExportOptions.downloadAction()) {
          closeExportModal();
          triggerExportSuccessFeedback();
        }
      } catch (error) {
        console.error("Could not prepare course export", error);
        showToast("Could not prepare the export. Try again.", "error");
      } finally { els.exportDownloadBtn.disabled = false; }
    });

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
      els.openCoursesBtn?.focus({ preventScroll: true });
    };

    els.welcomeDismissBtn?.addEventListener("click", dismissWelcomeCard);
    els.welcomeActionBtn?.addEventListener("click", dismissWelcomeCard);

    els.contribReportIssueBtn?.addEventListener("click", () => {
      closeContributionModal();
      const code = els.viewWrapper.classList.contains("show-details") ? currentEditingCode : "";
      if (code) els.reportIssueBtn?.click();
      else openCourseReport("correction");
    });
    document.getElementById("contribMissingCourseBtn")?.addEventListener("click", () => {
      closeContributionModal();
      openCourseReport("missing");
    });
    els.exportModal?.addEventListener("click", (e) => {
      if (e.target === els.exportModal) {
        closeExportModal();
      }
    });

    // Task 3.3: Course Routine Markdown (.md) Export Event Listener
    els.exportRoutineMdBtn?.addEventListener("click", () => {
      if (enrolledCourses.length === 0) {
        showToast("Add courses to My Courses before exporting.", "info");
        return;
      }
      var now = new Date();
      var pad = function(n) { return n < 10 ? "0" + n : String(n); };
      var dateStr = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
      var mdContent = generateRoutineMarkdown(enrolledCourses, courses);
      var filename = "uiu-course-routine-" + dateStr + ".md";
      if (downloadMarkdownFile(filename, mdContent)) {
        showToast("Exam routine download started (.md)", "success");
        triggerExportSuccessFeedback(els.exportRoutineMdBtn);
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && catalogMenu?.open) {
        e.preventDefault();
        catalogMenu.open = false;
        catalogMenu.querySelector("summary")?.focus();
        return;
      }
      // Focus trapping inside active modals (Task 3.5)
      if (e.key === "Tab") {
        if (els.confirmModal?.classList.contains("show")) {
          trapModalFocus(els.confirmModal, e);
        } else if (els.exportModal?.classList.contains("show")) {
          trapModalFocus(els.exportModal, e);

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

        } else if (els.confirmModal?.classList.contains("show")) {
          closeModalSafely(els.confirmModal);
          pendingAction = null;
          pendingSaveVal = null;
          pendingDetailsNavigation = null;
          if (els.modalCancelBtn) els.modalCancelBtn.textContent = "Cancel";
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


    // Contextual catalog reporting; opening a draft does not submit it.
    els.reportIssueBtn?.addEventListener("click", () => {
      if (!currentEditingCode) return;
      const kind = courseReportKind(currentEditingCode);
      openCourseReport(kind, currentEditingCode, courses[currentEditingCode]);
    });

    // Panel sliding animations
    els.openCoursesBtn?.addEventListener("click", () => {
      isTrashMode = false;
      els.coursesPanelTitle.textContent = "Course catalog";
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
      setModalText("Clear your course plan?", `Remove ${enrolledCourses.length} course${enrolledCourses.length === 1 ? "" : "s"} from My Courses. You can add them again. Your UCAM registration will not change.`);
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
          announceSearchMatches("");
          if (els.myCoursesSearchClearBtn) els.myCoursesSearchClearBtn.style.display = "none";
          return;
        }

        if (els.myCoursesSearchClearBtn) els.myCoursesSearchClearBtn.style.display = "block";

        const matches = findCourseMatches(courses, query, enrolledCourses);
        const count = matches.length;
        const summary = count === 0 ? "No courses available to add" :
          count + (count === 1 ? " course available to add" : " courses available to add") + (count > 5 ? " · Showing first 5" : "");
        const status = document.createElement("p");
        status.className = "suggestion-results-summary";
        status.textContent = summary;
        els.myCoursesSuggestionsList.appendChild(status);
        announceSearchMatches(summary);
        els.myCoursesSuggestionsList.style.display = "flex";
        if (!count) return;

        matches.slice(0, 5).forEach(([code]) => {
          const cData = courses[code];
          const name = typeof cData === "object" && cData !== null ? (cData.name || "") : (cData || "");
          const credits = normalizeCourseData(cData).credits;
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
          appendSearchHighlightedText(codeSpan, code, query, true);
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
          appendSearchHighlightedText(titleDiv, name, query);
          titleDiv.title = name;

          info.appendChild(codeRow);
          info.appendChild(titleDiv);

          const chipsDiv = document.createElement("div");
          chipsDiv.className = "suggestion-chips";

          const crSpan = document.createElement("span");
          crSpan.className = "course-credit-chip";
          crSpan.style.fontSize = "0.58rem";
          crSpan.textContent = credits !== null ? credits.toFixed(1) + " Cr" : "Credits not listed";
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

    function openSettings(fromView = null, sectionId = null) {
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
      const settingsBody = document.querySelector(".settings-view .body");
      const section = sectionId ? document.getElementById(sectionId) : null;
      if (settingsBody) settingsBody.scrollTop = section ? section.offsetTop - settingsBody.offsetTop : 0;
    }
    els.openSettingsBtn?.addEventListener("click", () => openSettings("home"));
    els.coursesSettingsBtn?.addEventListener("click", () => openSettings("courses"));
    els.importSettingsBtn?.addEventListener("click", () => openSettings("import"));
    els.detailsSettingsBtn?.addEventListener("click", () => requestDetailsNavigation(() => openSettings("details")));
    document.getElementById("homeSyncAlert")?.addEventListener("click", () => openSettings("home", "catalogSettingsCard"));

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
      if (subtitle) subtitle.textContent = "";
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
      if (subtitle) subtitle.textContent = "";
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
        searchQuery = "";
        if (els.courseSearch) els.courseSearch.value = "";
        if (els.searchClearBtn) els.searchClearBtn.style.display = "none";
        els.coursesPanelTitle.textContent = "Trash";
        els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''} available to restore`;
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
        els.coursesPanelTitle.textContent = "Course catalog";
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
        els.coursesPanelTitle.textContent = "Course catalog";
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
      setModalText(`Restore ${count === 1 ? '1 course' : `all ${count} courses`}?`, `${count === 1 ? 'This course will' : 'These courses will'} return to your catalog and become available for decoding.`);
      openModalSafely(els.confirmModal, els.modalConfirmBtn);
    });

    els.emptyTrashBtn?.addEventListener("click", () => {
      if (softDeletedCourses.length === 0) return;
      pendingAction = "empty-trash";
      const count = softDeletedCourses.length;
      setModalText(`Permanently delete ${count === 1 ? '1 course' : `all ${count} courses`}?`, `${count === 1 ? 'This course' : 'These courses'} will be removed from your catalog and Trash. You cannot undo this action.`);
      openModalSafely(els.confirmModal, els.modalConfirmBtn);
    });

    els.detailsBackBtn?.addEventListener("click", () => {
      requestDetailsNavigation(() => exitCourseDetails());
    });

    
    // Post-Save Contribution Prompt Banner Event Listeners
    els.detailSaveContribGithubBtn?.addEventListener("click", () => {
      if (!currentEditingCode) return;
      const kind = courseReportKind(currentEditingCode);
      openCourseReport(kind, currentEditingCode, courses[currentEditingCode], els.detailSaveContribGithubBtn);

    });

    els.detailSaveContribDoneBtn?.addEventListener("click", () => {
      if (els.detailSaveContribPrompt) els.detailSaveContribPrompt.style.display = "none";
      exitCourseDetails();
    });

    els.detailSaveContribClose?.addEventListener("click", () => {
      if (els.detailSaveContribPrompt) els.detailSaveContribPrompt.style.display = "none";
    });

    els.detailSaveBtn?.addEventListener("click", async () => {
      if (!currentEditingCode || detailsSaveInProgress() || !detailsFormHasChanges()) return;

      const newName = els.detailName.value.trim();
      if (!newName) {
        els.detailName.style.borderColor = "var(--danger)";
        els.detailName.setAttribute("aria-invalid", "true");
        els.detailName.focus();
        showToast("Enter a course name before saving.", "error");
        return;
      }

      els.detailName.removeAttribute("aria-invalid");
      if (els.detailCredits && !els.detailCredits.checkValidity()) {
        els.detailCredits.reportValidity();
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
        const parsed = Number(newCreditsRaw);
        if (Number.isFinite(parsed) && parsed > 0) newCredits = parsed;
      }

      const newVal = { name: newName, examDay: newDay, examSlot: newSlot, prerequisites: newPrereqs, prerequisiteNote: newPrereqNote, credits: newCredits };
      const validationError = CourseData.validate(currentEditingCode, newVal);
      if (validationError) { showToast(validationError, "error"); return; }
      if (CourseData.cycle({ ...courses, [currentEditingCode]: newVal })) { showToast("These prerequisites create a cycle.", "error"); return; }
      // If the values do not differ from the course's current state, do not mark as edited
      const currentData = courses[currentEditingCode];
      if (areCourseDataEqual(newVal, currentData)) {
        openCourseDetails.formSnapshot = detailsFormSnapshot();
        updateDetailsSaveState();
        return;
      }

      const savedSnapshot = detailsFormSnapshot();
      els.detailSaveBtn.setAttribute("aria-busy", "true");
      updateDetailsSaveState();
      try { await commitCourseSave(currentEditingCode, newVal, savedSnapshot); }
      catch (error) { console.error("Could not save course", error); showToast("Could not save changes. Your edits are still here. Try again.", "error"); }
      finally { els.detailSaveBtn.removeAttribute("aria-busy"); updateDetailsSaveState(); }
    });

    els.detailDelBtn?.addEventListener("click", async () => {
      if (!currentEditingCode || els.detailDelBtn.disabled) return;

      requestDetailsNavigation(() => moveCourseToTrash(currentEditingCode).catch(() => showToast("Could not move this course to Trash. Try again.", "error")));
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
      closeModalSafely(els.confirmModal);
      pendingAction = null;
      pendingSaveVal = null;
      pendingDetailsNavigation = null;
      if (els.modalCancelBtn) els.modalCancelBtn.textContent = "Cancel";
    });

    els.modalConfirmBtn?.addEventListener("click", async () => {
      closeModalSafely(els.confirmModal);
      if (els.modalCancelBtn) els.modalCancelBtn.textContent = "Cancel";
      if (pendingAction === "discard-changes") {
        const navigate = pendingDetailsNavigation;
        pendingDetailsNavigation = null;
        pendingAction = null;
        openCourseDetails(currentEditingCode, courses[currentEditingCode], detailsOriginView, true);
        if (navigate) navigate();
        return;
      }

      if (pendingAction === "perm-delete" && pendingTarget) {
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
          els.coursesPanelCount.textContent = `${softDeletedCourses.length} course${softDeletedCourses.length !== 1 ? 's' : ''} available to restore`;
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
          els.coursesPanelCount.textContent = `0 courses available to restore`;
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
          els.coursesPanelCount.textContent = `0 courses available to restore`;
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
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
        showToast(count === 1 ? "1 website removed" : count + " websites removed", "info");
      } else if (pendingAction === "clear-enrolled") {
        enrolledCourses = [];
        await chrome.storage.local.set({ enrolledCourses: [] });
        updateEnrolledUI();
        showToast("All courses removed from My Courses", "info");
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
        showImportMsg("success", "2-course sample JSON copied to clipboard. Customize it, then select Review import.");
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

    ["detailName", "detailDay", "detailSlot", "detailPrereq", "detailPrereqNote", "detailCredits", "detailInClass", "detailNoPrereq"].forEach(key => {
      els[key]?.addEventListener("input", updateDetailsSaveState);
      els[key]?.addEventListener("change", updateDetailsSaveState);
    });

    // Reuse the same report format as the course details action.
    els.contribSubmitGithubBtn?.addEventListener("click", () => {
      if (!lastAddedCourseForContrib) return;
      const code = lastAddedCourseForContrib.code;
      openCourseReport(courseReportKind(code), code, courses[code], els.contribSubmitGithubBtn);
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
      const singleCredits = rawCredits ? Number(rawCredits) : null;
      if (rawCredits && (!Number.isFinite(singleCredits) || singleCredits <= 0)) { showSingleCourseMsg("error", "Credits must be a finite positive number."); return; }

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

      const code = CourseData.code(rawCode);
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

      const validationError = CourseData.validate(code, courseObj);
      if (validationError) { showSingleCourseMsg("error", validationError); return; }
      if (CourseData.cycle({ ...courses, [code]: courseObj })) { showSingleCourseMsg("error", "These prerequisites create a cycle."); return; }
      const nextSoft = softDeletedCourses.filter(c => c !== code), nextHard = hardDeletedCourses.filter(c => c !== code);
      const nextUser = { ...userCourses, [code]: courseObj };
      try {
        await chrome.storage.local.set({ userCourses: nextUser, softDeletedCourses: nextSoft, hardDeletedCourses: nextHard });
        userCourses = nextUser; softDeletedCourses = nextSoft; hardDeletedCourses = nextHard;
        courses[code] = courseObj;
        await chrome.runtime.sendMessage({ type: "RELOAD_COURSES" });
        await reloadLocalCoursesState();
        updateCourseCount();

        if (isTrashMode) {
          renderTrashList(searchQuery);
        } else {
          renderCourseList(searchQuery);
        }

        showSingleCourseMsg("success", `${code} added to course database!`);
        showToast(`${code} added to your catalog`, "success");

        const reportKind = courseReportKind(code);
        const contributionTitle = document.getElementById("contribPromptTitle");
        const contributionLabel = els.contribSubmitGithubBtn?.querySelector("span");
        if (contributionTitle) contributionTitle.textContent = reportKind === "addition" ? "Suggest this course for everyone" : "Suggest this update for everyone";
        if (els.contribPromptDesc) els.contribPromptDesc.textContent = reportKind === "addition"
          ? "Saved on this device. You can also suggest it for the shared catalog."
          : "Review your saved changes against the shared catalog in a GitHub draft.";
        if (contributionLabel) contributionLabel.textContent = reportKind === "addition" ? "Open GitHub draft ↗" : "Suggest this update ↗";

        // Setup Community Contribution Action Card
        let examScheduleDesc = "Routine Pending / TBA";
        if (isInClass) {
          examScheduleDesc = "In-Class Assessment / Lab Viva";
        } else if (rawDay && rawSlot) {
          examScheduleDesc = rawDay + " · " + rawSlot;
        } else if (rawDay) {
          examScheduleDesc = rawDay;
        }

        let prereqDesc = "Prerequisites not listed";
        if (hasNoPrereqs) {
          prereqDesc = "No prerequisites";
        } else if (prereqs.length > 0) {
          prereqDesc = prereqs.join(", ");
        }

        lastAddedCourseForContrib = {
          code: code,
          name: rawName,
          credits: singleCredits !== null ? singleCredits.toFixed(1) : "Not listed",
          examSchedule: examScheduleDesc,
          prerequisites: prereqDesc,
          prerequisiteNote: prereqNote || "None"
        };

        // Transition from Form State to Dedicated Success State
        if (els.successCourseCode) els.successCourseCode.textContent = code;
        if (els.successCourseCredits) els.successCourseCredits.textContent = (singleCredits !== null ? singleCredits.toFixed(1) + " Cr" : "Credits not listed");
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
        showImportMsg("error", "This import is larger than 2 MB. Choose a smaller file or split it into smaller imports.");
        return;
      }

      let parsed;
      try {
        parsed = CourseData.parse(raw);
      } catch (e) {
        showImportMsg("error", "Could not read this JSON. Check commas, quotation marks, and brackets against the sample.");
        return;
      }

      if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
        showImportMsg("error", 'List course codes with their details inside { }. Use the sample to check the format.');
        return;
      }

      const diff = computeImportDiff(parsed, courses);

      if (diff.toAdd.length === 0 && diff.toUpdate.length === 0) {
        if (diff.errors.length > 0) {
          showImportMsg("error", `Found ${diff.errors.length} invalid course entr${diff.errors.length === 1 ? "y" : "ies"}. No valid changes detected.`);
        } else if (diff.unchanged.length > 0) {
          showImportMsg("info", `All ${diff.unchanged.length} course${diff.unchanged.length !== 1 ? "s" : ""} already match your catalog.`);
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
      if (pendingCatalogReset) { await applyCatalogReset(); return; }
      if (pendingCatalogUpdate) { await applyCatalogUpdate(); return; }
      if (!pendingImportDiff || els.previewConfirmBtn.disabled) return;
      els.previewConfirmBtn.disabled = true;
      els.previewConfirmBtn.setAttribute("aria-busy", "true");
      try {
        await executeCommitImportDiff(pendingImportDiff);
        els.previewConfirmBtn.removeAttribute("aria-busy");
        closeImportPreviewModal();
      } catch (_) { showToast("Could not save the import. Your catalog is unchanged. Try again.", "error"); }
      finally { els.previewConfirmBtn.disabled = false; els.previewConfirmBtn.removeAttribute("aria-busy"); }
    });;

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
        showToast("Enter a website address, such as ucam.uiu.ac.bd.", "error");
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
        "Remove " + count + " website" + (count !== 1 ? "s" : "") + "?",
        "Remove the selected website" + (count !== 1 ? "s" : "") + " from your enabled list. You can enable " + (count === 1 ? "it" : "them") + " again later."
      );
      openModalSafely(els.confirmModal, els.modalCancelBtn);
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
        let updateFailed = false;
        renderSyncResult(null);
        els.syncBtn.setAttribute("aria-busy", "true");

        els.syncBtn.classList.remove("is-success", "is-error");
        els.syncBtn.classList.add("is-loading");
        syncText.textContent = "Checking…";
        els.syncBtn.disabled = true;
        els.syncTime.textContent = "Fetching latest course data…";

        try {
          const response = await chrome.runtime.sendMessage({ type: "SYNC_COURSES" });
          if (response.success) {
            reviewCatalogUpdate(response);
            els.syncBtn.classList.remove("is-loading");
            els.syncBtn.classList.add("is-success");
            syncText.textContent = "Check complete";
          } else {
            throw new Error(response.error || "Unknown error");
          }
        } catch (err) {
          console.error("Course sync failed:", err);
          updateFailed = true;
          els.syncBtn.classList.remove("is-loading");
          els.syncBtn.classList.add("is-error");
          syncText.textContent = "Update failed";
          els.syncTime.textContent = "Check your connection and try again.";
        } finally {
          setTimeout(() => {
            els.syncBtn.classList.remove("is-loading", "is-success");
            if (!updateFailed) els.syncBtn.classList.remove("is-error");
            syncText.textContent = updateFailed ? "Try again" : "Check for updates";
            els.syncBtn.disabled = false;
            els.syncBtn.removeAttribute("aria-busy");
            checkSyncReminder();
            if (!updateFailed) els.syncTime.textContent = formatTimeAgo(lastSyncedAt);
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

    els.resetDefaultsBtn?.addEventListener("click", async () => {
      try { await reloadLocalCoursesState(); reviewCatalogReset(); }
      catch (_) { showToast("Could not load catalog changes. Try again.", "error"); }
    });;
  }

  init();
})();
