// tests/run_all.js
// Runs all regression test suites sequentially and exits with non-zero on failure.

const { execSync } = require('child_process');
const path = require('path');

const testFiles = [
  'tests/test_batch_upload.js',
  'tests/test_empty_trash_all.js',
  'tests/test_merge.js',
  'tests/test_merge_v2.js',
  'tests/test_migration.js',
  'tests/test_official_hard_delete.js',
  'tests/test_restore_official.js',
  'tests/test_single_and_batch_integration.js',
  'tests/test_single_course_add.js',
  'tests/test_sync_diff.js',
  'tests/test_release1.js',
  'tests/test_contextual_export.js',
  'tests/test_file_import_preview.js',
  'tests/test_content_script_resilience.js',
  'tests/test_allowed_domains_management.js',
  'tests/test_prereq_tree.js',
  'tests/test_github_pages_docs.js',
  'tests/test_course_credits.js',
  'tests/test_my_courses_clash_detector.js',
  'tests/test_exam_calendar_export.js',
  'tests/test_dark_mode_palette.js',
  'tests/test_keyboard_accessibility.js'
];

let failed = 0;
console.log(`Starting execution of ${testFiles.length} test suites...\n`);

for (const testFile of testFiles) {
  process.stdout.write(`Running ${testFile}... `);
  try {
    execSync(`node "${testFile}"`, { stdio: 'pipe', encoding: 'utf8' });
    console.log('✅ PASS');
  } catch (err) {
    console.log('❌ FAIL');
    console.error(err.stdout || err.message);
    if (err.stderr) console.error(err.stderr);
    failed++;
  }
}

console.log(`\n========================================`);
if (failed === 0) {
  console.log(`ALL ${testFiles.length} TEST SUITES PASSED! 🎉`);
  process.exit(0);
} else {
  console.error(`${failed} of ${testFiles.length} test suites failed.`);
  process.exit(1);
}
