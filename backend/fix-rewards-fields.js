const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src", "routes", "rewards.ts");
let content = fs.readFileSync(filePath, "utf8");

// Fix line 502: rewards.create in Promise.all - add id field
content = content.replace(
  /(\s+prisma\.rewards\.create\(\{\s+data:\s+\{)(\s+userId: user\.id,\s+type: type \|\| "admin_bulk_bonus",)/g,
  "$1\n              id: crypto.randomUUID(),$2"
);

// Fix line 425-427: audit_logs.create - add id field (send_reward action)
content = content.replace(
  /(\/\/ Log audit\s+await prisma\.audit_logs\.create\(\{\s+data:\s+\{)(\s+userId: req\.user\.userId,\s+action: "send_reward",)/g,
  "$1\n          id: crypto.randomUUID(),$2"
);

// Fix line 529-531: audit_logs.create - add id field (bulk_send_rewards action)
content = content.replace(
  /(\/\/ Log audit\s+await prisma\.audit_logs\.create\(\{\s+data:\s+\{)(\s+userId: req\.user\.userId,\s+action: "bulk_send_rewards",)/g,
  "$1\n          id: crypto.randomUUID(),$2"
);

fs.writeFileSync(filePath, content, "utf8");
console.log("✅ Fixed 3 missing id fields in rewards.ts");
