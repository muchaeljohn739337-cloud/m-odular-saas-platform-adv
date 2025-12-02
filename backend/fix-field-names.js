const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Comprehensive field name mappings (camelCase → snake_case)
const fieldMappings = {
  // Delegates
  "prisma.uploadedFile": "prisma.uploaded_files",
  "prisma.processorConfig": "prisma.processor_configs",
  "prisma.riskAssessment": "prisma.risk_assessments",

  // Field names in where/select/orderBy/data
  "transactionId:": "transaction_id:",
  "resolutionNotes:": "resolution_notes:",
  "allowedProcessors:": "allowed_processors:",

  // Special cases in select/orderBy
  "select: { createdAt:": "select: { created_at:",
  "orderBy: { createdAt:": "orderBy: { created_at:",
  'orderBy: [{ severity: "desc" }, { createdAt:':
    'orderBy: [{ severity: "desc" }, { created_at:',
};

const files = glob.sync("src/**/*.ts");
let totalFixed = 0;

files.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  // Apply all mappings
  Object.entries(fieldMappings).forEach(([pattern, replacement]) => {
    if (content.includes(pattern)) {
      content = content.replaceAll(pattern, replacement);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(file, content, "utf8");
    totalFixed++;
    console.log(`  Fixed ${file}`);
  }
});

console.log(`\n✅ Fixed ${totalFixed} files with field name mappings`);
