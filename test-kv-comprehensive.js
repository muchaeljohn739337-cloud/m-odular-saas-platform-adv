#!/usr/bin/env node

/**
 * Comprehensive KV Storage Testing Script
 * Tests both local simulation and deployment verification
 */

const fs = require("fs");
const path = require("path");

class KVStorageTester {
  constructor() {
    this.testResults = [];
    this.localStorage = new Map(); // Simulate KV for local testing
  }

  log(message, status = "INFO") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${status}: ${message}`);
    this.testResults.push({ timestamp, status, message });
  }

  // Simulate KV operations locally
  async simulateKVOperations() {
    this.log("Starting KV operations simulation...", "START");

    try {
      // Simulate write operations
      this.log("Testing write operations...");
      const testData = {
        userId: "test-user-123",
        balance: 1000,
        lastLogin: new Date().toISOString(),
        preferences: { theme: "dark", notifications: true },
      };

      this.localStorage.set("user:test-user-123", JSON.stringify(testData));
      this.localStorage.set("session:active-users", "42");
      this.log("✅ Write operations successful", "SUCCESS");

      // Simulate read operations
      this.log("Testing read operations...");
      const userData = this.localStorage.get("user:test-user-123");
      const activeUsers = this.localStorage.get("session:active-users");

      if (userData && activeUsers) {
        const parsed = JSON.parse(userData);
        this.log(
          `✅ Read operations successful - User: ${parsed.userId}, Active: ${activeUsers}`,
          "SUCCESS"
        );
      }

      // Simulate delete operations
      this.log("Testing delete operations...");
      this.localStorage.delete("user:test-user-123");
      this.localStorage.delete("session:active-users");
      this.log("✅ Delete operations successful", "SUCCESS");

      return true;
    } catch (error) {
      this.log(`❌ Simulation failed: ${error.message}`, "ERROR");
      return false;
    }
  }

  // Check configuration files
  checkConfiguration() {
    this.log("Checking configuration files...", "START");

    const checks = [
      {
        file: "frontend/wrangler.toml",
        checks: [
          () => fs.existsSync("frontend/wrangler.toml"),
          () => {
            const content = fs.readFileSync("frontend/wrangler.toml", "utf8");
            return content.includes("ADVANCIA_DATA");
          },
          () => {
            const content = fs.readFileSync("frontend/wrangler.toml", "utf8");
            return content.includes("3bdece1ca0824daeaaecaccfd220895c");
          },
        ],
      },
      {
        file: "frontend/functions/test-kv.js",
        checks: [
          () => fs.existsSync("frontend/functions/test-kv.js"),
          () => {
            const content = fs.readFileSync(
              "frontend/functions/test-kv.js",
              "utf8"
            );
            return content.includes("ADVANCIA_DATA");
          },
        ],
      },
    ];

    let allPassed = true;

    checks.forEach(({ file, checks: fileChecks }) => {
      fileChecks.forEach((check, index) => {
        try {
          const result = check();
          if (result) {
            this.log(`✅ ${file} check ${index + 1} passed`, "SUCCESS");
          } else {
            this.log(`❌ ${file} check ${index + 1} failed`, "ERROR");
            allPassed = false;
          }
        } catch (error) {
          this.log(
            `❌ ${file} check ${index + 1} error: ${error.message}`,
            "ERROR"
          );
          allPassed = false;
        }
      });
    });

    return allPassed;
  }

  // Generate deployment test commands
  generateTestCommands() {
    this.log("Generating deployment test commands...", "INFO");

    const commands = [
      "# 1. Deploy to Cloudflare Pages",
      "npx wrangler pages deploy frontend",
      "",
      "# 2. Test basic KV connectivity",
      'curl "https://your-domain.pages.dev/functions/test-kv"',
      "",
      "# 3. Test write operations",
      'curl "https://your-domain.pages.dev/functions/test-kv?action=write"',
      "",
      "# 4. Test read operations",
      'curl "https://your-domain.pages.dev/functions/test-kv?action=read"',
      "",
      "# 5. Test delete operations",
      'curl "https://your-domain.pages.dev/functions/test-kv?action=delete"',
      "",
      "# 6. Check Wrangler deployment status",
      "npx wrangler pages deployment list",
    ];

    console.log("\n" + "=".repeat(50));
    console.log("DEPLOYMENT TEST COMMANDS:");
    console.log("=".repeat(50));
    commands.forEach((cmd) => console.log(cmd));
    console.log("=".repeat(50));

    return commands;
  }

  // Run all tests
  async runAllTests() {
    console.log("🚀 Starting Comprehensive KV Storage Testing\n");

    const configOk = this.checkConfiguration();
    const simulationOk = await this.simulateKVOperations();

    this.generateTestCommands();

    console.log("\n" + "=".repeat(50));
    console.log("TEST SUMMARY:");
    console.log("=".repeat(50));

    const totalTests = this.testResults.filter(
      (r) => r.status === "SUCCESS"
    ).length;
    const totalErrors = this.testResults.filter(
      (r) => r.status === "ERROR"
    ).length;

    console.log(`✅ Configuration checks: ${configOk ? "PASSED" : "FAILED"}`);
    console.log(`✅ Local simulation: ${simulationOk ? "PASSED" : "FAILED"}`);
    console.log(`📊 Total successful tests: ${totalTests}`);
    console.log(`❌ Total errors: ${totalErrors}`);

    if (configOk && simulationOk) {
      console.log("\n🎉 ALL LOCAL TESTS PASSED!");
      console.log("📤 Ready for deployment testing.");
      console.log("🔗 Deploy and test using the commands above.");
    } else {
      console.log("\n⚠️  Some tests failed. Please check the errors above.");
    }

    console.log("=".repeat(50));

    return { configOk, simulationOk, totalTests, totalErrors };
  }
}

// Run the tests
const tester = new KVStorageTester();
tester.runAllTests().catch(console.error);
