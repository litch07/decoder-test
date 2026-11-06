// Exercise the real registration queue with competing service-worker triggers.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

module.exports = async function contentRegistrationChecks() {
  const source = fs.readFileSync('background.js', 'utf8');
  let sites = ['old.example'];
  let current;
  let registrations = 0;
  let removals = 0;
  let holdFirstRead;
  let firstReadStarted;
  const started = new Promise(resolve => { firstReadStarted = resolve; });
  let hold = true;
  let failNextRead = false;
  const context = vm.createContext({console: {warn() {}}, chrome: {
    storage: {local: {get: async () => {
      if (failNextRead) { failNextRead = false; throw new Error('Temporary storage failure'); }
      const snapshot = sites.slice();
      if (hold) {
        hold = false;
        firstReadStarted();
        await new Promise(resolve => { holdFirstRead = resolve; });
      }
      return {allowedSites: snapshot};
    }}},
    permissions: {contains: async ({origins}) => !origins[0].includes('denied.example')},
    scripting: {
      getRegisteredContentScripts: async () => current ? [current] : [],
      unregisterContentScripts: async () => { removals++; current = undefined; },
      registerContentScripts: async items => {
        assert.equal(current, undefined, 'Registration is never created twice');
        registrations++;
        current = JSON.parse(JSON.stringify(items[0]));
      }
    }
  }});
  vm.runInContext(source.slice(source.indexOf('let contentScriptRegistration'),
    source.indexOf('// Update registered scripts')), context);
  const first = context.syncRegisteredContentScripts();
  await started;
  sites = ['new.example', 'new.example', 'denied.example'];
  const second = context.syncRegisteredContentScripts();
  holdFirstRead();
  await Promise.all([first, second]);
  assert.deepEqual(current.matches, ['*://new.example/*'], 'Newest settings win after overlapping requests');
  const before = {registrations, removals};
  await Promise.all(Array.from({length: 4}, () => context.syncRegisteredContentScripts()));
  assert.deepEqual({registrations, removals}, before, 'Repeated triggers do not replace identical registrations');
  sites = [];
  await context.syncRegisteredContentScripts();
  assert.equal(current, undefined, 'Disabling all sites removes the registration');
  sites = ['final.example'];
  failNextRead = true;
  await context.syncRegisteredContentScripts();
  await context.syncRegisteredContentScripts();
  assert.deepEqual(current.matches, ['*://final.example/*'], 'A failed pass does not poison later refreshes');
  console.log('  Registration ordering, idempotence, permission filtering and recovery checks passed.');
};
