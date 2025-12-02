const fs = require("fs");
const path = require("path");

// Fix AIDeploymentAgent.ts - remove broken entity field entirely
const agentPath = path.join(__dirname, "src", "agents", "AIDeploymentAgent.ts");
let content = fs.readFileSync(agentPath, "utf8");

// Remove the broken entity field line completely
content = content.replace(
  /entity: \/\/ REMOVED - not in schema \/\/ "deployment",\s*/g,
  ""
);

// Remove any other broken entity comment lines
content = content.replace(
  /entity: \/\/ REMOVED - not in schema \/\/[^\n]*\n/g,
  ""
);

fs.writeFileSync(agentPath, content, "utf8");
console.log("✅ Fixed AIDeploymentAgent.ts syntax errors");
