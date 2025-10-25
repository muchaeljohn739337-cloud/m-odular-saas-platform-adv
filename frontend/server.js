#!/usr/bin/env node
/**
 * Robust wrapper to start Next.js standalone server
 * - Checks server file exists
 * - Detects if PORT is in use (tries to connect)
 * - Emits clear error logs for missing env vars and child process failures
 */

const { spawn } = require('child_process');
const path = require('path');
const net = require('net');
const fs = require('fs');

const port = parseInt(process.env.PORT || '3000', 10);
const nextServerPath = path.join(__dirname, '.next', 'standalone', 'server.js');

function warnMissingEnv() {
  const required = ['NEXT_PUBLIC_API_URL', 'NEXTAUTH_URL'];
  required.forEach((k) => {
    if (!process.env[k]) {
      console.warn(`⚠️  Warning: required env var ${k} is not set. This may cause runtime errors.`);
    }
  });
}

function checkServerFileExists() {
  if (!fs.existsSync(nextServerPath)) {
    console.error(`❌ Server file not found at ${nextServerPath}`);
    console.error('Ensure the Next.js build produced a standalone server at .next/standalone/server.js');
    process.exit(1);
  }
}

function isPortInUse(port, host = '127.0.0.1', timeout = 1000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let called = false;
    socket.setTimeout(timeout);
    socket.on('connect', () => {
      called = true;
      socket.destroy();
      resolve(true); // someone is listening
    });
    socket.on('timeout', () => {
      if (!called) { called = true; socket.destroy(); resolve(false); }
    });
    socket.on('error', () => {
      if (!called) { called = true; resolve(false); }
    });
    socket.connect(port, host);
  });
}

async function start() {
  warnMissingEnv();
  checkServerFileExists();

  // If port is used, warn and retry a few times
  for (let attempt = 1; attempt <= 3; attempt++) {
    const inUse = await isPortInUse(port);
    if (inUse) {
      console.error(`❌ Port ${port} appears to be in use (attempt ${attempt}/3).`);
      if (attempt === 3) {
        console.error('Aborting startup due to port in use.');
        process.exit(1);
      }
      console.log('Waiting 2s and retrying...');
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }

    console.log(`Starting Next.js standalone server: node ${nextServerPath} (PORT=${port})`);

    const child = spawn('node', [nextServerPath], {
      env: { ...process.env, PORT: String(port), NODE_ENV: 'production' },
      stdio: 'inherit',
    });

    child.on('error', (err) => {
      console.error('Failed to start child process:', err);
    });

    child.on('exit', (code, signal) => {
      if (signal) {
        console.error(`Server terminated with signal ${signal}`);
        process.exit(1);
      }
      if (code !== 0) {
        console.error(`Server exited with code ${code}`);
        // Let process manager (Render) retry by exiting non-zero
        process.exit(code || 1);
      }
      console.log('Server exited cleanly');
      process.exit(0);
    });

    // child started successfully - break the loop and keep running
    break;
  }
}

start().catch((err) => {
  console.error('Fatal error while starting server:', err);
  process.exit(1);
});
