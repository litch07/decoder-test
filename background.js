// background.js — Sets things up when the extension installs and handles the course data

const COURSES_URL = chrome.runtime.getURL("courses.json");

// Helper to defensively merge a single course entry, handling legacy string formats
function mergeCourseEntry(baseValue, overrideValue) {
  let bVal = baseValue || { examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "" };
  // If baseValue itself happens to be a string, normalize it first
  if (typeof bVal === "string") {
    bVal = { examDay: "", examSlot: "", prerequisites: [], prerequisiteNote: "", name: bVal };
  }

  if (overrideValue && typeof overrideValue === "object") {
    return { ...bVal, ...overrideValue };
  } else if (typeof overrideValue === "string") {
    return { ...bVal, name: overrideValue };
  }
  
  return bVal;
}

// Grabs the default courses and mixes in any custom ones the user added.
// Custom courses overwrite defaults if the codes match.
async function loadAndStoreCourses() {
  try {
    const response = await fetch(COURSES_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bundled = await response.json();

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
    const user = userCourses || {};
    const softDeleted = softDeletedCourses || [];
    const remote = remoteCourses || {};
    const hardDeleted = hardDeletedCourses || [];
    
    const merged = { ...bundled };

    // Merge remoteCourses over bundled courses (remote takes precedence)
    for (const code in remote) {
      merged[code] = mergeCourseEntry(merged[code], remote[code]);
    }

    // Merge userCourses over the result (user takes precedence)
    for (const code in user) {
      merged[code] = mergeCourseEntry(merged[code], user[code]);
    }

    // Exclude soft-deleted courses from the merged dictionary
    for (const code of softDeleted) {
      delete merged[code];
    }

    // Exclude permanently deleted courses from the merged dictionary
    for (const code of hardDeleted) {
      delete merged[code];
    }

    await chrome.storage.local.set({ courses: merged });
  } catch (err) {
    console.error("[CourseDecoder] Failed to load courses.json:", err);
  }
}

// Fetch the latest courses from the GitHub repo, validate format, and update remoteCourses
async function syncCourses() {
  try {
    const url = "https://raw.githubusercontent.com/litch07/uiu-course-decoder/main/courses.json";
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const text = await response.text();
    const MAX_SYNC_BYTES = 2 * 1024 * 1024;
    if (new Blob([text]).size > MAX_SYNC_BYTES) {
      throw new Error("Remote catalog too large (exceeds 2 MB safety limit)");
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Invalid format: Not valid JSON");
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error("Invalid format: Not a JSON object");
    }

    // Basic validation of the format: values should be objects containing 'name'
    for (const key of Object.keys(data)) {
      const course = data[key];
      if (typeof course !== 'object' || !course.name) {
        throw new Error("Invalid format: Course missing 'name' or not an object");
      }
    }

    // Read previous remoteCourses and bundled courses to compute diff
    const { remoteCourses: prevRemote } = await chrome.storage.local.get("remoteCourses");
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
        if (prevName !== currName) changedFields.push("Title");
        if (prevDay !== currDay || prevSlot !== currSlot) changedFields.push("Exam Schedule");
        if (prevPrereq !== currPrereq) changedFields.push("Prerequisites");
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
      timestamp
    };

    await chrome.storage.local.set({ 
      remoteCourses: data,
      lastSyncedAt: timestamp,
      lastSyncResult
    });
    
    // Re-run the merge logic so the new remote courses take effect
    await loadAndStoreCourses();
    
    return { success: true, lastSyncedAt: timestamp, stats: lastSyncResult };
  } catch (err) {
    console.warn("[CourseDecoder] Sync failed:", err.message || err);
    return { success: false, error: err.message || "Failed to fetch remote courses" };
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  await loadAndStoreCourses();
  await syncRegisteredContentScripts();

  // Set default settings if it's their first time installing
  const existing = await chrome.storage.local.get(["mode", "allowedSites"]);
  if (!existing.mode)         await chrome.storage.local.set({ mode: "highlight" });
  if (!existing.allowedSites) await chrome.storage.local.set({ allowedSites: [] });

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
            const matchesSite = allowedSites.some(pattern => {
              const re = "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
              return new RegExp(re, "i").test(url.hostname);
            });
            if (matchesSite) {
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

// Refresh the course list every time Chrome starts to ensure we're up to date
chrome.runtime.onStartup.addListener(loadAndStoreCourses);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_COURSE_COUNT") {
    chrome.storage.local.get("courses", ({ courses }) => {
      sendResponse({ count: courses ? Object.keys(courses).length : 0 });
    });
    return true; // Keep channel open for async response
  }
  if (message.type === "RELOAD_COURSES") {
    loadAndStoreCourses().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message.type === "SYNC_COURSES") {
    syncCourses().then(sendResponse);
    return true;
  }
});

// Synchronizes dynamically registered content scripts with user's allowedSites and granted permissions
async function syncRegisteredContentScripts() {
  if (!chrome.scripting || !chrome.scripting.registerContentScripts) return;

  try {
    const { allowedSites = [] } = await chrome.storage.local.get("allowedSites");

    try {
      await chrome.scripting.unregisterContentScripts({ ids: ["cce-dynamic-content-script"] });
    } catch (_) {}

    if (allowedSites.length === 0) return;

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

    if (validMatches.length > 0) {
      await chrome.scripting.registerContentScripts([
        {
          id: "cce-dynamic-content-script",
          js: ["content.js"],
          matches: validMatches,
          excludeMatches: [
            "*://*/*.pdf",
            "*://*/*.svg",
            "*://*/*.xml"
          ],
          allFrames: true,
          runAt: "document_idle"
        }
      ]);
    }
  } catch (err) {
    console.warn("[CourseDecoder] Failed to sync registered content scripts:", err);
  }
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
  if (changeInfo.status !== "loading" && changeInfo.status !== "complete") return;
  if (!tab.url || !tab.url.startsWith("http")) return;

  try {
    const url = new URL(tab.url);
    const { allowedSites = [] } = await chrome.storage.local.get("allowedSites");
    const isAllowed = allowedSites.some(pattern => {
      const re = "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
      return new RegExp(re, "i").test(url.hostname);
    });

    if (isAllowed) {
      const origin = `*://${url.hostname}/*`;
      const hasPerm = await chrome.permissions.contains({ origins: [origin] });
      if (hasPerm) {
        await chrome.scripting.executeScript({
          target: { tabId: tabId, allFrames: true },
          files: ["content.js"]
        }).catch(() => {});
      }
    }
  } catch (_) {}
});