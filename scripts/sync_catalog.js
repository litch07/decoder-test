// The extension catalog is the source of truth for the public website.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'courses.json'));
const destination = path.join(root, 'docs', 'courses.json');
if (process.argv.includes('--check')) {
  if (!source.equals(fs.readFileSync(destination))) {
    console.error('Catalog copies differ. Run: node scripts/sync_catalog.js');
    process.exitCode = 1;
  } else console.log('Catalog copies match exactly.');
} else {
  fs.writeFileSync(destination, source);
  console.log('Updated docs/courses.json from courses.json.');
}
