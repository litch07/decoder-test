// background.js — Sets things up when the extension installs and handles the course data

importScripts("course-data.js");

const COURSES_URL = chrome.runtime.getURL("courses.json");

let catalogWrites = Promise.resolve();

function queueCatalogWrite(task) {
  const write = catalogWrites.then(task);
  catalogWrites = write.catch(() => {});
  return write;
}

async function loadAndStoreCourses(mutation, pruneIdenticalOverrides = false) {
  try {
    return await queueCatalogWrite(() => writeCatalog(mutation, pruneIdenticalOverrides));
  } catch (err) {
    console.error("[CourseDecoder] Failed to save catalog:", err);
    return { ok: false };
  }
}

function sameCourseData(a, b) {
  return JSON.stringify(CourseData.normalizeCourseData(a)) === JSON.stringify(CourseData.normalizeCourseData(b)) &&
    CourseData.variantSignature(a) === CourseData.variantSignature(b);
}

// Grabs the default courses and mixes in any custom ones the user added.
// Custom courses overwrite defaults if the codes match.
async function writeCatalog(mutation, pruneIdenticalOverrides) {
  const type = mutation?.type;
  if (type === "UPDATE_COURSE_PLAN") {
    const { enrolledCourses = [] } = await chrome.storage.local.get("enrolledCourses");
    const code = CourseData.code(mutation.code);
    const current = Array.isArray(enrolledCourses) ? [...new Set(enrolledCourses.filter(c => typeof c === "string").map(CourseData.code))] : [];
    const next = mutation.clear ? [] : current.filter(c => c !== code);
    if (!mutation.clear && mutation.enrolled) next.unshift(code);
    await chrome.storage.local.set({ enrolledCourses: next });
    return { ok: true, enrolledCourses: next };
  }
  if (type === "DISMISS_SYNC_RESULT") {
    const { lastSyncResult } = await chrome.storage.local.get("lastSyncResult");
    if (lastSyncResult && JSON.stringify(lastSyncResult) === JSON.stringify(mutation.result)) {
      await chrome.storage.local.remove("lastSyncResult");
    }
    return { ok: true };
  }

  const response = await fetch(COURSES_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const bundled = CourseData.normalizeMap(await response.json());

  // --- MIGRATION: Rename legacy storage keys ---
  const legacyKeys = await chrome.storage.local.get([
    "hiddenCourses", "permanentlyDeletedCourses",
    "softDeletedCourses", "hardDeletedCourses"
  ]);

  let needsMigration = false;
  let updates = {};
  let toRemove = [];

  if (legacyKeys.hiddenCourses !== undefined) {
    const existingSoft = legacyKeys.softDeletedCourses || [];
    updates.softDeletedCourses = [...new Set([...existingSoft, ...legacyKeys.hiddenCourses])];
    toRemove.push("hiddenCourses");
    needsMigration = true;
  }

  if (legacyKeys.permanentlyDeletedCourses !== undefined) {
    const existingHard = legacyKeys.hardDeletedCourses || [];
    updates.hardDeletedCourses = [...new Set([...existingHard, ...legacyKeys.permanentlyDeletedCourses])];
    toRemove.push("permanentlyDeletedCourses");
    needsMigration = true;
  }

  if (needsMigration) {
    await chrome.storage.local.set(updates);
    await chrome.storage.local.remove(toRemove);
  }
  // --- END MIGRATION ---

  const { userCourses, softDeletedCourses, remoteCourses, hardDeletedCourses } = await chrome.storage.local.get(["userCourses", "softDeletedCourses", "remoteCourses", "hardDeletedCourses"]);
  const user = CourseData.normalizeMap(userCourses);
  let softDeleted = [...new Set((softDeletedCourses || []).map(CourseData.code))];
  let hardDeleted = [...new Set((hardDeletedCourses || []).map(CourseData.code))];
  const remote = CourseData.normalizeMap(type === "APPLY_CATALOG_UPDATE" ? mutation.remoteCourses : remoteCourses);
  const updatesToSave = {};
  if (type === "APPLY_CATALOG_UPDATE") {
    Object.assign(updatesToSave, { remoteCourses: remote, lastSyncedAt: mutation.lastSyncedAt, lastSyncResult: mutation.lastSyncResult });
  }

  if (pruneIdenticalOverrides) {
    const official = CourseData.mergeCatalog(bundled, remote);
    for (const [code, override] of Object.entries(user)) {
      const baseline = official[code];
      if (!baseline) continue;
      const entry = CourseData.mergeEntry(baseline, override);
      if (sameCourseData(entry, baseline)) {
        delete user[code];
        updatesToSave.userCourses = user;
      }
    }
  }

  let addedCount = 0;
  let count = 0;
  let editedCode;
  const codes = new Set();
  const current = CourseData.mergeCatalog(bundled, remote, user, softDeleted, hardDeleted);
  if (type === "ADD_COURSES") {
    const { entries, importBatch } = mutation;
    if (!Array.isArray(entries) || !entries.length) return { ok: false };
    for (const { code: rawCode, incoming, isNameOnly } of entries) {
      const code = CourseData.code(rawCode);
      const validationError = CourseData.validate(code, incoming);
      if (validationError || codes.has(code)) {
        return { ok: false, validationError: validationError || "Duplicate normalized course code" };
      }
      codes.add(code);
      if (!Object.hasOwn(current, code)) addedCount++;
      const existing = current[code];
      if (importBatch && isNameOnly && existing) {
        const renamed = CourseData.mergeEntry(existing, incoming.name);
        user[code] = { ...renamed, ...CourseData.normalizeCourseData(renamed) };
      } else {
        user[code] = importBatch ? CourseData.mergeEntry(existing, incoming) : incoming;
      }
    }
    softDeleted = softDeleted.filter(code => !codes.has(CourseData.code(code)));
    hardDeleted = hardDeleted.filter(code => !codes.has(CourseData.code(code)));
  } else if (type === "EDIT_COURSE") {
    editedCode = CourseData.code(mutation.code);
    const validationError = CourseData.validate(editedCode, mutation.incoming);
    if (validationError) return { ok: false, validationError };
    if (!current[editedCode] || !sameCourseData(current[editedCode], mutation.previous)) {
      return { ok: false, validationError: "This course changed since you opened it. Reopen it before saving." };
    }
    const official = CourseData.mergeCatalog(bundled, remote)[editedCode];
    const edited = CourseData.mergeEntry(official, mutation.incoming);
    if (official && sameCourseData(edited, official)) delete user[editedCode];
    else user[editedCode] = edited;
  } else if (type === "UPDATE_TRASH") {
    const { action } = mutation;
    if (!["move", "restore", "delete"].includes(action)) return { ok: false };
    if (action === "move") {
      const code = CourseData.code(mutation.code);
      if (!current[code]) return { ok: true, count: 0 };
      softDeleted.push(code);
      count = 1;
    } else {
      const targets = new Set((mutation.codes || [mutation.code]).map(CourseData.code));
      const selected = softDeleted.filter(code => targets.has(code));
      count = selected.length;
      if (!count) return { ok: true, count };
      softDeleted = softDeleted.filter(code => !targets.has(code));
      if (action === "delete") {
        for (const code of selected) delete user[code];
        hardDeleted = [...new Set([...hardDeleted, ...selected])];
      }
    }
  } else if (type === "RESET_CATALOG") {
    const revision = JSON.stringify([bundled, remote, user, softDeleted, hardDeleted]);
    if (mutation.revision !== revision) {
      return { ok: false, validationError: "Catalog changed since review. Review the reset again." };
    }
    const official = CourseData.mergeCatalog(bundled, remote);
    const restored = [...softDeleted, ...hardDeleted].filter(code => Object.hasOwn(official, code));
    for (const code of [...restored, ...mutation.revertedCodes]) {
      if (Object.hasOwn(official, code)) delete user[code];
    }
    softDeleted = softDeleted.filter(code => !Object.hasOwn(official, code));
    hardDeleted = hardDeleted.filter(code => !Object.hasOwn(official, code));
  }

  const changesCourses = type === "ADD_COURSES" || type === "EDIT_COURSE" || type === "UPDATE_TRASH" || type === "RESET_CATALOG";
  if (changesCourses) Object.assign(updatesToSave, { userCourses: user, softDeletedCourses: softDeleted, hardDeletedCourses: hardDeleted });
  const merged = changesCourses ? CourseData.mergeCatalog(bundled, remote, user, softDeleted, hardDeleted) : current;
  if ((type === "ADD_COURSES" || type === "EDIT_COURSE") && CourseData.cycle(merged)) {
    return { ok: false, validationError: "These prerequisites create a cycle." };
  }
  const diagnostics = CourseData.audit(merged);
  if (type === "ADD_COURSES" && mutation.importBatch) {
    const issueKey = issue => JSON.stringify([issue.type, issue.code, issue.prerequisite, issue.curriculum]);
    const existingIssues = new Set(CourseData.audit(current).map(issueKey));
    const invalid = diagnostics.find(issue => issue.severity === "error" && codes.has(issue.code) && !existingIssues.has(issueKey(issue)));
    if (invalid) return { ok: false, validationError: invalid.message };
  }
  const catalogDiagnostics = [...diagnostics, ...CourseData.overrideIssues(bundled, remote, user)];
  await chrome.storage.local.set({ ...updatesToSave, courses: merged, catalogDiagnostics });
  return { ok: true, addedCount, updatedCount: codes.size - addedCount, count, course: merged[editedCode] };
}

// Fetch the latest courses from the GitHub repo, validate format, and update remoteCourses
async function syncCourses(previewOnly = true, candidate = null, expectedRevision = null) {
  const sync = () => reviewCatalogSync(previewOnly, candidate, expectedRevision);
  return previewOnly ? sync() : queueCatalogWrite(sync);
}

async function reviewCatalogSync(previewOnly, candidate, expectedRevision) {
  try {
    let text;
    if (candidate === null) {
      const response = await fetch("https://raw.githubusercontent.com/litch07/uiu-course-companion/main/courses.json", { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      text = await response.text();
    } else { text = JSON.stringify(candidate); }
    const MAX_SYNC_BYTES = 2 * 1024 * 1024;
    if (new Blob([text]).size > MAX_SYNC_BYTES) {
      throw new Error("Remote catalog too large (exceeds 2 MB safety limit)");
    }
    let data;
    try {
      data = CourseData.parse(text);
    } catch (e) {
      throw new Error("Invalid format: Not valid JSON");
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error("Invalid format: Not a JSON object");
    }

    data = CourseData.validateCatalog(data);

    // Read previous remoteCourses and bundled courses to compute diff
    const { remoteCourses: prevRemote } = await chrome.storage.local.get("remoteCourses");
    const revision = JSON.stringify(prevRemote || {});
    if (!previewOnly && (expectedRevision === null || expectedRevision !== revision)) throw new Error("Catalog changed since review. Check for updates again.");
    let bundled = {};
    try {
      const bRes = await fetch(COURSES_URL);
      if (bRes.ok) bundled = await bRes.json();
    } catch (_) {}

    const prevOfficial = { ...bundled, ...(prevRemote || {}) };

    const addedCodes = [];
    const updatedCodes = [];
    const removedCodes = [];
    const updatedDetails = {};

    // Check for added and updated courses
    for (const code of Object.keys(data)) {
      if (!(code in prevOfficial)) {
        addedCodes.push(code);
      } else {
        const prev = prevOfficial[code];
        const curr = data[code];
        const prevName = typeof prev === "object" && prev !== null ? (prev.name || "") : (prev || "");
        const currName = typeof curr === "object" && curr !== null ? (curr.name || "") : (curr || "");
        const prevDay = typeof prev === "object" && prev !== null ? (prev.examDay || "") : "";
        const currDay = typeof curr === "object" && curr !== null ? (curr.examDay || "") : "";
        const prevSlot = typeof prev === "object" && prev !== null ? (prev.examSlot || "") : "";
        const currSlot = typeof curr === "object" && curr !== null ? (curr.examSlot || "") : "";
        const prevPrereq = (typeof prev === "object" && prev !== null && Array.isArray(prev.prerequisites)) ? prev.prerequisites.slice().sort().join(",") : "";
        const currPrereq = (typeof curr === "object" && curr !== null && Array.isArray(curr.prerequisites)) ? curr.prerequisites.slice().sort().join(",") : "";
        const prevNote = (typeof prev === "object" && prev !== null) ? (prev.prerequisiteNote || "") : "";
        const currNote = (typeof curr === "object" && curr !== null) ? (curr.prerequisiteNote || "") : "";

        const changedFields = [];
        if (Number(prev?.credits || 0) !== Number(curr?.credits || 0)) changedFields.push("Credits");
        if (prevName !== currName) changedFields.push("Title");
        if (prevDay !== currDay || prevSlot !== currSlot) changedFields.push("Exam Schedule");
        if (prevPrereq !== currPrereq || CourseData.variantSignature(prev) !== CourseData.variantSignature(curr)) changedFields.push("Prerequisites");
        if (prevNote !== currNote) changedFields.push("Prerequisite Note");

        if (changedFields.length > 0) {
          updatedCodes.push(code);
          updatedDetails[code] = changedFields;
        }
      }
    }

    // Check for removed courses (were in prevRemote but no longer in data, and not in bundled)
    if (prevRemote && typeof prevRemote === "object") {
      for (const code of Object.keys(prevRemote)) {
        if (!(code in data) && !(code in bundled)) {
          removedCodes.push(code);
        }
      }
    }

    const timestamp = Date.now();
    const lastSyncResult = {
      added: addedCodes.length,
      updated: updatedCodes.length,
      removed: removedCodes.length,
      addedCodes,
      updatedCodes,
      removedCodes,
      updatedDetails,
      total: Object.keys(data).length,
      warnings: CourseData.audit(data).filter(issue => issue.severity === "warning"),
      timestamp
    };

    if (previewOnly) return { success: true, catalog: data, baselineRevision: revision, stats: lastSyncResult };

    await writeCatalog({
      type: "APPLY_CATALOG_UPDATE",
      remoteCourses: data,
      lastSyncedAt: timestamp,
      lastSyncResult
    });
    
    return { success: true, lastSyncedAt: timestamp, stats: lastSyncResult };
  } catch (err) {
    console.warn("[CourseDecoder] Sync failed:", err.message || err);
    return { success: false, error: err.message || "Failed to fetch remote courses" };
  }
}

const DEFAULT_ALLOWED_SITES = [
  "ucam.uiu.ac.bd",
  "elms.uiu.ac.bd",
  "docs.google.com"
];

// Helper to check domain against allowed patterns with wildcard and subdomain support
function isDomainAllowed(host, allowedSites) {
  if (!host) return false;
  const h = host.toLowerCase().trim();
  return (allowedSites || []).some((pattern) => {
    if (!pattern) return false;
    const p = pattern.toLowerCase().trim();
    if (h === p) return true;
    if (p.startsWith("*.")) {
      const baseDomain = p.slice(2);
      if (h === baseDomain || h.endsWith("." + baseDomain)) return true;
    }
    if (h.endsWith("." + p)) return true;
    const re = "^" + p.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
    try {
      return new RegExp(re, "i").test(h);
    } catch (_) {
      return false;
    }
  });
}

chrome.runtime.onInstalled.addListener(async (details) => {
  await loadAndStoreCourses();

  // Set default settings if it's their first time installing
  const existing = await chrome.storage.local.get(["mode", "allowedSites"]);
  if (!existing.mode) await chrome.storage.local.set({ mode: "highlight" });
  if (!existing.allowedSites || existing.allowedSites.length === 0) {
    await chrome.storage.local.set({ allowedSites: DEFAULT_ALLOWED_SITES });
    existing.allowedSites = DEFAULT_ALLOWED_SITES;
  }

  await syncRegisteredContentScripts();

  // Inject content script into any already-permitted tabs
  if (details && (details.reason === "update" || details.reason === "install")) {
    const allowedSites = existing.allowedSites || [];
    if (allowedSites.length > 0) {
      try {
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
          if (!tab.url || !tab.id) continue;
          try {
            const url = new URL(tab.url);
            if (!url.protocol.startsWith("http")) continue;
            if (isDomainAllowed(url.hostname, allowedSites)) {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id, allFrames: true },
                files: ["content.js"]
              }).catch(() => {});
            }
          } catch (_) {}
        }
      } catch (_) {}
    }
  }
});

