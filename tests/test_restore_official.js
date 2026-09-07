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

// Logic under test: getDeletedOfficialCourses
function getDeletedOfficialCourses(softDeleted, hardDeleted) {
  const official = { ...bundledCourses, ...remoteCourses };
  const deleted = [];
  for (const code of Object.keys(official)) {
    const isHard = hardDeleted.includes(code);
    const isSoft = softDeleted.includes(code);
    if (isHard || isSoft) {
      deleted.push({
        code,
        data: official[code],
        status: isHard ? 'hard' : 'soft'
      });
    }
  }
  return deleted.sort((a, b) => a.code.localeCompare(b.code));
}

// Logic under test: executeRestoreSelected
async function executeRestoreSelected(codesToRestore) {
  storageData.softDeletedCourses = storageData.softDeletedCourses.filter(c => !codesToRestore.includes(c));
  storageData.hardDeletedCourses = storageData.hardDeletedCourses.filter(c => !codesToRestore.includes(c));
  await chrome.storage.local.set({
    softDeletedCourses: storageData.softDeletedCourses,
    hardDeletedCourses: storageData.hardDeletedCourses
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
  let deleted = getDeletedOfficialCourses(storageData.softDeletedCourses, storageData.hardDeletedCourses);
  assert.strictEqual(deleted.length, 0, "No official courses should be detected as deleted initially");

  console.log("--- TEST 2: Soft delete CSE 2222 and hard delete CSE 4444 (remote) ---");
  storageData.softDeletedCourses = ["CSE 2222"];
  storageData.hardDeletedCourses = ["CSE 4444"];
  await loadAndStoreCourses();

  assert.strictEqual(storageData.courses["CSE 2222"], undefined, "CSE 2222 should be excluded from active");
  assert.strictEqual(storageData.courses["CSE 4444"], undefined, "CSE 4444 should be excluded from active");

  deleted = getDeletedOfficialCourses(storageData.softDeletedCourses, storageData.hardDeletedCourses);
  assert.strictEqual(deleted.length, 2, "Should detect exactly 2 deleted official courses");
  assert.deepStrictEqual(deleted.map(d => d.code), ["CSE 2222", "CSE 4444"]);
  assert.strictEqual(deleted.find(d => d.code === "CSE 2222").status, "soft", "CSE 2222 should have 'soft' status");
  assert.strictEqual(deleted.find(d => d.code === "CSE 4444").status, "hard", "CSE 4444 should have 'hard' status");

  console.log("--- TEST 3: Selective restore of CSE 4444 only ---");
  await executeRestoreSelected(["CSE 4444"]);

  assert.ok(storageData.courses["CSE 4444"], "CSE 4444 should be restored to active courses");
  assert.strictEqual(storageData.courses["CSE 4444"].name, "Artificial Intelligence");
  assert.strictEqual(storageData.courses["CSE 2222"], undefined, "CSE 2222 should remain deleted");
  assert.strictEqual(storageData.hardDeletedCourses.includes("CSE 4444"), false, "CSE 4444 removed from hardDeletedCourses");
  assert.strictEqual(storageData.softDeletedCourses.includes("CSE 2222"), true, "CSE 2222 remains in softDeletedCourses");

  deleted = getDeletedOfficialCourses(storageData.softDeletedCourses, storageData.hardDeletedCourses);
  assert.strictEqual(deleted.length, 1, "Only 1 deleted official course should remain");
  assert.strictEqual(deleted[0].code, "CSE 2222");

  console.log("--- TEST 4: Restore remaining deleted official course CSE 2222 ---");
  await executeRestoreSelected(["CSE 2222"]);

  assert.ok(storageData.courses["CSE 2222"], "CSE 2222 should now be restored to active courses");
  assert.strictEqual(storageData.courses["CSE 2222"].name, "Data Structures");
  assert.strictEqual(storageData.softDeletedCourses.length, 0, "softDeletedCourses must be empty");
  assert.strictEqual(storageData.hardDeletedCourses.length, 0, "hardDeletedCourses must be empty");

  deleted = getDeletedOfficialCourses(storageData.softDeletedCourses, storageData.hardDeletedCourses);
  assert.strictEqual(deleted.length, 0, "Zero deleted official courses remain");

  console.log("--- TEST 5: Verify all 4 courses are active with correct metadata ---");
  assert.strictEqual(Object.keys(storageData.courses).length, 4);
  assert.strictEqual(storageData.courses["CSE 1111"].examDay, "Day 1");
  assert.strictEqual(storageData.courses["CSE 2222"].examDay, "Day 2");
  assert.strictEqual(storageData.courses["CSE 3333"].examDay, "Day 3");
  assert.strictEqual(storageData.courses["CSE 4444"].examDay, "Day 4");

  console.log("All selective restore official courses tests passed successfully!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
