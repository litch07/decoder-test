// Integration checks use production schema, graph, import, merge, and sync functions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const D = require('../course-data.js');
const read = name => fs.readFileSync(name, 'utf8');
const plain = value => JSON.parse(JSON.stringify(value));
module.exports = async function prerequisiteIntegrityChecks() {
  const catalog = D.validateCatalog(D.parse(read('courses.json')));
  const cse = D.graph(catalog, {curriculum:'BSCSE-current'}), ds = D.graph(catalog, {curriculum:'BSDS-233'});
  assert.deepEqual(cse.chain('cse4813').directCodes, ['CSE 4889']);
  assert.deepEqual(ds.chain('ds4211').directCodes, ['DS 4889']);
  assert.ok(!cse.chain('CSE 4813').levels.flatMap(l => l.codes).some(c => c.startsWith('DS ')));
  assert.ok(!ds.chain('DS 4211').levels.flatMap(l => l.codes).includes('CSE 4889'));
  assert.ok(cse.unlocks('CSE4889').includes('CSE 4813') && !cse.unlocks('CSE4889').includes('DS 4211'));
  assert.ok(ds.unlocks('DS4889').includes('DS 4211') && !ds.unlocks('DS4889').includes('CSE 4813'));
  assert.deepEqual(cse.forward.get('CSE 2215'), ['CSE 1111']);
  assert.deepEqual(cse.forward.get('CSE 2216'), ['CSE 1112']);
  assert.deepEqual(ds.forward.get('CSE 2215'), ['DS 1115','DS 1116']);
  assert.deepEqual(ds.forward.get('CSE 2216'), ['DS 1115','DS 1116']);
  assert.deepEqual(cse.forward.get('CSE 2217'), ['CSE 2215']);
  assert.deepEqual(cse.forward.get('CSE 2218'), ['CSE 2216']);
  assert.deepEqual(ds.forward.get('CSE 2217'), ['CSE 2215','CSE 2216']);
  assert.deepEqual(ds.forward.get('CSE 2218'), ['CSE 2215','CSE 2216']);
  for (const graph of [cse,ds]) for (const [course,deps] of graph.forward) for (const dep of deps) {
    assert.ok(graph.unlocks(dep).includes(course), 'Forward and reverse graphs disagree: '+course+' / '+dep);
    assert.ok(graph.chain(course).directCodes.includes(dep));
  }
  const mixedSubjects = {'CSE 9999':{name:'A',prerequisites:['EEE 1001','MATH 1001','PHY 1001']},'EEE 1001':{name:'B'},'MATH 1001':{name:'C'},'PHY 1001':{name:'D'}};
  assert.equal(D.graph(D.validateCatalog(mixedSubjects)).chain('CSE 9999').directCodes.length,3);
  assert.equal(D.audit(mixedSubjects).length,0);
  assert.equal(D.code(' cse4000 a '),'CSE 4000A');
  assert.notEqual(D.code('cse4889'),D.code('ds4889'));
  assert.throws(()=>D.validateCatalog({'cse4889':{name:'A'},'CSE 4889':{name:'B'}}),/Duplicate normalized/);
  assert.ok(D.audit({'CSE 1001':{name:'Legacy malformed record',prerequisites:'CSE 1002'}}).some(x=>x.type==='invalid-record'));
  const a = {name:'A',prerequisites:[]};
  assert.throws(()=>D.validateCatalog({'CSE 1001':{...a,prerequisites:['CSE 1002']}}),/not in catalog/);
  assert.throws(()=>D.validateCatalog({'CSE 1001':{...a,prerequisites:['CSE1001']}}),/itself/);
  assert.throws(()=>D.validateCatalog({'CSE 1001':{...a,prerequisites:['CSE 1002','cse1002']},'CSE 1002':a}),/Duplicate prerequisite/);
  assert.throws(()=>D.validateCatalog({'CSE 1001':{...a,prerequisites:['CSE 1002']},'CSE 1002':{...a,prerequisites:['CSE 1001']}}),/cycle/);
  const versioned = {'CSE 1001':{name:'A',prerequisiteVariants:{old:{prerequisites:['CSE 1002'],source:'https://example.test/old'}}},'CSE 1002':{name:'B',prerequisiteVariants:{old:{prerequisites:['CSE 1001'],source:'https://example.test/old'}}}};
  assert.throws(()=>D.validateCatalog(versioned),/cycle/);
  const warnings = D.audit(catalog).filter(x=>x.type==='cross-program');
  assert.equal(warnings.length,6);
  assert.ok(warnings.every(x=>x.severity==='warning'));
  // Source claims are not deleted merely because they cross programs or require review.
  assert.deepEqual(catalog['DS 4229'].prerequisites,['CSE 3521']);
  assert.deepEqual(catalog['DS 4817'].prerequisites,['CSE 3521']);
  const stale = {'cse2215':{name:catalog['CSE 2215'].name,prerequisites:['DS 1115','DS 1116']}};
  const merged = D.mergeCatalog(catalog,{},stale);
  assert.deepEqual(merged['CSE 2215'].prerequisites,['DS 1115','DS 1116']);
  assert.ok(!merged['CSE 2215'].prerequisiteVariants);
  assert.ok(D.overrideIssues(catalog,{},stale).some(x=>x.source==='userCourses'&&x.code==='CSE 2215'));
  assert.ok(D.overrideIssues(catalog,stale,{}).some(x=>x.source==='remoteCourses'));
  assert.ok(D.mergeCatalog(catalog,{}, {'CSE 2215':{name:'Renamed'}})['CSE 2215'].prerequisiteVariants);
  assert.ok(D.mergeEntry(catalog['CSE 2215'],{...catalog['CSE 2215'],credits:4}).prerequisiteVariants);
  const deleted = D.mergeCatalog(catalog,{}, {},['cse4889'],[]);
  assert.ok(deleted['DS 4889']&&!deleted['CSE 4889']);
  assert.ok(D.audit(deleted).some(x=>x.type==='missing-reference'&&x.prerequisite==='CSE 4889'));
  assert.deepEqual(D.graph(deleted).chain('CSE 4813').directCodes,['CSE 4889']);
  // Actual popup and public helpers must produce identical direct/chain/reverse results.
  const popup = read('popup.js'), docs = read('docs/app.js');
  const contexts=[];
  for (const source of [popup,docs]) {
    const ctx=vm.createContext({CourseData:D});
    vm.runInContext(source.slice(source.indexOf('  function prerequisiteCatalog('),source.indexOf('  //',source.indexOf('  function buildPrereqChain(')))+
      source.slice(source.indexOf('  function findUnlocks('), source.indexOf('\n  }',source.indexOf('  function findUnlocks('))+4),ctx);
    contexts.push(ctx);
  }
  for(const code of ['CSE 4813','DS 4211','DS 4817']) assert.deepEqual(plain(contexts[0].buildPrereqChain(code,catalog)),plain(contexts[1].buildPrereqChain(code,catalog)));
  assert.deepEqual(plain(contexts[0].findUnlocks('DS 4889',catalog)),plain(contexts[1].findUnlocks('DS 4889',catalog)));
  contexts[0].roadmapNavigationStack=[{code:'DS 4817'}];contexts[0].currentEditingCode='CSE 2215';
  assert.deepEqual(plain(contexts[0].buildPrereqChain('CSE 2215',catalog).directCodes),['DS 1115','DS 1116']);
  contexts[1].activeModalCourse='CSE 2215';contexts[1].modalCurriculum='BSDS-233';
  assert.deepEqual(plain(contexts[1].buildPrereqChain('CSE 2215',catalog).directCodes),['DS 1115','DS 1116']);
  contexts[0].roadmapNavigationStack=[];contexts[0].currentEditingCode=null;
  contexts[1].activeModalCourse=null;contexts[1].modalCurriculum=null;

  const content=read('content.js'),scanner=vm.createContext({courses:catalog});
  vm.runInContext(content.slice(content.indexOf('  function resolve('),content.indexOf('  // NOTE: escapeHtml')),scanner);
  assert.equal(scanner.resolve('CSE4889').key,'CSE 4889');
  assert.equal(scanner.resolve('DS4889').key,'DS 4889');
  scanner.courses={'DS 4889':catalog['DS 4889']};assert.equal(scanner.resolve('CSE4889'),null);
  // Production import previews and commits, including metadata round trips.
  const store={}, imports=vm.createContext({CourseData:D,courses:plain(catalog),userCourses:{},softDeletedCourses:[],hardDeletedCourses:[],searchQuery:'',els:{},
    chrome:{storage:{local:{set:async value=>Object.assign(store,plain(value))}}},updateCourseCount(){},renderCourseList(){},updateJsonBadge(){},clearDropZoneFileInfo(){},closeImportPreviewModal(){},showImportMsg(){},showToast(){}});
  vm.runInContext(popup.slice(popup.indexOf('  function normalizeCourseData('),popup.indexOf('  function getSoftDeletedCourseData('))+
    popup.slice(popup.indexOf('  function computeImportDiff('),popup.indexOf('  function renderImportPreview('))+
    popup.slice(popup.indexOf('  async function executeCommitImportDiff('),popup.indexOf('  function triggerDropZoneError('))+
    popup.slice(popup.indexOf('  function formatCourseForExport('),popup.indexOf('  function getExportDateString(')),imports);
  assert.equal(imports.computeImportDiff({'CSE 9999':{name:'Missing',prerequisites:['DS 9999']}},catalog).toAdd.length,0);
  const corrected=imports.computeImportDiff({'cse2215':catalog['CSE 2215']},merged);
  assert.equal(corrected.toUpdate.length,1);
  await imports.executeCommitImportDiff(corrected);
  assert.ok(store.userCourses['CSE 2215'].prerequisiteVariants);
  assert.deepEqual(store.courses['CSE 2215'].prerequisites,['CSE 1111']);
  assert.ok(imports.formatCourseForExport(catalog['CSE 2215']).prerequisiteVariants['BSDS-233']);
  assert.ok(imports.computeImportDiff({'DS 9999':{name:'Review',prerequisites:['CSE 3521']}},catalog).warnings.some(x=>x.code==='DS 9999'));
  assert.equal(imports.computeImportDiff({'cse4889':'First','CSE 4889':'Second'},catalog).errors.length,1);
  // Production service-worker merge and sync: no writes during preview; invalid updates stay rejected.
  const background=read('background.js'), storage={userCourses:stale,remoteCourses:{}}, writes=[];
  const service=vm.createContext({CourseData:D,Blob,COURSES_URL:'bundle',console:{warn(){},error(){}},fetch:async()=>({ok:true,json:async()=>plain(catalog)}),chrome:{storage:{local:{
    get:async()=>storage,set:async value=>{writes.push(value);Object.assign(storage,plain(value));},remove:async()=>{}}}}});
  vm.runInContext(background.slice(background.indexOf('async function loadAndStoreCourses('),background.indexOf('// Fetch the latest courses'))+
    background.slice(background.indexOf('async function syncCourses('),background.indexOf('const DEFAULT_ALLOWED_SITES')),service);
  await service.loadAndStoreCourses();
  assert.ok(storage.catalogDiagnostics.some(x=>x.source==='userCourses'&&x.code==='CSE 2215'));
  assert.deepEqual(storage.courses['CSE 2215'].prerequisites,['DS 1115','DS 1116']);
  const count=writes.length, preview=await service.syncCourses(true,catalog);
  assert.ok(preview.success&&preview.stats.warnings.length===6);
  assert.equal(writes.length,count);
  assert.equal((await service.syncCourses(true,{'CSE 1001':{name:'Bad',prerequisites:['DS 9999']}})).success,false);
  const applied=await service.syncCourses(false,catalog,preview.baselineRevision);
  assert.ok(applied.success);
  assert.ok(storage.remoteCourses['CSE 2215'].prerequisiteVariants);
  assert.equal((await service.syncCourses(false,catalog,preview.baselineRevision)).success,false,'Stale sync reviews are rejected');
  assert.deepEqual(storage.courses['CSE 2215'].prerequisites,['DS 1115','DS 1116']);
  assert.deepEqual(storage.courses['CSE 4813'].prerequisites,['CSE 4889']);
  assert.deepEqual(storage.courses['DS 4211'].prerequisites,['DS 4889']);
  // A stale denormalized courses cache alone cannot override a new bundled catalog.
  const cached = plain(catalog);cached['CSE 2215'].prerequisites=['DS 1115','DS 1116'];
  const popupStore={courses:cached,userCourses:{},remoteCourses:{}};
  const state=vm.createContext({CourseData:D,els:{},bundledCourses:{},applyTheme(){},console,
    fetch:async()=>({ok:true,json:async()=>plain(catalog)}),chrome:{runtime:{getURL:()=> 'bundle'},storage:{local:{get:async()=>popupStore,set:async value=>Object.assign(popupStore,plain(value))}}}});
  vm.runInContext(popup.slice(popup.indexOf('  function normalizeCourseData('),popup.indexOf('  function getSoftDeletedCourseData('))+
    popup.slice(popup.indexOf('  async function loadStorageData('),popup.indexOf('  function formatRelativeTime(')),state);
  await state.loadStorageData();
  assert.deepEqual(popupStore.courses['CSE 2215'].prerequisites,['CSE 1111']);
  popupStore.userCourses=stale;await state.loadStorageData();
  assert.deepEqual(popupStore.courses['CSE 2215'].prerequisites,['DS 1115','DS 1116']);
  assert.ok(popupStore.catalogDiagnostics.some(x=>x.source==='userCourses'));
  console.log('  Production prerequisite identity, curricula, merge, import and sync checks passed.');
};