// Refresh the course list and registered scripts every time Chrome starts
chrome.runtime.onStartup.addListener(async () => {
  await loadAndStoreCourses();
  await syncRegisteredContentScripts();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "RELOAD_COURSES") {
    loadAndStoreCourses(null, message.pruneIdenticalOverrides === true).then(sendResponse);
    return true;
  }
  if (["ADD_COURSES", "EDIT_COURSE", "UPDATE_TRASH", "RESET_CATALOG", "UPDATE_COURSE_PLAN", "DISMISS_SYNC_RESULT"].includes(message.type)) {
    loadAndStoreCourses(message).then(sendResponse);
    return true;
  }
  if (message.type === "APPLY_CATALOG_UPDATE") {
    syncCourses(false, message.catalog, message.baselineRevision).then(sendResponse);
    return true;
  }
  if (message.type === "SYNC_COURSES") {
    syncCourses(true).then(sendResponse);
    return true;
  }
});

// Synchronizes dynamically registered content scripts with user's allowedSites and granted permissions
let contentScriptRegistration = Promise.resolve();
function syncRegisteredContentScripts() {
  // All triggers share one queue; each pass reads the latest saved sites.
  contentScriptRegistration = contentScriptRegistration.then(async () => {
    if (!chrome.scripting || !chrome.scripting.registerContentScripts) return;

    try {
      const { allowedSites = [] } = await chrome.storage.local.get("allowedSites");

      const validMatches = [];
      for (const site of allowedSites) {
        const matchPattern = site.startsWith("*.")
          ? `*://${site}/*`
          : (site.includes("://") ? site : `*://${site}/*`);

        try {
          const hasPerm = await chrome.permissions.contains({ origins: [matchPattern] });
          if (hasPerm) {
            validMatches.push(matchPattern);
          }
        } catch (_) {}
      }

      const registration = {
        id: "cce-dynamic-content-script",
        js: ["content.js"],
        matches: [...new Set(validMatches)].sort(),
        excludeMatches: ["*://*/*.pdf", "*://*/*.svg", "*://*/*.xml"],
        allFrames: true,
        runAt: "document_idle"
      };
      const [current] = await chrome.scripting.getRegisteredContentScripts({ ids: [registration.id] });
      const unchanged = current && Object.entries(registration).every(([key, value]) =>
        Array.isArray(value) ? JSON.stringify([...(current[key] || [])].sort()) === JSON.stringify([...value].sort()) : current[key] === value);
      if (unchanged) return;
      if (current) await chrome.scripting.unregisterContentScripts({ ids: [registration.id] });
      if (registration.matches.length) await chrome.scripting.registerContentScripts([registration]);
    } catch (err) {
      console.warn("[CourseDecoder] Failed to sync registered content scripts:", err);
    }
  });
  return contentScriptRegistration;
}

