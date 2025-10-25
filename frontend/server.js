#!/usr/bin/env node
/**
 * Wrapper to start Next.js standalone server
 * Next.js standalone output is located in .next/standalone
 */

const { spawn } = require("child_process");
const path = require("path");

// The PORT env var is set by Render, default to 3000
const port = process.env.PORT || 3000;

// Next.js standalone server script location
const nextServerPath = path.join(__dirname, ".next", "standalone", "server.js");

console.log(`Starting Next.js server on port ${port}...`);
console.log(`Server path: ${nextServerPath}`);

// Start the Next.js server
const server = spawn("node", [nextServerPath], {
  env: {
    ...process.env,
    PORT: port,
    NODE_ENV: "production",
  },
  stdio: "inherit",
});

server.on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

server.on("exit", (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});
