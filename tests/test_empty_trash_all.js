const assert = require("assert");

// Mock storage
let storage = {
  courses: {},
  userCourses: {
    "USER_COURSE": { name: "User Custom" },
    "EDITED_OFFICIAL": { name: "Edited Name" }
  },
  softDeletedCourses: ["USER_COURSE", "EDITED_OFFICIAL", "PURE_OFFICIAL"],
  hardDeletedCourses: []
};

const bundled = {
  "EDITED_OFFICIAL": { name: "Original Name" },
  "PURE_OFFICIAL": { name: "Pure Official" },
  "OTHER_OFFICIAL": { name: "Other Official" }
};

// Simulate Empty Trash
storage.softDeletedCourses.forEach(c => {
  if (storage.userCourses[c] !== undefined) {
    delete storage.userCourses[c];
  }
  if (!storage.hardDeletedCourses.includes(c)) {
    storage.hardDeletedCourses.push(c);
  }
});
storage.softDeletedCourses = [];

// Simulate merge
const merged = { ...bundled };
for (const code in storage.userCourses) {
  merged[code] = storage.userCourses[code];
}
for (const code of storage.softDeletedCourses) {
  delete merged[code];
}
for (const code of storage.hardDeletedCourses) {
  delete merged[code];
}

storage.courses = merged;

// Assertions:
// 1. Trash is completely empty
assert.strictEqual(storage.softDeletedCourses.length, 0);

// 2. All 3 courses from trash are in hardDeletedCourses
assert.deepStrictEqual(storage.hardDeletedCourses.sort(), ["EDITED_OFFICIAL", "PURE_OFFICIAL", "USER_COURSE"].sort());

// 3. None of the 3 deleted courses are in active courses
assert.strictEqual(storage.courses["USER_COURSE"], undefined);
assert.strictEqual(storage.courses["EDITED_OFFICIAL"], undefined);
assert.strictEqual(storage.courses["PURE_OFFICIAL"], undefined);

// 4. Untouched official course is still active
assert.ok(storage.courses["OTHER_OFFICIAL"]);

console.log("Empty Trash test with all course types passed successfully!");
