const assert = require("assert");

// 2-course sample format used in popup.js and popup.html placeholder
const SAMPLE_TWO_COURSES = JSON.stringify({
  "CSE 3715": {
    "name": "Software Engineering",
    "examDay": "D1",
    "examSlot": "T1",
    "prerequisites": ["CSE 2215", "CSE 2216"]
  },
  "ACT 1111": {
    "name": "Financial Accounting",
    "examDay": "",
    "examSlot": "",
    "prerequisites": []
  }
}, null, 2);

// Batch upload parser logic extracted from popup.js importBtn handler
function parseAndValidateBatchJson(raw) {
  const trimmed = (raw || "").trim();
  if (!trimmed) {
    throw new Error("Empty JSON");
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e) {
    throw new Error("Invalid JSON: " + e.message);
  }

  if (typeof parsed !== "object" || Array.isArray(parsed) || parsed === null) {
    throw new Error('JSON must be a flat object: { "CODE": "Name" }');
  }

  const validEntries = {};
  let added = 0;
  let errors = 0;

  for (const [k, v] of Object.entries(parsed)) {
    if (typeof k !== "string" || !k.trim()) {
      errors++;
      continue;
    }
    const key = k.trim().toUpperCase();
    let val;

    if (typeof v === "string" && v.trim()) {
      val = v.trim();
    } else if (typeof v === "object" && v !== null && typeof v.name === "string" && v.name.trim()) {
      val = { ...v, name: v.name.trim() };
    } else {
      errors++;
      continue;
    }

    validEntries[key] = val;
    added++;
  }

  if (added === 0 && errors > 0) {
    throw new Error(`Found ${errors} invalid entries, none added`);
  }
  if (added === 0) {
    throw new Error("No valid entries found in JSON");
  }

  return { validEntries, added, errors };
}

async function runTests() {
  console.log("--- TEST 1: 2-Course Sample Format Validity ---");
  const parsedSample = JSON.parse(SAMPLE_TWO_COURSES);
  const keys = Object.keys(parsedSample);
  assert.strictEqual(keys.length, 2, "Sample must contain exactly 2 courses");
  assert.deepStrictEqual(keys, ["CSE 3715", "ACT 1111"], "Sample courses must be CSE 3715 and ACT 1111");

  const cse3715 = parsedSample["CSE 3715"];
  assert.strictEqual(cse3715.name, "Software Engineering");
  assert.strictEqual(cse3715.examDay, "D1");
  assert.strictEqual(cse3715.examSlot, "T1");
  assert.deepStrictEqual(cse3715.prerequisites, ["CSE 2215", "CSE 2216"]);

  const act1111 = parsedSample["ACT 1111"];
  assert.strictEqual(act1111.name, "Financial Accounting");
  assert.strictEqual(act1111.examDay, "");
  assert.strictEqual(act1111.examSlot, "");
  assert.deepStrictEqual(act1111.prerequisites, []);

  console.log("--- TEST 2: Parsing and Batch Upload Processing ---");
  const batchResult = parseAndValidateBatchJson(SAMPLE_TWO_COURSES);
  assert.strictEqual(batchResult.added, 2);
  assert.strictEqual(batchResult.errors, 0);
  assert.ok(batchResult.validEntries["CSE 3715"]);
  assert.ok(batchResult.validEntries["ACT 1111"]);

  console.log("--- TEST 3: Validation Error Handling ---");
  assert.throws(() => parseAndValidateBatchJson(""), /Empty JSON/);
  assert.throws(() => parseAndValidateBatchJson("{ not valid json }"), /Invalid JSON/);
  assert.throws(() => parseAndValidateBatchJson("[]"), /JSON must be a flat object/);
  assert.throws(() => parseAndValidateBatchJson('{ "BAD": 123 }'), /Found 1 invalid entries/);

  console.log("All batch upload tests passed successfully!");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
