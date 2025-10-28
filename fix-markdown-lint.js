const fs = require("fs");

// Fix AI_KNOWLEDGE_BASE.md
let kb = fs.readFileSync("AI_KNOWLEDGE_BASE.md", "utf8");

// Fix the emphasis heading at the end
kb = kb.replace(
  "_This knowledge base is continuously updated. Last update: October 28, 2025_",
  "---\n\n**Note:** This knowledge base is continuously updated. Last update: October 28, 2025"
);

fs.writeFileSync("AI_KNOWLEDGE_BASE.md", kb);
console.log("✅ Fixed AI_KNOWLEDGE_BASE.md");

// Fix SUPPORT_STAFF_TRAINING.md
let guide = fs.readFileSync("SUPPORT_STAFF_TRAINING.md", "utf8");

// Fix heading with exclamation
guide = guide.replace(
  "## Welcome to the Advancia Support Team!",
  "## Welcome to the Advancia Support Team"
);

// Fix bare URLs by adding angle brackets
guide = guide.replace(
  /- \*\*Admin Dashboard\*\* - (http:\/\/[^\s]+)/g,
  "- **Admin Dashboard** - <$1>"
);
guide = guide.replace(
  /- \*\*Backend API\*\*: (http:\/\/[^\s]+)/g,
  "- **Backend API**: <$1>"
);
guide = guide.replace(
  /- \*\*Frontend\*\*: (http:\/\/[^\s]+)/g,
  "- **Frontend**: <$1>"
);
guide = guide.replace(
  /- \*\*AI Analytics\*\*: (http:\/\/[^\s]+)/g,
  "- **AI Analytics**: <$1>"
);
guide = guide.replace(
  /- \*\*Admin Chat Monitor\*\*: (http:\/\/[^\s]+)/g,
  "- **Admin Chat Monitor**: <$1>"
);

// Fix email addresses
guide = guide.replace(
  /(tech|security|compliance|support|billing)@advanciapayledger\.com/g,
  "<$&>"
);

// Fix emphasis heading at the end
guide = guide.replace(
  /\*\*Welcome to the team.*?🚀\*\*/s,
  "---\n\n**Welcome to the team!** You're now equipped to provide world-class support to Advancia users. Let's make every interaction count! 🚀"
);

fs.writeFileSync("SUPPORT_STAFF_TRAINING.md", guide);
console.log("✅ Fixed SUPPORT_STAFF_TRAINING.md");

console.log("\n✅ All markdown linting issues fixed!");
