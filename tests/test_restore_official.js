const assert = require("assert");

// Simulating chrome.storage.local
let storageData = {
  courses: {},
  userCourses: {},
  softDeletedCourses: [],
  hardDeletedCourses: [],
  remoteCourses: {}
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
  "CSE 1111": { name: "Structured Programming Language", examDay: "Day 1", examSlot: "A1" },
  "CSE 2222": { name: "Data Structures", examDay: "Day 2", examSlot: "B1" },
  "CSE 3333": { name: "Algorithms", examDay: "Day 3", examSlot: "C1" }
};

let remoteCourses = {
  "CSE 4444": { name: "Artificial Intelligence", examDay: "Day 4", examSlot: "D1" }
};

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

// Background merge logic
async function loadAndStoreCourses() {
  const { userCourses, softDeletedCourses, remoteCourses: rCourses, hardDeletedCourses } =
    await chrome.storage.local.get(["userCourses", "softDeletedCourses", "remoteCourses", "hardDeletedCourses"]);

  const user = userCourses || {};
  const softDeleted = softDeletedCourses || [];
  const remote = rCourses || {};
  const hardDeleted = hardDeletedCourses || [];

  const merged = { ...bundledCourses };

  for (const code in remote) {
    merged[code] = mergeCourseEntry(merged[code], remote[code]);
  }

  for (const code in user) {
    merged[code] = mergeCourseEntry(merged[code], user[code]);
  }

  for (const code of softDeleted) {
    delete merged[code];
  }

  for (const code of hardDeleted) {
    delete merged[code];
  }

  await chrome.storage.local.set({ courses: merged });
}

// Logic under test: Reset Official Courses to Default
async function resetOfficialCoursesToDefault() {
  const { userCourses } = await chrome.storage.local.get(["userCourses"]);
  const cleanedUserCourses = {};
  for (const [code, val] of Object.entries(userCourses || {})) {
    const isOfficial = !!(bundledCourses[code] || remoteCourses[code]);
    if (!isOfficial) {
      cleanedUserCourses[code] = val;
    }
  }
  storageData.softDeletedCourses = [];
  storageData.hardDeletedCourses = [];
  storageData.userCourses = cleanedUserCourses;
  await chrome.storage.local.set({
    userCourses: cleanedUserCourses,
    softDeletedCourses: [],
    hardDeletedCourses: []
  });
  await loadAndStoreCourses();
}

async function runTest() {
  console.log("--- TEST 1: Initial state (all official courses active) ---");
  storageData.remoteCourses = remoteCourses;
  await loadAndStoreCourses();

  assert.ok(storageData.courses["CSE 1111"]);
  assert.ok(storageData.courses["CSE 2222"]);
  assert.ok(storageData.courses["CSE 3333"]);
  assert.ok(storageData.courses["CSE 4444"]);

  console.log("--- TEST 2: Soft-delete CSE 2222, hard-delete CSE 4444, edit official CSE 1111, and add user course ---");
  storageData.softDeletedCourses = ["CSE 2222"];
  storageData.hardDeletedCourses = ["CSE 4444"];
  storageData.userCourses = { 
    "CSE 1111": { name: "Edited User Title", examDay: "Custom Day", examSlot: "Custom Slot" },
    "CUSTOM 101": { name: "My Custom Course", examDay: "Day 5" } 
  };
  await loadAndStoreCourses();

  assert.strictEqual(storageData.courses["CSE 2222"], undefined, "CSE 2222 should be excluded from active");
  assert.strictEqual(storageData.courses["CSE 4444"], undefined, "CSE 4444 should be excluded from active");
  assert.strictEqual(storageData.courses["CSE 1111"].name, "Edited User Title", "CSE 1111 should reflect user edit prior to reset");
  assert.ok(storageData.courses["CUSTOM 101"], "CUSTOM 101 must be active");

  console.log("--- TEST 3: Execute Reset Official Courses to Default ---");
  await resetOfficialCoursesToDefault();

  assert.strictEqual(storageData.softDeletedCourses.length, 0, "softDeletedCourses must be empty");
  assert.strictEqual(storageData.hardDeletedCourses.length, 0, "hardDeletedCourses must be empty");

  // All official courses must be active again
  assert.ok(storageData.courses["CSE 1111"], "CSE 1111 active");
  // Official course edit MUST be overwritten back to bundled default
  assert.strictEqual(storageData.courses["CSE 1111"].name, "Structured Programming Language", "CSE 1111 edit must be overwritten back to default");
  assert.strictEqual(storageData.courses["CSE 1111"].examDay, "Day 1", "CSE 1111 examDay must be restored to default");
  assert.ok(storageData.courses["CSE 2222"], "CSE 2222 restored to active");
  assert.ok(storageData.courses["CSE 3333"], "CSE 3333 active");
  assert.ok(storageData.courses["CSE 4444"], "CSE 4444 restored to active");

  // User course must be preserved
  assert.ok(storageData.courses["CUSTOM 101"], "CUSTOM 101 user-added course must be preserved");
  assert.strictEqual(storageData.courses["CUSTOM 101"].name, "My Custom Course");

  console.log("All reset official courses to default tests passed successfully!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
