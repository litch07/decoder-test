const assert = require("assert");

// Simulating chrome.storage.local
let storageData = {
  courses: {},
  userCourses: {},
  softDeletedCourses: [],
  hardDeletedCourses: []
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

const bundled = {
  "CSE 1111": { name: "Structured Programming Language", examDay: "Day 1" },
  "CSE 2222": { name: "Data Structures", examDay: "Day 2" },
  "CSE 3333": { name: "Algorithms", examDay: "Day 3" }
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

// Merge logic as defined in background.js
async function loadAndStoreCourses() {
  const { userCourses, softDeletedCourses, remoteCourses, hardDeletedCourses } = 
    await chrome.storage.local.get(["userCourses", "softDeletedCourses", "remoteCourses", "hardDeletedCourses"]);

  const user = userCourses || {};
  const softDeleted = softDeletedCourses || [];
  const remote = remoteCourses || {};
  const hardDeleted = hardDeletedCourses || [];

  const merged = { ...bundled };

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

async function runTest() {
  console.log("--- TEST 1: Initial load ---");
  await loadAndStoreCourses();
  assert.ok(storageData.courses["CSE 1111"], "CSE 1111 should exist");
  assert.ok(storageData.courses["CSE 2222"], "CSE 2222 should exist");
  assert.ok(storageData.courses["CSE 3333"], "CSE 3333 should exist");

  console.log("--- TEST 2: Soft delete official course CSE 2222 ---");
  storageData.softDeletedCourses = ["CSE 2222"];
  await loadAndStoreCourses();
  assert.strictEqual(storageData.courses["CSE 2222"], undefined, "CSE 2222 should be excluded from active courses");

  console.log("--- TEST 3: Permanently delete official course CSE 2222 from Trash ---");
  // Simulating perm-delete action in popup.js
  const target = "CSE 2222";
  storageData.softDeletedCourses = storageData.softDeletedCourses.filter(c => c !== target);
  if (!storageData.hardDeletedCourses.includes(target)) {
    storageData.hardDeletedCourses.push(target);
  }
  await loadAndStoreCourses();

  assert.strictEqual(storageData.courses["CSE 2222"], undefined, "CSE 2222 must be excluded from active courses");
  assert.strictEqual(storageData.softDeletedCourses.includes("CSE 2222"), false, "CSE 2222 must be gone from Trash");
  assert.strictEqual(storageData.hardDeletedCourses.includes("CSE 2222"), true, "CSE 2222 must be in hardDeletedCourses");

  console.log("--- TEST 4: Empty Trash with official course CSE 3333 in Trash ---");
  storageData.softDeletedCourses = ["CSE 3333"];
  // Simulating empty-trash action in popup.js
  storageData.softDeletedCourses.forEach(c => {
    if (storageData.userCourses[c] !== undefined) delete storageData.userCourses[c];
    if (!storageData.hardDeletedCourses.includes(c)) storageData.hardDeletedCourses.push(c);
  });
  storageData.softDeletedCourses = [];
  await loadAndStoreCourses();

  assert.strictEqual(storageData.courses["CSE 3333"], undefined, "CSE 3333 must be excluded from active courses");
  assert.strictEqual(storageData.softDeletedCourses.length, 0, "Trash must be empty");
  assert.deepStrictEqual(storageData.hardDeletedCourses, ["CSE 2222", "CSE 3333"], "Both official courses must be in hardDeletedCourses");

  console.log("--- TEST 5: Re-importing or saving a permanently deleted official course ---");
  // Simulating save/import: removing from hardDeletedCourses and adding to userCourses
  const readded = "CSE 2222";
  storageData.hardDeletedCourses = storageData.hardDeletedCourses.filter(c => c !== readded);
  storageData.userCourses[readded] = { name: "Custom CSE 2222" };
  await loadAndStoreCourses();

  assert.ok(storageData.courses["CSE 2222"], "CSE 2222 should now be restored and active");
  assert.strictEqual(storageData.courses["CSE 2222"].name, "Custom CSE 2222");

  console.log("All official course hard-delete tests passed!");
}

runTest().catch(console.error);
