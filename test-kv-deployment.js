#!/usr/bin/env node

/**
 * Cloudflare Pages KV Storage Deployment Test
 * Tests KV functionality on the deployed site
 */

const https = require("https");
const http = require("http");

class KVDeploymentTester {
  constructor() {
    this.baseUrl = "https://advancia-platform.workers.dev";
    this.testResults = [];
  }

  log(message, status = "INFO") {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${status}: ${message}`);
    this.testResults.push({ timestamp, status, message });
  }

  // Make HTTP request to test endpoint
  async makeRequest(action, data = {}) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ action, ...data });

      const url = new URL("/functions/test-kv", this.baseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
          "User-Agent": "KV-Test-Script/1.0",
        },
      };

      const req = https.request(options, (res) => {
        let body = "";

        res.on("data", (chunk) => {
          body += chunk;
        });

        res.on("end", () => {
          try {
            const response = JSON.parse(body);
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: response,
            });
          } catch (e) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body,
            });
          }
        });
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.write(postData);
      req.end();
    });
  }

  // Test write operation
  async testWrite() {
    this.log("Testing KV write operation...", "START");

    try {
      const testData = {
        userId: "deploy-test-user-123",
        balance: 2500,
        lastLogin: new Date().toISOString(),
        preferences: { theme: "light", notifications: true, language: "en" },
      };

      const response = await this.makeRequest("write", {
        key: "user:deploy-test-user-123",
        value: JSON.stringify(testData),
      });

      if (response.statusCode === 200 && response.body.success) {
        this.log("✅ Write operation successful", "SUCCESS");
        return true;
      } else {
        this.log(
          `❌ Write operation failed: ${
            response.body.error || "Unknown error"
          }`,
          "ERROR"
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ Write operation error: ${error.message}`, "ERROR");
      return false;
    }
  }

  // Test read operation
  async testRead() {
    this.log("Testing KV read operation...", "START");

    try {
      const response = await this.makeRequest("read", {
        key: "user:deploy-test-user-123",
      });

      if (
        response.statusCode === 200 &&
        response.body.success &&
        response.body.data
      ) {
        const data = JSON.parse(response.body.data);
        this.log(
          `✅ Read operation successful - User: ${data.userId}, Balance: ${data.balance}`,
          "SUCCESS"
        );
        return true;
      } else {
        this.log(
          `❌ Read operation failed: ${response.body.error || "No data found"}`,
          "ERROR"
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ Read operation error: ${error.message}`, "ERROR");
      return false;
    }
  }

  // Test list operation
  async testList() {
    this.log("Testing KV list operation...", "START");

    try {
      const response = await this.makeRequest("list", {
        prefix: "user:",
      });

      if (response.statusCode === 200 && response.body.success) {
        const keys = response.body.keys || [];
        this.log(
          `✅ List operation successful - Found ${keys.length} keys with prefix 'user:'`,
          "SUCCESS"
        );
        return true;
      } else {
        this.log(
          `❌ List operation failed: ${response.body.error || "Unknown error"}`,
          "ERROR"
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ List operation error: ${error.message}`, "ERROR");
      return false;
    }
  }

  // Test delete operation
  async testDelete() {
    this.log("Testing KV delete operation...", "START");

    try {
      const response = await this.makeRequest("delete", {
        key: "user:deploy-test-user-123",
      });

      if (response.statusCode === 200 && response.body.success) {
        this.log("✅ Delete operation successful", "SUCCESS");
        return true;
      } else {
        this.log(
          `❌ Delete operation failed: ${
            response.body.error || "Unknown error"
          }`,
          "ERROR"
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ Delete operation error: ${error.message}`, "ERROR");
      return false;
    }
  }

  // Test full suite
  async testFullSuite() {
    this.log("Testing KV full suite operation...", "START");

    try {
      const response = await this.makeRequest("full-suite");

      if (response.statusCode === 200 && response.body.success) {
        this.log("✅ Full suite operation successful", "SUCCESS");
        console.log("📊 Suite Results:", response.body.results);
        return true;
      } else {
        this.log(
          `❌ Full suite operation failed: ${
            response.body.error || "Unknown error"
          }`,
          "ERROR"
        );
        return false;
      }
    } catch (error) {
      this.log(`❌ Full suite operation error: ${error.message}`, "ERROR");
      return false;
    }
  }

  // Run all deployment tests
  async runDeploymentTests() {
    console.log("🚀 Starting Cloudflare Pages KV Deployment Testing\n");
    console.log(`🌐 Testing against: ${this.baseUrl}\n`);

    let passedTests = 0;
    let totalTests = 0;

    // Test write
    totalTests++;
    if (await this.testWrite()) passedTests++;

    // Test read
    totalTests++;
    if (await this.testRead()) passedTests++;

    // Test list
    totalTests++;
    if (await this.testList()) passedTests++;

    // Test delete
    totalTests++;
    if (await this.testDelete()) passedTests++;

    // Test full suite
    totalTests++;
    if (await this.testFullSuite()) passedTests++;

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("DEPLOYMENT TEST SUMMARY:");
    console.log("=".repeat(60));
    console.log(`✅ Passed tests: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed tests: ${totalTests - passedTests}/${totalTests}`);
    console.log(
      `📊 Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
    );

    if (passedTests === totalTests) {
      console.log("\n🎉 ALL DEPLOYMENT TESTS PASSED!");
      console.log("🎊 KV storage is working correctly on Cloudflare Pages!");
    } else {
      console.log("\n⚠️  Some deployment tests failed.");
      console.log("🔍 Check the errors above and verify:");
      console.log("   - KV namespace is properly bound");
      console.log("   - Pages Functions are deployed");
      console.log("   - Domain is accessible");
    }

    console.log("=".repeat(60));

    return { passedTests, totalTests, success: passedTests === totalTests };
  }
}

// Run the deployment tests
const tester = new KVDeploymentTester();
tester.runDeploymentTests().catch((error) => {
  console.error("💥 Test execution failed:", error.message);
  process.exit(1);
});
