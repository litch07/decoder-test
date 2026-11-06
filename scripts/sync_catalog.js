// Keep the public catalog and shared validation/graph module in sync with the extension.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
for (const name of ['courses.json', 'course-data.js']) {
  const source = fs.readFileSync(path.join(root, name));
  const destination = path.join(root, 'docs', name);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(destination) || !source.equals(fs.readFileSync(destination))) {
      console.error(name + ' copies differ. Run: node scripts/sync_catalog.js');
      process.exitCode = 1;
    } else console.log(name + ' copies match exactly.');
  } else {
    fs.writeFileSync(destination, source);
    console.log('Updated docs/' + name);
  }
}
