#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const port = parseInt(process.env.PORT || '3000', 10);

// Next.js standalone puts server.js at .next/standalone/server.js
// But it expects to be run from the directory containing .next/
const standaloneDir = path.join(__dirname, '.next', 'standalone');
const serverPath = path.join(standaloneDir, 'server.js');

console.log('🔍 Checking for Next.js standalone server...');
console.log('   Looking in:', standaloneDir);

if (!fs.existsSync(serverPath)) {
  console.error('❌ Server file not found at:', serverPath);
  console.error('   Current directory:', __dirname);
  console.error('   .next exists:', fs.existsSync(path.join(__dirname, '.next')));
  console.error('   standalone exists:', fs.existsSync(standaloneDir));
  
  // List what IS in .next if it exists
  const nextDir = path.join(__dirname, '.next');
  if (fs.existsSync(nextDir)) {
    console.error('   Contents of .next/:', fs.readdirSync(nextDir).join(', '));
  }
  
  process.exit(1);
}

console.log('✅ Found standalone server at:', serverPath);
console.log(`🚀 Starting Next.js server on port ${port}...`);

// Start the Next.js standalone server
const child = spawn('node', [serverPath], {
  stdio: 'inherit',
  env: { ...process.env, PORT: port.toString() }
});

child.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code || 1);
  }
});

process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
