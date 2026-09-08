const assert = require("assert");

// Simulating chrome.storage.local
let storageData = {
  courses: {},
  remoteCourses: {},
  lastSyncedAt: null,
  lastSyncResult: null
};

const chrome = {
  storage: {
    local: {
      get: async (keys) => {
        const result = {};
        for (const k of keys) result[k] = storageData[k];
        return result;
      },
      set: async (data) => {
        Object.assign(storageData, data);
      }
    }
  }
};

const bundledCourses = {
  "CSE 1111": { name: "Structured Programming", examDay: "Day 1", examSlot: "A1" },
  "CSE 2222": { name: "Data Structures", examDay: "Day 2", examSlot: "B1" }
};

// Pure diff engine logic extracted from syncCourses
function computeSyncDiff(incomingData, prevRemote, bundled) {
  const prevOfficial = { ...bundled, ...(prevRemote || {}) };

  const addedCodes = [];
  const updatedCodes = [];
  const removedCodes = [];
  const updatedDetails = {};

  for (const code of Object.keys(incomingData)) {
    if (!(code in prevOfficial)) {
      addedCodes.push(code);
    } else {
      const prev = prevOfficial[code];
      const curr = incomingData[code];
      const prevName = typeof prev === "object" && prev !== null ? (prev.name || "") : (prev || "");
      const currName = typeof curr === "object" && curr !== null ? (curr.name || "") : (curr || "");
      const prevDay = typeof prev === "object" && prev !== null ? (prev.examDay || "") : "";
      const currDay = typeof curr === "object" && curr !== null ? (curr.examDay || "") : "";
      const prevSlot = typeof prev === "object" && prev !== null ? (prev.examSlot || "") : "";
      const currSlot = typeof curr === "object" && curr !== null ? (curr.examSlot || "") : "";
      const prevPrereq = (typeof prev === "object" && prev !== null && Array.isArray(prev.prerequisites)) ? prev.prerequisites.slice().sort().join(",") : "";
      const currPrereq = (typeof curr === "object" && curr !== null && Array.isArray(curr.prerequisites)) ? curr.prerequisites.slice().sort().join(",") : "";

      const changedFields = [];
      if (prevName !== currName) changedFields.push("Title");
      if (prevDay !== currDay || prevSlot !== currSlot) changedFields.push("Exam Schedule");
      if (prevPrereq !== currPrereq) changedFields.push("Prerequisites");

      if (changedFields.length > 0) {
        updatedCodes.push(code);
        updatedDetails[code] = changedFields;
      }
    }
  }

  if (prevRemote && typeof prevRemote === "object") {
    for (const code of Object.keys(prevRemote)) {
      if (!(code in incomingData) && !(code in bundled)) {
        removedCodes.push(code);
      }
    }
  }

  const timestamp = Date.now();
  return {
    added: addedCodes.length,
    updated: updatedCodes.length,
    removed: removedCodes.length,
    addedCodes,
    updatedCodes,
    removedCodes,
    updatedDetails,
    total: Object.keys(incomingData).length,
    timestamp
  };
}

async function runTests() {
  console.log("--- TEST 1: First sync with new courses ---");
  // User starts with only bundled courses
  const incoming1 = {
    "CSE 1111": { name: "Structured Programming", examDay: "Day 1", examSlot: "A1" },
    "CSE 2222": { name: "Data Structures", examDay: "Day 2", examSlot: "B1" },
    "CSE 3333": { name: "Algorithms", examDay: "Day 3", examSlot: "C1" },
    "CSE 4444": { name: "Operating Systems", examDay: "Day 4", examSlot: "D1" }
  };

  const diff1 = computeSyncDiff(incoming1, {}, bundledCourses);
  assert.strictEqual(diff1.added, 2, "Should detect 2 new added courses");
  assert.deepStrictEqual(diff1.addedCodes.sort(), ["CSE 3333", "CSE 4444"]);
  assert.strictEqual(diff1.updated, 0, "No courses should be updated");
  assert.strictEqual(diff1.removed, 0, "No courses should be removed");

  // Save to storage
  await chrome.storage.local.set({
    remoteCourses: incoming1,
    lastSyncedAt: diff1.timestamp,
    lastSyncResult: diff1
  });

  console.log("--- TEST 2: Sync identical data (Up to date) ---");
  const stored1 = await chrome.storage.local.get(["remoteCourses"]);
  const diff2 = computeSyncDiff(incoming1, stored1.remoteCourses, bundledCourses);
  assert.strictEqual(diff2.added, 0, "Zero added courses when data is identical");
  assert.strictEqual(diff2.updated, 0, "Zero updated courses when data is identical");
  assert.strictEqual(diff2.removed, 0, "Zero removed courses when data is identical");

  console.log("--- TEST 3: Sync with updated course details ---");
  const incoming3 = {
    "CSE 1111": { name: "Structured Programming Language", examDay: "Day 1", examSlot: "A1" }, // Name changed
    "CSE 2222": { name: "Data Structures", examDay: "Day 2", examSlot: "B2" },                  // Slot changed
    "CSE 3333": { name: "Algorithms", examDay: "Day 3", examSlot: "C1", prerequisites: ["CSE 2222"] }, // Prereq changed
    "CSE 4444": { name: "Operating Systems", examDay: "Day 4", examSlot: "D1" }
  };

  const diff3 = computeSyncDiff(incoming3, stored1.remoteCourses, bundledCourses);
  assert.strictEqual(diff3.added, 0, "No new courses added");
  assert.strictEqual(diff3.updated, 3, "3 courses should be detected as updated");
  assert.deepStrictEqual(diff3.updatedCodes.sort(), ["CSE 1111", "CSE 2222", "CSE 3333"]);
  assert.strictEqual(diff3.removed, 0, "No courses removed");
  assert.deepStrictEqual(diff3.updatedDetails["CSE 1111"], ["Title"]);
  assert.deepStrictEqual(diff3.updatedDetails["CSE 2222"], ["Exam Schedule"]);
  assert.deepStrictEqual(diff3.updatedDetails["CSE 3333"], ["Prerequisites"]);

  console.log("--- TEST 4: Sync with a remote course removed ---");
  const incoming4 = {
    "CSE 1111": { name: "Structured Programming", examDay: "Day 1", examSlot: "A1" },
    "CSE 2222": { name: "Data Structures", examDay: "Day 2", examSlot: "B1" },
    "CSE 3333": { name: "Algorithms", examDay: "Day 3", examSlot: "C1" }
    // CSE 4444 was removed upstream
  };

  const diff4 = computeSyncDiff(incoming4, stored1.remoteCourses, bundledCourses);
  assert.strictEqual(diff4.added, 0);
  assert.strictEqual(diff4.updated, 0);
  assert.strictEqual(diff4.removed, 1, "1 remote course should be detected as removed");
  assert.deepStrictEqual(diff4.removedCodes, ["CSE 4444"]);

  console.log("--- TEST 5: Verify storage persistence of lastSyncResult ---");
  await chrome.storage.local.set({
    remoteCourses: incoming3,
    lastSyncedAt: diff3.timestamp,
    lastSyncResult: diff3
  });

  const finalStored = await chrome.storage.local.get(["lastSyncResult", "lastSyncedAt"]);
  assert.ok(finalStored.lastSyncResult);
  assert.strictEqual(finalStored.lastSyncResult.updated, 3);
  assert.strictEqual(finalStored.lastSyncResult.added, 0);

  console.log("All sync diff tests passed successfully!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
