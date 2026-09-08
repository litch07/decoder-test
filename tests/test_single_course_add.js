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
  "CSE 1111": { name: "Structured Programming", examDay: "Day 1", examSlot: "A1" },
  "CSE 2222": { name: "Data Structures", examDay: "Day 2", examSlot: "B1" }
};

// Pure logic extracted from single course add handler in popup.js
function processSingleCourse(rawCode, rawName, rawDay, rawSlot, rawPrereq) {
  const codeTrimmed = (rawCode || "").trim();
  const nameTrimmed = (rawName || "").trim();

  if (!codeTrimmed) {
    throw new Error("Course code is required");
  }
  if (!nameTrimmed) {
    throw new Error("Course title is required");
  }

  const code = codeTrimmed.toUpperCase();
  const prereqs = rawPrereq 
    ? rawPrereq.split(",").map(p => p.trim().toUpperCase()).filter(Boolean) 
    : [];

  const courseObj = {
    name: nameTrimmed,
    examDay: (rawDay || "").trim(),
    examSlot: (rawSlot || "").trim(),
    prerequisites: prereqs
  };

  return { code, courseObj };
}

async function addSingleCourseToStorage(rawCode, rawName, rawDay, rawSlot, rawPrereq) {
  const { code, courseObj } = processSingleCourse(rawCode, rawName, rawDay, rawSlot, rawPrereq);

  const { userCourses = {}, softDeletedCourses = [], hardDeletedCourses = [] } =
    await chrome.storage.local.get(["userCourses", "softDeletedCourses", "hardDeletedCourses"]);

  const updatedSoft = softDeletedCourses.filter(c => c !== code);
  const updatedHard = hardDeletedCourses.filter(c => c !== code);
  userCourses[code] = courseObj;

  await chrome.storage.local.set({
    userCourses,
    softDeletedCourses: updatedSoft,
    hardDeletedCourses: updatedHard
  });

  return { code, courseObj };
}

async function runTests() {
  console.log("--- TEST 1: Validation checks ---");
  assert.throws(() => processSingleCourse("", "Some Name"), /Course code is required/);
  assert.throws(() => processSingleCourse("CSE 1234", ""), /Course title is required/);
  assert.throws(() => processSingleCourse("   ", "   "), /Course code is required/);

  console.log("--- TEST 2: Single add with complete data ---");
  const res1 = await addSingleCourseToStorage(
    "cse 3715", 
    "Software Engineering", 
    "Sunday", 
    "Slot A", 
    "CSE 2215, cse 2216 "
  );
  assert.strictEqual(res1.code, "CSE 3715", "Code must be normalized to uppercase");
  assert.strictEqual(res1.courseObj.name, "Software Engineering");
  assert.strictEqual(res1.courseObj.examDay, "Sunday");
  assert.strictEqual(res1.courseObj.examSlot, "Slot A");
  assert.deepStrictEqual(res1.courseObj.prerequisites, ["CSE 2215", "CSE 2216"]);

  const stored1 = await chrome.storage.local.get(["userCourses"]);
  assert.ok(stored1.userCourses["CSE 3715"]);
  assert.strictEqual(stored1.userCourses["CSE 3715"].name, "Software Engineering");

  console.log("--- TEST 3: Single add with optional fields left blank ---");
  const res2 = await addSingleCourseToStorage("act 1111", "Financial Accounting", "", "", "");
  assert.strictEqual(res2.code, "ACT 1111");
  assert.strictEqual(res2.courseObj.name, "Financial Accounting");
  assert.strictEqual(res2.courseObj.examDay, "");
  assert.strictEqual(res2.courseObj.examSlot, "");
  assert.deepStrictEqual(res2.courseObj.prerequisites, []);

  const stored2 = await chrome.storage.local.get(["userCourses"]);
  assert.ok(stored2.userCourses["ACT 1111"]);
  assert.strictEqual(stored2.userCourses["ACT 1111"].examDay, "");
  assert.deepStrictEqual(stored2.userCourses["ACT 1111"].prerequisites, []);

  console.log("--- TEST 4: Adding a course un-deletes it from trash if previously deleted ---");
  await chrome.storage.local.set({
    softDeletedCourses: ["CSE 4444"],
    hardDeletedCourses: ["CSE 4444"]
  });

  await addSingleCourseToStorage("CSE 4444", "Distributed Systems", "Monday", "Slot B", "");
  const stored3 = await chrome.storage.local.get(["userCourses", "softDeletedCourses", "hardDeletedCourses"]);
  assert.strictEqual(stored3.softDeletedCourses.includes("CSE 4444"), false, "Must be removed from softDeletedCourses");
  assert.strictEqual(stored3.hardDeletedCourses.includes("CSE 4444"), false, "Must be removed from hardDeletedCourses");
  assert.ok(stored3.userCourses["CSE 4444"]);

  console.log("All single course add tests passed successfully!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
