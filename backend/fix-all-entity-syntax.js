const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Find all TypeScript files with the broken entity pattern
const files = glob.sync("src/**/*.ts");
let fixedCount = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");

  // Remove the broken entity field lines completely
  const original = content;

  // Pattern 1: entity: // REMOVED - not in schema // "value",
  content = content.replace(
    /entity: \/\/ REMOVED - not in schema \/\/ [^\n]+\n/g,
    ""
  );

  // Pattern 2: where: { entity: // REMOVED... },
  // Need to handle case where entity is the only field in where clause
  content = content.replace(
    /where:\s*\{\s*entity:\s*\/\/ REMOVED[^\}]+\}/g,
    "where: { /* entity field removed - not in audit_logs schema */ }"
  );

  if (content !== original) {
    fs.writeFileSync(file, content, "utf8");
    fixedCount++;
    console.log(`  Fixed ${file}`);
  }
});

console.log(`\n✅ Fixed ${fixedCount} files with broken entity syntax`);
