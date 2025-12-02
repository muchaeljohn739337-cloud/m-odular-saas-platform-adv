const fs = require("fs");
const path = require("path");

// Fix rpaApproval.ts - add id to 2 audit_logs.create calls
const rpaPath = path.join(__dirname, "src", "routes", "rpaApproval.ts");
let rpaContent = fs.readFileSync(rpaPath, "utf8");

// Add crypto import at top if not present
if (!rpaContent.includes('import crypto from "crypto"')) {
  rpaContent = rpaContent.replace(
    /^(import.*\n)/,
    '$1import crypto from "crypto";\n'
  );
}

// Fix line 336: KYC_AUTO_VERIFIED audit log
rpaContent = rpaContent.replace(
  /(await prisma\.audit_logs\.create\(\{\s+data:\s+\{)(\s+userId,\s+action: "KYC_AUTO_VERIFIED",)/g,
  "$1\n            id: crypto.randomUUID(),$2"
);

// Fix line 365: KYC_FLAGGED_FOR_REVIEW audit log
rpaContent = rpaContent.replace(
  /(await prisma\.audit_logs\.create\(\{\s+data:\s+\{)(\s+userId,\s+action: "KYC_FLAGGED_FOR_REVIEW",)/g,
  "$1\n          id: crypto.randomUUID(),$2"
);

fs.writeFileSync(rpaPath, rpaContent, "utf8");
console.log("✅ Fixed 2 missing id fields in rpaApproval.ts");

// Fix support.ts - add updatedAt field
const supportPath = path.join(__dirname, "src", "routes", "support.ts");
let supportContent = fs.readFileSync(supportPath, "utf8");

// Replace inline crypto import with top-level import
if (!supportContent.includes('import crypto from "crypto"')) {
  supportContent = supportContent.replace(
    /^(import express.*\n)/,
    '$1import crypto from "crypto";\n'
  );
}

// Replace the create call with both id and updatedAt
supportContent = supportContent.replace(
  /id: \(await import\("crypto"\)\)\.randomUUID\?\.\(\) \|\| `\$\{Date\.now\(\)\}`,/,
  "id: crypto.randomUUID(),\n          updatedAt: new Date(),"
);

fs.writeFileSync(supportPath, supportContent, "utf8");
console.log("✅ Fixed 1 missing updatedAt field in support.ts");

// Fix medbeds.ts - change include.user to include.users
const medbedsPath = path.join(__dirname, "src", "routes", "medbeds.ts");
let medbedsContent = fs.readFileSync(medbedsPath, "utf8");

medbedsContent = medbedsContent.replace(
  /include:\s+\{\s+user:\s+\{/g,
  "include: {\n        users: {"
);

fs.writeFileSync(medbedsPath, medbedsContent, "utf8");
console.log("✅ Fixed include.user → include.users in medbeds.ts");

console.log("\n🎉 All file fixes complete!");
