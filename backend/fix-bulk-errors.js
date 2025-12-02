const fs = require("fs");
const path = require("path");
const glob = require("glob");

let totalFixed = 0;

// Pattern 1: Fix audit_logs missing id field
const auditLogsPattern =
  /(await prisma\.audit_logs\.create\(\{\s+data:\s+\{)(\s+(?!id:))/g;

// Pattern 2: Fix field name mismatches (snake_case in schema)
const fieldReplacements = [
  { pattern: /entity:/g, replacement: "entity: // REMOVED - not in schema //" },
  { pattern: /details:/g, replacement: "metadata:" },
  { pattern: /lastActive:/g, replacement: "last_active:" },
  { pattern: /manifestHash:/g, replacement: "manifest_hash:" },
  { pattern: /patchId:/g, replacement: "patch_id:" },
  { pattern: /dataType:/g, replacement: "data_type:" },
  { pattern: /created_at:/g, replacement: "createdAt:" },
  { pattern: /suggestion_type:/g, replacement: "suggestionType:" },
];

// Get all TypeScript files in src/
const files = glob.sync("src/**/*.ts");

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  // Add crypto import if file uses audit_logs.create and doesn't have import
  if (
    content.includes("audit_logs.create") &&
    !content.includes('import crypto from "crypto"')
  ) {
    content = content.replace(
      /^(import.*\n)/,
      '$1import crypto from "crypto";\n'
    );
    modified = true;
  }

  // Fix field names
  fieldReplacements.forEach(({ pattern, replacement }) => {
    if (content.match(pattern)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });

  // Fix audit_logs.create missing id (only add if not already present)
  let auditLogsMatches = 0;
  content = content.replace(
    /(await prisma\.audit_logs\.create\(\{\s+data:\s+\{)(\s+(?!id:)\w+:)/g,
    (match, p1, p2) => {
      auditLogsMatches++;
      return `${p1}\n          id: crypto.randomUUID(),${p2}`;
    }
  );

  if (auditLogsMatches > 0) {
    modified = true;
    console.log(
      `  Added ${auditLogsMatches} id fields to audit_logs.create in ${file}`
    );
  }

  if (modified) {
    fs.writeFileSync(file, content, "utf8");
    totalFixed++;
  }
});

console.log(`\n✅ Fixed ${totalFixed} files`);
