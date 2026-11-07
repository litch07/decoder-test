const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const source = fs.readFileSync(path.join(__dirname, "..", "popup.js"), "utf8");

function testRoadmapSettings() {
  const handlers = {};
  const classes = new Set(["show-flow"]);
  const body = { scrollTop: 120 };
  const button = name => ({ addEventListener: (_, callback) => { handlers[name] = callback; } });
  const els = {
    flowSettingsBtn: button("settings"),
    settingsBackBtn: button("back"),
    viewWrapper: { classList: {
      contains: name => classes.has(name),
      add: name => classes.add(name),
      remove: (...names) => names.forEach(name => classes.delete(name))
    } }
  };
  const start = source.indexOf('    let settingsOriginView = "home";');
  const end = source.indexOf("    // Theme preference option buttons", start);
  assert(start >= 0 && end > start);
  vm.runInNewContext(source.slice(start, end), {
    els,
    document: { querySelector: () => body, getElementById: () => null }
  });
  assert.strictEqual(typeof handlers.settings, "function", "Roadmap registers in the authoritative Settings scope");
  handlers.settings();
  assert(classes.has("show-settings"));
  assert(!classes.has("show-flow"));
  assert.strictEqual(body.scrollTop, 0);
  handlers.back();
  assert(classes.has("show-flow"), "Settings Back returns to the roadmap");
  assert(!classes.has("show-settings"));
  assert.strictEqual((source.match(/els\.flowSettingsBtn\?\.addEventListener/g) || []).length, 1);
}

function testLatestFileImport() {
  const readers = [], previews = [], messages = [], errors = [], fileInfo = [];
  const els = { jsonInput: { value: "" }, dropZoneFileInfo: { style: {}, textContent: "" } };
  class FileReader {
    constructor() { readers.push(this); }
    readAsText() {}
  }
  const context = {
    els, FileReader, CourseData: require("../course-data.js"), courses: {},
    updateJsonBadge() {},
    computeImportDiff: data => data,
    showDropZoneFileInfo: (...args) => fileInfo.push(args),
    showCourseMsg: (...args) => messages.push(args),
    openImportPreviewModal: diff => previews.push(diff),
    triggerDropZoneError: message => errors.push(message)
  };
  const start = source.indexOf("  let importFileGeneration = 0;");
  const end = source.indexOf("  async function reloadLocalCoursesState(", start);
  assert(start >= 0 && end > start);
  vm.createContext(context);
  vm.runInContext("let pendingImportDiff = null;\n" + source.slice(start, end), context);
  const select = name => context.processLoadedJsonFile({ name, size: 30 });
  const finish = (index, code) => readers[index].onload({ target: { result: JSON.stringify({ [code]: code }) } });
  select("A.json");
  select("B.json");
  finish(1, "CSE 9002");
  const latestValue = els.jsonInput.value;
  finish(0, "CSE 9001");
  readers[0].onerror();
  assert.strictEqual(els.jsonInput.value, latestValue, "Late A must not replace B's editor");
  assert.deepStrictEqual(Object.keys(previews[0]), ["CSE 9002"]);
  assert.strictEqual(previews.length, 1, "Only B opens a preview");
  assert.strictEqual(fileInfo.length, 1);
  assert.strictEqual(messages.length, 1);
  assert.strictEqual(errors.length, 0, "Stale read errors must not replace the active state");

  select("C.json");
  select("invalid.txt");
  finish(2, "CSE 9003");
  assert.strictEqual(els.jsonInput.value, latestValue, "Invalid latest selection still cancels an older read");
  assert.strictEqual(errors.length, 1);
  select("D.json");
  context.clearDropZoneFileInfo();
  finish(3, "CSE 9004");
  assert.strictEqual(previews.length, 1, "Clearing the selection cancels its pending preview");

  select("E.json");
  readers[4].onerror();
  assert.strictEqual(errors.length, 2, "Current read errors are still reported");
  select("F.json");
  readers[5].onload({ target: { result: "invalid JSON" } });
  assert.strictEqual(messages.at(-1)[1], "error", "Current parse errors are still reported");
}

