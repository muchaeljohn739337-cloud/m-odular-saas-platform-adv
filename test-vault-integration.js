#!/usr/bin/env node
/**
 * Vault Integration Test Script
 * Tests the vault implementation end-to-end
 */

const http = require("http");

// Configuration
const BASE_URL = "http://localhost:4000";
let adminToken = "";
let mfaSecret = "";
let mfaToken = "";

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  log("\n═══════════════════════════════════════════════════", colors.cyan);
  log("🔐 VAULT INTEGRATION TEST SUITE", colors.cyan);
  log("═══════════════════════════════════════════════════\n", colors.cyan);

  try {
    // Test 1: Health Check
    log("1️⃣  Testing server health...", colors.yellow);
    const health = await makeRequest("GET", "/api/health");
    if (health.status === 200) {
      log("   ✅ Server is running", colors.green);
    } else {
      log("   ❌ Server health check failed", colors.red);
      return;
    }

    // Test 2: Admin Login (you'll need to provide credentials)
    log(
      "\n2️⃣  Admin login test (skipped - manual login required)",
      colors.yellow
    );
    log("   ℹ️  Please set adminToken variable in script", colors.cyan);
    log('   Example: adminToken = "your-jwt-token-here"', colors.cyan);

    // Test 3: MFA Setup
    if (adminToken) {
      log("\n3️⃣  Testing MFA setup...", colors.yellow);
      const mfaSetup = await makeRequest("POST", "/api/vault/mfa/setup", null, {
        Authorization: `Bearer ${adminToken}`,
      });

      if (mfaSetup.status === 200 && mfaSetup.data.success) {
        log("   ✅ MFA setup successful", colors.green);
        log(`   📱 Secret: ${mfaSetup.data.data.secret}`, colors.cyan);
        log(
          `   🔑 Backup codes: ${mfaSetup.data.data.backupCodes.join(", ")}`,
          colors.cyan
        );
        mfaSecret = mfaSetup.data.data.secret;
      } else {
        log("   ⚠️  MFA setup requires admin token", colors.yellow);
      }
    }

    // Test 4: Create Secret
    if (adminToken && mfaToken) {
      log("\n4️⃣  Testing secret creation...", colors.yellow);
      const createSecret = await makeRequest(
        "POST",
        "/api/vault/secrets",
        {
          key: "TEST_API_KEY",
          value: "sk_test_123456789",
          metadata: { description: "Test secret" },
          rotationPolicy: { enabled: true, intervalDays: 90 },
          mfaToken: mfaToken,
        },
        { Authorization: `Bearer ${adminToken}` }
      );

      if (createSecret.status === 200 && createSecret.data.success) {
        log("   ✅ Secret created successfully", colors.green);
      } else {
        log("   ⚠️  Secret creation requires MFA token", colors.yellow);
      }
    }

    // Test 5: List Secrets
    if (adminToken && mfaToken) {
      log("\n5️⃣  Testing secret listing...", colors.yellow);
      const listSecrets = await makeRequest(
        "GET",
        `/api/vault/secrets?mfaToken=${mfaToken}`,
        null,
        { Authorization: `Bearer ${adminToken}` }
      );

      if (listSecrets.status === 200 && listSecrets.data.success) {
        log(`   ✅ Found ${listSecrets.data.count} secret(s)`, colors.green);
      } else {
        log("   ⚠️  Secret listing requires MFA token", colors.yellow);
      }
    }

    // Test 6: Audit Logs
    if (adminToken && mfaToken) {
      log("\n6️⃣  Testing audit logs...", colors.yellow);
      const auditLogs = await makeRequest(
        "GET",
        `/api/vault/audit?mfaToken=${mfaToken}&limit=10`,
        null,
        { Authorization: `Bearer ${adminToken}` }
      );

      if (auditLogs.status === 200 && auditLogs.data.success) {
        log(
          `   ✅ Retrieved ${auditLogs.data.count} audit log(s)`,
          colors.green
        );
      } else {
        log("   ⚠️  Audit logs require MFA token", colors.yellow);
      }
    }

    log("\n═══════════════════════════════════════════════════", colors.cyan);
    log("📊 TEST SUMMARY", colors.cyan);
    log("═══════════════════════════════════════════════════\n", colors.cyan);

    log("✅ Server health check: PASSED", colors.green);
    log("⚠️  Full testing requires:", colors.yellow);
    log("   1. Admin login credentials", colors.cyan);
    log("   2. MFA token from authenticator app", colors.cyan);
    log("   3. Database tables created", colors.cyan);

    log("\n📖 Next Steps:", colors.yellow);
    log("   1. Login as admin to get JWT token", colors.cyan);
    log("   2. Setup MFA: POST /api/vault/mfa/setup", colors.cyan);
    log("   3. Scan QR code with Google Authenticator", colors.cyan);
    log("   4. Use 6-digit code to test vault operations", colors.cyan);
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

// Run tests
runTests();
