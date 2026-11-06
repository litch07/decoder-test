const assert = require('assert');

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

// remoteCourses takes precedence over bundled. Let's make COURSE 2 a string to test the defensive logic.
storageData.remoteCourses = {
  "COURSE 2": "Remote Name 2 String", // Malformed remote data
  "COURSE 3": { name: "Remote Name 3", examDay: "Saturday" }, 
};

// userCourses takes precedence over remote and bundled
storageData.userCourses = {
  "COURSE 3": { name: "User Name 3", examDay: "Sunday" }, 
  "COURSE 4": "User Name 4" 
};

storageData.softDeletedCourses = ["COURSE 1"];

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

async function testMerge() {
  const { userCourses, softDeletedCourses, remoteCourses } = await chrome.storage.local.get(["userCourses", "softDeletedCourses", "remoteCourses"]);
  const user = userCourses || {};
  const softDeleted = softDeletedCourses || [];
  const remote = remoteCourses || {};
  
  const merged = { ...bundled };

  // Merge remoteCourses over bundled courses (remote takes precedence)
  for (const code in remote) {
    merged[code] = mergeCourseEntry(merged[code], remote[code]);
  }

  // Merge userCourses over the result (user takes precedence)
  for (const code in user) {
    merged[code] = mergeCourseEntry(merged[code], user[code]);
  }

  // Exclude soft-deleted courses
  for (const code of softDeleted) {
    delete merged[code];
  }

  await chrome.storage.local.set({ courses: merged });

  console.log("Merged Courses:", storageData.courses);

  // Assertions
  assert.strictEqual(storageData.courses["COURSE 1"], undefined, "Soft-deleted course should be deleted");
  assert.strictEqual(storageData.courses["COURSE 2"].name, "Remote Name 2 String", "Remote string should override bundled name");
  assert.strictEqual(storageData.courses["COURSE 2"].examDay, "Tuesday", "Remote string should preserve bundled examDay");
  assert.strictEqual(storageData.courses["COURSE 3"].name, "User Name 3", "User should override remote");
  assert.strictEqual(storageData.courses["COURSE 4"].name, "User Name 4", "User string should override bundled name");
  console.log("All assertions passed.");
}

testMerge().catch(error => { console.error(error); process.exitCode = 1; });