// Update registered scripts whenever allowedSites changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.allowedSites) {
    syncRegisteredContentScripts();
  }
});

// Also re-sync on permissions added/removed
chrome.permissions.onRemoved?.addListener(() => {
  syncRegisteredContentScripts();
});

// Automatically activate extension when permission for a domain is granted
chrome.permissions.onAdded.addListener(async (permissions) => {
  if (!permissions || !permissions.origins) return;

  const { allowedSites: currentSites = [] } = await chrome.storage.local.get("allowedSites");
  let newSites = [...currentSites];
  let changed = false;

  for (const origin of permissions.origins) {
    const match = origin.match(/:\/\/(?:www\.)?([^\/:]+)/);
    if (match) {
      const host = match[1];
      if (!newSites.includes(host)) {
        newSites.push(host);
        changed = true;
      }
    }
  }

  if (changed) {
    await chrome.storage.local.set({ allowedSites: newSites });
  }

  await syncRegisteredContentScripts();

  // Immediately inject content.js into any matching open tabs so it starts decoding instantly
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.url || !tab.id) continue;
      try {
        const matchesOrigin = permissions.origins.some(origin => {
          const pat = "^" + origin.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
          return new RegExp(pat, "i").test(tab.url);
        });
        if (matchesOrigin) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            files: ["content.js"]
          }).catch(() => {});
        }
      } catch (_) {}
    }
  } catch (_) {}
});

