const assert = require("assert");

let storage = {
  hiddenCourses: ["CSE 1111", "CSE 2222"],
  permanentlyDeletedCourses: ["CSE 9999"],
  softDeletedCourses: ["CSE 3333"]
};

// Simulation of migration logic from background.js
const legacyKeys = {
  hiddenCourses: storage.hiddenCourses,
  permanentlyDeletedCourses: storage.permanentlyDeletedCourses,
  softDeletedCourses: storage.softDeletedCourses,
  hardDeletedCourses: storage.hardDeletedCourses
};

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
  Object.assign(storage, updates);
  for (const k of toRemove) delete storage[k];
}

assert.deepStrictEqual(storage.softDeletedCourses, ["CSE 3333", "CSE 1111", "CSE 2222"]);
assert.deepStrictEqual(storage.hardDeletedCourses, ["CSE 9999"]);
assert.strictEqual(storage.hiddenCourses, undefined);
assert.strictEqual(storage.permanentlyDeletedCourses, undefined);

console.log("Migration test passed cleanly!");
