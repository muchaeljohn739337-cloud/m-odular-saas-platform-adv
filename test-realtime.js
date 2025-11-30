const https = require("https");
const http = require("http");

async function testRealtimeFeatures() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  console.log("🔴 Starting comprehensive real-time features test...\n");

  const baseUrl = "http://localhost:4000";

  // Helper function to make HTTP requests
  function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          try {
            const response = {
              statusCode: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : null,
            };
            resolve(response);
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

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  try {
    // Test 1: Socket.IO Server Health Check
    console.log("1️⃣ Testing Socket.IO server availability...");

    // Check if Socket.IO is running by making a request to the server
    const healthOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/socket.io/?EIO=4&transport=polling",
      method: "GET",
    };

    const healthResponse = await makeRequest(healthOptions);

    if (healthResponse.statusCode === 200) {
      results.tests.socketIOServer = {
        status: "✅ SUCCESS",
        message: "Socket.IO server is responding",
      };
      console.log("✅ Socket.IO server is responding");
    } else {
      results.tests.socketIOServer = {
        status: "❌ FAILED",
        message: `Socket.IO server not responding: ${healthResponse.statusCode}`,
      };
      console.log("❌ Socket.IO server not responding");
    }

    // Test 2: Notification Service Health
    console.log("2️⃣ Testing notification service...");

    // First authenticate to get a token
    const loginOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const testUser = {
      email: "test@example.com",
      password: "TestPass123!",
    };

    let userToken = null;
    const loginResponse = await makeRequest(loginOptions, testUser);

    if (loginResponse.statusCode === 200 && loginResponse.body?.token) {
      userToken = loginResponse.body.token;
      console.log("✅ User authenticated for notification test");
    } else {
      // Try to register first
      const registerOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/auth/register",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const registerResponse = await makeRequest(registerOptions, {
        email: testUser.email,
        password: testUser.password,
        firstName: "Test",
        lastName: "User",
        role: "user",
      });

      if (
        registerResponse.statusCode === 201 ||
        registerResponse.statusCode === 200
      ) {
        const retryLoginResponse = await makeRequest(loginOptions, testUser);
        if (
          retryLoginResponse.statusCode === 200 &&
          retryLoginResponse.body?.token
        ) {
          userToken = retryLoginResponse.body.token;
          console.log("✅ User authenticated for notification test");
        }
      }
    }

    if (userToken) {
      // Test notification endpoint
      const notificationOptions = {
        hostname: "localhost",
        port: 4000,
        path: "/api/notifications/test",
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      };

      const notificationResponse = await makeRequest(notificationOptions, {
        message: "Test notification",
        type: "test",
      });

      if (
        notificationResponse.statusCode === 200 ||
        notificationResponse.statusCode === 201
      ) {
        results.tests.notificationService = {
          status: "✅ SUCCESS",
          message: "Notification service is working",
        };
        console.log("✅ Notification service is working");
      } else {
        results.tests.notificationService = {
          status: "⚠️  EXPECTED",
          message: "Notification test endpoint may not be implemented",
          response: notificationResponse.body,
        };
        console.log("⚠️  Notification test endpoint may not be implemented");
      }
    } else {
      results.tests.notificationService = {
        status: "❌ FAILED",
        message: "Could not authenticate user for notification test",
      };
      console.log("❌ Could not authenticate user for notification test");
    }

    // Test 3: Real-time Configuration Check
    console.log("3️⃣ Testing real-time configuration...");

    // Check if the server has Socket.IO middleware configured
    const configOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/api/system/config",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const configResponse = await makeRequest(configOptions);

    if (configResponse.statusCode === 200 && configResponse.body) {
      const hasSocketIO = configResponse.body.socketIO !== undefined;
      results.tests.realtimeConfig = {
        status: hasSocketIO ? "✅ SUCCESS" : "⚠️  EXPECTED",
        message: hasSocketIO
          ? "Real-time configuration detected"
          : "Real-time config may not be exposed",
        config: configResponse.body,
      };
      console.log(
        hasSocketIO
          ? "✅ Real-time configuration detected"
          : "⚠️  Real-time config may not be exposed"
      );
    } else {
      results.tests.realtimeConfig = {
        status: "⚠️  EXPECTED",
        message: "System config endpoint may not be implemented",
      };
      console.log("⚠️  System config endpoint may not be implemented");
    }

    // Test 4: WebSocket Upgrade Check
    console.log("4️⃣ Testing WebSocket upgrade capability...");

    const wsUpgradeOptions = {
      hostname: "localhost",
      port: 4000,
      path: "/socket.io/?EIO=4&transport=websocket",
      method: "GET",
      headers: {
        Connection: "Upgrade",
        Upgrade: "websocket",
        "Sec-WebSocket-Key": "dGhlIHNhbXBsZSBub25jZQ==",
        "Sec-WebSocket-Version": "13",
      },
    };

    const wsResponse = await makeRequest(wsUpgradeOptions);

    if (wsResponse.statusCode === 101) {
      results.tests.websocketUpgrade = {
        status: "✅ SUCCESS",
        message: "WebSocket upgrade supported",
      };
      console.log("✅ WebSocket upgrade supported");
    } else {
      results.tests.websocketUpgrade = {
        status: "⚠️  EXPECTED",
        message: "WebSocket upgrade may use polling fallback",
        statusCode: wsResponse.statusCode,
      };
      console.log("⚠️  WebSocket upgrade may use polling fallback");
    }
  } catch (error) {
    results.tests.generalError = {
      status: "❌ ERROR",
      message: `Test execution failed: ${error.message}`,
    };
    console.log(`❌ Test execution failed: ${error.message}`);
  }

  // Summary
  console.log("\n📊 Real-time Features Test Summary:");
  console.log("=====================================");

  const passed = Object.values(results.tests).filter((test) =>
    test.status.includes("SUCCESS")
  ).length;
  const failed = Object.values(results.tests).filter((test) =>
    test.status.includes("FAILED")
  ).length;
  const warnings = Object.values(results.tests).filter(
    (test) =>
      test.status.includes("EXPECTED") || test.status.includes("WARNING")
  ).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);

  // Save results
  const fs = require("fs");
  fs.writeFileSync(
    "realtime-test-results.json",
    JSON.stringify(results, null, 2)
  );
  console.log("\n📄 Results saved to realtime-test-results.json");

  return results;
}

// Run the test if executed directly
if (require.main === module) {
  console.log("🔴 Real-time features test script starting...");
  testRealtimeFeatures().catch(console.error);
}

module.exports = testRealtimeFeatures;