// Automatically inject content.js on page reload or navigation for permitted sites
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete") return;
  if (!tab.url || !tab.url.startsWith("http")) return;

  try {
    const url = new URL(tab.url);
    const { allowedSites = [] } = await chrome.storage.local.get("allowedSites");
    const isAllowed = isDomainAllowed(url.hostname, allowedSites);

    if (isAllowed) {
      let hasPerm = false;
      try {
        hasPerm = await chrome.permissions.contains({ origins: [`*://${url.hostname}/*`] });
      } catch (_) {}
      if (!hasPerm) {
        for (const pattern of allowedSites) {
          if (isDomainAllowed(url.hostname, [pattern])) {
            const originPattern = pattern.startsWith("*.") ? `*://${pattern}/*` : `*://${pattern}/*`;
            try {
              if (await chrome.permissions.contains({ origins: [originPattern] })) {
                hasPerm = true;
                break;
              }
            } catch (_) {}
          }
        }
      }

      if (hasPerm) {
        await chrome.scripting.executeScript({
          target: { tabId: tabId, allFrames: true },
          files: ["content.js"]
        }).catch(() => {});
      }
    }
  } catch (_) {}
});

// Ensure dynamic scripts are synchronized on service worker initialization
syncRegisteredContentScripts().catch(() => {});
