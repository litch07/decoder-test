const assert = require('assert');

// Simulate chrome.storage.local
let storageData = {};
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
  "COURSE 1": { name: "Bundled Name 1", examDay: "Monday" },
  "COURSE 2": { name: "Bundled Name 2", examDay: "Tuesday" },
  "COURSE 3": { name: "Bundled Name 3", examDay: "Wednesday" },
  "COURSE 4": { name: "Bundled Name 4", examDay: "Thursday" }
};

// remoteCourses takes precedence over bundled
storageData.remoteCourses = {
  "COURSE 2": { name: "Remote Name 2", examDay: "Friday" }, // Overrides COURSE 2
  "COURSE 3": { name: "Remote Name 3", examDay: "Saturday" }, // Overrides COURSE 3
};

// userCourses takes precedence over remote and bundled
storageData.userCourses = {
  "COURSE 3": { name: "User Name 3", examDay: "Sunday" }, // Overrides COURSE 3 completely
  "COURSE 4": "User Name 4" // Simple string override for COURSE 4
};

// softDeletedCourses excludes codes entirely
storageData.softDeletedCourses = ["COURSE 1"]; // Should remove COURSE 1

async function testMerge() {
  const { userCourses, softDeletedCourses, remoteCourses } = await chrome.storage.local.get(["userCourses", "softDeletedCourses", "remoteCourses"]);
  const user = userCourses || {};
  const softDeleted = softDeletedCourses || [];
  const remote = remoteCourses || {};
  
  // Merge remoteCourses over bundled courses (remote takes precedence)
  const merged = { ...bundled, ...remote };

  for (const code in user) {
    const uVal = user[code];
    const bVal = merged[code] || { examDay: "", examSlot: "", prerequisites: [] };
    
    if (uVal && typeof uVal === "object") {
      merged[code] = { ...bVal, ...uVal };
    } else {
      merged[code] = { ...bVal, name: uVal };
    }
  }

  // Exclude soft-deleted courses
  for (const code of softDeleted) {
    delete merged[code];
  }

  await chrome.storage.local.set({ courses: merged });

  console.log("Merged Courses:", storageData.courses);

  // Assertions
  assert.strictEqual(storageData.courses["COURSE 1"], undefined, "Soft-deleted course should be deleted");
  assert.strictEqual(storageData.courses["COURSE 2"].name, "Remote Name 2", "Remote should override bundled");
  assert.strictEqual(storageData.courses["COURSE 3"].name, "User Name 3", "User should override remote");
  assert.strictEqual(storageData.courses["COURSE 4"].name, "User Name 4", "User string should override bundled name");
  console.log("All assertions passed.");
}

testMerge().catch(console.error);