async function testConcurrentCourseMutations() {
  const clone = value => JSON.parse(JSON.stringify(value));
  const original = { "CSE 8000": { name: "Existing", prerequisites: [] } };
  const bundled = { ...original, "CSE 8003": { name: "Bundled course" } };
  const store = {
    courses: clone(original), userCourses: clone(original), remoteCourses: {},
    softDeletedCourses: ["CSE 9001", "CSE 9002", "CSE 8001"],
    hardDeletedCourses: ["CSE 9001", "CSE 9002", "CSE 8002"]
  };
  const messages = [];
  let failNextWrite = false, activeWrites = 0, maxActiveWrites = 0;
  let receiveMessage, startUp;
  const event = { addListener() {} };
  const chrome = {
    storage: { local: {
      get: async () => clone(store),
      set: async data => {
        maxActiveWrites = Math.max(maxActiveWrites, ++activeWrites);
        await new Promise(resolve => setImmediate(resolve));
        activeWrites--;
        if (failNextWrite) { failNextWrite = false; throw new Error("Storage unavailable"); }
        Object.assign(store, clone(data));
      },
      remove: async keys => {
        for (const key of [keys].flat()) delete store[key];
      }
    } },
    runtime: {
      getURL: name => name,
      onInstalled: event, onStartup: { addListener(listener) { startUp = listener; } },
      onMessage: { addListener(listener) {
        assert(!receiveMessage, "The worker registers one message listener");
        receiveMessage = listener;
      } },
      sendMessage: message => new Promise(resolve => {
        assert.strictEqual(receiveMessage(clone(message), {}, resolve), true, "The worker keeps the response channel open");
      })
    },
    permissions: { onAdded: event, onRemoved: event }, tabs: { onUpdated: event }
  };
  chrome.storage.onChanged = event;
  const CourseData = require("../course-data.js");
  const background = fs.readFileSync(path.join(__dirname, "..", "background.js"), "utf8");
  function startWorker() {
    receiveMessage = null;
    vm.runInNewContext(background, {
      chrome, CourseData, Blob, importScripts() {}, console: { error() {}, warn() {} },
      fetch: async () => ({ ok: true, json: async () => clone(bundled) })
    });
  }
  startWorker();
  const start = source.indexOf("    // Add single course keyboard shortcut");
  const end = source.indexOf('    els.clearSingleFormBtn?.addEventListener', start);
  const reloadStart = source.indexOf("  async function reloadLocalCoursesState(");
  const reloadEnd = source.indexOf("  function renderTrashList(", reloadStart);
  const importStart = source.indexOf("  async function executeCommitImportDiff(");
  const importEnd = source.indexOf("  function triggerDropZoneError(", importStart);
  const section = (start, end) => {
    const from = source.indexOf(start), to = source.indexOf(end, from);
    assert(from >= 0 && to > from);
    return source.slice(from, to);
  };
  const mutations = [
    section("  async function commitCourseSave(", "  function showCourseMsg("),
    section("  async function toggleEnrollCourse(", "  // ── End Task 3.2 Helpers"),
    section("    els.modalConfirmBtn?.addEventListener(", "    function updateSearchClearBtn("),
    section("  function buildCatalogResetPlan(", "  function updateResetAvailability("),
    section("  async function applyCatalogReset(", "  async function applyCatalogUpdate("),
    section("  const { normalizeCourseData } = CourseData;", "  function getSoftDeletedCourseData("),
    section("  function getCatalogReportBaseline(", "  function openCourseReport("),
    section("  function computeImportDiff(", "  function renderImportPreview(")
  ].join("\n");

  function openPopup() {
    let handler, confirm;
    const field = value => ({ value, classList: { remove() {}, add() {} }, focus() {} });
    const els = {
      addSingleCourseBtn: { addEventListener: (_, callback) => {
        assert(!handler, "Each popup registers one course-addition listener");
        handler = callback;
      } },
      modalConfirmBtn: { addEventListener: (_, callback) => { confirm = callback; } },
      previewConfirmBtn: { disabled: false, setAttribute() {}, removeAttribute() {} },
      viewWrapper: { classList: { contains: () => false } },
      singleCourseCode: field(""), singleCourseName: field(""), singleCoursePrereq: field(""),
      singleCourseCredits: field(""), singleCourseNoPrereq: { checked: true },
      examModeInClass: { checked: false }
    };
    const context = vm.createContext({
      els, chrome, CourseData, bundledCourses: clone(bundled), ...clone(store),
      enrolledCourses: [], pendingAction: null, pendingTarget: null, currentEditingCode: null,
      updateCourseCount() {}, renderCourseList() {}, renderTrashList() {}, exitCourseDetails() {}, isTrashMode: false, searchQuery: "",
      updateJsonBadge() {}, clearDropZoneFileInfo() {}, closeImportPreviewModal() {},
      closeModalSafely() {}, updateEnrolledUI() {}, renderResetResult() {}, updateResetAvailability() {},
      showCourseMsg: (_, type, text) => messages.push({ type, text }), showToast: (text, type) => toasts.push({ type, text }),
      courseReportKind: () => "addition",
      document: { getElementById: () => null, querySelector: () => null }, console: { error() {} }
    });
    const toasts = [];
    vm.runInContext(source.slice(reloadStart, reloadEnd) + source.slice(start, end) + source.slice(importStart, importEnd) + mutations, context);
    return { els, toasts, context, importCourses: context.executeCommitImportDiff, submit(code, name) {
      els.singleCourseCode.value = code;
      els.singleCourseName.value = name;
      return handler();
    }, confirm(action, target) {
      context.pendingAction = action;
      context.pendingTarget = target;
      return confirm();
    }, edit(code, incoming, previous = context.courses[code]) {
      return context.commitCourseSave(code, incoming, undefined, previous);
    }, async reviewReset() {
      await context.reloadLocalCoursesState();
      context.pendingCatalogReset = context.currentCatalogResetPlan();
    } };
  }

  const { els, submit } = openPopup();
  const secondPopup = openPopup();
  const first = submit("cse9001", "First");
  const second = secondPopup.submit("CSE 9002", "Second");
  await Promise.all([first, second]);
  assert.strictEqual(messages.filter(message => message.type === "success").length, 2);
  assert.deepStrictEqual(Object.keys(store.userCourses).sort(), ["CSE 8000", "CSE 9001", "CSE 9002"]);
  assert.strictEqual(store.userCourses["CSE 9001"].name, "First", "Queued submissions retain their own inputs");
  assert.strictEqual(store.userCourses["CSE 9002"].name, "Second");
  assert.deepStrictEqual(store.userCourses["CSE 8000"], original["CSE 8000"]);
  assert.strictEqual(maxActiveWrites, 1, "Single-course writes must not overlap");
  assert.deepStrictEqual(store.softDeletedCourses, ["CSE 8001"]);
  assert.deepStrictEqual(store.hardDeletedCourses, ["CSE 8002"]);
  await Promise.all([submit("CSE 9001", "Updated"), secondPopup.submit("cse9001", "Latest update")]);
  assert.strictEqual(store.userCourses["CSE 9001"].name, "Latest update", "Existing same-code update behavior is preserved");
  assert(!Object.hasOwn(store.userCourses, "cse9001"));

  failNextWrite = true;
  const successes = messages.filter(message => message.type === "success").length;
  await Promise.all([submit("CSE 9003", "Fails"), submit("CSE 9004", "Recovers")]);
  assert(!store.userCourses["CSE 9003"]);
  assert.strictEqual(store.userCourses["CSE 9004"].name, "Recovers", "A failed write must not block later submissions");
  assert.strictEqual(messages.filter(message => message.type === "success").length, successes + 1);
  assert(messages.some(message => message.type === "error" && message.text.includes("Failed to save course")));

  els.singleCourseCredits.value = "-1";
  await submit("CSE 9005", "Invalid");
  assert(!store.userCourses["CSE 9005"], "Validation is preserved");

  els.singleCourseCredits.value = "";
  els.singleCourseNoPrereq.checked = false;
  els.singleCoursePrereq.value = "CSE 9011";
  const prerequisite = submit("CSE 9010", "Prerequisite");
  els.singleCoursePrereq.value = "CSE 9010";
  const cyclic = submit("CSE 9011", "Would form a cycle");
  await Promise.all([prerequisite, cyclic]);
  assert(store.userCourses["CSE 9010"]);
  assert(!store.userCourses["CSE 9011"], "Queued validation must include the preceding addition");
  assert(messages.some(message => message.type === "error" && message.text.includes("create a cycle")));

  startWorker();
  const diff = { toAdd: [{ code: "CSE 9020", incoming: { name: "Imported" } }], toUpdate: [], errors: [] };
  await Promise.all([startUp(), secondPopup.importCourses(diff), secondPopup.submit("CSE 9021", "Added")]);
  assert.strictEqual(store.userCourses["CSE 9020"].name, "Imported");
  assert.strictEqual(store.userCourses["CSE 9021"].name, "Added");
  assert.strictEqual(store.userCourses["CSE 9002"].name, "Second", "A restarted worker uses persisted state");
  assert.strictEqual(maxActiveWrites, 1, "Bulk and single writes share the queue");

  secondPopup.els.singleCourseCredits.value = "3";
  await secondPopup.submit("CSE 9021", "Updated credits after import preview");
  await secondPopup.importCourses({ toAdd: [], toUpdate: [{
    code: "CSE 9021", incoming: { name: "Rename only", credits: null }, isNameOnly: true
  }], errors: [] });
  assert.strictEqual(store.userCourses["CSE 9021"].name, "Rename only");
  assert.strictEqual(store.userCourses["CSE 9021"].credits, 3, "A title-only import preserves newer metadata");

  const duplicate = await chrome.runtime.sendMessage({ type: "ADD_COURSES", importBatch: true, entries: [
    { code: "CSE 9030", incoming: { name: "First" } }, { code: "cse9030", incoming: { name: "Duplicate" } }
  ] });
  assert.strictEqual(duplicate.validationError, "Duplicate normalized course code");
  assert(!Object.hasOwn(store.userCourses, "CSE 9030"), "A rejected batch leaves no partial write");

  const editor = openPopup();
  const other = openPopup();
  await Promise.all([other.submit("CSE 9031", "Concurrent with edit"), editor.edit("CSE 8000", { name: "Edited" })]);
  assert.strictEqual(store.userCourses["CSE 9031"].name, "Concurrent with edit");
  assert.strictEqual(store.courses["CSE 8000"].name, "Edited");
  const previous = clone(store.courses["CSE 8000"]);
  await Promise.all([editor.edit("CSE 8000", { name: "First edit" }, previous), other.edit("CSE 8000", { name: "Stale edit" }, previous)]);
  assert.strictEqual(store.courses["CSE 8000"].name, "First edit");
  assert(other.toasts.some(({ text }) => text.includes("changed since you opened it")));

  await editor.context.moveCourseToTrash("CSE 9001");
  const addition = other.submit("CSE 9032", "Concurrent with permanent delete");
  await Promise.resolve();
  await Promise.all([addition, editor.confirm("perm-delete", "CSE 9001")]);
  assert.strictEqual(store.courses["CSE 9032"].name, "Concurrent with permanent delete");
  assert(!Object.hasOwn(store.userCourses, "CSE 9001"));
  assert(store.hardDeletedCourses.includes("CSE 9001"));

  await editor.context.moveCourseToTrash("CSE 9020");
  const reviewedTrash = [...store.softDeletedCourses];
  await other.context.moveCourseToTrash("CSE 8003");
  await editor.confirm("empty-trash", reviewedTrash);
  assert.deepStrictEqual(store.softDeletedCourses, ["CSE 8003"], "Empty Trash only deletes the courses reviewed");
  assert(store.hardDeletedCourses.includes("CSE 9020"));
  await editor.confirm("restore-all", ["CSE 8003"]);
  assert.strictEqual(store.courses["CSE 8003"].name, "Bundled course");
  await editor.context.moveCourseToTrash("CSE 8003");
  await other.context.restoreCourseFromTrash("CSE 8003");
  assert.strictEqual(store.courses["CSE 8003"].name, "Bundled course");

  await editor.reviewReset();
  const addDuringReset = other.submit("CSE 9033", "Concurrent with reset");
  await Promise.resolve();
  await Promise.all([addDuringReset, editor.context.applyCatalogReset()]);
  assert(editor.toasts.some(({ text }) => text === "Catalog changed since review. Review the reset again."));
  assert.strictEqual(store.courses["CSE 8000"].name, "First edit", "The stale reset makes no changes");
  assert.strictEqual(store.userCourses["CSE 9033"].name, "Concurrent with reset");
  await editor.reviewReset();
  await editor.context.applyCatalogReset();
  assert.strictEqual(store.courses["CSE 8000"].name, "Existing");
  assert(!Object.hasOwn(store.userCourses, "CSE 8000"));
  assert.strictEqual(store.userCourses["CSE 9033"].name, "Concurrent with reset");
  assert(store.hardDeletedCourses.includes("CSE 9001"), "Reset preserves custom Trash exclusions");

  await Promise.all([editor.context.toggleEnrollCourse("CSE 8000"), other.context.toggleEnrollCourse("CSE 9033")]);
  assert.deepStrictEqual(store.enrolledCourses, ["CSE 9033", "CSE 8000"]);
  await editor.confirm("clear-enrolled");
  assert.deepStrictEqual(store.enrolledCourses, []);

  const remote = { "CSE 8000": { name: "Remote revision" } };
  const baselineRevision = JSON.stringify(store.remoteCourses);
  const sync = chrome.runtime.sendMessage({ type: "APPLY_CATALOG_UPDATE", catalog: remote, baselineRevision });
  const staleSync = chrome.runtime.sendMessage({ type: "APPLY_CATALOG_UPDATE", catalog: { "CSE 8000": { name: "Stale" } }, baselineRevision });
  const [applied, stale] = await Promise.all([sync, staleSync, other.submit("CSE 9034", "Concurrent with sync")]);
  assert(applied.success && !stale.success);
  assert.strictEqual(store.remoteCourses["CSE 8000"].name, store.courses["CSE 8000"].name);
  assert.strictEqual(store.userCourses["CSE 9034"].name, "Concurrent with sync");
  await chrome.runtime.sendMessage({ type: "DISMISS_SYNC_RESULT", result: { timestamp: 0 } });
  assert.deepStrictEqual(store.lastSyncResult, clone(applied.stats), "An older popup cannot dismiss the latest sync result");
  await chrome.runtime.sendMessage({ type: "DISMISS_SYNC_RESULT", result: applied.stats });
  assert(!Object.hasOwn(store, "lastSyncResult"));
  const beforeFailedSync = clone(store);
  failNextWrite = true;
  const failedSync = await chrome.runtime.sendMessage({
    type: "APPLY_CATALOG_UPDATE", catalog: { "CSE 8000": { name: "Failed revision" } },
    baselineRevision: JSON.stringify(store.remoteCourses)
  });
  assert(!failedSync.success);
  assert.deepStrictEqual(store, beforeFailedSync, "A failed sync leaves both remote and derived state unchanged");
  assert.strictEqual(maxActiveWrites, 1, "All shared writes use the same queue");
}

async function run() {
  testRoadmapSettings();
  testLatestFileImport();
  await testConcurrentCourseMutations();
  console.log("Popup regression tests passed");
}

run().catch(error => { console.error(error); process.exitCode = 1; });
