const fs = require('node:fs');
const assert = require('node:assert/strict');
const schema = require('../course-data.js');
const text = fs.readFileSync('courses.json', 'utf8');
const catalog = schema.validateCatalog(schema.parse(text));
for (const [code, value] of Object.entries(catalog)) {
  assert.equal(code, schema.code(code));
  for (const dependency of value.prerequisites || []) {
    if (!/^none$/i.test(dependency)) assert.ok(Object.hasOwn(catalog, schema.code(dependency)), code + ': missing prerequisite ' + dependency);
  }
}
assert.equal(text, fs.readFileSync('docs/courses.json', 'utf8'), 'Catalog copies differ');
console.log('Catalog validated: ' + Object.keys(catalog).length + ' courses; no cycles or missing references.');

assert.equal(fs.readFileSync('course-data.js', 'utf8'), fs.readFileSync('docs/course-data.js', 'utf8'), 'Shared graph copies differ');
for (const issue of schema.audit(catalog)) if (issue.severity === 'warning') console.warn('REVIEW: ' + issue.message);
